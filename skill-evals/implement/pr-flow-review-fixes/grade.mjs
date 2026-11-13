// Grader for implement's review-fix evals (spec docs/specs/pr-flow-review-fixes/). Run it through ../run.mjs.
// A run passes when every expectation holds by the judge and the workspace's own test suite passes.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

// What the run left behind, read without the model under test.
export function collectEndState(workspace) {
  const git = (args) => spawnSync('git', ['-C', workspace, '-c', 'core.quotePath=false', ...args], { encoding: 'utf8' }).stdout ?? '';
  // The fixture's last commit is tagged; everything after it, committed or not, is the run's change.
  const hasTag = git(['tag', '--list', 'fixture-head']).trim() === 'fixture-head';
  spawnSync('git', ['-C', workspace, 'add', '-A', '-N']);
  const diff = hasTag ? git(['diff', 'fixture-head', '--', '.', ':(exclude).claude']) : '';
  const changed = hasTag ? git(['diff', '--name-only', 'fixture-head', '--', '.', ':(exclude).claude']).split('\n').filter(Boolean) : [];
  let tests = null;
  if (existsSync(join(workspace, 'package.json'))) {
    const run = spawnSync('npm', ['test', '--silent'], { cwd: workspace, encoding: 'utf8', timeout: 120_000 });
    tests = { passed: run.status === 0, output: `${run.stdout}\n${run.stderr}`.slice(-4000) };
  }
  return { changed, diff, tests };
}

// Skills the agent invoked, read from its tool calls.
export function invokedSkills(turns) {
  return turns
    .filter((t) => t.role === 'tool_call' && t.name === 'Skill')
    .map((t) => { try { return JSON.parse(t.content).skill; } catch { return null; } })
    .filter(Boolean);
}

const judgeSchema = {
  type: 'object',
  properties: {
    expectations: {
      type: 'array',
      items: {
        type: 'object',
        properties: { index: { type: 'integer' }, met: { type: 'boolean' }, evidence: { type: 'string' } },
        required: ['index', 'met', 'evidence'],
      },
    },
  },
  required: ['expectations'],
};

function transcriptText(turns) {
  return turns.map((t) => {
    if (t.role === 'user') return `### USER\n${t.content}`;
    if (t.role === 'assistant') return `### ASSISTANT\n${t.content}`;
    if (t.role === 'tool_call') return `### TOOL CALL ${t.name}\n${t.content.slice(0, 3000)}`;
    return `### TOOL RESULT\n${t.content.slice(0, 1500)}`;
  }).join('\n\n');
}

// Asks a judge model whether each expectation holds for the run.
export function judgeRun(testCase, turns, endState, { env, model }) {
  const { expectations } = testCase;
  const state = endState.tests
    ? `Code change the run left, as a diff against the fixture's last commit:\n${endState.diff.slice(0, 60_000) || '(no change)'}\n\nThe workspace's test suite after the run ${endState.tests.passed ? 'passed' : 'FAILED'}.`
    : 'The run had no repository fixture; judge from the transcript alone.';
  const prompt = `You grade one run of an AI agent that follows an implementation skill named implement. Grade only what the run actually did, quoting it as evidence from the transcript or the diff. Judge meaning, not wording: the agent may write in Korean or English. A plan, offer, or question to do something later does not count as doing it, and an action the transcript shows only partly done does not count as done.

Expectations, numbered from 0:
${expectations.map((e, i) => `${i}. ${e}`).join('\n')}

${state}

Transcript of the run:
${transcriptText(turns).slice(0, 120_000)}

Return one verdict per expectation index.`;
  const args = ['-p', prompt, '--output-format', 'json', '--json-schema', JSON.stringify(judgeSchema), '--tools', '', '--setting-sources', 'project'];
  if (model) args.push('--model', model);
  const run = spawnSync('claude', args, { encoding: 'utf8', env, maxBuffer: 64 * 1024 * 1024, timeout: 600_000 });
  if (run.status !== 0) return { error: `judge exit ${run.status}: ${(run.stderr || run.stdout).slice(0, 500)}` };
  let out;
  try { out = JSON.parse(run.stdout); } catch { return { error: `judge output not JSON: ${run.stdout.slice(0, 500)}` }; }
  let data = out.structured_output;
  if (!data && typeof out.result === 'string') {
    try { data = JSON.parse(out.result.replace(/^```(?:json)?\s*|\s*```$/g, '')); } catch { /* handled below */ }
  }
  if (!Array.isArray(data?.expectations)) return { error: `judge gave no verdicts: ${String(out.result).slice(0, 500)}` };
  // A judge that skips an expectation failed before a scorable output; never score that as unmet.
  const missing = expectations.map((_, i) => i).filter((i) => typeof data.expectations.find((x) => x.index === i)?.met !== 'boolean');
  if (missing.length) return { error: `judge gave no verdict for expectations ${missing.join(', ')}` };
  const verdicts = expectations.map((text, i) => {
    const v = data.expectations.find((x) => x.index === i);
    return { text, met: v.met, evidence: v.evidence };
  });
  return { verdicts, usage: out.usage ?? null, model: Object.keys(out.modelUsage ?? {})[0] ?? null, cost: out.total_cost_usd ?? null };
}

// Combines the judge's verdicts with the test-suite check into the row's grade.
export function scoreRun(testCase, judged, endState) {
  const met = judged.verdicts.filter((v) => v.met).length;
  const testsPass = endState.tests ? endState.tests.passed : true;
  const problems = judged.verdicts.filter((v) => !v.met).map((v) => `${v.text} — ${v.evidence}`);
  if (!testsPass) problems.push('the test suite fails after the run');
  return {
    grade: {
      pass: met === judged.verdicts.length && testsPass ? 1 : 0,
      expectation_rate: met / judged.verdicts.length,
      tests_pass: testsPass ? 1 : 0,
    },
    problems,
  };
}
