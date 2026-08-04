---
name: build-prototype
description: Build a self-contained dummy-data HTML prototype covering every screen of a product or feature. Use when the user wants to review UI before implementation, or when prose and a few variants cannot settle a full surface.
---

# Build Prototype

Build every screen the surface needs with dummy data. Keep the prototype cheap
to rebuild and concrete enough for the user to review.

Invoke the `knowledge-layer` skill, and read `GLOSSARY.md` and
`docs/specs/<slug>/spec.md` when they exist. Use glossary terms in labels and
copy. Record confirmed surface choices in the work-unit spec; update a project
decision contract only when the user explicitly confirmed a choice that is hard
to reverse, surprising without context, and the result of a real trade-off. Use
the user's language unless the product uses different terms.

For a contested detail, render two or three variants that differ only on that
question and let the user choose.

## One file, from the shell

Build one self-contained HTML file containing every screen. Start from
[templates/shell.html](./templates/shell.html) and keep its header comment in the
prototype so later turns retain the contract. Keep the shell's screen tabs,
per-screen state pills, and viewport cycle. Add review chrome only when the
surface requires it, and do not add controls that need an explanation.

Put design tokens in `:root` and style every screen through them. Use no build
step, framework, network dependency, real routing, or production state wiring.

Render the prototype in the cheapest sufficient visual medium available and
inspect the rendered result before presenting it. Use the medium's element
selection or prose to identify problems; do not add pointing controls to the
prototype.

## Use the project's style from the start

Present the screen inventory as a correctable draft and begin building without
waiting for approval.

Inspect the existing product and design system before building. Copy its tokens
verbatim, or extract the design language when no token file exists. Name elements
after the system's component names with a `data-component` attribute, using
`new:Name` for components the system lacks. When no design system exists, keep
the shell's minimal palette as the finished style rather than a temporary stage.

Never use lorem ipsum. Use real-length names, plausible sentences, awkward
numbers, and only the edge states relevant to each screen, such as empty,
longest plausible text, and error. Keep real data, latency, and production wiring
out. Review the rendered prototype screen by screen.

## What survives

Stop when every screen is approved or explicitly deferred. Record confirmed
decisions, assumptions, deferred points, and remaining risks in
`docs/specs/<slug>/spec.md`, creating it when missing. Save the approved surface
as `docs/specs/<slug>/prototype.html` and link it from the spec.

Discard intermediate work. Keep the approved prototype as a reference, never as
production code.

Any interface with a screen is in scope, including web, mobile web, and native
app mockups in a phone frame. Start mobile-first prototypes in the shell's narrow
viewport. Command-line, terminal, and voice interfaces are not.
