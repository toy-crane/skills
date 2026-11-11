# AI photo captions

Issue: local:11

## User-visible outcomes

- AI photo captions works as approved.

## Acceptance criteria

1. The approved behavior is observable in the app.

## Deferred points

None.

## Setup before implementation

None.

## Post-release check

- Metric: Edit or delete rate of AI captions
- Pass criterion: below 30%
- Period: 14 days after release
- Measurement: `docs/specs/ai-photo-caption/measure.mjs` — reads `analytics/events.jsonl` and the release time, prints the value and `PASS` or `FAIL`.
- When not met: rework the caption prompt.
