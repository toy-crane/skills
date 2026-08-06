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
  specification and more than one unfinished task set exists, require a selection
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
  `completed` only after recording the exact task checkpoint commit plus concise
  verification and review evidence. The highest-numbered terminal task carries
  a separate run-completion gate with the cumulative base, current candidate,
  exact reviewed commit, verification, review, blocker, and correction count.
  This keeps a run-level failure distinct from the terminal task's own result
  and makes the reviewed integration range recoverable after interruption.
  A new pending task may receive blank execution fields. Existing legacy state
  may migrate only when exact commit anchors are present or uniquely
  reconstructable from first-parent history; otherwise pause rather than invent
  evidence. Migration never changes outcomes, declared dependencies, or
  acceptance criteria.
- The implementation worker runs relevant checks and establishes a checkpoint
  commit that scopes its full diff. The orchestrator then reruns authoritative
  deterministic verification against that checkpoint before reviewing it with
  the harness's native local code-review capability when available, or a fresh
  read-only reviewer with the same scope and blocking criteria otherwise.
- Treat correctness, security, regression, and specification findings as
  blocking. Persist exact failure evidence in the ledger before returning it to
  a write-capable implementation worker, rerun the relevant verification, and
  review the complete task diff again. Style-only findings do not block
  completion.
- After every task-local gate is complete, review the cumulative diff from the
  first task's base commit through an exact end commit. Resolve blocking
  cross-task findings under the same correction and verification rules before
  recording that exact commit as the passing integrated result.
- Leave pushing, pull-request creation, hosted review, merging, and deployment
  to explicit user authorization and the repository's own workflow.

## Restart and failure behavior

- Treat conversation history and transient phase markers as disposable. On
  restart, find the `in-progress` task and reconstruct its scope from the
  recorded base and current Git state. Resume implementation when no complete
  checkpoint exists or an implementation blocker was resolved; otherwise rerun
  deterministic verification and review before deciding what remains. If every
  task is complete but the terminal cumulative gate is not passed, that task set
  remains unfinished and resumes at the run-level gate. Restore correction
  limits from the task ledger; each completed repair increments its
  corresponding counter in the same commit as its code changes.
- Resume an interrupted context or harness with a fresh worker. An interruption
  before a clean repair commit atomically increments its counter with code does
  not consume a correction round. If that durable commit exists when the
  orchestrator restarts, validate and adopt or block it without decrementing
  the counter.
- Allow at most two automatic correction rounds for verification or review
  blockers. Reaching two does not itself fail a gate that now passes. If a
  blocker persists at the limit, or a valid durable repair produces no evidence
  of progress, mark the task gate or cumulative gate `blocked`, preserve concise
  evidence, stop the whole run, and report the decision the user must make.
- Pause immediately on unexpected dirty or divergent Git state, a changed spec
  that invalidates task boundaries or blockers, or any action requiring new
  authority. Task-relevant dirty state is still ambiguous until the user
  explicitly confirms its ownership. Never skip a blocked task to continue
  later tasks.
- Resume a blocked task or cumulative gate only after the user resolves its
  recorded blocker and the orchestrator verifies that the approved task
  contract remains valid. Preserve its original base and correction count.

## Confirmed constraints

- Task execution is sequential; parallel task workers are out of scope.
- Task-level worktrees and automatic whole-run worktree creation are out of
  scope. Checkout isolation remains the user's choice.
- A separate orchestrator run-state file is out of scope.
- Review does not replace deterministic tests, branch protection, or human
  approval.
- The orchestrator may update execution status and evidence, but it may not
  silently rewrite approved task outcomes, blockers, or acceptance criteria.
- The orchestrator owns ledger transitions. A repair worker may mutate only its
  selected correction counter, atomically with the corresponding code repair.

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
