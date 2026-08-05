---
name: split-into-tasks
description: Split an implementation-ready spec into the fewest independently deliverable, end-to-end task files with explicit blockers. Use when a spec contains multiple outcomes that need separate implementation, review, or dependency tracking. Skip when the work forms one coherent deliverable or no spec exists.
---

# Split Into Tasks

## Ground the breakdown

Start from a spec folder at `docs/specs/<slug>/`. If none is named, list the
candidates and ask which to use. If none exists, stop and request a spec instead
of splitting directly from conversation. Read `spec.md` and `GLOSSARY.md`,
inspect `prototype.html` when present, then use `docs/decisions/README.md` to
load only relevant decision subjects. Inspect the current code before defining
task boundaries.

Expect current code to lack behavior that the spec introduces. Surface a
conflict only when the sources disagree about an existing decision, rather than
when the code simply has not implemented the target behavior yet. If the work
forms one coherent deliverable, stop and recommend implementing it directly
from the spec instead of creating task files.

## Choose task boundaries

Use the fewest delivery-sized vertical tasks. Each task must produce an
independently deliverable and verifiable outcome through every layer it touches.
Keep together work that becomes meaningful only when completed together. Split
only outcomes that can be implemented and reviewed separately.

Do not create horizontal layers, fine-grained to-do lists, or standalone tasks
for scaffolding, unused interfaces, or internal preparation that has no complete
behavior of its own. Declare only blockers that genuinely gate completion;
tasks with no unfinished blockers form the frontier.

## Review before writing

Present the breakdown before writing files. For each task, show its title,
the complete behavior that becomes available when it finishes, and each blocker
with the reason it gates completion. Revise task boundaries and dependencies
with the user until they approve. Do not write task files before approval.

## Publish task files

Publish one file per approved task at
`docs/specs/<slug>/tasks/<NN>-<slug>.md`, numbered in dependency order with
blockers before dependents.

When revising an existing breakdown, preserve completed task files. After the
user approves the revised remainder, replace superseded unfinished task files
instead of leaving obsolete tasks active.

Each task file contains:

- title
- independently deliverable, end-to-end behavior from the user's perspective
- blocking tasks and why each one gates completion
- status
- outcome-level acceptance-criteria checkboxes that verify completed behavior
  rather than list implementation steps
- constraints specific to that task, such as concurrent work in the same module
  or an interface that must remain unchanged until another task lands

Keep constraints shared by multiple tasks in `spec.md`; put only task-specific
constraints in task files. Describe stable modules and behavior instead of
predicting exact file paths or implementation code. Refer to an approved
prototype when it defines the intended experience; do not copy its
implementation into task files.

Open every task file with this contract:

> Follow current code for implementation details and `spec.md` for intended
> behavior. If implementation reveals that a spec decision must change, surface
> it and update `spec.md` after the intended behavior is clarified rather than
> hiding the divergence in a workaround.

## Run and revise

Implement one frontier task per fresh session. Keep the task's status and
acceptance-criteria checkboxes current while implementing it. If implementation
learning invalidates the current or later tasks, re-invoke this skill and review
the revised breakdown with the user before continuing.
