# Spec: The explain skill

Confirmed 2026-07-26. Add the `explain` skill. Why it exists as its own skill:
ADR [0015](../../decisions/0015-explain-renders-on-request.md). Related:
[0001](../../decisions/0001-visual-media-over-prototype-routing.md) (name the
medium by capability, not by tool),
[0009](../../decisions/0009-thin-skills-over-fixed-procedures.md) (thin skills),
`GLOSSARY.md` (Comprehension gap).

## Goal

The user says "I don't get this, explain it." Answer by drawing it instead of
writing more prose. Works in any conversation, not only in a shaping session.

## Confirmed decisions

1. Its own skill, not a new shape-idea clause. shape-idea renders only to get
   its own understanding corrected, and only inside an interview.
2. Fires when the user asks. Not on guessed confusion.
3. Name: `explain`. No object, because the object changes every time. Not a
   built-in command in Claude Code or Codex.
4. Writes nothing to the project.
5. Three paragraphs. No headings, no steps, no template. Each paragraph blocks
   one habit: answering in prose only, asking the user what exactly is unclear,
   drawing from memory instead of from the source.
6. Draw when a picture shows the structure better than a sentence would. One
   fact or one unfamiliar word still gets a sentence.
7. Guess what is unclear and draw that. The user's correction narrows it.
8. Read the real code or docs first. A wrong diagram is worse than none.
9. One level per view. No analogy you cannot defend.
10. Render with whatever the environment offers, cheapest first. Never name a
    tool.
11. shape-idea gains one line pointing here. No other skill changes.

## Assumptions

- Spec folder: `docs/specs/explain-skill/`.
- One file, `skills/explain/SKILL.md`, in English, no templates.
- Register in three places: `plugin.json`, a `.claude/skills/explain` symlink,
  the README list. Leave the pipeline diagram alone — `explain` is not a stage.
- Version 0.13.1 to 0.14.0, then `claude plugin validate . --strict`.
- The three paragraphs are a starting text. Wording can tighten.

## Deferred

- Evals, after first real use.
- Korean trigger phrases in the description.
- Firing on guessed confusion.
- Saving an explanation for later.

## Remaining risks

- "One level per view" and "no analogy you cannot defend" have no test. Both
  depend on judgment.
- So does the draw-or-write line. Draw too often and a one-line answer gets
  buried; draw too rarely and the skill does nothing. The second failure is
  invisible.
- `explain` is a common name. Another skill set may use it, and skills.sh copies
  by name into the user's project.
- A user who does not know they misunderstood gets nothing. Accepted, not
  solved.
