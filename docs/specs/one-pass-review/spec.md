# One-pass review

## User-visible outcomes

- A user who runs `implement` gets one automated code review at the end, over
  the whole implementation diff, and then a finished handoff. Completion requires
  the review to finish and return a result, unless explicitly waived by the
  user. It never requires repeated reviews until no findings remain.
- The implementer picks the review depth the change warrants and names it. Its
  findings are triaged: only findings that break an approved
  acceptance criterion or are confirmed defects on an ordinary-use path are
  fixed. Everything else is recorded, not fixed, and no second review runs.
- Execution failures are recovered within the authorized scope without using
  up the review pass. Missing permissions, unavailable reviewers, and unresolved
  failures leave review and overall completion pending while the verified
  implementation, evidence, and runnable result remain available.
- Review requests accurately identify the model service and source context,
  reuse applicable user authorization without asking again, and request only
  missing authority. An explicit denial is handled separately from an ordinary
  execution error.
- A finding that needs product judgment or risk acceptance reaches the user as
  a named decision in the handoff, with `human-review` available on request,
  instead of driving fix rounds.
- The same one-pass triage governs a task's declared intermediate review
  checkpoint (assumption A3).
- The pipeline decision contract, the README, `implement`'s evals and Codex
  metadata, `tdd`'s refactor rule, and `split-into-tasks` all describe the same
  semantics, and installed plugin users see a new version.

## Approved scope

### One review pass

After every outcome passes reconciliation and the complete required
verification passes, `implement` invokes the current harness's automated
code-review process on the entire implementation diff against the selected
spec and acceptance criteria. One pass means the reviewer finished inspecting
that scope and returned findings or an explicit no-findings result. An
invocation, partial output, silent exit, or review of another target does not
count. It uses a currently model-invocable reviewer; an earlier session's
user-only restriction does not establish current availability.

The depth is `implement`'s judgment for the change at hand, weighing what the
change touches against what verification already settles. It names the mode
explicitly where the harness offers modes, because a harness given no mode may
reuse an earlier invocation's, and takes the harness's standard mode when
nothing argues either way. In Claude Code that standard mode is
`code-review medium`; Codex has no mode dial. The run stays single at any
depth, and a pass that did not review the intended scope is not spent.

The reviewer is given the spec's approved scope, off-limits areas, remaining
risks, and the relevant decision contracts wherever the harness accepts review
instructions or context, so already-disposed trade-offs are not re-litigated.

### Execution authority and recovery

A review backed by a model service identifies its actual destination and the
diff, spec, and necessary related source context it will receive. Applicable
user authorization accompanies the execution request and is reused without
another approval question. Read-only file access does not imply that processing
stays local. A different service or wider source scope requires any missing
authority; the skill does not create that authority itself.

Command, compatibility, environment, and transient failures are diagnosed and
resolved within authorized scope, then retried. An explicit policy denial
preserves its reason and permits only a materially safer allowed alternative
or a request for the specific authority needed before retrying. Changing tools
or services to bypass the same denial is not recovery. Mistargeted reviews are
retargeted, with no repairs taken from their unrelated findings.
When a model-invocable reviewer lacks user permission, the agent establishes
the destination and source scope and requests that authority. A confirmed
manual command does not replace this permission request.

An unavailable or user-only reviewer, missing permission, or unresolved
execution failure leaves the review pending with an exact blocker and next
required action. Only an explicit user waiver for that review scope permits
completion without its result. A waiver is recorded and never inferred from
silence, a timeout, or a request to finish the implementation.

### Triage

`implement` fixes a finding only when it:

- shows an approved acceptance criterion failing, or
- is a defect in the changed behavior, or a regression the change causes, that
  is confirmed by reproduction in verification or the running product on a
  path ordinary use reaches.

A reviewer's assertion alone is not confirmation. After fixing, `implement`
reruns only the affected verification. It does not invoke the reviewer again
in the same run, including for the fixes.

Every other finding is not fixed in this run:

- an evidenced defect or an open workaround becomes a follow-up through
  `project-knowledge`, or is written directly to `docs/follow-ups/<slug>.md`
  when that skill is absent;
- a trade-off the spec, an accepted remaining risk, or a decision contract has
  already disposed of is noted as disposed;
- a finding outside the approved scope, a style or structure preference, or an
  unconfirmed risk is recorded in the handoff;
- a material consequence the spec leaves open, such as a security trade-off or
  a pathological-input failure, is recorded as a follow-up when it is an
  evidenced defect, named in the handoff as a decision for the user, and
  `human-review` is offered as the way to judge it visually.

### Completion and handoff

Completion requires every acceptance criterion, the reconciliation gates, and
the complete verification, including runtime verification, to pass; each
required review to have completed or been explicitly waived; must-fix findings
to be repaired and reverified; and the review outcome to be recorded in the
handoff. The runnable
product handoff follows as today.

The handoff records the reviewed scope and mode, result or explicit waiver,
which findings were fixed, which were recorded and where, and which await a
user decision. Recorded findings can remain after completion; zero findings
is not the gate. While review is pending, preserve completed outcomes and
provide their verification evidence, runnable result, review blocker, and next
required action. A confirmed user command may supply that action; an
unconfirmed command is never invented. This delivery does not claim overall
completion or silently waive the remaining review.

### Intermediate checkpoints

A task-declared intermediate review checkpoint uses the same rule: one completed
review of the declared cumulative scope, focused on the declared risk, at the same
project-dialed mode, then triage, affected reverification, and no second
round. `split-into-tasks` keeps declaring checkpoints only where risk
justifies them and states that the checkpoint is one bounded pass. Its dependent
work waits until the review is completed and triaged or explicitly waived.

### Aligned surfaces

- `docs/decisions/pipeline.md`: the final-review decision, the intermediate
  checkpoint decision, the portable completion contract boundary, and the
  reconsider conditions this change consumes are rewritten to the semantics
  above; the loop-until-clean gate and removing the review entirely enter the
  rejected alternatives; the measured evidence below enters the preserved
  evidence.
- `docs/decisions/skill-design.md`: completed review is distinguished from
  zero findings, and runnable results remain available during a review blocker.
- `skills/workflow/implement/SKILL.md`, its evals, and its Codex metadata
  describe completed review, triage, authorization reuse, recovery, explicit
  waiver, and the pending-review handoff.
- `README.md`: the pipeline diagram and prose show one review pass with triage
  instead of a zero-findings loop, and show pending review and explicit waiver.
- `skills/workflow/tdd/SKILL.md`: refactoring after green keeps tests green and
  opens no review round of its own; review belongs to the enclosing workflow's
  single pass or to an explicit user request, so the rule stands when `tdd` is
  installed alone.
- `skills/workflow/split-into-tasks/SKILL.md` and its template: a checkpoint is
  one bounded review pass with the same triage.
- `.claude-plugin/plugin.json`: version bumped so installed users update.

## Observable acceptance criteria

- Given a verified implementation and an available model-invocable reviewer,
  `implement` invokes the reviewer once for the whole diff with the mode named
  explicitly, and does not invoke it a second time in that run.
- Given a review that returns an acceptance-criterion break, a reproducible
  ordinary-use defect, an already-disposed trade-off, an out-of-scope file, a
  style note, and an unconfirmed risk, `implement` fixes only the first two,
  reruns only the affected verification, records the others as described in
  Triage, does not run the reviewer again, and reports completion with the
  review evidence entry.
- Given a finding that needs risk acceptance the spec does not settle,
  `implement` records it, names it as a user decision in the handoff, offers
  `human-review`, does not open a fix round, and still reports completion.
- Given a recoverable command, compatibility, or transient failure, `implement`
  resolves it within authorized scope and retries without counting the attempt
  as a pass. A timeout or partial output without a completed result is not review.
- Given a user-only or absent reviewer or an unresolved failure, `implement`
  leaves overall completion pending and delivers verified outcomes with the
  exact blocker and next action, naming only confirmed commands.
- Given prior user authorization for the same model service and source scope,
  the execution request carries it accurately without another approval question.
- Given missing authorization or an explicit denial, the agent states the
  destination, source scope, and missing authority, preserves the denial reason,
  and requests only what is needed. It does not bypass the denied action.
- Given an explicit user waiver for the required review, `implement` records
  that scope and completes if all other criteria pass, without fabricating review.
- Given a change whose risk argues for more or less depth than the standard
  mode, `implement` selects that depth, names it, and still runs once.
- Given a review that returned findings about a different diff than the intended
  one, `implement` corrects the target and runs the pass once rather than
  treating it as spent.
- Given a task with a declared checkpoint, `implement` runs one review of the
  declared scope with the same triage and no second round.
- Given `tdd` in use, refactoring after green triggers no review invocation.
- No active rule in the aligned surfaces counts failed attempts as completed
  review, permits implicit waiver, or repeats completed reviews until clean.
- `claude plugin validate . --strict` passes and the plugin version is higher
  than 0.49.0.
- A forward check on a held-out scenario prompt whose reviewer returns mixed
  findings shows exactly one review invocation, must-fix repairs with
  reverification, recorded non-fixes, and a completion report.

## Settled constraints and rationale

- The gate semantics — completed review or explicit waiver, then triage — hold
  for every user and harness. The depth stays the implementer's judgment because no
  observed failure justifies fixing it, and one pass already bounds its cost.
  This is a convergence fix, not an accommodation for a subscription tier.
- The single review pass stays because first passes caught user-visible bugs
  in the measured sessions: EUC-KR decoding, percent-encoded Korean filenames,
  Enter during IME composition, and an IPv4-mapped IPv6 SSRF bypass. The change
  is the stopping condition, not the review.
- The fallback is the harness's standard mode, not its cheapest, because an
  independent look at the diff is the only thing this step contributes that
  verification and reconciliation do not. A mode that reads hunks inside the
  authoring session gives up most of that independence. Once the loop is
  removed, one pass has a bounded cost at any depth, so the choice can stay with
  the implementer rather than being fixed by the skill.
- Naming the mode is fixed even though the depth is not: a harness given no mode
  may reuse the level from an earlier invocation, so an unnamed mode leaves this
  review's depth to an unrelated past choice.
- Confirmed means reproduced. The harness reviewers are tuned to surface
  candidates, so their output cannot double as a zero-findings gate.
- The review stays inside `implement`; must-fix findings return to
  implementation once. `human-review` is never invoked automatically; it stays
  the user's explicit request.
- Runtime verification and reconciliation keep their completion-gate meaning
  unchanged.
- No second review round, including a review of only the fixes: new evidence
  after a repair comes from verification, and a further reviewer pass
  reintroduces the measured non-convergence.
- Skills stay harness-neutral. Commands appear only as examples the active
  harness confirms, and each skill restates what it needs inline.
- A service-backed read-only review can transmit source context. Accurate
  authorization requests and execution recovery address blocked runs; changing
  completion wording alone cannot grant permission or repair an incompatible CLI.
- The revised wording is checked on a held-out control, because it corrects an
  observed failure.

## Evidence

- Claude Code 2.1.235 `code-review`: `low` is one diff pass with no subagents
  and no full-file reads, skips test and fixture hunks, and reports at most
  four findings; `medium` runs eight finder subagents plus one verifier per
  candidate and reviews for precision; `high` uses the same fan-out, reviews
  for recall, and says catching real bugs matters more than avoiding false
  positives; `xhigh` and `max` add angles and a sweep. With no level given it
  reuses the last level typed. Codex 0.147.0 `review` accepts custom review
  instructions and has no effort dial. Measured per pass in `arm-b-plain`: a
  single reviewer invocation took 7 to 26 minutes and 22,400 to 34,302 output
  tokens. Reopen the default-mode decision if a harness ships a reviewer
  designed to converge, such as a mode that re-verifies only named findings, or
  if a cheap mode gains independent reviewer context.
- Session `arm-b-plain` (Opus 5, 2026-08-12): implementation committed after
  18 minutes; five `code-review high` rounds followed over 83 of the session's
  102 minutes; output tokens were 113,003 before the review gate and 219,304
  inside it. Findings per round fell 10, 6, 5, 4, 1. An SSRF trade-off the
  spec had already disposed of under its local-tool premise was re-flagged in
  every round and was the last round's only finding. The first pass alone
  returned 10 findings, of which 8 were real, in scope, and new.
- Session `run-tasks` (Opus 5, 2026-08-06): the run ended during a third fix
  round for a pathological-input defect the orchestrator itself judged not to
  affect ordinary use, and the user interrupted.
- A Sonnet 5 session (2026-08-10) ended with a working product reported as
  incomplete because the reviewer was user-only. This originally motivated a
  completion fallback, replaced by the decision below.
- On 2026-09-07, task `01a079b9-b926-77d3-8332-3f8e522150d5` requested
  `codex review --uncommitted` with a justification claiming no transmission.
  Automatic approval review rejected it for missing authorization to send the
  source context to the model service. A separate evaluation failed because
  the installed CLI did not support its selected model. No code-review result
  existed, but the old skill still permitted completion. The user approved
  requiring a completed review, separating execution failures from a spent
  pass, and accurately reusing existing user authorization.

## Assumptions

- A1. The skill states depth-selection criteria with the harness's standard
  mode as the fallback, rather than fixing one level. `code-review medium` and
  Codex's dial-free `review` appear as examples of that fallback.
- A2. No new durable review state file is needed. Existing task evidence and
  the handoff distinguish verified outcomes from pending review or explicit waiver.
- A3. Intermediate checkpoints follow the same one-pass triage at the same
  project-dialed mode, with the declared risk as the reviewer's focus. If the
  user prefers to keep a stricter loop at checkpoints, only the checkpoint
  wording in `implement` and `split-into-tasks` changes.
- A4. The exact version number and README diagram wording are implementation
  choices, provided the diagram shows one review pass with triage rather than
  a loop.

## Off-limits

- Removing the automated review pass or making it opt-in.
- A second automated review in the same `implement` run, including a review of
  only the fixes.
- Requiring zero findings, counting failed attempts as review, or silently
  waiving a required review because its execution is blocked.
- Changing global permissions, disabling approval checks, or treating this
  skill as permission to transmit context to an unapproved model service.
- Invoking `human-review` automatically, or treating the review or the runnable
  handoff as human approval.
- Weakening runtime verification or reconciliation.
- Prescribing one reviewer topology or hardcoding one harness's command as the
  contract.
- Fixing already-disposed trade-offs or out-of-scope findings inside the run.
- Adding a durable review ledger or run-state file.

## Deferred points

- Whether `human-review` gains an explicit input path for the decisions the
  handoff names.
- Whether the glossary needs a term separating review evidence from completion
  gates.

## Remaining risks

- One pass may miss defects the measured five-round loop eventually caught.
  Runtime verification, recorded follow-ups, and depth selection mitigate this.
  Reconsider if defects a deeper mode would have caught repeatedly surface after
  handoff.
- Depth selection is model-judged and unmeasured. It may settle on the fallback
  in every case, making the criteria inert, or reach for depth that the change
  does not warrant.
- Triage is model-judged. Over-permissive triage could record real defects as
  follow-ups; the reproduction rule and durable follow-ups mitigate this.
- Reviewer context injection is harness-dependent. Claude Code's `code-review`
  takes a mode, flags, and a target but no free-text instructions, so disposed
  trade-offs may be re-flagged there and cost bounded triage time. Codex
  `review` accepts a prompt.
- Reviewer prompts and modes change across harness versions; the evidence is
  version-pinned.
- A required review can remain blocked by platform policy or missing authority;
  the user receives the verified result and exact prerequisite while it is pending.
- Follow-up volume may grow because more findings are recorded than fixed.
- A3 is applied without direct confirmation.
