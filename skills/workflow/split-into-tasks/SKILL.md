---
name: split-into-tasks
description: Split an implementation-ready spec into the fewest independently deliverable vertical tasks and select only risk-justified intermediate review checkpoints. Use when a spec has multiple outcomes needing separate delivery or dependency tracking; keep one coherent outcome as the spec itself.
---

# Split Into Tasks

## Read the spec

Require `docs/specs/<slug>/spec.md`; if it is missing, stop before proposing
tasks.

Read the spec and current code, plus relevant project decisions, glossary terms,
and an approved prototype when present. Treat missing implementation as the
target gap. Pause on conflicting settled sources and present the exact decision
to resolve. When the approved behavior forms one coherent user workflow, keep
the spec as the sole handoff; separate operations or states inside that workflow
do not create task boundaries.

## Propose the complete outcome map

For work with multiple independently deliverable outcomes, draft the complete
shallow map using the fewest independently usable and verifiable outcomes. Fold
prerequisite work into the first outcome that makes it useful unless that work
is independently deliverable. Declare only blockers that genuinely prevent a
dependent outcome.

Cover every spec outcome. For each proposed task show its title, delivered
behavior, observable acceptance criteria, focused deterministic verification,
task-specific constraints, blockers with reasons, and any review checkpoint.
Implementation derives the active outcome's technical approach just in time
from the then-current repository, so omit predicted files, functions, code
structure, technical-layer steps, context boundaries, and internal sequences.
Reference an approved prototype when relevant without copying its implementation.

Add an intermediate review checkpoint only when a material error could compound
through substantial dependent work, or when deterministic checks cannot
adequately settle a material risk such as security, data, permission, migration,
recovery, or an external contract. Name its cumulative scope and concrete risk.
The implementation phase owns the final integrated review.

Present the complete proposal and iterate until the user approves it. Write no
task files before that approval.

## Write the approved handoff

After approval, record shared settled constraints in the spec and only
task-specific constraints in task files. Do not invent unsettled behavior.

Write each approved task to
`docs/specs/<slug>/tasks/<NN>-<slug>.md` using
[`templates/task.md`](templates/task.md), with blockers before dependents.
When this skill revises a breakdown, preserve any task with recorded completion
evidence, even if its current status later returned to `in-progress` or
`blocked`; its prior evidence is durable recovery history. For an approved
revision, remove superseded tasks that have never completed rather than
retaining active variants or creating an archive. End after writing the current
task handoff, before implementation.
