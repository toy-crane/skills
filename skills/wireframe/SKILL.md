---
name: wireframe
description: Wireframe a UI request at the lowest fidelity that makes a perceptual decision falsifiable. Use when the user or another skill needs to resolve uncertainty about an interface's content, hierarchy, state, or flow before implementation.
---

# Lowest sufficient fidelity

Turn perceptual uncertainty into a representation the user can react to. Work at the lowest fidelity that makes the governing decision visible.

## 1. Find the governing perceptual decision

Use the current request and conversation as input. Inspect existing UI and supplied references where they constrain the requested interface.

Separate perceptual questions from consequential non-perceptual prerequisites. Carry resolved prerequisites forward as constraints. Return any unresolved prerequisite to the user or calling skill, and pause until it comes back as a confirmed constraint.

Identify only the open questions whose plausible answers would materially change what the user sees or does. Choose the upstream question that collapses the most downstream choices, and make reversible defaults beneath it.

Keep one governing decision in view at a time. Include only the screens, states, and interactions needed to make that decision falsifiable.

This step is complete when every consequential non-perceptual prerequisite is resolved, the run has one named governing decision, and every proposed element bears on it.

## 2. Build the falsifiable representation

Read [`assets/template.html`](./assets/template.html). Copy it to `artifacts/prototype.html`, replace its `LANG`, `TITLE`, `NAVIGATION`, and `SCREENS` markers, and preserve its screen-switching behavior.

Start with one screen, one viewport, and one representative state. Add another screen, state, or interaction only when the governing decision cannot be judged without it. Use the user's language and representative content from the request.

Treat the template's system font, four neutral color tokens, spacing, one-pixel borders, text labels, native controls, and simple placeholders as the visual ceiling. The result should read as deliberately unfinished while keeping hierarchy legible.

This step is complete when `artifacts/prototype.html` is self-contained and every screen, state, and interaction bears on the governing decision.

## 3. Put it in front of the user

Present the prototype through the lightest project-agnostic surface available, in this order:

1. Render it with the host's native artifact or visualization capability.
2. Open it as a file-backed page in the host's browser.
3. Serve `artifacts/` with a standalone static file server.

Keep the chosen surface independent of the host project's dependencies, build scripts, and configuration. Use publishing only when the user asks for a persistent or shareable URL.

On that surface, verify that exactly one selected screen is visible, every material state is reachable, every required interaction works, and the console remains clear when the surface exposes it. Put the prototype in front of the user with the governing question.

Apply feedback to the same prototype. Carry each confirmed decision forward as a constraint. When feedback conflicts with a confirmed decision, resolve the conflict before revising the prototype.

This step—and the skill—is complete when the checks pass and the user explicitly confirms the named governing perceptual decision.
