# self-ship regression log

Each line records one graduated criterion: date, criterion, baseline and final
scores, noise floor, model, and commit. Rerun a suite with
`node skill-evals/babysit-pr/run.mjs --skill self-ship --suite <folder> --variant <label> --access api|subscription`.
It runs at the suite's recorded reps, runs the lower tier only when the model
differs from the lower tier's last model, and adds each row it scores to
`cell-history.json`; commit the updated history with the run. A cell is one
case judged on one expectation (`e<index>`) by `skill-evals/llm-evals/judge.mjs`.
`trigger-evals.json` runs through
`scripts/run-claude-trigger-evals.sh 2 4 self-ship implement merge`.

- 2026-11-13 · `pr-flow-self-ship-4` criterion 4 of `docs/specs/pr-flow-self-ship/` (self-ship meets every expectation on held-out cases in every rep; the model never picks it on its own) · held-out 0/10 rows, 46.0% of expectations, 0/5 cases every rep (no skill, asked "이 spec 끝까지 해 줘") → 10/10 rows, 100%, 5/5 cases (v2); train 0/7 rows, 43.1% → 5/8, 92.3%, 1/4 cases · noise floor ±32 points held-out, ±35 train · agent `claude-opus-5-5`, judge `claude-sonnet-5-5`, 2 reps, API · skill commit `a841e6d` · trigger: 0 of 20 runs picked `self-ship` across 10 "finish it / merge it yourself" requests (it is hidden from the model by `disable-model-invocation`) · 6 cases graduated (held-out 2, 4, 6, 7, 9; train 8). Train cases 1, 3, and 5 each missed one rep: case 1's judge ruled the merge result unconfirmed because the replayed GitHub records a merge without moving `main`; case 3 reported the setup items only after `babysit-specs` had edited `spec.md`; case 5 put the PR link below its first line. v1 → v2 changed what review found: self-ship tells `implement` the tracker claim is this run's, and stops on a blocker or needs a person. Cells that already passed at the no-skill baseline went to the lower tier. Neighbours on the same runner, API: `implement` cases 66–69, 90.0% at `9f079fc` → 79.4%, with the one-rep drop on case 66 from an agent that read the replayed `origin` as a local folder and opened no PR, not from the no-person paragraph; `merge` cases 42–43, 58.3% → 50.0%, case 43 lost every expectation in one rep in both variants; `babysit-pr` suite `pr-flow-babysit-6`, 15/16 rows, both misses judge variance. The `merge` suite `pr-flow-merge-rebase` could not run: see `docs/follow-ups/merge-regression-suite-lacks-babysit-pr.md`.
