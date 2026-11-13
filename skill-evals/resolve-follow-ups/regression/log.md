# resolve-follow-ups regression log

Each line records one graduated criterion: date, criterion, baseline and final
scores, noise floor, model, and commit. Rerun a suite with
`node skill-evals/resolve-follow-ups/run.mjs --variant <label> --access api --suite <folder>`;
`--no-skill` runs the same cases without the skill.

- 2026-11-14 · `skill-regression-resolve-follow-ups` criterion 1 (a worker returns not-reproduced without a speculative fix, returns needs-shaping without choosing a policy, starts no new work while the attempt's PR is open, fixes and deletes only its own follow-up in one ready PR without merging, stops as blocked when HEAD does not match the base, and hands a newly found defect to the coordinator) · baseline is no skill, final is the unchanged SKILL.md · held-out rows 23/58 (40%, no skill) → 55/58 (95%); train 34/60 (57%) → 58/60 (97%); no climb rounds, since the text did not change · noise floor ±13 points · agent `claude-sonnet-5-5`, judge `claude-opus-5-5`, 2 reps, api, $9.73 · skill commit `2c19972` (SKILL.md sha `c05af75da9c0`) · 12 of 14 cases graduated (held-out 6, train 6), 51 cells: 33 upper, 18 lower. Known failures, kept out: `defect-config-utc-date` (0/2: the five fields handed to the coordinator lack what was tried and the next step) and `blocked-fetch-fails` (1/2: fixed on the local checkout after the fetch failed), recorded in `docs/follow-ups/resolve-follow-ups-misses-two-regression-cases-on-sonnet.md`; their rows are in `fd3a463`.
