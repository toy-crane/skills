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
  flow. This is the bar renders are judged by. The skill body does not state
  it while the current text already meets it; when a real explanation fails
  it, add it as one outcome sentence.
- Visual explanation runs in two layers. A dedicated output style, separate
  from `natural-korean`, carries a light layer into every response, including
  explanations the agent starts on its own: structure that fits in the reply
  itself. Rendering a page or widget stays in `explain-visually` and fires
  only when the user asks for an explanation.

## Boundaries

- The skill fires when the user asks to have something explained or shown, not
  merely because the model suspects confusion.
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

The two layers exist because a skill loads only when a request matches its
description, while most explanations a user needs come unasked: result
reports, causes of a problem, option comparisons. Only an always-on surface
reaches those, and only a light layer is cheap enough to run on every
response. The output style is separate from `natural-korean`, so it works in
any language. The cost is that Claude Code keeps a single `outputStyle`
setting, so a user picks one of the two styles.

## Reconsider when

- Claude Code lets more than one output style apply at once, or users
  repeatedly want `natural-korean` and the light layer together.

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

- Firing `explain-visually` itself on every explanation the agent gives — a
  skill only loads on a matching request, and its render cost is too high for
  every response.
- Widening `natural-korean` to carry the light layer — it would reach only
  Korean users and mix response structure into a style scoped to register.
- A mod whose hook injects the light layer each session — it would combine
  with any style, but a separately installed hooks module is heavy for a
  presentation rule; revisit if users need both styles at once.

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
