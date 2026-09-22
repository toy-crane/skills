## Issue tracker

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
- Update body: replace the issue description with the regenerated body.
- Update blockers: set "blocked by" relations to the blocker issues.
- Claim: assign the issue to the current Linear user.
- Close: Linear does not close on merge by itself, so `merge` moves the issue
  to the team's done state after the implementation pull request merges; the
  pull request body still names the issue identifier.
