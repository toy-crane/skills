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

Nothing replaces the pass. A mandatory stop on the screen inventory was live for
part of this decision and is rejected below: it reinstates a fixed procedure
under a new name, on a justification that was the predicted cost of building the
wrong screens rather than a failure anyone had watched happen. It also gates a
skill built to escape prose behind the approval of a prose list — a user
confirming screen names in text before seeing anything is the exact mode this
skill exists to leave. The inventory stays what it already was, a draft the user
corrects, and the session builds from it without waiting.

So the published set now carries no fixed procedure at all. thin-skills-over-fixed-procedures keeps its
text and its rule intact; only its illustration is withdrawn, and a rule
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
- **A mandatory stop on the screen inventory** (rejected): held for part of this
  decision as the compensating control for the removed pass, and dropped under
  review. It is a fixed procedure by AGENTS.md's own test, and the failure it
  guards — wasted work on screens that should not exist — was predicted from the
  higher cost of a themed render, never observed. Trading a procedure whose
  failure cannot be measured for one whose failure was never seen is not a
  trade. Its prose-gate defect is the second reason and would be disqualifying
  on its own.
- **Announcing on greenfield that a visual direction can be supplied** (rejected):
  a user who wants a particular look says so, and instructing the model to
  advertise the option is method, thickening the skill to no end. Greenfield
  stays greenfield with no branch of its own.

## Consequences

`skills/build-prototype/SKILL.md` loses the two-pass section, and what replaces
it is short: use the project's design system, fall back to minimal, build. The
surviving fill content — realistic dummy data, no lorem ipsum, edge states
through the state pills, no real data or production wiring — moves into the
single build. `templates/shell.html` keeps its gray `:root` block and its
`.wf-line` / `.wf-pic` helpers, reframed from "replace this in the fill pass" to
the fallback a project without a design system lands on. Evals 1, 2, and 3 are
rewritten: eval 2's assertion that the model must not advance to the fill has
nothing left to guard, and eval 7 stops being the odd one out. `agents/openai.yaml`
and the README entry drop the wireframe-skeleton phrasing. AGENTS.md keeps the
"Skills stay thin" rule and cites this retirement in place of the procedure it
used to name. GLOSSARY's Prototype entry drops skeleton-first. prototype-returns-full-surface-single-file keeps
its file and every other position it holds — full surface, one self-contained
file, pinned shell, preserved beside the spec — and only its skeleton-first
clause is superseded.

How the design system gets found stays unwritten: the branch is stated, the
search is the model's. Two exposures are accepted. A strong system can make a
wrong structure read as right, and nothing in the skill catches that any more.
Correcting the screen list also costs more than it did, because a screen deleted
after the build is now a themed, filled screen rather than a gray box, and no
gate stands in front of that. Both were priced in: the first is the trade this
record makes, and the second is what rejecting the inventory stop buys back in
thinness. If prototypes start being approved with structural faults that surface
at implementation, the finding belongs against this record, and reinstating a
gray pass on greenfield only is the first thing to reach for.
