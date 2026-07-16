---
name: prototype
description: Turn experiential uncertainty — anything judged by looking or trying rather than in prose — into a disposable build the user can react to: variants at a fork, a strawman draft while preferences are latent, or the confirmed composition once decisions settle. Use when the user asks to prototype, mock up, or see and try a screen or flow, or when another skill routes an experiential question here.
---

# Prototype

Build the cheapest disposable artifact that lets the user judge the
experiential uncertainty at hand by reacting to something concrete.

If the codebase, design system, established interaction semantics, or supplied
references already answer the question, return that answer instead of
building anything.

Match the run to the state of the uncertainty. At a known fork, hold the
confirmed constraints fixed and show two or three materially different
variants that differ only on the governing question. While preferences are
still latent, build one strawman from the stated requirements and invite
reactions instead of asking the user to imagine. Once every decision is
confirmed, materialize the confirmed composition as the issue artifact's
final state, reopening nothing. Scope each run by what remains uncertain:
the question, the stated requirements, or the confirmed decision list.

Prefer the real product context and existing components when available;
otherwise use a self-contained artifact with representative fake data. Stub
everything irrelevant to the uncertainty, and state fidelity and stubbing
choices as assumptions. Give every build the visual credibility of a
shippable product — brand presence, real components, representative content.
Cheapness bounds the scope, never the craft, and the artifact renders in the
product's own styling rather than the host surface's.

Keep one artifact per issue — the issue artifact, at
`artifacts/<issue-slug>/` — and build each run on the decisions it already
records. After the user reacts, state what the reaction revealed, fold what
was confirmed into the issue artifact, and discard the rest. The issue
artifact's final state is the session's deliverable: a record of confirmed
decisions, not production code.

Keep each run on the one uncertainty the caller brought.
