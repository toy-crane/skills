# babysit-pr regression log

Each line records one graduated criterion: date, criterion, baseline and final
scores, noise floor, model, and commit. Rerun a suite with
`node skill-evals/babysit-pr/run.mjs --skill babysit-pr --suite <folder> --variant <label> --access subscription`.
It runs at the suite's recorded reps, runs the lower tier only when the model
differs from the lower tier's last model, and adds each row it scores to
`cell-history.json`; commit the updated history with the run. A cell is one
case judged on one expectation (`e<index>`) by `skill-evals/llm-evals/judge.mjs`.

- 2026-11-13 · `pr-flow-babysit-6` criterion 6 of `docs/specs/pr-flow-babysit/` (babysit-pr meets every expectation on held-out cases in every rep) · held-out 1/8 rows, 85.0% of expectations, 0/4 cases every rep (no skill) → 8/8 rows, 100%, 4/4 cases (v2); train 2/12 rows, 78.1% → 11/12, 98.6% · noise floor ±35 points held-out, ±29 train · agent `claude-opus-5-5`, judge `claude-sonnet-5-5`, 2 reps, subscription · skill commit `4fdaa7f` · 9 cases graduated (held-out 2, 4, 6, 10; train 3, 5, 7, 8, 9); case 1 did not, its rep 1 miss is judge variance: the judge's own evidence says the agent note satisfies the expectation yet it ruled unmet over a `Co-Authored-By` line in a commit message, which the expectation does not cover. v1 → v2 changed one thing: a person's comment is finished, committed, pushed, and answered before any bot thread (train case 5 failed both reps on v1). Cells that already passed at the no-skill baseline went to the lower tier: no case recorded what it guards against.
