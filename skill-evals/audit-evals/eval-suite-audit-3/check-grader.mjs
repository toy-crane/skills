#!/usr/bin/env node
// Free pre-approval check of grade.mjs, calling no model: reference answers must
// score 100%, and empty, constant, and wrong-suite answers 0%.
//   node check-grader.mjs   (after python3 -I build_fixtures.py and node reference.mjs)
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expectedLists, parseReport, scoreRun } from './grade.mjs';

const here = new URL('.', import.meta.url).pathname;
const script = join(here, '../../../skills/workflow/audit-evals/scripts/audit_evals.py');
const cases = readFileSync(join(here, 'cases.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
const history = (id) => JSON.parse(readFileSync(join(here, 'fixtures', id, 'evals/regression/cell-history.json'), 'utf8'));
const turnsSaying = (text) => [{ role: 'assistant', content: text }];
const state = (h, report) => ({ history: h, historyChanged: false, report, reportPath: report ? 'evals/audit-report.md' : null });

// A report written straight from the expected lists, one cell per line.
function referenceReport(e) {
  const section = (title, items) => [`## ${title} (${items.length})`, ...(items.length ? items.map((i) => `- ${i}`) : ['- none']), ''];
  return [
    ...section('Never failed', e.never_failed),
    ...section('Insufficient history', e.insufficient_history),
    ...section('Identical histories', e.identical_checks.map((g) => g.join(' = '))),
    ...section('Flipping', e.flipping.map((i) => `${i} 1/2`)),
    ...section('Always failing', e.always_failing.map((i) => `${i} 0/2`)),
  ].join('\n');
}
const referenceReply = (e) => `never failed ${e.never_failed.length}, identical ${e.identical_checks.length}, flipping ${e.flipping.length}, always failing ${e.always_failing.length}`;

const tally = { reference: 0, script: 0, empty: 0, constant: 0, wrong_suite: 0 };
for (const [i, c] of cases.entries()) {
  const e = expectedLists(c.id);
  const h = history(c.id);
  tally.reference += scoreRun(c, state(h, referenceReport(e)), turnsSaying(referenceReply(e))).grade.pass;

  // The skill's own script, run on a copy, through its compact notation.
  const ws = mkdtempSync(join(tmpdir(), 'audit-grader-'));
  cpSync(join(here, 'fixtures', c.id), ws, { recursive: true });
  const run = spawnSync('python3', ['-I', script, 'report', join(ws, 'evals/regression/cell-history.json')], { encoding: 'utf8' });
  const report = readFileSync(join(ws, 'evals/audit-report.md'), 'utf8');
  const parsed = parseReport(report, h);
  const scored = scoreRun(c, state(h, report), turnsSaying(run.stdout));
  tally.script += scored.grade.pass;
  if (!scored.grade.pass) console.log(`${c.id} script: ${scored.problems.join('; ')} ${Object.keys(parsed)}`);

  tally.empty += scoreRun(c, state(h, null), turnsSaying('')).grade.pass;
  const blank = { never_failed: [], insufficient_history: [], identical_checks: [], flipping: [], always_failing: [] };
  tally.constant += scoreRun(c, state(h, referenceReport(blank)), turnsSaying('0')).grade.pass;
  const other = cases[(i + 1) % cases.length].id;
  const eo = expectedLists(other);
  tally.wrong_suite += scoreRun(c, state(h, referenceReport(eo)), turnsSaying(referenceReply(eo))).grade.pass;
}
for (const [k, v] of Object.entries(tally)) console.log(`${k}: ${v}/${cases.length} pass (${Math.round((100 * v) / cases.length)}%)`);
