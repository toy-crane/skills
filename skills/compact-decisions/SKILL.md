---
name: compact-decisions
description: Periodically reconcile a project's current decision contracts, glossary, spec folders, and always-loaded instructions after shipped work has accumulated. Use when subjects overlap, shipped specs remain, the decision index has drifted, or active project knowledge contains duplicated or stale context. Do not use to make or infer unsettled decisions.
---

# Compact Decisions

Run this periodic cleanup after shipped work has accumulated. Compact only how
settled decisions are represented; never change their intent or meaning.

## Protect decision authority

Preserve an existing, unconflicted current contract without reconstructing its
adoption history. When promoting a choice into a decision contract or resolving
conflicting claims, treat it as settled only if the user confirmed it or it was
made under explicitly delegated authority for that kind of decision.

Use shipped code only to detect stale descriptions and implementation details.
Do not infer decision intent from implementation or lack of objection, and do
not modify code during this pass.

If choosing what stands would depend on recency, implementation, silence, or
unresolved claims, leave the conflicting files and their meaning unchanged.
Report the exact clarification required from the user.

## Reconcile subject contracts

Inventory the decision index and subject files. Use the index, when present, to
identify the contracts relevant to the cleanup, then compare them with shipped
code and remaining specs. Keep one mutable current contract per subject and use
Git as the only history.

When multiple files unambiguously express one settled position, consolidate
them under the clearest stable subject name, update every inbound link, then
delete the redundant files.

Normalize each contract you create or modify to a subject title; required
`Decisions` and `Why` sections; then `Boundaries`, `Reconsider when`,
`Still-rejected alternatives`, and `Evidence worth preserving` only when they
contain useful content. Remove status fields, supersession chains, and event
metadata such as adoption or update dates. Preserve dates that constrain a
current decision or its reconsideration. Do not add empty headings.

Keep in the current contract:

- every current rule and boundary;
- the minimum rationale needed to apply it without reopening the same settled
  debate;
- conditions that should reopen the choice;
- rejected alternatives whose mechanisms a future agent might otherwise retry;
- measurements or experiment results that would be costly to reproduce.

Remove chronology, pull-request history, obsolete implementation details,
repetition, and alternatives whose mechanisms cannot reasonably recur. Before
deleting a statement, ask whether a capable future agent working under the same
conditions could reasonably repeat the same proposal, investigation,
experiment, or failed mechanism without it. If so, keep the shortest version
that prevents the repetition.

## Restore document lifecycles

- Maintain exactly one `docs/decisions/README.md` entry for every subject
  contract, formatted as `- [subject](subject.md) — Read when ...`. Make every
  link resolve and every subject file appear once. Use `Read when ...` only to
  describe when to load the contract, not to summarize its decisions.
- When `GLOSSARY.md` exists, keep only current terminology and rewrite it as the
  project's language changes.
- For each clearly shipped `docs/specs/<slug>/`, first incorporate any settled
  decision that will constrain later work into the relevant current contract,
  then delete the folder. Leave unshipped or ambiguously shipped folders in
  place. Update their links and terminology to match current contracts without
  changing unsettled choices.
- In `CLAUDE.md` and `AGENTS.md`, when present, keep repository-wide working
  instructions and the route to `docs/decisions/README.md`. Remove duplicated
  decision content, but leave unrelated instructions unchanged.

Missing optional documents require no action. Create, rename, or rebuild
decision contracts and their index when needed to preserve or consolidate
settled decisions. If the always-loaded instructions or decision index have
grown too large for reliable routing, report the source of that growth. Do not
remove necessary guidance or merge unrelated subjects solely to meet a size
target.

## Done when

Finish when every safely resolvable subject has one current contract and one
matching index entry. Report every unresolved semantic conflict, ambiguous ship
status, or other blocker with the exact clarification required. Leave no clearly
shipped spec unless its safe deletion is blocked by one of those reported
issues. When present, the glossary contains only current terminology and
always-loaded instructions contain no duplicated decision content. Every
contract created or modified in this pass has the required sections and no
event-record metadata. Report changes, deletions, intentional non-changes, and
blockers.
