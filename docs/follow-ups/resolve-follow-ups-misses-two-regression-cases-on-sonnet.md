# resolve-follow-ups misses two regression cases on Sonnet

**Symptom**: An agent on `claude-sonnet-5-5` that follows the current `resolve-follow-ups` SKILL.md fails two cases again and again. In `defect-config-utc-date`, a worker finds a separate defect but hands the coordinator only the symptom, the evidence, and the suspected cause. It leaves out what was tried and the proposed next step (2 of 2 reps). In `blocked-fetch-fails`, the origin fetch fails during a sweep, and the agent gives in to the user's request to fix on the local checkout. It edits `src/paginate.mjs`, deletes the follow-up, commits, and tries to push, all while labelling the result `blocked` (1 of 2 reps).

**Observed evidence**: The capability eval for `docs/specs/skill-regression-resolve-follow-ups/` ran on 2026-11-14 through `skill-evals/resolve-follow-ups/run.mjs`, with a `claude-opus-5-5` judge. Both cases' rows are in `skill-regression-resolve-follow-ups/cases.jsonl` at commit `fd3a463`. The judge reported the missing two fields and the local-checkout fix, and the end-state check found `src/paginate.mjs` changed and the follow-up deleted. The no-skill baseline failed both cases on both reps. Every other case passed on every rep and graduated into `skill-evals/resolve-follow-ups/regression/`.

**Suspected cause**: (a) The worker's terminal block asks only for "any newly discovered follow-up record" and does not restate the five fields at that point. (b) The sweep section never says that a failed list or fetch stops the sweep even when the user asks for a local fallback. Only the worker contract's base check covers it, and a sweep agent does not reach that check.

**What was tried**: Nothing. The spec does not allow this work to change SKILL.md, so both cases stayed out of the graduated suite as known failures.

**Proposed next step**: Revise SKILL.md so the terminal block names all five fields and the sweep refuses a local-base fallback when the fetch fails. Then restore the two case rows from `fd3a463` into a capability eval, rerun them through `run.mjs` on Sonnet, and graduate them when they pass on every rep.
