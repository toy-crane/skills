# Decisions get an index, and compact-decisions maintains it

`GLOSSARY.md` states what a term means now and never argues. The records argue
and never state the current position, so the current position lived nowhere:
every shape-idea session read 52,236 characters of history and rebuilt it,
which is where sessions picked up skill names that no longer exist. The two
halves of the model were asymmetric and only one of them was readable.

`docs/decisions/README.md` closes that: one line per record stating the
position that stands, written before the record it points at, because a
decision you cannot state in one sentence has not settled yet.
domain-modeling gains the artifact and that test; its centre stays the
discipline (challenging terms, stress-testing scenarios, cross-referencing
code), not the bookkeeping. A side effect was taken deliberately — two
branches adding a record now conflict on one index file, so the numbering
collision that produced two 0011s stops being silent. The scheme that caused
it is unchanged.

`compact-decisions` is the pass that keeps all four documents in step after
work ships: it joins records whose subject has settled, promotes into the
always-loaded file only what a session that never read the history would
otherwise get wrong, and deletes spec folders for shipped work. It is separate
from domain-modeling because it is an offline phase — domain-modeling runs
while you design, this runs after — and user-invoked, with no schedule and no
watcher.

Two rules carry the weight.

**The claim is fixed; the address is not.** A record's body may never be
edited so that a sentence makes a different claim, because records quote each
other's exact words: deleting `write-spec` from 0006 leaves 0007 arguing
against a word that appears nowhere. Any edit that only changes which record,
file, or name a sentence points at is always allowed. This replaces the
stricter "the body never changes", which made compaction impossible.

**The rejected alternatives decide whether to compact.** They are the part of
history that must survive, so a run lists them first and weighs them against
the records; when stating them alone takes as much room as the records
themselves, there is no redundancy left and the records are left alone. The
first run on this repo measured 148 rejections across the candidate clusters,
about 34,200 characters against 26,077 characters of source, and compacted
nothing. That is the rule working.

## Considered Options

- **Split rejections into names and reasons** — keep every name, keep the
  reason only where the rejection is non-obvious (rejected): it rescued the
  compression ratio and made the check mechanical, but it was a rule fitted to
  one measurement. Its ground was that the decision-record template already
  records rejections "when the rejection is non-obvious"; that bar applies
  when a record is *written*, so everything in a Considered Options list has
  already passed it, and re-applying it while compacting overrules the
  record's author rather than restoring a qualifier.
- **Weaken the survival rule to "the rejections that matter"** (rejected):
  makes the passing condition a judgment the compacting pass grades itself on.
- **A mode of domain-modeling rather than a separate skill** (rejected):
  fires the sweep while work is being designed, which is the wrong phase.
- **`consolidate-memory` as the name** (rejected): the bundled
  anthropic-skills skill of that name targets the agent's own memory, and two
  similarly-described skills compete for one invocation.
- **A trigger — a schedule, or domain-modeling warning at the index cap**
  (rejected): deciding when enough has shipped is the user's call.
- **Caps in domain-modeling** (rejected): they are completion criteria of the
  pass, not of the skill that writes records.

## Consequences

`AGENTS.md` gains "Three document lifecycles" (the first promotion this pass
made) and sits at 106 of its 120-line cap; the index sits at 29 of 40. Five
spec folders for shipped work were deleted; `mobile-frame-fixed-height` stayed,
because `skills/build-prototype/templates/shell.html` still carries the
`min-height: 660px` that spec exists to replace. The record formerly numbered
0011 became 0018. Version 0.17.0.

One procedure sits in the skill on a single observation rather than a repeated
one, against 0009's bar: list the rejections before compacting. A hand count
that read only the `## Considered Options` headings found 40 where a full read
found 148, and the low count would have licensed a destructive merge. It is
admitted because the failure it guards destroys records, and it is written as
an input to a judgment rather than a step order. Re-prune it when a run shows
the model does this unprompted.
