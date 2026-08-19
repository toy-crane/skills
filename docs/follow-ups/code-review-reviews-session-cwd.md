# code-review reviews the session's working directory, not the agent's target repository

## Symptom

A subagent working inside repository A invoked the Claude Code `code-review`
skill. The reviewer ran, but reviewed repository B — the parent session's
working directory — and returned findings about files that do not exist in
repository A. The invoking agent received a confident, well-formed review of
the wrong change.

## Observed evidence

Claude Code 2.1.235, 2026-08-19. A `general-purpose` subagent was launched from
a session whose cwd was
`/Users/toycrane/code/skills/.claude/worktrees/cool-merkle-f7031c` and was told
to work only inside a fixture repository under the session scratchpad. It
implemented and verified the fixture, then invoked `Skill(code-review, "medium")`
once.

The returned review stated its own scope as "`git diff main...HEAD` is empty, so
I reviewed `git diff HEAD` (11 files) plus the untracked spec
`docs/specs/one-pass-review/spec.md`" and produced 8 findings naming
`skills/workflow/implement/SKILL.md`, `skills/workflow/implement/evals/evals.json`,
`docs/decisions/pipeline.md`, and `README.md`. None of those paths exist in the
fixture; the fixture's own diff was 5 files. The subagent detected the mismatch
itself and repaired nothing from that review.

The same review also reported that its `ReportFindings` tool was unavailable in
that context and printed its findings as text instead.

## Suspected cause

The reviewer resolves its diff target from the session's working directory
rather than from the invoking agent's working directory, so a subagent whose
work lives outside the session cwd cannot review its own change. Not confirmed
against Claude Code's implementation.

## What was tried

Only the single observation above. It was not retried, and no attempt was made
to pass an explicit path target to `code-review` to see whether that overrides
the inherited directory.

## Proposed next step

Reproduce deliberately: from a session rooted at repository A, launch a subagent
that changes repository B and invoke `code-review` with and without an explicit
path argument. If the inherited directory wins in both cases, decide whether
`implement` should require the reviewer's reported scope to match the intended
diff before its findings are triaged, and record that as a decision rather than
leaving it to each session to notice.
