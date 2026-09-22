## Issue tracker

Tracker: GitHub Issues through the `gh` CLI, on the repository `git remote`
points at. Key: the issue title starts with `spec:<slug>` followed by a space
or the end of the title; match it exactly.

- List managed issues: paginate every issue with `gh api --paginate
  'repos/{owner}/{repo}/issues?state=all&per_page=100' --jq '.[] |
  select(has("pull_request") | not) | select(.title | startswith("spec:")) |
  {number,title,state}'`, then keep every title that starts with an exact
  `spec:<slug>` key; return its number, title, and state without a fixed result
  ceiling.
- Find the issue for `docs/specs/<slug>/`: `gh issue list --state all
  --search 'in:title "spec:<slug>"' --json number,title,state,assignees` and
  keep the entry whose title matches the key exactly; list open blockers with
  `gh api repos/{owner}/{repo}/issues/<n>/dependencies/blocked_by --jq
  '[.[] | select(.state == "open") | .number]'`, and read any
  `Blocked by: #<n>` body line where dependencies are unavailable.
- Publish: `gh issue create --title "spec:<slug> <spec title>" --body-file -`
  with the body derived from `spec.md`.
- Update title and body: `gh issue edit <n> --title "spec:<slug> <spec title>"
  --body-file -` with the regenerated values.
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
