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
const MIN_TRIALS = 10;
const spec = JSON.parse(readFileSync(join(here, 'fixtures.json'), 'utf8'));
const source = (n) => JSON.parse(readFileSync(join(here, 'source', `${n}.json`), 'utf8'));
const sources = { a: source('a'), b: source('b') };

function expectedFor(fixture) {
  const lists = { never_failed: [], insufficient_history: [], identical_checks: [], flipping: [], always_failing: [] };
  for (const s of fixture.suites) {
    const [from, to] = s.cases ?? ['case-000', 'case-999'];
    const perCheck = new Map();
    for (const cell of sources[s.source].cells) {
      if (!cell.graduated || cell.case < from || cell.case > to) continue;
      let pass = 0;
      let fail = 0;
      for (const run of s.runs) {
        for (const r of cell.results[run] ?? '') {
          if (r === 'p') pass += 1;
          else if (r === 'f') fail += 1;
        }
      }
      const id = `${s.name}/${cell.case}/${cell.check}`;
      if (fail === 0 && pass >= MIN_TRIALS) lists.never_failed.push(id);
      else if (fail === 0) lists.insufficient_history.push(id);
      else if (pass === 0) lists.always_failing.push(id);
      else lists.flipping.push(id);
      if (!perCheck.has(cell.check)) perCheck.set(cell.check, []);
      perCheck.get(cell.check).push([cell.case, pass + fail, pass]);
    }
    const groups = new Map();
    for (const [check, rows] of perCheck) {
      if (rows.every(([, trials]) => trials === 0)) continue;
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
  console.log(`${f.id}: never ${lists.never_failed.length}, short ${lists.insufficient_history.length}, identical ${lists.identical_checks.map((g) => g.length).join('+') || 0}, flipping ${lists.flipping.length}, failing ${lists.always_failing.length}`);
}
