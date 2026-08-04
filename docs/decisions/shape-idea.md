# Shape idea

## Decisions

- Start from a concrete problem and broad direction, investigate available
  evidence, and present a concrete draft for the user to correct.
- Treat low-risk, reversible choices made by the AI as assumptions. Only a
  human-confirmed outcome that meets the durable project-decision gate enters a
  decision contract; feature-local choices remain in the spec.
- Ask one consequential question at a time with a recommended answer when a
  branch is expensive to get wrong.
- Settle experiential questions through two or three rendered variants that
  differ only on the governing choice. When the question is a whole surface,
  invoke `build-prototype`; when the user asks for explanation, invoke
  `explain-visually`.
- Mirror flows, state models, and relationships with one diagram when they have
  multiple branches, transitions, or links before moving to a downstream
  decision. Ask at most one question about an unresolved part of the diagram and
  wait for the response. Keep a linear structure that fits in one sentence in
  prose.
- State a human-known condition that would overturn a proposed decision. Check
  conditions the agent can verify instead of pushing them back to the user.
- Durable project writes are limited to the spec folder, glossary, current
  decision contracts, and installed vendor agent context. Do not edit product
  source during shaping.
- For external-dependency questions, check official docs, issue trackers, and
  release notes before making a spike or workaround.

## Boundaries

- Keep spikes, benchmarks, and comparison renders disposable. Preserve only an
  approved full-surface prototype beside the spec.
- Separate functional verification from the user's experiential judgment.
- Write confirmed implementation behavior, assumptions, off-limits areas,
  deferred points, and remaining risks to `docs/specs/<slug>/spec.md`.
- If code contradicts a user statement or current decision contract, surface
  the conflict rather than treating code as the decision-maker.

## Why

People correct concrete drafts more reliably than they answer blank questions.
The authority boundary prevents the same mechanism from silently turning an
AI default into a durable human decision. Visual reactions expose experiential
misalignment that prose cannot settle, while the write boundary prevents a
shaping session from sliding into implementation.

## Reconsider when

- A user explicitly delegates a class of durable project decisions rather than
  only routine implementation details.
- Forward tests show models consistently surface human-known overturning
  conditions without the instruction.
- Product-code edits during shaping stop recurring, allowing the explicit write
  boundary to be pruned.

## Still-rejected alternatives

- Asking the user every small question — it spends attention on reversible
  defaults that a stated assumption can safely expose.
- Treating silence or lack of correction as durable approval — a well-written
  draft can hide its wrong part inside mostly correct content.
- Describing experiential alternatives only in prose — users must imagine the
  very difference the session needs them to judge.
- Editing product code while shaping — it mixes alignment and implementation
  and leaves unreviewed source changes behind.
- Building a custom workaround before checking the dependency's own sources —
  it repeats solved work and loses the provenance of the answer.
