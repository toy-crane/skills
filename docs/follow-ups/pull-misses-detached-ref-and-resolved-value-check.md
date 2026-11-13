# pull misses a recoverable ref on detached work and a check of a resolved value

**Symptom**: Following the current `pull` text on Sonnet, an agent rebased a
detached HEAD that carried a commit no branch held without first leaving a branch
or tag on it, and in another run it resolved an evidence-backed conflict without
checking the resolved value afterwards. Both cases failed one of two repetitions,
so they did not graduate into `skill-evals/pull/regression/skill-regression-pull/`.

**Observed evidence**: On 2026-11-14, while implementing
`docs/specs/skill-regression-pull/`, `node skill-evals/pull/run.mjs --variant v1
--access api --reps 2` (agent `claude-sonnet-5-5`, Opus 5.5 rubric judge) scored
case `detached-undisclosed` (`p p p p`, then `p f p p`) and case
`timeout-rename-conflict` (`p p p p`, then `p p f p`). The judge's evidence for the
first: "The agent made no branch or tag before running `git rebase origin/main`".
For the second, the report named the base and incoming commit but did not re-read
`src/http.js` after resolving it. The no-skill baseline failed
`timeout-rename-conflict`'s same check on both repetitions. Both scenarios remain
in `skill-evals/pull/regression/skill-regression-pull/fixtures.mjs`, and their
cases and expectations are in that folder's history at the commit that added the
runner.

**Suspected cause**: Suspected: `pull`'s text says "keep the original work
recoverable" only for an ambiguous conflict, and says nothing about a detached
checkout or about checking a resolution before finishing, so Sonnet does both only
some of the time.

**What was tried**: Nothing. The spec keeps `pull`'s `SKILL.md` unchanged and
records failing cases as known failures.

**Proposed next step**: Shape a work unit for `pull` that names a detached
checkout's recoverable ref and a check of every resolved conflict, then climb it
with `llm-evals` on these two cases, with the graduated `skill-regression-pull`
suite as the regression guard.
