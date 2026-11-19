#!/usr/bin/env node
// Runner for explain-visually's evals in the llm-evals layout. This folder is the skill's eval root.
// Each run copies this repository at a fixed ref (without skill-evals/) into a disposable workspace,
// installs the explain-visually text under test, and asks headless Claude Code one /explain-visually
// question, optionally with an output style selected. The only MCP server is render-mcp.mjs, a stand-in for the desktop app's inline renderer
// (read_me, show_widget), so the agent has the same interactive renderer the user sees. Every widget
// it shows is captured by capture.mjs before any input, and the suite's grade.mjs scores the run.
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  appendFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { finishRun, loadHistory, planTiers, recordRow, saveHistory } from '../audit-evals/history.mjs';
import { captureWidget, chrome } from './capture.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');
const skillPath = relative(repoRoot, join(realpathSync(join(repoRoot, '.claude/skills/explain-visually')), 'SKILL.md'));
const usage = `usage: run.mjs --variant <label> --access api|subscription [options]
  --skill-ref <git-ref>   take explain-visually's SKILL.md from this ref
  --skill-file <path>     take SKILL.md from this file (default: the working tree's)
  --style <path>          select this output style file in the workspace (default: none, or the suite's run.json)
  --slash                 prefix each prompt with /explain-visually unless it already starts with it
  --repo-ref <git-ref>    the repository snapshot the agent explains (default: 4ac28d2)
  --suite <name>          a capability eval folder here or a suite under regression/ (default: explain-visually-first-view)
  --split train|test|control|all   which split to run (default: all)
  --cases a,b             run only these case ids
  --reps <n>              runs per case (default: 2; a regression suite runs at its recorded reps)
  --workers <n>           runs in parallel (default: 4)
  --model <id>            agent model (default: claude-sonnet-5-5)
  --judge-model <id>      judge model (default: claude-opus-5-5)
  --flow <dir>            results folder (default: .claude/hillclimb/explain-visually/<suite>/<model>)
  --timeout-s <n>         wall-clock ceiling per run (default: 600)
  --max-budget-usd <n>    per-run budget passed to claude (default: 3)
  --keep-workspaces       keep each run's workspace for inspection
  --dry-run               print the resolved scope and stop`;

const { values: opts } = parseArgs({
  options: {
    variant: { type: 'string' },
    access: { type: 'string' },
    'skill-ref': { type: 'string' },
    'skill-file': { type: 'string' },
    style: { type: 'string' },
    slash: { type: 'boolean', default: false },
    'repo-ref': { type: 'string', default: '4ac28d2' },
    suite: { type: 'string', default: 'explain-visually-first-view' },
    split: { type: 'string', default: 'all' },
    cases: { type: 'string' },
    reps: { type: 'string' },
    workers: { type: 'string', default: '4' },
    model: { type: 'string', default: 'claude-sonnet-5-5' },
    'judge-model': { type: 'string', default: 'claude-opus-5-5' },
    flow: { type: 'string' },
    'timeout-s': { type: 'string', default: '600' },
    'max-budget-usd': { type: 'string', default: '3' },
    'keep-workspaces': { type: 'boolean', default: false },
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
if (opts['skill-ref'] && opts['skill-file']) fail('pass --skill-ref or --skill-file, not both');
if (opts.model === opts['judge-model']) fail('the judge must be a different model from the agent under test');

const suiteDir = [join(here, opts.suite), join(here, 'regression', opts.suite)].find((d) => existsSync(join(d, 'cases.jsonl')));
if (!suiteDir) fail(`unknown suite: ${opts.suite}`);
let cases = readFileSync(join(suiteDir, 'cases.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
if (opts.split !== 'all') cases = cases.filter((c) => c.split === opts.split);
if (opts.cases) {
  const wanted = opts.cases.split(',').map((c) => c.trim());
  for (const id of wanted) if (!cases.some((c) => c.id === id)) fail(`unknown case in ${opts.suite}: ${id}`);
  cases = cases.filter((c) => wanted.includes(c.id));
}
let history = null;
let tiers = null;
const historyPath = join(here, 'regression', 'cell-history.json');
const regressionSuite = suiteDir === join(here, 'regression', opts.suite);
// A graduated suite records how it runs: the output style it selects and whether it asks through /explain-visually.
// A run whose style or way of asking differs from run.json measures another condition and records nothing.
const how = regressionSuite && existsSync(join(suiteDir, 'run.json')) ? JSON.parse(readFileSync(join(suiteDir, 'run.json'), 'utf8')) : {};
const suiteStyle = how.style ? join(repoRoot, how.style) : undefined;
const overridden = (opts.style !== undefined && resolve(opts.style) !== suiteStyle) || (opts.slash && !how.slash);
if (suiteStyle && !opts.style) opts.style = suiteStyle;
if (how.slash) opts.slash = true;
if (regressionSuite) {
  history = loadHistory(historyPath);
  tiers = planTiers(history, opts.suite, opts.model);
  cases = cases.filter((c) => tiers.runsCase(c.id));
  const own = history.suites[opts.suite].reps;
  if (opts.reps !== undefined && Number(opts.reps) !== own) fail(`${opts.suite} runs at ${own} reps, as recorded in its cell history; drop --reps or pass ${own}`);
}
const reps = history ? history.suites[opts.suite].reps : Number(opts.reps ?? 2);
const recording = history && !opts['skill-ref'] && !opts['skill-file'] && !overridden;
const workers = Number(opts.workers);
const timeoutMs = Number(opts['timeout-s']) * 1000;
const { gradeRun, goal: suiteGoal, metrics: suiteMetrics } = await import(join(suiteDir, 'grade.mjs'));

let skillText;
let skillSource;
if (opts['skill-ref']) {
  const shown = spawnSync('git', ['-C', repoRoot, 'show', `${opts['skill-ref']}:${skillPath}`], { encoding: 'utf8' });
  if (shown.status !== 0) fail(`cannot read explain-visually SKILL.md at ${opts['skill-ref']}: ${shown.stderr.trim()}`);
  skillText = shown.stdout;
  const sha = spawnSync('git', ['-C', repoRoot, 'rev-parse', '--short', opts['skill-ref']], { encoding: 'utf8' }).stdout.trim();
  skillSource = `git ${opts['skill-ref']} (${sha})`;
} else {
  const file = resolve(opts['skill-file'] ?? join(repoRoot, skillPath));
  skillText = readFileSync(file, 'utf8');
  skillSource = `file ${file}`;
}
// An output style is selected by the name in its frontmatter, so the workspace file carries that name.
const styleText = opts.style ? readFileSync(resolve(opts.style), 'utf8') : null;
const styleName = styleText?.match(/^name:\s*(\S+)/m)?.[1] ?? null;
if (styleText && !styleName) fail(`--style ${opts.style} has no name in its frontmatter`);
const askedWith = (prompt) => (opts.slash && !prompt.startsWith('/explain-visually') ? `/explain-visually ${prompt}` : prompt);
// A variant is one skill text, one style (or none), and one way of asking.
const skillSha = createHash('sha256').update(skillText).update(`\0style:${styleText ?? ''}\0slash:${opts.slash}`).digest('hex').slice(0, 12);
const repoSha = spawnSync('git', ['-C', repoRoot, 'rev-parse', '--short', opts['repo-ref']], { encoding: 'utf8' }).stdout.trim();
if (!repoSha) fail(`unknown --repo-ref ${opts['repo-ref']}`);

const baseEnv = { ...process.env };
for (const k of ['GH_TOKEN', 'GITHUB_TOKEN', 'GH_ENTERPRISE_TOKEN']) delete baseEnv[k];
if (opts.access === 'api') {
  const common = spawnSync('git', ['-C', repoRoot, 'rev-parse', '--path-format=absolute', '--git-common-dir'], { encoding: 'utf8' }).stdout.trim();
  for (const file of [join(repoRoot, '.env.local'), common && join(dirname(common), '.env.local')].filter(Boolean)) {
    if (baseEnv.ANTHROPIC_API_KEY || !existsSync(file)) continue;
    const m = readFileSync(file, 'utf8').match(/^\s*ANTHROPIC_API_KEY\s*=\s*['"]?([^'"\n]+)/m);
    if (m) baseEnv.ANTHROPIC_API_KEY = m[1];
  }
  if (!baseEnv.ANTHROPIC_API_KEY) { console.error('API access needs ANTHROPIC_API_KEY in the environment or .env.local.'); process.exit(3); }
} else {
  delete baseEnv.ANTHROPIC_API_KEY;
  delete baseEnv.ANTHROPIC_AUTH_TOKEN;
}

const flowDir = resolve(opts.flow ?? join(repoRoot, '.claude/hillclimb/explain-visually', opts.suite, opts.model));
const variantDir = join(flowDir, opts.variant);
const resultsFile = join(variantDir, 'results.jsonl');
const errorsFile = join(variantDir, 'errors.jsonl');
const readRows = (file) => (existsSync(file) ? readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []);

const stateFile = join(flowDir, '_state.json');
if (existsSync(stateFile)) {
  const state = JSON.parse(readFileSync(stateFile, 'utf8'));
  for (const [key, value] of [['access', opts.access], ['model', opts.model], ['judge_model', opts['judge-model']], ['repo_ref', repoSha]]) {
    if (state[key] !== value) { console.error(`this flow runs with ${key} ${state[key]}; use the same or another --flow.`); process.exit(2); }
  }
}
const summaryFile = join(variantDir, 'summary.json');
if (existsSync(summaryFile)) {
  const previous = JSON.parse(readFileSync(summaryFile, 'utf8'));
  if (previous.skill_sha !== skillSha) { console.error(`${opts.variant} already holds runs of skill sha ${previous.skill_sha}; this run is ${skillSha}. Use a new variant.`); process.exit(2); }
}
const done = new Set(readRows(resultsFile).map((r) => `${r.prompt_id}#${r.rep}`));
const todo = [];
for (let rep = 0; rep < reps; rep += 1) for (const c of cases) if (!done.has(`${c.id}#${rep}`)) todo.push({ c, rep });

console.log(`variant ${opts.variant}: explain-visually from ${skillSource}, style ${opts.style ?? 'none'}${opts.slash ? ', asked with /explain-visually' : ''} (sha ${skillSha}); repository at ${repoSha}`);
console.log(`access ${opts.access}, model ${opts.model}, judge ${opts['judge-model']}; suite ${opts.suite} (${opts.split}): ${cases.length} cases × ${reps} reps; ${done.size} done, ${todo.length} to run`);

function report() {
  const wanted = new Set(cases.map((c) => c.id));
  const rows = readRows(resultsFile).filter((r) => wanted.has(r.prompt_id));
  if (!rows.length) return;
  for (const split of [...new Set(rows.map((r) => r.split))]) {
    const part = rows.filter((r) => r.split === split);
    const passed = part.filter((r) => r.grade.pass === 1).length;
    const byCase = new Map();
    for (const r of part) byCase.set(r.prompt_id, [...(byCase.get(r.prompt_id) ?? []), r.grade.pass]);
    const unstable = [...byCase].filter(([, p]) => !p.every((x) => x === 1)).map(([id, p]) => `${id}(${p.join('')})`);
    console.log(`${split}: pass ${passed}/${part.length} (${Math.round((100 * passed) / part.length)}%, ±${Math.round(100 / Math.sqrt(part.length))}); not every rep: ${unstable.join(' ') || 'none'}`);
  }
  const cost = rows.reduce((n, r) => n + (r.meta?.cost_usd ?? 0) + (r.meta?.judge_cost_usd ?? 0), 0);
  console.log(`errors ${readRows(errorsFile).length}, API-equivalent cost $${cost.toFixed(2)}`);
}
if (opts['dry-run'] || todo.length === 0) { report(); process.exit(0); }
// Every trial is captured in Chrome; stop before paying for any trial when it cannot run.
if (!existsSync(chrome)) { console.error(`Chrome not found at ${chrome}; set EV_CHROME to a Chrome or Chromium executable.`); process.exit(3); }

mkdirSync(join(variantDir, 'traces'), { recursive: true });
if (!existsSync(summaryFile)) {
  writeFileSync(summaryFile, `${JSON.stringify({ description: `explain-visually from ${skillSource}, style ${opts.style ?? 'none'}`, target: 'skill', skill_source: skillSource, style: opts.style ?? null, slash: opts.slash, skill_sha: skillSha, access: opts.access }, null, 2)}\n`);
}
if (!existsSync(stateFile)) {
  const all = readFileSync(join(suiteDir, 'cases.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
  writeFileSync(stateFile, `${JSON.stringify({
    goal: suiteGoal ?? 'first-view rule in docs/decisions/explain-visually.md: held-out first-view pass rate at 80% or more and above the baseline outside the noise floor; controls at or above their baseline',
    suite: opts.suite,
    train: all.filter((c) => c.split === 'train').map((c) => c.id),
    test: all.filter((c) => c.split === 'test').map((c) => c.id),
    control: all.filter((c) => c.split === 'control').map((c) => c.id),
    access: opts.access, model: opts.model, judge_model: opts['judge-model'], repo_ref: repoSha,
    metrics: suiteMetrics ?? [
      { id: 'first-view', kind: 'float', label: 'First view shows every stage and the direction (staged cases)' },
      { id: 'rendered', kind: 'float', label: 'Rendered at least once' },
      { id: 'restrained', kind: 'float', label: 'Answered in prose without drawing (restraint controls)' },
    ],
  }, null, 2)}\n`);
}

const listFiles = (root) => {
  const found = [];
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      if (name === '.git' || name === 'node_modules') continue;
      const p = join(d, name);
      const st = statSync(p, { throwIfNoEntry: false });
      if (!st) continue;
      if (st.isDirectory()) walk(p); else found.push(relative(root, p));
    }
  };
  walk(root);
  return found;
};

function prepareWorkspace(id) {
  // Outside any .claude/ folder: headless Claude Code denies writes under one.
  const ws = realpathSync(mkdtempSync(join(tmpdir(), `ev-${opts.variant}-${id}-`)));
  const work = join(ws, 'repo');
  mkdirSync(work);
  const archive = spawnSync('sh', ['-c', `git -C "${repoRoot}" archive ${repoSha} | tar -x -C "${work}"`], { encoding: 'utf8' });
  if (archive.status !== 0) throw new Error(`git archive failed: ${archive.stderr}`);
  rmSync(join(work, 'skill-evals'), { recursive: true, force: true });
  for (const agentDir of ['.claude/skills', '.agents/skills']) {
    const link = join(work, agentDir, 'explain-visually');
    rmSync(link, { recursive: true, force: true });
    mkdirSync(link, { recursive: true });
    writeFileSync(join(link, 'SKILL.md'), skillText);
  }
  // Each skill's published copy too, so a read through skills/ sees the same text.
  writeFileSync(join(work, skillPath), skillText);
  if (styleText) {
    const styleDir = join(work, '.claude/output-styles');
    mkdirSync(styleDir, { recursive: true });
    rmSync(join(styleDir, `${styleName}.md`), { force: true });
    writeFileSync(join(styleDir, `${styleName}.md`), styleText);
  }
  spawnSync('git', ['init', '-q'], { cwd: work });
  spawnSync('git', ['add', '-A'], { cwd: work });
  spawnSync('git', ['-c', 'user.email=eval@example.com', '-c', 'user.name=eval', 'commit', '-qm', 'snapshot'], { cwd: work });
  const widgetDir = join(ws, 'widgets');
  mkdirSync(widgetDir);
  writeFileSync(join(ws, 'mcp.json'), `${JSON.stringify({ mcpServers: { visualize: { command: process.execPath, args: [join(here, 'render-mcp.mjs')], env: { EV_WIDGET_DIR: widgetDir } } } }, null, 2)}\n`);
  return { ws, work, widgetDir, before: new Set(listFiles(work)) };
}

function readStream(raw) {
  const info = { model: null, apiKeySource: null, outputStyle: null, mcpServers: [], resultSubtype: null, costUsd: null, usage: null, turns: null, permissionDenials: [], resultText: '' };
  for (const line of raw.split('\n')) {
    let event;
    try { event = JSON.parse(line); } catch { continue; }
    if (event.type === 'system' && event.subtype === 'init') {
      info.model = event.model; info.apiKeySource = event.apiKeySource; info.outputStyle = event.output_style ?? null;
      info.mcpServers = (event.mcp_servers ?? []).map((s) => ({ name: s.name, status: s.status }));
    }
    if (event.type === 'result') {
      info.resultSubtype = event.subtype; info.isError = event.is_error === true; info.apiErrorStatus = event.api_error_status ?? null;
      info.resultText = typeof event.result === 'string' ? event.result : ''; info.costUsd = event.total_cost_usd ?? null; info.usage = event.usage ?? null;
      info.turns = event.num_turns ?? null; info.permissionDenials = event.permission_denials ?? [];
    }
  }
  return info;
}

function runClaude({ ws, work }, prompt, rawFile) {
  const args = ['-p', prompt, '--setting-sources', 'project', '--output-format', 'stream-json', '--verbose',
    '--max-budget-usd', opts['max-budget-usd'], '--permission-mode', 'acceptEdits', '--model', opts.model,
    '--mcp-config', join(ws, 'mcp.json'), '--strict-mcp-config',
    '--settings', JSON.stringify({ ...(styleName ? { outputStyle: styleName } : {}), sandbox: { enabled: true, autoAllowBashIfSandboxed: true, allowUnsandboxedCommands: false, filesystem: { allowWrite: [work] }, network: { allowedDomains: [], strictAllowlist: true } } }),
    // Only local tools: a headless session otherwise offers Artifact, WebSearch, and other tools that reach outside.
    '--tools', 'Read,Edit,Write,Glob,Grep,Skill,Bash,ToolSearch',
    '--allowedTools', 'Read', 'Edit', 'Write', 'Glob', 'Grep', 'Skill', 'Bash', 'ToolSearch', 'mcp__visualize'];
  return new Promise((settle) => {
    const child = spawn('claude', args, { cwd: work, env: baseEnv, stdio: ['ignore', 'pipe', 'pipe'] });
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
        if (p.type === 'tool_use') turns.push({ role: 'tool_call', name: p.name, content: JSON.stringify(p.input, null, 2).slice(0, 40_000) });
      }
    } else if (e.type === 'user') {
      for (const p of e.message?.content ?? []) {
        if (p.type === 'tool_result') {
          const text = typeof p.content === 'string' ? p.content : (p.content ?? []).map((x) => x.text ?? '').join('\n');
          turns.push({ role: 'tool_result', content: text.slice(0, 10_000) });
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
  const place = prepareWorkspace(id);
  writeFileSync(join(runDir, 'workspace.txt'), `${place.ws}\n`);
  const started = Date.now();
  const errorRow = (cls, detail, info) => appendFileSync(errorsFile, `${JSON.stringify({
    prompt_id: c.id, rep, class: cls, detail, workspace: place.ws, model: info?.model ?? null, usage: info?.usage ?? null, at: new Date().toISOString(),
  })}\n`);

  const rawFile = join(runDir, 'turn1.jsonl');
  const prompt = askedWith(c.prompt);
  const t = await runClaude(place, prompt, rawFile);
  if (t.timedOut) return errorRow('timeout', 'turn 1', t.info);
  if (t.info.resultSubtype !== 'success') return errorRow('harness', `result ${t.info.resultSubtype}: ${t.stderr.slice(0, 300)}`, t.info);
  if (t.info.isError) return errorRow('api-error', `status ${t.info.apiErrorStatus}: ${t.info.resultText.slice(0, 300)}`, t.info);
  if (!t.info.model?.startsWith(opts.model)) return errorRow('served-model-mismatch', `asked ${opts.model}, served ${t.info.model}`, t.info);
  const expectedKey = opts.access === 'api' ? 'ANTHROPIC_API_KEY' : 'none';
  if (t.info.apiKeySource !== expectedKey) return errorRow('access-mismatch', `key source ${t.info.apiKeySource}`, t.info);
  if (t.info.outputStyle !== (styleName ?? 'default')) return errorRow('harness', `output style ${t.info.outputStyle}, wanted ${styleName ?? 'default'}`, t.info);
  const servers = t.info.mcpServers;
  if (servers.some((s) => s.name !== 'visualize') || !servers.some((s) => s.name === 'visualize' && s.status === 'connected')) {
    return errorRow('harness', `MCP servers: ${servers.map((s) => `${s.name} ${s.status}`).join(', ') || 'none'}`, t.info);
  }
  const deniedWrites = t.info.permissionDenials.filter((d) => /^(Write|Edit|MultiEdit)$/.test(d.tool_name));
  if (deniedWrites.length) return errorRow('harness', `file writes denied: ${deniedWrites.map((d) => d.tool_input?.file_path).join(', ')}`, t.info);
  const latency = (Date.now() - started) / 1000;

  const turns = toTurns(rawFile, prompt);
  writeFileSync(join(variantDir, 'traces', `${id}.json`), `${JSON.stringify(turns, null, 2)}\n`);
  const reply = turns.filter((x) => x.role === 'assistant').map((x) => x.content).join('\n\n');

  // Captures: every widget shown, then every HTML or SVG page the run wrote into the repository.
  const profile = join(place.ws, 'chrome-profile');
  const widgets = [];
  for (const f of readdirSync(place.widgetDir).filter((n) => /^\d+\.(html|svg)$/.test(n)).sort()) {
    const base = join(runDir, `widget-${f.replace(/\.\w+$/, '')}`);
    widgets.push({ file: f, png: await captureWidget(join(place.widgetDir, f), base, profile), source: readFileSync(join(place.widgetDir, f), 'utf8') });
  }
  const pages = [];
  for (const f of listFiles(place.work).filter((p) => !place.before.has(p) && /\.(html|svg)$/.test(p))) {
    const base = join(runDir, `page-${f.replace(/[^\w.-]/g, '_')}`);
    pages.push({ file: f, png: await captureWidget(join(place.work, f), base, profile, { baseDir: dirname(join(place.work, f)) }), source: readFileSync(join(place.work, f), 'utf8') });
  }

  const graded = await gradeRun({ ...c, prompt }, { reply, widgets, pages }, { env: baseEnv, model: opts['judge-model'] });
  if (graded.error) return errorRow('judge', graded.error, t.info);
  appendFileSync(resultsFile, `${JSON.stringify({
    prompt_id: c.id, rep, prompt, tags: c.tags, split: c.split, grade: graded.grade, status: 'ok', stop_reason: t.info.resultSubtype,
    model: t.info.model, usage: t.info.usage, turns: t.info.turns, latency_s: latency,
    meta: {
      cost_usd: t.info.costUsd, widgets: widgets.map((w) => w.file), pages: pages.map((p) => p.file), notes: graded.notes,
      judge: graded.judge?.verdict ?? null, judge_model: graded.judge?.model ?? null, judge_usage: graded.judge?.usage ?? null, judge_cost_usd: graded.judge?.cost ?? null,
    },
  })}\n`);
  if (recording) {
    recordRow(history, opts.suite, { prompt_id: c.id, grade: { [c.check]: graded.grade.pass } }, { lowerRuns: tiers.lowerRuns });
    saveHistory(historyPath, history);
  }
  if (!opts['keep-workspaces']) rmSync(place.ws, { recursive: true, force: true });
  console.log(`${id}: pass=${graded.grade.pass} ${c.check} widgets=${widgets.length} pages=${pages.length} ${latency.toFixed(0)}s — ${graded.notes.slice(0, 160)}`);
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
}
report();
