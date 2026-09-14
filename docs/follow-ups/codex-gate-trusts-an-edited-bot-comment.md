# The Codex review gate trusts a bot comment a maintainer can edit

**Symptom**: `codex-review-gate` decides pass or fail from the body of the
review summary comment authored by `chatgpt-codex-connector[bot]`. GitHub lets
an account with write access edit another author's comment, including a bot's,
without changing the comment's author. Editing a completed code-review row for
the current head commit into that comment turns the gate green on a pull
request Codex never reviewed. The comment shows an "edited" marker, but the
gate does not read it. This defeats the gate for exactly the account it is
meant to constrain, on a control whose ruleset bypass list is deliberately
empty.

**Observed evidence**: Found by the automated review of the whole diff on
branch `claude/codex-github-gate-review-mdzgsf`, 2026-09-14, against
`docs/specs/codex-review-gate/spec.md`. The gate authenticates only
`user.login` and `user.type` of the comment
(`.github/workflows/codex-review-gate.yml`, `codex_summary_body`); nothing
reads edit history. The REST issue-comments payload used by the gate carries
`created_at` and `updated_at` but no editor identity, confirmed against
`repos/toy-crane/skills/issues/106/comments`.

**Suspected cause**: Comment authorship is not comment integrity on GitHub.
The only surface that names who edited a comment is the GraphQL
`IssueComment.userContentEdits` connection with its `editor` field, and the
gate reads REST only.

**What was tried**: Nothing was changed for this item. A GraphQL query for
`userContentEdits { editor { login } }` on a Codex comment was attempted to
learn what GitHub reports for the bot's own repeated self-edits, which the gate
would have to keep accepting. GraphQL is blocked from Claude Code sessions
(HTTP 403, "use the REST API"), so the semantics could not be established and
no unverified query was shipped into a merge-blocking control. Three other
findings from the same review were fixed: the trigger moved to
`pull_request_target` so a pull request cannot run its own edited copy of the
gate, concurrency moved to the job so a skipped run cannot cancel a live
evaluation, and the status-cell test now rejects wordings such as "Not
completed".

**Proposed next step**: From an environment where GitHub GraphQL is reachable,
query `userContentEdits(first: 100) { nodes { editedAt editor { login } } }`
for a Codex summary comment that Codex has edited itself several times, such as
the one on pull request #106, and confirm what `editor` reports for an app's
self-edit. If self-edits report the app or null, make the gate reject a summary
comment whose edit history names any editor other than
`chatgpt-codex-connector[bot]`, and add a case for it alongside the existing
impostor cases. If the semantics are ambiguous, put the residual risk to the
repository owner as a decision instead.
