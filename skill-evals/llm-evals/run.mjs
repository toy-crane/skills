#!/usr/bin/env node
// Runner for llm-evals' evals.json in the llm-evals layout. This folder is the skill's eval root.
// Each case runs `claude -p` in a disposable git workspace outside any .claude/ folder, with
// llm-evals installed and the case's fixture copied in, and a judge model rules on each expectation
// from the transcript and the files the run changed. The baseline is the previous SKILL.md text:
//   node run.mjs --variant baseline --skill-ref <commit before the change> --access subscription
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  appendFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { collectChanges, judgeRun, scoreJudged } from './judge.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');
const SKILL = 'llm-evals';
// Each published skill is linked from .claude/skills/<name> to skills/<group>/<name>.
const skillDir = (name) => realpathSync(join(repoRoot, '.claude/skills', name));
const usage = `usage: run.mjs --variant <label> --access api|subscription [options]
  --skill-ref <git-ref>   take ${SKILL}'s folder from this ref
  --skill-file <path>     take SKILL.md from this file (default: the working tree's folder)
  --cases a,b             run only these case ids
  --reps <n>              runs per case (default: 2)
  --workers <n>           runs in parallel (default: 4)
  --model <id>            agent model (default: claude-opus-5-5)
  --judge-model <id>      judge model (default: claude-sonnet-5-5)
  --flow <dir>            flow folder (default: .claude/hillclimb/${SKILL}/evals)
  --timeout-s <n>         wall-clock ceiling per run (default: 900)
  --max-budget-usd <n>    per-run budget passed to claude (default: 3)
  --dry-run               print the resolved scope and stop`;

const { values: opts } = parseArgs({
  options: {
    variant: { type: 'string' },
    access: { type: 'string' },
    'skill-ref': { type: 'string' },
    'skill-file': { type: 'string' },
    cases: { type: 'string' },
    reps: { type: 'string', default: '2' },
    workers: { type: 'string', default: '4' },
    model: { type: 'string', default: 'claude-opus-5-5' },
    'judge-model': { type: 'string', default: 'claude-sonnet-5-5' },
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
if (!/^[\w.-]+$/.test(opts.variant ?? '')) fail('--variant needs a label such as baseline or v1');
if (!['api', 'subscription'].includes(opts.access)) fail('--access must be api or subscription');
opts.suite = 'evals';
if (opts.model === opts['judge-model']) fail('the judge must be a different model from the agent under test');

const fixtureRoot = join(here, 'fixtures');
let cases = JSON.parse(readFileSync(join(here, 'evals.json'), 'utf8')).evals.map((e) => ({
  // Cases 1-20 predate spec eval-suite-audit; their share of met expectations must not drop below baseline.
  id: `evals-${e.id}`, tags: [e.id <= 20 ? 'existing' : 'new'], prompt: e.prompt, expectations: e.expectations, fixture: e.fixture ?? null, skills: [SKILL],
}));
if (opts.cases) {
  const wanted = opts.cases.split(',').map((c) => c.trim());
  for (const id of wanted) if (!cases.some((c) => c.id === id)) fail(`unknown case in evals.json: ${id}`);
  cases = cases.filter((c) => wanted.includes(c.id));
}
const reps = Number(opts.reps);
const workers = Number(opts.workers);
const timeoutMs = Number(opts['timeout-s']) * 1000;

// The llm-evals folder under test: a git ref, a SKILL.md file, or the working tree.
let skillSource;
let skillFolder;
if (opts['skill-ref']) {
  const root = mkdtempSync(join(tmpdir(), `${SKILL}-ref-`));
  const path = relative(repoRoot, skillDir(SKILL));
  const archive = spawnSync('sh', ['-c', `git -C "${repoRoot}" archive "${opts['skill-ref']}" "${path}" | tar -x -C "${root}"`], { encoding: 'utf8' });
  if (archive.status !== 0) fail(`cannot read ${path} at ${opts['skill-ref']}: ${archive.stderr.trim()}`);
  skillFolder = join(root, path);
  skillSource = `git ${opts['skill-ref']}`;
} else {
  skillFolder = skillDir(SKILL);
  skillSource = opts['skill-file'] ? `file ${resolve(opts['skill-file'])}` : 'working tree';
}
const skillText = readFileSync(opts['skill-file'] ? resolve(opts['skill-file']) : join(skillFolder, 'SKILL.md'), 'utf8');
const skillSha = createHash('sha256').update(skillText).digest('hex').slice(0, 12);

// Model access: the key goes to the child for api, and is cleared for a subscription.
const childEnv = { ...process.env };
if (opts.access === 'api') {
  if (!childEnv.ANTHROPIC_API_KEY && existsSync(join(repoRoot, '.env.local'))) {
    const m = readFileSync(join(repoRoot, '.env.local'), 'utf8').match(/^\s*ANTHROPIC_API_KEY\s*=\s*['"]?([^'"\n]+)/m);
    if (m) childEnv.ANTHROPIC_API_KEY = m[1];
  }
  if (!childEnv.ANTHROPIC_API_KEY) { console.error('API access needs ANTHROPIC_API_KEY in the environment or .env.local.'); process.exit(3); }
} else {
  delete childEnv.ANTHROPIC_API_KEY;
  delete childEnv.ANTHROPIC_AUTH_TOKEN;
}

const flowDir = resolve(opts.flow ?? join(repoRoot, '.claude/hillclimb', SKILL, opts.suite));
const setDir = join(flowDir, opts.variant);
const resultsFile = join(setDir, 'results.jsonl');
const errorsFile = join(setDir, 'errors.jsonl');
const readRows = (file) => (existsSync(file) ? readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []);

// One flow keeps one access and one model so its variants compare.
const stateFile = join(flowDir, '_state.json');
if (existsSync(stateFile)) {
  const state = JSON.parse(readFileSync(stateFile, 'utf8'));
  if (state.access !== opts.access) { console.error(`this flow runs on ${state.access}; use the same access or another --flow.`); process.exit(2); }
  if (state.model !== opts.model) { console.error(`this flow runs on model ${state.model}; use the same --model or another --flow.`); process.exit(2); }
}
// A variant keeps one skill text, so a finished variant never passes off old scores as an edited skill's.
const summaryFile = join(setDir, 'summary.json');
if (existsSync(summaryFile)) {
  const previous = JSON.parse(readFileSync(summaryFile, 'utf8'));
  if (previous.skill_sha !== skillSha) { console.error(`${opts.variant} already holds runs of skill sha ${previous.skill_sha}; this run is ${skillSha}. Use a new variant.`); process.exit(2); }
}
const done = new Set(readRows(resultsFile).map((r) => `${r.prompt_id}#${r.rep}`));
const todo = [];
for (let rep = 0; rep < reps; rep += 1) for (const c of cases) if (!done.has(`${c.id}#${rep}`)) todo.push({ c, rep });

console.log(`variant ${opts.variant}: ${SKILL} from ${skillSource} (sha ${skillSha})`);
console.log(`access ${opts.access}, model ${opts.model}, judge ${opts['judge-model']}; evals.json: ${cases.length} cases × ${reps} reps; ${done.size} done, ${todo.length} to run`);
const priced = readRows(resultsFile).filter((r) => typeof r.meta?.cost_usd === 'number');
if (priced.length) {
  const mean = priced.reduce((n, r) => n + r.meta.cost_usd + (r.meta.judge_cost_usd ?? 0), 0) / priced.length;
  console.log(`estimate from ${priced.length} finished runs: ~$${(mean * todo.length).toFixed(2)} ${opts.access === 'api' ? 'billed' : 'API equivalent, drawn from the subscription'}`);
}
function report() {
  const rows = readRows(resultsFile);
  if (!rows.length) return;
  for (const split of [...new Set(rows.map((r) => r.tags[0]))]) {
    const part = rows.filter((r) => r.tags[0] === split);
    const byCase = new Map();
    for (const r of part) byCase.set(r.prompt_id, [...(byCase.get(r.prompt_id) ?? []), r.grade.pass]);
    const steady = [...byCase.values()].filter((p) => p.length === reps && p.every(Boolean)).length;
    const pass = part.reduce((n, r) => n + r.grade.pass, 0);
    const share = part.reduce((n, r) => n + r.grade.expectations_met, 0) / part.length;
    console.log(`${split}: expectations met ${(100 * share).toFixed(1)}%, rows passing ${pass}/${part.length} (±${(100 / Math.sqrt(part.length)).toFixed(0)} points), cases passing every rep ${steady}/${byCase.size}`);
    const unstable = [...byCase].filter(([, p]) => !p.every(Boolean)).map(([id, p]) => `${id}(${p.join('')})`);
    if (unstable.length) console.log(`  not every rep: ${unstable.join(' ')}`);
  }
  console.log(`errors: ${readRows(errorsFile).length}`);
}
if (opts['dry-run'] || todo.length === 0) { report(); process.exit(0); }

mkdirSync(join(setDir, 'traces'), { recursive: true });
if (!existsSync(summaryFile)) {
  writeFileSync(summaryFile, `${JSON.stringify({ description: `${SKILL} from ${skillSource}`, target: 'skill', skill_source: skillSource, skill_sha: skillSha, access: opts.access }, null, 2)}\n`);
}
if (!existsSync(stateFile)) {
  const metrics = [{ id: 'pass', kind: 'float', label: 'Every expectation met' }, { id: 'expectations_met', kind: 'float', label: 'Share of expectations met' }];
  writeFileSync(stateFile, `${JSON.stringify({
    goal: `${SKILL} meets every expectation of evals.json, and the cases that existed before a change stay at or above their baseline`,
    cases: cases.map((c) => c.id), access: opts.access, model: opts.model, judge_model: opts['judge-model'], metrics,
    perf_fields: [{ id: 'turns', label: 'Turns' }, { id: 'latency_s', label: 'Latency', unit: 's' }],
  }, null, 2)}\n`);
}

function prepareWorkspace(c, id) {
  // Outside any .claude/ folder: headless Claude Code denies writes under one.
  const ws = mkdtempSync(join(tmpdir(), `${SKILL}-${opts.variant}-${id}-`));
  if (c.fixture) cpSync(join(fixtureRoot, c.fixture), ws, { recursive: true });
  for (const name of c.skills) {
    const source = name === SKILL ? skillFolder : skillDir(name);
    const target = join(ws, '.claude/skills', name);
    cpSync(source, target, { recursive: true, filter: (src) => !/^\/agents(\/|$)/.test(src.slice(source.length)) && !src.includes('__pycache__') });
    if (name === SKILL && opts['skill-file']) writeFileSync(join(target, 'SKILL.md'), skillText);
  }
  for (const step of [['init', '-q'], ['add', '-A'], ['-c', 'user.name=eval', '-c', 'user.email=eval@example.com', 'commit', '-q', '-m', 'fixture']]) {
    spawnSync('git', ['-C', ws, ...step]);
  }
  return ws;
}

function readStream(raw) {
  const info = { model: null, apiKeySource: null, resultSubtype: null, costUsd: null, usage: null, turns: null, permissionDenials: [] };
  for (const line of raw.split('\n')) {
    let event;
    try { event = JSON.parse(line); } catch { continue; }
    if (event.type === 'system' && event.subtype === 'init') {
      info.model = event.model;
      info.apiKeySource = event.apiKeySource;
    }
    if (event.type === 'result') {
      info.resultSubtype = event.subtype; info.isError = event.is_error === true; info.apiErrorStatus = event.api_error_status ?? null; info.resultText = typeof event.result === 'string' ? event.result : '';
      info.costUsd = event.total_cost_usd ?? null;
      info.usage = event.usage ?? null;
      info.turns = event.num_turns ?? null;
      info.permissionDenials = event.permission_denials ?? [];
    }
  }
  return info;
}

function runClaude(workspace, prompt, rawFile) {
  const args = ['-p', prompt, '--setting-sources', 'project', '--output-format', 'stream-json', '--verbose',
    '--max-budget-usd', opts['max-budget-usd'], '--permission-mode', 'acceptEdits', '--model', opts.model,
    '--allowedTools', 'Read', 'Edit', 'Write', 'Glob', 'Grep', 'Skill',
    'Bash(ls:*)', 'Bash(cat:*)', 'Bash(git:*)', 'Bash(find:*)', 'Bash(grep:*)', 'Bash(head:*)', 'Bash(wc:*)',
    'Bash(python3:*)', 'Bash(node:*)', 'Bash(mktemp:*)', 'Bash(npm test:*)'];
  return new Promise((settle) => {
    const child = spawn('claude', args, { cwd: workspace, env: childEnv, stdio: ['ignore', 'pipe', 'pipe'] });
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
  const runDir = join(setDir, 'runs', id);
  rmSync(runDir, { recursive: true, force: true });
  mkdirSync(runDir, { recursive: true });
  const workspace = prepareWorkspace(c, id);
  writeFileSync(join(runDir, 'workspace.txt'), `${workspace}\n`);
  const started = Date.now();
  const errorRow = (cls, detail, info) => appendFileSync(errorsFile, `${JSON.stringify({
    prompt_id: c.id, rep, class: cls, detail, workspace, model: info?.model ?? null, usage: info?.usage ?? null, at: new Date().toISOString(),
  })}\n`);

  const rawFile = join(runDir, 'turn1.jsonl');
  const t = await runClaude(workspace, c.prompt, rawFile);
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
  writeFileSync(join(setDir, 'traces', `${id}.json`), `${JSON.stringify(turns, null, 2)}\n`);
  const changes = collectChanges(workspace);
  const judged = judgeRun(c, turns, changes, { env: childEnv, model: opts['judge-model'], about: 'the llm-evals skill, which builds, climbs, graduates, and runs LLM evals and their regression suite' });
  if (judged.error) return errorRow('judge', judged.error, t.info);
  const scored = scoreJudged(judged);
  const judgeMeta = { changed: changes.changed, verdicts: judged.verdicts, judge_model: judged.model, judge_usage: judged.usage, judge_cost_usd: judged.cost };
  appendFileSync(resultsFile, `${JSON.stringify({
    prompt_id: c.id, rep, prompt: c.prompt, tags: c.tags, grade: scored.grade, status: 'ok', stop_reason: t.info.resultSubtype,
    model: t.info.model, usage: t.info.usage, turns: t.info.turns, latency_s: latency,
    meta: { cost_usd: t.info.costUsd, problems: scored.problems, ...judgeMeta },
  })}\n`);
  console.log(`${id}: ${JSON.stringify(scored.grade)} ${latency.toFixed(0)}s${scored.problems.length ? ` — ${scored.problems[0].slice(0, 160)}` : ''}`);
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
report();
