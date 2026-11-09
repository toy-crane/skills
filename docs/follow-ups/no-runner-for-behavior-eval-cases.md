# The behavior eval cases in `evals.json` have no runner in this repository

**Symptom**: `testing.md` requires a skill change to be proven with an eval, and
every published skill carries behavior cases in `skills/<group>/<name>/evals/evals.json`,
but nothing in this repository runs them. A criterion that hands `llm-evals` those
cases cannot reach a score, so it stays incomplete no matter how the skill text
changes.

**Observed evidence**: On 2026-11-09, while implementing `docs/specs/eval-graduation/`,
a search for a runner found only `scripts/run-claude-trigger-evals.sh`, which reads
`trigger-evals.json` and measures routing rather than behavior. `claude plugin eval`
expects `<eval dir>/**/case.yaml` or `prompt.md` plus `graders/*.md`, not the
`{id, prompt, expected_output, expectations, files}` shape these files use, and
`.claude-plugin/plugin.json` carries no eval configuration. No README, `AGENTS.md`,
or decision contract documents how the cases are scored.

**Suspected cause**: The case format was vendored from mattpocock/skills along with
`writing-great-skills`, and its runner was never brought over. Cases have since been
added by hand as a written specification of expected behavior, graded by reading
them rather than by running them.

**What was tried**: Nothing was built. Acceptance criterion 4 of
`docs/specs/eval-graduation/spec.md` was left unproven and the criterion reported
incomplete; criteria 1, 2, 3, and 6 were verified deterministically by reading the
changed text and running `claude plugin validate . --strict`. The cases for that
criterion were still written and committed, so a later runner can score them.

**Proposed next step**: Shape the runner as its own work unit. Its entry point is a
headless agent run per case in a disposable workspace outside any `.claude/` folder
with the skill under test installed, two arms for the previous and current skill
text, and a rubric judge scoring each case's `expectations` with structured output.
Decide there whether to convert the case files to the format `claude plugin eval`
reads instead of building a separate harness, and size the run: 70 existing cases
plus 9 new ones across two arms and two repetitions is far past what a single run
can afford, so the sampling rule is part of that decision.
