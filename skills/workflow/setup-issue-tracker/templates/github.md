## Issue tracker

Tracker: GitHub Issues through the `gh` CLI, on the repository `git remote`
points at. Key: the issue title starts with `spec:<slug>` followed by a space
or the end of the title; match it exactly.

- Find the issue for `docs/specs/<slug>/`: `gh issue list --state all
  --search 'in:title "spec:<slug>"' --json number,title,state,assignees` and
  keep the entry whose title matches the key exactly; list open blockers with
  `gh api repos/{owner}/{repo}/issues/<n>/dependencies/blocked_by --jq
  '[.[] | select(.state == "open") | .number]'`, and read any
  `Blocked by: #<n>` body line where dependencies are unavailable.
- Publish: `gh issue create --title "spec:<slug> <spec title>" --body-file -`
  with the body derived from `spec.md`.
- Update body: `gh issue edit <n> --body-file -` with the regenerated body.
- Update blockers: GitHub native dependencies, `gh api --method POST
  repos/{owner}/{repo}/issues/<n>/dependencies/blocked_by -F
  issue_id=<blocker database id>`; fall back to a `Blocked by: #<n>` line in
  the body where dependencies are unavailable.
- Claim: `gh issue edit <n> --add-assignee @me`; the current account is
  `gh api user --jq .login`.
- Close: `Closes #<n>` in the implementation pull request body closes it on
  merge into the default branch; `gh issue close <n>` when it is still open
  after the merge.
