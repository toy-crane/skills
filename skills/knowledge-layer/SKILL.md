---
name: knowledge-layer
description: "Maintain a project's glossary and decision records. Trigger in any session when project terms or decisions are taking shape: a concept is being named, a term is vague or conflicts with GLOSSARY.md, a decision with real alternatives is settling, or a plan weighs approaches. Do not trigger for vocabulary lookup or execution of already-settled decisions."
---

# Knowledge Layer

Challenge unclear terms and record resolved terms and decisions as they settle.

`GLOSSARY.md` defines current project terms. `docs/decisions/README.md` lists one
line per standing position, grouped by subject. Decision records hold the
arguments and use stable slugs as addresses.

Create files lazily. Create `GLOSSARY.md` when the first term is resolved, and
`docs/decisions/` when the first decision record is needed.

## Maintain the layer

- When a term conflicts with `GLOSSARY.md`, identify the conflict and resolve
  which meaning should stand.
- When a term is vague or overloaded, propose a precise canonical term.
- When domain relationships are unclear, test them with concrete edge cases.
- When a statement about behavior conflicts with the code, surface the conflict.
- When a term is resolved, update `GLOSSARY.md` immediately using the
  [glossary template](./templates/glossary.md). Keep terms only, with no
  implementation details or decisions.

## Record decisions sparingly

Create a decision record only when all three are true:

1. **Hard to reverse**: changing the decision later has meaningful cost.
2. **Surprising without context**: a future reader would question the result.
3. **A real trade-off**: genuine alternatives were considered.

Skip the record if any condition is missing. Use the
[decision-record template](./templates/decision-record.md).

Write the standing index line before the record. State the decision in one
sentence as `- [slug](slug.md) — what was decided.` under the appropriate subject
in `docs/decisions/README.md`. If the decision overturns a standing position,
replace that line and name the superseded record in the new record. Never edit
the superseded record's claim. Every standing position has exactly one line.
