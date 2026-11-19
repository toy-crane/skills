# explain-visually regression log

Each line records one graduated criterion: date, criterion, baseline and final
scores, noise floor, model, and commit. Each suite folder's `run.json` says how
it runs (the output style it selects, or asking through `/explain-visually`).
Rerun a suite with
`node skill-evals/explain-visually/run.mjs --variant <label> --access api --suite <folder>`.
Cases that did not graduate sit in each folder's `known-failures.jsonl`.

All lines below come from one climb for `docs/specs/at-a-glance/`, measured on
`claude-sonnet-5-5` with judge `claude-opus-5-5`, 2 reps, api access, repository
snapshot `4ac28d2`. Baseline: `explain-visually` at `11586c4`, no output style.
Final: v8, `SKILL.md` sha `afaa6fc3d673` and `output-styles/at-a-glance.md` sha
`084940266647`. The whole climb, eight variants and the gates, cost $340.07 over
1,856 trials. Held-out noise floor ±16 points at 40 trials, ±22 at 20.

- 2026-11-19 · `at-a-glance-routing` criterion 1 (the form matches the content kind, style on) · baseline held-out 19/40, train 10/24 → final held-out 40/40, train 20/24 · 29 of 32 cases graduated, all upper tier · known failures (train): `fact-evals-root` appends a table to a fact, `struct-pr-deps` answers a structure in prose, `mech-skills-dedupe` draws a mechanism as a static flow.
- 2026-11-19 · `at-a-glance-brake-off` criterion 2, style off (a one-sentence question is not drawn) · baseline held-out 12/20, train 11/12 → final held-out 20/20, train 12/12 · 16 of 16 cases graduated, all upper tier.
- 2026-11-19 · `at-a-glance-brake-on` criterion 2, style on · no baseline (the style did not exist) → final held-out 20/20, train 12/12 · 16 of 16 cases graduated, upper tier, baseline unknown.
- 2026-11-19 · `at-a-glance-stepper` criterion 3 (every stage named in the first view, no auto-advance) · baseline (asked through `/explain-visually`, no style) held-out 19/20, train 10/12 → final (style on) held-out 20/20, train 12/12 · 16 of 16 cases graduated, all upper tier.
- 2026-11-19 · `at-a-glance-predict` criterion 4 (a rendered mechanism asks for a prediction before the result) · baseline (asked through `/explain-visually`, no style) held-out 0/20, train 0/12 → final (style on) held-out 20/20, train 10/12 · 15 of 16 cases graduated, all upper tier · known failure (train): `internal-env` renders nothing.

- 2026-11-19 · `at-a-glance-lead-in` criterion 1 of `docs/specs/at-a-glance-korean-register/` (a Korean summary states its answer without a lead-in label such as `한 줄 요약:` or `핵심:`, style on) · baseline (at-a-glance at `e394448`) held-out 12/20, train 12/20 → round 1 (natural-korean register section, `3f78065`) train 20/20 → final v2 (first-line rule forbids announcing labels in any language) held-out 20/20, train 20/20 · noise ±22 at 20 trials · 20 of 20 cases graduated, all upper tier · `claude-sonnet-5-5`, judge `claude-opus-5-5`, 2 reps, api access, repository snapshot `4ac28d2`. Cases were picked from 40 spec and decision summary requests piloted on the baseline: 13 that drew a label on at least one of two runs, and 7 of the same form, so the baseline is biased toward failure. A first attempt graded natural-korean's whole rubric and was dropped: natural-korean alone passed 2 of 20 long explanations, mostly on repeated `-습니다` endings. Gate: routing 58/58, brake-on 32/32, stepper 32/32, predict 28/30 (held-out 18/20, inside noise), first-view held-out 20/20 with the style on; brake-off skipped because it runs with no style. The climb, including the dropped rubric, cost about $95.
