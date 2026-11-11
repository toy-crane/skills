# Album auto-organize

Issue: local:13

## User-visible outcomes

- Album auto-organize works as approved.

## Acceptance criteria

1. The approved behavior is observable in the app.

## Deferred points

None.

## Setup before implementation

None.

## Post-release check

- Metric: Share of auto-organize results users undo
- Pass criterion: below 10%
- Period: 7 days after release
- Measurement: `docs/specs/album-auto-organize/measure.mjs` — reads `analytics/events.jsonl` and the release time, prints the value and `PASS` or `FAIL`.
- When not met: decide whether auto-organize stays on by default.
