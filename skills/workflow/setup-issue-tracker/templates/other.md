# Other tracker convention template

## Agent instructions

```markdown
## Issue tracker

- Manage spec state in <tracker and project or team>.
- Resume an issue already in progress only when the user explicitly requests it.
- Link the issue through its PR and close it when the PR merges.

For issue work, read [the tracker convention](docs/issue-tracker.md).
```

## Detailed convention: `docs/issue-tracker.md`

Adapt the guidance below to the repository and the currently available tool.
Keep repository-specific choices; consult current tool help for argument details.
Record how active work is recognized and claimed. An issue already in progress
requires an explicit user request to resume, even with the same assignee.

Tracker: <name>, through <tool the session verified>. Key: the issue title
starts with `spec:<slug>` followed by a space or the end of the title; match it
exactly.

<One paragraph in the user's words describing how issues are listed, found,
created, updated, assigned, and closed, covering each of the seven operations
below.>

- List managed issues: <command; returns identifier, title, and state for every
  issue in every state whose title starts with an exact `spec:<slug>` key>
- Find the issue for `docs/specs/<slug>/`: <command; returns open state,
  assignee, open blockers>
- Publish: <command>
- Update title and body: <command; replaces both derived values>
- Update blockers: <command; replaces the complete relation set by removing
  stale edges and adding missing ones>
- Claim: <command>
- Close: <command, or the pull request body reference that closes it on merge>
