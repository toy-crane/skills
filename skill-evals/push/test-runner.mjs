// node --test skill-evals/push/test-runner.mjs
// docs/specs/skill-regression-push/ criterion 3: the runner never grades a trial whose entry point
// reported an error, and never reruns a (variant, case, rep) that already has a scored row.
// The runner is driven against a fake `claude` on PATH: its first agent run ends the way Claude Code
// reports an API error such as a usage limit (subtype "success" with is_error: true).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

const FAKE_CLAUDE = `#!/usr/bin/env node
const fs = require('node:fs');
const args = process.argv.slice(2);
const log = process.env.FAKE_CLAUDE_LOG;
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
if (args.includes('--json-schema')) {
  fs.appendFileSync(log, 'judge\\n');
  sleep(Number(process.env.FAKE_JUDGE_MS || 0));
  const expectations = Array.from({ length: 10 }, (_, index) => ({ index, met: true, evidence: 'fake' }));
  process.stdout.write(JSON.stringify({ type: 'result', subtype: 'success', is_error: false, structured_output: { expectations }, usage: {}, modelUsage: { fake: {} }, total_cost_usd: 0 }));
  process.exit(0);
}
const counter = process.env.FAKE_CLAUDE_COUNTER;
const n = (fs.existsSync(counter) ? Number(fs.readFileSync(counter, 'utf8')) : 0) + 1;
fs.writeFileSync(counter, String(n));
const failing = n === 1 && !process.env.FAKE_NO_ERROR;
sleep(Number((process.env.FAKE_AGENT_MS || '0').split(',')[n - 1] || 0));
fs.appendFileSync(log, failing ? 'agent-error\\n' : 'agent-ok\\n');
const model = args[args.indexOf('--model') + 1];
const emit = (e) => process.stdout.write(JSON.stringify(e) + '\\n');
emit({ type: 'system', subtype: 'init', model, apiKeySource: 'none', session_id: 's' });
if (failing) emit({ type: 'result', subtype: 'success', is_error: true, api_error_status: 429, result: "You've hit your limit", num_turns: 1, total_cost_usd: 0, usage: {}, permission_denials: [], session_id: 's' });
else emit({ type: 'result', subtype: 'success', is_error: false, result: 'done', num_turns: 1, total_cost_usd: 0, usage: {}, permission_denials: [], session_id: 's' });
`;

const rows = (file) => (fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []);

// The runner works on a copy of the eval root, so the committed cell history is never touched.
function copyEvalRoot(dir) {
  const root = path.join(dir, 'repo');
  fs.cpSync(here, path.join(root, 'skill-evals/push'), { recursive: true });
  fs.cpSync(path.join(here, '../audit-evals/history.mjs'), path.join(root, 'skill-evals/audit-evals/history.mjs'));
  fs.mkdirSync(path.join(root, '.claude/skills'), { recursive: true });
  fs.symlinkSync(fs.realpathSync(path.join(here, '../../.claude/skills/push')), path.join(root, '.claude/skills/push'));
  return path.join(root, 'skill-evals/push');
}

test('an API-error trial is not graded and stays out of the cell history, a rerun fills only it, and a third run reruns nothing', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'push-runner-'));
  const evalRoot = copyEvalRoot(dir);
  const bin = path.join(dir, 'bin');
  fs.mkdirSync(bin);
  fs.writeFileSync(path.join(bin, 'claude'), FAKE_CLAUDE, { mode: 0o755 });
  const log = path.join(dir, 'calls.log');
  const flow = path.join(dir, 'flow');
  const env = { ...process.env, PATH: `${bin}:${process.env.PATH}`, FAKE_CLAUDE_LOG: log, FAKE_CLAUDE_COUNTER: path.join(dir, 'n') };
  const run = () => {
    fs.writeFileSync(log, '');
    const r = spawnSync('node', [path.join(evalRoot, 'run.mjs'), '--variant', 'v1', '--access', 'subscription', '--flow', flow,
      '--cases', 'first-push-search', '--workers', '1'], { encoding: 'utf8', env });
    assert.equal(r.status, 0, `${r.stdout}\n${r.stderr}`);
    return fs.readFileSync(log, 'utf8').split('\n').filter(Boolean);
  };
  const historyPath = path.join(evalRoot, 'regression/cell-history.json');
  const cell = () => JSON.parse(fs.readFileSync(historyPath, 'utf8')).suites['skill-regression-push'].cells['first-push-search']['end-state'];
  const before = cell();
  const results = path.join(flow, 'v1', 'results.jsonl');
  const errors = path.join(flow, 'v1', 'errors.jsonl');

  assert.deepEqual(run(), ['agent-error', 'agent-ok', 'judge']);
  assert.deepEqual(rows(results).map((r) => r.rep), [1], 'only the answered rep is scored');
  assert.deepEqual(rows(errors).map((e) => [e.rep, e.class]), [[0, 'api-error']]);
  assert.equal(cell().trials, before.trials + 1, 'the unanswered trial does not enter the cell history');

  assert.deepEqual(run(), ['agent-ok', 'judge'], 'the rerun runs only the unanswered rep');
  assert.deepEqual(rows(results).map((r) => r.rep).sort(), [0, 1]);
  assert.equal(cell().trials, before.trials + 2);

  assert.deepEqual(run(), [], 'scored (variant, case, rep) rows are never rerun');
  assert.equal(cell().trials, before.trials + 2);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('an agent that answers while another trial is being judged is not recorded as a timeout', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'push-runner-'));
  const evalRoot = copyEvalRoot(dir);
  const bin = path.join(dir, 'bin');
  fs.mkdirSync(bin);
  fs.writeFileSync(path.join(bin, 'claude'), FAKE_CLAUDE, { mode: 0o755 });
  const flow = path.join(dir, 'flow');
  // The first agent answers at once and its judge takes 1.5s; the second answers at 0.5s, inside its 1s ceiling.
  const env = {
    ...process.env, PATH: `${bin}:${process.env.PATH}`, FAKE_CLAUDE_LOG: path.join(dir, 'calls.log'), FAKE_CLAUDE_COUNTER: path.join(dir, 'n'),
    FAKE_NO_ERROR: '1', FAKE_AGENT_MS: '0,500,0,0', FAKE_JUDGE_MS: '1500',
  };
  const r = spawnSync('node', [path.join(evalRoot, 'run.mjs'), '--variant', 'v1', '--access', 'subscription', '--flow', flow,
    '--cases', 'first-push-search,first-push-settings', '--workers', '2', '--timeout-s', '1'], { encoding: 'utf8', env });
  assert.equal(r.status, 0, `${r.stdout}\n${r.stderr}`);
  assert.deepEqual(rows(path.join(flow, 'v1', 'errors.jsonl')).map((e) => `${e.prompt_id}#${e.rep} ${e.class}`), []);
  assert.equal(rows(path.join(flow, 'v1', 'results.jsonl')).length, 4);
  fs.rmSync(dir, { recursive: true, force: true });
});
