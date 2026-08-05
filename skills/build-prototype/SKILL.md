---
name: build-prototype
description: Build a self-contained dummy-data HTML prototype covering every screen and relevant state of a web, mobile-web, or native-app surface. Use when the user wants to review and settle a complete screen-based product or feature before implementation, especially when prose or isolated variants cannot resolve cross-screen structure. Do not use for production implementation or CLI, terminal, or voice interfaces.
---

# Build Prototype

Build every screen and relevant state with realistic dummy data. Keep the
prototype cheap to rebuild and concrete enough for the user to judge the whole
surface visually.

## Ground the surface

Use the current request and conversation as the primary source of scope,
confirmed choices, and unresolved questions.

Read `GLOSSARY.md` and only the relevant subjects from
`docs/decisions/README.md` when they exist, and use the project's canonical
terms. If the request or a prior handoff identifies an existing work-unit spec,
read it for durable context. Do not require or search for a spec before
building.

Inspect the existing product and design system before building. Surface
conflicts between the current context and project artifacts instead of resolving
them silently. Use the existing product's interface language and terminology;
otherwise use the user's language.

Treat confirmed surface relationships as fixed constraints. Preserve overlays,
drawers, and modals as relationships to their source screen instead of turning
them into separate screens or routes.

## Build one review artifact

Present the screen inventory as a correctable draft and begin building without
waiting for approval.

Build one self-contained HTML file containing every screen. Start from
[templates/shell.html](./templates/shell.html) and keep its header comment,
screen tabs, per-screen state pills, and viewport cycle.

Copy the project's design tokens verbatim into `:root`, or extract its design
language when no token file exists. Style every screen through those tokens.
Name elements after the design system's component names with a `data-component`
attribute, using `new:Name` for components the system lacks. When no design
system exists, keep the shell's minimal palette as the finished style.

Use real-length names, plausible sentences, awkward numbers, and only the edge
states relevant to each screen, such as empty, longest plausible text, and
error. Never use lorem ipsum.

Keep real data, APIs, latency, production routing, state wiring, frameworks,
build steps, and network dependencies out. Add review chrome only when the
surface requires it, and do not add controls that need an explanation.

Use a phone frame for native app mockups and start mobile-first prototypes in
the shell's narrow viewport. Drive viewport-dependent styles from the shell's
`.sh-vp-390` and `.sh-vp-768` classes, not browser media queries alone; the
shell simulates those widths inside a wider browser window.

Keep the working file in a temporary location while review remains open. Do not
create a work-unit folder or write under `docs/specs/` until every screen is
approved or explicitly deferred.

## Review to convergence

Render the prototype in the cheapest sufficient visual medium available and
inspect the rendered result before presenting it. Review the surface screen by
screen.

For an unresolved detail, render two or three variants that differ only on that
question while holding confirmed elements fixed. Keep their content, data,
surrounding layout, and behavior identical; change only the contested treatment.
Let the user choose, then fold the chosen direction back into the single
prototype.

Use the rendering medium's element selection or prose to identify problems. Do
not add pointing, annotation, approval, or change-tracking controls to the
prototype.

## Preserve only approval

When every screen is approved or explicitly deferred, reuse the work-unit folder
identified by the request or a prior handoff. Otherwise derive a kebab-case slug
from the product or feature name.

Record confirmed decisions, assumptions, deferred points, and remaining risks
from the current conversation in `docs/specs/<slug>/spec.md`, creating it when
missing. Save the approved surface as `docs/specs/<slug>/prototype.html` and
link it from the spec.

Record only what the user confirmed or the approved artifact shows. Do not infer
navigation, screen order, or behavior from source order or visual proximity.

Update a project decision contract only when the user explicitly confirmed a
choice that future work should reuse, whose rationale prevents reasonable
re-litigation, and that came from a real trade-off.

Discard intermediate work. Keep the approved prototype as a reference, never as
production code.
