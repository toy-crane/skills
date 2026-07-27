---
name: knowledge-layer
description: "Build and sharpen a project's knowledge layer — the glossary and decision records where settled terms and decisions accumulate. A background discipline: trigger while the domain is being worked out — a concept getting named, a term turning fuzzy or conflicting with GLOSSARY.md, a decision with real alternatives settling — whether or not the user asks. Reading the glossary for vocabulary is not a trigger; load only when the layer itself may change."
---

# Knowledge Layer

Actively build and sharpen the project's knowledge layer as you design. This is the *active* discipline: challenging terms, inventing edge-case scenarios, and writing the glossary and decisions down the moment they crystallise.

## File structure

```
/
├── GLOSSARY.md
├── docs/
│   └── decisions/
│       ├── README.md
│       ├── event-sourced-orders.md
│       └── postgres-for-write-model.md
└── src/
```

`GLOSSARY.md` says what a term means now. `docs/decisions/README.md` says what the project has decided now: one line per standing position, grouped by subject. The records themselves hold the arguments, addressed by slug alone. Without the index the current position exists nowhere and every session rebuilds it from the whole folder.

Create files lazily, only when you have something to write. If no `GLOSSARY.md` exists, create one when the first term is resolved. If no `docs/decisions/` exists, create it when the first decision record is needed.

## During the session

### Challenge against the glossary

When the user uses a term that conflicts with the existing language in `GLOSSARY.md`, call it out immediately. "Your glossary defines 'cancellation' as X, but you seem to mean Y. Which is it?"

### Sharpen fuzzy language

When the user uses vague or overloaded terms, propose a precise canonical term. "You're saying 'account'. Do you mean the Customer or the User? Those are different things."

### Discuss concrete scenarios

When domain relationships are being discussed, stress-test them with specific scenarios. Invent scenarios that probe edge cases and force the user to be precise about the boundaries between concepts.

### Cross-reference with code

When the user states how something works, check whether the code agrees. If you find a contradiction, surface it: "Your code cancels entire Orders, but you just said partial cancellation is possible. Which is right?"

### Update GLOSSARY.md inline

When a term is resolved, update `GLOSSARY.md` right there. Don't batch these up; capture them as they happen. Use the format in [glossary template](./templates/glossary.md).

`GLOSSARY.md` should be totally devoid of implementation details. Do not treat `GLOSSARY.md` as a spec, a scratch pad, or a repository for implementation decisions. It is a glossary and nothing else.

### Offer decision records sparingly

Only offer to create a decision record when all three are true:

1. **Hard to reverse**: the cost of changing your mind later is meaningful
2. **Surprising without context**: a future reader will wonder "why did they do it this way?"
3. **The result of a real trade-off**: there were genuine alternatives and you picked one for specific reasons

If any of the three is missing, skip it. Use the format in [decision-record template](./templates/decision-record.md).

### Write the index line before the record

A decision you cannot state in one sentence has not settled yet, so write that sentence first: `- [slug](slug.md) — what was decided.` in `docs/decisions/README.md`, under the subject's section (create the section when the subject is new). If the decision overturns a standing position, replace that line instead of adding one, and name the superseded record in the new record's body; the superseded file itself is never edited. Then argue for it in the record. Every standing position has exactly one line.
