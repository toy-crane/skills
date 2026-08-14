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
- A standalone workflow skill creates and maintains one permanent, current
  app-level context document for a from-scratch application. The document
  persists across work units so later shaping does not restart from a blank
  product premise. `shape-idea` reads it when present but neither requires nor
  creates it. Its product-only content contract lives in
  [app-context](app-context.md).
- `docs/specs/<slug>/` carries one unit of work: `spec.md` as the anchor,
  `prototype.html` when a surface was approved, and `tasks/` when work was split.
  Preserve any qualifying project decision, then delete the folder when the
  work ships.
- `docs/follow-ups/<slug>.md` carries one open item a session discovered but did
  not resolve: a temporary workaround whose root cause stays open, or an
  out-of-scope defect observed with evidence. One file per item, written at the
  moment of discovery, deleted when the work ships or the item is promoted into
  a spec folder.
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
- The app-level context does not replace the existing owners for work-unit
  specs, repository mechanics, reusable terms, or settled trade-offs.
- A follow-up records an open question, not a settled decision, so it does not
  enter the glossary or a decision contract until its outcome settles on its own
  terms. Work that closed inside the session, a guess without evidence, and a
  defect fixed in the current change are not follow-ups.
- Sweep attempt identities, owners, outcomes, and retry evidence are disposable
  local automation state, not fields in tracked follow-up files. Git history
  remains the archive after a verified fix deletes its follow-up.
- A term or decision counts as preserved only after its target file is updated.
- Every subject file appears exactly once in the index, and every index entry
  resolves to one subject file.

## Why

Append-only records preserved provenance but made AI sessions reconstruct the
present from history. Before this model, 27 records plus their index occupied
107,684 bytes and consumers were instructed to read the whole folder. Current
subject contracts keep the authority and anti-repetition payload in the normal
read path; Git retains recoverability without spending context on chronology.

A one-time kickoff prompt disappears with the session, while copying the whole
app premise into every work-unit spec makes those specs drift. One current
app-level context keeps the product premise available across later shaping
without turning it into feature scope or implementation prediction.

## Reconsider when

- Explicit delegation repeatedly produces project decisions the user later
  overturns.
- Stable in-tree provenance becomes a compliance or audit requirement that Git
  history cannot satisfy.
- The app-level context repeatedly drifts from settled decisions or fails to
  improve later shaping enough to justify another permanent read surface.
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
- A hosted issue tracker as the follow-up carrier — it survives worktree
  deletion but adds a remote dependency to a record the repository can hold
  itself; reconsider if follow-ups routinely need assignment or cross-repository
  visibility.
- A single `docs/follow-ups.md` backlog list — parallel worktree sessions
  appending to one file collide on merge, the same failure that sequential
  record numbers produced.
- Harness task chips or session to-do state — they do not survive an
  application restart and exist in only one of the agent harnesses this
  repository targets.

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
- Held-constant forward runs on a fixture whose committed generated file had
  drifted from its generator: all three baseline runs diagnosed the drift
  correctly and reported it only in their closing message, leaving nothing on
  disk. All five runs carrying the capture rule wrote one
  `docs/follow-ups/<slug>.md` with symptom, evidence, suspected cause, what was
  tried, and a next step, and none wrote a decision contract for the suspected
  cause. A fresh session given only that file reproduced the symptom, fixed the
  root cause, added a drift check, deleted the item, and surfaced enforcement as
  the remaining human judgment.
- A greenfield control on a real Next.js build produced no follow-ups in any of
  five runs, two carrying the old skill text and three the new. Blind judges
  scored the seventeen discoveries those runs reported in prose: three
  qualified, eleven were correctly excluded, and two were boundary calls. The
  criteria therefore sort discoveries correctly while the routing did not fire.
  Two runs, asked directly, reported that the rule did not surface at the moment
  of discovery and that they read "out-of-scope defect" as covering pre-existing
  or environmental problems rather than unfixed defects in code they had just
  written. Capture is demonstrated for pre-existing and environmental defects,
  not for self-authored gaps in new work.
