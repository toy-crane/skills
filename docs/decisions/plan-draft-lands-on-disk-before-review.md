# The plan draft lands on disk before review

write-plan kept the draft in the conversation and saved plan.md only on
approval, so an interrupted review could never leave a half-agreed file
looking authoritative (the to-plan spec's "final gate"). Real usage showed
the cost falls on the review itself: a page-long document pasted into chat
renders once, scrolls away, and every revision streams another near-copy
to re-read. The document's whole justification is being a review surface
(jit-planning-with-optional-to-plan), and the old rule put it in its weakest medium exactly during
review.

write-plan now writes the draft to plan.md beside spec.md before review
and holds the review on the file: corrections land as edits, questions
stay in the conversation. The half-agreed-file risk is accepted, not
guarded: spec.md already carries the same exposure (shape-idea
materializes it without a final gate), and the plan's opening contract
already makes the document advisory — the terrain wins where they
disagree.

## Considered Options

- **Keep the draft in conversation** (rejected): the observed readability
  failure above; it also left the pipeline asymmetric — shape-idea
  materializes spec.md without ceremony while the plan waited on a gate —
  which confused actual use.
- **A `Status: draft — under review` marker removed on approval**
  (rejected): ceremony the pipeline doesn't need; spec.md faces the same
  interruption risk with no marker, and the contract already subordinates
  the plan to the code.
- **A separate draft file renamed on approval** (plan-draft.md → plan.md)
  (rejected): approval-as-rename is heavier still.

## Consequences

write-plan's closing paragraph is rewritten. The to-plan spec's final gate
("approving the draft saves plan.md beside spec.md") is superseded: the
save precedes the review. GLOSSARY's Plan entry already says "writes
beside the spec for review" and is untouched. Plugin bumps to 0.13.1.
