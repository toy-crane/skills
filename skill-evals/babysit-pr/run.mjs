#!/usr/bin/env node
// Runner for the PR-flow skills' evals.json: babysit-pr and self-ship, and the
// implement, merge, and pr cases their specs (docs/specs/pr-flow-babysit/,
// docs/specs/pr-flow-self-ship/) must not regress.
// Each case runs `claude -p` in a disposable git workspace outside any .claude/
// folder. A case whose fixture holds a case.json gets a replayed GitHub: a
// local bare remote behind https://github.com/<repo>.git and replay/gh on PATH,
// which serves the PR's stages and records every write. A judge model then
// rules on each expectation from the transcript, the diff against the
// original head, the pushed commits, and the recorded GitHub writes.
//   node run.mjs --skill babysit-pr --variant baseline --no-skill --access subscription
//   node run.mjs --skill merge --variant baseline --skill-ref 401037b --access subscription
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  appendFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { judgeRun, scoreJudged } from '../llm-evals/judge.mjs';
import { finishRun, loadHistory, planTiers, recordRow, saveHistory } from '../audit-evals/history.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');
const usage = `usage: run.mjs --skill <name> --variant <label> --access api|subscription [options]
  --suite <folder>        run the graduated regression suite skill-evals/<skill>/regression/<folder>/
                          instead of evals.json, at its recorded reps, and update its cell history
  --skill-ref <git-ref>   take every published skill from this ref (default: the working tree)
  --no-skill              install no skill at all (the baseline for a new skill)
  --cases 1,2             run only these case ids
  --split train|test      run only cases of this split
  --reps <n>              runs per case (default: 2)
  --workers <n>           runs in parallel (default: 4)
  --model <id>            agent model (default: claude-opus-5-5)
  --judge-model <id>      judge model (default: claude-sonnet-5-5)
  --flow <dir>            flow folder (default: .claude/hillclimb/pr-flow-babysit/<skill>)
  --timeout-s <n>         wall-clock ceiling per run (default: 900)
  --max-budget-usd <n>    per-run budget passed to claude (default: 3)
  --dry-run               print the resolved scope and stop
  --prepare <id>          build one case's workspace, print its path, and stop`;

const { values: opts } = parseArgs({
  options: {
    skill: { type: 'string' },
    suite: { type: 'string' },
    variant: { type: 'string' },
    access: { type: 'string' },
    'skill-ref': { type: 'string' },
    'no-skill': { type: 'boolean', default: false },
    cases: { type: 'string' },
    split: { type: 'string' },
    reps: { type: 'string', default: '2' },
    workers: { type: 'string', default: '4' },
    model: { type: 'string', default: 'claude-opus-5-5' },
    'judge-model': { type: 'string', default: 'claude-sonnet-5-5' },
    flow: { type: 'string' },
    'timeout-s': { type: 'string', default: '900' },
    'max-budget-usd': { type: 'string', default: '3' },
    'dry-run': { type: 'boolean', default: false },
    prepare: { type: 'string' },
    help: { type: 'boolean', default: false },
  },
});
function fail(message) {
  console.error(`${message}\n\n${usage}`);
  process.exit(2);
}
if (opts.help) { console.log(usage); process.exit(0); }
const SKILL = opts.skill;
if (!SKILL || !existsSync(join(repoRoot, 'skill-evals', SKILL, 'evals.json'))) fail('--skill needs a skill with skill-evals/<name>/evals.json');
if (!/^[\w.-]+$/.test(opts.variant ?? '')) fail('--variant needs a label such as baseline or v1');
if (!['api', 'subscription'].includes(opts.access)) fail('--access must be api or subscription');
if (opts.model === opts['judge-model']) fail('the judge must be a different model from the agent under test');

const evalRoot = join(repoRoot, 'skill-evals', SKILL);
const historyPath = join(evalRoot, 'regression', 'cell-history.json');
const history = opts.suite ? loadHistory(historyPath) : null;
if (opts.suite && !history.suites[opts.suite]) fail(`no suite ${opts.suite} in ${historyPath}`);
const caseSource = opts.suite
  ? readFileSync(join(evalRoot, 'regression', opts.suite, 'cases.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))
  : JSON.parse(readFileSync(join(evalRoot, 'evals.json'), 'utf8')).evals;
let cases = caseSource.map((e) => ({
  id: `${SKILL}-${e.id}`, tags: [e.split ?? (e.new ? 'new' : 'existing')],
  // A new skill's baseline takes the same request in words, since its command does not exist without the skill.
  prompt: opts['no-skill'] && e.baseline_prompt ? e.baseline_prompt : e.prompt, expectations: e.expectations,
  fixture: e.fixture ?? e.files?.[0]?.match(/^fixtures\/([^/]+)\//)?.[1] ?? null,
}));
if (opts.cases) {
  const wanted = opts.cases.split(',').map((c) => `${SKILL}-${c.trim()}`);
  for (const id of wanted) if (!cases.some((c) => c.id === id)) fail(`unknown case: ${id}`);
  cases = cases.filter((c) => wanted.includes(c.id));
}
if (opts.split) cases = cases.filter((c) => c.tags[0] === opts.split);
// A regression run takes its tiers from the cell history and runs at the reps its level was reached at.
const tiers = history ? planTiers(history, opts.suite, opts.model) : null;
if (tiers) cases = cases.filter((c) => tiers.runsCase(c.id));
const reps = history ? history.suites[opts.suite].reps : Number(opts.reps);
const workers = Number(opts.workers);
const timeoutMs = Number(opts['timeout-s']) * 1000;

// The skills under test: every published skill from a ref or the working tree.
let skillsRoot = join(repoRoot, 'skills');
let skillSource = 'working tree';
if (opts['skill-ref']) {
  const root = mkdtempSync(join(tmpdir(), 'pr-flow-ref-'));
  const archive = spawnSync('sh', ['-c', `git -C "${repoRoot}" archive "${opts['skill-ref']}" skills | tar -x -C "${root}"`], { encoding: 'utf8' });
  if (archive.status !== 0) fail(`cannot read skills/ at ${opts['skill-ref']}: ${archive.stderr.trim()}`);
  skillsRoot = join(root, 'skills');
  skillSource = `git ${opts['skill-ref']}`;
}
if (opts['no-skill']) skillSource = 'no skill';
const skillFolders = new Map();
if (!opts['no-skill']) {
  for (const group of readdirSync(skillsRoot)) {
    for (const name of readdirSync(join(skillsRoot, group))) {
      if (existsSync(join(skillsRoot, group, name, 'SKILL.md'))) skillFolders.set(name, join(skillsRoot, group, name));
    }
  }
  if (!skillFolders.has(SKILL)) fail(`${SKILL} is not published in ${skillSource}`);
}
const skillText = opts['no-skill'] ? '' : readFileSync(join(skillFolders.get(SKILL), 'SKILL.md'), 'utf8');
const skillSha = opts['no-skill'] ? 'none' : createHash('sha256').update(skillText).digest('hex').slice(0, 12);

const childEnv = { ...process.env };
if (opts.access === 'api') {
  // Like merge's runner, read the key from the untracked .env.local when the environment has none.
  if (!childEnv.ANTHROPIC_API_KEY && existsSync(join(repoRoot, '.env.local'))) {
    const m = readFileSync(join(repoRoot, '.env.local'), 'utf8').match(/^\s*ANTHROPIC_API_KEY\s*=\s*['"]?([^'"\n]+)/m);
    if (m) childEnv.ANTHROPIC_API_KEY = m[1];
  }
  if (!childEnv.ANTHROPIC_API_KEY) { console.error('API access needs ANTHROPIC_API_KEY in the environment or .env.local.'); process.exit(3); }
} else {
  delete childEnv.ANTHROPIC_API_KEY;
  delete childEnv.ANTHROPIC_AUTH_TOKEN;
}

const flowDir = resolve(opts.flow ?? join(repoRoot, '.claude/hillclimb/pr-flow-babysit', SKILL));
const setDir = join(flowDir, opts.variant);
const resultsFile = join(setDir, 'results.jsonl');
const errorsFile = join(setDir, 'errors.jsonl');
const readRows = (file) => (existsSync(file) ? readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []);

const stateFile = join(flowDir, '_state.json');
if (existsSync(stateFile)) {
  const state = JSON.parse(readFileSync(stateFile, 'utf8'));
  if (state.access !== opts.access) { console.error(`this flow runs on ${state.access}; use the same access or another --flow.`); process.exit(2); }
  if (state.model !== opts.model) { console.error(`this flow runs on model ${state.model}; use the same --model or another --flow.`); process.exit(2); }
}
const summaryFile = join(setDir, 'summary.json');
if (existsSync(summaryFile)) {
  const previous = JSON.parse(readFileSync(summaryFile, 'utf8'));
  if (previous.skill_sha !== skillSha) { console.error(`${opts.variant} already holds runs of skill sha ${previous.skill_sha}; this run is ${skillSha}. Use a new variant.`); process.exit(2); }
}
const done = new Set(readRows(resultsFile).map((r) => `${r.prompt_id}#${r.rep}`));
const todo = [];
for (let rep = 0; rep < reps; rep += 1) for (const c of cases) if (!done.has(`${c.id}#${rep}`)) todo.push({ c, rep });

console.log(`variant ${opts.variant}: ${SKILL} from ${skillSource} (sha ${skillSha})`);
console.log(`access ${opts.access}, model ${opts.model}, judge ${opts['judge-model']}; ${cases.length} cases × ${reps} reps; ${done.size} done, ${todo.length} to run`);
function report() {
  const rows = readRows(resultsFile).filter((r) => cases.some((c) => c.id === r.prompt_id));
  if (!rows.length) return;
  for (const split of [...new Set(rows.map((r) => r.tags[0]))]) {
    const part = rows.filter((r) => r.tags[0] === split);
    const byCase = new Map();
    for (const r of part) byCase.set(r.prompt_id, [...(byCase.get(r.prompt_id) ?? []), r.grade.pass]);
    const steady = [...byCase.values()].filter((p) => p.length === reps && p.every(Boolean)).length;
    const share = part.reduce((n, r) => n + r.grade.expectations_met, 0) / part.length;
    console.log(`${split}: expectations met ${(100 * share).toFixed(1)}% over ${part.length} rows (±${(100 / Math.sqrt(part.length)).toFixed(0)} points), cases passing every rep ${steady}/${byCase.size}`);
    const unstable = [...byCase].filter(([, p]) => !p.every(Boolean)).map(([id, p]) => `${id}(${p.join('')})`);
    if (unstable.length) console.log(`  not every rep: ${unstable.join(' ')}`);
  }
  console.log(`errors: ${readRows(errorsFile).length}`);
}
if (opts.prepare) {
  // Build one case's workspace and print its path, for checking the replay by hand.
  const c = cases.find((x) => x.id === `${SKILL}-${opts.prepare}`) ?? fail(`unknown case ${opts.prepare}`);
  console.log(prepareWorkspace(c, 'prepare').ws);
  process.exit(0);
}
if (opts['dry-run'] || todo.length === 0) { report(); process.exit(0); }

mkdirSync(join(setDir, 'traces'), { recursive: true });
if (!existsSync(summaryFile)) {
  writeFileSync(summaryFile, `${JSON.stringify({ description: `${SKILL} from ${skillSource}`, target: 'skill', skill_source: skillSource, skill_sha: skillSha, access: opts.access }, null, 2)}\n`);
}
if (!existsSync(stateFile)) {
  const metrics = [{ id: 'pass', kind: 'float', label: 'Every expectation met' }, { id: 'expectations_met', kind: 'float', label: 'Share of expectations met' }];
  writeFileSync(stateFile, `${JSON.stringify({
    goal: `${SKILL} meets its PR-flow spec's eval criterion`, access: opts.access, model: opts.model, judge_model: opts['judge-model'], metrics,
  }, null, 2)}\n`);
}

function sh(cwd, ...cmd) { return spawnSync(cmd[0], cmd.slice(1), { cwd, encoding: 'utf8' }); }

function prepareWorkspace(c, id) {
  // Outside any .claude/ folder: headless Claude Code denies writes under one.
  const ws = mkdtempSync(join(tmpdir(), `${SKILL}-${opts.variant}-${id}-`));
  const fixtureDir = c.fixture ? join(evalRoot, 'fixtures', c.fixture) : null;
  const replay = fixtureDir && existsSync(join(fixtureDir, 'case.json'));
  if (replay) {
    const kase = JSON.parse(readFileSync(join(fixtureDir, 'case.json'), 'utf8'));
    const repoDir = resolve(fixtureDir, kase.repo_fixture ?? '../repo');
    // main holds the repository without the PR's change; the PR branch adds it.
    sh(ws, 'git', 'init', '-q', '-b', kase.pr?.base ?? 'main');
    // base_has_all: main already holds the whole repository and any overlay, and the work branch starts empty.
    cpSync(repoDir, ws, { recursive: true, filter: (src) => kase.base_has_all || !/\/(src|test|docs)(\/|$)/.test(src.slice(repoDir.length)) });
    if (kase.base_has_all && kase.overlay) cpSync(join(repoDir, '../overlays', kase.overlay), ws, { recursive: true });
    sh(ws, 'git', 'add', '-A');
    sh(ws, 'git', '-c', 'user.name=toy-crane', '-c', 'user.email=toy-crane@example.com', 'commit', '-q', '-m', `chore: start ${(kase.repo ?? 'toy-crane/prototype-compare').split('/')[1]}`);
    if (kase.pr) {
      sh(ws, 'git', 'checkout', '-q', '-b', kase.pr.head);
      if (!kase.base_has_all) {
        cpSync(repoDir, ws, { recursive: true });
        if (kase.overlay) cpSync(join(repoDir, '../overlays', kase.overlay), ws, { recursive: true });
        sh(ws, 'git', 'add', '-A');
        sh(ws, 'git', '-c', 'user.name=toy-crane', '-c', 'user.email=toy-crane@example.com', 'commit', '-q', '-m', kase.pr.commit ?? kase.pr.title);
      }
    }
    if (kase.remote !== false) {
      const bare = mkdtempSync(join(tmpdir(), `${SKILL}-remote-`));
      sh(bare, 'git', 'init', '-q', '--bare');
      const remoteUrl = `https://github.com/${kase.repo ?? 'toy-crane/prototype-compare'}.git`;
      sh(ws, 'git', 'remote', 'add', 'origin', remoteUrl);
      sh(ws, 'git', 'config', `url.${bare}.insteadOf`, remoteUrl);
      sh(ws, 'git', 'push', '-q', 'origin', '--all');
      sh(ws, 'git', 'fetch', '-q', 'origin');
      if (kase.pr) sh(ws, 'git', 'branch', '-q', '--set-upstream-to', `origin/${kase.pr.head}`);
    }
    mkdirSync(join(ws, '.replay'));
    mkdirSync(join(ws, 'bin'));
    writeFileSync(join(ws, '.replay/case.json'), JSON.stringify(kase));
    writeFileSync(join(ws, '.replay/head0'), sh(ws, 'git', 'rev-parse', 'HEAD').stdout);
    cpSync(join(here, 'replay/gh'), join(ws, 'bin/gh'));
    appendFileSync(join(ws, '.git/info/exclude'), '.replay/\nbin/\n.claude/\n');
  } else {
    if (fixtureDir) cpSync(fixtureDir, ws, { recursive: true });
    for (const step of [['init', '-q'], ['add', '-A'], ['-c', 'user.name=toy-crane', '-c', 'user.email=toy-crane@example.com', 'commit', '-q', '--allow-empty', '-m', 'fixture']]) sh(ws, 'git', ...step);
    appendFileSync(join(ws, '.git/info/exclude'), '.claude/\n');
  }
  for (const [name, source] of skillFolders) {
    cpSync(source, join(ws, '.claude/skills', name), { recursive: true, filter: (src) => !/\/agents(\/|$)/.test(src.slice(source.length)) });
  }
  return { ws, replay };
}

// What the run changed, read without the model under test.
function collect(ws, replay) {
  const git = (...a) => sh(ws, 'git', '-c', 'core.quotePath=false', ...a).stdout ?? '';
  const head0 = replay ? readFileSync(join(ws, '.replay/head0'), 'utf8').trim() : git('rev-list', '--max-parents=0', 'HEAD').trim();
  const changed = [...new Set([...git('diff', '--name-only', head0).split('\n'), ...git('ls-files', '--others', '--exclude-standard').split('\n')].filter(Boolean))];
  let diff = git('diff', head0).slice(0, 30_000);
  diff += `\n\nCommits since the original head:\n${git('log', '--oneline', `${head0}..HEAD`) || '(none)'}`;
  if (replay) {
    const branch = JSON.parse(readFileSync(join(ws, '.replay/case.json'), 'utf8')).pr?.head;
    if (branch) diff += `\nCommits pushed to origin/${branch} since the original head:\n${git('log', '--oneline', `${head0}..refs/remotes/origin/${branch}`) || '(none)'}`;
    const actionsFile = join(ws, '.replay/actions.jsonl');
    diff += `\n\nGitHub writes recorded by the gh CLI, in order:\n${existsSync(actionsFile) ? readFileSync(actionsFile, 'utf8').slice(0, 30_000) : '(none)'}`;
  }
  return { changed, diff };
}

function readStream(raw) {
  const info = { model: null, apiKeySource: null, resultSubtype: null, costUsd: null, usage: null, turns: null, permissionDenials: [] };
  for (const line of raw.split('\n')) {
    let event;
    try { event = JSON.parse(line); } catch { continue; }
    if (event.type === 'system' && event.subtype === 'init') { info.model = event.model; info.apiKeySource = event.apiKeySource; }
    if (event.type === 'result') {
      info.resultSubtype = event.subtype; info.costUsd = event.total_cost_usd ?? null; info.usage = event.usage ?? null;
      info.turns = event.num_turns ?? null; info.permissionDenials = event.permission_denials ?? [];
    }
  }
  return info;
}

function runClaude(ws, prompt, rawFile) {
  const args = ['-p', prompt, '--setting-sources', 'project', '--output-format', 'stream-json', '--verbose',
    '--max-budget-usd', opts['max-budget-usd'], '--permission-mode', 'acceptEdits', '--model', opts.model,
    // The workspace is disposable, gh is the replay, and origin is a local bare remote, so any shell command may run.
    '--allowedTools', 'Read', 'Edit', 'Write', 'Glob', 'Grep', 'Skill', 'Bash'];
  const env = { ...childEnv, PATH: `${join(ws, 'bin')}:${childEnv.PATH}` };
  return new Promise((settle) => {
    const child = spawn('claude', args, { cwd: ws, env, stdio: ['ignore', 'pipe', 'pipe'] });
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
  const { ws, replay } = prepareWorkspace(c, id);
  writeFileSync(join(runDir, 'workspace.txt'), `${ws}\n`);
  const started = Date.now();
  const errorRow = (cls, detail, info) => appendFileSync(errorsFile, `${JSON.stringify({
    prompt_id: c.id, rep, class: cls, detail, workspace: ws, model: info?.model ?? null, usage: info?.usage ?? null, at: new Date().toISOString(),
  })}\n`);
  const rawFile = join(runDir, 'turn1.jsonl');
  const t = await runClaude(ws, c.prompt, rawFile);
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
  const changes = collect(ws, replay);
  const about = `a request to work on a GitHub pull request or spec folder (the ${SKILL} skill may or may not be installed). GitHub was replayed by a local gh CLI that recorded every write; treat recorded writes as having happened on GitHub`;
  const judged = judgeRun(c, turns, changes, { env: childEnv, model: opts['judge-model'], about });
  if (judged.error) return errorRow('judge', judged.error, t.info);
  const scored = scoreJudged(judged);
  // One cell per expectation, so the regression suite's history can count each.
  judged.verdicts.forEach((v, i) => { scored.grade[`e${i}`] = v.met ? 1 : 0; });
  appendFileSync(resultsFile, `${JSON.stringify({
    prompt_id: c.id, rep, prompt: c.prompt, tags: c.tags, grade: scored.grade, status: 'ok', stop_reason: t.info.resultSubtype,
    model: t.info.model, usage: t.info.usage, turns: t.info.turns, latency_s: latency,
    meta: { cost_usd: t.info.costUsd, problems: scored.problems, changed: changes.changed, verdicts: judged.verdicts, judge_model: judged.model, judge_usage: judged.usage, judge_cost_usd: judged.cost },
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
if (history) {
  // Count only rows this invocation scored, then record the models once every owed run has a row.
  for (const row of readRows(resultsFile)) if (!done.has(`${row.prompt_id}#${row.rep}`)) recordRow(history, opts.suite, row, { lowerRuns: tiers.lowerRuns });
  const scoredNow = new Set(readRows(resultsFile).map((r) => `${r.prompt_id}#${r.rep}`));
  const complete = finishRun(history, opts.suite, { model: opts.model, lowerRuns: tiers.lowerRuns, scored: scoredNow });
  saveHistory(historyPath, history);
  console.log(`cell history ${complete ? 'updated; run complete, models recorded' : 'updated; run incomplete, models unchanged'}`);
}
