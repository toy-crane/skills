# Reply app

Chat assistant that suggests replies. Source lives in `app/`.

Operational measurements run with `sqlite3 -header -column data/ops.db < <file>`.

## Issue tracker

- Manage spec state and general-issue triage in the local tracker under `.tracker/`.
- Resume an issue already in progress only when the user explicitly requests it.
- Each spec folder names its one issue with an `Issue: <tracker>:<id>` line in `spec.md`; find issues by that ID, never by title.
- Link the issue through its PR. A spec PR keeps it open; close it when implementation merges.

For issue work, read [the tracker convention](docs/issue-tracker.md).
