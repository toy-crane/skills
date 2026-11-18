# explain-visually renders one-sentence answers when an inline renderer is present

**Symptom**: Asked to explain a glossary term or a one-line reason, the skill
draws a widget instead of answering in a sentence and stopping, against the
one-sentence restraint in `docs/decisions/explain-visually.md`.

**Observed evidence**: The baseline of `skill-evals/explain-visually/`'s
`explain-visually-first-view` eval (skill sha `1829b0c032ae`, repository at
`4ac28d2`, Claude Code headless, Sonnet 5.5, subscription, 2026-11-18), with
the stand-in inline renderer `render-mcp.mjs` connected. Case `control-4`
("GLOSSARY.md에 있는 'Comprehension gap'이 무슨 뜻이야?") called `show_widget`
on both reps; `control-5` (why `.claude/skills/` symlinks are committed) did so
on one of two. `control-6` held on both. A pilot on Opus 5.5 also rendered
`control-4`. Rerun with
`node skill-evals/explain-visually/run.mjs --variant <label> --access subscription --split control`.

**Suspected cause**: Suspected: with a host renderer whose guidance favors
drawing, "Check the available tools and use the best renderer" outweighs the
one-sentence brake that precedes it. The earlier restraint evals ran without
such a renderer connected.

**What was tried**: Nothing; that eval measured the first-view rule and only
required these controls not to fall below this baseline.

**Proposed next step**: Run the control split at 3 reps on Sonnet 5.5 and
Opus 5.5 to size the rate, then climb on the restraint wording with
held-out one-sentence questions that are not the three controls.
