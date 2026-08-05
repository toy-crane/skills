---
name: split-into-tasks
description: Split an existing spec into the fewest independently deliverable, end-to-end task files with explicit blockers. Use when the spec contains multiple outcomes that should be implemented and reviewed separately. Skip when the work forms one coherent deliverable.
---

# Split Into Tasks

Start from a spec folder at `docs/specs/<slug>/`. If none is named, list the
candidates and ask which to use. If none exists, stop and request a spec instead
of splitting directly from conversation. Read `spec.md` and `GLOSSARY.md`,
inspect `prototype.html` when present, then use `docs/decisions/README.md` to
load only relevant decision subjects. Inspect the current code before defining
task boundaries. If these sources conflict at the decision level, surface the
conflict rather than choosing an authority.

Make each task a delivery-sized vertical slice: a complete path through every
layer it touches that produces an independently deliverable and verifiable
outcome. Use the fewest tasks that preserve those outcomes: keep together work
that becomes meaningful only when completed together, and split only outcomes
that can be implemented and reviewed separately. Do not create horizontal
layers or fine-grained to-do lists. Declare only blockers that genuinely gate
completion; tasks with no unfinished blockers form the frontier.

Present the breakdown before writing files. For each task, show its title,
blockers, and the complete behavior that becomes available when it finishes.
Revise task boundaries and dependencies with the user until they approve. Then
publish one file per task at `docs/specs/<slug>/tasks/<NN>-<slug>.md`, numbered
in dependency order with blockers before dependents.

Each task file contains:

- independently deliverable, end-to-end behavior from the user's perspective
- blocking tasks
- status
- outcome-level acceptance criteria that verify completed behavior rather than
  list implementation steps
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

Implement one frontier task per fresh session. Keep the task's status and
acceptance-criteria checkboxes current while implementing it. If implementation
learning invalidates later tasks, re-invoke this skill to review and revise the
remaining breakdown before starting another task.
