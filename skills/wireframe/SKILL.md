---
name: wireframe
description: Wireframe a UI request at the lowest fidelity that makes a perceptual decision falsifiable. Use when the user or another skill needs to resolve uncertainty about an interface's content, hierarchy, state, or flow before implementation.
---

# Lowest sufficient fidelity

Turn perceptual uncertainty into a representation the user can react to. Work at the lowest fidelity that makes the governing decision visible.

## 1. Find the governing perceptual decision

Use the current request and conversation as input. Inspect existing UI and supplied references where they constrain the requested interface.

Identify only the open questions whose plausible answers would materially change what the user sees or does. Choose the upstream question that collapses the most downstream choices, and make reversible defaults beneath it.

Keep one governing decision in view at a time. Include only the screens, states, and interactions needed to make that decision falsifiable.

This step is complete when the run has one named governing decision and every proposed element bears on it.

## 2. Build the falsifiable representation

Read [`assets/template.html`](./assets/template.html). Copy it to `artifacts/prototype.html`, replace its `LANG`, `TITLE`, `NAVIGATION`, and `SCREENS` markers, and preserve its screen-switching behavior.

Start with one screen, one viewport, and one representative state. Add another screen, state, or interaction only when the governing decision cannot be judged without it. Use the user's language and representative content from the request.

Treat the template's system font, four neutral color tokens, spacing, one-pixel borders, text labels, native controls, and simple placeholders as the visual ceiling. The result should read as deliberately unfinished while keeping hierarchy legible.

Open the prototype in a browser. Verify that exactly one selected screen is visible, every material state is reachable, every required interaction works, and the console remains clear.

This step is complete when the governing decision has a visible point of disagreement and the browser checks pass.

## 3. Put it in front of the user

Start the prototype server:

```bash
bunx vite artifacts --port=3456
```

Read the actual `Local:` URL from the server output and confirm that `/prototype.html` loads. Share the URL with the governing question, then wait for the user's reaction.

Apply feedback to the same prototype. Once the governing decision is resolved, return to step 1 only if another material perceptual decision remains.

The skill is complete when the user explicitly confirms every material decision made visible by the wireframe.
