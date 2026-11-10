#!/usr/bin/env node
// Prints each variant's score per case set from the flow's results.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const flowDir = resolve(process.argv[2] ?? join(here, '../../../.claude/hillclimb/define-product-first-work-unit'));
const read = (file) => (existsSync(file) ? readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []);

for (const variant of readdirSync(flowDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()) {
  for (const set of ['train', 'held_out', 'regression']) {
    const rows = read(join(flowDir, variant, set, 'results.jsonl'));
    if (!rows.length) continue;
    const errors = read(join(flowDir, variant, set, 'errors.jsonl')).length;
    const sum = (metric) => rows.reduce((n, r) => n + (r.grade[metric] ?? 0), 0);
    const byCase = new Map();
    for (const r of rows) byCase.set(r.prompt_id, [...(byCase.get(r.prompt_id) ?? []), r.grade.pass]);
    const stable = [...byCase].filter(([, passes]) => passes.every(Boolean)).map(([id]) => id);
    const failing = [...byCase].filter(([, passes]) => !passes.every(Boolean)).map(([id, p]) => `${id}(${p.join('')})`);
    const cost = rows.reduce((n, r) => n + (r.meta?.cost_usd ?? 0) + (r.meta?.judge_cost_usd ?? 0), 0);
    console.log(`${variant} ${set}: pass ${sum('pass')}/${rows.length} (${((100 * sum('pass')) / rows.length).toFixed(0)}% ±${(100 / Math.sqrt(rows.length)).toFixed(0)}), `
      + `cases passing every rep ${stable.length}/${byCase.size}, multi_candidate ${sum('multi_candidate')}, overreach ${sum('overreach')}, `
      + `errors ${errors}, cost $${cost.toFixed(2)}`);
    if (failing.length) console.log(`  not every rep: ${failing.join(' ')}`);
  }
}
