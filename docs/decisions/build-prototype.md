# Build prototype

## Decisions

- Build every screen of the surface in one self-contained HTML file with shared
  design tokens, realistic dummy data, relevant edge states, and the pinned
  review shell.
- Inspect the existing product first and render in its design system from the
  first screen. Copy its tokens and component names; when no system exists, use
  the shell's minimal palette as the finished style.
- Propose the screen inventory as a correctable draft and begin building without
  an approval gate. For a contested detail, render variants that change only
  that detail and fold the user's choice back into the single prototype.
- Keep real APIs, production routing, latency, frameworks, and network
  dependencies out of the prototype.
- Preserve the approved file as `docs/specs/<slug>/prototype.html`, linked from
  the spec. It is a visual reference, never production code.
- Record surface decisions in the work-unit spec. Update a project decision
  contract only when the user confirmed a choice that independently meets the
  durable decision gate.

## Boundaries

- Keep the shell's screen tabs, state pills, viewport cycle, contract comment,
  and token funnel.
- Web, mobile web, and native app mockups in a phone frame are in scope; CLI,
  terminal, and voice interfaces are not.
- Intermediate variants are disposable once the user selects a direction.

## Why

A full surface exposes missing screens and cross-screen inconsistencies that no
one knew to mention in prose. One portable file keeps the review cheap and the
shared token funnel makes consistency structural. Using the project's style
from the first render answers whether the new surface belongs in the existing
product, which a generic wireframe cannot.

## Reconsider when

- Approved prototypes repeatedly reveal structural faults only during
  implementation; a greenfield-only low-fidelity pass is the first guard to
  test.
- A closed rendering surface can no longer run the self-contained shell.
- Real production wiring becomes necessary to settle an interaction that dummy
  state cannot represent.

## Still-rejected alternatives

- Skeleton-then-fill staging — it doubles the render and hides whether a screen
  belongs in the existing product.
- A mandatory approval stop on the prose screen inventory — it gates a visual
  alignment tool on the medium it exists to escape.
- One file per screen or shared external CSS — the surface stops travelling and
  rendering as a single consistent artifact.
- Project-stack components or a real API — wiring cost and production behavior
  distract from alignment and break self-containment.
- In-prototype review badges, stamps, and change tracking — they duplicate the
  reviewing medium and create chrome that needs explanation.

## Evidence worth preserving

- Removing the gray pass knowingly accepts that polished styling can make a bad
  hierarchy feel correct. If that failure appears in implementation reviews,
  restore a targeted guard instead of recreating the old two-pass workflow by
  default.
