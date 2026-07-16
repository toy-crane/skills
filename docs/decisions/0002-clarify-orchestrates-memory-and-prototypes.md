---
status: amended by [0003](./0003-six-alignment-theses.md)
---

# Clarify orchestrates memory and prototypes

`clarify` replaces the interview-with-docs workflow, not merely a lightweight
preflight. It must keep the useful properties of that workflow: investigate
what the project can answer, walk dependent decisions one question at a time,
recommend an answer, and preserve shared understanding as project memory.

The first version encoded those concerns as a decision taxonomy, a fixed
alignment brief, prototype experiment profiles, component-provenance labels,
and branch policy. Each rule was defensible in isolation, but together they
turned supporting heuristics into mandatory ceremony and made `prototype`
look like a peer decision process.

## Decision

- `clarify` owns the interview and the full decision tree.
- `domain-modeling` is the durable memory layer. `clarify` loads it before
  questioning and updates it inline as terms and qualifying decisions settle.
- `prototype` is an ephemeral evidence tool. `clarify` invokes it for one
  question only when the user needs to see or try alternatives to decide.
- The user's reaction returns to `clarify` as an answer. `clarify` decides what
  is durable and delegates that persistence to `domain-modeling`.

## Consequences

The skills state their stable contracts and leave situational techniques to
agent judgment. A component choice settled by existing semantics does not
need a prototype. A perceptual choice that cannot be judged in prose does.
Prototype code, variants, fidelity notes, and isolation branches are not
preserved or reported by default; the resulting shared understanding is.
