---
name: compact-decisions
description: Bring a project's decision records, glossary, spec folders, and always-loaded instructions back in step with what shipped — compacting records whose subject has settled, promoting what every session must know, and deleting spec folders for finished work. Use when the decision folder has grown past what anyone reads, after several units of work have shipped. Not while work is being designed.
---

# Compact decisions

The project's memory has drifted from the product. Bring it back. This runs
after work shipped, not while it is being shaped.

## Four documents, four promises

- **`GLOSSARY.md`** is permanent and current. Rewrite it freely. Terms only,
  and no history note a record should be carrying itself.
- **`docs/decisions/`** is history. You may never edit a record so that a
  sentence makes a different claim: records quote each other's exact words,
  and a claim rewritten out from under a citation breaks the record citing it.
  You may always update which record, file, or name a sentence points at.
- **`docs/specs/<slug>/`** lives for one unit of work and is deleted once that
  work ships. Take what you need before you delete.
- **`CLAUDE.md`** (or `AGENTS.md`) is loaded by every session, so every line
  is a cost paid forever.

Work on whichever exist. Name the ones that were absent.

## Compact what converged

Several records covering one subject, and the subject has stopped moving: they
become one record holding the current rule and every rejected alternative,
dropping the sequence — which came first, which pull request, which reversal.
The merged record takes the lowest number of the group. The others are deleted
and every citation of them updated.

**List the rejections first, and let them decide whether to compact at all.**
Rejected alternatives are the part of the history that has to survive: without
them someone re-proposes a settled option in six months and nothing answers
them. So write them out as the merged record would carry them — one shared
list, one terse line each — and add what else that record must hold: the
current rule and the evidence it rests on. If the total is not clearly smaller
than the records it would replace, there is nothing to win. Leave them alone
and say so.

That list is what the decision rests on, so build it properly. The
`## Considered Options` headings are the easy part. The rest sit in body prose
and in consequences: as a bare negative ("no X either", "stays rejected",
"never passes"), as an earlier record's position being overturned, or as a
rejected mechanism rather than a rejected name. A list drawn from headings
alone undercounts badly, and an undercount reads as permission to compact.

Leave alone a cluster in which one record overturns another or takes an
exception to it, and a record whose body is itself reused — an eval's method,
a measurement, a benchmark. Reversal is the case the size test reads
backwards: a record that overturns another states its alternative in one terse
line and spends its pages on what forced the move, so the more a subject has
moved the cheaper its rejections look. When you leave a cluster for this
reason, say how many times the position moved and what forced each move. That
count is the finding, and no later record can recover it.

## Promote what settled

A decision earns a line in the always-loaded file only when a session that
never read the history would otherwise get it wrong. The record keeps the
reasoning; the always-loaded file keeps the rule and a link to it. Recency and
hard-won-ness earn nothing.

## Keep the index true

`docs/decisions/README.md`, one line per record, matching the folder.

## Caps

The index stays under 40 lines and the always-loaded file under 120. They are
what stops promotion from being one-way. When a cap cannot be met without
compacting something that should not be compacted, report that instead.

## Report rather than force

Duplicate record numbers. A supersession you cannot pin down. A cluster you
could not tell had settled.

## Done when

No two records cover one settled subject that could safely be joined, no spec
folder describes shipped work, the glossary carries only current terms, the
index matches the folder, and the always-loaded file holds what earns its
cost. Close with what you changed, what you left alone and why, and what you
could not fix. An untouched folder has to be a decision you state, never a
step you skipped.
