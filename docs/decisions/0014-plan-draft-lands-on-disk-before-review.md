# The plan draft lands on disk before review, behind a draft marker

write-plan kept the draft in the conversation and saved plan.md only on
approval, so an interrupted review could never leave a half-agreed file
looking authoritative (the to-plan spec's "final gate"). Real usage showed
the cost falls on the review itself: a page-long document pasted into chat
renders once, scrolls away, and every revision streams another near-copy
to re-read. The document's whole justification is being a review surface
(0005), and the old rule put it in its weakest medium exactly during
review.

write-plan now writes the draft to plan.md beside spec.md before review
and holds the review on the file: corrections land as visible edits,
questions stay in the conversation. The half-agreed-file risk moves into
the file itself — until the user approves, plan.md opens with the single
line `Status: draft — under review` above the contract, and approval means
removing that line. Interruption is fail-safe: the marker stays, and the
file names its own status to any later session.

## Considered Options

- **Keep the draft in conversation** (rejected): the observed readability
  failure above; it also left the pipeline asymmetric — shape-idea
  materializes spec.md without ceremony while the plan waited on a gate —
  which confused actual use.
- **A separate draft file renamed on approval** (plan-draft.md → plan.md)
  (rejected): approval-as-rename is clumsier than deleting a line and
  complicates revising an existing plan.md in place.
- **Rely on git status (uncommitted = unapproved)** (rejected): a fresh
  implementing session reads the worktree, not the log, and commit habits
  vary by project.

## Consequences

write-plan's closing paragraph is rewritten. The to-plan spec's final gate
("approving the draft saves plan.md beside spec.md") is superseded:
approval now removes the marker instead of triggering the save. GLOSSARY's
Plan entry already says "writes beside the spec for review" and is
untouched. Plugin bumps to 0.13.1.
