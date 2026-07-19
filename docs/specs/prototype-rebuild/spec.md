# Spec: Prototype rebuilds as a full-surface, single-file HTML skill

Confirmed 2026-07-19 in an interview session that iterated on working samples;
several decisions were made, then reversed by trial use, and the reversals are
part of this record. This dossier is the handoff contract for the rebuilt
`prototype` skill, implemented in the same change. Companion records: ADR
[0003](../../decisions/0003-retire-prototype-collapse-clarify-into-drafts.md)
(retirement and charter), ADR
[0004](../../decisions/0004-prototype-returns-full-surface-single-file.md)
(this rebuild), and `GLOSSARY.md` (Prototype, Spec).

## Goal

Kill the misalignment prose cannot surface. The user cannot point at what was
never mentioned, so the skill builds every screen of a feature with dummy
data, walks the user through the whole surface, and preserves the approved
result beside the spec so the alignment survives the handoff to
implementation.

## Confirmed decisions

1. **Standalone skill.** Invocable from an idea alone; reads
   `docs/specs/<slug>/spec.md` and `GLOSSARY.md` when present. Clarify hands
   off here when an experiential question outgrows variants (a whole surface
   rather than one choice).
2. **Plain HTML, no technology proper nouns.** The skill text names no
   library or framework (universality; extends 0001's capability language).
   The artifact is a reference, so project-stack fidelity buys nothing.
3. **One file, grown from a pinned template.** Every screen in one
   self-contained HTML file started from `templates/shell.html`. The chrome
   is exactly three controls (screen tabs, per-screen state pills, viewport
   cycle full/390/768 with a mobile-first start supported): "chrome that
   needs explaining has failed". Extend the chrome when the surface demands
   it, never strip it.
4. **Tokens are the funnel.** The `:root` block ships wireframe gray; every
   screen styles through it. The fill pass begins by replacing it with real
   tokens copied verbatim from the project's design system (extracted or
   decided with the user on a greenfield). Screen elements are named after
   the design system's own component names.
5. **Skeleton, then fill.** The screen inventory is proposed as a draft.
   Pass one is structure in gray; pass two is realistic data (lorem ipsum
   banned) plus edge states (empty, longest plausible text, error) via the
   state pills. Real data, latency, and production wiring stay out.
6. **Pointing belongs to the medium.** Element selection where the reviewing
   surface offers it, prose otherwise. No in-file pointing or protocol
   machinery: numbered badges, collapse control, approval stamps, change
   highlights, and an overview grid were all rejected, most after trial use.
7. **Media ladder in capability language.** Inline preview, local file in a
   browser tab, hosted page when the user reviews from a phone. Prototypes
   carry a small-screen viewport meta and stay usable on phones.
8. **Close and handoff.** Stop when every screen is approved or explicitly
   deferred. Decisions go to `docs/specs/<slug>/spec.md` (dossier shape,
   created lazily); the approved surface is saved as
   `docs/specs/<slug>/prototype.html` and linked from the spec. Working
   visuals between passes are disposable; the preserved file is a reference,
   never production code.
9. **External design products are out for v1.** Considered as a replacement
   for the build step and rejected (ADR 0004); promoting settled tokens to a
   shared design-system surface is deferred until reuse is real.
10. **Scope.** Anything with a screen: web app, mobile web, native app
    mockup in a phone frame. Command-line, terminal, and voice interfaces
    are out.

## Implementation tasks

- [x] `skills/prototype/SKILL.md`
- [x] `skills/prototype/templates/shell.html` (chrome verified by browser
      automation: tabs, state pills, viewport cycle, phone usability)
- [x] `skills/prototype/agents/openai.yaml`
- [x] `skills/prototype/evals/evals.json` (first pass, eight evals)
- [x] Clarify: hand-off sentence in the experiential-question clause
- [x] `GLOSSARY.md`: add Prototype; widen Spec
- [x] ADR 0004
- [x] `.claude-plugin/plugin.json` and `marketplace.json`: skill listed,
      keywords, version 0.5.0; `claude plugin validate . --strict` passes
- [x] README: prototype blurb
- [ ] End-to-end trial: run the skill against a scaffolded design-system
      project and verify verbatim token extraction plus working chrome

## Assumptions

- Sessions in any language write repo docs in English; the interview itself
  follows the user's language.
- Shell chrome labels ship in English; matching them to the prototype
  audience's language is the model's call during a run.
- Git carries prototype history; the file is overwritten in place.
- `data-states` and `data-when` values are free strings; the comma is the
  only separator.

## Deferred / out of scope

- Promoting settled tokens or components to a shared design-system surface.
- Hardening the eval suite (including a clarify eval for the new hand-off).
- The skills.sh discoverability loose end noted in CLAUDE.md (unrelated).

## Remaining risks

- **Template maintenance is code maintenance**: the shell must keep working
  across browsers and closed rendering surfaces without dependencies.
- **File weight**: very large surfaces may strain one file; a splitting
  strategy is deferred until it hurts.
- **Threshold judgment**: "outgrows variants" between clarify and prototype
  is a judgment call, as is clarify's own render threshold.
- **Realism drift**: dummy-data realism is model-judged; evals police lorem
  ipsum but not blandness.
