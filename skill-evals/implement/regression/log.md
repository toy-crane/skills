# implement regression log

Each line records one graduated criterion or one regression run: date,
criterion, baseline and final scores, noise floor, model, and commit. Rerun a
suite with
`node skill-evals/implement/run.mjs --variant <label> --access api|subscription --suite <folder>`;
it runs the upper tier, and the lower tier too when the model differs from the
one recorded in `cell-history.json`. `--suite evals` runs `evals.json` with the
same judge.

- 2026-11-14 · `pr-flow-review-fixes` (from `docs/specs/pr-flow-review-fixes/`, #149: size review repairs to the reproduced case, leave unreproduced extensions recorded, dispute a wrong finding with evidence, strip code nothing requires after repairs, and still add state a repair genuinely needs) · rerun for graduation because #149 committed no result rows (`docs/specs/skill-regression-implement/`) · held-out 5/8 rows (baseline, implement `SKILL.md` at `9f079fc^`, sha `5c22ed4b473d`) → 7/8 (current text at `369bf2e`, sha `e1c8a2368359`); train 10/12 → 12/12; all 20 rows 15/20 → 19/20 · noise floor ±35 points held-out, ±22 overall, so the gain over this rerun's baseline sits inside the noise floor; #149's own run had the baseline at 3/8 · agent `claude-sonnet-5-5`, judge `claude-opus-5-5`, 2 reps, api, $11.30 including a 3-run pilot · 9 cases graduated (held-out 3, train 6), 54 cells: 28 upper (the four cases with `guards`, plus the cells the baseline failed: expectations 1 and 3 of `tag-leftover` and `due-leftover`), 26 lower · known failure: held-out `tag-rare` passed 1 of 2 reps (rep 1 added a test pinning the unreproduced duplicate-tag case, the same failure #149 recorded) and did not graduate; its case row is in `skill-evals/implement/pr-flow-review-fixes/cases.jsonl` at `0a8ecd8`.
