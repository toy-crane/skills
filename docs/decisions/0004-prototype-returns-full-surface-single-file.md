# Prototype returns as a full-surface, single-file build preserved beside the spec

0003 retired the old prototype ahead of a rebuild; this record is that rebuild's
charter. The retired skill scoped each run to one uncertainty, which clarify's
variants already cover (0001). The rebuilt skill exists for what neither prose nor
variants can reach: misalignment the user cannot flag because it was never
mentioned. Its unit of work is therefore the whole surface, every screen a feature
needs with dummy data, proposed as a correctable draft, built skeleton first, and
filled with realistic data and edge states only after the structure is approved.

The build is one self-contained HTML file: design tokens in `:root`, a screen
switcher, numbered badges for pointing, state and viewport toggles, no build step
and no framework. Cross-screen consistency was the observed failure of ad-hoc
mockups (screens reading as different products), and one shared stylesheet makes
that consistency structural rather than aspirational; one file also renders in
whatever visual medium the environment provides. In the real app a button drags in
routes and reducers; here it stays just a button.

The approved surface survives at `docs/specs/<slug>/prototype.html`, linked from
`spec.md`. This narrows 0001's "visuals are disposable scaffolding": alignment
reached by looking cannot round-trip through prose alone, so the spec carries the
decisions and the preserved prototype carries what they look like. Working visuals
between passes remain disposable, and the preserved file is a reference, never
production code. Clarify regains one narrow routing, superseding 0001's
consequence at exactly this scale: when an experiential question outgrows variants
(a whole surface rather than one choice), the mode switch into a build is no
longer a cost but the point.

## Considered Options

- **Replace the build step with an external design product** (rejected): the
  observed wall was cross-screen consistency, which shared tokens solve
  structurally; moving the build out means alignment happens away from the
  session's context (spec, glossary, existing styling) and must re-enter through
  prose, recreating the loss the skill exists to remove.
- **Keep the run scoped to one uncertainty, as retired** (rejected): question-scale
  uncertainty already has a home in clarify's variants; rebuilding the overlap
  0003 removed would leave the surface-scale gap unfilled.
- **Project-stack components with dummy data** (rejected): wiring cost fights
  cheap exploration, and since the artifact is a reference beside the spec, stack
  fidelity buys nothing.
- **Screen-per-file with shared CSS** (rejected): consistency by convention rather
  than construction, and a multi-file surface neither travels nor renders as one
  thing.

## Consequences

The plugin returns to three skills at 0.5.0. Clarify's experiential clause gains
the outgrows-variants hand-off; 0001's visual-medium decision otherwise stands.
GLOSSARY gains Prototype, and Spec widens to name both writing sessions and the
preserved-prototype exception. The rebuild's interview dossier lives at
`docs/specs/prototype-rebuild/`.
