---
name: split-into-tasks
description: Split work that exceeds one session into session-sized task files for fresh sessions to implement. Use when an existing spec is too large to implement or review in one sitting. Skip when the work fits one session.
---

# Split Into Tasks

Start from a spec folder at `docs/specs/<slug>/`. If none is named, list the
candidates and ask which to use. If none exists, stop and request a spec instead
of splitting directly from conversation. Read `spec.md`, plus `GLOSSARY.md` and
`docs/decisions/` when present, and inspect the codebase before splitting.

Make each task a session-sized vertical slice: a complete path through every
layer it touches, independently verifiable when done, and small enough for one
fresh implementation session and one review. Do not create horizontal layers or
fine-grained to-do lists. Declare which tasks block each task; tasks with no
unfinished blockers form the frontier for the next session.

Present the breakdown before writing files. Show each task's title, blockers,
and working behavior in a numbered list. Revise granularity and dependencies
with the user until they approve, then publish one file per task at
`docs/specs/<slug>/tasks/<NN>-<slug>.md`, numbered with blockers first.

Each task file contains:

- end-to-end behavior from the user's perspective;
- blocking tasks;
- status;
- acceptance criteria the implementing session can check;
- constraints specific to that task, such as a file another branch is changing
  or an interface frozen until a migration lands.

Put longer-lived constraints in `spec.md`. Name modules and behavior, not file
paths or code snippets. A prototype-produced snippet may be included only when
it expresses a decision more precisely than prose; trim it to the
decision-bearing part.

Open every task file with this contract:

> Follow current code for implementation details. If it conflicts with spec.md
> at the decision level, update spec.md rather than working around the conflict.

The user runs one fresh session per task, choosing from the frontier. Each
implementing session updates its task's status and checkboxes. If new information
invalidates later tasks, re-invoke this skill to split the remaining work again.
