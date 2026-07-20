# Spec: The post-clarify pipeline and the to-plan skill

Confirmed 2026-07-20 in a clarify session. This spec folder is the handoff
contract for adding the `to-plan` skill and recording the pipeline it belongs
to. Companion records: ADR
[0005](../../decisions/0005-jit-planning-with-optional-to-plan.md)
(just-in-time planning, this pipeline), ADR
[0002](../../decisions/0002-spec-dossiers-under-docs-specs.md) (spec folders,
under their former name "dossier"), and `GLOSSARY.md` (Spec folder, Plan).

## Goal

Give the published set one next step after clarify and prototype: an optional
`to-plan` skill that turns a spec folder into a reviewed implementation plan,
while the default path stays skill-free (spec.md straight into a fresh
session, plan mode included). Motivations: put the review of how-level
decisions at a moment of real attention rather than at the implementation
gate, pay codebase exploration once and reuse it across retries, and keep
clarify unchanged.

## Confirmed decisions

1. **Two routes, chosen per work unit by the user.** Default: implement
   straight from spec.md in a fresh session; decomposition is just-in-time.
   Optional: `to-plan` writes plan.md when the how deserves review (several
   plausible approaches, off-limits areas, likely retries or delegation, or
   verification criteria worth pinning down).
2. **clarify and prototype stay untouched.** The verification package
   (acceptance criteria, seams) lives in to-plan, not in clarify's spec. The
   only clarify edit is vocabulary: "dossier" becomes "spec folder".
3. **plan.md sections, in order**: Approach, Order, Acceptance criteria,
   Verification and seams, Off-limits, Risks and open questions.
4. **Advisory contract, verbatim, at the top of every plan.md**: the code is
   the terrain and the plan a map; where they disagree the terrain wins;
   decision-level divergence flows back to spec.md instead of being worked
   around.
5. **One page; modules and behavior, never file paths or code snippets.**
   Exception: a prototype-produced snippet that encodes a decision (a schema
   shape, a state machine), trimmed to its decision-rich part.
6. **No template file.** Sections live in the skill text and the contract is
   pinned there verbatim. Promote to templates/ only if real usage shows
   format drift.
7. **Draft discipline reused from clarify.** The whole draft at once;
   questions only for forks the draft cannot settle, one per turn with a
   recommendation. The user's essential calls: choice of approach,
   sufficiency of the acceptance criteria, off-limits areas invisible in the
   code, and which risks to accept. Everything else runs under standing
   veto. Final gate: approving the draft saves plan.md beside spec.md.
8. **No tickets skill, no standing workflow route, no implement skill.**
   Rationale and rejected shapes live in ADR 0005.
9. **The vendored Matt Pocock trio retires**: grilling, grill-with-docs, and
   domain-modeling under `.agents/skills/`, their `.claude/skills/`
   symlinks, and skills-lock.json. writing-great-skills stays.

## Assumptions

- This work's spec folder is `docs/specs/to-plan-skill/`.
- plugin.json gains `./skills/to-plan`; version bumps 0.5.0 to 0.6.0; README
  links the skill; `scripts/link-skills.sh` is re-run.
- The skill name `to-plan` avoids the "plan mode" name collision and
  continues the to-spec, to-tickets naming lineage this work reconstructed.

## Deferred

- Evals for to-plan: write after first real usage.
- A plan.md template: only on observed format drift.
- Workflow-based parallel implementation: derived on demand the day a spec
  genuinely overflows a session; no standing route exists.

## Remaining risks

- plan.md can go stale between planning and implementation; the advisory
  contract is the designed mitigation and is untested until first use.
- A plan reviewed by stamp rather than correction returns no value for its
  cost; the one-page rule is the guard, also untested.
- `to-plan` still shares a word with plan mode; watch real usage for routing
  confusion.
