---
name: sketch-wireframe
description: Create a low-fidelity interactive HTML wireframe for user alignment. Use when a specific UI request, screen layout, information hierarchy, state, or flow needs to be made visible and agreed before implementation.
---

# Alignment wireframe

Build the smallest interactive wireframe that lets the user confirm the material structure, priority, and flow of the requested interface.

## 1. Frame the alignment questions

Take the current request and conversation as the full invocation input. Inspect existing UI and supplied references only where they affect the requested interface.

Identify the decisions the user must be able to see rather than merely discuss:

- what belongs on the screen
- which information leads and which supports
- how regions are arranged
- which states must be compared
- how the user moves between screens or states

Choose reversible defaults for incidental details. Include only the screens, states, and interactions needed to answer the alignment questions.

This step is complete when every proposed element supports a specific alignment question.

## 2. Build the prototype

Read [`assets/template.html`](./assets/template.html). Copy it to `artifacts/prototype.html`, replace its `LANG`, `TITLE`, `NAVIGATION`, and `SCREENS` markers, and preserve its screen-switching behavior.

Use representative content from the request. Match the document language to the user's language. Wire only the interactions needed to experience the requested flow. Build for one viewport by default; represent brand treatment or responsive variants only when they are alignment questions.

Keep the visual vocabulary to the template's system font, four neutral color tokens, spacing, one-pixel borders, text labels, native controls, and simple placeholders. The wireframe should make hierarchy legible without implying finished visual design.

This step is complete when every requested element is represented, exactly one selected screen is visible, every material state is reachable, and every required interaction works in the browser.

## 3. Align with the user

Start the prototype server:

```bash
bunx vite artifacts --port=3456
```

Read the actual `Local:` URL from the server output and confirm that `/prototype.html` loads. Share that URL together with the alignment questions so the user knows what to evaluate.

Apply feedback to the same prototype and keep the URL current. Continue until the user confirms the material structure, priority, states, and flow.

The skill is complete when the user explicitly confirms the decisions made visible by the wireframe.
