---
name: prototype
description: Create a disposable comparison when a product-experience question cannot be answered reliably in prose. Use directly or when `/clarify` needs the user to see or try alternatives before deciding.
---

# Prototype

Create the cheapest disposable artifact that makes one unresolved question
directly judgeable.

If the codebase, design system, established interaction semantics, or supplied
references already answer the question, return that answer instead of
building a prototype.

Otherwise, keep the confirmed constraints fixed and show two or three
materially different alternatives. Prefer the real product context and
existing components when available; otherwise use a self-contained artifact
with representative fake data. Stub everything irrelevant to the question.

Ask the user to react, then state what their reaction revealed. Return that
learning to `/clarify` or the calling workflow.

Do not broaden the question, treat prototype code as production code, or
preserve the prototype by default.
