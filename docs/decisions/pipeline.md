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
  app-level context neither blocks shaping nor makes `shape-idea` create it. It
  owns new specs only; revising an existing one against later work belongs to
  `babysit-specs`.
- `babysit-specs` owns cross-work-unit spec revision. It takes one or more
  spec folders, or every folder under `docs/specs/` when none is named, takes
  each spec's last commit as its baseline, and compares the contract with the
  Git history since it plus the current behavior of the surfaces the spec
  names, including its linked prototype rendered against the current surface.
  It triages by meaning rather than by cost: a correction that preserves the
  approved meaning is applied in place as an overridable assumption, while one
  that would change an approved outcome, criterion, constraint, off-limits
  area, or deferred point is settled by one question with a recommendation. It
  rewrites `spec.md` in place with no change log, never edits product source,
  names affected task files rather than editing them, routes prototype drift to
  `build-prototype` or records it as a risk, and reports a fully delivered spec
  as a retirement candidate instead of deleting it.
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
- `implement` receives one selected `docs/specs/<slug>/` folder as a single
  handoff bundle anchored by `spec.md`. Before implementation it loads the spec,
  active tasks, implicated task history, explicitly linked decision contracts,
  any other decision contract implicated by repository evidence, and every
  prototype or screen-state artifact the handoff identifies as an approved or
  selected implementation reference. It reads textual sources and renders or
  otherwise inspects visual artifacts; mere presence in the folder does not
  establish approval. When approved task files
  exist, it implements them sequentially in dependency order; otherwise it
  implements `spec.md` directly. It derives the active outcome's implementation
  approach just in time from the current repository state.
- Before changing source for an outcome, `implement` compares the spec's
  assumptions, settled constraints, and acceptance criteria with the current
  code and the Git history since the spec folder's last commit; its own
  code-plus-task checkpoints advance that baseline. A mismatch that would
  change an approved outcome, acceptance criterion, off-limits area, or product
  constraint stops that outcome before any source change, names the stale point
  and its evidence, and routes it to `babysit-specs` when available or to the
  same inline shaping decision when not. The check reads the selected spec
  against the repository, so `implement` still never reads sibling spec
  folders.
- The spec-writing skills own the producer side of that loading rule. A spec
  links the approved prototype and the decision contracts its work unit depends
  on; a task adds only the references scoped to that task, the prototype screens
  and states it delivers and a contract only it depends on, which leaves the
  spec's own links and `spec.md` out of it. Linked sources are pointed at
  rather than restated, and a link names a complementary source beside the
  product contract rather than adding a field to it.
- Explicit product contracts and approved references complement one another:
  the former retain their stated product meaning, while an approved visual
  reference supplies the concrete composition and states it covers. A conflict
  names both sources and the affected behavior or screen-state coordinate,
  blocks that outcome and its dependents, and returns the decision to shaping;
  neither source silently overrides the other.
- `implement` selects public test seams from the agreed behavior and existing
  interfaces under its implementation authority. It briefly states what the
  seam will verify, then uses `tdd` when available. Technical uncertainty is
  resolved through repository evidence; only unresolved expected behavior or a
  change to the agreed product contract requires a user decision.
- For each affected product surface, `implement` uses an available matching
  runtime-verification skill. When none is available, implementation authority
  covers investigating the repository and current environment, selecting the
  strongest usable runtime observation path, and carrying out that verification
  without pausing for approval of the technical method. Behavior not verified
  in the running product remains incomplete; static checks do not replace it.
- For a screen-based outcome with an approved visual or state reference,
  runtime verification compares the actual implementation at every applicable
  screen, state, and viewport coordinate. It checks composition, content,
  hierarchy, containment, placement, visibility, and relevant transitions and
  recovery rather than treating element presence or navigation alone as a
  match. Every claimed platform supplies its own actual-screen comparison for
  the same applicable screens and states through that platform's intended layout
  and native conventions. A non-visual handoff adds no prototype or screen gate.
- Each specialized runtime-verification skill owns its runtime preflight and
  separates readiness, known initial state, and observed behavior. It uses the
  least destructive state profile that proves the scenario: app-scoped known
  state by default, a dedicated fresh target only for device-level claims or
  evidenced contamination, and deliberately preserved prior state for upgrade,
  migration, or returning-user behavior. Client reset never implies host or
  backend reset, and destructive preparation has one owner before concurrent
  observation begins.
- Before final completion, `implement` re-verifies the changed flow and the
  representative core-loop journey from `PRODUCT.md` on every platform its
  result claims. When no core loop is defined, it verifies the changed flow and
  reports the missing regression coverage rather than inventing a journey. A
  review repair that changes executable product behavior invalidates the earlier
  runtime evidence, so this gate repeats on the repaired revision without a
  second review pass.
- Each outcome is complete after its acceptance criteria and focused
  deterministic verification pass, followed by reconciliation of the observed
  behavior with every required handoff source and applicable acceptance or
  approved-reference criterion. Task files hold only durable status plus
  concise verification, blocker, or revision evidence. When repository policy
  calls for commits, code, tests, and the task update form one meaningful
  checkpoint.
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
  contract. The active harness reviews the stated cumulative scope once,
  focused on the stated risk, before substantial dependent work continues. The
  same mode, triage, and single-pass rule as the final review apply.
- After every outcome is implemented, rerun the complete deterministic
  verification, then complete one pass of the active harness's automated
  code-review process over the entire implementation diff against the selected
  spec and acceptance criteria. The pass applies to split and unsplit specs and
  covers cross-task interactions and omitted requirements. It stays inside
  `implement` because must-fix findings return to implementation; it neither
  invokes nor replaces the explicitly requested human judgment owned by
  `human-review`.
- The review depth is `implement`'s judgment for the change at hand, weighing
  what the change touches against what verification already settles. It names
  the mode explicitly where the harness offers modes, because one given no mode
  may reuse an earlier invocation's, and takes the harness's standard mode when
  nothing argues either way. The run stays single at any depth. Wherever the
  harness accepts review context, the reviewer receives the required handoff
  sources or their repository paths: the spec's approved scope, off-limits
  areas and remaining risks, the active task contract, linked decision
  contracts, and applicable approved reference artifacts. A pass counts only
  when the reviewer finishes inspecting the intended scope and returns findings
  or an explicit no-findings result. Failed, partial, silent, and mistargeted
  attempts are not completed passes.
- `implement` fixes a finding only when it shows an approved acceptance
  criterion failing, or is a defect or caused regression in the changed
  behavior that reproduction confirms on a path ordinary use reaches. It then
  reruns the affected verification; when the repair changes executable product
  behavior, it also repeats the final changed-flow and core-loop runtime gate on
  every claimed platform. It sends no scope through the reviewer twice in that
  run, including repairs made to an already-reviewed scope. Every other finding
  is recorded instead: an evidenced defect or open workaround becomes a
  follow-up, an already-disposed trade-off is noted as disposed, and a material
  consequence the spec leaves open is named in the handoff as a decision the
  user owns.
- Completion requires every required handoff source to have been inspected and
  every applicable acceptance and approved-reference criterion to be reconciled with
  the executable revision, alongside passing verification, reverified must-fix
  repairs, and each required automated review finishing and being triaged or
  explicitly waived for that scope. An unread source or uncompared criterion
  keeps the result incomplete. Recorded findings can remain; zero findings is
  not the gate.
- Review execution reuses applicable user authorization without asking again.
  A service-backed request identifies the actual destination and diff, spec,
  and related source context, and carries that authorization accurately.
  Read-only file access does not imply local-only processing. The skill cannot
  grant permission for a new service or wider source scope.
- Recoverable command, compatibility, environment, and transient errors are
  resolved within the authorized scope and retried without consuming the pass.
  An explicit policy denial instead requires a materially safer permitted
  alternative or the specific missing authority, with its rationale preserved;
  switching tools or services to bypass the same denial is not recovery.
  When a model-invocable reviewer lacks user permission, establish the service
  and source scope and ask for that permission; a confirmed manual command does
  not resolve the authorization blocker.
- A user-only or absent reviewer, missing permission, or unresolved execution
  failure leaves overall completion pending. A blocked intermediate checkpoint
  also blocks dependent work. Preserve verified outcomes and provide their
  evidence, exact review blocker, and next required action. Name a user command
  only when the active harness confirms it. Only the user can waive review.
- After the review pass and any must-fix repairs, or while review is pending,
  `implement` runs the actual product when the repository exposes it through a
  user-reviewable local
  server, verifies the changed routes and essential states, and shares a
  reachable address while keeping the current checkout's server available until
  review finishes or later delivery cleanup.
- Context or harness interruption resumes from the spec folder, task status,
  Git history, current diff, and test results. Preserve completed outcomes and
  request user confirmation before absorbing dirty state of uncertain
  ownership.
- Before beginning another outcome, `implement` reloads the current handoff and
  repository evidence. The same context may continue, but remembered
  conversation alone cannot supply the next task's plan or current truth.
- When shaping settles on a framework or hosted service, route its current
  agent context through `add-stack-context` when that skill is available and
  retain the same outcome inline when it is not. The
  [stack-context](stack-context.md) contract owns discovery, source acceptance,
  live vendor-document routing, and the audit used during setup, stack changes,
  and entry into an unchecked project.
- Before building on or working around a third-party package or tool,
  `shape-idea` grounds its conclusion in evidence of how that dependency
  actually behaves and confirms it in the project. The spec records what was
  checked, what fell short, and the upstream change that would reopen the
  decision.
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
- `implement` follows only the selected folder's formal handoff and material it
  explicitly links or current repository evidence implicates; it does not read
  every sibling file merely because it is present. Verified discoveries may
  revise unfinished task structure without silently changing an approved
  product contract or reference.
- The standard task workflow is sequential. Parallel bulk migrations or
  explicitly independent queues require a separately chosen execution model
  rather than implicit task fan-out.
- An intermediate review is warranted only when delayed review could compound a
  material defect through dependent work, or when deterministic checks cannot
  adequately settle a security, data, permission, migration, recovery, or
  external-contract risk. The existence of a task alone is not sufficient.
- The active harness is authoritative for reviewer topology and mechanics.
  `implement` requires one completed review pass and its triage, unless the
  user explicitly waives that review, without prescribing a universal reviewer
  process, and never repeats the pass to reach
  a quiet result.
- The runnable handoff applies only to an actual product result exposed by a
  repository-supported local server. Preserve other checkouts and unrelated
  processes, and report an exact launch command and blocker when the environment
  cannot provide a reachable address. Server access is evidence delivery, not
  human approval or an automatic `human-review` invocation.
- A harness-specific review command may be named only when the active
  installation confirms it for that reviewer. Such guidance remains conditional
  and preserves the portable completion contract: deliver verified outcomes and
  record the completed review or explicit waiver; otherwise keep the review
  pending with its blocker and next required action, without inventing a command.
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
  not a separate installed skill or a substitute for the risk-selected or final
  review pass.
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
- Whole-device reset is permitted only on a simulator or emulator dedicated to
  the active verification. Physical, user-owned, shared, and otherwise unowned
  targets are never erased. Destructive remote backend reset requires separate
  explicit authority and is not ordinary implementation verification.

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

Cross-work-unit revision triages by meaning because the cheap-and-reversible
rule governs new choices during shaping. Applied to revising approved text it
would raise a question on almost every touch, which removes the reason to
invoke `babysit-specs` at all.

The spec folder is the stable implementation address. It already says whether
the work remains one coherent spec or has approved tasks, so `implement` needs
one input contract and one deterministic branch instead of separate invocation
paths.

Task files carry exceptional intermediate review checkpoints, so the execution
skill does not need to restate their procedure. Complete verification proves
known behavior; one automated review pass adds an independent look at the diff
without forcing every host through the same reviewer topology. That independent
look is what the standard mode buys, which is why the default is the harness's
ordinary review rather than its cheapest.

Repeating that pass is a different mechanism from running it. Reviewers report
candidates, so a rule that ends only at zero findings has no reachable stopping
point and spends its later rounds re-arguing settled trade-offs. Reproduction
decides what returns to implementation, the recorded remainder keeps the rest
visible, and the user keeps the judgments that need product intent. Requiring a
completed review preserves that independent look; accepting recorded findings
prevents a return to the zero-findings loop. An execution failure supplies no
review evidence, so verified implementation and pending review stay distinct.

The runnable handoff lets the user inspect the verified implementation without
turning server mechanics into a separate pipeline phase. Keeping the outcome in
`implement` also preserves standalone installation while leaving
`human-review` focused on unresolved human judgment.

Specialized runtime-verification skills own framework-specific observation
loops, while `implement` owns their selection and the completion gates that
remain: acceptance criteria, reconciliation, and verification in the running
product. A generic dispatcher would duplicate that orchestration without adding
a separate user outcome. The same ownership includes preflight because only the
specialist knows which runtime, state boundary, and observation channel make its
evidence meaningful. App-scoped known state keeps the common loop fast, while a
conditional dedicated-device reset pays the higher cost only when the claim
depends on first-device state. Keeping prior-state verification as a separate
profile prevents clean-install confidence from hiding upgrade and migration
defects.

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
- Defects a deeper review mode would have caught repeatedly surface after
  handoff, or depth selection collapses in practice into always taking the
  fallback mode, making the criteria inert.
- Triage repeatedly returns defects to the user or a follow-up that should have
  been repaired in the run that introduced them.
- A harness ships a reviewer designed to converge, such as a mode that
  re-verifies only named findings, or gives a cheap mode independent reviewer
  context.
- Authorized reviews still fail repeatedly after accurate destination and
  source-scope requests and supported execution paths; revisit the integration
  with current evidence rather than silently relaxing completion.
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
- Users repeatedly forget to invoke `babysit-specs` and `implement`'s load-time
  check keeps catching stale specs only at the next implementation, justifying
  a closing mention of remaining spec folders despite `implement`'s
  sibling-unaware boundary.
- `implement`'s load-time staleness check repeatedly stops an outcome on Git
  history that does not touch the spec's meaning, justifying a narrower scope
  for it.

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
- Folding spec revision into `shape-idea` as a second entry point — it reuses
  the shaping rules without restating them, but grows a skill whose text
  already competes with the user's task for context. The user chose the
  separate skill on that ground.
- Having `implement` scan sibling spec folders at its close-out — it would
  cross the boundary that keeps `implement` on one selected folder, and the
  scan is speculative because a sibling may be reshaped before it is built.
- Durable `plan.md` and a plan-writing skill — implementation predictions age,
  while decision-level corrections already have homes in specs, tasks, project
  decisions, or repository instructions.
- A separate roadmap, execution ledger, or run-state file — the spec and shallow
  task set already carry the authoritative contract and current work frontier;
  duplicating them creates another artifact that can drift.
- A separately invoked reconciliation skill for alignment inside one work unit
  — that alignment is part of outcome completion and becomes optional if
  correctness depends on another installed skill or user invocation, so it
  stays in `implement`. Revision across work units is different: it happens
  between implementations rather than inside one, and `implement`'s load-time
  staleness check keeps correctness from depending on anyone remembering to
  invoke `babysit-specs`.
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
- A generic environment-readiness skill — readiness and state controls belong
  to the runtime that can interpret them, while a separately invoked helper
  would make a required completion gate optional and duplicate orchestration.
- Erasing every simulator or emulator before every runtime check — it spends
  fresh-install cost on claims that need only known app state, disrupts shared
  work, and removes the prior state required to verify upgrades and migrations.
- Treating a whole-device erase as a complete clean environment — host build
  tooling and external backend state remain outside the device reset boundary.
- Pausing for approval when no matching runtime-verification skill is installed
  — the user already authorized the technical implementation path, and skill
  availability does not turn ordinary verification-method selection into a
  product decision.
- Limiting final runtime verification to the changed acceptance criteria — a
  locally correct change can still break the product's primary journey; the
  bounded core loop catches that regression without requiring an exhaustive
  application-wide test on every implementation.
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
- Repeating the automated review until it reports nothing — measured runs did
  not converge, and the reviewers are tuned to surface candidates rather than
  to certify a diff.
- Removing the automated review or making it opt-in — its first pass caught
  user-visible defects that verification did not.
- Fixing one review mode for every change — no observed failure justifies it,
  the single pass already bounds the cost of a deeper mode, and a fixed level
  removes judgment the implementer is better placed to apply.
- Counting an invocation or failed attempt as completed review — it allows a
  finished handoff without the independent inspection the workflow promises.
- Treating a skill's review requirement as user authorization, describing
  service-backed review as no transmission, or requesting the same already
  granted authority again — these obscure the real execution boundary.
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

- A Flyn work unit linked an approved `prototype.html` from `spec.md` and
  recorded 25 screen-state cases checked at three widths, with 98 prototype
  checks passing. The later implementation session listed the artifact but
  never inspected or rendered it, then used device checks of element presence
  and navigation to claim conformance. It missed a detail cover, placed a continue
  action outside its conversation card, omitted location copy, and diverged
  from approved screen compositions. This supports loading the formal handoff
  before source changes, comparing actual screens at the approved coordinates,
  and making unread or uncompared handoff criteria block completion; another
  always-on producer-side review would not address this consumer failure.
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
  justifies it and always retaining the integrated final review.
- Vendor evaluations cited when the context-installation rule was adopted
  measured large gains from version-matched official context and also showed
  that agents frequently failed to invoke an installed skill without an
  explicit routing instruction.
- Claude Code 2.1.226 exposed `/review` as an alias for `code-review`. A live
  invocation entered the automated review process; a forced Skill permission
  denial then handed `/review` to the user. This supports conditional alias
  guidance, not a cross-version assumption.
- Claude Code 2.1.235 `code-review` modes: `low` reads the diff once in the
  calling session with no subagents and at most four findings; `medium` runs
  eight finder subagents plus one verifier per candidate and is tuned for
  precision; `high` keeps that fan-out but is tuned for recall and instructs
  the reviewer to err on the side of surfacing; `xhigh` and `max` add angles
  and a sweep. With no mode given it reuses the last one typed, so the mode is
  named explicitly. Codex 0.147.0 `review` takes custom review instructions and
  has no effort dial.
- One implementation session took 18 minutes to implement and commit, then ran
  five recall-tuned review rounds over 83 of its 102 minutes. Output tokens
  were 113,003 before the first review and 219,304 inside the review rounds;
  each single pass cost 7 to 26 minutes and 22,400 to 34,302 output tokens.
  Findings fell 10, 6, 5, 4, 1 without reaching zero, and a security trade-off
  the spec had already disposed of was re-flagged in every round, ending as the
  last round's only finding. The first pass alone returned 10 findings of which
  8 were real, in scope, and new. This supports one standard pass with triage:
  the first look carries the value, and repetition converged on re-litigation.
- A second session ended when the user interrupted a third repair round for a
  pathological-input defect the orchestrator itself judged not to affect
  ordinary use. A third reported a fully working, runtime-verified product as
  incomplete because its reviewer was user-only. These originally motivated
  the completion fallback; the 2026-09-07 decision below replaces that fallback
  while retaining the one-pass triage rule.
- On 2026-09-07, task `01a079b9-b926-77d3-8332-3f8e522150d5` requested
  `codex review --uncommitted` as read-only with no transmission. Automatic
  approval review rejected it because sending the diff and related context to
  the model service lacked explicit authorization. No code-review result was
  produced, but the skill allowed completion. A separate model evaluation also
  failed because Codex CLI 0.147.0 did not support the selected model. The user
  approved requiring completed review, distinguishing execution failures from
  a spent pass, and accurately reusing existing authorization. This replaces
  completion-on-review-failure, not the prohibition on automatic review loops.
- Three simulated handoff scenarios compared the old and revised instructions.
  Both recovered supplied execution failures and reused supplied authorization.
  Under a denial, the old wording reported completion; the revision kept review
  pending but handed off a manual command instead of asking for permission.
  The explicit permission-request sentence addresses that observed failure. A
  new scenario with a named service and source scope passed with both the
  pre-clarification and final wording. These are instruction-behavior checks
  with supplied tool outcomes, not proof that live approval policy permits a run.
- A user queued nine spec folders in this repository and implemented them one
  at a time. Three of the nine were edited after they were written, always
  inside the implementation commit that changed the code, so no interview
  settled those edits and no skill owned them. One later implementation session
  discovered mid-way that its spec was stale and discarded every change it had
  made. This supports an owner for cross-work-unit revision and a staleness
  check before the first source change, where the same discovery costs nothing.
- A blind three-way routing run on 2026-09-13 separated `babysit-specs` from
  `shape-idea` and `maintain-project-context` on 22 cases at 2 repeats, with
  `shape-idea` loaded as a distractor. `babysit-specs` scored 10 of 10: all five
  revise-after-ship prompts activated it, and its five negatives went to the
  right neighbour or to none. `shape-idea` captured no revise prompt, which is
  why its description keeps no redirect clause and stays unchanged. The one
  failure was a pre-existing `maintain-project-context` retirement prompt that
  activates no skill; a controlled 6-run before-and-after scored 1 of 6 both
  with and without the redirect clause added that day, so the clause is not its
  cause.
- The `resolve-follow-ups` dispatcher test exercises fetched remote ordering,
  atomic claims, stale and changed bases, dirty checkout hooks, interrupted
  claim recovery, terminal evidence, exact worktree ownership, unpublished
  changes, and cleanup. An automated whole-diff review exposed remote-only
  backlog loss, abandoned claims, dirty prepared workers, and lost non-PR
  evidence; the added controls reproduce each failure before accepting the
  corrected lifecycle.
