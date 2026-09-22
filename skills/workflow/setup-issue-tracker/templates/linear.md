# Linear tracker convention template

## Agent instructions

```markdown
## Issue tracker

- Manage spec state in Linear team `<team>`.
- Resume an issue already in progress only when the user explicitly requests it.
- Link the issue through its PR and close it when the PR merges.

For issue work, read [the tracker convention](docs/issue-tracker.md).
```

## Detailed convention: `docs/issue-tracker.md`

Adapt the guidance below to the repository and the currently available tool.
Keep repository-specific choices; consult current tool help for argument details.
Record how active work is recognized and claimed. An issue already in progress
requires an explicit user request to resume, even with the same assignee.

Tracker: Linear, team `<team key>`, through <the Linear MCP server or CLI this
session verified>. Key: the issue title starts with `spec:<slug>` followed by a
space or the end of the title; match it exactly.

- List managed issues: search the team for every issue in every state whose
  title starts with an exact `spec:<slug>` key, returning its identifier, title,
  and state.
- Find the issue for `docs/specs/<slug>/`: search the team's issues by title,
  keep the exact key match, and read its state, assignee, and open blocking
  relations.
- Publish: create an issue titled `spec:<slug> <spec title>` with the body
  derived from `spec.md`.
- Update title and body: replace the issue title and description with the
  regenerated values.
- Update blockers: replace the complete "blocked by" relation set, removing
  stale blocker issues and adding missing ones.
- Claim: assign the issue to the current Linear user and move it to the
  team's in-progress state. Record which states count as active, including
  review states when applicable. The same assignee does not prove resumption.
- Close: record the PR closing reference and the team's verified integration
  behavior. After merge, move the issue to the team's done state if the
  integration has not closed it.
