# Adaptive implementation workflow

## Problem

The current pipeline can shape a sound product spec and split it into vertical
tasks, then let implementation discoveries make that handoff stale. A task may
reveal that a technical assumption was false, that a later task's boundary no
longer fits, or that completed code no longer matches the spec. The pipeline
verifies each outcome and reviews the integrated diff, but it does not require
the implementation to reconcile the spec, unfinished tasks, and observed
behavior before continuing downstream.

Long implementation conversations make this worse, but choosing the right
moment for an AI to start a new session is not a reliable correctness
mechanism. Conversation is disposable working memory. The repository must let
the same or a fresh implementation context reconstruct current truth and
continue without relying on remembered discussion.

## Required behavior

- Keep `spec.md` as the durable contract for the user-visible outcomes, scope,
  acceptance criteria, off-limits areas, assumptions, deferred points, and
  remaining risks that shaping settled.
- When a spec has multiple independently deliverable outcomes,
  `split-into-tasks` creates the complete shallow task set up front. Each task
  records its user-visible outcome, observable acceptance criteria, genuine
  blockers, task-specific constraints, focused verification, and any
  risk-justified review checkpoint. It does not predict files, functions, code
  structure, or an implementation sequence inside the outcome.
- Treat the task set as the work unit's shallow roadmap. Do not add a separate
  roadmap, execution ledger, durable implementation plan, or run-state file.
- `implement` derives the active outcome's implementation approach just in time
  from the current code, project decisions, spec, task, Git state, and available
  verification. Before moving to another outcome, it reloads the now-current
  handoff rather than relying only on conversation history.
- After focused verification passes for an outcome, `implement` reconciles the
  observed behavior with the spec and every unfinished task before declaring
  that outcome complete or beginning dependent work.
- During reconciliation, `implement` may revise technical assumptions,
  unfinished task boundaries and order, blockers, task-specific constraints,
  verification, and acceptance wording when the same observable product
  contract is preserved. It records the evidence that justified the revision.
- When a discovery would change a user-approved outcome, scope, observable
  acceptance criterion, off-limits area, or other product constraint,
  `implement` stops before absorbing the change and presents the exact decision
  for the user to settle through shaping.
- A previously completed outcome whose acceptance criteria no longer pass is
  not current completion evidence. Preserve its task and prior evidence, return
  it to a non-completed state, and repair or block it before dependent work or
  final completion continues. Git retains its earlier history.
- Reconciliation is a required completion gate inside `implement`, not a
  separately installed or user-invoked skill. It is distinct from risk-selected
  intermediate code review and from the final integrated review.
- Conversation continuity never determines correctness. An interrupted or
  compacted implementation reconstructs the active outcome from the spec
  folder, task status, Git history, current diff, and fresh verification. The
  workflow may reuse a coherent context but does not require the model to judge
  when a replacement session should start.
- After every outcome and reconciliation gate passes, retain the existing full
  deterministic verification, automated integrated review, and runnable product
  handoff requirements.

## Confirmed constraints

- A Task remains a complete, independently usable and verifiable vertical
  outcome. It is not a technical layer, fine-grained to-do, predicted session,
  or fixed implementation plan.
- The user alone settles changes to the product contract. AI authority covers
  the implementation path and unfinished task structure only while preserving
  that contract.
- The complete shallow task set is visible before implementation. Detailed
  execution planning exists only for the active outcome and is disposable.
- A task boundary always carries focused verification and reconciliation. It is
  not automatically a new context or automated code-review boundary.
- Completed task files are preserved. Their current status must still reflect
  whether their acceptance criteria pass after later integration.
- The spec folder remains the single stable implementation address.

## Assumptions

- The repository exposes enough code, Git state, tests, and runtime behavior for
  a later context to reconstruct progress without the original conversation.
- Most implementation discoveries can be classified by whether they preserve
  or change the observable product contract.
- Focused rereads at outcome boundaries cost less than downstream rework caused
  by a stale handoff.

## Off-limits

- Automatic creation, replacement, or orchestration of Codex or Claude sessions.
- A new roadmap file, progress ledger, decision log, run-state file, or durable
  `plan.md` lifecycle.
- A standalone reconciliation, convergence, or plan-writing skill.
- Mandatory fresh workers, reviews after every edit, or implicit parallel task
  fan-out.
- Product-source changes during shaping.

## Acceptance criteria

- A split spec produces the fewest independently useful tasks with the complete
  outcome set visible, while omitting predicted file-level implementation work.
- Before each new task begins, implementation grounds its approach in the
  current spec, unfinished tasks, code, Git state, and verification evidence.
- A technical discovery that preserves the product contract updates affected
  unfinished tasks and can continue without unnecessary user approval.
- A discovery that changes the product contract stops implementation and
  presents one concrete user decision instead of silently rewriting the spec.
- A later regression that invalidates a completed task prevents downstream or
  final completion until that outcome passes again or is blocked.
- An interrupted run can reconstruct the active outcome and remaining work from
  repository evidence without relying on a closing-message handoff.
- Split and unsplit specs both pass reconciliation before the existing final
  integrated verification and review gate.
- Held-out evaluations cover technical discovery, product-contract change,
  stale pending tasks, invalidated completed work, interruption recovery, and a
  control where no reconciliation changes are needed.

## Deferred points

None.

## Remaining risks

- A model may fail to notice that an implementation discovery affects a later
  task. Held-out evaluations can test observed cases but cannot guarantee every
  semantic dependency is found.
- Repeatedly rereading large specs or task sets may add cost. Reconsider the
  artifact size or loading strategy if boundary rereads become a dominant part
  of real runs.
- AI-authored task revisions could preserve the words while changing the
  practical product contract. Observable acceptance criteria and the final
  integrated review remain necessary guards.
- Session lifecycle remains harness-specific. This workflow makes interruption
  recoverable but does not make cross-session continuation automatic.
