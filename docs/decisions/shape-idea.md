# Shape idea

## Decisions

- Start from a concrete problem and broad direction, investigate available
  evidence, and present a concrete draft for the user to correct.
- Close with `spec.md` as the stable product contract for implementation:
  user-visible outcomes, approved scope, observable acceptance criteria,
  settled constraints and rationale, assumptions, off-limits areas and reasons,
  deferred points, and remaining risks. Record behavior rather than predicted
  files, functions, code structure, technical layers, or implementation steps.
- Treat low-risk, reversible choices made by the AI as assumptions. A choice is
  settled when the user confirms it or it is made under explicitly delegated
  authority. Only a settled outcome that meets the reusable project-decision
  gate enters a decision contract; feature-local choices remain in the spec.
- Ask one consequential question at a time with a recommended answer and concise
  reason when a branch is expensive to get wrong.
- Settle experiential questions through two or three rendered variants that
  differ only on the governing choice. When the question is a whole surface,
  invoke `build-prototype`; if it is unavailable, defer the decision rather than
  treating a partial render as approval. When the user asks for explanation,
  invoke `explain-visually`.
- Mirror flows, state models, and relationships with one diagram when they have
  multiple branches, transitions, or links before moving to a downstream
  decision. Ask at most one question about an unresolved part of the diagram and
  wait for the response. Keep a linear structure that fits in one sentence in
  prose.
- When a proposed decision depends on information only the user can know, state
  that information and ask whether it applies. Check conditions the agent can
  verify instead of pushing them back to the user.
- Ground visible and interactive decisions in the current surface, treating it
  as evidence rather than an automatic comparison option. Show the baseline
  only when the unresolved choice depends on comparing it with the candidate.
  Use a runnable candidate when available; otherwise render a sufficient
  substitute. Verify only the states needed for a trustworthy comparison before
  the user judges one unresolved experiential decision.
- Durable project writes are limited to the spec folder, glossary, current
  decision contracts, and installed vendor agent context. Do not edit product
  source during shaping.
- For external-dependency questions, check official docs, issue trackers, and
  release notes before making a technical experiment or workaround.

## Boundaries

- Keep technical experiments, benchmarks, variants, comparison renders, and
  component previews disposable. Preserve `prototype.html` only when it covers
  the whole surface and the user explicitly approved it as the prototype.
- Separate functional verification from the user's experiential judgment.
- Record unresolved product-change requests as deferred points and their
  possible impact as remaining risks.
- Write the complete product contract to `docs/specs/<slug>/spec.md` and keep
  feature-local decisions there.
- If code contradicts a user statement or current decision contract, surface
  the conflict rather than treating code as the decision-maker.

## Why

People correct concrete drafts more reliably than they answer blank questions.
The settlement boundary prevents the same mechanism from silently turning an AI
default into a reusable project decision. Visual reactions expose experiential
misalignment that prose cannot settle, while the write boundary prevents a
shaping session from sliding into implementation.

## Reconsider when

- Explicitly delegated decision classes repeatedly produce project decisions
  the user later overturns.
- Forward tests show models consistently surface human-known overturning
  conditions without the instruction.
- Product-code edits during shaping stop recurring, allowing the explicit write
  boundary to be pruned.

## Still-rejected alternatives

- Asking the user every small question — it spends attention on reversible
  defaults that a stated assumption can safely expose.
- Treating silence or lack of correction as evidence that a choice settled — a
  well-written draft can hide its wrong part inside mostly correct content.
- Describing experiential alternatives only in prose — users must imagine the
  very difference the session needs them to judge.
- Editing product code while shaping — it mixes alignment and implementation
  and leaves unreviewed source changes behind.
- Building a custom workaround before checking the dependency's own sources —
  it repeats solved work and loses the provenance of the answer.
