---
name: split-into-tasks
description: Split an implementation-ready spec into the fewest independently deliverable vertical task files and choose only risk-justified intermediate review checkpoints. Use when a spec has multiple outcomes needing separate delivery or dependencies; keep one coherent outcome as the sole spec handoff.
---

# Split Into Tasks

## Ground the breakdown

Work from an implementation-ready spec folder at `docs/specs/<slug>/`. When the
user has not named one, present the available candidates for selection. If no
such spec exists, ask the user to establish one before continuing.

Ground task boundaries in `spec.md`, `GLOSSARY.md`, any approved
`prototype.html`, relevant decision contracts found through
`docs/decisions/README.md`, and the current code. Treat behavior introduced by
the spec but absent from the code as the expected implementation gap. Reserve
conflicts for sources that disagree about an existing decision.

When the spec describes one coherent deliverable, keep the spec itself as the
sole handoff.

## Choose task boundaries

Use the fewest delivery-sized vertical tasks. Make each task an independently
usable and verifiable outcome through every layer it touches. Keep work together
when it becomes meaningful only as a complete outcome.

Include preparatory work in the earliest task that turns it into usable
behavior. Split preparation into its own task only when it independently meets
the same outcome standard. Declare an unfinished task as a blocker when its
result is required to complete a dependent task. Tasks whose blockers are
complete form the implementation frontier.

A task boundary is a delivery and verification checkpoint, not an automatic
implementation-context boundary. Do not size tasks around predicted context
windows or create horizontal implementation to-do lists.

## Select intermediate review checkpoints

Declare an independent intermediate review only when delaying review would let
a material error compound through substantial dependent work, or when the
boundary introduces a security, data, permission, migration, recovery, or
external-contract risk that deterministic checks cannot adequately settle.

State the cumulative scope and the specific risk the reviewer must inspect. Do
not add a review merely because a task exists, and do not prescribe a new
implementation worker, repair worker, review counter, or state-only commit. The
implementation workflow owns one final cumulative review for every split or
unsplit result, so task files never declare that final review.

## Review before writing

Present the proposed breakdown before writing files. For each task, show its
title, the complete behavior that becomes available, each blocker and why it
gates completion, and any proposed intermediate review with its risk. Refine
the boundaries, dependencies, and review checkpoints with the user. Explicit
approval authorizes writing the task files.

## Publish task files

Publish one file per approved task at
`docs/specs/<slug>/tasks/<NN>-<slug>.md`, numbered in dependency order with
blockers before dependents.

When revising an existing breakdown, preserve completed task files. After the
user approves the revised remainder, replace superseded unfinished task files
so the active tree reflects the approved remaining work.

Each task file contains:

- title;
- independently deliverable end-to-end behavior from the user's perspective;
- a `## Blockers` section naming each blocking task and why it gates completion,
  or `None.`;
- status initialized to `pending`;
- outcome-level acceptance-criteria checkboxes for observable behavior;
- constraints specific to that task's delivery or coordination;
- focused deterministic verification that establishes its acceptance criteria;
- a `## Review checkpoint` section containing `None.` or a required cumulative
  scope and concrete risk;
- the minimal mutable execution state copied from the
  [task state template](./templates/task-state.md).

Record shared constraints in `spec.md` and one-task constraints in that task
file. Describe observable behavior and settled boundaries at a level that
remains valid as code evolves. Use an approved prototype as the authority for
the intended experience.

Copy the task state template without changing its field names. Later
implementation may change status only to `in-progress`, `completed`, or
`blocked`, and records concise verification or blocker evidence with the code
change it describes. Do not add commit-anchor fields, correction counters, a
terminal run-completion section, or a separate orchestration file.

End after publishing the approved task handoff. Do not begin implementation.

## Revisit a breakdown

Return to this skill when new evidence invalidates task boundaries, blockers,
or a review checkpoint. Reassess affected unfinished tasks and apply the same
review and publishing rules to the revised remainder.
