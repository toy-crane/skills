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

A prototype is warranted only when seeing or trying alternatives would answer the question more reliably than project evidence, established semantics, or prose. When it is warranted, existing products should use their real context and components where available; greenfield work may use a self-contained artifact with representative fake data. The comparison holds confirmed constraints fixed, stubs irrelevant behavior, and is disposable by default. Component provenance, fidelity, and repository isolation remain situational implementation judgments rather than mandatory user-facing ceremony.

`clarify` owns the larger decision loop and returns to it after the user reacts. Durable terminology and qualifying decisions are persisted through `domain-modeling`; the prototype itself does not own project memory. See [0002](./0002-clarify-orchestrates-memory-and-prototypes.md).
