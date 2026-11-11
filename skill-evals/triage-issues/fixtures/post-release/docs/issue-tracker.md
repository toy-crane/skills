# Issue tracker convention

Tracker: the local tracker run by `node scripts/tracker.mjs`. Issue ID form:
`local:<n>`, written as `Issue: local:<n>` in `spec.md` and in PR bodies.
Titles carry no key or prefix. Address every issue by its number.

Spec section markers: `<!-- triage-issues:spec:start -->` and
`<!-- triage-issues:spec:end -->`.

- Find: `node scripts/tracker.mjs view <n>`; returns state, labels, due date,
  body, and comments. This tracker has no assignees or blockers.
- Create: `node scripts/tracker.mjs create --title "<title>" --body-file <path>
  [--label <label>]... [--due YYYY-MM-DD]`; prints the new ID.
- Refresh the spec section: re-read with `view`, replace only the text between
  the spec markers, write with `node scripts/tracker.mjs body <n> --body-file
  <path>`, then `view` again and confirm the rest is unchanged.
- Labels: `node scripts/tracker.mjs label <n> --add <label> --remove <label>`.
- Comment: `node scripts/tracker.mjs comment <n> --body-file <path>`.
- Claim: the triage claim helper; this tracker has no assignee.
- Review signal: the `in-review` label. Active work: the `in-progress` label.
- Mark ready: remove `in-review` and `in-progress`.
- Close: `node scripts/tracker.mjs close <n>`.

General-issue triage is enabled. Scope: every open issue. `needs-info` and
`needs-decision` are labels. Not-yet-judged query: `node scripts/tracker.mjs
list --state open`; keep issues whose body has neither the
`<!-- triage-issues:triage:start -->` nor the spec section, which carry none of
`needs-info`, `needs-decision`, `in-review`, or `in-progress`, and whose `due`,
when set, is today or earlier. Order issues with a due date first, earliest
first, then the rest by `createdAt`. Stale-review query: open issues with
`in-review` and no open linked PR. Body updates are not conditional: re-read
and verify after each write.

Due date: the tracker's `due` field, a calendar date set with `--due` on
create or `node scripts/tracker.mjs due <n> YYYY-MM-DD`. Time zone: UTC.

Check issue: created by `merge` after an implementation PR whose spec folder
has a `## Post-release check` section other than `None.`.
- Title: `Post-release check: <spec title>`.
- State: open, with the `post-release-check` label and no other label.
- Assignee: none.
- Body, as the whole issue body:

```markdown
<!-- triage-issues:check:start -->
## Post-release check

Spec-Folder: docs/specs/<slug>/
Merged: <merged PR URL> at <merge timestamp>
Merge-Commit: <merge commit SHA on the base>
Due: <YYYY-MM-DD>

<the spec's `## Post-release check` content, copied as written>
<!-- triage-issues:check:end -->
```

- Find an existing one: `node scripts/tracker.mjs list --state all --label
  post-release-check`, keeping the issue whose check section carries the
  folder's exact `Spec-Folder:` line.
- Create: `node scripts/tracker.mjs create --title "<title>" --label
  post-release-check --due <YYYY-MM-DD> --body-file <path>`.

Notifications: None.
