---
name: prototype
description: Prototype a consequential product-experience decision through a disposable, question-shaped experiment. Use when unresolved UI content, hierarchy, state, flow, interaction, component fit, or visual direction cannot be settled in prose, or when another skill needs perceptual alignment before production commitment.
---

# Question-shaped prototype

A prototype exists to decide, not to deliver. Make one consequential product-experience uncertainty directly judgeable through the cheapest valid reversible experiment, then carry the confirmed answer forward.

## 1. Name the governing question

Use the request, conversation, and supplied references to identify the unresolved perceptual choices whose plausible answers would materially change what the user sees or does. Resolve consequential policy, permission, lifecycle, and data semantics first, or return them to the calling skill. Treat reversible details implied by confirmed choices as defaults.

Write a short prototype brief containing:

- the one governing question;
- the confirmed constraints every alternative must preserve;
- the criterion by which the user can distinguish the alternatives.

When no consequential perceptual uncertainty remains, report that a prototype would add no information and return the confirmed constraints for implementation.

This step is complete when answering the named question would select among materially different product experiences, or when the no-prototype path has been justified.

## 2. Choose the experiment profile

Inspect the host before choosing a medium: existing routes and screens, application shell, component imports, Storybook or other component catalogs, design tokens, representative data, and nearby interaction patterns. Classify every material UI building block as:

- **reuse** — an existing component used as designed;
- **compose** — existing primitives combined for this prototype;
- **proposed** — a capability the current system does not provide.

Name proposed components as assumptions. Their absence may be the experiment's finding; do not imply they already exist.

Choose fidelity independently for context, visual refinement, interaction, data, and scope. Raise a dimension only when a lower value would make the governing question hard to judge or would distort the answer. Keep a quality floor of legible hierarchy, coherent spacing, alignment, contrast, and representative content.

Prefer an **in-situ prototype** when a product exists: mount the alternatives inside the real route and shell, retain the existing data flow and density, and swap only the rendered subtree under evaluation. Use implementation code when it is the cheapest valid representation.

Use a **standalone prototype** only for greenfield work or when the host cannot be run. In that branch, read [`assets/standalone.html`](./assets/standalone.html) and adapt it without introducing a project dependency.

Use the current task branch when it safely isolates the work. When the current branch is shared, protected, or likely to conflict with user changes, create an isolation branch or worktree before editing. A branch exists to isolate risk, not to archive every prototype.

This step is complete when the selected medium and each fidelity choice are tied to the governing question, every material component has a basis, and repository work is safely isolated.

## 3. Build controlled variants

Build two alternatives for a binary choice and otherwise default to three. Each variant must preserve the brief's confirmed constraints and differ materially on the governing question: structure, information hierarchy, or primary affordance rather than decoration alone. Use the user's language and representative content.

For in-situ prototypes, use a development-only query parameter or switcher so each variant is shareable and reload-stable. Keep existing fetching, parameters, authentication, and read paths above the variant boundary. Route writes to stubs unless mutation is itself the governing question, and keep the prototype switcher out of production builds.

For standalone prototypes, replace the template markers and preserve its variant-switching behavior. Add only the states and interactions needed to judge the governing question.

Verify that one variant is visible at a time, every variant and material state is reachable, required interactions work, the representative viewport remains legible, and the console is clear when available.

This step is complete when the alternatives visibly disagree on the governing question, agree on every confirmed constraint, and pass the relevant runtime checks.

## 4. Obtain the decision

Present the comparison through the lightest surface that preserves its validity: the running host, a file-backed artifact, or a static server. State the governing question and give each variant a descriptive structural label. Ask the user to choose one direction or identify which parts should be combined.

Apply feedback to the same controlled set. Carry the confirmed decision forward as a constraint. When feedback opens an independent decision, finish the current question before starting another prototype brief.

This step is complete when the user explicitly confirms the governing decision and its material trade-off.

## 5. Carry the answer forward

Record the confirmed direction and why it won in the calling skill's alignment brief or, when the decision meets the project's threshold, its issue or decision record. Return that decision to the caller.

When implementation is in scope, rewrite the winner to production quality with the host's abstractions, error handling, accessibility, and tests. Remove losing variants and the prototype switcher from the delivery path. Preserve the full prototype only when the user requests an audit trail or asynchronous review artifact. Otherwise, clean up only agent-created isolation branches or worktrees after the selected direction has been transferred and their working trees are clean.

This skill is complete when the decision and rationale are durable, the caller can implement without reopening the same uncertainty, and disposable prototype machinery is outside the production path.
