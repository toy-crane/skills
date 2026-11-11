# Issue tracker convention

Tracker: the local tracker run by `node scripts/tracker.mjs`. Issue ID form:
`local:<n>`, written as `Issue: local:<n>`. Address every issue by number.

- Find: `node scripts/tracker.mjs view <n>`.
- Create: `node scripts/tracker.mjs create --title "<title>" --body-file <path>`;
  prints the new ID. Add `--label needs-decision` when a person must decide.
- Close: `node scripts/tracker.mjs close <n>`.

## Due date

Set or change a date with `node scripts/tracker.mjs due <n> YYYY-MM-DD`, or pass
`--due YYYY-MM-DD` to `create`. Triage takes up an issue on its due date.

## Check issue

A post-release check becomes one issue titled `Check: <spec slug>` with the
label `post-release-check`, its due date set to release day plus the period.

## Notifications

None.
