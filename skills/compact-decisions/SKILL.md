---
name: compact-decisions
description: Periodically reconcile a project's current decision contracts, glossary, spec folders, and always-loaded instructions after shipped work has accumulated. Use when subjects overlap, shipped specs remain, the decision index has drifted, or active project knowledge contains duplicated or stale context. Do not use to make or infer unsettled decisions.
---

# Compact Decisions

Run this pass after shipped work has accumulated. Compact only the
representation of settled decisions, never their intent or meaning.

## Respect document roles

- Define only current terminology in `GLOSSARY.md`; rewrite it as the project's
  language changes.
- Store current, settled decisions for future reuse in `docs/decisions/`. Keep
  one mutable contract per subject and use Git as the only history.
- Treat `docs/specs/<slug>/` as the temporary document set for one work unit,
  not permanent project knowledge.
- Keep repository-wide working instructions in `CLAUDE.md` and `AGENTS.md`,
  when present. Direct agents to `docs/decisions/README.md` for project
  decisions instead of repeating or summarizing those decisions in either file.

Apply these rules only to document systems relevant to the repository. Missing
optional documents require no action. Create, rename, or rebuild decision
contracts and their index when needed to preserve or consolidate settled
decisions.

When promoting a choice into a decision contract or resolving conflicting
claims, treat it as settled only if the user confirmed it or it was made under
explicitly delegated authority for that kind of decision. Do not infer
settlement from implementation or lack of objection alone.

## Compact current contracts

Inventory the decision index and subject files. Use the index, when present, to
identify the contracts relevant to the cleanup, then compare them with shipped
code and remaining specs. Use code to detect stale descriptions and
implementation details, not to infer decision intent. Remove chronology,
pull-request history, obsolete implementation details, repetition, and
alternatives whose mechanisms cannot reasonably recur.

Normalize each contract you create or modify to this shape: a subject title;
required `Decisions` and `Why` sections; then `Boundaries`, `Reconsider when`,
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

When multiple files cover one subject and the settled position is unambiguous,
consolidate them into one contract under the clearest stable subject name,
update every inbound link, then delete the redundant files. If consolidation
would require choosing among claims based on recency, implementation, silence,
or unresolved conflict, do not merge or delete the conflicting files. Report
the exact clarification required from the user.

Before deleting a statement, ask whether a capable future agent working under
the same conditions could reasonably repeat the same proposal, investigation,
experiment, or failed mechanism without it. If so, keep in the current contract
the shortest version that prevents the repetition.

## Keep the index and lifecycles true

Maintain exactly one `docs/decisions/README.md` entry for every subject
contract, formatted as `- [subject](subject.md) — Read when ...`. Every subject
file must appear once and every link must resolve. Use `Read when ...` only to
describe when to load the contract; do not summarize its decisions.

Remove decision content duplicated in `CLAUDE.md` or `AGENTS.md`, leaving
unrelated repository instructions unchanged. If the always-loaded instructions
or decision index have grown too large for reliable routing, report the source
of that growth. Do not remove necessary guidance or merge unrelated subjects
solely to meet a size target.

For each clearly shipped spec folder, first incorporate any settled decision
that will constrain later work into the relevant current contract, then delete
the folder. Leave unshipped or ambiguously shipped folders in place. Update
their links and terminology to match current contracts without changing
unsettled choices.

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
