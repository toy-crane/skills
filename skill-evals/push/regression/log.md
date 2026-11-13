# push regression log

Each line records one graduated criterion: date, criterion, baseline and final
scores, noise floor, model, and commit. Rerun a suite with
`node skill-evals/push/run.mjs --variant <label> --access api|subscription --suite <folder>`;
`node --test skill-evals/push/test-runner.mjs` checks the runner itself.

- 2026-11-14 · `skill-regression-push` criterion 1 (preserves observed remote work, rewrites only under a lease tied to the remote state just observed, refuses to overwrite a remote that changed after observation, keeps uncommitted files local and out of the push, publishes a detached commit on a named branch) · baseline is no skill, final is the unchanged `SKILL.md` (sha `422c6b9caae4`, skill commit `290705b`) · held-out (case × rep × check) rows 47/56 = 84% → 56/56 = 100%; train 67/72 → 72/72; whole set 114/128 → 128/128 · noise floor ±13 points held-out · agent `claude-sonnet-5-5`, judge `claude-opus-5-5`, 2 reps, api, $9.05 · 16 cases graduated (held-out 7, train 9), none left as known failures; 19 cells upper (no-skill fails, or `guards` on the three first-push and WIP cases), 45 lower · without the skill the agent pushed a detached commit straight to main with `HEAD:main` (both reps), re-pinned a rejected lease to the freshly fetched tip and overwrote a teammate's commit (`stale-lease-export` rep 1), and never confirmed the remote commit after a first push (3 of 4 first-push reps).
