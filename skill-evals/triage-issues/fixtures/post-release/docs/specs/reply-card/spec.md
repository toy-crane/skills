# Reply card request check

Issue: local:1

The assistant offers a reply card only when the user asks for words to send.

## Acceptance criteria

- A request for words to send shows a reply card.
- Other questions get a text answer.

## Post-release check

- Metric: reply-card misfire rate, misfires over all reply-card requests.
- Pass: at most 5%.
- Period: 7 days after release.
- Measurement: `docs/specs/reply-card/check.sql`.
- If not met: reopen the v6 instruction experiment.
