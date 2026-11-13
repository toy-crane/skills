#!/usr/bin/env node
// Runner for define-product's evals in the llm-evals layout. This folder is the skill's eval root:
// regression/<criterion>/ holds each graduated suite's cases.jsonl, grader, and fixtures, and
// regression/log.md records how each suite reached its level. --suite evals runs evals.json's
// cases with their expectations unchanged, judged by the same rubric grader.
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  appendFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { collectEndState, invokedSkills, judgeRun, scoreRun } from './regression/define-product-first-work-unit/grade.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');
// Each published skill is linked from .claude/skills/<name> to skills/<group>/<name>.
const skillDir = (name) => realpathSync(join(repoRoot, '.claude/skills', name));
const skillPath = relative(repoRoot, join(skillDir('define-product'), 'SKILL.md'));
const usage = `usage: run.mjs --variant <label> --access api|subscription [options]
  --skill-ref <git-ref>   take define-product's SKILL.md from this ref (required for baseline)
  --skill-file <path>     take SKILL.md from this file (default: the working tree's)
  --suite <name>|evals    a suite under regression/, or evals.json (default: define-product-first-work-unit)
  --cases a,b             run only these case ids
  --reps <n>              runs per case (default: 2)
  --workers <n>           runs in parallel (default: 4)
  --model <id>            agent model (default: claude-sonnet-5-5)
  --judge-model <id>      judge model (default: claude-opus-5-5)
  --flow <dir>            flow folder (default: .claude/hillclimb/define-product/<suite>)
  --timeout-s <n>         wall-clock ceiling per run (default: 600)
  --max-budget-usd <n>    per-run budget passed to claude (default: 2)
  --dry-run               print the resolved scope and stop`;

const { values: opts } = parseArgs({
  options: {
    variant: { type: 'string' },
    access: { type: 'string' },
    'skill-ref': { type: 'string' },
    'skill-file': { type: 'string' },
    suite: { type: 'string', default: 'define-product-first-work-unit' },
    cases: { type: 'string' },
    reps: { type: 'string', default: '2' },
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
if (!/^[\w.-]+$/.test(opts.variant ?? '')) fail('--variant needs a label such as baseline, v1, or 2026-11-10');
if (!['api', 'subscription'].includes(opts.access)) fail('--access must be api or subscription');
if (opts.variant === 'baseline' && !opts['skill-ref'] && !opts['skill-file']) fail('baseline needs --skill-ref or --skill-file');
if (opts.model === opts['judge-model']) fail('the judge must be a different model from the agent under test');
let cases;
let suiteDir;
if (opts.suite === 'evals') {
  // The skill's existing behavior cases, with their expectations unchanged.
  suiteDir = here;
  cases = JSON.parse(readFileSync(join(here, 'evals.json'), 'utf8')).evals.map((e) => ({
    id: `evals-${e.id}`, kind: 'regression', tags: ['evals'], prompt: e.prompt, expectations: e.expectations, files: e.files, skills: ['define-product', 'shape-idea'],
  }));
} else {
  suiteDir = join(here, 'regression', opts.suite);
  if (!existsSync(join(suiteDir, 'cases.jsonl'))) fail(`unknown suite: ${opts.suite}`);
  cases = readFileSync(join(suiteDir, 'cases.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
}
if (opts.cases) {
  const wanted = opts.cases.split(',').map((c) => c.trim());
  for (const id of wanted) if (!cases.some((c) => c.id === id)) fail(`unknown case in ${opts.suite}: ${id}`);
  cases = cases.filter((c) => wanted.includes(c.id));
}
const reps = Number(opts.reps);
const workers = Number(opts.workers);
const timeoutMs = Number(opts['timeout-s']) * 1000;

// The define-product text under test.
let skillText;
let skillSource;
if (opts['skill-ref']) {
  const shown = spawnSync('git', ['-C', repoRoot, 'show', `${opts['skill-ref']}:${skillPath}`], { encoding: 'utf8' });
  if (shown.status !== 0) fail(`cannot read define-product SKILL.md at ${opts['skill-ref']}: ${shown.stderr.trim()}`);
  skillText = shown.stdout;
  const sha = spawnSync('git', ['-C', repoRoot, 'rev-parse', '--short', opts['skill-ref']], { encoding: 'utf8' }).stdout.trim();
  skillSource = `git ${opts['skill-ref']} (${sha})`;
} else {
  const file = resolve(opts['skill-file'] ?? join(repoRoot, skillPath));
  skillText = readFileSync(file, 'utf8');
  skillSource = `file ${file}`;
}
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

const flowDir = resolve(opts.flow ?? join(repoRoot, '.claude/hillclimb/define-product', opts.suite));
const variantDir = join(flowDir, opts.variant);
const setDir = variantDir;
const resultsFile = join(setDir, 'results.jsonl');
const errorsFile = join(setDir, 'errors.jsonl');
const readRows = (file) => (existsSync(file) ? readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []);

// One flow keeps one access and one model so its variants compare.
const stateFile = join(flowDir, '_state.json');
if (existsSync(stateFile)) {
  const state = JSON.parse(readFileSync(stateFile, 'utf8'));
  if (state.access !== opts.access) { console.error(`this flow runs on ${state.access}; use the same access or another --flow.`); process.exit(2); }
  if (state.model !== opts.model) { console.error(`this flow runs on model ${state.model}; use the same --model or another --flow.`); process.exit(2); }
  if (state.judge_model !== opts['judge-model']) { console.error(`this flow is judged by ${state.judge_model}; use the same --judge-model or another --flow.`); process.exit(2); }
}
// A variant keeps one skill text. Check it before any early exit, so a finished
// variant never passes off its old scores as the edited skill's.
const summaryFile = join(variantDir, 'summary.json');
if (existsSync(summaryFile)) {
  const previous = JSON.parse(readFileSync(summaryFile, 'utf8'));
  if (previous.skill_sha !== skillSha) { console.error(`${opts.variant} already holds runs of skill sha ${previous.skill_sha}; this run is ${skillSha}. Use a new variant.`); process.exit(2); }
}
const done = new Set(readRows(resultsFile).map((r) => `${r.prompt_id}#${r.rep}`));
const todo = [];
for (let rep = 0; rep < reps; rep += 1) for (const c of cases) if (!done.has(`${c.id}#${rep}`)) todo.push({ c, rep });

console.log(`variant ${opts.variant}: define-product SKILL.md from ${skillSource} (sha ${skillSha})`);
console.log(`access ${opts.access}, model ${opts.model}, judge ${opts['judge-model']}; suite ${opts.suite}: ${cases.length} cases × ${reps} reps; ${done.size} done, ${todo.length} to run`);
const priced = readRows(resultsFile).filter((r) => typeof r.meta?.cost_usd === 'number');
if (priced.length) {
  const mean = priced.reduce((n, r) => n + r.meta.cost_usd + (r.meta.judge_cost_usd ?? 0), 0) / priced.length;
  console.log(`estimate from ${priced.length} finished runs: ~$${(mean * todo.length).toFixed(2)} ${opts.access === 'api' ? 'billed' : 'API equivalent, drawn from the subscription'}`);
}
function report() {
  const rows = readRows(resultsFile);
  if (!rows.length) return;
  const sum = (metric) => rows.reduce((n, r) => n + (r.grade[metric] ?? 0), 0);
  const byCase = new Map();
  for (const r of rows) byCase.set(r.prompt_id, [...(byCase.get(r.prompt_id) ?? []), r.grade.pass]);
  const unstable = [...byCase].filter(([, p]) => !p.every(Boolean)).map(([id, p]) => `${id}(${p.join('')})`);
  console.log(`score: pass ${sum('pass')}/${rows.length} (±${(100 / Math.sqrt(rows.length)).toFixed(0)} points), cases passing every rep ${byCase.size - unstable.length}/${byCase.size}, `
    + `multi_candidate ${sum('multi_candidate')}, overreach ${sum('overreach')}, errors ${readRows(errorsFile).length}`);
  if (unstable.length) console.log(`not every rep: ${unstable.join(' ')}`);
}
if (opts['dry-run'] || todo.length === 0) { report(); process.exit(0); }

mkdirSync(join(setDir, 'traces'), { recursive: true });
if (!existsSync(summaryFile)) {
  writeFileSync(summaryFile, `${JSON.stringify({ description: `define-product from ${skillSource}`, target: 'skill', skill_source: skillSource, skill_sha: skillSha, access: opts.access }, null, 2)}\n`);
}
if (!existsSync(stateFile)) {
  writeFileSync(stateFile, `${JSON.stringify({
    goal: `define-product holds the level recorded in regression/log.md for suite ${opts.suite}`,
    suite: opts.suite,
    cases: cases.map((c) => c.id),
    access: opts.access,
    model: opts.model,
    judge_model: opts['judge-model'],
    metrics: [
      { id: 'pass', kind: 'float', label: 'Case passes' },
      { id: 'multi_candidate', kind: 'float', label: 'Several candidates or a feature order', better: 'lower' },
      { id: 'overreach', kind: 'float', label: 'Candidate in PRODUCT.md, spec, or shaping', better: 'lower' },
      { id: 'candidate_present', kind: 'float', label: 'A candidate appeared' },
    ],
    perf_fields: [{ id: 'turns', label: 'Turns' }, { id: 'latency_s', label: 'Latency', unit: 's' }],
  }, null, 2)}\n`);
}

function prepareWorkspace(c, id) {
  // Outside any .claude/ folder: headless Claude Code denies writes under one.
  const ws = mkdtempSync(join(tmpdir(), `define-product-${opts.variant}-${id}-`));
  if (c.fixture) cpSync(join(suiteDir, 'fixtures', c.fixture), ws, { recursive: true });
  for (const file of c.files ?? []) cpSync(join(here, file), join(ws, basename(file)));
  for (const name of c.skills) {
    const target = join(ws, '.claude/skills', name);
    const source = skillDir(name);
    cpSync(source, target, { recursive: true, filter: (src) => !/^\/agents(\/|$)/.test(src.slice(source.length)) });
  }
  writeFileSync(join(ws, '.claude/skills/define-product/SKILL.md'), skillText);
  for (const step of [['init', '-q'], ['add', '-A'], ['-c', 'user.name=eval', '-c', 'user.email=eval@example.com', 'commit', '-q', '-m', 'fixture']]) {
    spawnSync('git', ['-C', ws, ...step]);
  }
  return ws;
}

function readStream(raw) {
  const info = { sessionId: null, model: null, apiKeySource: null, resultSubtype: null, costUsd: null, usage: null, turns: null, permissionDenials: [] };
  for (const line of raw.split('\n')) {
    let event;
    try { event = JSON.parse(line); } catch { continue; }
    if (event.type === 'system' && event.subtype === 'init') {
      info.sessionId = event.session_id;
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
    'Bash(ls:*)', 'Bash(cat:*)', 'Bash(git:*)', 'Bash(find:*)', 'Bash(grep:*)', 'Bash(node:*)', 'Bash(npm test:*)'];
  return new Promise((settle) => {
    const child = spawn('claude', args, { cwd: workspace, env: childEnv, stdio: ['ignore', 'pipe', 'pipe'] });
    const out = [];
    const err = [];
    child.stdout.on('data', (chunk) => out.push(chunk));
    child.stderr.on('data', (chunk) => err.push(chunk));
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; child.kill('SIGTERM'); setTimeout(() => child.kill('SIGKILL'), 10_000).unref(); }, timeoutMs);
    child.on('close', (code) => {
      clearTimeout(timer);
      const raw = Buffer.concat(out).toString('utf8');
      writeFileSync(rawFile, raw);
      settle({ code, timedOut, info: readStream(raw), stderr: Buffer.concat(err).toString('utf8') });
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
  // Claude Code ends a turn stopped by an API error, such as a usage limit, with subtype success and is_error.
  // That trial never finished answering, so it is not a result: keep it out of grading for a rerun to fill.
  if (t.info.isError) return errorRow('api-error', `status ${t.info.apiErrorStatus}: ${t.info.resultText.slice(0, 300)}`, t.info);
  if (t.info.resultSubtype !== 'success') return errorRow('harness', `result ${t.info.resultSubtype}: ${t.stderr.slice(0, 300)}`, t.info);
  if (!t.info.model?.startsWith(opts.model)) return errorRow('served-model-mismatch', `asked ${opts.model}, served ${t.info.model}`, t.info);
  const expectedKey = opts.access === 'api' ? 'ANTHROPIC_API_KEY' : 'none';
  if (t.info.apiKeySource !== expectedKey) return errorRow('access-mismatch', `key source ${t.info.apiKeySource}`, t.info);
  const deniedWrites = t.info.permissionDenials.filter((d) => /^(Write|Edit|MultiEdit)$/.test(d.tool_name));
  if (deniedWrites.length) return errorRow('harness', `file writes denied: ${deniedWrites.map((d) => d.tool_input?.file_path).join(', ')}`, t.info);
  const latency = (Date.now() - started) / 1000;

  const turns = toTurns(rawFile, c.prompt);
  writeFileSync(join(setDir, 'traces', `${id}.json`), `${JSON.stringify(turns, null, 2)}\n`);
  const endState = collectEndState(workspace);
  const skills = invokedSkills(turns);
  const judged = judgeRun(c, turns, endState, { env: childEnv, model: opts['judge-model'] });
  if (judged.error) return errorRow('judge', judged.error, t.info);
  const { grade, problems } = scoreRun(c, judged, endState, skills);
  appendFileSync(resultsFile, `${JSON.stringify({
    prompt_id: c.id, rep, prompt: c.prompt, tags: c.tags, grade, status: 'ok', stop_reason: t.info.resultSubtype,
    model: t.info.model, usage: t.info.usage, turns: t.info.turns, latency_s: latency,
    meta: {
      cost_usd: t.info.costUsd, changed: endState.changed, skills_invoked: skills, candidates: judged.candidates,
      feature_order: judged.featureOrder, candidate_in_product: judged.candidateInProduct, verdicts: judged.verdicts, problems,
      judge_model: judged.model, judge_usage: judged.usage, judge_cost_usd: judged.cost,
    },
  })}\n`);
  console.log(`${id}: ${JSON.stringify(grade)} candidates=${judged.candidates} changed=${endState.changed.join(',') || '-'} ${latency.toFixed(0)}s`);
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
