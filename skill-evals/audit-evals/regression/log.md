# audit-evals regression log

Each line records one graduated criterion: date, criterion, baseline and final
scores, noise floor, model, and commit. Rerun a suite with
`node skill-evals/audit-evals/run.mjs --variant <label> --access subscription --suite <folder>`;
`--suite evals` runs `evals.json` with the expectation judge. The suite's cells
are in `cell-history.json`.

- 2026-11-12 · `eval-suite-audit-3` criterion 3 (the four lists, judged on each cell's most recent 10 trials, equal the reference lists) · held-out 0/18 rows, 0/6 cases (no skill) → 18/18 rows, 6/6 cases (v2); train 0/9 → 9/9 · noise floor ±24 points held-out · agent `claude-opus-5-5`, programmatic grader, 3 reps, subscription · skill commit `aeb6fea` · 9 cases graduated (held-out 6, train 3). `evals.json` (criterion 4) on the same text: no skill 2/15 rows, 52.5% of expectations → v2 14/15, 98.3% (±26 points); one recorded miss, judge variance: `evals-2` rep 1 failed because the judge agreed the reply named the bar of 10 trials yet ruled unmet an expectation that naming the bar satisfies. `llm-evals` `evals.json` against its text at `ceb2106`, 2 reps, judge `claude-sonnet-5-5`, skill commit `e25ef49`: new cases 21–27 3/14 → 13/14 rows (±27 points), with 21–26 passing every rep. Case 25 first had no fixture, and every variant correctly refused to invent the eval files; with its `graduation` fixture (commit `b7bef68`) it scored baseline 0/2 rows (20% of expectations) → v2 2/2 (100%), rerun alone. One recorded miss, judge variance: `evals-27` rep 0 failed because the judge read the reply's to-do item asking for the three cases' guards as a generic request rather than a question about each case. Existing cases 1–20 28/40 rows, 74.2% of expectations → 26/40, 74.1% (±16 points).
