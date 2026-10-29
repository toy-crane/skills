#!/usr/bin/env node
// Scores a run-tdd-comparison.sh results root: node score.mjs <results-root> [--grade]
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const compareRoot = dirname(fileURLToPath(import.meta.url));
const tasks = {
  feature: { module: 'src/shipping.js', brief: 'docs/spec.md', criterionPattern: /^(C\d+):/ },
  bug: { module: 'src/cart.js', brief: 'docs/bug.md', criterionPattern: /^(B\d+):/ },
};

const [resultsRoot, ...flags] = process.argv.slice(2);
if (!resultsRoot) {
  console.error('usage: score.mjs <results-root> [--grade]');
  process.exit(2);
}
const grade = flags.includes('--grade');

// Runs node:test with the TAP reporter and returns its leaf tests.
function runTests(dir, files = []) {
  const result = spawnSync('node', ['--test', '--test-reporter=tap', ...files], {
    cwd: dir,
    encoding: 'utf8',
    timeout: 120_000,
  });
  return parseTap(`${result.stdout}\n${result.stderr}`);
}

function parseTap(text) {
  const lines = text.split('\n');
  const tests = [];
  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(/^\s*(ok|not ok) \d+ - (.*?)(?: # .*)?$/);
    if (!match) continue;
    const block = [];
    for (let j = i + 1; j < lines.length && !/^\s*(ok|not ok) \d+ - /.test(lines[j]); j += 1) {
      block.push(lines[j]);
      if (/^\s*\.\.\.\s*$/.test(lines[j])) break;
    }
    const yaml = block.join('\n');
    if (!/type: 'test'/.test(yaml)) continue;
    tests.push({
      name: match[2],
      ok: match[1] === 'ok',
      assertion: /name: 'AssertionError'|code: 'ERR_ASSERTION'/.test(yaml),
    });
  }
  return tests;
}

function withModule(workspace, task, implementation, extra = () => {}) {
  const dir = mkdtempSync(join(tmpdir(), 'tdd-score-'));
  cpSync(workspace, dir, {
    recursive: true,
    filter: (p) => !/(^|\/)(node_modules|\.git|\.claude)(\/|$)/.test(relative(workspace, p)),
  });
  if (implementation) cpSync(implementation, join(dir, tasks[task].module));
  extra(dir);
  return dir;
}

function scoreWorkspace(workspace, task, originalNames) {
  const hidden = join(compareRoot, task, 'hidden');
  const finalDir = withModule(workspace, task, null);
  const final = runTests(finalDir);
  rmSync(finalDir, { recursive: true, force: true });
  const newTests = final.filter((t) => !originalNames.has(t.name));
  const passingOnFinal = new Set(final.filter((t) => t.ok).map((t) => t.name));

  const stubDir = withModule(workspace, task, join(hidden, 'stub.js'));
  const onStub = new Map(runTests(stubDir).map((t) => [t.name, t]));
  rmSync(stubDir, { recursive: true, force: true });
  const fakeRed = [];
  let reproductions = 0;
  for (const test of newTests) {
    const seen = onStub.get(test.name);
    if (seen && !seen.ok && seen.assertion) {
      reproductions += 1;
      continue;
    }
    // In the bug task a new test may pass on the unfixed code: it guards existing behavior.
    if (task === 'bug' && seen?.ok) continue;
    fakeRed.push({ name: test.name, onStub: seen ? (seen.ok ? 'passed' : 'non-assertion failure') : 'did not run' });
  }

  const mutantsDir = join(hidden, 'mutants');
  const mutants = readdirSync(mutantsDir).map((file) => {
    const dir = withModule(workspace, task, join(mutantsDir, file));
    // Only tests that pass on the agent's own code can catch a mutant.
    const caught = runTests(dir).some((t) => !t.ok && passingOnFinal.has(t.name));
    rmSync(dir, { recursive: true, force: true });
    return { mutant: basename(file, '.js'), caught };
  });

  const probeDir = withModule(workspace, task, null, (dir) => {
    mkdirSync(join(dir, 'probe'), { recursive: true });
    cpSync(join(hidden, 'criteria.test.js'), join(dir, 'probe', 'criteria.test.js'));
  });
  const criteria = {};
  for (const test of runTests(probeDir, ['probe/criteria.test.js'])) {
    const id = test.name.match(tasks[task].criterionPattern)?.[1];
    if (id) criteria[id] = (criteria[id] ?? true) && test.ok;
  }
  rmSync(probeDir, { recursive: true, force: true });

  return {
    finalTests: final.length,
    finalFailing: final.filter((t) => !t.ok).map((t) => t.name),
    newTests: newTests.map((t) => t.name),
    fakeRed,
    reproductions,
    mutants,
    criteria,
  };
}

const isTestFile = (path) => /(^|\/)(test|tests|__tests__)\/|\.test\.[cm]?[jt]s$/.test(path);

// Reads the final result event from the agent's stream for cost and model.
function readTrace(tracePath) {
  let model = null;
  let final = null;
  for (const line of readFileSync(tracePath, 'utf8').split('\n')) {
    let event;
    try {
      event = JSON.parse(line);
    } catch {
      continue;
    }
    if (event.type === 'system' && event.subtype === 'init') model = event.model;
    if (event.type === 'result') final = event;
  }
  return {
    model,
    turns: final?.num_turns ?? null,
    costUsd: final?.total_cost_usd ?? null,
    usage: final?.usage ?? null,
    resultSubtype: final?.subtype ?? 'missing',
  };
}

// Reads the hook log: each test run's full TAP result and each edit, in order.
function scoreSteps(stepsPath, task, newTests, originalNames) {
  const steps = [];
  const text = existsSync(stepsPath) ? readFileSync(stepsPath, 'utf8') : '';
  for (const chunk of text.split(/^=== /m).filter(Boolean)) {
    const [header, ...body] = chunk.split('\n');
    if (header === 'test-run') steps.push({ kind: 'run', tests: parseTap(body.join('\n')) });
    else if (header.startsWith('edit ')) steps.push({ kind: 'edit', file: header.slice(5) });
  }
  const runs = steps.filter((s) => s.kind === 'run');
  const firstRun = steps.findIndex((s) => s.kind === 'run');
  const seenFailing = newTests.filter((name) => runs.some((run) => run.tests.some((t) => t.name === name && !t.ok && t.assertion)));
  const sourceEdit = steps.findIndex((s) => s.kind === 'edit' && s.file.endsWith(tasks[task].module));
  const runsBeforeFix = steps.slice(0, sourceEdit === -1 ? steps.length : sourceEdit).filter((s) => s.kind === 'run');
  return {
    testRuns: runs.length,
    testEditsAfterFirstRun: firstRun === -1 ? 0
      : steps.slice(firstRun).filter((s) => s.kind === 'edit' && isTestFile(s.file)).length,
    newTestsSeenFailingOnAssertion: seenFailing.length,
    newTestsNeverSeenFailing: newTests.filter((name) => !seenFailing.includes(name)),
    failedOnAssertionBeforeSourceEdit: runsBeforeFix.some((run) => run.tests.some((t) => !t.ok && t.assertion && !originalNames.has(t.name))),
  };
}

// A grader that sees no skill name labels what each new test protects.
function gradeTests(workspace, task, newTests) {
  if (newTests.length === 0) return { reasonless: 0, labels: [] };
  const testFiles = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (['node_modules', '.git', '.claude'].includes(entry.name)) continue;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (isTestFile(path.slice(workspace.length + 1))) testFiles.push(path);
    }
  };
  walk(workspace);
  const brief = readFileSync(join(workspace, tasks[task].brief), 'utf8');
  const sources = testFiles.map((f) => `--- ${f.slice(workspace.length + 1)}\n${readFileSync(f, 'utf8')}`).join('\n');
  const prompt = [
    'You grade tests written for the brief below. For each listed test name, say what it protects:',
    'a numbered acceptance criterion ("criterion N"), "bug" for reproducing the reported bug,',
    '"risk" for a real risk in logic the brief does not spell out, "existing" for existing behavior the change touches,',
    'or "none" when it protects nothing the brief or the code needs.',
    'Reply with only a JSON array of {"test": name, "label": label}.',
    `\nBrief:\n${brief}`,
    `\nTest files:\n${sources}`,
    `\nTests to label:\n${newTests.map((n) => `- ${n}`).join('\n')}`,
  ].join('\n');
  const cwd = mkdtempSync(join(tmpdir(), 'tdd-grade-'));
  const args = ['-p', prompt, '--output-format', 'json', '--setting-sources', 'project', '--tools', '', '--max-turns', '1'];
  if (process.env.TASK_CLAUDE_MODEL) args.push('--model', process.env.TASK_CLAUDE_MODEL);
  const result = spawnSync('claude', args, { cwd, encoding: 'utf8', timeout: 300_000 });
  rmSync(cwd, { recursive: true, force: true });
  try {
    const text = JSON.parse(result.stdout).result;
    const labels = JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));
    return { reasonless: labels.filter((l) => l.label === 'none').length, labels };
  } catch {
    return { reasonless: null, labels: [], error: (result.stderr || result.stdout || '').slice(0, 400) };
  }
}

const originalNames = {
  feature: new Set(),
  bug: new Set(runTests(join(compareRoot, 'bug', 'workspace')).map((t) => t.name)),
};

const runs = [];
for (const arm of readdirSync(resultsRoot).filter((d) => existsSync(join(resultsRoot, d, 'feature')) || existsSync(join(resultsRoot, d, 'bug')))) {
  for (const task of Object.keys(tasks)) {
    const taskDir = join(resultsRoot, arm, task);
    if (!existsSync(taskDir)) continue;
    for (const run of readdirSync(taskDir).sort()) {
      const runDir = join(taskDir, run);
      const workspace = join(runDir, 'workspace');
      if (!existsSync(workspace)) continue;
      const scored = scoreWorkspace(workspace, task, originalNames[task]);
      const trace = { ...readTrace(join(runDir, 'trace.jsonl')), ...scoreSteps(join(runDir, 'steps.log'), task, scored.newTests, originalNames[task]) };
      const graded = grade ? gradeTests(workspace, task, scored.newTests) : null;
      const record = { arm, task, run, ...scored, trace, graded };
      writeFileSync(join(runDir, 'score.json'), `${JSON.stringify(record, null, 2)}\n`);
      runs.push(record);
    }
  }
}

const valid = runs.filter((r) => r.trace.resultSubtype === 'success');
const arms = [...new Set(runs.map((r) => r.arm))].sort();
const tokens = (usage) => (usage ? (usage.input_tokens ?? 0) + (usage.output_tokens ?? 0)
  + (usage.cache_read_input_tokens ?? 0) + (usage.cache_creation_input_tokens ?? 0) : 0);
const summary = {};
for (const arm of arms) {
  const mine = valid.filter((r) => r.arm === arm);
  const criteriaMet = {};
  for (const task of Object.keys(tasks)) {
    const taskRuns = mine.filter((r) => r.task === task);
    const ids = [...new Set(taskRuns.flatMap((r) => Object.keys(r.criteria)))].sort();
    for (const id of ids) criteriaMet[`${task}:${id}`] = taskRuns.filter((r) => r.criteria[id]).length;
  }
  summary[arm] = {
    validRuns: mine.length,
    invalidRuns: runs.filter((r) => r.arm === arm).length - mine.length,
    criteriaMet,
    newTests: mine.reduce((n, r) => n + r.newTests.length, 0),
    fakeRed: mine.reduce((n, r) => n + r.fakeRed.length, 0),
    mutantsCaught: mine.reduce((n, r) => n + r.mutants.filter((m) => m.caught).length, 0),
    mutantsTotal: mine.reduce((n, r) => n + r.mutants.length, 0),
    testEditsAfterFirstRun: mine.reduce((n, r) => n + r.trace.testEditsAfterFirstRun, 0),
    newTestsNeverSeenFailing: mine.reduce((n, r) => n + r.trace.newTestsNeverSeenFailing.length, 0),
    bugRunsFailingBeforeFix: mine.filter((r) => r.task === 'bug' && r.trace.failedOnAssertionBeforeSourceEdit).length,
    bugRuns: mine.filter((r) => r.task === 'bug').length,
    bugRunsWithReproduction: mine.filter((r) => r.task === 'bug' && r.reproductions > 0).length,
    runsWithFailingFinalSuite: mine.filter((r) => r.finalFailing.length > 0).length,
    reasonless: grade && mine.every((r) => r.graded?.reasonless != null)
      ? mine.reduce((n, r) => n + r.graded.reasonless, 0) : null,
    gradingErrors: grade ? mine.filter((r) => r.graded?.reasonless == null).length : null,
    tokens: mine.reduce((n, r) => n + tokens(r.trace.usage), 0),
    costUsd: Number(mine.reduce((n, r) => n + (r.trace.costUsd ?? 0), 0).toFixed(2)),
    turns: mine.reduce((n, r) => n + (r.trace.turns ?? 0), 0),
    models: [...new Set(mine.map((r) => r.trace.model))],
  };
}

let gates = null;
if (summary.baseline && summary.revised) {
  const base = summary.baseline;
  const next = summary.revised;
  const majority = (count, total) => count * 3 >= total * 2;
  const perTaskRuns = (arm, key) => valid.filter((r) => r.arm === arm && r.task === key.split(':')[0]).length;
  const criteriaKept = Object.keys(base.criteriaMet).filter((key) => majority(base.criteriaMet[key], perTaskRuns('baseline', key)))
    .every((key) => majority(next.criteriaMet[key] ?? 0, perTaskRuns('revised', key)));
  // Totals compare only when both arms scored the same nonzero runs per task.
  const comparableRuns = Object.keys(tasks).every((task) => {
    const count = (arm) => valid.filter((r) => r.arm === arm && r.task === task).length;
    return count('baseline') > 0 && count('baseline') === count('revised');
  });
  gates = {
    comparableRuns,
    criteriaKept,
    finalSuitesPass: next.runsWithFailingFinalSuite === 0,
    fakeRedNotWorse: next.fakeRed <= base.fakeRed,
    mutantsNotWorse: next.mutantsCaught >= base.mutantsCaught,
    everyNewTestSeenFailing: next.newTestsNeverSeenFailing === 0,
    bugReproducedBeforeFix: next.bugRunsFailingBeforeFix === next.bugRuns,
  };
  gates.pass = Object.values(gates).every(Boolean);
}

const report = { summary, gates };
writeFileSync(join(resultsRoot, 'summary.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
