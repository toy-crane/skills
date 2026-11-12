// Deterministic tests for how audit-evals' runner keeps regression/cell-history.json. No model is
// called: the runner tests put a fake `claude` first on PATH.
//   node --test skill-evals/audit-evals/test_history.mjs
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, cpSync, existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { planTiers, recordRow } from './history.mjs';

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

test('the lower tier runs only when the model differs from its last model, which is then recorded', () => {
  const same = planTiers(history(), 's', MODEL);
  assert.equal(same.lowerRuns, false);
  assert.deepEqual(['c1', 'c2'].filter(same.runsCase), ['c1']);
  const h = history();
  recordRow(h, 's', row('c1', { a: 1, b: 1 }), { model: MODEL, lowerRuns: false });
  // A lower-tier cell graded on the way does not count while its tier is not running.
  assert.deepEqual(h.suites.s.cells.c1.b, cell('lower', 3, 3, 'ppp'));

  const changed = planTiers(history(), 's', 'claude-opus-6');
  assert.equal(changed.lowerRuns, true);
  assert.deepEqual(['c1', 'c2'].filter(changed.runsCase), ['c1', 'c2']);
  const g = history();
  recordRow(g, 's', row('c2', { a: 0, b: 1 }), { model: 'claude-opus-6', lowerRuns: true });
  assert.deepEqual(g.suites.s.cells.c2.a, cell('lower', 11, 10, 'pppppppppf'));
  assert.equal(g.suites.s.lower_tier_model, 'claude-opus-6');
  assert.equal(g.suites.s.last_run_model, 'claude-opus-6');
});

// A fake `claude` CLI: a successful run that writes nothing, or a failed one for the case named in
// FAKE_FAIL (the runner names each workspace after its case).
function fakeCli() {
  const dir = mkdtempSync(join(tmpdir(), 'fake-claude-'));
  const bin = join(dir, 'claude');
  writeFileSync(bin, `#!/usr/bin/env node
const model = process.argv[process.argv.indexOf('--model') + 1];
const fail = process.env.FAKE_FAIL && process.cwd().includes(process.env.FAKE_FAIL);
console.log(JSON.stringify({ type: 'system', subtype: 'init', model, apiKeySource: 'none' }));
console.log(JSON.stringify({ type: 'assistant', message: { content: [{ type: 'text', text: 'done' }] } }));
console.log(JSON.stringify({ type: 'result', subtype: fail ? 'error_during_execution' : 'success', total_cost_usd: 0, usage: {}, num_turns: 1 }));
`);
  chmodSync(bin, 0o755);
  return dir;
}

function runRegression(historyPath, flow, extraEnv = {}, cases = 't2-b-early,h3-b-all') {
  const out = spawnSync('node', [join(here, 'run.mjs'), '--variant', 'r1', '--access', 'subscription', '--suite', 'eval-suite-audit-3',
    '--cases', cases, '--reps', '2', '--workers', '2', '--flow', flow, '--history', historyPath], {
    encoding: 'utf8', env: { ...process.env, PATH: `${fakeCli()}:${process.env.PATH}`, ...extraEnv },
  });
  assert.equal(out.status, 0, out.stderr + out.stdout);
  return JSON.parse(readFileSync(historyPath, 'utf8'));
}

function copyHistory() {
  const dir = mkdtempSync(join(tmpdir(), 'cell-history-'));
  const path = join(dir, 'cell-history.json');
  cpSync(join(here, 'regression/cell-history.json'), path);
  return { path, before: JSON.parse(readFileSync(path, 'utf8')) };
}

test('a regression run records each newly scored row once, and a resumed run adds nothing', () => {
  const { path, before } = copyHistory();
  const flow = mkdtempSync(join(tmpdir(), 'flow-'));
  const after = runRegression(path, flow);
  const cells = (h) => h.suites['eval-suite-audit-3'].cells;
  for (const id of ['t2-b-early', 'h3-b-all']) {
    const b = cells(before)[id].pass;
    const a = cells(after)[id].pass;
    // The fake run writes no report, so the upper-tier pass cell fails twice.
    assert.deepEqual(a, { ...b, trials: b.trials + 2, passes: b.passes, recent: `${b.recent}ff` });
    // history_unchanged sits in the lower tier, whose last model is this one: not counted.
    assert.deepEqual(cells(after)[id].history_unchanged, cells(before)[id].history_unchanged);
  }
  assert.deepEqual(cells(after)['h1-a-tail'], cells(before)['h1-a-tail']);
  // The same variant again: every row is already scored, so nothing is counted twice.
  assert.deepEqual(runRegression(path, flow), after);
});

test('an attempt that failed before a scorable output is not a trial', () => {
  const { path, before } = copyHistory();
  const flow = mkdtempSync(join(tmpdir(), 'flow-'));
  const after = runRegression(path, flow, { FAKE_FAIL: 'h3-b-all' });
  const cells = (h) => h.suites['eval-suite-audit-3'].cells;
  assert.deepEqual(cells(after)['h3-b-all'], cells(before)['h3-b-all']);
  assert.equal(cells(after)['t2-b-early'].pass.trials, cells(before)['t2-b-early'].pass.trials + 2);
  assert.ok(existsSync(join(flow, 'r1', 'errors.jsonl')));
});

test('a run of evals.json, which is not a regression suite, leaves the cell history alone', () => {
  const { path } = copyHistory();
  const before = readFileSync(path, 'utf8');
  const flow = mkdtempSync(join(tmpdir(), 'flow-'));
  // Every attempt fails before the judge, so no model is called at all.
  const out = spawnSync('node', [join(here, 'run.mjs'), '--variant', 'c1', '--access', 'subscription', '--suite', 'evals',
    '--cases', 'evals-4', '--reps', '1', '--flow', flow, '--history', path], {
    encoding: 'utf8', env: { ...process.env, PATH: `${fakeCli()}:${process.env.PATH}`, FAKE_FAIL: 'evals-4' },
  });
  assert.equal(out.status, 0, out.stderr);
  assert.equal(readFileSync(path, 'utf8'), before);
  assert.equal(readFileSync(join(here, 'regression/cell-history.json'), 'utf8').length > 0, true);
});
