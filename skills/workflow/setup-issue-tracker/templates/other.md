# Other tracker convention template

## Agent instructions

```markdown
## Issue tracker

- Manage spec state and configured general-issue triage in <tracker and project or team>.
- Resume an issue already in progress only when the user explicitly requests it.
- Link the issue through its PR. Keep a human-written source issue open through a spec PR; close it when implementation merges.

For issue work, read [the tracker convention](docs/issue-tracker.md).
```

## Detailed convention: `docs/issue-tracker.md`

Adapt the guidance below to the repository and the currently available tool.
Keep repository-specific choices; consult current tool help for argument details.
Record how active work is recognized and claimed. An issue already in progress
requires an explicit user request to resume, even with the same assignee.

Tracker: <name>, through <tool the session verified>. Key: the issue title
starts with `spec:<slug>` followed by a space or the end of the title; match it
exactly. A spec with `Source-Issue: <tracker-qualified-ID>` reuses that issue.

<One paragraph in the user's words describing how issues are listed, found,
created, updated, assigned, and closed, covering each of the seven operations
below.>

- List managed issues: <command; returns identifier, title, and state for every
  issue in every state whose title starts with an exact `spec:<slug>` key>
- Find the issue for `docs/specs/<slug>/`: <command; fetches `Source-Issue`
  directly when present, otherwise exact title key; returns open state,
  assignee, open blockers>
- Publish: <command>
- Update title and body: <command; replaces both values for a generated
  pointer, but keeps a source issue's title and human report>
- Update blockers: <command; replaces the complete relation set by removing
  stale edges and adding missing ones>
- Claim: <command>
- Close: <command, or the pull request body reference that closes it on merge>

If general-issue triage is configured, also specify its open scope including
Backlog; `needs-triage`, `needs-info`, and `needs-decision` state/label mapping;
human comment and body-edit detection; active work and linked PR lookup; comment
and evidence publishing; duplicate disposition; and a bounded AI-section body
update that preserves the latest human report and verifies the result. Record
whether the tracker supports conditional updates; if not, report the remaining
human-edit race. Fetch `Source-Issue` issues by ID and list generated pointers
by their title key.
