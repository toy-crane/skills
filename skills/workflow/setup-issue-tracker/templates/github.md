# Github tracker convention template

## Agent instructions

```markdown
## Issue tracker

- Manage spec state and configured general-issue triage in GitHub Issues in `<owner>/<repo>`.
- Resume an issue already in progress only when the user explicitly requests it.
- Link the issue through its PR. A spec PR keeps its human-written source issue open; close it when implementation merges.

For issue work, read [the tracker convention](docs/issue-tracker.md).
```

## Detailed convention: `docs/issue-tracker.md`

Adapt the guidance below to the repository and the currently available tool.
Keep repository-specific choices; consult current tool help for argument details.
Record how active work is recognized and claimed. An issue already in progress
requires an explicit user request to resume, even with the same assignee.

Tracker: GitHub Issues through the `gh` CLI, on the repository `git remote`
points at. Key: the issue title starts with `spec:<slug>` followed by a space
or the end of the title; match it exactly. A spec carrying
`Source-Issue: github:<owner>/<repo>#<number>` uses that existing issue instead.

- List managed issues: paginate every issue with `gh api --paginate
  'repos/{owner}/{repo}/issues?state=all&per_page=100' --jq '.[] |
  select(has("pull_request") | not) | select(.title | startswith("spec:")) |
  {number,title,state}'`, then keep every title that starts with an exact
  `spec:<slug>` key; return its number, title, and state without a fixed result
  ceiling.
- Find the issue for `docs/specs/<slug>/`: when it records `Source-Issue`,
  fetch that issue number directly with `gh issue view <n> --json
  number,title,state,assignees,body`; otherwise filter the complete paginated
  `List managed issues` inventory above by the exact `spec:<slug>` key, then
  fetch the matching issue by number for its assignee and body. Do not use the
  default-limited `gh issue list` result to prove absence. List open blockers with
  `gh api repos/{owner}/{repo}/issues/<n>/dependencies/blocked_by --jq
  '[.[] | select(.state == "open") | .number]'`, and read any
  `Blocked by: #<n>` body line where dependencies are unavailable.
- Publish: `gh issue create --title "spec:<slug> <spec title>" --body-file -`
  with the body derived from `spec.md`.
- Update title and body: for a generated pointer use `gh issue edit <n>
  --title "spec:<slug> <spec title>" --body-file -` with the regenerated
  values. For a source issue, keep its title and use the bounded body-section
  operation recorded below.
- Update blockers: read every current relation, including closed blockers, with
  `gh api --paginate
  'repos/{owner}/{repo}/issues/<n>/dependencies/blocked_by?per_page=100' --jq
  '.[].number'`; collect every returned number as the complete set, compare it
  with the desired set, remove every stale edge with `gh issue edit <n>
  --remove-blocked-by <old blocker>`, and add every missing edge with `gh issue
  edit <n> --add-blocked-by <new blocker>`. Where dependencies are unavailable,
  replace the complete set of `Blocked by: #<n>` body lines so stale lines are
  removed as well as missing lines added.
- Claim: `gh issue edit <n> --add-assignee @me`; the current account is
  `gh api user --jq .login`.
- Close: `Closes #<n>` in the implementation pull request body closes it on
  merge into the default branch; `gh issue close <n>` when it is still open
  after the merge.

When general-issue triage is enabled, extend this convention with the selected
open-issue scope (including Backlog), `needs-triage`, `needs-info`, and
`needs-decision` label mapping, comment and human-edit detection, linked PR
lookup, evidence attachments, and duplicate disposition. Verify the labels in
the repository before use. Exclude PRs from the issue listing and exact
`spec:<slug>` pointers from triage. Record an operation that, after a spec-only
PR merges, re-reads the latest issue state, clears review or in-progress labels,
and leaves the source issue open in a non-active ready state for implementation;
do not add `needs-triage` again. Record an operation that re-reads the latest
body and updates only bounded AI-managed sections while preserving human
content. GitHub REST conditional `PATCH` is not generally supported: verify
the body after writing, recover an observed concurrent edit when possible, and
report the remaining race instead of claiming atomic preservation. For a
folder with `Source-Issue`, fetch that issue directly by ID; the exact-title
listing above remains the inventory of generated pointers.
