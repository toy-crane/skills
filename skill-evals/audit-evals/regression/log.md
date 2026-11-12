# audit-evals regression log

Each line records one graduated criterion: date, criterion, baseline and final
scores, noise floor, model, and commit. Rerun a suite with
`node skill-evals/audit-evals/run.mjs --variant <label> --access subscription --suite <folder>`;
`--suite evals` runs `evals.json` with the expectation judge. The suite's cells
are in `cell-history.json`.

- 2026-11-12 · `eval-suite-audit-3` criterion 3 (the four lists, judged on each cell's most recent 10 trials, equal the reference lists) · held-out 0/18 rows, 0/6 cases (no skill) → 18/18 rows, 6/6 cases (v2); train 0/9 → 9/9 · noise floor ±24 points held-out · agent `claude-opus-5-5`, programmatic grader, 3 reps, subscription · skill commit `aeb6fea` · 9 cases graduated (held-out 6, train 3). `evals.json` (criterion 4) on the same text: no skill 2/15 rows, 52.5% of expectations → v2 14/15, 98.3% (±26 points); the one miss, `evals-2` rep 1, is a judge verdict that the reply named the bar of 10 trials yet failed an expectation satisfied by naming it. `llm-evals` `evals.json` against its text at `ceb2106`, 2 reps, judge `claude-sonnet-5-5`, skill commit `e25ef49`: new cases 21–27 3/14 → 11/14 rows (±27 points), with 21–24 and 26 passing every rep; 25 failed every rep of every variant because the case has no fixture, so no run can write the cell history it expects; 27 missed one rep on whether a to-do list counts as asking what each case guards. Existing cases 1–20 28/40 rows, 74.2% of expectations → 26/40, 74.1% (±16 points).
