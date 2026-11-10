# define-product's first-work-unit eval

This eval proves acceptance criterion 1 of
`docs/specs/define-product-first-work-unit/spec.md`: when `define-product`
writes `PRODUCT.md` and the repository has no working pass through the core
loop, its completion report names exactly one next work-unit candidate, and
otherwise it names none. It follows the llm-evals layout, so `llm-evals`
reuses it for later changes to that report instead of building another eval.

## What it measures

The agent under test is Sonnet. The spec asks for the behavior on a small
model, so the baseline and every variant run `claude-sonnet-5-5`, and the
judge is a different model, `claude-opus-5-5`.

Each case is one headless turn in a disposable workspace with
`define-product` installed, and `shape-idea` too unless the case is tagged
`no-shape-idea`. Cases with a `fixture` start from a copy of
`fixtures/<name>/`. `grade.mjs` reads the end state (the files the run
created or changed, `PRODUCT.md` before and after), the skills the agent
invoked, and the transcript, then asks the judge whether each expectation
holds.

| metric | meaning |
|---|---|
| `pass` | 1 when every expectation holds and neither of the two rows below is 1 |
| `multi_candidate` | 1 when the run proposes two or more next work units or lays out a feature order |
| `overreach` | 1 when `PRODUCT.md` holds a candidate or roadmap, a spec file was created, or `shape-idea` was invoked |
| `candidate_present` | 1 when a candidate appeared at all (diagnostic) |

A case's expectations are its own `expectations` plus the standard list for
its `kind` in `grade.mjs`: seven for `candidate`, one for `no_candidate`.

`cases.json` holds three sets:

- `held_out`: eight cases scored against the target of 7 of 8, never read
  while climbing. Four empty repositories with a complete new direction and
  an explicit request to write, each a different product. Two interviews that
  must stay open, so no `PRODUCT.md` and no candidate. Two revisions in a
  repository whose code and tests already run the whole core loop, so the
  definition changes and no candidate appears.
- `train`: seven cases an analyzer may read, including a revision in a
  repository that holds only `PRODUCT.md` and one whose code runs only part of
  the loop; both should get a candidate.
- `regression`: the eleven cases in `../evals.json`, run with their
  expectations unchanged, so the change does not break what the skill already
  did.

`check-grader.mjs` pushes a reference run, an empty run, "잘 모르겠습니다",
and a confidently wrong run (a three-step roadmap written into `PRODUCT.md`)
through the judge and scorer for every held-out and train case.

## Run it

Ask the user first: how to reach the model, and approval of the run size and
usage, as `llm-evals` requires.

```bash
node skill-evals/define-product/first-work-unit/check-grader.mjs
node skill-evals/define-product/first-work-unit/run.mjs --variant baseline --skill-ref <previous-ref> --access api --set train
node skill-evals/define-product/first-work-unit/run.mjs --variant v1 --access api --set train
node skill-evals/define-product/first-work-unit/run.mjs --variant v1 --access api --set held_out
node skill-evals/define-product/first-work-unit/run.mjs --variant v1 --access api --set regression
node skill-evals/define-product/first-work-unit/summarize.mjs
```

- `--access api` passes `ANTHROPIC_API_KEY` from the environment or the repo
  root's `.env.local`; `--access subscription` clears it so the logged-in
  Claude Code runs the agent.
- `v<N>` takes the working tree's `SKILL.md` unless `--skill-file` names
  another file. The other installed files always come from the working tree.
- Add `--cases <id> --reps 1` for a pilot and `--dry-run` to print the scope
  and the cost estimated from finished runs.
- A rerun skips every (case, rep) already in `results.jsonl`. A variant keeps
  one skill text, and a flow keeps one access, one agent model, and one judge,
  recorded in `_state.json`; use another `--flow` to change them.

Results land in `.claude/hillclimb/define-product-first-work-unit/`, which
version control ignores: `<variant>/<set>/` holds `results.jsonl`,
`errors.jsonl`, `traces/<case>_rep<k>.json`, and `runs/` with each run's raw
stream. Workspaces live in the system temp folder, because headless Claude
Code denies writes under any `.claude/` folder; `runs/<id>/workspace.txt`
names each one. Timeouts, denied writes, a served model other than the one
asked for, and judge failures land in `errors.jsonl`, never as a zero score.
