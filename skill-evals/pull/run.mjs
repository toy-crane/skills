#!/usr/bin/env node
// Runner for pull's evals in the llm-evals layout. This folder is the skill's eval root.
// Each case builds a fixed situation in temporary Git repositories (origin.git standing in
// for GitHub, work/ the agent's checkout) and grades the end state plus a judge's verdicts
// on its expectations. --suite skill-regression-pull runs the regression suite graduated
// from docs/specs/skill-regression-pull/; its baseline is an agent with no skill installed.
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  appendFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { finishRun, loadHistory, planTiers, recordRow, saveHistory } from '../audit-evals/history.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');
const skillDir = realpathSync(join(repoRoot, '.claude/skills/pull'));
const skillPath = relative(repoRoot, join(skillDir, 'SKILL.md'));
const usage = `usage: run.mjs --variant <label> --access api|subscription [options]
  --no-skill              install no skill: the baseline of a suite for an unchanged skill
  --skill-ref <git-ref>   take pull's SKILL.md from this ref
  --skill-file <path>     take SKILL.md from this file (default: the working tree's)
  --suite <name>          a suite under regression/ or a capability eval folder here (default: skill-regression-pull)
  --split train|test|all  which split of a capability eval to run (default: all)
  --cases a,b             run only these case ids
  --reps <n>              runs per case (default: 2; a regression suite runs at its recorded reps)
  --workers <n>           runs in parallel (default: 4)
  --model <id>            agent model (default: claude-sonnet-5-5)
  --judge-model <id>      judge model (default: claude-opus-5-5)
  --flow <dir>            results folder (default: .claude/hillclimb/pull/<suite>)
  --timeout-s <n>         wall-clock ceiling per run (default: 600)
  --max-budget-usd <n>    per-run budget passed to claude (default: 2)
  --dry-run               print the resolved scope and stop`;

const { values: opts } = parseArgs({
  options: {
    variant: { type: 'string' },
    access: { type: 'string' },
    'no-skill': { type: 'boolean', default: false },
    'skill-ref': { type: 'string' },
    'skill-file': { type: 'string' },
    suite: { type: 'string', default: 'skill-regression-pull' },
    split: { type: 'string', default: 'all' },
    cases: { type: 'string' },
    reps: { type: 'string' },
    workers: { type: 'string', default: '4' },
    model: { type: 'string', default: 'claude-sonnet-5-5' },
    'judge-model': { type: 'string', default: 'claude-opus-5-5' },
    flow: { type: 'string' },
    'timeout-s': { type: 'string', default: '600' },
    'max-budget-usd': { type: 'string', default: '2' },
    'dry-run': { type: 'boolean', default: false },
    help: { type: 'boolean', default: false },
  },
});

function fail(message) {
  console.error(`${message}\n\n${usage}`);
  process.exit(2);
}
if (opts.help) { console.log(usage); process.exit(0); }
if (!/^[\w.-]+$/.test(opts.variant ?? '')) fail('--variant needs a label such as baseline, v1, or 2026-11-14');
if (!['api', 'subscription'].includes(opts.access)) fail('--access must be api or subscription');
if (opts['no-skill'] && (opts['skill-ref'] || opts['skill-file'])) fail('--no-skill takes no skill text');
if (opts.variant === 'baseline' && !opts['no-skill'] && !opts['skill-ref'] && !opts['skill-file']) fail('baseline needs --no-skill, --skill-ref, or --skill-file');
if (opts.model === opts['judge-model']) fail('the judge must be a different model from the agent under test');

const suiteDir = [join(here, opts.suite), join(here, 'regression', opts.suite)].find((d) => existsSync(join(d, 'cases.jsonl')));
if (!suiteDir) fail(`unknown suite: ${opts.suite}`);
const allCases = readFileSync(join(suiteDir, 'cases.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
let cases = opts.split === 'all' ? allCases : allCases.filter((c) => c.split === opts.split);
if (opts.cases) {
  const wanted = opts.cases.split(',').map((c) => c.trim());
  for (const id of wanted) if (!cases.some((c) => c.id === id)) fail(`unknown case in ${opts.suite}: ${id}`);
  cases = cases.filter((c) => wanted.includes(c.id));
}
// A regression run reads its tiers from the cell history and adds each row it scores to it:
// the upper tier always runs, the lower tier only when the model differs from its last run.
let history = null;
let tiers = null;
const historyPath = join(here, 'regression', 'cell-history.json');
const regressionSuite = suiteDir === join(here, 'regression', opts.suite);
if (regressionSuite && opts['no-skill']) fail('a regression run measures the skill; --no-skill belongs to a capability eval');
if (regressionSuite) {
  history = loadHistory(historyPath);
  tiers = planTiers(history, opts.suite, opts.model);
  cases = cases.filter((c) => tiers.runsCase(c.id));
  const own = history.suites[opts.suite].reps;
  if (opts.reps !== undefined && Number(opts.reps) !== own) fail(`${opts.suite} runs at ${own} reps, as recorded in its cell history; drop --reps or pass ${own}`);
}
const reps = history ? history.suites[opts.suite].reps : Number(opts.reps ?? 2);
// Only the working tree's pull text writes the history; another text, such as one from --skill-ref,
// runs the same tiers but its rows would read as the suite's own.
const recording = history && !opts['skill-ref'] && !opts['skill-file'];
const workers = Number(opts.workers);
const timeoutMs = Number(opts['timeout-s']) * 1000;
const { builders, scenarios } = await import(join(suiteDir, 'fixtures.mjs'));
const { collectEndState, judgeRun, scoreRun } = await import(join(suiteDir, 'grade.mjs'));

// The pull text under test, or none.
let skillText = null;
let skillSource;
if (opts['no-skill']) {
  skillSource = 'no skill installed';
} else if (opts['skill-ref']) {
  const shown = spawnSync('git', ['-C', repoRoot, 'show', `${opts['skill-ref']}:${skillPath}`], { encoding: 'utf8' });
  if (shown.status !== 0) fail(`cannot read pull SKILL.md at ${opts['skill-ref']}: ${shown.stderr.trim()}`);
  skillText = shown.stdout;
  const sha = spawnSync('git', ['-C', repoRoot, 'rev-parse', '--short', opts['skill-ref']], { encoding: 'utf8' }).stdout.trim();
  skillSource = `git ${opts['skill-ref']} (${sha})`;
} else {
  const file = resolve(opts['skill-file'] ?? join(repoRoot, skillPath));
  skillText = readFileSync(file, 'utf8');
  skillSource = `file ${file}`;
}
const skillSha = skillText === null ? 'none' : createHash('sha256').update(skillText).digest('hex').slice(0, 12);

// Model access: the key goes to the child for api, and is cleared for a subscription.
// A worktree has no .env.local of its own, so the main checkout's is read next.
const baseEnv = { ...process.env };
delete baseEnv.GH_TOKEN;
delete baseEnv.GITHUB_TOKEN;
if (opts.access === 'api') {
  const common = spawnSync('git', ['-C', repoRoot, 'rev-parse', '--path-format=absolute', '--git-common-dir'], { encoding: 'utf8' }).stdout.trim();
  for (const dir of [repoRoot, common ? dirname(common) : null].filter(Boolean)) {
    if (baseEnv.ANTHROPIC_API_KEY || !existsSync(join(dir, '.env.local'))) continue;
    const m = readFileSync(join(dir, '.env.local'), 'utf8').match(/^\s*ANTHROPIC_API_KEY\s*=\s*['"]?([^'"\n]+)/m);
    if (m) baseEnv.ANTHROPIC_API_KEY = m[1];
  }
  if (!baseEnv.ANTHROPIC_API_KEY) { console.error('API access needs ANTHROPIC_API_KEY in the environment or .env.local.'); process.exit(3); }
} else {
  delete baseEnv.ANTHROPIC_API_KEY;
  delete baseEnv.ANTHROPIC_AUTH_TOKEN;
}

const flowDir = resolve(opts.flow ?? join(repoRoot, '.claude/hillclimb/pull', opts.suite));
const variantDir = join(flowDir, opts.variant);
const resultsFile = join(variantDir, 'results.jsonl');
const errorsFile = join(variantDir, 'errors.jsonl');
const readRows = (file) => (existsSync(file) ? readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []);

const stateFile = join(flowDir, '_state.json');
if (existsSync(stateFile)) {
  const state = JSON.parse(readFileSync(stateFile, 'utf8'));
  if (state.access !== opts.access) { console.error(`this flow runs on ${state.access}; use the same access or another --flow.`); process.exit(2); }
  if (state.model !== opts.model) { console.error(`this flow runs on model ${state.model}; use the same --model or another --flow.`); process.exit(2); }
  if (state.judge_model !== opts['judge-model']) { console.error(`this flow is judged by ${state.judge_model}; use the same --judge-model or another --flow.`); process.exit(2); }
}
const summaryFile = join(variantDir, 'summary.json');
if (existsSync(summaryFile)) {
  const previous = JSON.parse(readFileSync(summaryFile, 'utf8'));
  if (previous.skill_sha !== skillSha) { console.error(`${opts.variant} already holds runs of skill sha ${previous.skill_sha}; this run is ${skillSha}. Use a new variant.`); process.exit(2); }
}
const done = new Set(readRows(resultsFile).map((r) => `${r.prompt_id}#${r.rep}`));
const todo = [];
for (let rep = 0; rep < reps; rep += 1) for (const c of cases) if (!done.has(`${c.id}#${rep}`)) todo.push({ c, rep });

console.log(`variant ${opts.variant}: pull SKILL.md from ${skillSource} (sha ${skillSha})`);
if (tiers) console.log(`regression tiers: upper${tiers.lowerRuns ? ' and lower (model differs from the lower tier\'s last)' : ' only'}; history ${recording ? historyPath : 'not written (pull text is not the working tree\'s)'}`);
console.log(`access ${opts.access}, model ${opts.model}, judge ${opts['judge-model']}; suite ${opts.suite} (${opts.split}): ${cases.length} cases × ${reps} reps; ${done.size} done, ${todo.length} to run`);
function report() {
  const wanted = new Set(cases.map((c) => c.id));
  const rows = readRows(resultsFile).filter((r) => wanted.has(r.prompt_id));
  if (!rows.length) return;
  const sum = (metric) => rows.reduce((n, r) => n + (r.grade[metric] ?? 0), 0);
  const checks = rows.reduce((n, r) => n + Object.keys(r.grade).filter((k) => k.startsWith('expectation-') || k === 'end-state').length, 0);
  const checksMet = rows.reduce((n, r) => n + Object.entries(r.grade).filter(([k, v]) => (k.startsWith('expectation-') || k === 'end-state') && v === 1).length, 0);
  const byCase = new Map();
  for (const r of rows) byCase.set(r.prompt_id, [...(byCase.get(r.prompt_id) ?? []), r.grade.pass]);
  const unstable = [...byCase].filter(([, p]) => !p.every(Boolean)).map(([id, p]) => `${id}(${p.join('')})`);
  const cost = rows.reduce((n, r) => n + (r.meta?.cost_usd ?? 0) + (r.meta?.judge_cost_usd ?? 0), 0);
  console.log(`score: checks ${checksMet}/${checks} = ${(100 * checksMet / checks).toFixed(1)}% (±${(100 / Math.sqrt(checks)).toFixed(0)} points); `
    + `rows passing every check ${sum('pass')}/${rows.length}; cases passing every rep ${byCase.size - unstable.length}/${byCase.size}; errors ${readRows(errorsFile).length}, cost $${cost.toFixed(2)}`);
  if (unstable.length) console.log(`not every rep: ${unstable.join(' ')}`);
}
if (opts['dry-run'] || todo.length === 0) { report(); process.exit(0); }

mkdirSync(join(variantDir, 'traces'), { recursive: true });
if (!existsSync(summaryFile)) {
  writeFileSync(summaryFile, `${JSON.stringify({ description: `pull from ${skillSource}`, target: 'skill', skill_source: skillSource, skill_sha: skillSha, access: opts.access }, null, 2)}\n`);
}
if (!existsSync(stateFile)) {
  writeFileSync(stateFile, `${JSON.stringify({
    goal: 'docs/specs/skill-regression-pull/ criterion 1: held-out (case × rep × check) rows at 90% or more, above the no-skill baseline outside the noise floor',
    suite: opts.suite,
    train: allCases.filter((c) => c.split === 'train').map((c) => c.id),
    test: allCases.filter((c) => c.split === 'test').map((c) => c.id),
    access: opts.access, model: opts.model, judge_model: opts['judge-model'],
    metrics: [
      { id: 'checks_met', kind: 'float', label: 'Share of checks (expectations and end state) that hold' },
      { id: 'pass', kind: 'float', label: 'Row passes every check' },
      { id: 'end_state_ok', kind: 'float', label: 'End-state checks hold' },
    ],
    perf_fields: [{ id: 'turns', label: 'Turns' }, { id: 'latency_s', label: 'Latency', unit: 's' }],
  }, null, 2)}\n`);
}

function prepareWorkspace(c, id) {
  // Outside any .claude/ folder: headless Claude Code denies writes under one.
  const ws = realpathSync(mkdtempSync(join(tmpdir(), `pull-${opts.variant}-${id}-`)));
  const scenario = scenarios[c.scenario];
  const setup = builders[scenario.builder](ws, scenario);
  const work = join(ws, 'work');
  if (skillText !== null) {
    const target = join(work, '.claude/skills/pull');
    cpSync(skillDir, target, { recursive: true, filter: (src) => !/^\/agents(\/|$)/.test(src.slice(skillDir.length)) });
    writeFileSync(join(target, 'SKILL.md'), skillText);
  }
  // The agent's Git reads no user or system config, so a global pull.rebase or alias cannot decide for it.
  writeFileSync(join(ws, 'gitconfig'), '');
  return { ws, work, setup, check: scenario.check };
}

function readStream(raw) {
  const info = { model: null, apiKeySource: null, resultSubtype: null, costUsd: null, usage: null, turns: null, permissionDenials: [], skillInvoked: false };
  for (const line of raw.split('\n')) {
    let event;
    try { event = JSON.parse(line); } catch { continue; }
    if (event.type === 'system' && event.subtype === 'init') { info.model = event.model; info.apiKeySource = event.apiKeySource; }
    if (event.type === 'assistant') {
      for (const p of event.message?.content ?? []) if (p.type === 'tool_use' && p.name === 'Skill' && /^pull\b/.test(p.input?.skill ?? '')) info.skillInvoked = true;
    }
    if (event.type === 'result') {
      info.resultSubtype = event.subtype; info.isError = event.is_error === true; info.apiErrorStatus = event.api_error_status ?? null; info.resultText = typeof event.result === 'string' ? event.result : ''; info.costUsd = event.total_cost_usd ?? null; info.usage = event.usage ?? null;
      info.turns = event.num_turns ?? null; info.permissionDenials = event.permission_denials ?? [];
    }
  }
  return info;
}

function runClaude({ ws, work }, prompt, rawFile) {
  const args = ['-p', prompt, '--setting-sources', 'project', '--output-format', 'stream-json', '--verbose',
    '--max-budget-usd', opts['max-budget-usd'], '--permission-mode', 'acceptEdits', '--model', opts.model,
    '--allowedTools', 'Read', 'Edit', 'Write', 'Glob', 'Grep', 'Skill',
    'Bash(git:*)', 'Bash(node:*)', 'Bash(npm:*)', 'Bash(ls:*)', 'Bash(cat:*)', 'Bash(find:*)', 'Bash(grep:*)',
    'Bash(sed:*)', 'Bash(head:*)', 'Bash(tail:*)', 'Bash(diff:*)', 'Bash(wc:*)', 'Bash(jq:*)', 'Bash(pwd)', 'Bash(echo:*)',
    // Agents continue a rebase with an editor override and step into folders; a denial there is the harness, not the behavior.
    'Bash(cd:*)', 'Bash(GIT_EDITOR=true git:*)', 'Bash(GIT_EDITOR=: git:*)', 'Bash(GIT_SEQUENCE_EDITOR=true git:*)'];
  const env = { ...baseEnv, GIT_CONFIG_GLOBAL: join(ws, 'gitconfig'), GIT_CONFIG_NOSYSTEM: '1', GIT_EDITOR: 'true' };
  return new Promise((settle) => {
    const child = spawn('claude', args, { cwd: work, env, stdio: ['ignore', 'pipe', 'pipe'] });
    const out = [];
    const err = [];
    child.stdout.on('data', (chunk) => out.push(chunk));
    child.stderr.on('data', (chunk) => err.push(chunk));
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; child.kill('SIGTERM'); setTimeout(() => child.kill('SIGKILL'), 10_000).unref(); }, timeoutMs);
    child.on('close', () => {
      clearTimeout(timer);
      const raw = Buffer.concat(out).toString('utf8');
      writeFileSync(rawFile, raw);
      settle({ timedOut, info: readStream(raw), stderr: Buffer.concat(err).toString('utf8') });
    });
  });
}

function toTurns(rawFile, prompt) {
  const turns = [{ role: 'user', content: prompt }];
  for (const line of readFileSync(rawFile, 'utf8').split('\n')) {
    let e;
    try { e = JSON.parse(line); } catch { continue; }
    if (e.type === 'assistant') {
      for (const p of e.message?.content ?? []) {
        if (p.type === 'text') turns.push({ role: 'assistant', content: p.text });
        if (p.type === 'tool_use') turns.push({ role: 'tool_call', name: p.name, content: JSON.stringify(p.input, null, 2).slice(0, 20_000) });
      }
    } else if (e.type === 'user') {
      for (const p of e.message?.content ?? []) {
        if (p.type === 'tool_result') {
          const text = typeof p.content === 'string' ? p.content : (p.content ?? []).map((x) => x.text ?? '').join('\n');
          turns.push({ role: 'tool_result', content: text.slice(0, 20_000) });
        }
      }
    }
  }
  return turns;
}

async function runCase({ c, rep }) {
  const id = `${c.id}_rep${rep}`;
  const runDir = join(variantDir, 'runs', id);
  rmSync(runDir, { recursive: true, force: true });
  mkdirSync(runDir, { recursive: true });
  const place = prepareWorkspace(c, id);
  writeFileSync(join(runDir, 'workspace.txt'), `${place.ws}\n`);
  const started = Date.now();
  const errorRow = (cls, detail, info) => appendFileSync(errorsFile, `${JSON.stringify({
    prompt_id: c.id, rep, class: cls, detail, workspace: place.ws, model: info?.model ?? null, usage: info?.usage ?? null, at: new Date().toISOString(),
  })}\n`);

  const rawFile = join(runDir, 'turn1.jsonl');
  const t = await runClaude(place, c.prompt, rawFile);
  if (t.timedOut) return errorRow('timeout', 'turn 1', t.info);
  if (t.info.resultSubtype !== 'success') return errorRow('harness', `result ${t.info.resultSubtype}: ${t.stderr.slice(0, 300)}`, t.info);
  // Claude Code ends a turn stopped by an API error, such as a usage limit, with subtype success and is_error;
  // the error subtypes, such as error_max_budget_usd, set is_error too and stay harness errors above.
  // That trial never finished answering, so it is not a result: keep it out of grading for a rerun to fill.
  if (t.info.isError) return errorRow('api-error', `status ${t.info.apiErrorStatus}: ${t.info.resultText.slice(0, 300)}`, t.info);
  if (!t.info.model?.startsWith(opts.model)) return errorRow('served-model-mismatch', `asked ${opts.model}, served ${t.info.model}`, t.info);
  const expectedKey = opts.access === 'api' ? 'ANTHROPIC_API_KEY' : 'none';
  if (t.info.apiKeySource !== expectedKey) return errorRow('access-mismatch', `key source ${t.info.apiKeySource}`, t.info);
  const deniedWrites = t.info.permissionDenials.filter((d) => /^(Write|Edit|MultiEdit)$/.test(d.tool_name));
  if (deniedWrites.length) return errorRow('harness', `file writes denied: ${deniedWrites.map((d) => d.tool_input?.file_path).join(', ')}`, t.info);
  const latency = (Date.now() - started) / 1000;

  const turns = toTurns(rawFile, c.prompt);
  writeFileSync(join(variantDir, 'traces', `${id}.json`), `${JSON.stringify(turns, null, 2)}\n`);
  const endState = collectEndState(place.ws, place.check, place.setup);
  const judged = await judgeRun(c, turns, endState, { env: baseEnv, model: opts['judge-model'] });
  if (judged.error) return errorRow('judge', judged.error, t.info);
  const { grade, problems } = scoreRun(judged, endState);
  appendFileSync(resultsFile, `${JSON.stringify({
    prompt_id: c.id, rep, prompt: c.prompt, tags: c.tags, split: c.split ?? null, grade, status: 'ok', stop_reason: t.info.resultSubtype,
    model: t.info.model, usage: t.info.usage, turns: t.info.turns, latency_s: latency,
    meta: {
      cost_usd: t.info.costUsd, skill_invoked: t.info.skillInvoked, facts: endState.facts, verdicts: judged.verdicts, problems,
      judge_model: judged.model, judge_usage: judged.usage, judge_cost_usd: judged.cost,
      denied: t.info.permissionDenials.map((d) => `${d.tool_name} ${JSON.stringify(d.tool_input).slice(0, 200)}`),
    },
  })}\n`);
  // Only a row scored now reaches the history; rows already in results.jsonl were counted when scored.
  if (recording) {
    recordRow(history, opts.suite, { prompt_id: c.id, grade }, { lowerRuns: tiers.lowerRuns });
    saveHistory(historyPath, history);
  }
  console.log(`${id}: checks ${grade.checks_met.toFixed(2)} pass ${grade.pass} skill=${t.info.skillInvoked} ${latency.toFixed(0)}s $${(t.info.costUsd ?? 0).toFixed(2)}`);
}

let next = 0;
await Promise.all(Array.from({ length: Math.min(workers, todo.length) }, async () => {
  while (next < todo.length) {
    const item = todo[next];
    next += 1;
    try {
      await runCase(item);
    } catch (error) {
      appendFileSync(errorsFile, `${JSON.stringify({ prompt_id: item.c.id, rep: item.rep, class: 'harness', detail: String(error?.stack ?? error).slice(0, 2000), at: new Date().toISOString() })}\n`);
      console.error(`${item.c.id}_rep${item.rep}: harness error, see errors.jsonl`);
    }
  }
}));
console.log(`results: ${resultsFile}`);
if (recording) {
  const scored = new Set(readRows(resultsFile).map((r) => `${r.prompt_id}#${r.rep}`));
  const complete = finishRun(history, opts.suite, { model: opts.model, lowerRuns: tiers.lowerRuns, scored });
  if (complete) saveHistory(historyPath, history);
  console.log(complete ? `cell history: run complete on ${opts.model}, models recorded`
    : 'cell history: run incomplete, models left as they were; rerun the same variant to finish it');
}
report();
