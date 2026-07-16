---
name: prototype
description: Compare variants to settle one experiential product question — a question judged by looking or trying rather than in prose. Use directly or when `/clarify` routes an experiential question here.
---

# Prototype

Create the cheapest comparison that makes one unresolved experiential
question directly judgeable.

If the codebase, design system, established interaction semantics, or supplied
references already answer the question, return that answer instead of
building anything.

Otherwise, keep the confirmed constraints fixed and show two or three
materially different variants. Prefer the real product context and existing
components when available; otherwise use a self-contained artifact with
representative fake data. Stub everything irrelevant to the question, and
state fidelity and stubbing choices as assumptions.

Keep one artifact per issue — the issue artifact, at
`artifacts/<issue-slug>/` — and build each comparison on the decisions it
already records. After the user reacts, state what the reaction revealed,
fold the chosen variant into the issue artifact, and discard the losers.
Return the learning to `/clarify` or the calling workflow. The issue
artifact's final state is the session's deliverable: a record of confirmed
decisions, not production code.

Keep each run on the one question the caller asked.
