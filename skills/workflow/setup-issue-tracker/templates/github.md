# Github tracker convention template

## Agent instructions

```markdown
## Issue tracker

- Manage spec state and configured general-issue triage in GitHub Issues in `<owner>/<repo>`.
- Resume an issue already in progress only when the user explicitly requests it.
- Each spec folder names its one issue with an `Issue: <tracker>:<id>` line in `spec.md`; find issues by that ID, never by title.
- Link the issue through its PR. A spec PR keeps it open; close it when implementation merges.

For issue work, read [the tracker convention](docs/issue-tracker.md).
```

## Detailed convention: `docs/issue-tracker.md`

Adapt the guidance below to the repository and the currently available tool.
Keep repository-specific choices; consult current tool help for argument details.
Record how active work is recognized and claimed. An issue already in progress
requires an explicit user request to resume, even with the same assignee.

Tracker: GitHub Issues through the `gh` CLI, on the repository `git remote`
points at. Issue ID form: `github:#<number>`, written as `Issue: github:#<n>`
in `spec.md` and in PR bodies. Titles carry no key or prefix. Address every
issue by that number; never find one by title search or by listing issues.

Spec section markers: `<!-- triage-issues:spec:start -->` and
`<!-- triage-issues:spec:end -->`. Summary section markers:
`<!-- triage-issues:triage:start -->` and `<!-- triage-issues:triage:end -->`,
the ones the triage body renderer writes. Every skill uses exactly these, so an
issue never gets a second section. The summary section opens with a
`## Triage 요약` heading inside its markers; keep it when replacing the text.

- Find: `gh issue view <n> --json number,title,state,assignees,labels,body`.
  List open blockers with `gh api
  repos/{owner}/{repo}/issues/<n>/dependencies/blocked_by --jq '[.[] |
  select(.state == "open") | .number]'`, and read any `Blocked by: #<n>` body
  line where dependencies are unavailable.
- Create: `gh issue create --title "<spec title>" --label <review label>
  --body-file -` with the bounded spec section as the whole body; read the new
  number from the returned URL.
- Refresh the spec section: re-read the body with `gh issue view <n> --json
  body`, replace only the text between the spec section markers, write it back
  with `gh issue edit <n> --body-file -`, then re-read and confirm the rest of
  the body is unchanged. Never edit the title.
- Update blockers: read every current relation, including closed blockers, with
  `gh api --paginate
  'repos/{owner}/{repo}/issues/<n>/dependencies/blocked_by?per_page=100' --jq
  '.[].number'`; collect every returned number as the complete set, compare it
  with the desired set, remove every stale edge with `gh issue edit <n>
  --remove-blocked-by <old blocker>`, and add every missing edge with `gh issue
  edit <n> --add-blocked-by <new blocker>`. Where dependencies are unavailable,
  replace the complete set of `Blocked by: #<n>` body lines so stale lines are
  removed as well as missing lines added.
- Claim: `gh issue edit <n> --add-assignee @me --add-label <active label>`,
  adding `--remove-label needs-info,needs-decision` when triage is enabled;
  the current account is `gh api user --jq .login`.
- Mark ready: after a spec-only PR merges, `gh issue edit <n> --remove-label
  <review label>`, leaving the issue open and unassigned work for `implement`.
- Close: `Closes #<n>` in the implementation pull request body closes it on
  merge into the default branch; `gh issue close <n>` when it is still open
  after the merge.

Record the label names chosen for the review and active signals, and verify
they exist in the repository before use.

When general-issue triage is enabled, extend this convention with the selected
open-issue scope (including Backlog) and the `needs-triage`, `needs-info`, and
`needs-decision` label mapping. Verify the labels in the repository before use.
The ready-for-implementation result needs no label: the summary section marks
the issue as judged, and an open, unassigned issue without the review or active
label is ready for `implement`.

- Find new issues: `gh issue list --state open --json
  number,createdAt,labels,assignees,body --limit 200`, which excludes PRs;
  keep issues whose body has no summary section markers and which carry none
  of `needs-info`, `needs-decision`, the review label, or the active label,
  oldest `createdAt` first. Filter the returned bodies locally rather than
  through search.
- Record a judgment: re-read the body with `gh issue view <n> --json body`,
  replace only the summary section, write it back with `gh issue edit <n>
  --body-file -`, re-read and confirm the rest is unchanged, then add
  `needs-info` or `needs-decision` for a waiting result and remove
  `needs-triage`.
- Dispose of a duplicate: comment with the linked earlier issue or PR, then
  `gh issue close <n> --reason "not planned"` for a duplicate or
  `--reason completed` for an already delivered request.

Record linked PR lookup. GitHub REST conditional `PATCH` is not generally
supported: verify the body after writing, recover an observed concurrent edit
when possible, and report the remaining race instead of claiming atomic
preservation.
