# Explanations read correctly before any interaction

Governing decision contract: [explain-visually](../../decisions/explain-visually.md)
owns the first-view rule, its scope across static, interactive, and text
renders, and the rejection of a technique catalog. This spec applies that
contract to the shipped `explain-visually` skill and proves it with an eval.

## Problem

When `explain-visually` renders an interactive explanation of something with
stages or a flow, the single screen it produces often hides the structure
behind its controls. The user has to click or drag before they can see how
many stages there are, where they are among them, or which way things move.
Understanding the order and direction of a process becomes the user's work
instead of the explanation's.

## User-visible outcomes

- An explanation rendered by `explain-visually` shows, before the user touches
  anything, every stage or part of the subject and the direction or order in
  which they connect.
- Controls, when the render has them, add detail on top of that view: the
  current stage's contents, a changed value, an expanded group. Removing every
  control would still leave a correct overview.
- Static diagrams and the text fallback follow the same rule: order and
  direction are readable at a glance.
- Every other behavior of the skill is unchanged: it fires only when the user
  asks, answers in one sentence when that is enough, uses the best renderer the
  session provides, and keeps prose minimal.

## Approved scope

- The instructions in `explain-visually`'s skill body, extended with the
  first-view rule stated as an outcome.
- An eval that measures the rule on multi-stage subjects and confirms the
  existing restraint behavior did not regress.
- Users of the installed plugin and copy-in skill receive the change through
  their normal update path.

## Acceptance criteria

- First-view pass rate on held-out cases. A cell passes when the render's
  state before any interaction shows every stage or part the subject has and
  makes their order or direction readable, judged from that pre-interaction
  state alone. Target: at least 80% of held-out cells pass, and the held-out
  score sits above the baseline measured on the current skill outside the
  noise floor. Cases are new `/explain-visually` prompts about multi-stage
  flows that exist in this repository (for example a pull request's path from
  `pr` through `babysit-pr` and `merge` to `clean-branches`, or a spec's path
  from `shape-idea` to `implement`), written and split into train and
  held-out before the baseline is measured.
- The existing restraint cases still answer in prose without rendering
  (cases 4–6 in `skill-evals/explain-visually/evals.json`), and the existing
  rendering cases (1–3) still render, each at or above its baseline pass rate
  outside the noise floor.
- The skill body states the rule as an outcome and names no specific
  technique, renderer, or tool.

## Settled constraints and rationale

- A principle, not a technique catalog. The user chose a single outcome rule
  over listing techniques because form-selection instructions in this skill
  already proved mostly inert in evals; the rule lets the model choose among
  overview-plus-highlight, filmstrips, flow motion, linked highlighting, and
  progressive disclosure per subject.
- The rule applies to every rendered form and to the text fallback. It does
  not ask for interactivity.
- The one-sentence restraint and the renderer-first lookup stay as they are;
  this change must not trade them away.

## Assumptions

- The skill does not add an instruction to prefer interactive renders for
  stage-by-stage subjects. The Claude desktop app's own renderer guidance
  already routes such subjects to steppers, and the observed problem was
  interaction hiding structure, not a lack of interaction. Override if the
  baseline shows multi-stage subjects rendered as one static picture that
  fails the first-view check.
- The first view of an interactive render is judged from a capture taken
  before any input, not from its source code alone.

## Off-limits

- The skill's trigger description and the one-sentence brake. Their behavior
  is held by existing evals and a separate decision; changing them would mix
  two experiments.
- Other skills that invoke `explain-visually`, such as `shape-idea`. They pass
  a question and receive a render; nothing in their hand-off changes.

## Deferred points

None.

## Remaining risks

- The baseline may already pass the first-view check often enough that no
  held-out improvement outside the noise floor is possible. In that case the
  eval cannot justify the text change; implementation reports the baseline
  and stops before editing the skill, and the user decides whether the rule
  still lands.
- The failure appears in hosts that render interactive HTML. If the eval runs
  only where no such renderer exists, it measures static output and can miss
  the failure entirely, so the cases must run with a renderer that can produce
  interactive output.

## Setup before implementation

None.

## Post-release check

None.
