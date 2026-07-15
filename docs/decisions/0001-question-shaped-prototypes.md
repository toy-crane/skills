---
status: accepted
---

# Replace low-fidelity wireframes with question-shaped prototypes

The original `wireframe` skill made a project-independent, low-fidelity HTML artifact the default. That kept production work untouched, but it also removed the real application shell, component library, data density, and visual quality needed to judge many interface decisions. We will replace it with a model-invoked `prototype` skill whose purpose is to make one consequential product-experience uncertainty directly judgeable through the cheapest valid reversible experiment before production commitment.

## Considered options

- Keep low-fidelity wireframes as the default: inexpensive, but too detached from established products and too easy to judge as an unattractive final design.
- Default to high-fidelity output: increasingly inexpensive for generative models, but it spends attention on detail that may not bear on the governing decision and can imply unsupported components.
- Choose fidelity by question and prefer in-situ variants: keeps the experiment narrow while raising context, component, interaction, data, or visual fidelity only where that makes the judgment more valid.

## Consequences

Existing products should host two or three controlled variants inside their real shell and reuse their components and representative data. Greenfield work may use a coherent standalone fallback. Components must be identified as reused, composed, or proposed instead of being silently invented. Branches and worktrees isolate risky prototype edits when needed; they do not preserve every discarded prototype by default. The confirmed direction and rationale are durable, while losing variants and prototype switchers are disposable.
