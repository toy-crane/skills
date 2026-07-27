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
history that must survive, so a run writes them out as the merged record would
carry them, adds the current rule and the evidence it rests on, and compacts
only if that total is clearly smaller than the records it replaces. The first
run measured 148 rejections across the candidate clusters and compacted
nothing.

The measurement had to be pinned to the merged record's own form because it
was otherwise unstable: stating each rejection as a standalone sentence put
these clusters at 131% of source, stating them as one shared list put them at
30–42%. Same records, opposite verdicts, on a formatting choice the rule never
named.

The bar is "no smaller", not "clearly smaller". A fixture run — a synthetic
architecture-ADR repo, the only place the merge path could be exercised, since
nothing here compacts — joined three converged records and came out 9%
shorter. That is barely a saving and the merge was still right: the subject
went from three records that only make sense read in order to one that answers
the question. Bytes are the symptom the test can measure; a single home is the
thing being bought. An earlier wording of the bar would have refused that
merge.

**A cluster where one record overturns or excepts another is left alone**, and
the run says how many times the position moved and what forced each move. The
first wording was "still under debate", which is not decidable from the
records: nobody is arguing at the moment of compaction, and with no criterion
attached the first run supplied its own — commit recency, in a repo whose
nineteen records span ten days, which separated nothing. Reversal is the case
the size test reads backwards. A record that overturns another states its
alternative in one terse line and spends its pages on what forced the move, so
the more a subject has moved the cheaper its rejections look; 0017 holds the
lowest rejection share of any record here and is the most destructive to
merge. The count of moves is the part no later record can recover, because a
superseding author does not know how many records were deleted.

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
- **Cut the settledness test as redundant with the size test** (rejected): the
  first run stopped every cluster on size before settledness could decide
  anything, which looked like redundancy and was not — the size test
  short-circuited before the branch the other one guards was ever reached. The
  two read a reversal in opposite directions, so they come apart exactly where
  compaction is least safe. Cutting it would also have applied 0009's bar
  asymmetrically, since the ledger procedure below is admitted on a single
  observation for the same reason: the failure destroys records.
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
