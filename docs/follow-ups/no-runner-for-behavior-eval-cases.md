# The behavior eval cases in `evals.json` are never scored

**Symptom**: `testing.md` requires a skill change to be proven with an eval, and
every published skill carries behavior cases in `skills/<group>/<name>/evals/evals.json`,
312 of them across 24 skills. Nothing scores them. A criterion handed to `llm-evals`
with those cases as its source cannot reach a number, so it stays incomplete however
the skill text changes.

**Observed evidence**: On 2026-11-09, while implementing `docs/specs/eval-graduation/`,
the only runner in the repository was `scripts/run-claude-trigger-evals.sh`, which
reads `trigger-evals.json` and measures routing rather than behavior. `claude plugin eval`
does run behavior suites and works: one case converted to its layout
(`prompt.md` plus `graders/criteria.md`) scored 1.00 against this plugin for $0.15.
It cannot be adopted as-is, for four reasons found by trying it. Its comparison arm is
"no plugin" (`--ablation with-without`), not the previous skill text that `testing.md`
names as the baseline for a skill change. It refuses an eval dir inside `skills/`
("must not be inside the plugin's skills/ directory"), so all 312 cases would have to
move to a repository-root `evals/`. Case names must be unique across the whole suite,
while cases here are numbered from 1 per skill. And its `prompt.md` frontmatter accepts
no key for attaching the fixture directories that 25 cases list under `files`
(`add_dirs` is rejected; the accepted keys are schema_version, name, description, tags,
plugins, runs, expected_outcome, model, max_turns, timeout_seconds, allowed_tools,
disallowed_tools, artifact_publish, growthbook_overrides, append_system_prompt, env).

**Suspected cause**: The case format was vendored from mattpocock/skills along with
`writing-great-skills`, and its runner was never brought over. Cases have since been
added by hand as a written specification of expected behavior, read rather than run.

**What was tried**: A converter from `evals.json` to the `claude plugin eval` layout was
written and applied to two skills, one case was run end to end, and the result was
discarded once the baseline-arm mismatch showed the tool measures something else.
Acceptance criterion 4 of `docs/specs/eval-graduation/spec.md` was left unproven and
reported incomplete; criteria 1, 2, 3, and 6 were verified by reading the changed text,
running `claude plugin validate . --strict`, and exercising the changed rules in three
disposable workspaces. The 9 cases that criterion needs were written and committed, so
a later runner can score them.

**Proposed next step**: Build the runner this repository owns, as
`scripts/run-claude-trigger-evals.sh` already does for routing. Its entry point is a
headless `claude -p` run in a disposable workspace outside any `.claude/` folder with the
skill under test symlinked into `<ws>/.claude/skills/`, which this session exercised three
times by hand. Add two arms, the previous skill text from `git show <commit>:<path>` and
the current one, and a rubric judge scoring each case's `expectations` with structured
output. Place it at a repository eval root with the layout `testing.md` fixes, record that
root in `AGENTS.md`, and make the 9 cases in `skills/workflow/llm-evals/evals/evals.json`
and `skills/workflow/implement/evals/evals.json` added for `eval-graduation` the first
capability eval, at roughly $6 for two arms at two repetitions. The existing 312 cases
stay where they are and graduate per skill as each one's next change runs its own eval;
measuring all of them at once costs about $100 and no rule asks for it.
