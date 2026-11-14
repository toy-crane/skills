# triage-issues misses four of its own rules on Sonnet

**Symptom**: With the current `triage-issues` `SKILL.md` (sha `7fb5bad7e4df`) on `claude-sonnet-5-5`, 6 of 17 regression cases fail on at least one of 2 reps. The held-out score is 85.9% against the 90% target in `docs/specs/skill-regression-triage-issues/`. Four behaviors break:

- **(a) Long nothing-to-see report.** When nothing is due, the report is not one line. The agent writes the right first line, then adds a bullet for each skipped issue and a closing line. Failed in `nothing-due-gh` (0/2 reps), `check-not-due-linear` (0/2), and `nothing-due-linear-notify` (1/2).
- **(b) Dropped claim token.** The agent ran `claim.sh` in a loop and kept only the SHA (`awk '{print $1}'`). It lost the secret token, so it could not verify or release the claims, and it stopped without triaging. Seen in `limit-three-gh` rep 1, `limit-three-linear` rep 0, and `triaged-batch-gh` rep 1.
- **(c) Unrequested summary.** In `limit-three-gh` rep 0, no summary was requested, but the report still added a "not inspected this run" section about issues past the three-issue limit.
- **(d) Wrong waiting label.** In `triaged-batch-gh`, on both reps, the vague request "알림을 덜 받고 싶다" got `needs-info` with open questions. The case expects `needs-decision` with options and a recommendation.

**Observed evidence**: The regression climb ran on 2026-11-14 with `node skill-evals/triage-issues/run.mjs --variant v1 --access api --reps 2`: agent `claude-sonnet-5-5`, judge `claude-opus-5-5`, Claude Code 2.1.323. The judge's evidence for each failed row is in that run's `results.jsonl` `meta.verdicts`; the results folder is not committed. The six cases are kept in `skill-evals/triage-issues/regression/skill-regression-triage-issues/known-failures.jsonl`, and `skill-evals/triage-issues/regression/log.md` records the scores.

**Suspected cause** (all four unconfirmed):

- (a) and (c): the one-line rule comes last in "Report the run". The general instruction to list what each issue left comes first and wins.
- (b): the claim section says "Keep the returned SHA and secret token". It does not say the helper prints both on one line, separated by a space.
- (d): the skill never says which label a request with no chosen option gets: `needs-info` (a missing fact) or `needs-decision` (a product choice).

**What was tried**: Nothing. The spec forbids changing `SKILL.md` in this work, so these cases were recorded as known failures and not graduated.

**Proposed next step**: Write a spec that revises `triage-issues` on these four points. Climb it with `node skill-evals/triage-issues/run.mjs --variant <label> --access api --known-failures`, and use `--suite skill-regression-triage-issues` as its gate. Graduate the cases that then pass on every rep into `cases.jsonl`.
