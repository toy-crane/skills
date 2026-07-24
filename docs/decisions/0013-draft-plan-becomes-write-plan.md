# draft-plan becomes write-plan

"Draft" names the skill's review contract (draft, review, publish on
approval) but reads first as *rough, unfinished* — the opposite of what the
skill delivers, a plan complete enough to implement from. The verb should
name the work: for this skill the document is the work. Unlike the interview
behind shape-idea (where 0007 rejected `write-spec` because writing was the
byproduct), plan.md is itself the review surface, so writing it is an honest
name for producing it.

Rename `draft-plan` to `write-plan`. The verb-object scheme (0006) is
untouched — it remains the only naming class that covers the whole published
set — and the object keeps the skill-name-to-glossary pairing
(write-**plan** ↔ Plan) alongside discover-opportunity ↔ Opportunity and
build-prototype ↔ Prototype.

## Considered Options

- **Keep draft-plan** (rejected): the rough-draft reading misstates the
  deliverable, and the new sibling skill was not going to extend the verb
  (draft-tasks fell to the same objection), leaving "draft" a one-off.
- **to-plan** (rejected, again): a preposition with the verb elided; a route
  sign rather than a command, meaningful only to someone who already knows
  the to-X lineage. Also 0006's original starting point.
- **plan-work** (rejected): names the activity but breaks the
  name-to-glossary pairing on a generic object, and sits next to the
  built-in `/plan` in autocomplete.
- **Bare plan** (impossible): `/plan` is reserved by both harnesses (0006).

## Consequences

The published directory, plugin.json entry and keywords, `.claude/skills/`
symlink, README list and diagram, CLAUDE.md naming examples, and GLOSSARY's
Plan entry move from draft-plan to write-plan. The glossary term Draft (the
interview discipline) is untouched. Installed copies keep the old name until
reinstalled, as with the 0006 and 0007 renames.
