# Work-unit dossiers live at docs/specs/<slug>/, anchored by spec.md

A clarify session ends by materializing its confirmed decisions as a durable handoff
document, `spec.md`, so a later session can implement without this conversation. Each
work unit gets one folder, `docs/specs/<kebab-slug>/`, which later planning documents
(`plan.md`, `tasks.md`, …) join under fixed filenames, so one address hands off the
whole dossier. The parent is named after the anchor document because everything in the
folder elaborates one spec (plan derives from spec, tasks from plan), and it exists
because specs are a third document lifecycle: `docs/decisions/` is append-only and
immutable, `GLOSSARY.md` is permanent and current, while a spec dossier lives per unit
and retires wholesale when the work ships. Mixing lifecycles in one folder would break
the reader's trust in what each path promises.

## Considered Options

- **`docs/issues/`** (rejected): collides head-on with GitHub Issues; imports a tracker
  metaphor the repo doesn't contain.
- **`docs/features/`** (rejected): refactors, migrations, and redesigns are not features.
- **`docs/changes/`** (rejected): low convention recognition, clashes with changesets.
- **Flat `docs/specs/<slug>.md`** (rejected): breaks the moment `plan.md` arrives, and
  promoting later means migrating a published convention.
- **Reuse `artifacts/<issue-slug>/`** (rejected): retired prototype semantics (0001).
- **A new root directory** (rejected): clarify runs on other people's repos; additions
  under `docs/` are conventional, new root directories are intrusive.

A tracker-number prefix on the slug (`docs/specs/123-dark-mode/`) is a natural variant
when the project tracks issues. Folders are created lazily; a session that only
maintained the glossary or decision records writes no spec.
