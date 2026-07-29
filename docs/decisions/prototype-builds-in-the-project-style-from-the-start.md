# The prototype builds in the project's own style from the first screen

build-prototype opened every run in wireframe gray and swapped the real tokens
in only after the structure was approved. prototype-returns-full-surface-single-file set that staging up, and
thin-skills-over-fixed-procedures made it the worked example of the one rule that lets a fixed procedure
exist at all, on two named failures: structure corrected after styling costs
hours where it cost minutes, and a user shown styling reacts to styling instead
of structure. The staging is retired here. The prototype renders in the
project's design system from the first screen — tokens copied verbatim,
elements named after the system's own components — and falls back to a minimal
neutral style only where the project has no system to copy. Minimal is a
terminal style, not a stage: nothing swaps it out later, and a greenfield
prototype that never acquires a visual identity has lost nothing this skill is
for.

The retired argument is not wrong, and it is traded away with that understood. A
design system does anesthetize structural judgment — correct spacing and type
make a wrong information hierarchy feel settled — and a surface that looks
finished does suppress the objection that a screen should not exist. What the
gray pass never accounted for is that it buys that protection by rendering the
prototype as a product the project is not. Most runs extend something that
already ships, and there the load-bearing question is whether a new screen
belongs in this product, which a gray screen cannot answer even in principle.
The old staging optimized the one question it could pose and was blind to the
one the user actually arrives with. Two full renders of every screen is also a
cost proportional to the surface, on a skill whose unit of work is the whole
surface. The set's own evidence had already drifted: eval 7, the existing-app
case, asks for tokens copied verbatim into `:root` and never mentions skeleton
fidelity.

Judgment is the instrument here, not an eval, and that is a departure worth
naming because explain-visually-keeps-only-the-counter-defaults established evidence-based pruning as this
repo's method. It does not reach this decision. An eval scores model output
against assertions; the failure the gray pass guarded is the user's attention
landing on the wrong axis, which no assertion over a model's transcript
observes. Where the available instrument cannot see the thing, the honest move
is to decide and record the exposure rather than to manufacture a measurement
that answers a different question.

One waypoint replaces the pass. The screen inventory was already a draft to
correct; it is now a point the session stops at and waits on, because it is the
only cheap correction left. A list is text and costs a sentence to fix, where
building the wrong five screens now costs a themed, filled surface instead of
five gray boxes. That is a single wait, not the two-pass staging it replaces,
and it is the whole of what remains.

With it gone the published set carries no fixed procedure at all. thin-skills-over-fixed-procedures keeps
its text and its rule intact; only its illustration is withdrawn, and a rule
demonstrated by an exception being taken away is not weaker than one propped up
by a standing exception.

## Considered Options

- **Keep the pass and repair eval 7** (rejected): the conservative reading, and
  the one this session recommended before the trade was examined. It preserves
  an attention guard the set has no way to measure, at the price of a second
  render of every screen, and keeps the skill's only stage alive for a severity
  that is asserted rather than observed.
- **Make the pass conditional on greenfield** (rejected): the procedure survives
  behind a narrower gate, which is the shape a rule takes just before nobody
  remembers why it is there. Greenfield is also where gray is least
  distinguishable from the intended result, so the gate would fire exactly where
  it buys least.
- **Minimal as a start state, themed once structure is approved** (rejected):
  pass one and pass two under new names, with the swap moved behind a condition.
- **A model-proposed starter theme on greenfield** (rejected): removes one
  decision point and installs another, and makes the session argue visual
  identity, which is not what the prototype aligns.

## Consequences

`skills/build-prototype/SKILL.md` loses the two-pass section; the surviving fill
content — realistic dummy data, no lorem ipsum, edge states through the state
pills, no real data or production wiring — moves into the single build, and the
screen inventory becomes an explicit stop. `templates/shell.html` keeps its gray
`:root` block and its `.wf-line` / `.wf-pic` helpers, reframed from "replace
this in the fill pass" to the fallback a project without a design system lands
on. Evals 1, 2, and 3 are rewritten: eval 2's assertion that the model must not
advance to the fill has nothing left to guard and is replaced by the inventory
stop, and eval 7 stops being the odd one out. `agents/openai.yaml` and the
README entry drop the wireframe-skeleton phrasing. AGENTS.md keeps the
"Skills stay thin" rule and cites this retirement in place of the procedure it
used to name. GLOSSARY's Prototype entry drops skeleton-first. prototype-returns-full-surface-single-file keeps
its file and every other position it holds — full surface, one self-contained
file, pinned shell, preserved beside the spec — and only its skeleton-first
clause is superseded.

How the design system gets found stays unwritten: the branch is stated, the
search is the model's. The exposure is that a strong system can make a wrong
structure read as right, and the inventory stop does not catch that — it catches
wrong screens, not wrong hierarchy inside a screen. If prototypes start being
approved with structural faults that surface at implementation, the finding
belongs against this record, and reinstating a gray pass on greenfield only is
the first thing to reach for.
