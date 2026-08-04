---
name: compact-decisions
description: Reconcile a project's decision records, glossary, spec folders, and always-loaded instructions with shipped work. Use after several units of work have shipped, when the decision index nears its cap or no longer reflects the product. Do not use while work is being designed.
---

# Compact Decisions

Run this pass only after work has shipped.

## Document lifecycles

- **`GLOSSARY.md`** is permanent and current. Keep terms only; rewrite it freely.
- **`docs/decisions/`** is history. Never change a record's claim. You may update
  references to records, files, and names.
- **`docs/specs/<slug>/`** belongs to one unit of work. Preserve needed decisions,
  then delete the folder after that work ships.
- **`CLAUDE.md`** or **`AGENTS.md`** loads in every session. Keep only rules every
  session needs.

Work on the documents that exist and report the ones that are absent.

## Compact converged records

When several records cover one settled subject, draft one record containing the
current rule, its evidence, and every rejected alternative. List rejected
alternatives before changing any files, one terse line each. Find them in
`## Considered Options`, body prose, consequences, overturned positions, and
rejected mechanisms. Omit chronology and pull-request history.

If the draft is not smaller than the records it would replace, leave them alone.
If it is smaller, use the slug that best names the settled subject, keeping the
group's most-cited slug when it still states the claim. Delete the other records
and update every citation.

Do not compact a cluster when one record overturns or excepts another, or when a
record's body is reused as an eval method, measurement, or benchmark. For a
cluster with reversals, report how many times the position moved and what caused
each move.

## Promote settled rules

Add a rule to the always-loaded file only when a session that never read the
history would otherwise get it wrong. Keep the reasoning in the decision record
and put only the rule and its link in the always-loaded file.

## Keep the index current

Maintain one line per standing position in `docs/decisions/README.md`, grouped by
subject. Every record must either have a line or be reachable through citations
from an indexed record. A superseded record keeps its file and loses its line.

## Caps

Keep the index under 40 position lines, excluding section headers, and the
always-loaded file under 120 lines. If meeting a cap would require unsafe
compaction, report that instead.

## Report unresolved problems

Report without forcing a change when you find:

- two standing index lines for the same subject under different slugs;
- a record that is neither indexed nor cited from an indexed record;
- a supersession you cannot determine;
- a cluster you cannot determine has settled.

## Done when

Finish when no safely mergeable records cover the same settled subject, no spec
folder describes shipped work, the glossary contains only current terms, every
standing position has one index line, every record is reachable from the index,
and the always-loaded file contains only necessary rules. Report what changed,
what stayed unchanged and why, and what could not be fixed.
