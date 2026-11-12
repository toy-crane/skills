#!/usr/bin/env node
// Runner for audit-evals' evals in the llm-evals layout. This folder is the skill's eval root.
//   --suite eval-suite-audit-3  criterion 3 of docs/specs/eval-suite-audit: the four lists must equal
//                               the reference lists; graded by eval-suite-audit-3/grade.mjs, no judge.
//   --suite evals               evals.json's cases (criterion 4), each expectation ruled on by judge.mjs.
// Each run installs the skills a case names into a disposable git workspace outside any .claude/
// folder, runs `claude -p` there, and grades the end state and transcript.
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  appendFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { collectEndState, scoreRun } from './eval-suite-audit-3/grade.mjs';
import { collectChanges, judgeRun, scoreJudged } from './judge.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');
const SKILL = 'audit-evals';
// Each published skill is linked from .claude/skills/<name> to skills/<group>/<name>.
const skillDir = (name) => realpathSync(join(repoRoot, '.claude/skills', name));
const usage = `usage: run.mjs --variant <label> --access api|subscription --suite eval-suite-audit-3|evals [options]
  --no-skill              run without ${SKILL} installed (the baseline for a new skill)
  --skill-ref <git-ref>   take ${SKILL}'s folder from this ref
  --skill-file <path>     take SKILL.md from this file (default: the working tree's folder)
  --cases a,b             run only these case ids
  --split train|test|all  run only one split of eval-suite-audit-3 (default: all)
  --reps <n>              runs per case (default: 2)
  --workers <n>           runs in parallel (default: 4)
  --model <id>            agent model (default: claude-opus-5-5)
  --judge-model <id>      judge model for --suite evals (default: claude-sonnet-5-5)
  --flow <dir>            flow folder (default: .claude/hillclimb/${SKILL}/<suite>)
  --timeout-s <n>         wall-clock ceiling per run (default: 900)
  --max-budget-usd <n>    per-run budget passed to claude (default: 3)
  --dry-run               print the resolved scope and stop`;

const { values: opts } = parseArgs({
  options: {
    variant: { type: 'string' },
    access: { type: 'string' },
    suite: { type: 'string' },
    'no-skill': { type: 'boolean', default: false },
    'skill-ref': { type: 'string' },
    'skill-file': { type: 'string' },
    cases: { type: 'string' },
    split: { type: 'string', default: 'all' },
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
if (!['eval-suite-audit-3', 'evals'].includes(opts.suite)) fail('--suite must be eval-suite-audit-3 or evals');
if (opts.model === opts['judge-model']) fail('the judge must be a different model from the agent under test');

let cases;
let fixtureRoot;
if (opts.suite === 'evals') {
  fixtureRoot = join(here, 'fixtures');
  cases = JSON.parse(readFileSync(join(here, 'evals.json'), 'utf8')).evals.map((e) => ({
    id: `evals-${e.id}`, tags: ['evals'], prompt: e.prompt, expectations: e.expectations, fixture: e.fixture, skills: e.skills,
  }));
} else {
  fixtureRoot = join(here, opts.suite, 'fixtures');
  // Fixture histories are built from the committed trial records, and the expected lists are
  // computed from the same records by an independent reference.
  // Rebuilt on every start, so an edit to fixtures.json or source/ never meets stale histories.
  const built = spawnSync('python3', ['-I', join(here, opts.suite, 'build_fixtures.py')], { encoding: 'utf8' });
  if (built.status !== 0) fail(`build_fixtures.py failed: ${built.stderr.trim()}`);
  cases = readFileSync(join(here, opts.suite, 'cases.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
  if (opts.split !== 'all') cases = cases.filter((c) => c.split === opts.split);
}
if (opts.cases) {
  const wanted = opts.cases.split(',').map((c) => c.trim());
  for (const id of wanted) if (!cases.some((c) => c.id === id)) fail(`unknown case in ${opts.suite}: ${id}`);
  cases = cases.filter((c) => wanted.includes(c.id));
}
const reps = Number(opts.reps);
const workers = Number(opts.workers);
const timeoutMs = Number(opts['timeout-s']) * 1000;

// The audit-evals folder under test: none, a git ref, a SKILL.md file, or the working tree.
let skillSource;
let skillFolder = null;
if (opts['no-skill']) {
  skillSource = 'no skill';
} else if (opts['skill-ref']) {
  skillFolder = mkdtempSync(join(tmpdir(), `${SKILL}-ref-`));
  const path = relative(repoRoot, skillDir(SKILL));
  const archive = spawnSync('sh', ['-c', `git -C "${repoRoot}" archive "${opts['skill-ref']}" "${path}" | tar -x -C "${skillFolder}"`], { encoding: 'utf8' });
  if (archive.status !== 0) fail(`cannot read ${path} at ${opts['skill-ref']}: ${archive.stderr.trim()}`);
  skillFolder = join(skillFolder, path);
  skillSource = `git ${opts['skill-ref']}`;
} else {
  skillFolder = skillDir(SKILL);
  skillSource = opts['skill-file'] ? `file ${resolve(opts['skill-file'])}` : 'working tree';
}
const skillText = skillFolder ? (opts['skill-file'] ? readFileSync(resolve(opts['skill-file']), 'utf8') : readFileSync(join(skillFolder, 'SKILL.md'), 'utf8')) : '';
const scriptText = skillFolder ? readFileSync(join(skillFolder, 'scripts/audit_evals.py'), 'utf8') : '';
const skillSha = createHash('sha256').update(skillText + scriptText).digest('hex').slice(0, 12);

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
console.log(`access ${opts.access}, model ${opts.model}${opts.suite === 'evals' ? `, judge ${opts['judge-model']}` : ''}; suite ${opts.suite}: ${cases.length} cases × ${reps} reps; ${done.size} done, ${todo.length} to run`);
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
    console.log(`${split}: rows passing ${pass}/${part.length} (±${(100 / Math.sqrt(part.length)).toFixed(0)} points), cases passing every rep ${steady}/${byCase.size}`);
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
  const metrics = opts.suite === 'evals'
    ? [{ id: 'pass', kind: 'float', label: 'Every expectation met' }, { id: 'expectations_met', kind: 'float', label: 'Share of expectations met' }]
    : [{ id: 'pass', kind: 'float', label: 'Four lists exact, history untouched, sizes reported' }, { id: 'lists_exact', kind: 'float', label: 'Four lists exact' },
      { id: 'insufficient_exact', kind: 'float', label: 'Insufficient-history list exact' }, { id: 'history_unchanged', kind: 'float', label: 'Cell history untouched' },
      { id: 'counts_reported', kind: 'float', label: 'List sizes in the reply' }];
  const split = (s) => cases.filter((c) => c.split === s).map((c) => c.id);
  writeFileSync(stateFile, `${JSON.stringify({
    goal: opts.suite === 'evals' ? `${SKILL} meets every expectation of evals.json` : 'audit-evals reports the four lists exactly on every held-out case and rep (spec eval-suite-audit criterion 3)',
    suite: opts.suite, train: split('train'), test: split('test'), access: opts.access, model: opts.model,
    judge_model: opts.suite === 'evals' ? opts['judge-model'] : null, metrics,
    perf_fields: [{ id: 'turns', label: 'Turns' }, { id: 'latency_s', label: 'Latency', unit: 's' }],
  }, null, 2)}\n`);
}

function prepareWorkspace(c, id) {
  // Outside any .claude/ folder: headless Claude Code denies writes under one.
  const ws = mkdtempSync(join(tmpdir(), `${SKILL}-${opts.variant}-${id}-`));
  cpSync(join(fixtureRoot, c.fixture), ws, { recursive: true });
  for (const name of c.skills) {
    if (name === SKILL && !skillFolder) continue;
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
      info.resultSubtype = event.subtype;
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
    'Bash(python3:*)', 'Bash(node:*)', 'Bash(mktemp:*)'];
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
  if (!t.info.model?.startsWith(opts.model)) return errorRow('served-model-mismatch', `asked ${opts.model}, served ${t.info.model}`, t.info);
  const expectedKey = opts.access === 'api' ? 'ANTHROPIC_API_KEY' : 'none';
  if (t.info.apiKeySource !== expectedKey) return errorRow('access-mismatch', `key source ${t.info.apiKeySource}`, t.info);
  const deniedWrites = t.info.permissionDenials.filter((d) => /^(Write|Edit|MultiEdit)$/.test(d.tool_name));
  if (deniedWrites.length) return errorRow('harness', `file writes denied: ${deniedWrites.map((d) => d.tool_input?.file_path).join(', ')}`, t.info);
  const latency = (Date.now() - started) / 1000;

  const turns = toTurns(rawFile, c.prompt);
  writeFileSync(join(setDir, 'traces', `${id}.json`), `${JSON.stringify(turns, null, 2)}\n`);
  let scored;
  let judgeMeta = {};
  if (opts.suite === 'evals') {
    const changes = collectChanges(workspace);
    const judged = judgeRun(c, turns, changes, { env: childEnv, model: opts['judge-model'], about: 'the audit-evals skill, which reads a regression suite\'s cell history, reports what it finds, and demotes only approved cells' });
    if (judged.error) return errorRow('judge', judged.error, t.info);
    scored = scoreJudged(judged);
    judgeMeta = { changed: changes.changed, verdicts: judged.verdicts, judge_model: judged.model, judge_usage: judged.usage, judge_cost_usd: judged.cost };
  } else {
    const endState = collectEndState(workspace);
    scored = scoreRun(c, endState, turns);
    judgeMeta = { report_path: endState.reportPath };
  }
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
