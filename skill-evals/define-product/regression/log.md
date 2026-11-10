# define-product regression log

Each line records one graduated criterion: date, criterion, baseline and final
scores, noise floor, model, and commit. Rerun a suite with
`node skill-evals/define-product/run.mjs --variant <label> --access api --suite <folder>`;
`--suite evals` runs `evals.json` with the same grader.

- 2026-11-10 · `define-product-first-work-unit` criterion 1 (one next work-unit candidate only when PRODUCT.md was written and the core loop does not run yet) · held-out 8/16 rows, 4/8 cases (baseline, `f8d2ef2`) → 16/16 rows, 8/8 cases (v1); train 4/14 → 13/14; no multi-candidate or overreach row · noise floor ±25 points held-out · agent `claude-sonnet-5-5`, judge `claude-opus-5-5`, 2 reps · skill commit `f1282e1` · 14 cases graduated (held-out 8, train 6). Known failure: train `pickup-rota-running` passed 1 of 2 reps; in the failing rep Sonnet asked how a mixed-daycare apartment group would work instead of applying the confirmed boundary change, an interview behavior this criterion does not cover. `evals.json` on the same runs: baseline 12/22 rows → v1 14/22; every case the baseline passed on both reps (1, 3, 4, 10, 11) also passed on both with v1; 5, 6, and 8 failed every scored rep of both variants (v1 evals-8 rep1 was a judge reply with no verdicts, now recorded as a judge error rather than a score), and 2 failed both baseline reps and one v1 rep, all on interview behavior that predates this change (several questions at once, or more questions despite an explicit write request).
