---
name: build-prototype
description: Build a full-surface, dummy-data HTML prototype so the user aligns on UI by reacting to screens instead of prose. Use when the user wants to prototype, mock up, or see the screens of a product or feature before implementation, when UI discussion in words keeps missing, or when shape-idea hands off an experiential question that outgrew variants.
---

# Build Prototype

The worst UI misalignment hides in what the prose never mentioned: the
user cannot point at a missing sentence. Build every screen the surface
needs, with dummy data, and walk the user through the whole of it.

Invoke the `knowledge-layer` skill, and read `GLOSSARY.md` and
`docs/specs/<slug>/spec.md` when they exist: screens speak the
glossary's terms. A contested detail becomes two or three variants
differing only on the governing question, instead of an argument in
prose. Write the interface in the language the user is speaking, unless
the product's own is known to differ.

## One file, from the shell

The prototype is one self-contained HTML file holding every screen.
Start it from [templates/shell.html](./templates/shell.html), whose
header comment is the contract — keep that comment in the file you
grow, so its rules are still there in later turns. Design tokens in
`:root` are the funnel every screen styles through; one shared funnel
is what keeps many screens reading as one product. Nothing is wired: a
button here is just a button.

Render it in whatever visual medium the environment provides, cheapest
sufficient one first, and look at what you rendered before handing it
over — layout faults that are obvious on screen are invisible in the
markup. Pointing at problems is the medium's job or prose's; build no
pointing machinery into the file.

## In the project's own style

Propose the screen inventory as a draft, never as a question.

Build the screens in the project's design system: tokens copied
verbatim instead of approximated, elements named after the system's own
component names (a `data-component` attribute, marking components the
system lacks as `new:Name`) so the implementing session maps every
block to a real component. Where the project has no design system, the
shell's minimal palette is the finished look, not a stage awaiting a
swap.

Never lorem ipsum: real-length names, plausible sentences, awkward
numbers, and the edge states that bite (empty, longest plausible text,
error; not every screen needs every state). Real data, latency, and
production wiring stay out.

## What survives

Stop when every screen is approved or explicitly deferred as a
remaining risk. Record what the screens settled in
`docs/specs/<slug>/spec.md` (kebab-case slug, created when missing:
confirmed decisions, assumptions, deferred points, and remaining
risks, addressed to the implementing session), save the approved
surface as `docs/specs/<slug>/prototype.html`, and link it from the
spec. Everything else built along the way is disposable, and the
prototype is a reference, never production code.

Anything with a screen is in scope; command-line, terminal, and voice
interfaces are not.
