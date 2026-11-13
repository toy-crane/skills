# merge regression log

Each line records one graduated criterion: date, criterion, baseline and final
scores, noise floor, model, and commit. Rerun a suite with
`node skill-evals/merge/run.mjs --variant <label> --access subscription --suite <folder>`;
`--suite evals` runs `evals.json` with the same judge.

- 2026-11-13 · `pr-flow-merge-rebase` criterion 2 (after a rebase merge checks the commits with range-diff and catches re-added base changes, re-verifies behavior that incoming base commits overlap, refetches the base right before merging, and holds a PR whose `Blocked by:` work is not on the base) · held-out 4/12 rows, 2/6 cases (baseline, `401037b`) → 12/12 rows, 6/6 cases (v4); train 6/12 → 12/12 (v1 10/12, v2 10/12, v3 12/12, v4 12/12); v3's held-out gate was 11/12, when an agent skipped the rebase because the incoming commit looked unrelated, which v4 closed · noise floor ±29 points held-out · agent `claude-sonnet-5-5`, judge `claude-opus-5-5`, 2 reps, subscription · skill commit `3d73882` · 12 cases graduated (held-out 6, train 6). `evals.json` on the same runner: baseline 19/70 rows → v4 19/69 (one judge error); evals-3 and evals-4 each lost one rep that the baseline passed, evals-26 and evals-41 each gained one, all inside the ±12-point noise floor; v3's drops on evals-5, 25, and 40 were checked and concern repository lookup, MERGED confirmation, and closed check issues, not this change.
