# Document lifecycles

## Decisions

- `GLOSSARY.md` is permanent and current. It defines terms only and may be
  rewritten as language changes.
- `docs/decisions/` contains current decision contracts, one mutable file per
  subject. A contract is warranted only when the choice is settled, future work
  should reuse it, its rationale prevents reasonable re-litigation, and rejected
  alternatives reflect a real trade-off.
- `docs/decisions/README.md` indexes subjects without duplicating their
  decisions. Consumers read the index and only the relevant subject files.
- `docs/specs/<slug>/` carries one unit of work: `spec.md` as the anchor,
  `prototype.html` when a surface was approved, and `tasks/` when work was split.
  Preserve any qualifying project decision, then delete the folder when the
  work ships.
- `AGENTS.md` or `CLAUDE.md` carries repository mechanics and the route to the
  decision index, not a cache of decision content.
- Git history is the only archive. Do not create an archive folder or keep
  superseded decision files in the active tree.

A choice is settled when the user confirms it or when it is made under authority
the user explicitly delegated for that class of decision. An AI may propose a
decision, decide within delegated authority, record a settled decision, apply
it, detect drift, and compact its wording without changing its meaning. Code is
evidence of current behavior, not by itself proof that the behavior was
intentional.

## Boundaries

- Unsettled proposals do not enter the glossary or decision contracts.
- A request to align documentation with code does not by itself confirm the
  decision the code implies.
- Feature-local decisions remain in the work-unit spec. Promote only decisions
  that have settled and that later work should reuse.
- A term or decision counts as preserved only after its target file is updated.
- Every subject file appears exactly once in the index, and every index entry
  resolves to one subject file.

## Why

Append-only records preserved provenance but made AI sessions reconstruct the
present from history. Before this model, 27 records plus their index occupied
107,684 bytes and consumers were instructed to read the whole folder. Current
subject contracts keep the authority and anti-repetition payload in the normal
read path; Git retains recoverability without spending context on chronology.

## Reconsider when

- Explicit delegation repeatedly produces project decisions the user later
  overturns.
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

- A no-write forward test asked the agent to treat an unwritten SQS decision as
  preserved. It left the project unchanged and explicitly reported that the
  decision was not yet preserved.
- A forward test treated “update the decision document to match the code” as
  user confirmation and overwrote the existing contract. The explicit guard
  made a held-out ownership conflict leave project knowledge unchanged.
- The previous compaction model counted 148 rejected alternatives across its
  first candidate clusters and safely merged none. Preserving all event records
  made compaction least effective where a subject had changed most often.
- Sequential record numbers collided in parallel branches twice. Subject
  filenames remove the counter and make same-subject edits collide on the file
  that actually carries authority.
