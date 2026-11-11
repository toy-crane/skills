# Post-release check: end-to-end runs

`post-release-run.sh <out-dir>` builds a throwaway repository from
`fixtures/post-release/`, copies the working tree's `triage-issues`, `merge`,
`pr`, `pull`, and `clean-branches` into its `.claude/skills/`, and drives each
stage with a real headless `claude -p` session. The tracker is the fixture's
`scripts/tracker.mjs`; GitHub is the fixture's `bin/gh`, which reports PR #12
as already merged, so the GitHub merge itself is not exercised. The passing
week is stood in for by moving the check issue's due date to yesterday.

## 2026-11-11, claude-opus-5-5, Claude Code 2.1.321

| Stage | Expected | Observed |
| --- | --- | --- |
| merge | Close the implementation issue, open one check issue due merge day + 7 with `Merge-Commit:`, no measurement | Closed `local:1`; looked up existing check issues by `Spec-Folder:`; created `local:2` labeled `post-release-check`, due 2026-11-18 (UTC), body with `Spec-Folder:`, `Merged:`, `Merge-Commit:` (the real merge SHA), `Due:`, and the spec section verbatim; did not run the measurement; deleted the merged local branch |
| pre-due | Select nothing; one-line report | Left `local:2` alone because its due date is ahead; no claim or write; reported nothing to see |
| due-none | Run `check.sql`, copy values and verdict, `needs-decision`, `Triage 요약`, no PR, no send | Ran the file as written; comment copies `misfires 41, total 702, passed 0` and the revision; no computed ratio; three choices with a recommendation; `needs-decision`; `Triage 요약`; claim released; no notification |
| due-notify | Same, then send the report | Same tracker outcome; report sent to `.notifications/` |
| due-fail | Same; send fails; run still succeeds | Same tracker outcome; send failed with 403; the returned report lists the failure and the retry command |
| summary | Report adds waiting decisions, checks due within 7 days, overdue unhandled | Selected nothing (`local:2` triaged, `local:3` due in 3 days); summary listed `local:2` waiting, `local:3` due 2026-11-14, and no overdue issues |

The first due-stage pass moved only the tracker's due field and left the
convention change uncommitted; the agents flagged both mismatches. The runner
now moves the body's `Due:` line too and commits the convention change, and
the table above is the second pass. Every due-stage agent still noted that the
measurement ran within hours of the merge and that `check.sql` has no date
filter; both are fixture artifacts, and the recommendation varied between
measuring again and reopening the experiment.
