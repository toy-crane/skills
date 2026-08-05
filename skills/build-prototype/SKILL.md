---
name: build-prototype
description: Build a self-contained dummy-data HTML prototype covering every screen and relevant state of a web, mobile-web, or native-app surface. Use when the user wants to review and settle a complete screen-based product or feature before implementation, especially when prose or isolated variants cannot resolve cross-screen structure. Do not use for production implementation or CLI, terminal, or voice interfaces.
---

# Build Prototype

Build every screen and relevant state the surface needs with dummy data. Keep
the prototype cheap to rebuild and concrete enough for the user to review.

Use the current request and conversation as the primary source of scope,
confirmed choices, and unresolved questions. Read `GLOSSARY.md` and only the
relevant subjects from `docs/decisions/README.md` when they exist, and use the
project's canonical terms. If the request or a prior handoff identifies an
existing work-unit spec, read it for durable context. Do not require or search
for a spec before building. Surface conflicts between the current context and
project artifacts instead of resolving them silently. Use the existing
product's interface language and terminology; otherwise use the user's language.

For a contested detail, render two or three variants that differ only on that
question, let the user choose, and fold the chosen direction back into the
single prototype.

## One file, from the shell

Build one self-contained HTML file containing every screen. Start from
[templates/shell.html](./templates/shell.html) and keep its header comment in the
prototype so later turns retain the contract. Keep the shell's screen tabs,
per-screen state pills, and viewport cycle. Add review chrome only when the
surface requires it, and do not add controls that need an explanation.

Keep the working file in a temporary location while review remains open. Do not
create a work-unit folder or write `spec.md` or `prototype.html` under
`docs/specs/` until every screen is approved or explicitly deferred.

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

Stop when every screen is approved or explicitly deferred. Reuse the work-unit
folder identified by the request or a prior handoff; otherwise derive a
kebab-case slug from the product or feature name.

Record confirmed decisions, assumptions, deferred points, and remaining risks
from the current conversation in `docs/specs/<slug>/spec.md`, creating it when
missing. Save the approved surface as `docs/specs/<slug>/prototype.html` and
link it from the spec.

Update a project decision contract only when the user explicitly confirmed a
choice that future work should reuse, whose rationale prevents reasonable
re-litigation, and that came from a real trade-off.

Discard intermediate work. Keep the approved prototype as a reference, never as
production code.

Any interface with a screen is in scope, including web, mobile web, and native
app mockups in a phone frame. Start mobile-first prototypes in the shell's narrow
viewport. Command-line, terminal, and voice interfaces are not.
