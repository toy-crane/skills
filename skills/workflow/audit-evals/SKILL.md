---
name: audit-evals
description: Audit a project's LLM eval regression suite from its committed cell history, report cells that never failed, checks with identical histories, cells that flip after graduating, and cells that always fail, then propose demoting never-failed cells to the lower tier and apply only the demotions the user approves. Use when the user asks which eval cells still earn their run, why a regression run costs so much, or to slim, prune, or demote a regression suite.
---

# Audit evals

Find the cells of a regression suite that no longer earn their run, from the
cell history alone, and move to the lower tier only the ones the user approves.
A cell is one case judged by one check. The upper tier runs whenever the suite
runs; the lower tier runs only when the model the product or skill runs on
changes, and a lower-tier cell that fails there goes back up as a regression.
Demotion keeps every cell: nothing here deletes a case or a check.

This skill requires `llm-evals`, which runs the paid verification described
below. Before doing any work, confirm it is installed. When it is missing, stop
and report it with its install command,
`npx skills@latest add toy-crane/skills --skill llm-evals`, using the project's
package manager runner where it pins one.

## Find the cell history

The cell history is `regression/cell-history.json` under the project's eval
root. The eval root is the one the project's agent instructions name, else the
folder its existing evals sit in. A project with several eval roots, such as
one per skill, is audited per root the user names, or every root that holds a
`regression/` folder.

When a root has no cell history, report that its cells cannot be judged until
regression runs have recorded one, and stop for that root. Old results folders
and logs mix prompt variants and grader changes, so they never stand in for
the history.

## Count with the script

Every list and number in the report comes from the bundled
[counting script](scripts/audit_evals.py), so the same history always gives the
same report. Take its absolute path from this skill's base directory and run it
on the history file:

```
python3 -I <this skill's base directory>/scripts/audit_evals.py report <eval root>/regression/cell-history.json
```

A cell counts as never failed after 10 trials without a failure; pass
`--min-trials <n>` only when the user asks for another bar. Exit code 3 means
there is no history at that path, and exit code 2 names what in the file is
malformed; report either as it is.

## Report and propose

Show the script's report as printed, in its notation: `suite/case/check` is
one cell, `suite/*/check` every cell of a check, and `suite/case/*` every cell
of a case. Then say what each section asks of the user:

- **Never failed**: the demotion candidates. Each proposal names its unit and
  the runs and judge calls one suite run stops making. Proposals come by whole
  check or whole case where possible, since those are the units that stop a run
  or a judge call. A saving of 0 means the unit shares its run or judge call
  with cells that stay up.
- **Insufficient history**: cells with no failure yet but fewer trials than the
  bar. They are not proposed.
- **Identical histories**: checks that passed and failed on exactly the same
  cases. Report them as candidates to merge; whoever owns the grader decides
  which to keep, and this skill merges nothing.
- **Flipping**: graduated cells that both pass and fail. Report them as
  candidates to return to known failures, since the case did not hold.
- **Always failing**: report them as candidates for a broken task or grader.

Flipping and always-failing cells stay as they are; the report is their only
outcome here.

A never-failed cell is either robust behavior or a grader too lax to catch a
break, and the history cannot tell them apart. For each check under "Judged
checks that never failed", you may propose a verification: run the suite's
cases for that check on a variant with the instruction the check guards
removed, and see whether the check then fails. It calls a model, so it is
proposed with its purpose only. When the user wants it, hand `llm-evals` the
check, the variant, and the cases; it asks for the cost approval and runs the
verification only after it, and hands back whether the check failed on the
variant.

Wait for the user to name the proposals they approve.

## Apply approved demotions

Apply exactly the approved units, all in one call:

```
python3 -I <this skill's base directory>/scripts/audit_evals.py apply <eval root>/regression/cell-history.json <unit> [<unit> ...]
```

The script moves only upper-tier cells that never failed over the bar, and
refuses the whole call when a unit holds any other cell. Report the cells it
moved and the units left as they were. The cell history is committed with the
rest of `regression/`.

The audit is done when every requested root has either a report or a stated
reason it cannot be judged, and every approved unit is applied or reported as
refused.
