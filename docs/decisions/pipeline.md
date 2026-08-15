# Pipeline

## Decisions

- `define-product` owns creating the permanent app-level context for a
  from-scratch application and making deliberate changes to its product meaning
  with the user. It is the greenfield entry point before work-unit shaping and
  does not produce a work-unit spec. Its input includes at least a rough app
  direction or problem the user already wants to pursue. That seed starts an
  interview; it does not authorize the AI to complete missing product meaning.
  The skill draws out the user's actual use situation, current behavior, and
  desired change, confirms the complete direction, and only then writes
  `PRODUCT.md`. It converges the chosen seed rather than discovering
  opportunities from a blank page.
- `discover-opportunity` is not part of the pipeline. The greenfield entry point
  leaves a durable current artifact instead of handing a chosen direction to
  shaping through conversation alone.
- `shape-idea` remains independent. It starts from a concrete problem and broad
  direction, reads app-level context when one exists, closes or defers material
  work-unit decisions, and writes the implementation-ready spec. Missing
  app-level context neither blocks shaping nor makes `shape-idea` create it.
- `maintain-project-context` periodically reconciles the durable context left by
  the workflow, including `PRODUCT.md`. It can reflect already-settled meaning
  and remove stale or duplicated wording without becoming a pipeline gate or a
  product decision-maker. A material ambiguity is returned to the user or
  `define-product` rather than inferred from implementation.
- Every spec-producing path writes the same stable product contract:
  user-visible outcomes, approved scope, observable acceptance criteria,
  settled constraints and rationale, assumptions, off-limits areas and reasons,
  deferred points, and remaining risks. It records behavior and decisions rather
  than predicted implementation. `build-prototype` creates or updates this
  contract when its approved surface closes without a prior shaping handoff and
  consequential behavior outside that surface is settled or explicitly
  deferred.
- Implementation planning is just-in-time against current code. There is no
  separate plan-writing skill or durable `plan.md` lifecycle.
- A spec with multiple outcomes that should be delivered separately is split by
  `split-into-tasks` into the fewest independently usable vertical tasks with
  explicit blockers. The split also declares only the intermediate review
  checkpoints justified by downstream or material risk. Together the tasks are
  the work unit's shallow roadmap: non-superseded tasks preserve current
  outcomes, acceptance criteria, blockers, and task-specific constraints
  without predicting file-level implementation work.
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
  behavior with the spec and every active unfinished task. Task files hold only
  durable status plus concise verification, blocker, or revision evidence. When
  repository policy calls for commits, code, tests, and the task update form
  one meaningful checkpoint.
- During reconciliation, `implement` may update technical assumptions,
  active unfinished task boundaries and order, blockers, task-specific
  constraints, verification, and acceptance wording while preserving the
  approved observable product contract. A proposed change to a user-approved
  outcome, scope, observable acceptance criterion, off-limits area, or other
  product constraint preserves current artifacts and evidence, blocks affected
  and dependent work, and pauses implementation for a shaping decision.
- A previously completed outcome whose acceptance criteria no longer pass is
  not current completion evidence. Preserve its task and prior evidence, return
  it to a non-completed state, and repair or block it before dependent work or
  final completion continues.
- When an approved breakdown replaces a task with recorded completion history,
  move every still-required obligation and blocker reference to the replacement,
  mark the retained task `superseded`, and preserve its evidence in place.
  Superseded tasks are inactive history outside the frontier, blockers,
  reconciliation, and completion gates; inspect them only when current evidence
  implicates their prior implementation. Never retain or archive a superseded
  task that has no completion history.
- A task's declared intermediate review checkpoint remains part of that task's
  contract. The active harness uses its automated code-review process for the
  stated cumulative scope and risk before substantial dependent work continues.
- After every outcome is implemented, rerun the complete deterministic
  verification and use the active harness's automated code-review process on
  the entire implementation diff against the selected spec and acceptance
  criteria. This final gate applies to split and unsplit specs and covers
  cross-task interactions and omitted requirements. It stays inside `implement`
  because blocking findings return to implementation; it neither invokes nor
  replaces the explicitly requested human judgment owned by `human-review`.
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
- `resolve-follow-ups` sweeps the fetched remote default-branch backlog in
  discovery order and starts no more than three eligible workers. Each item gets
  its own verified fresh-base worktree, branch, commit series, and ready-for-
  review pull request. A worker edits only after reproducing the symptom and
  finding a settled deterministic success condition; it never merges its pull
  request.
- Attempt state is disposable local coordination data keyed by the current
  follow-up lifetime, content, and base commit. Atomic owner claims prevent
  duplicate workers, repository-wide coordinate reservations prevent two
  attempts from sharing one worktree, and cleanup revalidates that reservation
  before asking Git to remove a still-clean checkout. Clean initialized
  submodules are deinitialized through isolated temporary Git metadata without
  changing shared repository settings or bypassing Git's final dirty-worktree
  refusal. Terminal results retain decisive evidence. An
  interrupted non-terminal claim is recovered only after the adapter proves its
  worker ended and cleans up its exact bound worktree or missing Git registration.
  Prepare persists the canonical worktree target before checkout creation, and
  terminal identity retains owner and cleanup coordinates, so either interruption
  window remains recoverable. Active claims and pull-request outcomes continue to
  suppress unchanged content across unrelated base advancement; deletion followed
  by re-creation starts a fresh lifetime even when the Markdown is identical,
  including when a merge restores the path against its default-branch parent.
  Non-PR outcomes become retryable when the base changes, but only after any
  surviving terminal worktree is reconciled. A published branch is reconciled
  with its pull request before any interrupted claim can be recovered.

## Boundaries

- `define-product` owns deliberate app-level product definition, while
  `shape-idea` owns work-unit shaping and `maintain-project-context` owns
  periodic cross-artifact hygiene. None makes another's artifact a required
  input, and the app-level context does not absorb work-unit scope or acceptance
  criteria.
- A user with no app direction is outside the greenfield skill's input
  contract. The pipeline does not mine personal traces or invent candidate
  opportunities to manufacture that missing seed.
- A partial direction is valid input to the interview but not a complete
  product definition. Missing central meaning blocks the `PRODUCT.md` handoff
  until the user supplies it or delegates the exact choice. A less central gap
  crosses the handoff only when the user accepts it as an assumption or chooses
  to leave it unknown.
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
- A follow-up that does not reproduce remains unchanged. A reproduced item that
  needs a product decision or material trade-off returns to `shape-idea`; the
  sweep does not invent intent to keep automation moving. A different defect
  discovered by a worker is returned to the coordinator for serialized
  follow-up recording, commit, and durable follow-up-only pull-request handoff
  before that disposable worker is cleaned up.
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

App-level context and work-unit shaping operate at different lifetimes. A
from-scratch app needs one current premise that survives across features, while
each shaping session must still converge on one implementation-ready work unit.
Keeping their skills independent lets either be installed and invoked alone and
prevents app identity from becoming feature scope. Plans derived at execution
time age better than stored implementation predictions. Delivery outcomes,
rather than predicted session duration, remain the durable task unit.

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

Follow-up sweeps need stricter mechanics than ordinary implementation because
the backlog may move after a scheduled checkout starts and concurrent workers
can otherwise mix changes or suppress retries. Fetching before enumeration,
per-item isolation, reproduction and authority gates, and owner-fenced local
state keep automation reviewable without turning follow-up files into a queue.

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
- Follow-up sweeps run from several machines often enough that local attempt
  state permits material duplicate work, justifying a shared queue.
- Codex provides native per-subagent worktree roots with equivalent fresh-base,
  ownership, and cleanup guarantees, making the external worker adapter
  unnecessary.

## Still-rejected alternatives

- Keeping `discover-opportunity` as a separate conversational entry point — its
  handoff disappears with the session and does not provide the durable app
  premise the greenfield workflow needs.
- Folding blank-page opportunity discovery into the app-context skill —
  divergent search and convergence on a durable app premise require different
  evidence and stopping conditions, while the supported workflow already starts
  from a user-chosen direction.
- Making `shape-idea` create or own app-level context — it couples a permanent
  app artifact to a work-unit shaping lifecycle and makes independent use
  ambiguous.
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
- One recurring schedule per follow-up — schedule state grows with the backlog
  and duplicates selection policy that one bounded sweep can own.
- Several follow-ups in one worker checkout or pull request — one failure or
  overlap couples otherwise independent evidence and review.
- A speculative fix from a recorded symptom, a stale local base, or unsettled
  product intent — none establishes that the proposed patch is the verified
  result the project wants.
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
- The `resolve-follow-ups` dispatcher test exercises fetched remote ordering,
  atomic claims, stale and changed bases, dirty checkout hooks, interrupted
  claim recovery, terminal evidence, exact worktree ownership, unpublished
  changes, and cleanup. An automated whole-diff review exposed remote-only
  backlog loss, abandoned claims, dirty prepared workers, and lost non-PR
  evidence; the added controls reproduce each failure before accepting the
  corrected lifecycle.
