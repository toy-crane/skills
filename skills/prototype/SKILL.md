---
name: prototype
description: Build a full-surface, dummy-data HTML prototype so the user aligns on UI by reacting to screens instead of prose. Use when the user wants to prototype, mock up, or see the screens of a product or feature before implementation, when UI discussion in words keeps missing, or when clarify hands off an experiential question that outgrew variants.
---

# Prototype

The worst UI misalignment hides in what the prose never mentioned:
the user cannot point at a missing sentence. Build every screen the
surface needs, with dummy data, and walk the user through the whole
of it; showing everything is what surfaces the gaps nobody had words
for. Stay cheap enough to rebuild without regret and concrete enough
to argue with.

Invoke the `domain-modeling` skill, and read `GLOSSARY.md` and
`docs/specs/<slug>/spec.md` when they exist: screens speak the
glossary's terms, and a screen the user corrects often corrects the
domain model too. When the project has a design system, copy its
tokens verbatim instead of approximating them, and name screen
elements after its own component names (a `data-component`
attribute, marking components the system lacks as new) so the
implementing session maps every block to a real component. A
contested detail goes back to clarify's discipline, two or three
variants differing only on the governing question, instead of an
argument in prose.

## One file, from the shell

The prototype is one self-contained HTML file holding every screen.
Start it from [templates/shell.html](./templates/shell.html), which
ships the review chrome: screen tabs, per-screen state pills, and a
viewport cycle. Extend the chrome when the surface demands it, never
strip it, and keep it self-evident: chrome that needs explaining has
failed. Everything else in the file belongs to the prototype: design
tokens in `:root` that every screen must style through (one shared
funnel is what keeps many screens reading as one product), and no
build step, no framework, no network dependency. In the real app a
button drags in routing and state wiring; here it is just a button.

Render it in whatever visual medium the environment provides,
cheapest sufficient one first: an inline preview, a local file in a
browser tab, a hosted page when the user reviews from a phone.
Pointing at problems is the medium's job (element selection where
the surface offers it) or prose's; build no pointing machinery into
the file.

## Skeleton, then fill

Propose the screen inventory as a draft, never as a question: list
the screens you believe the surface needs and let the user correct
the list.

Pass one builds every screen as skeleton: layout, navigation, key
elements, representative data, all in the shell's wireframe gray so
the user judges structure rather than styling. Fix structure until
it is approved; structural misalignment costs minutes here and
hours after fill.

Pass two starts by replacing the gray token block with the real one
(copied from the design system, extracted from the app's styling,
or decided with the user on a greenfield; a web font substitutes a
system stack, noted in the spec), then fills the approved structure
with realistic dummy data. Keep the skeleton's structural CSS apart
from its skin so the approved structure survives the swap. Never
lorem ipsum: real-length names, plausible sentences, awkward
numbers, and the edge states the state pills expose where they bite
(empty, longest plausible text, error; not every screen needs every
state). Real data, real latency, and production wiring stay out;
they are not what alignment is about. Review again, screen by
screen.

## What survives

Stop when every screen is approved or explicitly deferred as a
remaining risk. Record what the screens settled in
`docs/specs/<slug>/spec.md` (created when missing: confirmed
decisions, assumptions, deferred points, and remaining risks,
addressed to the implementing session), save the approved surface
as
`docs/specs/<slug>/prototype.html`, and link it from the spec. The
implementing session receives both halves: the spec says what was
decided, the prototype shows what it looks like. Everything built
between passes is disposable, only the approved surface is
preserved, and the prototype is a reference, never production code.

Anything with a screen is in scope: web app, mobile web, native app
mockup in a phone frame (start mobile-first prototypes in the
shell's narrow viewport). Command-line, terminal, and voice
interfaces are not.
