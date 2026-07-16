---
status: accepted
---

# Prototype covers draft and finish runs, not only comparisons

[ADR 0001](./0001-question-shaped-prototypes.md) narrowed `prototype` to a
question-shaped comparison to kill the wireframe failure. Live usage
(2026-07-16) exposed a legitimate run the contract excluded: with every
decision confirmed, the user asked to see the confirmed whole, and the model
complied only by disguising a single build as a comparison ("비교 대상 없음"
in its own invocation args). The everyday meaning of "prototype" also covers
a first concrete draft when no fork has been identified yet — and reacting to
one concrete artifact is a first-class alignment medium: half of one's
preferences do not exist until reacting to something concrete
([0003](./0003-six-alignment-theses.md), thesis 2).

Of wireframe's two failure causes, low fidelity is retired by the shippable
clause; unbounded scope is handled per run type below.

## Decision

`prototype` makes experiential uncertainty judgeable in whichever state it
arrives, each run scoped by its own denominator:

- **Compare** — a known fork: two or three variants differing only on the
  governing question. Scope: that question. Unchanged from 0001.
- **Draft** — latent preferences: one strawman built from the stated
  requirements; reactions crystallize decisions one round at a time. Scope:
  the stated requirements and one reaction round.
- **Finish** — every decision confirmed: materialize the issue artifact's
  final state, reopening nothing. Scope: the confirmed decision list.

The identity boundary moves from comparison shape to disposability: every
run's output stays out of the production path, and a run ends when reactions
are recorded as decisions.

## Consequences

"Make me a prototype" is in-contract in all three states. Run selection is a
judgment call expressed in one paragraph, not a taxonomy or ceremony (see
[0002](./0002-clarify-orchestrates-memory-and-prototypes.md)). The glossary's
Prototype definition widens accordingly; Variant remains a compare-run
concept. `clarify`'s routing is unchanged: experiential questions land here
whatever their state.
