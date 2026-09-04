# Trigger eval runner cannot load a skill without trigger cases as a distractor

## Symptom

`scripts/run-claude-trigger-evals.sh` exits before running when any named
skill lacks `evals/trigger-evals.json`, so a skill cannot be loaded only as a
routing distractor.

## Observed evidence

`./scripts/run-claude-trigger-evals.sh 2 6 define-product shape-idea
define-publication define-piece draft-piece` stopped at
`test -f "$task_eval_path"` for `shape-idea`, which has `evals/evals.json` but
no `trigger-evals.json`. The writing-workflow spec's routing criterion
("single-piece briefing to `define-piece` rather than `shape-idea`") was
verified on 2026-09-04 only through a scratch copy of the runner that links
the skill and skips its cases when the file is absent; that copy produced
50 scored cases, 0 invalid, and no false activation of any writing skill.

## Suspected cause

The per-skill loop treats the cases file as required before linking the skill
into the eval project.

## What was tried

Moving the `ln -s` above the `test -f` and turning the test into
`|| { note; continue; }` in a scratch copy; the run then completed.

## Proposed next step

Apply that reordering to the repository runner so a skill can be passed as a
distractor, and note the behaviour in the script's usage line.
