# Document lifecycles

## Decisions

- `GLOSSARY.md` is permanent and current. It defines terms only and may be
  rewritten as language changes.
- `docs/decisions/` contains human-approved current decision contracts, one
  mutable file per durable subject. A contract is warranted only when the
  decision is hard to reverse, surprising without context, and the result of a
  real trade-off.
- `docs/decisions/README.md` routes readers to subjects. It does not duplicate
  the decisions. Consumers read the router and only the relevant subject files.
- `docs/specs/<slug>/` carries one unit of work: `spec.md` as the anchor,
  `prototype.html` when a surface was approved, and `tasks/` when work was split.
  Preserve any durable project decision, then delete the folder when the work
  ships.
- `AGENTS.md` or `CLAUDE.md` carries repository mechanics and the route to the
  decision index, not a cache of decision content.
- Git history is the only archive. Do not create an archive folder or keep
  superseded decision files in the active tree.

Only a human can approve, overturn, or reconcile a durable project decision. An
AI may propose a decision, record a confirmed decision, apply it, detect drift,
and compact its wording without changing its meaning. Code is evidence of the
current implementation, not proof that a human approved the underlying choice.

## Boundaries

- Proposals and AI-chosen defaults remain in conversation or the active spec as
  assumptions until a human confirms the outcome.
- Feature-local decisions remain in the work-unit spec. Promote only decisions
  that will constrain later units of work.
- When the environment forbids writes, carry the exact proposed contract change
  in the reviewable plan instead of claiming the decision was recorded.
- Every subject file appears exactly once in the router, and every router entry
  resolves to one subject file.

## Why

Append-only records preserved provenance but made AI sessions reconstruct the
present from history. Before this model, 27 records plus their index occupied
107,684 bytes and consumers were instructed to read the whole folder. Current
subject contracts keep the authority and anti-repetition payload in the normal
read path; Git retains recoverability without spending context on chronology.

## Reconsider when

- Stable in-tree provenance becomes a compliance or audit requirement that Git
  history cannot satisfy.
- Subject contracts grow large enough that targeted reads routinely load
  unrelated decisions.
- Git history proves too difficult to recover when a removed detail is genuinely
  needed.

## Still-rejected alternatives

- Append-only ADRs as active project memory — they preserve every event but make
  current-state retrieval depend on status traversal and ever-growing context.
- A separate current-summary layer — it duplicates authority and can drift from
  the subject contract.
- An `archive/` directory — it adds another semantic layer and moves stable
  addresses for folder cosmetics; Git already preserves the deleted files.
- Loading the whole decisions folder — file growth becomes context growth and
  exposes obsolete claims to the model.
- Flat `docs/specs/<slug>.md` files — related prototypes and task files would
  require a later address migration.

## Evidence worth preserving

- The previous compaction model counted 148 rejected alternatives across its
  first candidate clusters and safely merged none. Preserving all event records
  made compaction least effective where a subject had changed most often.
- Sequential record numbers collided in parallel branches twice. Subject
  filenames remove the counter and make same-subject edits collide on the file
  that actually carries authority.
