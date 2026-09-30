# Linear tracker convention template

## Agent instructions

```markdown
## Issue tracker

- Manage spec state and configured general-issue triage in Linear team `<team>`.
- Resume an issue already in progress only when the user explicitly requests it.
- Link the issue through its PR. A spec PR keeps its human-written source issue open; close it when implementation merges.

For issue work, read [the tracker convention](docs/issue-tracker.md).
```

## Detailed convention: `docs/issue-tracker.md`

Adapt the guidance below to the repository and the currently available tool.
Keep repository-specific choices; consult current tool help for argument details.
Record how active work is recognized and claimed. An issue already in progress
requires an explicit user request to resume, even with the same assignee.

Tracker: Linear, team `<team key>`, through <the Linear MCP server or CLI this
session verified>. Key: the issue title starts with `spec:<slug>` followed by a
space or the end of the title; match it exactly. A spec carrying
`Source-Issue: linear:<identifier>` uses that existing issue instead.

- List managed issues: search the team for every issue in every state whose
  title starts with an exact `spec:<slug>` key, returning its identifier, title,
  and state.
- Find the issue for `docs/specs/<slug>/`: fetch its `Source-Issue` identifier
  directly when present; otherwise search the team's issues by title and keep
  the exact key match. Read state, assignee, and open blocking relations.
- Publish: create an issue titled `spec:<slug> <spec title>` with the body
  derived from `spec.md`.
- Update title and body: replace a generated pointer's title and description
  with the regenerated values. Keep a source issue's human title and update
  only its bounded spec section through the operation recorded below.
- Update blockers: replace the complete "blocked by" relation set, removing
  stale blocker issues and adding missing ones.
- Claim: assign the issue to the current Linear user and move it to the
  team's in-progress state. Record which states count as active, including
  review states when applicable. The same assignee does not prove resumption.
- Close: record the PR closing reference and the team's verified integration
  behavior. After merge, move the issue to the team's done state if the
  integration has not closed it.

When general-issue triage is enabled, record which team states are open and
which include Backlog. Map `needs-triage` to native Triage or a label as
appropriate, and verify the selected `needs-info` and `needs-decision` labels.
Record comment and human-edit detection, linked PR lookup, evidence attachments,
and duplicate disposition. Exclude exact `spec:<slug>` pointers from triage.
Record an operation that re-reads the latest description and updates only
bounded AI-managed sections while preserving human content. Record whether
the available tool conditionally updates descriptions; otherwise re-read and
verify after writing, recover any observed human edit, and report the remaining
race. For a folder with `Source-Issue`, fetch that issue
directly by ID; the title-key listing remains the inventory of generated pointers.
