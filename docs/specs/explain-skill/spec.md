# Spec: The explain skill

Confirmed 2026-07-26 in a shape-idea session. This spec folder is the handoff
contract for adding the `explain` skill and the one-line handoff to it from
shape-idea. Companion records: ADR
[0015](../../decisions/0015-explain-renders-on-request.md) (why a separate
skill, and the name), ADR
[0001](../../decisions/0001-visual-media-over-prototype-routing.md) (visual
media named by capability, never by tool), ADR
[0009](../../decisions/0009-thin-skills-over-fixed-procedures.md) (thin
skills), and `GLOSSARY.md` (Comprehension gap).

## Goal

Give the set a skill that answers "I don't follow — explain this" by rendering
the thing instead of writing more prose, in any conversation: reading an
unfamiliar repo, debugging, reviewing, or mid-interview. shape-idea already
renders, but both of its render gates exist to get the user's correction of
*the interviewer's* understanding; a gap in the *user's* understanding falls
through to `Everything else stays prose`
([shape-idea/SKILL.md:55](../../../skills/shape-idea/SKILL.md)). The two have
opposite objective functions — the interview minimizes the user's time
(`close every branch you can without them`), an explanation spends it — which
is why the capability cannot live as another shape-idea clause.

## Confirmed decisions

1. **A separate published skill, not a widened shape-idea gate.** Widening
   would lock the capability inside shaping sessions; the wanted scope is any
   conversation. Rationale and rejected shapes in ADR 0015.
2. **Triggered by the user's explicit request only.** "I don't get this,
   explain it" — not by inferred confusion. Signal detection (re-asked
   questions, avoided terminology, substanceless approval) was drafted and cut:
   it bought guessing at the cost of most of the skill's text, and a user
   willing to ask once will ask again.
3. **Name: `explain`.** Imperative like the rest of the user-facing set, with
   the object elided because the object varies — whatever the user is stuck on.
   Checked free of built-in slash commands in both Claude Code and Codex.
4. **Disposable, with no durable write at all.** The understanding survives; no
   file does. A clause delegating a glossary residue to `domain-modeling` was
   drafted and cut: wrong owner's problem, false premise whenever `explain` runs
   in a repo the user does not own, and it smuggled a durable write back in
   through a delegate.
5. **Body is three paragraphs: no headings, no procedure, no template.** Each
   paragraph exists to override one default model behavior — answer in prose
   only; interrogate the user about what exactly is unclear; draw from what you
   already believe. A paragraph that does not override a default does not belong
   (ADR 0009).
6. **Render when a picture carries the structure better than a sentence**
   (a flow, a relationship, a state change, a shape); a single fact or one
   unfamiliar word still answers in a sentence.
7. **Do not interview the user about the gap.** Guess it — the level, the
   mechanism, why not the alternative, or just a word — render that, and let the
   correction it draws ("I know that, my question was X") narrow it.
8. **Grounding beats fluency.** Read the real code, docs, or sources before
   drawing; a plausible diagram assembled from prior belief sets a wrong model
   in concrete and is worse than not drawing.
9. **One level per view, and no analogy you cannot defend** when the user pushes
   on it.
10. **Medium by capability, never by tool name** (ADR 0001), cheapest sufficient
    first.
11. **shape-idea gains exactly one line** handing an explanation the user asks
    for mid-interview to `explain`. No other published skill changes.

## Assumptions

- This work's spec folder is `docs/specs/explain-skill/`.
- The skill is a single `skills/explain/SKILL.md`, English like the rest of the
  set, with no `templates/` directory.
- Registration in three places: `./skills/explain` in `plugin.json` (plus the
  keyword list), a committed `.claude/skills/explain` symlink, and a README
  entry. The README pipeline diagram is left alone — `explain` is not a pipeline
  stage.
- Version bumps 0.13.1 to 0.14.0; `claude plugin validate . --strict` runs after
  the manifest edit.
- The three-paragraph body confirmed in the session is the starting text, not a
  frozen one; wording may tighten during implementation as long as each
  paragraph keeps overriding its default.
- CLAUDE.md's "Skill naming" section needs no new class: `explain` is an
  imperative with a variable object, worth one clause where the section explains
  the verb-object rule.

## Deferred

- Evals: written after first real usage, not before.
- Korean trigger phrases in the description: English only for now, matching the
  rest of the published set.
- Firing on inferred confusion rather than an explicit ask: revisit only if real
  sessions show the user repeatedly not asking when they should have.
- Ever persisting an explanation: revisit only if the same explanation is needed
  twice across sessions.

## Remaining risks

- "One level per view" and "no analogy you cannot defend" have no checkable
  criterion; they rely on the model's judgment holding.
- The render/prose line is a judgment call. Too eager buries a one-line answer
  under a diagram; too shy makes the skill a no-op, and the shy failure is
  invisible.
- `explain` is a generic name. Another marketplace's skill may share it, and
  skills.sh copies by name into the user's project.
- Explicit-request triggering leaves the silent case uncovered by design: a user
  who does not realize they misunderstood gets nothing. That was accepted, not
  solved.
