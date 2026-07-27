# Records are addressed by slug; the index lists standing positions

Sequential numbers did two jobs and failed at both. As addresses they were
unstable: parallel branches each computed the next free number, which produced
two 0011s across #23 and #24, then two 0018s across two later branches —
[decisions-get-an-index-and-a-compaction-pass](decisions-get-an-index-and-a-compaction-pass.md)
records both collisions, and the index it introduced made the second one loud
without changing the scheme that caused it. Every renumbering turned each
number citation in other records and in AGENTS.md into an edit. As ordering
they were redundant: supersession must be stated in the record and the index
to be safe at all, and chronology lives in git. Meanwhile the index rule "one
line per record" tied the read surface to append-only history: the folder
grows forever by design, the index grew with it toward its 40-line cap, and
the compaction pass cannot relieve that pressure — its first real run
compacted nothing, and its exclusions (reversal chains, reused bodies) cover
exactly the clusters that grow fastest, because a subject accumulates records
by moving. At the cap, the system's only remaining answer was to report
failure.

Two changes land together. A record's filename is its slug alone —
`prototype-returns-full-surface-single-file.md` — and citations use the slug,
which never renumbers and breaks loudly when wrong. And
`docs/decisions/README.md` lists standing positions only, one line each,
grouped by subject sections: a record that overturns a standing position
replaces that line instead of appending one, and the superseded record keeps
its file, reachable through the citing record. The read surface now grows with
live subjects, which the project's own size bounds, while history stays
unbounded where nobody pays to read it.

What is given up is named, not hidden. The index no longer matches the folder
one-to-one; the weaker invariant — every record holds a line or is reachable
through citations from one that does — is compact-decisions' to check. The
index no longer shows how often a subject moved; the standing record carries
that. A whole-project chronology leaves the index; git log holds it. And two
branches deciding one subject under different slugs can now merge without
conflict, standing two contradictory lines — compact-decisions gains that
check in place of duplicate-number reporting. Same-subject edits still
collide, on the one line both branches rewrite, which is the only conflict
worth surfacing.

This supersedes decisions-get-an-index-and-a-compaction-pass in exactly two
clauses: the sequential numbering it left unchanged, and the
one-line-per-record index rule. Everything else there stands — the index
states the current position and its line is written before the record; claims
are fixed while addresses are not; the rejections-first size test and the
settledness test still gate compaction; the caps stay, with the index cap now
counting position lines only.

## Considered Options

- **Domain folders** (`docs/decisions/naming/…`) (rejected): the domains here
  rename (explain became explain-visually, draft-plan became write-plan), the
  clusters overlap (a rename record belongs to naming and to its skill's
  subject at once), so every filing is a judgment frozen into an immovable
  address — and the layout optimizes reading the folder wholesale, the read
  path the index already retired.
- **Date-prefixed filenames** (rejected): no counter to collide on, but the
  prefix orders a folder nobody browses, lengthens every address, and same-day
  parallel records still need distinct slugs to differ.
- **Slugs with the index left one-line-per-record** (rejected): fixes the
  collisions and keeps the read surface coupled to unbounded history; with
  compaction empirically near-null (148 rejections, zero merges on the first
  run), the cap still ends in report-only.
- **Moving superseded records to `archive/`** (rejected): trades the cheapest
  promise in the system — an address that never moves — for folder cosmetics,
  and reintroduces citation churn on every move.
- **Widening the compaction rules to shrink history instead** (rejected): the
  pass's own analysis is that aggressive merging destroys the rejected
  alternatives it exists to preserve.

## Consequences

The twenty existing records drop their numeric prefixes — an address edit the
compaction record's own rule allows — and in-body number citations become slug
citations, except where a number is quoted as history (the collision
narrative in decisions-get-an-index-and-a-compaction-pass). The index is
rewritten into seven subject sections, twenty-two standing lines; the lines
for retire-prototype-collapse-clarify-into-drafts and its peers now state
only the half of each record that still stands. A twenty-first record,
stated-decisions-carry-their-overturning-condition, landed on main under the
old scheme while this change was in flight — the parallel-authorship case
this record is about — and is folded in here: renamed, re-cited, and indexed
under Shaping. domain-modeling's
file-structure example, its index-line instruction, and its decision-record
template shed the numbering step and gain the replace-on-supersede rule;
compact-decisions' merged-record naming, index rule, cap counting, and report
list follow. AGENTS.md's decision links, GLOSSARY's Decision index and
Cluster entries, and the `mobile-frame-fixed-height` spec's record link move
to slug addresses. Version 0.20.0.
