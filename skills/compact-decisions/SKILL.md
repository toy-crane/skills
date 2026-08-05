---
name: compact-decisions
description: Reconcile a project's current decision contracts, glossary, spec folders, and always-loaded instructions with shipped work. Use after several units have shipped, when subjects overlap, the decision index has drifted, or active project memory has grown noisy. Do not use while decisions are still being made.
---

# Compact Decisions

Run this pass after work ships. Compact the representation of settled decisions,
never their intent or meaning.

## Document promises

- `GLOSSARY.md` is current terms only and may be rewritten.
- `docs/decisions/` is current, settled decisions that future work should reuse:
  one mutable contract per subject, with Git as the only history.
- `docs/specs/<slug>/` belongs to one work unit. Preserve any settled decision
  that future work should reuse, then delete the folder after the work
  ships.
- `CLAUDE.md` or `AGENTS.md` carries repository mechanics and the route to
  decisions, not a cache of their content.

Work on the documents that exist and report those that are absent.

A choice is settled when the user confirmed it or it was made under authority
the user explicitly delegated for that class of decision. Implementation or lack
of objection alone is insufficient.

## Compact current contracts

Read the decision index and relevant subject files, then compare them with
shipped code and remaining specs. Remove chronology, pull-request history,
obsolete implementation detail, repetition, and alternatives that cannot
reasonably recur.

Normalize every touched contract to this shape: a subject title, required
`Decisions` and `Why` sections, then `Boundaries`, `Reconsider when`,
`Still-rejected alternatives`, and `Evidence worth preserving` only when they
carry real content. Remove status fields, supersession chains, dates, and event
metadata. Do not add empty headings.

Preserve:

- every current rule and boundary;
- the minimum reason needed to apply it;
- conditions that should reopen the choice;
- rejected alternatives whose mechanism could otherwise be retried;
- measurements or experiments expensive to reproduce.

When multiple files cover one subject and the settled position is
unambiguous, merge them into the best subject name, update links, and delete the
others. If choosing what stands would require interpreting recency, code,
silence, or conflicting claims, leave the meaning unchanged and report what
needs explicit clarification.

Use this deletion test: if removing a statement would make a capable future AI
reasonably repeat the same proposal, investigation, experiment, or failed
mechanism under the same conditions, keep a terse version in the current
contract.

## Keep the index and lifecycles true

Keep one `docs/decisions/README.md` entry per subject, formatted as
`- [subject](subject.md) — Read when ...`. Every subject file appears exactly
once and every entry resolves. The index does not summarize decisions.

Remove decision content duplicated into always-loaded instructions. Keep those
files below 120 lines and the index below 40 subject entries; report when a cap
cannot be met without removing necessary operational guidance.

Delete shipped spec folders only after preserving decisions that will constrain
later work. Leave unshipped work in place and reconcile its links and language
with the current contracts.

## Done when

Finish when each subject has one current contract, indexing is one-to-one, no
shipped spec remains, the glossary contains current terms only, always-loaded
instructions carry no decision cache, and unresolved semantic conflicts are
reported rather than hidden. Every touched contract has the current required
sections and no event-record metadata. Report what changed, what stayed and why,
and what requires explicit clarification.
