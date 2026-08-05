---
name: split-into-tasks
description: Split an existing implementation-ready spec into the fewest independently deliverable, end-to-end task files with explicit blockers. Use when the spec contains multiple outcomes that benefit from separate implementation, review, or dependency tracking. A single coherent outcome uses the spec itself as the implementation handoff.
---

# Split Into Tasks

## Ground the breakdown

Work from an implementation-ready spec folder at `docs/specs/<slug>/`. When the
user has not named one, present the available candidates for selection. If no
such spec exists, ask the user to establish one before continuing.

Ground task boundaries in `spec.md`, `GLOSSARY.md`, any approved
`prototype.html`, relevant decision contracts found through
`docs/decisions/README.md`, and the current code. Treat behavior introduced by
the spec but absent from the code as expected implementation work. Reserve
conflicts for sources that disagree about an existing decision.

When the spec describes one coherent deliverable, use the spec itself as the
implementation handoff and recommend direct implementation.

## Choose task boundaries

Use the fewest delivery-sized vertical tasks. Make each standalone task an
independently usable, verifiable, and reviewable outcome through every layer it
touches. Keep work together when it becomes meaningful only as a complete
outcome.

Include preparatory work in the earliest task that turns it into usable
behavior. Split preparatory work into its own task when it independently meets
the same standard. Declare an unfinished task as a blocker when its outcome is
required to complete the dependent task. Tasks whose blockers are complete form
the frontier.

## Review before writing

Present the proposed breakdown before writing files. For each task, show its
title, the complete behavior that becomes available when it finishes, and each
blocker with the reason it gates completion. Refine task boundaries and
dependencies with the user. Explicit approval of the breakdown authorizes
writing the task files.

## Publish task files

Publish one file per approved task at
`docs/specs/<slug>/tasks/<NN>-<slug>.md`, numbered in dependency order with
blockers before dependents.

When revising an existing breakdown, preserve completed task files. After the
user approves the revised remainder, replace superseded unfinished task files
so the active tree reflects the approved remaining breakdown.

Each task file contains:

- title
- independently deliverable, end-to-end behavior from the user's perspective
- blocking tasks and why each one gates completion
- status
- outcome-level acceptance-criteria checkboxes for observable completed behavior
- constraints specific to that task, such as concurrent work in the same module
  or an interface that must remain unchanged until another task lands

Record constraints shared by multiple tasks in `spec.md` and constraints that
apply to one task in that task file. Describe observable behavior and stable
module boundaries at a level that remains valid as implementation evolves. Use
an approved prototype as the authority for the intended experience. Ground
implementation choices in the current code at execution time.

Open every task file with this contract:

> Follow current code for implementation details and `spec.md` for intended
> behavior. If implementation reveals that a spec decision must change, surface
> the divergence, clarify the intended behavior, and update `spec.md` before
> proceeding.

## Run and revise

Start each implementation session from one frontier task. Let its independently
deliverable outcome define the task boundary while implementation effort varies.
Keep the task's status and acceptance-criteria checkboxes current during
implementation. When implementation learning invalidates the current or later
tasks, return to this skill, revise the affected tasks with the user, and
continue from the approved breakdown.
