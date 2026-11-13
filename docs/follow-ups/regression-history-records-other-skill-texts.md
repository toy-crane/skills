# A baseline run on a regression suite writes into its cell history

**Symptom**: The skill-eval runners that keep `regression/cell-history.json`
add every scored row of a regression-suite run to that history, whatever
skill text the run tested. A run with `--skill-ref` or `--skill-file`, such as
a climb's baseline on the regression suite, records the old text's results as
the suite's own. On a model the lower tier has not run on, it also sets
`lower_tier_model`, so the next run of the current text skips lower-tier cells
that text never ran.

**Observed evidence**: Codex flagged it as a P2 on toy-crane/skills#156 for
`skill-evals/implement/run.mjs`. The merge runner has the same shape:
`skill-evals/merge/run.mjs` calls `recordRow` and `finishRun` behind
`if (history)` only, and `history` is loaded whenever the suite sits under
`regression/`, while the same runner accepts `--skill-ref` for a baseline.
`skill-evals/audit-evals/run.mjs`, `skill-evals/babysit-pr/run.mjs`, and
`skill-evals/llm-evals/run.mjs` also import `audit-evals/history.mjs` and take
`--skill-ref`; they were not checked line by line.

**Suspected cause**: The runners gate history writes on where the suite lives,
not on which skill text is under test. Suspected to have spread by copying the
merge runner's pattern.

**What was tried**: `2120be3` fixed only the implement runner. It still plans
tiers from the history but writes rows and models only when neither
`--skill-ref` nor `--skill-file` is passed. The other runners are unchanged.

**Proposed next step**: In each runner that imports `history.mjs`, check
whether a `--skill-ref` or `--skill-file` regression run reaches `recordRow`
or `finishRun`, and apply the same gate where it does.
