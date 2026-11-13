// node --test skill-evals/test-unanswered-trials.mjs
// A trial the model never finished answering is not a result (docs/decisions/testing.md).
// Each runner here is driven against a fake `claude` on PATH whose first agent run ends the way
// Claude Code reports an API error such as a usage limit: a `result` event whose subtype is still
// "success", with is_error: true and api_error_status.
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
if (args.includes('--json-schema')) {
  fs.appendFileSync(log, 'judge\\n');
  const expectations = Array.from({ length: 100 }, (_, index) => ({ index, met: true, evidence: 'fake' }));
  process.stdout.write(JSON.stringify({ type: 'result', subtype: 'success', is_error: false, structured_output: { expectations }, usage: {}, modelUsage: { fake: {} }, total_cost_usd: 0 }));
  process.exit(0);
}
const counter = process.env.FAKE_CLAUDE_COUNTER;
const n = (fs.existsSync(counter) ? Number(fs.readFileSync(counter, 'utf8')) : 0) + 1;
fs.writeFileSync(counter, String(n));
const failing = n <= Number(process.env.FAKE_CLAUDE_FAIL_FIRST || 0);
fs.appendFileSync(log, failing ? 'agent-error\\n' : 'agent-ok\\n');
const model = args[args.indexOf('--model') + 1];
const emit = (e) => process.stdout.write(JSON.stringify(e) + '\\n');
emit({ type: 'system', subtype: 'init', model, apiKeySource: 'none', session_id: 's' });
if (failing) {
  emit({ type: 'rate_limit_event', rate_limit_info: { status: 'rejected', resetsAt: 1900000000, rateLimitType: 'five_hour' }, session_id: 's' });
  if (process.env.FAKE_CLAUDE_SUBTYPE) emit({ type: 'result', subtype: process.env.FAKE_CLAUDE_SUBTYPE, is_error: true, num_turns: 1, total_cost_usd: 0, usage: {}, permission_denials: [], errors: ['budget'], session_id: 's' });
  else emit({ type: 'result', subtype: 'success', is_error: true, api_error_status: 429, result: "You've hit your limit", num_turns: 1, total_cost_usd: 0, usage: {}, permission_denials: [], session_id: 's' });
} else {
  emit({ type: 'assistant', message: { content: [{ type: 'text', text: 'done' }] }, session_id: 's' });
  emit({ type: 'result', subtype: 'success', is_error: false, result: 'done', num_turns: 1, total_cost_usd: 0, usage: {}, permission_denials: [], session_id: 's' });
}
`;

// Each runner with the arguments that select its evals.json, so no committed regression history is touched.
// Trials run in order with one worker, reps counting from 0: rep 0 meets the error, rep 1 answers.
const RUNNERS = [
  { name: 'audit-evals', caseId: 'evals-1', args: ['--suite', 'evals'] },
  { name: 'babysit-pr', caseId: '1', args: ['--skill', 'babysit-pr'] },
  { name: 'define-product', caseId: 'evals-1', args: ['--suite', 'evals'] },
  { name: 'implement', caseId: 'evals-1', args: ['--suite', 'evals'] },
  { name: 'llm-evals', caseId: 'evals-1', args: [] },
  { name: 'merge', caseId: 'evals-1', args: ['--suite', 'evals'] },
];

function rows(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
}

function findFile(dir, base) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true, recursive: true })) {
    if (entry.isFile() && entry.name === base) return path.join(entry.parentPath ?? entry.path, entry.name);
  }
  return null;
}

for (const runner of RUNNERS) {
  test(`${runner.name}: a trial that ended on an API error is not graded, and a rerun fills only it`, () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), `unanswered-${runner.name}-`));
    const bin = path.join(dir, 'bin');
    fs.mkdirSync(bin);
    fs.writeFileSync(path.join(bin, 'claude'), FAKE_CLAUDE);
    fs.chmodSync(path.join(bin, 'claude'), 0o755);
    const log = path.join(dir, 'calls.log');
    const flow = path.join(dir, 'flow');
    const run = (failFirst, subtype = '') => {
      fs.writeFileSync(log, '');
      const result = spawnSync(process.execPath, [
        path.join(here, runner.name, 'run.mjs'), '--variant', 'v1', '--access', 'subscription',
        '--flow', flow, '--cases', runner.caseId, '--reps', '2', '--workers', '1', ...runner.args,
      ], {
        encoding: 'utf8',
        timeout: 300_000,
        env: {
          ...process.env,
          PATH: `${bin}${path.delimiter}${process.env.PATH}`,
          ANTHROPIC_API_KEY: '',
          FAKE_CLAUDE_LOG: log,
          FAKE_CLAUDE_COUNTER: path.join(dir, 'counter'),
          FAKE_CLAUDE_FAIL_FIRST: String(failFirst),
          FAKE_CLAUDE_SUBTYPE: subtype,
        },
      });
      return { result, calls: fs.readFileSync(log, 'utf8').split('\n').filter(Boolean) };
    };

    const first = run(1);
    const resultsFile = findFile(flow, 'results.jsonl');
    assert.ok(resultsFile, `runner scored nothing:\n${first.result.stdout}\n${first.result.stderr}`);
    const errorsFile = path.join(path.dirname(resultsFile), 'errors.jsonl');
    const scored = rows(resultsFile);
    const errored = rows(errorsFile);
    assert.deepEqual(scored.map((r) => r.rep).sort(), [1], 'only the trial that finished answering is scored');
    assert.deepEqual(errored.map((r) => [r.rep, r.class]), [[0, 'api-error']], 'the trial that ended on an API error is kept as an error');
    assert.ok(first.calls.filter((c) => c === 'judge').length <= scored.length, 'the judge never reads the errored trial');

    const second = run(0);
    assert.deepEqual(second.calls.filter((c) => c.startsWith('agent')), ['agent-ok'], 'a rerun runs only the unanswered trial');
    assert.deepEqual(rows(resultsFile).map((r) => r.rep).sort(), [0, 1], 'the rerun fills the unanswered trial');

    // A run that stopped on its own limit, such as --max-budget-usd, carries is_error too but stays a harness error.
    fs.rmSync(flow, { recursive: true, force: true });
    fs.rmSync(path.join(dir, 'counter'), { force: true });
    run(1, 'error_max_budget_usd');
    const budgetErrors = rows(path.join(path.dirname(findFile(flow, 'results.jsonl')), 'errors.jsonl'));
    assert.deepEqual(budgetErrors.map((r) => [r.rep, r.class]), [[0, 'harness']], 'an error subtype keeps its harness class');
    assert.match(budgetErrors[0].detail, /error_max_budget_usd/, 'the detail names the subtype');
  });
}
