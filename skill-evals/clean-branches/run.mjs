#!/usr/bin/env node
// Runner for clean-branches' evals in the llm-evals layout. This folder is the skill's eval root.
// --suite skill-regression-clean-branches runs the suite from docs/specs/skill-regression-clean-branches/:
// each case builds a fixed situation in a temporary workspace (origin.git standing in for GitHub,
// a stand-in gh CLI, simulated session and dev-server processes) and grades the end state the
// agent leaves plus a judge's verdicts on its expectations. Everything an agent may delete lives
// in that workspace under the OS temporary folder; no case touches this repository's worktrees.
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
const skillDir = realpathSync(join(repoRoot, '.claude/skills/clean-branches'));
const skillPath = relative(repoRoot, join(skillDir, 'SKILL.md'));
const usage = `usage: run.mjs --variant <label> --access api|subscription [options]
  --no-skill              run without clean-branches installed (the baseline of an unchanged skill)
  --skill-ref <git-ref>   take clean-branches' SKILL.md from this ref
  --skill-file <path>     take SKILL.md from this file (default: the working tree's)
  --suite <name>          a suite under regression/ or a capability eval folder here (default: skill-regression-clean-branches)
  --split train|test|all  which split of a capability eval to run (default: all)
  --cases a,b             run only these case ids
  --reps <n>              runs per case (default: 2; a regression suite runs at its recorded reps)
  --workers <n>           runs in parallel (default: 4)
  --model <id>            agent model (default: claude-sonnet-5-5)
  --judge-model <id>      judge model (default: claude-opus-5-5)
  --flow <dir>            results folder (default: .claude/hillclimb/clean-branches/<suite>)
  --timeout-s <n>         wall-clock ceiling per run (default: 900)
  --max-budget-usd <n>    per-run budget passed to claude (default: 3)
  --dry-run               print the resolved scope and stop`;

const { values: opts } = parseArgs({
  options: {
    variant: { type: 'string' },
    access: { type: 'string' },
    'no-skill': { type: 'boolean', default: false },
    'skill-ref': { type: 'string' },
    'skill-file': { type: 'string' },
    suite: { type: 'string', default: 'skill-regression-clean-branches' },
    split: { type: 'string', default: 'all' },
    cases: { type: 'string' },
    reps: { type: 'string' },
    workers: { type: 'string', default: '4' },
    model: { type: 'string', default: 'claude-sonnet-5-5' },
    'judge-model': { type: 'string', default: 'claude-opus-5-5' },
    flow: { type: 'string' },
    'timeout-s': { type: 'string', default: '900' },
    'max-budget-usd': { type: 'string', default: '3' },
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
if (opts.variant === 'baseline' && !opts['no-skill'] && !opts['skill-ref'] && !opts['skill-file']) fail('baseline needs --no-skill, --skill-ref, or --skill-file');
if (opts['no-skill'] && (opts['skill-ref'] || opts['skill-file'])) fail('--no-skill takes no skill text');
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
if (suiteDir === join(here, 'regression', opts.suite)) {
  history = loadHistory(historyPath);
  tiers = planTiers(history, opts.suite, opts.model);
  cases = cases.filter((c) => tiers.runsCase(c.id));
  const own = history.suites[opts.suite].reps;
  if (opts.reps !== undefined && Number(opts.reps) !== own) fail(`${opts.suite} runs at ${own} reps, as recorded in its cell history; drop --reps or pass ${own}`);
}
const reps = history ? history.suites[opts.suite].reps : Number(opts.reps ?? 2);
const workers = Number(opts.workers);
const timeoutMs = Number(opts['timeout-s']) * 1000;
const { scenarios, fillPrompt } = await import(join(suiteDir, 'scenarios.mjs'));
const { stopProcesses } = await import(join(suiteDir, 'fixtures.mjs'));
const { collectEndState, judgeRun, scoreRun } = await import(join(suiteDir, 'grade.mjs'));

// The clean-branches text under test, or none.
let skillText = null;
let skillSource = 'no skill';
if (opts['skill-ref']) {
  const shown = spawnSync('git', ['-C', repoRoot, 'show', `${opts['skill-ref']}:${skillPath}`], { encoding: 'utf8' });
  if (shown.status !== 0) fail(`cannot read clean-branches SKILL.md at ${opts['skill-ref']}: ${shown.stderr.trim()}`);
  skillText = shown.stdout;
  const sha = spawnSync('git', ['-C', repoRoot, 'rev-parse', '--short', opts['skill-ref']], { encoding: 'utf8' }).stdout.trim();
  skillSource = `git ${opts['skill-ref']} (${sha})`;
} else if (!opts['no-skill']) {
  const file = resolve(opts['skill-file'] ?? join(repoRoot, skillPath));
  skillText = readFileSync(file, 'utf8');
  skillSource = `file ${file}`;
}
const skillSha = skillText === null ? 'none' : createHash('sha256').update(skillText).digest('hex').slice(0, 12);

// Model access: the key goes to the child for api, and is cleared for a subscription. A worktree
// has no .env.local of its own, so the default checkout's is read too.
const baseEnv = { ...process.env };
delete baseEnv.GH_TOKEN;
delete baseEnv.GITHUB_TOKEN;
if (opts.access === 'api') {
  const commonDir = spawnSync('git', ['-C', repoRoot, 'rev-parse', '--path-format=absolute', '--git-common-dir'], { encoding: 'utf8' }).stdout.trim();
  for (const envFile of [join(repoRoot, '.env.local'), join(dirname(commonDir), '.env.local')]) {
    if (baseEnv.ANTHROPIC_API_KEY || !existsSync(envFile)) continue;
    const m = readFileSync(envFile, 'utf8').match(/^\s*ANTHROPIC_API_KEY\s*=\s*['"]?([^'"\n]+)/m);
    if (m) baseEnv.ANTHROPIC_API_KEY = m[1];
  }
  if (!baseEnv.ANTHROPIC_API_KEY) { console.error('API access needs ANTHROPIC_API_KEY in the environment or .env.local.'); process.exit(3); }
} else {
  delete baseEnv.ANTHROPIC_API_KEY;
  delete baseEnv.ANTHROPIC_AUTH_TOKEN;
}

const flowDir = resolve(opts.flow ?? join(repoRoot, '.claude/hillclimb/clean-branches', opts.suite));
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

console.log(`variant ${opts.variant}: clean-branches SKILL.md from ${skillSource} (sha ${skillSha})`);
if (tiers) console.log(`regression tiers: upper${tiers.lowerRuns ? ' and lower (model differs from the lower tier\'s last)' : ' only'}; history ${historyPath}`);
console.log(`access ${opts.access}, model ${opts.model}, judge ${opts['judge-model']}; suite ${opts.suite} (${opts.split}): ${cases.length} cases × ${reps} reps; ${done.size} done, ${todo.length} to run`);
function report() {
  const wanted = new Set(cases.map((c) => c.id));
  const rows = readRows(resultsFile).filter((r) => wanted.has(r.prompt_id));
  if (!rows.length) return;
  // The headline is the share of (case × rep × check) rows that pass: each judged expectation and the end state.
  const checks = rows.flatMap((r) => Object.entries(r.grade).filter(([k]) => k === 'end-state' || k.startsWith('expectation-')).map(([, v]) => v));
  const passedChecks = checks.filter((v) => v >= 1).length;
  const byCase = new Map();
  for (const r of rows) byCase.set(r.prompt_id, [...(byCase.get(r.prompt_id) ?? []), r.grade.pass]);
  const unstable = [...byCase].filter(([, p]) => !p.every(Boolean)).map(([id, p]) => `${id}(${p.join('')})`);
  const cost = rows.reduce((n, r) => n + (r.meta?.cost_usd ?? 0) + (r.meta?.judge_cost_usd ?? 0), 0);
  console.log(`score: checks ${passedChecks}/${checks.length} (${(100 * passedChecks / checks.length).toFixed(0)}%, ±${(100 / Math.sqrt(checks.length)).toFixed(0)} points), `
    + `rows passing every check ${rows.filter((r) => r.grade.pass).length}/${rows.length}, cases passing every rep ${byCase.size - unstable.length}/${byCase.size}, `
    + `errors ${readRows(errorsFile).length}, cost $${cost.toFixed(2)}`);
  if (unstable.length) console.log(`not every rep: ${unstable.join(' ')}`);
}
if (opts['dry-run'] || todo.length === 0) { report(); process.exit(0); }

mkdirSync(join(variantDir, 'traces'), { recursive: true });
if (!existsSync(summaryFile)) {
  writeFileSync(summaryFile, `${JSON.stringify({ description: `clean-branches from ${skillSource}`, target: 'skill', skill_source: skillSource, skill_sha: skillSha, access: opts.access }, null, 2)}\n`);
}
if (!existsSync(stateFile)) {
  writeFileSync(stateFile, `${JSON.stringify({
    goal: 'docs/specs/skill-regression-clean-branches/ criterion 1: held-out (case × rep × check) rows pass at 90% or more, above the no-skill baseline outside the noise floor',
    suite: opts.suite,
    train: allCases.filter((c) => c.split === 'train').map((c) => c.id),
    test: allCases.filter((c) => c.split === 'test').map((c) => c.id),
    access: opts.access, model: opts.model, judge_model: opts['judge-model'],
    metrics: [
      { id: 'checks', kind: 'float', label: 'Share of (case × rep × check) rows that pass' },
      { id: 'pass', kind: 'float', label: 'Row passes every check' },
      { id: 'end_state_ok', kind: 'float', label: 'End-state checks hold' },
    ],
    perf_fields: [{ id: 'turns', label: 'Turns' }, { id: 'latency_s', label: 'Latency', unit: 's' }],
  }, null, 2)}\n`);
}

function prepareWorkspace(c, id) {
  // Outside any .claude/ folder: headless Claude Code denies writes under one.
  const ws = realpathSync(mkdtempSync(join(tmpdir(), `clean-branches-${opts.variant}-${id}-`)));
  let built;
  try {
    built = scenarios[c.scenario](ws);
  } catch (error) {
    // A build that fails after starting a simulated process must not leave it running.
    stopProcesses(ws);
    throw error;
  }
  const cwd = join(ws, built.cwd);
  if (skillText !== null) {
    const target = join(cwd, '.claude/skills/clean-branches');
    cpSync(skillDir, target, { recursive: true, filter: (src) => !/^\/agents(\/|$)/.test(src.slice(skillDir.length)) });
    writeFileSync(join(target, 'SKILL.md'), skillText);
  }
  // An empty gh config keeps the real GitHub CLI unauthenticated if it is ever reached.
  mkdirSync(join(ws, 'gh-config'), { recursive: true });
  return { ws, cwd, check: built.check, prompt: fillPrompt(c.prompt, built.vars) };
}

function readStream(raw) {
  const info = { model: null, apiKeySource: null, resultSubtype: null, costUsd: null, usage: null, turns: null, permissionDenials: [] };
  for (const line of raw.split('\n')) {
    let event;
    try { event = JSON.parse(line); } catch { continue; }
    if (event.type === 'system' && event.subtype === 'init') { info.model = event.model; info.apiKeySource = event.apiKeySource; }
    if (event.type === 'result') {
      info.resultSubtype = event.subtype; info.isError = event.is_error === true; info.apiErrorStatus = event.api_error_status ?? null; info.resultText = typeof event.result === 'string' ? event.result : ''; info.costUsd = event.total_cost_usd ?? null; info.usage = event.usage ?? null;
      info.turns = event.num_turns ?? null; info.permissionDenials = event.permission_denials ?? [];
    }
  }
  return info;
}

// Every Bash command is allowed, because a cleanup sweep runs loops, redirections, and the helper
// by any path, and a per-command allowlist denied those, grading the harness rather than the
// agent (approved 2026-11-14). Signals stay denied: no case may stop a process except through the
// project's declared commands. The agent works in the temporary workspace.
function runClaude({ ws, cwd }, prompt, rawFile) {
  const args = ['-p', prompt, '--setting-sources', 'project', '--output-format', 'stream-json', '--verbose',
    '--max-budget-usd', opts['max-budget-usd'], '--permission-mode', 'acceptEdits', '--model', opts.model,
    '--allowedTools', 'Read', 'Glob', 'Grep', 'Skill', 'Bash',
    '--disallowedTools', 'Bash(kill:*)', 'Bash(pkill:*)', 'Bash(killall:*)'];
  const env = {
    ...baseEnv, PATH: `${join(ws, 'bin')}:${baseEnv.PATH}`, GH_FAKE_DIR: join(ws, 'gh'), GH_CONFIG_DIR: join(ws, 'gh-config'), GH_PROMPT_DISABLED: '1',
    CODEX_HOME: join(ws, 'codex'), GIT_CEILING_DIRECTORIES: dirname(ws), npm_config_update_notifier: 'false',
  };
  return new Promise((settle) => {
    const child = spawn('claude', args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
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
  try {
    writeFileSync(join(runDir, 'workspace.txt'), `${place.ws}\n`);
    const started = Date.now();
    const errorRow = (cls, detail, info) => appendFileSync(errorsFile, `${JSON.stringify({
      prompt_id: c.id, rep, class: cls, detail, workspace: place.ws, model: info?.model ?? null, usage: info?.usage ?? null, at: new Date().toISOString(),
    })}\n`);

    const rawFile = join(runDir, 'turn1.jsonl');
    const t = await runClaude(place, place.prompt, rawFile);
    if (t.timedOut) return errorRow('timeout', 'turn 1', t.info);
    if (t.info.resultSubtype !== 'success') return errorRow('harness', `result ${t.info.resultSubtype}: ${t.stderr.slice(0, 300)}`, t.info);
    // Claude Code ends a turn stopped by an API error, such as a usage limit, with subtype success and is_error;
    // that trial never finished answering, so it is not a result: keep it out of grading for a rerun to fill.
    if (t.info.isError) return errorRow('api-error', `status ${t.info.apiErrorStatus}: ${t.info.resultText.slice(0, 300)}`, t.info);
    if (!t.info.model?.startsWith(opts.model)) return errorRow('served-model-mismatch', `asked ${opts.model}, served ${t.info.model}`, t.info);
    const expectedKey = opts.access === 'api' ? 'ANTHROPIC_API_KEY' : 'none';
    if (t.info.apiKeySource !== expectedKey) return errorRow('access-mismatch', `key source ${t.info.apiKeySource}`, t.info);
    const deniedWrites = t.info.permissionDenials.filter((d) => /^(Write|Edit|MultiEdit)$/.test(d.tool_name));
    if (deniedWrites.length) return errorRow('harness', `file writes denied: ${deniedWrites.map((d) => d.tool_input?.file_path).join(', ')}`, t.info);
    const latency = (Date.now() - started) / 1000;

    const turns = toTurns(rawFile, place.prompt);
    writeFileSync(join(variantDir, 'traces', `${id}.json`), `${JSON.stringify(turns, null, 2)}\n`);
    const endState = collectEndState(place.ws, place.check);
    stopProcesses(place.ws);
    const denied = t.info.permissionDenials.map((d) => `${d.tool_name} ${JSON.stringify(d.tool_input).slice(0, 200)}`);
    const judged = judgeRun(c, turns, endState, { env: baseEnv, model: opts['judge-model'], denied });
    if (judged.error) return errorRow('judge', judged.error, t.info);
    const { grade, problems } = scoreRun(judged, endState);
    appendFileSync(resultsFile, `${JSON.stringify({
      prompt_id: c.id, rep, prompt: place.prompt, tags: c.tags, split: c.split ?? null, grade, status: 'ok', stop_reason: t.info.resultSubtype,
      model: t.info.model, usage: t.info.usage, turns: t.info.turns, latency_s: latency,
      meta: {
        cost_usd: t.info.costUsd, facts: endState.facts, cleanup: endState.cleanup, gh_calls: endState.calls, verdicts: judged.verdicts, problems,
        judge_model: judged.model, judge_usage: judged.usage, judge_cost_usd: judged.cost, denied,
      },
    })}\n`);
    // Only a row scored now reaches the history; rows already in results.jsonl were counted when scored.
    if (history) {
      recordRow(history, opts.suite, { prompt_id: c.id, grade }, { lowerRuns: tiers.lowerRuns });
      saveHistory(historyPath, history);
    }
    console.log(`${id}: ${JSON.stringify(grade)} ${latency.toFixed(0)}s $${(t.info.costUsd ?? 0).toFixed(2)}`);
  } finally {
    stopProcesses(place.ws);
  }
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
if (history) {
  const scored = new Set(readRows(resultsFile).map((r) => `${r.prompt_id}#${r.rep}`));
  const complete = finishRun(history, opts.suite, { model: opts.model, lowerRuns: tiers.lowerRuns, scored });
  if (complete) saveHistory(historyPath, history);
  console.log(complete ? `cell history: run complete on ${opts.model}, models recorded`
    : 'cell history: run incomplete, models left as they were; rerun the same variant to finish it');
}
report();
