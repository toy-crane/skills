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
  explicit blockers. The split also declares only the intermediate independent
  review checkpoints justified by downstream or material risk.
- `implement` executes an unsplit spec or approved task set with one continuous
  write-capable implementation context. Task boundaries are delivery and
  verification checkpoints, not context boundaries. A fresh implementation
  context starts only after an actual interruption makes the original context
  unavailable; it then continues across the remaining tasks.
- Each outcome is complete after its acceptance criteria and focused
  deterministic verification pass. When a task declares an intermediate review
  checkpoint, a fresh read-only reviewer inspects its stated cumulative scope
  and risk before substantial dependent work continues.
- Review findings return to the same implementation context that produced the
  change. That context performs repairs and verification; a separate repair
  worker is not created. Reuse the same reviewer for re-review when possible.
- After every outcome is implemented, rerun the complete deterministic
  verification and perform one fresh read-only review over the entire
  implementation diff. This final cumulative gate applies to split and unsplit
  specs and covers cross-task interactions and omitted requirements.
- Task files hold only durable status plus concise verification or blocker
  evidence. When repository policy calls for commits, code, tests, and the task
  update form one meaningful checkpoint. Do not create state-only commits,
  commit-anchor fields, review counters, or a separate run-state file.
- Context or harness interruption resumes from the specification, task status,
  Git history, current diff, and test results. Preserve completed vertical
  outcomes, keep one implementation owner for the remaining work, and request
  user confirmation before absorbing dirty state of uncertain ownership.
- When shaping settles on a framework or hosted service, install the vendor's
  official agent context in its recommended form. `add-stack-context` is
  model-invoked to audit and install the same context during agent setup, after
  stack changes, and on entering an existing project whose vendor context has
  not been checked.
- Before building a workaround for an external dependency, `shape-idea` checks
  official documentation, issue trackers, and release notes. If no answer
  applies, the spec records what was checked and why it fell short.

## Boundaries

- Discovery reads personal traces only with the user's agreement and normally
  hands off through conversation rather than a new artifact.
- Tasks are vertical, independently deliverable and verifiable, and separated
  only at outcomes that can stand on their own. Work that becomes meaningful
  only when completed together remains one task. A task is not a fine-grained
  implementation to-do list.
- `split-into-tasks` ends when the approved task handoff is current. It does not
  begin implementation or assign implementation contexts.
- The standard implementation workflow has one write-capable owner and follows
  task dependency order. Parallel bulk migrations or explicitly independent
  queues require a separately chosen execution model rather than implicit task
  fan-out.
- An intermediate review is warranted only when delayed review could compound a
  material defect through dependent work, or when deterministic checks cannot
  adequately settle a security, data, permission, migration, recovery, or
  external-contract risk. The existence of a task alone is not sufficient.
- Harness-specific review commands are adapters around the same independent,
  read-only gate. Review supplements rather than replaces tests, branch
  protection, or human approval. Hosted or pull-request review begins only
  after the user authorizes the corresponding remote action.
- Conversation history is useful implementation state while the context is
  active, but is not durable evidence. After a real interruption, repository
  artifacts determine what remains; do not restart completed work from a
  summary or split every remaining task into a fresh context.
- Dirty state is not attributable merely because it matches the active task.
  Preserve unrelated changes and require user confirmation when ownership or
  overlap cannot be established safely.
- Pause when a specification change invalidates an outcome, blocker, or task
  boundary; the same blocker persists without evidence of progress; or
  continuing needs authority the user has not granted. Do not let retries
  expand permission or silently rewrite approved work.
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

While an implementation context is coherent, it already contains the code
model, decisions, failed attempts, and recent verification evidence needed by
the next related task. Replacing it at every boundary pays repeated discovery
and handoff costs and can lose cross-task intent. Actual interruptions still
need durable task and Git evidence, but they do not justify charging that cost
on every successful path.

Deterministic checks establish known behavior. A small number of independent
reviews adds a different signal where hidden risk can compound, while the final
cumulative review catches interactions no isolated task check can see. Keeping
repairs with the implementation owner avoids another lossy handoff. Meaningful
code checkpoints preserve useful recovery points without turning Git and task
files into a second orchestration state machine.

## Reconsider when

- Continuous implementation contexts repeatedly lose relevant decisions before
  a delivery-sized task set completes, despite ordinary compaction.
- Fresh task-by-task implementation contexts outperform the continuous owner on
  held-out completed-work quality or total time rather than only on isolation.
- Selected intermediate reviews regularly cost more than the defects or avoided
  rework they produce, or material defects repeatedly appear before an
  undeclared checkpoint.
- The minimal task state cannot reconstruct real interrupted runs safely.
- Sequential implementation becomes the dominant bottleneck and the user
  chooses a parallel execution model for genuinely independent work.
- Vendor workaround failures are repeatedly observed outside `shape-idea`,
  justifying another standalone carrier for the check-first rule.

## Still-rejected alternatives

- Combining blank-page discovery with `shape-idea` — convergence turns the
  first plausible direction into a premature spec.
- Durable `plan.md` and a plan-writing skill — implementation predictions age,
  while decision-level corrections already have homes in specs, tasks, project
  decisions, or repository instructions.
- Session duration as the task boundary — long-running contexts can remain
  effective, and predicted limits fragment coherent outcomes prematurely.
- A fresh implementation context for every task — it discards useful working
  knowledge and repeats repository discovery even when no interruption occurred.
- Review after every task or edit — it adds fixed context and latency costs
  without requiring a material risk boundary.
- Forbidding every intermediate review — a late permission, migration, or
  external-contract finding can invalidate substantial dependent work.
- A separate repair worker — it makes the implementation owner explain both the
  code and fresh review evidence to another write-capable context.
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

- A held-constant four-task Todo implementation eval completed with one
  continuous implementation context, one selected intermediate reviewer, and
  one final reviewer in 31m43s with five meaningful commits and no state-only
  commits. Both reviews found distinct blocking security issues that the same
  implementation context repaired; full deterministic and browser verification
  passed.
- On the same task boundaries, the previous fresh-worker protocol was still
  incomplete after 57m49s, with 23 commits including 16 state-only commits and
  at least 15 child-agent invocations. A continuous final-review-only variant
  completed in 32m47s, so the new workflow's speed difference from a plain
  continuous owner remains within single-run noise; the evidence supports
  removing fixed orchestration overhead, not claiming intermediate review makes
  implementation faster.
- A two-implementation-context variant completed in 37m40s but failed the
  external flow because its Markdown handoff omitted required title and author
  context, illustrating that a seemingly clean task boundary can lose product
  intent.
- Vendor evaluations cited when the context-installation rule was adopted
  measured large gains from version-matched official context and also showed
  that agents frequently failed to invoke installed context without an explicit
  routing instruction.
