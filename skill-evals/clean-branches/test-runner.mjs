// node --test skill-evals/clean-branches/test-runner.mjs
// Drives run.mjs against a fake `claude` in a copy of the eval root, so no committed history changes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FAKE = `#!/usr/bin/env node
const fs = require('node:fs');
const args = process.argv.slice(2);
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
if (args.includes('--json-schema')) {
  sleep(Number(process.env.FAKE_JUDGE_MS || 0));
  const expectations = Array.from({ length: 10 }, (_, index) => ({ index, met: true, evidence: 'fake' }));
  process.stdout.write(JSON.stringify({ type: 'result', subtype: 'success', is_error: false, structured_output: { expectations }, usage: {}, modelUsage: { fake: {} }, total_cost_usd: 0 }));
  process.exit(0);
}
const c = process.env.FAKE_CLAUDE_COUNTER;
const n = (fs.existsSync(c) ? Number(fs.readFileSync(c, 'utf8')) : 0) + 1;
fs.writeFileSync(c, String(n));
sleep(Number((process.env.FAKE_AGENT_MS || '0').split(',')[n - 1] || 0));
const model = args[args.indexOf('--model') + 1];
const emit = (e) => process.stdout.write(JSON.stringify(e) + '\\n');
emit({ type: 'system', subtype: 'init', model, apiKeySource: 'none', session_id: 's' });
emit({ type: 'assistant', message: { content: [{ type: 'text', text: 'done' }] }, session_id: 's' });
emit({ type: 'result', subtype: 'success', is_error: false, result: 'done', num_turns: 1, total_cost_usd: 0, usage: {}, permission_denials: [], session_id: 's' });
`;
const rows = (f) => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []);
test('an agent that answers while another trial is being judged is not recorded as a timeout', () => {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'cb-runner-')));
  fs.mkdirSync(path.join(dir, 'skill-evals'), { recursive: true });
  for (const n of ['clean-branches', 'audit-evals']) fs.cpSync(path.join(repo, 'skill-evals', n), path.join(dir, 'skill-evals', n), { recursive: true });
  fs.mkdirSync(path.join(dir, '.claude/skills'), { recursive: true });
  fs.symlinkSync(path.join(repo, 'skills/git/clean-branches'), path.join(dir, '.claude/skills/clean-branches'));
  spawnSync('git', ['init', '-q', dir]);
  const bin = path.join(dir, 'bin');
  fs.mkdirSync(bin);
  fs.writeFileSync(path.join(bin, 'claude'), FAKE, { mode: 0o755 });
  const flow = path.join(dir, 'flow');
  // The first agent answers at once and its judge takes 3s; the second answers at 1s, inside its 2s ceiling.
  const env = { ...process.env, PATH: `${bin}:${process.env.PATH}`, ANTHROPIC_API_KEY: '', FAKE_CLAUDE_COUNTER: path.join(dir, 'n'), FAKE_AGENT_MS: '0,1000,0,0', FAKE_JUDGE_MS: '3000' };
  const r = spawnSync('node', [path.join(dir, 'skill-evals/clean-branches/run.mjs'), '--variant', 'v1', '--access', 'subscription', '--flow', flow,
    '--cases', 'no-pr-branch,branch-only-leftovers', '--workers', '2', '--timeout-s', '2'], { encoding: 'utf8', env });
  assert.equal(r.status, 0, `${r.stdout}\n${r.stderr}`);
  assert.deepEqual(rows(path.join(flow, 'v1', 'errors.jsonl')).map((e) => `${e.prompt_id}#${e.rep} ${e.class}`), []);
  assert.equal(rows(path.join(flow, 'v1', 'results.jsonl')).length, 4);
  fs.rmSync(dir, { recursive: true, force: true });
});
