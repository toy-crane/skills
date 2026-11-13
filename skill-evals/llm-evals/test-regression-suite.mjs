// node --test skill-evals/llm-evals/test-regression-suite.mjs
// The llm-evals runner runs its graduated regression suite the way llm-evals asks: at the suite's
// recorded reps, the upper tier always, the lower tier only when the model differs from the one it
// last ran on, adding each scored row to the cell history. A fake `claude` on PATH answers every run
// and its judge meets every expectation, so the test needs no model.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SUITE = 'eval-unanswered-trials';
const committedHistory = path.join(here, 'regression', 'cell-history.json');

const FAKE_CLAUDE = `#!/usr/bin/env node
const fs = require('node:fs');
const args = process.argv.slice(2);
if (args.includes('--json-schema')) {
  fs.appendFileSync(process.env.FAKE_CLAUDE_LOG, 'judge\\n');
  const expectations = Array.from({ length: 100 }, (_, index) => ({ index, met: true, evidence: 'fake' }));
  process.stdout.write(JSON.stringify({ type: 'result', subtype: 'success', is_error: false, structured_output: { expectations }, usage: {}, modelUsage: { fake: {} }, total_cost_usd: 0 }));
  process.exit(0);
}
fs.appendFileSync(process.env.FAKE_CLAUDE_LOG, 'agent\\n');
const model = args[args.indexOf('--model') + 1];
const emit = (e) => process.stdout.write(JSON.stringify(e) + '\\n');
emit({ type: 'system', subtype: 'init', model, apiKeySource: 'none', session_id: 's' });
emit({ type: 'assistant', message: { content: [{ type: 'text', text: 'done' }] }, session_id: 's' });
emit({ type: 'result', subtype: 'success', is_error: false, result: 'done', num_turns: 1, total_cost_usd: 0, usage: {}, permission_denials: [], session_id: 's' });
`;

function setup() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'llm-evals-suite-'));
  fs.mkdirSync(path.join(dir, 'bin'));
  fs.writeFileSync(path.join(dir, 'bin', 'claude'), FAKE_CLAUDE);
  fs.chmodSync(path.join(dir, 'bin', 'claude'), 0o755);
  const history = path.join(dir, 'cell-history.json');
  fs.copyFileSync(committedHistory, history);
  const log = path.join(dir, 'calls.log');
  const run = (...extra) => {
    fs.writeFileSync(log, '');
    const result = spawnSync(process.execPath, [
      path.join(here, 'run.mjs'), '--variant', 'r1', '--access', 'subscription', '--suite', SUITE,
      '--flow', path.join(dir, 'flow'), '--history', history, '--workers', '2', ...extra,
    ], {
      encoding: 'utf8',
      timeout: 300_000,
      env: { ...process.env, PATH: `${path.join(dir, 'bin')}${path.delimiter}${process.env.PATH}`, ANTHROPIC_API_KEY: '', FAKE_CLAUDE_LOG: log },
    });
    return { result, calls: fs.readFileSync(log, 'utf8').split('\n').filter(Boolean) };
  };
  return { dir, history, run };
}

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

test('a regression run adds each scored row to the upper-tier cells and leaves the lower tier when the model is the same', () => {
  const before = readJson(committedHistory).suites[SUITE];
  const { history, run } = setup();
  const { result, calls } = run();
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const cases = Object.keys(before.cells);
  assert.equal(calls.filter((c) => c === 'agent').length, cases.length * before.reps, 'every case runs at the suite\'s recorded reps');

  const after = readJson(history).suites[SUITE];
  for (const id of cases) {
    for (const [check, cell] of Object.entries(before.cells[id])) {
      const now = after.cells[id][check];
      if (cell.tier === 'upper') {
        assert.deepEqual([now.trials, now.passes, now.recent], [cell.trials + before.reps, cell.passes + before.reps, `${cell.recent}${'p'.repeat(before.reps)}`.slice(-10)], `${id} ${check} counts this run`);
      } else {
        assert.deepEqual(now, cell, `${id} ${check} is lower tier and did not run`);
      }
    }
  }
  assert.deepEqual(readJson(committedHistory).suites[SUITE], before, 'the committed history is untouched when --history points elsewhere');
});

test('a regression run refuses reps other than the suite\'s recorded reps', () => {
  const { run } = setup();
  const { result, calls } = run('--reps', '3');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /runs at 2 reps/);
  assert.deepEqual(calls, [], 'nothing ran');
});

test('a regression run under a new model runs the lower tier too and records that model', () => {
  const before = readJson(committedHistory).suites[SUITE];
  const { history, run } = setup();
  const { result } = run('--model', 'claude-opus-6');
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const after = readJson(history).suites[SUITE];
  const lower = Object.entries(before.cells).flatMap(([id, cells]) => Object.entries(cells).filter(([, c]) => c.tier === 'lower').map(([check, c]) => [id, check, c]));
  assert.ok(lower.length > 0, 'the suite has lower-tier cells');
  for (const [id, check, cell] of lower) assert.equal(after.cells[id][check].trials, cell.trials + before.reps, `${id} ${check} ran`);
  assert.deepEqual([after.last_run_model, after.lower_tier_model], ['claude-opus-6', 'claude-opus-6']);
});
