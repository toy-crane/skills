# Explain visually

## Decisions

- `explain-visually` is a user-invoked capability, not a pipeline stage or a
  silent-confusion detector.
- Answer directly when one sentence is enough. Otherwise draw the gap as a
  diagram, comparison, real-value trace, timeline, table, or annotated code,
  choosing the form from the subject rather than from a closed vocabulary.
- Check which renderer the current session actually provides and use the best
  available one. Fall back to text when the environment cannot render.
- Keep prose to the minimum needed to orient the visual; do not duplicate the
  drawing in a second long explanation.
- The first view, meaning the rendered explanation before the user touches any
  control, must on its own show the whole structure and the direction of
  progress. Interaction may add detail on top of that view; it is never the
  only way to see the structure, the order of stages, or which way things
  flow. This is the bar renders are judged by. The skill body and the output
  style state it as one outcome sentence, naming stages, the branches a stage
  splits into, and the cases a control can show, since steppers that hid a
  stage's branches failed it.
- The kind of content being explained, not whether the user asked, picks the
  form: a fact or definition stays prose; structure or relationships become a
  static diagram with its labels on the drawing; a multi-step process becomes
  a stepper the user paces with every stage visible; a mechanism whose result
  depends on values becomes a manipulable view that asks for a prediction
  before the user changes anything.
- The `at-a-glance` output style, separate from `natural-korean`, applies that
  choice to every explanation, including ones the agent starts on its own,
  and hands processes, mechanisms, and structures too large for the reply to
  `explain-visually` to render. Without the style, `explain-visually` still
  fires only when the user asks.
- When it replies in Korean, `at-a-glance` applies `natural-korean`'s
  register rules, carried as a copied section. `natural-korean` stays the
  canonical source of that text and stays selectable on its own; the copy
  must match it.

## Boundaries

- The skill fires when the user asks to have something explained or shown, or,
  under the output style, when the agent explains a process, a mechanism, or a
  structure too large for the reply; never merely because the model suspects
  confusion.
- A simple definition or fact does not earn a rendered artifact even when a
  structure exists behind it.
- The skill names capabilities, not concrete tools, so it degrades across web,
  desktop, mobile, and terminal environments.
- The first-view rule applies to every rendered form, static or interactive,
  and to the text fallback. It does not ask for interactivity; whether to add
  controls stays the renderer's and the subject's call.

## Why

Models already explain in prose; rendering is the capability this skill adds.
The explicit renderer lookup prevents capable surfaces from collapsing to ASCII,
while the one-sentence gate prevents an expensive visual from overwhelming a
small question.

The first-view rule targets a failure the user saw in interactive renders: a
single-screen widget where the stages and their direction appear only after
clicking or dragging. Research on visual explanation converges on the same
fix: overview first (Shneiderman), time laid out in space as small multiples,
motion along edges for direction, and learner control only after segmentation
(Tversky et al. found animation alone rarely beats a static graphic). A rule
stated as the outcome lets the model pick among those techniques per subject.

The output style exists because a skill loads only when a request matches its
description, while most explanations a user needs come unasked: result
reports, causes of a problem, option comparisons. Only an always-on surface
reaches those. The content-kind routing follows education research: words
with a picture beat words alone, labels beside the picture help (Mayer's
contiguity, signaling, and segmenting principles), animation beats a static
picture only modestly while learner-paced control and even minimal
interactivity help (Höffler & Leutner 2007; Berney & Bétrancourt 2016), and
simulations work best when the learner predicts first (PhET). The output style is separate from `natural-korean`, so it works in
any language. Claude Code keeps a single `outputStyle` setting, so a user
picks one of the two styles. With only "reply in the user's language",
Korean replies under `at-a-glance` read as translated (user report,
2026-11-19), so the style carries the Korean register rules as a section
that applies only to Korean replies. Other languages are unaffected, and
copying the text keeps both styles usable on their own at the cost of two
places to edit.

## Reconsider when

- Claude Code lets more than one output style apply at once; then drop the
  copied Korean section and combine the two styles instead.

- Models reliably discover available renderers without being told.
- Models stop over-rendering one-sentence questions, allowing the remaining
  restraint clause to be removed.
- A host-independent renderer becomes available in every supported environment.
- A user reports, or a session shows, a render whose stages or direction appear
  only after interaction: turn it into a case for the first-view eval and
  measure the outcome sentence against it.

## Still-rejected alternatives

- Triggering on inferred silent confusion — it requires a large signal-detection
  protocol and risks diagnosing the user without being asked.
- The generic name `explain` — it promises what every assistant already does and
  hides the reason to invoke the skill.
- Naming a concrete renderer or always building a page — supported surfaces
  differ, and artifact craft is not the skill's job.
- A bare one-line body with no restraint — evals showed it over-rendering a
  glossary definition with multiple unnecessary artifacts.
- A catalog of techniques (stepper, filmstrip, flow animation, linked
  highlighting, direct manipulation, progressive disclosure) in the skill body —
  form-selection instructions already proved mostly inert, so a list is
  unlikely to change behavior; revisit if an eval shows the first-view rule
  alone leaves a specific technique unused where it is clearly needed.

- Rendering only when the user asks — it leaves the unasked explanations,
  where most of the need is, as prose.
- Widening `natural-korean` to carry the light layer — it would reach only
  Korean users and mix response structure into a style scoped to register.
- A mod whose hook injects the light layer each session — it would combine
  with any style, but a separately installed hooks module is heavy for a
  presentation rule.
- Only language-neutral writing principles in `at-a-glance` — no
  duplication, but it drops the Korean anchors (합쇼체, 표기 규칙, examples)
  that make the register concrete.
- Merging `natural-korean` into `at-a-glance` — users who want the register
  without the explanation forms would lose a style to pick.

## Evidence worth preserving

- Pruning tests found form-selection instructions mostly inert but retained the
  over-rendering brake. Renderer-first tests then changed tool use from none to
  consistent rendering where a renderer existed; each brake revision required a
  fresh held-out control to avoid fitting the prompt that exposed it.
- The first-view eval (`skill-evals/explain-visually/explain-visually-first-view`,
  stand-in inline renderer, captures before any input) found the current skill
  already at the bar on 20 multi-stage questions about this repository:
  held-out 20/20 and train 18/20 on Sonnet 5.5 at 2 reps, 2026-11-18. Sonnet
  drew all 40 as static diagrams; an Opus 5.5 pilot drew steppers, but with
  every stage named above the panel. Synthetic questions did not reproduce the
  hidden-structure failure, so the outcome sentence stayed out of the skill.
- The at-a-glance climb (2026-11-19, Sonnet 5.5, held-out, suites in
  `skill-evals/explain-visually/regression/`) took form routing from 19/40 to
  40/40, the one-sentence brake from 12/20 to 20/20 with the style on and off,
  and predict-first from 0/20 to 20/20. Three changes carried it: deciding the
  content kind before reading sources, because renderer tools listed only as
  deferred read as "nothing can draw"; widening "mechanism" to results that
  change with a state or condition, since rules mapping cases to outcomes
  otherwise became tables; and keeping both the result and the rule that
  decides it out of the reply. Once processes became steppers, the first-view
  score fell to 15/20 with the style on, because steppers hid the branches
  inside a step; naming each branch in the always-visible step row brought it
  back to 18/20 (style off 19/20, baseline 20/20, inside the ±22 noise floor).
  The remaining first-view miss is a predict-first view that hides the whole
  structure behind its quiz.
