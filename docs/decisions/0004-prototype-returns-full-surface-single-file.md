# Prototype returns as a full-surface, single-file build preserved beside the spec

0003 retired the old prototype ahead of a rebuild; this record is that rebuild's
charter. The retired skill scoped each run to one uncertainty, which clarify's
variants already cover (0001). The rebuilt skill exists for what neither prose nor
variants can reach: misalignment the user cannot flag because it was never
mentioned. Its unit of work is therefore the whole surface, every screen a feature
needs with dummy data, proposed as a correctable draft, built skeleton first in
wireframe gray (rough styling directs feedback at structure, not fonts and
colors), and filled with the project's real tokens, realistic data, and edge
states only after the structure is approved.

The build is one self-contained HTML file grown from a pinned template,
`skills/prototype/templates/shell.html`, which ships the review chrome: screen
tabs, per-screen state pills, a viewport cycle, and nothing else. The chrome is
pinned because it is plumbing that rots silently when regenerated per run (two
such bugs surfaced while drafting it), and it is three controls because trial use
killed everything that needed explaining: numbered pointing badges, a collapse
pill, approval stamps, and change highlights all fell to "chrome that needs
explaining has failed". Pointing at problems belongs to the reviewing medium
(element selection where the surface offers it) or to prose. Design tokens live
in `:root` as the single funnel all screens style through, which makes
cross-screen consistency (the observed failure of ad-hoc mockups) structural
rather than aspirational. Per 0001's discipline, extended here from tool names to
library and framework names, the skill text names no concrete technology.

The approved surface survives at `docs/specs/<slug>/prototype.html`, linked from
`spec.md`. This narrows 0001's "visuals are disposable scaffolding": alignment
reached by looking cannot round-trip through prose alone, so the spec carries the
decisions and the preserved prototype carries what they look like. Working
visuals between passes remain disposable, and the preserved file is a reference,
never production code. Clarify regains one narrow routing, superseding 0001's
consequence at exactly this scale: when an experiential question outgrows
variants (a whole surface rather than one choice), the mode switch into a build
is no longer a cost but the point.

## Considered Options

- **Replace the build step with an external design product** (rejected):
  alignment would happen away from the session's context (spec, glossary,
  existing styling) and re-enter through prose, recreating the loss the skill
  exists to remove; the observed wall, cross-screen consistency, is solved
  structurally by shared tokens.
- **Keep the run scoped to one uncertainty, as retired** (rejected):
  question-scale uncertainty already has a home in clarify's variants; the gap
  is surface-scale.
- **Project-stack components with dummy data** (rejected): wiring cost fights
  cheap exploration, the artifact is a reference so stack fidelity buys nothing,
  and a framework route cannot be preserved as a frozen file.
- **A utility-CSS framework inside the file** (rejected): every delivery
  mechanism breaks self-containment (network scripts fail on closed rendering
  surfaces and rot as pinned versions), and thousands of ready-made classes
  bypass the token funnel that consistency depends on.
- **Screen-per-file with shared CSS** (rejected): consistency by convention
  rather than construction, and a multi-file surface neither travels nor renders
  as one thing.
- **In-file review devices** (rejected after trial): numbered badges, a collapse
  control, approval stamps, and change highlights each duplicated the reviewing
  medium's own affordances or tracked protocol state that only the final
  materialization needs.

## Consequences

The plugin returns to three skills at 0.5.0. Clarify's experiential clause gains
the outgrows-variants hand-off; 0001's visual-medium decision otherwise stands.
GLOSSARY gains Prototype, and Spec widens to name both writing sessions and the
preserved-prototype exception. The template file is the shell's molt point:
harness evolution replaces it without touching the skill text. The rebuild's
interview dossier lives at `docs/specs/prototype-rebuild/`.
