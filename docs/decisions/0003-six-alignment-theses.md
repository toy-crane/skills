---
status: accepted
---

# Six theses govern how these skills use AI

The skill set was built on four informal theses: align the AI with the
author's thinking; aligning on everything equals writing the code; the AI
decides what is universally defensible while humans align on the
irreversible and the tasteful; keep the harness light and
philosophy-centered. Stress-testing showed each thesis missing a
load-bearing variable, and, followed literally, the four re-derive a
prose-only clarify that never shows screens early and never ends with a
deliverable — the exact behavior they were meant to prevent.

## Decision

1. Performance comes in the order evidence, alignment, verification.
   Questions that investigation can close are closed by investigation;
   alignment covers only the remainder; built work is verified by running
   it.
2. Alignment is the joint construction of an answer, not a transfer. Half
   of a person's preferences appear only in reaction to something concrete,
   so the AI challenges the plan with evidence, produces things to react
   to, and follows the user's intent over their words when the two diverge.
3. Principles are aligned; instances are delegated. One aligned principle
   settles hundreds of instance decisions, while aligning every instance is
   writing the code by hand.
4. Decisions route by divergence probability times repair cost. The AI
   decides where divergence from the user's intent is unlikely or cheap to
   detect and fix, surfacing each such call as a stated assumption. Settled
   taste persists to durable memory, so the question set shrinks over time.
5. The kind of question picks the medium. Propositional questions — facts,
   constraints, trade-offs — settle in prose. Experiential questions —
   those judged by looking or trying — settle through reactions to
   variants. When no one holds the answer, evidence is manufactured: a
   prototype, a spike, or a benchmark. In sessions that settle experiential
   questions, the artifact's final state is the deliverable.
6. Harness rules split by whether a smarter model would make them
   unnecessary. Capability crutches go; facts about the user — taste,
   decision rights, expected deliverables — stay, written so a violation is
   checkable. Specificity is not weight; weight is the count of forced
   steps.

## Consequences

`clarify` routes each question by kind, reaching `/prototype` for
experiential ones instead of waiting for the user to declare they must see
alternatives. It manufactures spikes and benchmarks when no source answers
a technical question, decides by divergence times repair cost rather than
reversibility alone, asks principles before instances, and ends sessions
that settled experiential questions by delivering the issue artifact with
the summary.

`prototype` keeps one issue artifact per issue: losing variants are
discarded and the confirmed state accretes as the deliverable. Fidelity
remains question-shaped per
[0001](./0001-question-shaped-prototypes.md).

This narrows the disposability stated in
[0001](./0001-question-shaped-prototypes.md) and
[0002](./0002-clarify-orchestrates-memory-and-prototypes.md) to variants;
the issue artifact's confirmed state is preserved and delivered. The
orchestration decision in 0002 — clarify owns the loop, domain-modeling
owns memory, prototype supplies evidence — stands.
