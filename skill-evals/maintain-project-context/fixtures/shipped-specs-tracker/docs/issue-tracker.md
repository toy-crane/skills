# Issue tracker convention

Tracker: the local tracker run by `node scripts/tracker.mjs`. Issue ID form:
`local:<n>`, written as `Issue: local:<n>`. Address every issue by number.
There is no remote; this repository's `main` is the default branch.

- Find: `node scripts/tracker.mjs view <n>`.
- Create: `node scripts/tracker.mjs create --title "<title>" --body-file <path>`;
  prints the new ID. Add `--label needs-decision` when a person must decide.
- Close: `node scripts/tracker.mjs close <n>`.

## Due date

Set or change a date with `node scripts/tracker.mjs due <n> YYYY-MM-DD`, or pass
`--due YYYY-MM-DD` to `create`. Dates are UTC. Triage takes up an issue on its
due date.

## Check issue

A post-release check becomes one issue titled `Check: <spec slug>` with the
label `post-release-check`, due on the merge date plus the period. Its body is
a section between `<!-- triage-issues:check:start -->` and
`<!-- triage-issues:check:end -->` holding a `Spec-Folder: docs/specs/<slug>/`
line, the merged PR, a `Merge-Commit:` line, the due date, and the spec's
`## Post-release check` content as written.

Lookup, open or closed:
`node scripts/tracker.mjs find --spec-folder docs/specs/<slug>/`.

## Notifications

None.
