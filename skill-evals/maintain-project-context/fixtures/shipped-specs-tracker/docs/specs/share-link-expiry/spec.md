# Share link expiry

Issue: local:12

## User-visible outcomes

- Share link expiry works as approved.

## Acceptance criteria

1. The approved behavior is observable in the app.

## Deferred points

None.

## Setup before implementation

None.

## Post-release check

- Metric: Expired-link opens that returned album content
- Pass criterion: 0
- Period: 7 days after release
- Measurement: `docs/specs/share-link-expiry/measure.mjs` — reads `analytics/events.jsonl` and the release time, prints the value and `PASS` or `FAIL`.
- When not met: treat as a security defect and fix it.
