---
name: split-into-tasks
description: "Split work that exceeds one session into session-sized tasks, published one file per task for fresh sessions to pick up. Use when a spec — or its plan — is too big to implement or review in one sitting. Needs an existing spec folder; for work that fits one session, skip it and implement straight from the spec."
---

# Split Into Tasks

Turn a spec folder whose work exceeds one session into session-sized
tasks. Spec folders live at `docs/specs/<slug>/`: when none is named,
list the candidates and ask which; when none exists, stop and say a spec
is needed first, rather than cutting from conversation. Read the
folder's spec.md — and plan.md when planning ran as its own step — plus
`GLOSSARY.md` and `docs/decisions/` where the repo keeps them, and
explore the codebase before cutting.

A task is a session-sized cut of the work: a complete path through
every layer it touches, independently verifiable when done, sized for
one fresh session to implement and one review to read. Never a
horizontal slice of one layer, and never a finer to-do-grain list,
whose predictions rot as execution learns the terrain. Each task
declares which tasks block it; tasks whose blockers are all done form
the frontier the next session picks from.

The one exception to vertical cutting is a wide refactor: one
mechanical change whose blast radius spans the codebase. Sequence it
expand–contract — add the new form beside the old, migrate call sites
in batches sized by blast radius (each batch a task blocked by the
expand), and delete the old form in a task blocked by every batch — so
the build stays green batch to batch.

Present the breakdown before writing anything: a numbered list showing
each task's title, what blocks it, and what works when it is done.
Iterate with the user on granularity, on whether each edge genuinely
gates, and on merging or splitting, until they approve. Publish only
then, so an interrupted review never leaves a half-agreed breakdown
looking authoritative: one file per task at
`docs/specs/<slug>/tasks/<NN>-<slug>.md`, numbered in dependency order
with blockers first.

Each task file states what to build as end-to-end behavior from the
user's perspective, never a layer-by-layer implementation list; which
tasks block it; its status; and acceptance criteria as a checklist the
implementing session can self-grade against. Name modules and behavior,
never file paths or code snippets, which rot as the code moves. The one
exception is a prototype-produced snippet that encodes a decision more
precisely than prose can (a schema shape, a state machine), trimmed to
its decision-rich part.

Every task file opens with this contract, verbatim:

> The code is the terrain and this task is a map: where they disagree,
> the terrain wins. A divergence at the decision level flows back to
> spec.md instead of being worked around.

The user runs one fresh session per task, picking freely from the
frontier. The implementing session updates its task's status and
checkboxes as it finishes; when a session's learning invalidates tasks
still ahead, re-invoke this skill to re-cut the remainder.
