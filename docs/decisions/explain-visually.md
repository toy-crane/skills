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

## Boundaries

- The skill fires when the user asks to have something explained or shown, not
  merely because the model suspects confusion.
- A simple definition or fact does not earn a rendered artifact even when a
  structure exists behind it.
- The skill names capabilities, not concrete tools, so it degrades across web,
  desktop, mobile, and terminal environments.

## Why

Models already explain in prose; rendering is the capability this skill adds.
The explicit renderer lookup prevents capable surfaces from collapsing to ASCII,
while the one-sentence gate prevents an expensive visual from overwhelming a
small question.

## Reconsider when

- Models reliably discover available renderers without being told.
- Models stop over-rendering one-sentence questions, allowing the remaining
  restraint clause to be removed.
- A host-independent renderer becomes available in every supported environment.

## Still-rejected alternatives

- Triggering on inferred silent confusion — it requires a large signal-detection
  protocol and risks diagnosing the user without being asked.
- The generic name `explain` — it promises what every assistant already does and
  hides the reason to invoke the skill.
- Naming a concrete renderer or always building a page — supported surfaces
  differ, and artifact craft is not the skill's job.
- A bare one-line body with no restraint — evals showed it over-rendering a
  glossary definition with multiple unnecessary artifacts.

## Evidence worth preserving

- Pruning tests found form-selection instructions mostly inert but retained the
  over-rendering brake. Renderer-first tests then changed tool use from none to
  consistent rendering where a renderer existed; each brake revision required a
  fresh held-out control to avoid fitting the prompt that exposed it.
