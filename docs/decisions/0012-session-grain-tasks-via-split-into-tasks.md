# Oversized work splits into session-grain tasks via split-into-tasks

Decision 0005 rejected porting to-tickets: at this repo's scale one spec per
worktree left nothing to divide, and pre-cut slices rot as execution learns
the terrain. Real usage produced the counterexample: when a plan outgrows one
session, the binding constraint is the user's review bandwidth, not model
context. A plan too big to read in one sitting gets stamped instead of
reviewed, and the change a giant session produces is equally unreviewable.

The concept returns at the grain 0005 itself sanctioned. draft-plan's Order
section already split oversized work "at session grain, never into a pre-cut
task list"; `split-into-tasks` materializes those session-grain pieces as
files instead of prose. Each **task** (now a glossary term) is a
tracer-bullet vertical slice: a complete path through every layer it touches,
independently verifiable, sized for one fresh session to implement and one
review to read, declaring the tasks that block it. Unblocked tasks form the
frontier a next session picks from. The skill takes the spec folder (plan.md
an input when present, never a prerequisite), reviews the breakdown with the
user before writing anything, then publishes one file per task under
`docs/specs/<slug>/tasks/`.

The rot objection is answered rather than dismissed: tasks stay coarse
(session grain), every task file opens with write-plan's map contract (the
terrain wins; decision-level divergence flows back to spec.md), implementing
sessions update task status as they finish, and a session whose learning
invalidates later tasks triggers re-cutting the remainder.

## Considered Options

- **Rename the pipeline to to-spec / to-plan / to-tasks** (rejected): the
  to-X form cannot cover discover-opportunity, build-prototype, or
  add-stack-context, so adopting it would split the published set into two
  naming classes; and it elides the verb, where this skill's intent
  (splitting because the work is too big) lives.
- **Publish to a real tracker (GitHub, Linear)** (rejected): the user opens
  each task's session by hand, so native blocking links buy nothing, and the
  repo has no tracker-configuration mechanism to pay for.
- **Port the prefactoring instruction** (rejected): a method directive; the
  thin-skills principle (0009) leaves method to the model.
- **An execute/implement companion skill** (rejected, again): plan mode,
  tdd, commit, and pr already cover a task's session, as 0005 found.
- **Fine-grain task lists** (still rejected): the properties that make a
  task reviewable — vertical, verifiable, session-sized — are exactly what
  a to-do-list slice lacks; 0005's objection to that grain stands.

## Consequences

`skills/split-into-tasks` joins the published set, plugin.json, the
`.claude/skills/` symlinks, and the README path diagram. GLOSSARY gains Task
and the Spec folder entry gains tasks/. write-plan's Order section hands
work exceeding one session to split-into-tasks by name. Evals wait for first
real usage. Parallel execution across worktrees stays unrouted until
practiced runs exist.
