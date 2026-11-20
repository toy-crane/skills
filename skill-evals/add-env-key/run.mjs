#!/usr/bin/env node
// Runner for add-env-key's capability eval (docs/specs/add-env-key/, acceptance 6).
// Each case runs twice over: once with a stand-in secret-env mod (fake-secret-env.mjs
// as an MCP server named secret-env) and once without it. Every run gets a disposable
// project outside any .claude/ folder and a PATH whose browser and editor commands
// only log their arguments. Without the mod, a second turn plays the user: the
// harness writes a value into the key line and says it is done.
// Checks are programmatic except one judge call on how the run talked to the user.
// The graduated suite lives in regression/<suite>/cases.jsonl; regression/cell-history.json
// names its cells (case@condition × check) and tiers, and every skill run updates it.
// regression/log.md records how the suite reached its level.
//   node run.mjs --variant r1 --access subscription
//   node run.mjs --variant baseline --no-skill --access subscription
import { spawn, spawnSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import {
  appendFileSync, chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { finishRun, loadHistory, planTiers, recordRow, saveHistory } from '../audit-evals/history.mjs';
import { judgeRun } from '../llm-evals/judge.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');
const skillDir = join(repoRoot, 'skills/workflow/add-env-key');
const usage = `usage: run.mjs --variant <label> --access api|subscription [options]
  --suite <folder>        suite under regression/ (default: add-env-key)
  --no-skill              install no skill (a baseline; leaves the cell history alone)
  --cases a@mod,b@nomod   run only these case ids, optionally with a condition
  --conditions mod,nomod  conditions to run (default: both)
  --split train|test      run only cases of this split
  --reps <n>              runs per case and condition (default: the suite's recorded reps)
  --workers <n>           runs in parallel (default: 4)
  --model <id>            agent model (default: claude-sonnet-5-5)
  --judge-model <id>      judge model (default: claude-opus-5-5)
  --flow <dir>            results folder (default: .claude/hillclimb/add-env-key)
  --timeout-s <n>         wall-clock ceiling per turn (default: 600)
  --max-budget-usd <n>    per-turn budget passed to claude (default: 2)
  --dry-run               print the resolved scope and stop`;

const { values: opts } = parseArgs({
  options: {
    variant: { type: 'string' },
    access: { type: 'string' },
    suite: { type: 'string', default: 'add-env-key' },
    'no-skill': { type: 'boolean', default: false },
    cases: { type: 'string' },
    conditions: { type: 'string', default: 'mod,nomod' },
    split: { type: 'string' },
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
function fail(message) { console.error(`${message}\n\n${usage}`); process.exit(2); }
if (opts.help) { console.log(usage); process.exit(0); }
if (!/^[\w.-]+$/.test(opts.variant ?? '')) fail('--variant needs a label such as baseline or v1');
if (!['api', 'subscription'].includes(opts.access)) fail('--access must be api or subscription');
if (opts.model === opts['judge-model']) fail('the judge must be a different model from the agent under test');

const suiteDir = join(here, 'regression', opts.suite);
if (!existsSync(join(suiteDir, 'cases.jsonl'))) fail(`unknown suite: ${opts.suite}`);
const historyPath = join(here, 'regression', 'cell-history.json');
const history = loadHistory(historyPath);
if (!history.suites[opts.suite]) fail(`no suite ${opts.suite} in ${historyPath}`);
const tiers = planTiers(history, opts.suite, opts.model);
const allCases = readFileSync(join(suiteDir, 'cases.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
const conditions = opts.conditions.split(',');
let items = [];
for (const c of allCases) for (const cond of conditions) items.push({ c, cond, pid: `${c.id}@${cond}` });
// Only the graduated cells run, by the tiers the history plans for this model.
items = items.filter((i) => history.suites[opts.suite].cells[i.pid] && tiers.runsCase(i.pid));
if (opts.split) items = items.filter((i) => i.c.split === opts.split);
if (opts.cases) {
  const wanted = opts.cases.split(',');
  items = items.filter((i) => wanted.includes(i.pid) || wanted.includes(i.c.id));
}
const reps = Number(opts.reps ?? history.suites[opts.suite].reps);
const timeoutMs = Number(opts['timeout-s']) * 1000;

const skillText = opts['no-skill'] ? '' : readFileSync(join(skillDir, 'SKILL.md'), 'utf8') + readFileSync(join(skillDir, 'scripts/env-key.mjs'), 'utf8');
const skillSha = opts['no-skill'] ? 'none' : createHash('sha256').update(skillText).digest('hex').slice(0, 12);

const childEnv = { ...process.env };
if (opts.access === 'api') {
  if (!childEnv.ANTHROPIC_API_KEY) { console.error('API access needs ANTHROPIC_API_KEY in the environment.'); process.exit(3); }
} else {
  delete childEnv.ANTHROPIC_API_KEY;
  delete childEnv.ANTHROPIC_AUTH_TOKEN;
}

const flowDir = resolve(opts.flow ?? join(repoRoot, '.claude/hillclimb/add-env-key'));
const variantDir = join(flowDir, opts.variant);
const resultsFile = join(variantDir, 'results.jsonl');
const errorsFile = join(variantDir, 'errors.jsonl');
const readRows = (file) => (existsSync(file) ? readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []);

const stateFile = join(flowDir, '_state.json');
if (existsSync(stateFile)) {
  const state = JSON.parse(readFileSync(stateFile, 'utf8'));
  for (const key of ['access', 'model', 'judge_model']) {
    const mine = key === 'judge_model' ? opts['judge-model'] : opts[key];
    if (state[key] !== mine) { console.error(`this flow uses ${key} ${state[key]}; use the same or another --flow.`); process.exit(2); }
  }
}
const summaryFile = join(variantDir, 'summary.json');
if (existsSync(summaryFile)) {
  const previous = JSON.parse(readFileSync(summaryFile, 'utf8'));
  if (previous.skill_sha !== skillSha) { console.error(`${opts.variant} holds runs of skill sha ${previous.skill_sha}; this run is ${skillSha}. Use a new variant.`); process.exit(2); }
}
const done = new Set(readRows(resultsFile).map((r) => `${r.prompt_id}#${r.rep}`));
const todo = [];
for (let rep = 0; rep < reps; rep += 1) for (const item of items) if (!done.has(`${item.pid}#${rep}`)) todo.push({ ...item, rep });

console.log(`variant ${opts.variant}: skill sha ${skillSha}; access ${opts.access}, model ${opts.model}, judge ${opts['judge-model']}`);
console.log(`${items.length} case-conditions × ${reps} reps; ${done.size} done, ${todo.length} to run`);

function report() {
  const rows = readRows(resultsFile);
  if (!rows.length) return;
  for (const cond of conditions) {
    for (const split of ['train', 'test']) {
      const sub = rows.filter((r) => r.tags.includes(cond) && r.tags.includes(split));
      if (!sub.length) continue;
      const pass = sub.reduce((n, r) => n + r.grade.pass, 0);
      const leaks = sub.filter((r) => !r.grade.no_leak || !r.grade.not_asked).length;
      const checks = Object.keys(sub[0].grade).filter((k) => k !== 'pass').map((k) => `${k} ${sub.reduce((n, r) => n + r.grade[k], 0)}`).join(', ');
      console.log(`${cond} ${split}: pass ${pass}/${sub.length} (±${(100 / Math.sqrt(sub.length)).toFixed(0)} points), value asked or leaked in ${leaks}; ${checks}`);
    }
  }
  const errors = readRows(errorsFile).length;
  if (errors) console.log(`errors: ${errors} (see errors.jsonl)`);
}
if (opts['dry-run'] || todo.length === 0) { report(); process.exit(0); }

mkdirSync(join(variantDir, 'traces'), { recursive: true });
if (!existsSync(summaryFile)) writeFileSync(summaryFile, `${JSON.stringify({ description: opts['no-skill'] ? 'no skill' : 'add-env-key from the working tree', skill_sha: skillSha, access: opts.access }, null, 2)}\n`);
if (!existsSync(stateFile)) {
  writeFileSync(stateFile, `${JSON.stringify({
    goal: 'add-env-key keeps criterion 1 with the mod and criteria 2 and 4 without it on >= 9/10 held-out runs per condition, never asking for or leaking the value',
    access: opts.access, model: opts.model, judge_model: opts['judge-model'],
    train: allCases.filter((c) => c.split === 'train').map((c) => c.id),
    test: allCases.filter((c) => c.split === 'test').map((c) => c.id),
    metrics: [
      { id: 'pass', kind: 'float', label: 'Every check holds' },
      { id: 'name_file', kind: 'float', label: 'Right key name in the right file, other lines kept' },
      { id: 'page', kind: 'float', label: 'Issuance page opened' },
      { id: 'editor', kind: 'float', label: 'File opened in an editor (no mod)' },
      { id: 'no_leak', kind: 'float', label: 'Value never in the transcript' },
      { id: 'not_asked', kind: 'float', label: 'Value never asked for in chat' },
      { id: 'confirmed', kind: 'float', label: 'Reports the key set (no mod)' },
    ],
  }, null, 2)}\n`);
}

const envFile = (c) => (c.framework === 'next' ? '.env.local' : '.env');

function prepareWorkspace(c, cond, id) {
  const root = mkdtempSync(join(tmpdir(), `add-env-key-${opts.variant}-${id}-`));
  const ws = join(root, 'app');
  const bin = join(root, 'bin');
  const log = join(root, 'opened.log');
  mkdirSync(ws, { recursive: true });
  mkdirSync(bin);
  writeFileSync(log, '');
  // Browser and editor commands only log; the eval never opens anything on this machine.
  for (const cmd of ['open', 'xdg-open', 'code', 'cursor', 'subl', 'zed', 'mate', 'idea', 'webstorm', 'vim', 'vi', 'nvim', 'nano', 'emacs', 'gedit', 'start', 'explorer']) {
    writeFileSync(join(bin, cmd), `#!/bin/sh\nprintf '%s\\n' "${cmd} $*" >> '${log}'\n`);
    chmodSync(join(bin, cmd), 0o755);
  }
  const pkg = c.framework === 'next'
    ? { name: 'app', private: true, scripts: { dev: 'next dev' }, dependencies: { next: '15.0.0', react: '19.0.0' } }
    : { name: 'app', private: true, type: 'module', scripts: { start: 'node --env-file=.env src/index.js' } };
  writeFileSync(join(ws, 'package.json'), `${JSON.stringify(pkg, null, 2)}\n`);
  const src = c.framework === 'next' ? join(ws, 'app/api/run/route.js') : join(ws, 'src/index.js');
  mkdirSync(dirname(src), { recursive: true });
  writeFileSync(src, c.framework === 'next'
    ? `export async function POST() {\n  const key = process.env.${c.name};\n  if (!key) return Response.json({ error: 'missing ${c.name}' }, { status: 500 });\n  return Response.json({ ok: true });\n}\n`
    : `const key = process.env.${c.name};\nif (!key) throw new Error('missing ${c.name}');\nconsole.log('ready');\n`);
  writeFileSync(join(ws, '.gitignore'), 'node_modules/\n.env*\n');
  if (c.existing) writeFileSync(join(ws, envFile(c)), `${c.existing.join('\n')}\n`);
  mkdirSync(join(ws, '.claude'));
  writeFileSync(join(ws, '.claude/settings.json'), `${JSON.stringify({ permissions: { deny: ['Bash(/usr/bin/open:*)', 'Bash(osascript:*)', 'Bash(/usr/local/bin/code:*)'] } }, null, 2)}\n`);
  if (!opts['no-skill']) {
    cpSync(skillDir, join(ws, '.claude/skills/add-env-key'), { recursive: true, filter: (s) => !s.includes('/agents') });
  }
  for (const step of [['init', '-q'], ['add', '-A'], ['-c', 'user.name=eval', '-c', 'user.email=eval@example.com', 'commit', '-q', '-m', 'fixture']]) spawnSync('git', ['-C', ws, ...step]);
  const secret = `sk_eval_${randomBytes(12).toString('hex')}`;
  const env = { ...childEnv, PATH: `${bin}:${childEnv.PATH}`, FAKE_LOG: log, FAKE_SECRET: secret };
  let mcpConfig = null;
  if (cond === 'mod') {
    mcpConfig = join(root, 'mcp.json');
    writeFileSync(mcpConfig, JSON.stringify({ mcpServers: { 'secret-env': { command: 'node', args: [join(here, 'fake-secret-env.mjs')], env: { FAKE_LOG: log, FAKE_SECRET: secret } } } }));
  }
  return { root, ws, log, secret, env, mcpConfig };
}

function readStream(raw) {
  const info = { sessionId: null, model: null, apiKeySource: null, resultSubtype: null, costUsd: null, usage: null, turns: null };
  for (const line of raw.split('\n')) {
    let e;
    try { e = JSON.parse(line); } catch { continue; }
    if (e.type === 'system' && e.subtype === 'init') { info.sessionId = e.session_id; info.model = e.model; info.apiKeySource = e.apiKeySource; }
    if (e.type === 'result') {
      info.resultSubtype = e.subtype; info.isError = e.is_error === true; info.apiErrorStatus = e.api_error_status ?? null;
      info.resultText = typeof e.result === 'string' ? e.result : ''; info.costUsd = e.total_cost_usd ?? null; info.usage = e.usage ?? null; info.turns = e.num_turns ?? null;
    }
  }
  return info;
}

function runClaude(run, prompt, rawFile, resume) {
  const args = ['-p', prompt, '--setting-sources', 'project', '--output-format', 'stream-json', '--verbose',
    '--max-budget-usd', opts['max-budget-usd'], '--permission-mode', 'acceptEdits', '--model', opts.model,
    '--allowedTools', 'Read', 'Edit', 'Write', 'Glob', 'Grep', 'Skill', 'Bash', 'WebSearch', 'WebFetch', 'mcp__secret-env__request_secret'];
  if (run.mcpConfig) args.push('--mcp-config', run.mcpConfig, '--strict-mcp-config');
  else args.push('--strict-mcp-config');
  if (resume) args.push('--resume', resume);
  return new Promise((settle) => {
    const child = spawn('claude', args, { cwd: run.ws, env: run.env, stdio: ['ignore', 'pipe', 'pipe'] });
    const out = []; const err = [];
    child.stdout.on('data', (d) => out.push(d));
    child.stderr.on('data', (d) => err.push(d));
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
        if (p.type === 'tool_result') turns.push({ role: 'tool_result', content: typeof p.content === 'string' ? p.content : (p.content ?? []).map((x) => x.text ?? '').join('\n') });
      }
    }
  }
  return turns;
}

// The turn's failure class when it is not a scorable answer, else null.
function turnError(t) {
  if (t.timedOut) return ['timeout', 'turn timed out'];
  if (t.info.resultSubtype !== 'success') return ['harness', `result ${t.info.resultSubtype}: ${t.stderr.slice(0, 300)}`];
  if (t.info.isError) return ['api-error', `status ${t.info.apiErrorStatus}: ${t.info.resultText.slice(0, 300)}`];
  if (!t.info.model?.startsWith(opts.model)) return ['served-model-mismatch', `asked ${opts.model}, served ${t.info.model}`];
  const expectedKey = opts.access === 'api' ? 'ANTHROPIC_API_KEY' : 'none';
  if (t.info.apiKeySource !== expectedKey) return ['access-mismatch', `key source ${t.info.apiKeySource}`];
  return null;
}

const keyLineRe = (name) => new RegExp(`^\\s*(?:export\\s+)?${name}\\s*=(.*)$`);

async function runCase({ c, cond, pid, rep }) {
  const id = `${c.id}-${cond}_rep${rep}`;
  const runDir = join(variantDir, 'runs', id);
  rmSync(runDir, { recursive: true, force: true });
  mkdirSync(runDir, { recursive: true });
  const run = prepareWorkspace(c, cond, id);
  writeFileSync(join(runDir, 'workspace.txt'), `${run.root}\n`);
  const errorRow = (cls, detail, info) => appendFileSync(errorsFile, `${JSON.stringify({ prompt_id: pid, rep, class: cls, detail, workspace: run.root, model: info?.model ?? null, usage: info?.usage ?? null, at: new Date().toISOString() })}\n`);
  const started = Date.now();

  const t1 = await runClaude(run, c.prompt, join(runDir, 'turn1.jsonl'));
  const e1 = turnError(t1);
  if (e1) return errorRow(...e1, t1.info);
  let turns = toTurns(join(runDir, 'turn1.jsonl'), c.prompt);
  const file = join(run.ws, envFile(c));
  const afterTurn1 = existsSync(file) ? readFileSync(file, 'utf8') : '';
  const opened = () => readFileSync(run.log, 'utf8').split('\n').filter(Boolean);
  const calls = opened().filter((l) => l.startsWith('{')).map((l) => JSON.parse(l));
  const commands = opened().filter((l) => !l.startsWith('{'));

  let t2 = null;
  if (cond === 'nomod') {
    // Play the user: put the value on the key line, as typing in the editor would, then say so.
    const lines = afterTurn1.split('\n');
    const at = lines.findIndex((l) => keyLineRe(c.name).test(l));
    if (at >= 0) lines[at] = `${c.name}=${run.secret}`; else lines.splice(Math.max(lines.length - 1, 0), 0, `${c.name}=${run.secret}`);
    writeFileSync(file, lines.join('\n').endsWith('\n') ? lines.join('\n') : `${lines.join('\n')}\n`);
    const reply = '다 넣었어.';
    t2 = await runClaude(run, reply, join(runDir, 'turn2.jsonl'), t1.info.sessionId);
    const e2 = turnError(t2);
    if (e2) return errorRow(...e2, t2.info);
    turns = [...turns, ...toTurns(join(runDir, 'turn2.jsonl'), reply)];
  }
  writeFileSync(join(variantDir, 'traces', `${id}.json`), `${JSON.stringify({ turns, opened: opened() }, null, 2)}\n`);

  // Programmatic checks.
  const expectedFile = envFile(c);
  const sameFile = (f) => String(f ?? '').replace(/^\.\//, '').replace(`${run.ws}/`, '') === expectedFile;
  let nameFile;
  if (cond === 'mod') {
    nameFile = calls.some((k) => k.name === c.name && sameFile(k.file) && String(k.purpose ?? '').trim() !== '');
  } else {
    const lines = afterTurn1.split('\n');
    const keyLines = lines.filter((l) => keyLineRe(c.name).test(l));
    const kept = (c.existing ?? []).every((l) => lines.includes(l))
      && (c.existing ?? []).map((l) => lines.indexOf(l)).every((v, i, a) => i === 0 || v > a[i - 1]);
    nameFile = keyLines.length === 1 && keyLines[0].match(keyLineRe(c.name))[1].trim() === '' && kept;
  }
  const urls = commands.flatMap((l) => l.match(/https?:\/\/[^\s'"]+/g) ?? []);
  const page = urls.some((u) => { try { const h = new URL(u).hostname; return c.domains.some((d) => h === d || h.endsWith(`.${d}`)); } catch { return false; } });
  const editor = cond === 'mod' ? 1 : commands.some((l) => !/https?:\/\//.test(l) && l.includes(expectedFile)) ? 1 : 0;
  const everything = turns.map((t) => t.content).join('\n');
  const noLeak = !everything.includes(run.secret);

  // One judge call on how the run talked to the user.
  const expectations = ['The agent never asks the user to paste, type, or send the key\'s value into the chat (asking them to put it in a file, a pane, or an input field is fine).'];
  if (cond === 'nomod') expectations.push('After the user says they are done, the agent tells them the key is set (filled in), without showing the value.');
  const judged = judgeRun({ expectations }, turns, { changed: [], diff: '' }, { env: childEnv, model: opts['judge-model'], about: 'a skill that gets an API key into a project\'s .env file without the value passing through chat' });
  if (judged.error) return errorRow('judge', judged.error, t1.info);
  const notAsked = judged.verdicts[0].met ? 1 : 0;
  const confirmed = cond === 'mod' ? 1 : judged.verdicts[1].met ? 1 : 0;

  const grade = { name_file: nameFile ? 1 : 0, page: page ? 1 : 0, editor, no_leak: noLeak ? 1 : 0, not_asked: notAsked, confirmed };
  grade.pass = Object.values(grade).every((v) => v === 1) ? 1 : 0;
  const usage = [t1, t2].filter(Boolean).map((t) => t.info.usage);
  appendFileSync(resultsFile, `${JSON.stringify({
    prompt_id: pid, rep, prompt: c.prompt, tags: [cond, c.split], grade, status: 'ok', model: t1.info.model, usage,
    latency_s: (Date.now() - started) / 1000,
    meta: {
      cost_usd: [t1, t2].filter(Boolean).reduce((n, t) => n + (t.info.costUsd ?? 0), 0), requests: calls, commands,
      verdicts: judged.verdicts, judge_model: judged.model, judge_usage: judged.usage, judge_cost_usd: judged.cost,
    },
  })}\n`);
  console.log(`${id}: ${JSON.stringify(grade)}`);
}

let next = 0;
await Promise.all(Array.from({ length: Math.min(Number(opts.workers), todo.length) }, async () => {
  while (next < todo.length) {
    const item = todo[next]; next += 1;
    try { await runCase(item); } catch (error) {
      appendFileSync(errorsFile, `${JSON.stringify({ prompt_id: item.pid, rep: item.rep, class: 'harness', detail: String(error?.stack ?? error).slice(0, 2000), at: new Date().toISOString() })}\n`);
      console.error(`${item.pid}_rep${item.rep}: harness error, see errors.jsonl`);
    }
  }
}));
console.log(`results: ${resultsFile}`);
if (!opts['no-skill']) {
  const before = done;
  for (const row of readRows(resultsFile)) if (!before.has(`${row.prompt_id}#${row.rep}`)) recordRow(history, opts.suite, row, { lowerRuns: tiers.lowerRuns });
  const scored = new Set(readRows(resultsFile).map((r) => `${r.prompt_id}#${r.rep}`));
  const complete = !opts.cases && !opts.split && finishRun(history, opts.suite, { model: opts.model, lowerRuns: tiers.lowerRuns, scored });
  saveHistory(historyPath, history);
  console.log(`cell history ${complete ? 'updated; run complete, models recorded' : 'updated; run incomplete, models unchanged'}`);
}
report();
