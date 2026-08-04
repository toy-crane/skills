---
name: project-knowledge
description: "Maintain a project's glossary and human-approved current decision contracts. Trigger when project terms are being resolved or a durable decision with real alternatives is being weighed or confirmed, including in planning. Do not trigger for vocabulary lookup, routine AI-chosen details, or execution of already-settled decisions."
---

# Project Knowledge

Challenge unclear terms and preserve decisions that should constrain future
work without turning AI assumptions into project authority.

`GLOSSARY.md` defines current terms. `docs/decisions/README.md` routes readers
to current subject contracts. Read the router and only the subjects relevant to
the work; never load the whole directory by default.

Create these files lazily when the first term or durable decision needs them.

## Maintain terms

- Resolve vague, overloaded, or conflicting language with the user.
- Test unclear domain relationships with concrete edge cases.
- When a statement conflicts with code, surface the conflict; code is evidence,
  not the authority for terminology or decisions.
- Update `GLOSSARY.md` immediately after a term is resolved, using the
  [glossary template](./templates/glossary.md). Keep terms only.

## Maintain decisions

Record a project decision only when it is all of the following:

1. **Human-approved**: the user explicitly confirmed the outcome.
2. **Hard to reverse**: changing it later has meaningful cost.
3. **Surprising without context**: a future reader would question the result.
4. **A real trade-off**: genuine alternatives were considered.

Keep AI proposals and reversible defaults as assumptions in conversation or the
active spec. Keep feature-local decisions in that spec. Do not infer approval
from silence, current code, elapsed time, or a merged implementation.

For a qualifying decision, create or update the one subject file that owns it,
using the [decision contract template](./templates/decision-contract.md). Keep
the current rule, boundaries, minimum rationale, reconsideration conditions,
still-relevant rejected alternatives, and evidence that would be expensive to
recreate. Omit chronology and empty sections.

Add the subject once to `docs/decisions/README.md` as
`- [subject](subject.md) — Read when ...`. The subject file is the source of
truth; the router must not restate its decision.

If two sources imply different durable decisions, report the conflict and wait
for human resolution. When the current mode forbids project writes, carry the
exact proposed contract update in the reviewable plan and do not claim it was
recorded.
