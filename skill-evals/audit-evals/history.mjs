// Keeps regression/cell-history.json (version 2) for audit-evals' regression runs, the way
// llm-evals asks: every newly scored row adds a trial to each of its case's cells whose tier ran,
// and appends its result to the cell's recent window, which keeps the last 10.
import { readFileSync, writeFileSync } from 'node:fs';

export const WINDOW = 10;

export function loadHistory(path) {
  const h = JSON.parse(readFileSync(path, 'utf8'));
  if (h.version !== 2) throw new Error(`${path}: expected cell history version 2`);
  return h;
}

export function saveHistory(path, h) {
  writeFileSync(path, `${JSON.stringify(h, null, 1)}\n`);
}

// The upper tier always runs; the lower tier only when this run's model differs from the model it
// last ran on. A case runs when one of its cells is in a tier that runs.
export function planTiers(h, suite, model) {
  const body = h.suites[suite];
  if (!body) throw new Error(`the cell history has no suite ${suite}`);
  const hasLower = Object.values(body.cells).some((row) => Object.values(row).some((c) => c.tier === 'lower'));
  const lowerRuns = hasLower && body.lower_tier_model !== model;
  const runsCase = (id) => Object.values(body.cells[id] ?? {}).some((c) => c.tier === 'upper' || lowerRuns);
  return { lowerRuns, runsCase };
}

// Adds one scored row. Call it once per row, only for rows this run scored.
export function recordRow(h, suite, row, { model, lowerRuns }) {
  const body = h.suites[suite];
  let lowerRecorded = false;
  for (const [check, c] of Object.entries(body.cells[row.prompt_id] ?? {})) {
    if (c.tier === 'lower' && !lowerRuns) continue;
    const g = row.grade?.[check];
    if (typeof g !== 'number') continue;
    const passed = g >= 1;
    c.trials += 1;
    c.passes += passed ? 1 : 0;
    c.recent = `${c.recent}${passed ? 'p' : 'f'}`.slice(-WINDOW);
    lowerRecorded ||= c.tier === 'lower';
  }
  body.last_run_model = model;
  if (lowerRecorded) body.lower_tier_model = model;
}
