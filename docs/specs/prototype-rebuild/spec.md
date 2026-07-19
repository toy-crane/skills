# Spec: Prototype rebuilds as a full-surface, single-file HTML skill

Confirmed 2026-07-19 in an interview session. This dossier is the handoff
contract for the rebuilt `prototype` skill, implemented in the same change.
Companion records: ADR
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
2. **Plain HTML, stack-agnostic.** The artifact is a reference, so
   project-stack fidelity buys nothing; an existing app's design language is
   instead extracted into the tokens.
3. **One self-contained file.** Every screen in one HTML file: `:root`
   tokens, screen switcher, vanilla JS, no build, no framework, no network.
   Cross-screen consistency (the observed wall of ad-hoc mockups) becomes
   structural.
4. **Skeleton, then fill.** Pass one lays every screen at structure fidelity
   and walks the whole surface; pass two fills approved structure with
   realistic data. The screen inventory itself is proposed as a draft, never
   asked.
5. **Dummy-data discipline.** Skeleton carries representative data; fill bans
   lorem ipsum and adds edge states (empty, longest plausible text, error)
   via a state switcher. Real data, latency, and production wiring stay out.
6. **Pointing device.** Numbered badges on every major block; contested
   details return to clarify's variant discipline.
7. **Screens only.** A mobile/desktop viewport switch where layout is
   contested; native app screens sit in a phone frame. Scope is anything with
   a screen; CLI, TUI, and voice are out.
8. **Close and handoff.** Stop when every screen is approved or explicitly
   deferred. Decisions go to `docs/specs/<slug>/spec.md` (created in the
   dossier shape when missing); the approved surface is saved as
   `docs/specs/<slug>/prototype.html` and linked from the spec. Reference,
   never production code.
9. **External design products are out for v1.** Considered as a replacement
   for the build step and rejected (ADR 0004); promoting settled tokens to a
   shared design-system surface is deferred until reuse is real.

## Implementation tasks

- [x] `skills/prototype/SKILL.md` (this design)
- [x] `skills/prototype/agents/openai.yaml`
- [x] `skills/prototype/evals/evals.json` (first pass, eight evals)
- [x] Clarify: hand-off sentence in the experiential-question clause
- [x] `GLOSSARY.md`: add Prototype; widen Spec
- [x] ADR 0004
- [x] `.claude-plugin/plugin.json` and `marketplace.json`: skill listed,
      keywords, version 0.5.0; `claude plugin validate . --strict` passes
- [x] README: prototype blurb

## Assumptions

- Sessions in any language write repo docs in English; the interview itself
  follows the user's language.
- Git carries prototype history; the file is overwritten in place, and
  working visuals between passes are disposable.
- The rendering surface follows the visual-medium rule: cheapest sufficient
  medium the environment provides, never a named tool.

## Deferred / out of scope

- Promoting settled tokens or components to a shared design-system surface.
- Hardening the eval suite (including a clarify eval for the new hand-off).
- The skills.sh discoverability loose end noted in CLAUDE.md (unrelated).

## Remaining risks

- **File weight**: very large surfaces may strain one file; a splitting
  strategy is deferred until it hurts.
- **Realism drift**: dummy-data realism is model-judged; eval 3 polices lorem
  ipsum but not blandness.
- **Threshold judgment**: "outgrows variants" between clarify and prototype
  is a judgment call, as is clarify's own render threshold.
