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
domain model too. When an app already exists, extract its design
language (color, type, spacing, component shapes) into the tokens so
the prototype reads as that product, not a foreign body. A contested
detail goes back to clarify's discipline, two or three variants
differing only on the governing question, instead of an argument in
prose.

## One file

The prototype is one self-contained HTML file holding every screen:
design tokens in `:root`, a screen switcher, vanilla JS, no build
step, no framework, no network dependency. In the real app a button
drags in routes and reducers; here it is just a button. One shared
stylesheet makes consistency structural (screens cannot drift into
looking like different products), and one file renders in whatever
visual medium the environment provides: a browser tab, an artifact
page, an inline preview.

Wire in three toggles:

- Numbered badges on every major block, so feedback can say "swap 3
  and 5" instead of "that box near the top".
- A state switcher per screen once states exist: filled, empty,
  longest plausible text, error.
- A viewport switch where layout is contested. Native app screens
  sit inside a phone frame.

Anything with a screen is in scope: web app, mobile web, native app
mockup. CLI, TUI, and voice interfaces are not.

## Skeleton, then fill

Propose the screen inventory as a draft, never as a question: list
the screens you believe the surface needs and let the user correct
the list.

Pass one builds every screen as skeleton: layout, navigation, key
elements, representative data. Walk the user through the whole
surface and fix structure until it is approved; structural
misalignment costs minutes here and hours after fill.

Pass two fills the approved structure with realistic dummy data.
Never lorem ipsum: real-length names, plausible sentences, awkward
numbers, and the edge states the state switcher exposes. Real data,
real latency, and production wiring stay out; they are not what
alignment is about. Review again, screen by screen.

## What survives

Stop when every screen is approved or explicitly deferred as a
remaining risk. Record what the screens settled in
`docs/specs/<slug>/spec.md` (created in the dossier shape when
missing), save the approved surface as
`docs/specs/<slug>/prototype.html`, and link it from the spec. The
implementing session receives both halves: the spec says what was
decided, the prototype shows what it looks like. Everything else
built along the way is disposable, and the prototype itself is a
reference, never production code.
