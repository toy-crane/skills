// Deterministic tests for how audit-evals' runner keeps regression/cell-history.json. No model is
// called: the runner tests put a fake `claude` first on PATH.
//   node --test skill-evals/audit-evals/test_history.mjs
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { finishRun, planTiers, recordRow } from './history.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const MODEL = 'claude-opus-5-5';

const cell = (tier, trials, passes, recent) => ({ tier, baseline: 'fail', trials, passes, recent });
function history({ lowerModel = MODEL } = {}) {
  return {
    version: 2,
    suites: {
      s: {
        reps: 2, last_run_model: MODEL, lower_tier_model: lowerModel,
        checks: { a: { grader: 'code' }, b: { grader: 'code' } },
        cells: {
          c1: { a: cell('upper', 12, 11, 'fppppppppp'), b: cell('lower', 3, 3, 'ppp') },
          c2: { a: cell('lower', 10, 10, 'pppppppppp'), b: cell('lower', 10, 10, 'pppppppppp') },
        },
      },
    },
  };
}
const row = (id, grade) => ({ prompt_id: id, rep: 0, grade, status: 'ok' });

test('a regression row adds a trial and appends to the recent window, dropping the oldest past 10', () => {
  const h = history();
  recordRow(h, 's', row('c1', { a: 0, b: 1 }), { model: MODEL, lowerRuns: false });
  assert.deepEqual(h.suites.s.cells.c1.a, cell('upper', 13, 11, 'pppppppppf'));
  recordRow(h, 's', row('c1', { a: 1, b: 1 }), { model: MODEL, lowerRuns: false });
  assert.deepEqual(h.suites.s.cells.c1.a, cell('upper', 14, 12, 'ppppppppfp'));
});

test('the lower tier runs only when the model differs from its last model', () => {
  const same = planTiers(history(), 's', MODEL);
  assert.equal(same.lowerRuns, false);
  assert.deepEqual(['c1', 'c2'].filter(same.runsCase), ['c1']);
  const h = history();
  recordRow(h, 's', row('c1', { a: 1, b: 1 }), { lowerRuns: false });
  // A lower-tier cell graded on the way does not count while its tier is not running.
  assert.deepEqual(h.suites.s.cells.c1.b, cell('lower', 3, 3, 'ppp'));

  const changed = planTiers(history(), 's', 'claude-opus-6');
  assert.equal(changed.lowerRuns, true);
  assert.deepEqual(['c1', 'c2'].filter(changed.runsCase), ['c1', 'c2']);
  const g = history();
  recordRow(g, 's', row('c2', { a: 0, b: 1 }), { lowerRuns: true });
  assert.deepEqual(g.suites.s.cells.c2.a, cell('lower', 11, 10, 'pppppppppf'));
  // Recording a row never records a model.
  assert.equal(g.suites.s.lower_tier_model, MODEL);
});

test('models are recorded only when every owed case has every repetition scored', () => {
  const lower = (scored) => { const h = history(); return [finishRun(h, 's', { model: 'claude-opus-6', lowerRuns: true, scored: new Set(scored) }), h.suites.s]; };
  let [done, s] = lower(['c1#0', 'c1#1', 'c2#0']);
  assert.equal(done, false);
  assert.equal(s.lower_tier_model, MODEL);
  assert.equal(s.last_run_model, MODEL);
  [done, s] = lower(['c1#0', 'c1#1', 'c2#0', 'c2#1']);
  assert.equal(done, true);
  assert.equal(s.lower_tier_model, 'claude-opus-6');
  assert.equal(s.last_run_model, 'claude-opus-6');
  // Upper tier only: c2 holds only lower cells, so c1 is all the run owes; the lower model stays.
  const h = history();
  assert.equal(finishRun(h, 's', { model: 'claude-opus-6', lowerRuns: false, scored: new Set(['c1#0', 'c1#1']) }), true);
  assert.equal(h.suites.s.last_run_model, 'claude-opus-6');
  assert.equal(h.suites.s.lower_tier_model, MODEL);
});

// A fake `claude` CLI: a successful run that writes nothing. FAKE_FAIL fails the case it names (the
// runner names each workspace after its case); FAKE_KILL_AT kills the runner on that invocation.
function fakeCli() {
  const dir = mkdtempSync(join(tmpdir(), 'fake-claude-'));
  const bin = join(dir, 'claude');
  writeFileSync(bin, `#!/usr/bin/env node
const fs = require('node:fs');
const n = Number(fs.existsSync(${JSON.stringify(join(dir, 'count'))}) ? fs.readFileSync(${JSON.stringify(join(dir, 'count'))}, 'utf8') : 0) + 1;
fs.writeFileSync(${JSON.stringify(join(dir, 'count'))}, String(n));
if (Number(process.env.FAKE_KILL_AT) === n) { process.kill(process.ppid, 'SIGKILL'); process.exit(1); }
const model = process.argv[process.argv.indexOf('--model') + 1];
const fail = process.env.FAKE_FAIL && process.cwd().includes(process.env.FAKE_FAIL);
console.log(JSON.stringify({ type: 'system', subtype: 'init', model, apiKeySource: 'none' }));
console.log(JSON.stringify({ type: 'assistant', message: { content: [{ type: 'text', text: 'done' }] } }));
console.log(JSON.stringify({ type: 'result', subtype: fail ? 'error_during_execution' : 'success', total_cost_usd: 0, usage: {}, num_turns: 1 }));
`);
  chmodSync(bin, 0o755);
  return dir;
}

const SUITE = 'eval-suite-audit-3';
const CASES = ['t2-b-early', 'h3-b-all'];
const NEW = 'claude-opus-6';

// Two graduated cases of the real suite at 2 reps; each has upper cells and one lower cell.
function smallHistory() {
  const dir = mkdtempSync(join(tmpdir(), 'cell-history-'));
  const path = join(dir, 'cell-history.json');
  const h = JSON.parse(readFileSync(join(here, 'regression/cell-history.json'), 'utf8'));
  const body = h.suites[SUITE];
  body.reps = 2;
  body.cells = Object.fromEntries(CASES.map((c) => [c, body.cells[c]]));
  writeFileSync(path, JSON.stringify(h));
  return { path, before: h };
}

const read = (path) => JSON.parse(readFileSync(path, 'utf8'));
const cellsOf = (h) => h.suites[SUITE].cells;
const suiteOf = (h) => h.suites[SUITE];

function runner(path, { variant = 'r1', model = MODEL, cases, flow, env = {}, extra = [] }) {
  const args = [join(here, 'run.mjs'), '--variant', variant, '--access', 'subscription', '--suite', SUITE, '--workers', '1',
    '--flow', flow, '--history', path, '--model', model, '--judge-model', 'claude-sonnet-5-5', ...extra];
  if (cases) args.push('--cases', cases);
  return spawnSync('node', args, { encoding: 'utf8', env: { ...process.env, PATH: `${fakeCli()}:${process.env.PATH}`, ...env } });
}
const ok = (out) => { assert.equal(out.status, 0, out.stderr + out.stdout); return out; };
const flowDir = () => mkdtempSync(join(tmpdir(), 'flow-'));
// Every check of a case moves by the same number of trials, since the fake grades them all.
const added = (before, after, id, check) => cellsOf(after)[id][check].trials - cellsOf(before)[id][check].trials;

test('a same-model run counts each scored row once, leaves the lower tier alone, and a resumed run adds nothing', () => {
  const { path, before } = smallHistory();
  const flow = flowDir();
  ok(runner(path, { flow }));
  const after = read(path);
  for (const id of CASES) {
    const b = cellsOf(before)[id].pass;
    // The fake run writes no report, so the upper-tier pass cell fails on both reps.
    assert.deepEqual(cellsOf(after)[id].pass, { ...b, trials: b.trials + 2, recent: `${b.recent}ff` });
    assert.deepEqual(cellsOf(after)[id].history_unchanged, cellsOf(before)[id].history_unchanged);
  }
  ok(runner(path, { flow }));
  assert.deepEqual(read(path), after);
});

test('a complete run on a new model counts the lower tier and records the model once', () => {
  const { path, before } = smallHistory();
  ok(runner(path, { flow: flowDir(), model: NEW }));
  const after = read(path);
  for (const id of CASES) assert.equal(added(before, after, id, 'history_unchanged'), 2);
  assert.equal(suiteOf(after).lower_tier_model, NEW);
  assert.equal(suiteOf(after).last_run_model, NEW);
  // The next run on that model leaves the lower tier out.
  ok(runner(path, { flow: flowDir(), variant: 'r2', model: NEW }));
  for (const id of CASES) assert.equal(added(after, read(path), id, 'history_unchanged'), 0);
});

test('a run that stops after its first lower-tier row keeps the old models, and resuming finishes it once', () => {
  const { path, before } = smallHistory();
  const flow = flowDir();
  const crashed = runner(path, { flow, model: NEW, env: { FAKE_KILL_AT: '2' } });
  assert.notEqual(crashed.status, 0);
  const mid = read(path);
  assert.equal(added(before, mid, CASES[0], 'history_unchanged'), 1);
  assert.equal(suiteOf(mid).lower_tier_model, MODEL);
  assert.equal(suiteOf(mid).last_run_model, MODEL);
  ok(runner(path, { flow, model: NEW }));
  const after = read(path);
  for (const id of CASES) for (const check of ['pass', 'history_unchanged']) assert.equal(added(before, after, id, check), 2);
  assert.equal(suiteOf(after).lower_tier_model, NEW);
});

test('a --cases subset on a new model leaves the lower tier due for the full suite', () => {
  const { path, before } = smallHistory();
  ok(runner(path, { flow: flowDir(), model: NEW, cases: CASES[0] }));
  const mid = read(path);
  assert.equal(suiteOf(mid).lower_tier_model, MODEL);
  assert.equal(suiteOf(mid).last_run_model, MODEL);
  ok(runner(path, { flow: flowDir(), variant: 'r2', model: NEW }));
  const after = read(path);
  // The subset's case ran twice on purpose (two runs); the other case's lower cell still ran.
  assert.equal(added(before, after, CASES[0], 'history_unchanged'), 4);
  assert.equal(added(before, after, CASES[1], 'history_unchanged'), 2);
  assert.equal(suiteOf(after).lower_tier_model, NEW);
});

test('an infra error on one lower-tier case keeps the old model until a resume scores it', () => {
  const { path, before } = smallHistory();
  const flow = flowDir();
  ok(runner(path, { flow, model: NEW, env: { FAKE_FAIL: CASES[1] } }));
  const mid = read(path);
  assert.deepEqual(cellsOf(mid)[CASES[1]], cellsOf(before)[CASES[1]]);
  assert.equal(suiteOf(mid).lower_tier_model, MODEL);
  assert.ok(existsSync(join(flow, 'r1', 'errors.jsonl')));
  ok(runner(path, { flow, model: NEW }));
  const after = read(path);
  for (const id of CASES) assert.equal(added(before, after, id, 'history_unchanged'), 2);
  assert.equal(suiteOf(after).lower_tier_model, NEW);
});

test('a regression run uses the suite\'s own repetitions', () => {
  const { path, before } = smallHistory();
  ok(runner(path, { flow: flowDir() }));
  assert.equal(added(before, read(path), CASES[0], 'pass'), 2);
  const refused = runner(path, { flow: flowDir(), variant: 'r3', extra: ['--reps', '3'] });
  assert.equal(refused.status, 2);
  assert.match(refused.stderr, /2 reps/);
});

test('a run of evals.json, which is not a regression suite, leaves the cell history alone', () => {
  const { path } = smallHistory();
  const before = readFileSync(path, 'utf8');
  // Every attempt fails before the judge, so no model is called at all.
  const out = spawnSync('node', [join(here, 'run.mjs'), '--variant', 'c1', '--access', 'subscription', '--suite', 'evals',
    '--cases', 'evals-4', '--reps', '1', '--flow', flowDir(), '--history', path], {
    encoding: 'utf8', env: { ...process.env, PATH: `${fakeCli()}:${process.env.PATH}`, FAKE_FAIL: 'evals-4' },
  });
  assert.equal(out.status, 0, out.stderr);
  assert.equal(readFileSync(path, 'utf8'), before);
});
