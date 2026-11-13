# llm-evals regression log

Each line records one graduated criterion: date, criterion, baseline and final
scores, noise floor, model, and commit. Rerun a suite with
`node skill-evals/llm-evals/run.mjs --suite <folder> --variant <label> --access api|subscription`.
It runs at the suite's recorded reps, runs the lower tier only when the model
differs from the lower tier's last model, and adds each row it scores to
`cell-history.json`; commit the updated history with the run. A cell is one
case judged on one expectation (`e<index>`) by `judge.mjs`. `evals.json` keeps
every case, graduated or not, for climbs on this skill.

- 2026-11-14 · `eval-unanswered-trials` criterion 2 of `docs/specs/eval-unanswered-trials/` (an agent following llm-evals keeps unanswered trials out of the score and does not tie concurrency to the access choice; ≥90% of expectations on the new cases) · new cases 28–31: 2/8 rows, 62.5% of expectations (baseline, text at `3822cd2`) → 7/8 rows, 95.8% (v2), scored whole and read directionally · noise floor ±35 points · agent `claude-opus-5-5`, judge `claude-sonnet-5-5`, 2 reps, API · skill commit `27d134e` · 3 cases graduated (28, 29, 31). Case 30 did not: v2 failed rep 0 because the agent asked the access question only after finding the files missing; it stays in `evals.json` as a known failure. Case 29 passed at the baseline and guards against counting limit-cut rows as fails or reading a partly filled run as green, so its cells went to the upper tier; the other cells that passed at the baseline went to the lower tier. Existing cases 1, 5, 6, 13, 18 on the same text: 64.0% → 55.3% of expectations (±32 points); the misses are judge variance and cases without fixtures, as at the baseline. First suite run, 2026-11-14 on the same text (API, `claude-opus-5-5`): 4/6 rows, 93.3% of expectations; the misses were `llm-evals-28` e4 rep 0 and `llm-evals-29` e3 rep 1, both judge variance — each verdict's own evidence says the expectation is met.
