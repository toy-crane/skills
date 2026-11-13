# babysit-pr's regression run drops a stopped run's scored rows from the cell history

**Symptom**: When a `skill-evals/babysit-pr/run.mjs --suite <folder>` run stops after writing some scored rows but before its last block, those rows never enter `regression/cell-history.json`. The resumed run treats them as done and skips them in `recordRow`, while `finishRun` counts them toward completion and records the model. Cells end up with fewer trials than were scored, and a failure among the dropped rows is hidden from `audit-evals`.

**Observed evidence**: Codex flagged the same pattern on `skill-evals/llm-evals/run.mjs` in toy-crane/skills PR #155 (stop after the first scored row, resume: six rows, but `llm-evals-28/e0` went from 4 to 5 trials instead of 6). `skill-evals/llm-evals/test-regression-suite.mjs` reproduced it with a fake `claude` that kills the runner on its second trial. `skill-evals/babysit-pr/run.mjs:383` has the same code: `for (const row of readRows(resultsFile)) if (!done.has(...)) recordRow(...)` after all workers finish.

**Suspected cause**: The history is updated once, after the workers, from rows not in `done`; rows written by an earlier, stopped invocation are in `done`, so no invocation ever records them. Confirmed for llm-evals; suspected identical for babysit-pr.

**What was tried**: PR #155 fixed llm-evals by recording each row in the cell history and saving it in the same synchronous step that appends the row to `results.jsonl`, the way `merge` and `audit-evals` already record inside each case. babysit-pr was left unchanged because it is outside that PR's scope.

**Proposed next step**: Apply the same per-row record-and-save in `skill-evals/babysit-pr/run.mjs` and add a stopped-then-resumed test like `skill-evals/llm-evals/test-regression-suite.mjs`'s last test.
