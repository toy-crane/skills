# Pipeline

## Decisions

- `discover-opportunity` is an explicit blank-page phase before shaping. It
  finds possible directions from user-approved traces and relevant external
  change; it does not choose an MVP or detailed product behavior.
- `shape-idea` starts from a concrete problem and broad direction, closes or
  defers material decisions, and writes the implementation-ready spec.
- Implementation planning is just-in-time against current code. There is no
  separate plan-writing skill or durable `plan.md` lifecycle.
- A spec with multiple outcomes that should be delivered separately is split by
  `split-into-tasks` into the fewest independently usable vertical tasks with
  explicit blockers. The split also declares only the intermediate review
  checkpoints justified by downstream or material risk. Together the tasks are
  the work unit's shallow roadmap: they preserve outcomes, acceptance criteria,
  blockers, and task-specific constraints without predicting file-level
  implementation work.
- `implement` receives one selected `docs/specs/<slug>/` folder. When approved
  task files exist, it implements them sequentially in dependency order;
  otherwise it implements `spec.md` directly. It derives the active outcome's
  implementation approach just in time from the current repository state.
- `implement` uses `tdd` where behavior can be verified through a pre-agreed
  public seam.
- For each affected product surface, `implement` uses an available matching
  runtime-verification skill. When none is available, it verifies the changed
  behavior through the repository's supported runtime. Behavior not verified in
  the running product remains incomplete; static checks do not replace it.
- Each outcome is complete after its acceptance criteria and focused
  deterministic verification pass, followed by reconciliation of the observed
  behavior with the spec and every unfinished task. Task files hold only durable
  status plus concise verification, blocker, or revision evidence. When
  repository policy calls for commits, code, tests, and the task update form one
  meaningful checkpoint.
- During reconciliation, `implement` may update technical assumptions,
  unfinished task boundaries and order, blockers, task-specific constraints,
  verification, and acceptance wording while preserving the approved observable
  product contract. A proposed change to a user-approved outcome, scope,
  observable acceptance criterion, off-limits area, or other product constraint
  pauses implementation for a shaping decision.
- A previously completed outcome whose acceptance criteria no longer pass is
  not current completion evidence. Preserve its task and prior evidence, return
  it to a non-completed state, and repair or block it before dependent work or
  final completion continues.
- A task's declared intermediate review checkpoint remains part of that task's
  contract. The active harness uses its automated code-review process for the
  stated cumulative scope and risk before substantial dependent work continues.
- After every outcome is implemented, rerun the complete deterministic
  verification and use the active harness's automated code-review process on
  the entire implementation diff against the selected spec and acceptance
  criteria. This final gate applies to split and unsplit specs and covers
  cross-task interactions and omitted requirements.
- After the final gate passes, `implement` runs the actual product when the
  repository exposes it through a user-reviewable local server, verifies the
  changed routes and essential states, and shares a reachable address while
  keeping the current checkout's server available until review finishes or
  later delivery cleanup.
- Context or harness interruption resumes from the spec folder, task status,
  Git history, current diff, and test results. Preserve completed outcomes and
  request user confirmation before absorbing dirty state of uncertain
  ownership.
- Before beginning another outcome, `implement` reloads the current handoff and
  repository evidence. The same context may continue, but remembered
  conversation alone cannot supply the next task's plan or current truth.
- When shaping settles on a framework or hosted service, install the vendor's
  official agent context in its recommended form. `add-stack-context` is
  model-invoked to audit and install the same context during agent setup, after
  stack changes, and on entering an existing project whose vendor context has
  not been checked.
- Before building a workaround for an external dependency, `shape-idea` checks
  official documentation, issue trackers, and release notes. If no answer
  applies, the spec records what was checked and why it fell short.
- When execution applies a workaround whose root cause stays open, or observes
  an out-of-scope defect with evidence, it records a follow-up at the moment of
  discovery through `project-knowledge`, and writes the item directly when that
  skill is absent. `implement` and each runtime-verification skill carry this
  routing; `project-knowledge` owns the criteria and format. A recorded
  follow-up is a valid `shape-idea` input or a direct fix seed for a later
  session.

## Boundaries

- Discovery reads personal traces only with the user's agreement and normally
  hands off through conversation rather than a new artifact.
- Tasks are vertical, independently deliverable and verifiable, and separated
  only at outcomes that can stand on their own. Work that becomes meaningful
  only when completed together remains one task. A task is not a fine-grained
  implementation to-do list or a predicted file, function, code-structure, or
  session plan.
- `split-into-tasks` ends when the approved task handoff is current;
  implementation begins through `implement`.
- `implement` follows the selected folder's existing handoff while preserving
  its approved product contract. Verified discoveries may revise unfinished
  task structure without silently changing that contract.
- The standard task workflow is sequential. Parallel bulk migrations or
  explicitly independent queues require a separately chosen execution model
  rather than implicit task fan-out.
- An intermediate review is warranted only when delayed review could compound a
  material defect through dependent work, or when deterministic checks cannot
  adequately settle a security, data, permission, migration, recovery, or
  external-contract risk. The existence of a task alone is not sufficient.
- The active harness is authoritative for reviewer topology and mechanics.
  `implement` requires an automated code-review outcome without prescribing one
  universal process.
- The runnable handoff applies only to an actual product result exposed by a
  repository-supported local server. Preserve other checkouts and unrelated
  processes, and report an exact launch command and blocker when the environment
  cannot provide a reachable address. Server access is evidence delivery, not
  human approval or an automatic `human-review` invocation.
- A harness-specific review command may be named only when the active
  installation confirms it for that reviewer. Such guidance remains
  conditional and must preserve the portable completion contract: pass
  automated review or hand off an exact user-invocable command while leaving
  the gate outstanding.
- Conversation history is useful while available but is not durable evidence.
  After a real interruption, repository artifacts determine what remains. A
  discovery reported only in the closing message is therefore not preserved.
- Reconciliation is an outcome-completion responsibility inside `implement`,
  not a separate installed skill or a substitute for risk-selected or final
  automated code review.
- Preserve unrelated changes and confirm ownership when dirty-state ownership
  or overlap cannot be established safely.
- Pause when a proposed product-contract change invalidates an outcome,
  acceptance criterion, off-limits area, or other approved constraint; the same
  blocker persists without evidence of progress; or continuing needs authority
  the user has not granted. Keep retries and unfinished-task reconciliation
  within the approved authority and work boundaries.
- Work-unit product constraints belong in `spec.md`; constraints that expire
  with one task belong in that task file. A settled constraint that later work
  should reuse belongs in a decision contract when it passes the project
  decision gate.
- Vendor context uses official sources only and must not be hardcoded to a fixed
  provider list or installation form.

## Why

Discovery and shaping move in opposite directions: discovery broadens from
evidence, while shaping converges on a chosen direction. Plans derived at
execution time age better than stored implementation predictions. Delivery
outcomes, rather than predicted session duration, remain the durable task unit.

The complete shallow task set keeps scope and dependencies visible without
freezing technical predictions. Planning only the active outcome lets current
code and earlier verified discoveries inform the implementation path.

Focused reconciliation closes the flow-back path that verification alone does
not: it makes observed implementation facts update unfinished work before stale
assumptions compound downstream, while preserving user authority over product
outcomes and acceptance.

The spec folder is the stable implementation address. It already says whether
the work remains one coherent spec or has approved tasks, so `implement` needs
one input contract and one deterministic branch instead of separate invocation
paths.

Task files carry exceptional intermediate review checkpoints, so the execution
skill does not need to restate their procedure. Complete verification proves
known behavior; the harness's automated final code review adds its own signal
without forcing every host through the same reviewer topology.

The runnable handoff lets the user inspect the verified implementation without
turning server mechanics into a separate pipeline phase. Keeping the outcome in
`implement` also preserves standalone installation while leaving
`human-review` focused on unresolved human judgment.

Specialized runtime-verification skills own framework-specific observation
loops, while `implement` owns their selection and the completion gate. A generic
dispatcher would duplicate that orchestration without adding a separate user
outcome.

Minimal task state and meaningful code checkpoints preserve useful recovery
evidence without turning Git and task files into a second orchestration state
machine.

## Reconsider when

- Spec folders routinely contain ambiguous or competing implementation
  handoffs that the tasks-first rule cannot resolve.
- Selected intermediate reviews regularly cost more than the defects or
  avoided rework they produce, or material defects repeatedly appear before an
  undeclared checkpoint.
- Available automated code-review processes cannot reliably cover the complete
  diff or report blocking findings consistently enough for the shared
  completion gate.
- The minimal task state cannot reconstruct real interrupted runs safely.
- Outcome reconciliation repeatedly misses downstream contract changes or its
  reread and task-revision cost exceeds the rework it prevents.
- AI-authored unfinished-task revisions repeatedly change practical product
  behavior without surfacing a shaping decision.
- Sequential implementation becomes the dominant bottleneck and the user
  chooses a parallel execution model for genuinely independent work.
- Vendor workaround failures are repeatedly observed outside `shape-idea`,
  justifying another standalone carrier for the check-first rule.
- Recorded follow-ups accumulate unresolved in real repositories, justifying a
  pruning pass rather than only per-item deletion.

## Still-rejected alternatives

- Combining blank-page discovery with `shape-idea` — convergence turns the
  first plausible direction into a premature spec.
- Durable `plan.md` and a plan-writing skill — implementation predictions age,
  while decision-level corrections already have homes in specs, tasks, project
  decisions, or repository instructions.
- A separate roadmap, execution ledger, or run-state file — the spec and shallow
  task set already carry the authoritative contract and current work frontier;
  duplicating them creates another artifact that can drift.
- A separately invoked reconciliation or convergence skill — alignment is part
  of outcome completion and becomes optional if correctness depends on another
  installed skill or user invocation.
- Session duration as the task boundary — predicted limits fragment coherent
  outcomes prematurely.
- Separate `implement-spec` and `implement-tasks` entry points — the spec folder
  already contains the information needed to choose the implementation path.
- A `run-server` pipeline skill — it exposes a technical mechanism and would
  make `implement` depend on another installed skill; reconsider a standalone
  preview workflow only after repeated independent user requests establish a
  separate outcome.
- A generic runtime-verification dispatcher — matching framework skills already
  own their observation loops, while `implement` owns the implementation
  completion gate and remains usable when none is installed.
- A dedicated follow-up recording skill — it names a mechanism rather than a
  user outcome and would add another installable dependency, while
  `project-knowledge` already owns durable project memory.
- Relying on the `project-knowledge` trigger description alone to fire during
  execution — installed context goes unused without explicit routing, the same
  effect measured for vendor agent context.
- Review after every task or edit — it adds fixed cost without requiring a
  material risk boundary.
- Forbidding every intermediate review — a late permission, migration, or
  external-contract finding can invalidate substantial dependent work.
- One universal fresh-reviewer protocol — it duplicates or constrains the
  review capabilities already provided by each harness.
- State-only phase commits, correction counters, exact anchors in every task,
  or a separate run-state file — they create more orchestration state than the
  implementation needs and can drift from code.
- Unlimited repair loops — they turn a persistent blocker into unbounded cost
  without adding new evidence.
- Skipping a blocked dependency — later tasks would inherit an unresolved
  foundation and make integrated verification ambiguous.
- Fine-grained tickets or horizontal layer tasks — they become stale and
  produce changes that are not independently usable end to end.
- Depending on agents to discover vendor context on their own — official
  evaluations showed installed context was frequently left unused unless the
  workflow made retrieval explicit.

## Evidence worth preserving

- A held-constant four-task Todo implementation eval completed in 31m43s with
  five meaningful commits and no state-only commits. The previous fixed
  fresh-worker protocol was still incomplete after 57m49s with 23 commits and
  at least 15 child-agent invocations. This supports removing fixed
  orchestration overhead, not prescribing a replacement context topology.
- Seven inspected Codex and Claude implementation sessions across four
  repositories showed repeated flow-back failures: verified implementation
  changed downstream contracts, completed code diverged from its final spec, a
  late security review invalidated an earlier completion path, and an initially
  reported performance win failed after product and operational constraints
  were applied. These cases support reconciliation at verified outcome
  boundaries rather than relying on final review or session memory alone.
- In that Todo eval, a risk-selected intermediate review and the final review
  found distinct blocking security issues; a final-review-only variant finished
  in similar time. This supports declaring intermediate review only where risk
  justifies it and always retaining the integrated final gate.
- Vendor evaluations cited when the context-installation rule was adopted
  measured large gains from version-matched official context and also showed
  that agents frequently failed to invoke an installed skill without an
  explicit routing instruction.
- Claude Code 2.1.226 exposed `/review` as an alias for `code-review`. A live
  invocation entered the automated review process; a forced Skill permission
  denial then handed `/review` to the user and kept the completion gate open.
  This supports conditional alias guidance, not a cross-version assumption.
