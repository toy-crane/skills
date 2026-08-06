---
name: run-tasks
description: Execute an approved set of task files under a docs/specs task folder from start to finish with one restartable orchestrator. Use when the user asks to run, continue, resume, or finish all generated tasks. Delegate one write-capable task at a time to fresh subagents, persist progress in task files and Git, verify and locally review every task, and finish with a cumulative review. Do not use to split a spec, implement a single unsplit spec, or parallelize tasks.
---

# Run Tasks

Keep the orchestrator thin and replaceable. Let task files carry execution
state, Git carry code state, and fresh workers carry only the context needed for
one bounded outcome.

## Ground the run

Work from numbered task files at `docs/specs/<slug>/tasks/`. A set is active when
at least one task is `pending`, `in-progress`, or `blocked`; completed-only sets
are inactive. The user's explicit request to run a named set, or the sole active
set, confirms its current boundaries for execution; it does not authorize
changing them. If the user did not identify a set and multiple active sets
exist, ask them to select one before changing files. If no task files exist or
their filenames do not establish dependency order, stop; do not invent a
breakdown or implement directly from an unsplit spec.

Inventory task filenames, statuses, blockers, and execution fields with targeted
reads. Load the full selected task and only the completed blockers it needs.
Ground that task in repository instructions, the owning `spec.md`, any approved
`prototype.html`, `GLOSSARY.md`, relevant subjects routed through
`docs/decisions/README.md`, and current Git state. Preserve approved outcomes,
blockers, constraints, and acceptance criteria.

Require a resolvable Git `HEAD` and a state that supports explicit local
commits. For a new run, require a clean worktree. For a resumed `in-progress`
task, accept dirty files only when they are consistent with that task and its
recorded base; otherwise pause. A detached checkout chosen by the user is valid.
If preflight fails, follow the authority boundary below and pause.

Require the harness to support fresh subagents. Do not silently fall back to
implementing every task in the orchestrator context.

## Maintain the task ledger

Use these status transitions:

```text
pending -> in-progress -> completed
                       -> blocked
blocked -> in-progress only after the user resolves the blocker
```

Allow at most one `in-progress` task. Preserve completed tasks. A task file uses
this execution shape:

```md
## Status

pending

## Execution

- Base commit: —
- Final code commit: —
- Verification: —
- Task review: —
- Task correction rounds: 0
- Cumulative review: —
- Cumulative correction rounds: 0
- Blocker: —
```

Initialize missing execution fields without changing the approved task
contract. Do not create another run-state file.

At task start, record `in-progress` and the full current commit SHA as its base.
At task completion, record the final code commit, the verification commands and
results, and the task-level review result. The final task also records the
cumulative review result. Only then mark its observable acceptance criteria and
status complete. Persist ledger transitions through the repository's normal
local commit workflow.

## Run one task at a time

If any task is `blocked`, stop before selecting more work: the shared branch now
contains an unverified outcome, so continuing would make later inheritance and
the cumulative review ambiguous. Otherwise choose the lowest-numbered pending
task whose blockers are complete. If pending tasks remain but none is eligible,
stop with the missing blocker or dependency cycle.

Start one foreground, write-capable worker with a fresh context. Give it only:

- the repository instructions and current Git state;
- the owning spec, relevant decisions, and approved prototype when present;
- the selected task file and completed blockers it needs to understand;
- a requirement to implement only that outcome, run relevant deterministic
  verification, and create a local checkpoint commit;
- a request for a concise result containing behavior changed, verification run,
  commit SHA, clean worktree confirmation, and any blocker.

Wait for that worker to finish before starting another worker. The orchestrator
owns delegation; tell task workers not to spawn further agents. Inspect the
actual diff, verification output, commit, and worktree state instead of trusting
the returned summary alone.

Require deterministic verification to pass before review or completion. Treat
a verification failure as blocking evidence under the same task-correction
counter and repair loop below. After a repair, verify first; use another allowed
round when verification still fails, and record `blocked` when the count reaches
two or no progress is made.

## Review before completion

Review the complete task diff from its recorded base through the current code
checkpoint. Prefer the current harness's native local code-review capability
only when it is callable from the session and can honor that scope. Otherwise
start a fresh reviewer with no write tools when the harness supports tool
restriction; if it does not, explicitly prohibit writes and confirm afterward
that Git state is unchanged.

Give the reviewer the task, owning spec, relevant decisions, repository
instructions, and diff scope. Ask for correctness, security, regression, and
specification findings with file and line evidence. Exclude style-only advice
from blocking results. Require an explicit statement when no blocking findings
remain.

A single local foreground review subagent is an allowed fallback. Treat any
review surface outside the current local session as an external action under
the authority boundary below.

For blocking findings, read the task-correction count. If it is already two,
record `blocked` and stop. Otherwise start a fresh write-capable repair worker
with the task, current code, verification evidence, findings, and current count.
Require it to increment `Task correction rounds` in the same commit as its
repair so progress and retry state cannot diverge. Rerun the relevant
deterministic verification, then review the full task diff again. The two-round
limit lets ordinary repair finish without turning a persistent blocker into
unbounded work. If the branch makes no observable progress, record `blocked`
without spending further rounds. Preserve concise evidence, commit the ledger
update, stop the entire run, and tell the user what decision is needed.

## Finish the whole run

Before marking the final task complete, review the cumulative diff from the
first task's base through the current branch. Use the same read-only scope,
blocking categories, correction limit, and verification rules, using
`Cumulative correction rounds` as its independent durable counter. Require each
cumulative repair to increment that counter in the same commit as its code
changes. Deterministic verification must pass after each cumulative repair; a
failure consumes the same bounded cumulative correction loop before review
continues. This review must cover interactions between completed tasks, not
repeat isolated task summaries.

If all tasks were already marked complete when invoked, treat the run as
finished only when the final task's `Cumulative review` field records a passing
result. Otherwise perform that review and persist its result.

After the cumulative review passes, complete the final ledger update and report
the delivered outcomes, commits, verification, reviews, and any non-blocking
risks. Do not perform actions outside the local run authority below.

## Resume or pause safely

On restart, find the sole `in-progress` task, reconstruct its full diff from the
recorded base and current Git state, and rerun deterministic verification and
review. Do not rely on conversation history or a remembered phase marker.
Treat the two recorded correction counters as authoritative; review and repair
phase markers remain disposable. Context or harness interruption does not
consume another correction round when the ledger or Git already shows the
corresponding repair progress.

Pause immediately when:

- more than one task is `in-progress`, recorded commits are missing, or Git has
  unexpected dirty or divergent state;
- a spec change invalidates an outcome, blocker, or task boundary;
- a repository hook or policy rejects a required checkpoint or ledger commit;
- continuing requires user input, external authority, or destructive recovery.

State the evidence and the smallest user decision needed. Retry policy never
expands authority and never permits silent task rewrites.

## Keep authority bounded

The request authorizes only the local reads, writes, commands, subagents, and
commits required to execute the selected task set in the current checkout. Do
not alter pre-existing changes or checkout topology, interact with remote or
hosted systems, or delete project artifacts without a separate explicit
request. Pause when completion requires any such action.
