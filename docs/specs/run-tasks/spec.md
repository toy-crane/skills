# Run tasks

## Problem

Task files provide a durable implementation handoff, but executing a complete
set still depends on one conversation retaining planning, implementation,
verification, and review context. Long runs therefore accumulate irrelevant
history and become fragile at context or harness boundaries. Running task
workers in parallel or creating a worktree per task would add coordination and
integration work that this workflow does not need.

## Required behavior

- Publish a directly invoked skill named `run-tasks` for executing the approved
  task files under one specification. When the user does not identify the
  specification and more than one active task set exists, require a selection
  before changing the repository.
- Operate on the current user-selected checkout or worktree. Do not create or
  switch branches or worktrees. Require a Git state that can support explicit
  task commit boundaries; pause instead of changing an unsafe or ambiguous Git
  state automatically.
- Execute tasks sequentially in dependency order with only one write-capable
  worker. When multiple pending tasks are eligible, select the lowest-numbered
  task.
- Give each task a fresh implementation context grounded in repository
  instructions, the approved specification and decisions, its task file, the
  current code, and prior completed commits. Do not depend on earlier worker or
  orchestrator conversation history.
- Use each task file as its execution ledger and Git as the source of truth for
  code. A task begins by recording `in-progress` and its base commit. It reaches
  `completed` only after recording the final code commit plus concise
  verification and review evidence. Separate task-review and cumulative-review
  correction counters make the two-round limits recoverable after interruption.
  Existing approved task files that lack the execution fields may be initialized
  without changing their outcomes, blockers, or acceptance criteria.
- Implement and deterministically verify the task, then establish a checkpoint
  commit that scopes its full diff. Review that diff with the harness's native
  local code-review capability when available; otherwise use a fresh read-only
  reviewer with the same scope and blocking criteria.
- Treat correctness, security, regression, and specification findings as
  blocking. Return them to a write-capable implementation worker, rerun the
  relevant verification, and review the complete task diff again. Style-only
  findings do not block completion.
- After every task is complete, review the cumulative diff from the first task's
  base commit through the current branch. Resolve blocking cross-task findings
  under the same correction and verification rules before declaring the run
  complete.
- Leave pushing, pull-request creation, hosted review, merging, and deployment
  to explicit user authorization and the repository's own workflow.

## Restart and failure behavior

- Treat conversation history and transient phase markers as disposable. On
  restart, find the `in-progress` task, reconstruct its scope from the recorded
  base and current Git state, and rerun deterministic verification and review
  before deciding what remains. Restore correction limits from the task ledger;
  each completed repair increments its corresponding counter in the same commit
  as its code changes.
- Resume an interrupted context or harness with a fresh worker. An interruption
  does not consume a correction round when the task ledger or Git state shows
  forward progress.
- Allow at most two automatic correction rounds for verification or review
  blockers. If a blocker persists or the run makes no observable progress, mark
  the current task `blocked`, preserve concise evidence, stop the whole run, and
  report the decision the user must make.
- Pause immediately on unexpected dirty or divergent Git state, a changed spec
  that invalidates task boundaries or blockers, or any action requiring new
  authority. Never skip a blocked task to continue later tasks.

## Confirmed constraints

- Task execution is sequential; parallel task workers are out of scope.
- Task-level worktrees and automatic whole-run worktree creation are out of
  scope. Checkout isolation remains the user's choice.
- A separate orchestrator run-state file is out of scope.
- Review does not replace deterministic tests, branch protection, or human
  approval.
- The orchestrator may update execution status and evidence, but it may not
  silently rewrite approved task outcomes, blockers, or acceptance criteria.

## Assumptions

- The target is a Git repository with an approved task set under
  `docs/specs/<slug>/tasks/` and repository instructions that define any local
  commit or verification requirements.
- Harness-specific worker and review mechanisms can differ as long as they
  preserve fresh implementation context, read-only first-pass review, diff
  scope, and the shared blocking criteria.

## Deferred points

None.

## Remaining risks

- A single delivery-sized task may still exceed several fresh contexts without
  making Git-visible progress. Repeated occurrences should reopen task sizing.
- Native review facilities may expose different severity labels or diff-scoping
  controls. The behavioral gate must remain consistent even when an adapter
  needs a fresh read-only reviewer instead.
- Repository-specific hooks may reject the checkpoint or ledger commits. Such a
  rejection must pause the run rather than bypassing the repository policy.
