#!/usr/bin/env node
// Reference answers for criterion 3, computed straight from the per-trial
// records in source/ as fixtures.json selects them. It shares no code with the
// skill's counting script or with build_fixtures.py, so the expected lists stay
// independent of the implementation they grade.
//   node reference.mjs   (writes expected/<fixture>.json)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const WINDOW = 10;
const spec = JSON.parse(readFileSync(join(here, 'fixtures.json'), 'utf8'));
const source = (n) => JSON.parse(readFileSync(join(here, 'source', `${n}.json`), 'utf8'));
const sources = { a: source('a'), b: source('b') };

// Every rule reads a cell's most recent WINDOW judged trials, in run order and
// rep order within a run; '-' (not judged) is not a trial.
function expectedFor(fixture) {
  const lists = { recent_all_passed: [], insufficient_history: [], identical_checks: [], flipping: [], always_failing: [] };
  for (const s of fixture.suites) {
    const [from, to] = s.cases ?? ['case-000', 'case-999'];
    const perCheck = new Map();
    for (const cell of sources[s.source].cells) {
      if (!cell.graduated || cell.case < from || cell.case > to) continue;
      const trials = [];
      for (const run of s.runs) {
        for (const r of cell.results[run] ?? '') if (r === 'p' || r === 'f') trials.push(r);
      }
      const recent = trials.slice(Math.max(0, trials.length - WINDOW));
      const fails = recent.filter((r) => r === 'f').length;
      const id = `${s.name}/${cell.case}/${cell.check}`;
      // A cell with no failure needs a full window to be a candidate; a failure needs no full window.
      if (fails === 0) (recent.length === WINDOW ? lists.recent_all_passed : lists.insufficient_history).push(id);
      else if (fails === recent.length) lists.always_failing.push(id);
      else lists.flipping.push(id);
      if (!perCheck.has(cell.check)) perCheck.set(cell.check, []);
      perCheck.get(cell.check).push([cell.case, recent.join('')]);
    }
    // Checks with the same recent results case by case, among checks that failed in them.
    const groups = new Map();
    for (const [check, rows] of perCheck) {
      if (!rows.some(([, recent]) => recent.includes('f'))) continue;
      const key = JSON.stringify(rows.sort((x, y) => (x[0] < y[0] ? -1 : 1)));
      groups.set(key, [...(groups.get(key) ?? []), `${s.name}/${check}`]);
    }
    for (const g of groups.values()) if (g.length > 1) lists.identical_checks.push(g.sort());
  }
  for (const key of Object.keys(lists)) {
    if (key === 'identical_checks') lists[key].sort((x, y) => (x[0] < y[0] ? -1 : 1));
    else lists[key].sort();
  }
  return lists;
}

mkdirSync(join(here, 'expected'), { recursive: true });
for (const f of spec.fixtures) {
  const lists = expectedFor(f);
  writeFileSync(join(here, 'expected', `${f.id}.json`), `${JSON.stringify(lists)}\n`);
  console.log(`${f.id}: candidates ${lists.recent_all_passed.length}, short ${lists.insufficient_history.length}, identical ${lists.identical_checks.map((g) => g.length).join('+') || 0}, flipping ${lists.flipping.length}, failing ${lists.always_failing.length}`);
}
