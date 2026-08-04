---
name: project-knowledge
description: "Maintain a project's canonical terms and settled decisions that future work should reuse. Use when project-specific terms are being clarified or when a choice that may constrain future work is being considered or settles, including during planning. Do not use for simple definitions, routine implementation details, or carrying out an already-settled decision."
---

# Project Knowledge

Resolve unclear project terms and preserve settled decisions so future work uses
the same language and does not re-litigate the same trade-offs.

`GLOSSARY.md` defines current terms. When `docs/decisions/README.md` exists, read
it and then load only the decision files relevant to the current work.

Create `GLOSSARY.md` when the first term is resolved. Create
`docs/decisions/README.md` and the first subject file when the first qualifying
decision settles.

## Maintain terms

- Resolve vague, overloaded, or conflicting project terms with the user.
- Stress-test unclear relationships between domain concepts with concrete
  edge-case scenarios.
- If code conflicts with the user's statement, `GLOSSARY.md`, or a relevant
  decision contract, surface the mismatch instead of choosing silently. Code
  shows current behavior, but not whether that behavior was intentional.
- Update `GLOSSARY.md` immediately after a term is resolved, using the
  [glossary template](./templates/glossary.md). Keep only project terms and
  their current definitions in `GLOSSARY.md`.

## Maintain decisions

Record a project decision only when it is all of the following:

1. **Settled**: the choice is no longer a proposal. The user confirmed the
   outcome, or it was chosen under authority the user explicitly delegated for
   this class of decision.
2. **Reusable**: future work is likely to face the same question and should
   reuse this answer unless its reconsideration conditions are met.
3. **Non-obvious**: without its rationale, future work could reasonably reopen
   the question or choose differently.
4. **A real trade-off**: plausible alternatives existed, and preserving why
   they were rejected prevents the same evaluation from recurring.

Require evidence that a choice was intentional before treating it as settled.
Implementation or lack of objection alone is insufficient. A request to align
documentation with code does not by itself confirm the decision the code implies.

For each qualifying decision, use the
[decision contract template](./templates/decision-contract.md) to create or
update its single subject file in `docs/decisions/`. Preserve only the context
future work needs to apply the decision without repeating the original analysis.

If relevant sources disagree about a settled decision, surface the conflict and
leave project knowledge unchanged until the intent is explicitly clarified.
When project files cannot be updated, show the exact proposed glossary or
decision-contract change and state that it remains unrecorded.
