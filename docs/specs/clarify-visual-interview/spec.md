# Spec: Clarify interviews through environment-provided visual media

Confirmed 2026-07-17 in a grill-with-docs session. This dossier is the handoff
contract for reworking the published `clarify` skill; a later session should be
able to implement from this file alone. Companion records: ADR
[0001](../../decisions/0001-visual-media-over-prototype-routing.md) (medium
swap), ADR [0002](../../decisions/0002-spec-dossiers-under-docs-specs.md)
(this dossier convention), and `GLOSSARY.md` (Experiential question, Visual
medium, Variant, Structural mirroring, Spec).

## Goal

Remove the `/prototype` routing from `skills/clarify` and have interviews
concretize questions through whatever visual media the running environment
provides, ending every implementation-bound session with a durable spec
dossier. Motivations: keep the interview's cadence (no mode switch into a
build), compress questions (one rendered reaction replaces several prose
rounds), and stay portable (a published skill cannot assume any specific tool).

## Confirmed decisions

1. **Two jobs for visuals**: settling experiential questions, and structural
   mirroring of complex understanding. Not a third; everything else is prose.
2. **Capability language, never tool names**: "whatever visual medium the
   environment provides (an inline widget, an artifact page, a local HTML
   file)." The skill must not name a concrete tool or API.
3. **Cheapest sufficient medium first**; escalate fidelity only when the
   question itself demands it (e.g. real look-and-feel needs project CSS).
4. **Defer as last resort**: a question no available medium can settle is
   named as such and recorded under remaining risks, never approximated into
   a false confirmation.
5. **Visuals are disposable scaffolding**. The deliverable is decisions:
   chat summary + `GLOSSARY.md` + `docs/decisions/` + `spec.md`. Byproduct
   pointers (an artifact URL that happens to exist) may be handed over as
   non-normative references.
6. **Threshold against overuse**: an experiential question goes visual
   automatically (prose cannot answer it); structural mirroring only when one
   render replaces two or more prose rounds; all else stays prose.
7. **Spec dossier on close**: when the session confirmed implementation-bound
   decisions, write `docs/specs/<kebab-slug>/spec.md` (lazy creation; optional
   tracker-number prefix on the slug). Sessions that only maintained the
   glossary or decision records write none.
8. **The `prototype` skill stays** in the repo and plugin for direct
   invocation; only clarify's routing to it is removed.

## Required clauses for the rewritten SKILL.md

Keep unchanged: one question per turn (one dimension, one question mark);
investigate-before-asking; principle-first ordering; a recommended answer per
question; domain-modeling integration; the no-invented-questions stop rules.

Replace and add:

- The medium-matching paragraph: propositional questions settle in prose;
  experiential questions settle by rendering 2–3 variants, differing only on
  the governing question, in the cheapest sufficient visual medium, with the
  user's reaction as the answer. Variants shown together remain one question.
- A structural-mirroring clause carrying the ≥2-prose-rounds threshold.
- The capability sentence (decision 2) with graceful degradation: no visual
  medium at all means prose plus a local file the user can open.
- The defer clause (decision 4).
- The closing contract: drop the issue-artifact delivery sentence entirely;
  write the spec dossier (decision 7); the summary still covers confirmed
  decisions, rationale, assumptions, deferred points, and remaining risks.

## Implementation tasks

- [x] Rewrite `skills/clarify/SKILL.md` to the clauses above.
- [x] Update its `description:` frontmatter (spec-handoff trigger branch added).
- [x] Rewrite evals #3, #4, #6, #7 around medium language (no `/prototype`,
      no `artifacts/<issue-slug>/`); extend #5 and #7 to expect the spec
      dossier; fix #2's "prototype owns the glossary" wording; add negative
      eval #8: a prose-sufficient question must not get a render.
- [x] Revisit `agents/openai.yaml` default_prompt (mention spec handoff).
- [x] Extend README's clarify blurb with the spec-dossier close.
- [x] Bump `.claude-plugin/plugin.json` to 0.3.0; `claude plugin validate
      . --strict` passes.

## Assumptions

- Sessions in any language write repo docs in the repo's documentation
  language (English here); the interview itself follows the user's language.
- `plan.md`, `tasks.md`, and other residents join a dossier in later phases;
  clarify itself only ever writes `spec.md`.

## Deferred / out of scope

- Backporting the visual-medium clauses to the personal `grilling` /
  `grill-with-docs` skills.
- Any change to the `prototype` skill's own text or its `artifacts/`
  convention.
- The skills.sh discoverability loose end noted in CLAUDE.md (unrelated).

## Remaining risks

- **Fidelity ceiling**: relative judgments made in placeholder styling may
  not survive contact with the real design system; the defer clause mitigates
  but does not eliminate this.
- **Toolless environments**: where no visual medium exists, the skill
  degrades to prose plus local files and loses most question compression.
- **Threshold is model-judged**: "would this take two prose rounds?" is a
  judgment call; the negative eval must police drift toward overuse.
