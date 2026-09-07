# Skill design

## Decisions

- A published skill states its goal, inputs, actions, and completion criteria in
  positive terms, then leaves situational method to the model.
- Use prohibitions only when they protect a real authority or safety boundary or
  prevent a repeated observed failure. Express ordinary constraints as the
  behavior the agent should produce.
- A fixed procedure must name a repeated, observed failure it prevents. Remove
  the procedure when improved models handle that failure without instruction.
- Point at real artifacts instead of paraphrasing them. Keep detailed material
  in a referenced resource and load it only when needed.
- Every published skill is self-sufficient because skills may be installed one
  at a time. Restate a required constraint inline instead of assuming another
  skill's text is available.
- `resolve-follow-ups` keeps intent, reproduction, and reporting guidance in
  its standalone skill while a bundled dispatcher owns the low-freedom
  operations whose races are costly: fetched ordering, attempt identity,
  atomic ownership, worktree binding, terminal state, recovery, and cleanup.
- An orchestration skill may use an available specialized skill whose trigger
  matches the current surface, while retaining the outcome itself when that
  specialist is absent. `implement` applies this to runtime verification rather
  than depending on a generic verification dispatcher.
- Put trigger conditions in frontmatter descriptions. `project-knowledge`
  triggers when project terms are being clarified, when choices that may
  constrain future work are being considered or settled in any session including
  planning, or when a session applies a temporary workaround whose root cause
  stays open or observes an out-of-scope defect with evidence, but not for
  lookup or execution of settled work.
- `project-knowledge` owns the follow-up criteria, format, and lifecycle.
  Execution skills carry only a routing sentence to it plus a compressed inline
  fallback, so a standalone install still records the item.
- Evaluate suspected counter-defaults against realistic prompts. When wording is
  revised after seeing a failure, test the revision on a new held-out control.
- Git delivery skills state the requested repository outcome, the authority the
  request grants, the state that must be preserved, and the evidence required
  for completion. They leave ordinary Git command selection to the model.
- `commit`, `pull`, `push`, `pr`, and `merge` each stand alone. The broader
  skills perform their necessary local Git work directly rather than assuming
  that a separately installed skill supplied missing instructions.
- Deterministic Git helpers earn their fixed procedure only where ownership is
  unsafe to infer. The merge helper stops only active Portless route processes
  whose operating-system working directory is inside the linked worktree, and
  verifies their exit; host-specific worktree UI commands remain outside the
  published contract.
- Pull request bases come from the user's request or the remote's advertised
  default branch. Git delivery skills do not assume that `main` exists when the
  repository uses `master`, `trunk`, or another default.
- A push publishes existing commits and leaves dirty changes local. A pull
  preserves dirty work rather than silently committing, stashing, or discarding
  it. PR and merge requests authorize the in-scope commits needed to complete
  their larger outcomes.
- `human-review` helps the human understand AI-authored repository work, inspect
  actual results and supporting evidence, and independently examine assumptions
  or implementation choices, including those the AI considers settled. Human
  understanding is a central review outcome; resolving open product decisions
  is one possible result. It activates when the user explicitly asks to
  understand and inspect the work; completion, size, or consequence alone does
  not trigger an automatic handoff. AI handles mechanically checkable defects
  and makes the behavior, mechanisms, and consequences needed for human
  inspection understandable. The zero-to-three active-question limit applies
  to unresolved product decisions, not to the scope of inspection or discussion
  needed to understand the work.
- `human-review` reduces the effort of reconstructing context, finding evidence,
  and connecting changes so the human can spend attention on understanding and
  judgment across sessions. On entry, reconnect the work to the request and
  settled intent, and distinguish what changed since the human's known prior
  context. Present a coherent behavior with its before-and-after relationship
  and supporting evidence, while keeping its place in the whole change visible.
  Let the human explore beyond the AI's suggested focus and adjust depth to
  unfamiliar parts. Use questions at consequential assumptions or boundaries
  rather than requiring an acknowledgment after every explanation.
- A review that is interrupted preserves the inspected scope, open questions,
  and next useful action. When the underlying change advances, identify which
  prior observations need revisiting. Keep inspected scope separate from
  acceptance, and derive prior understanding or acceptance only from what the
  human actually expressed. Evaluate the workflow through the human's ability
  to explain behavior, notice unflagged assumptions, and resume after a switch,
  alongside the effort it takes to review.
- Before `human-review` compresses a change, it accounts for every changed
  behavior: what to explain, what needs a product decision, and any confirmed
  defect. Separately record what was observed, inferred from source, or remains
  unverified. Important choices and consequences left open by the request or
  project decisions remain unresolved. The complete list of changes stays
  accessible; release blockers and important unknowns remain visible in the
  overview.
  This fixed check prevents compression from making an omitted change invisible.
- A result labeled observed must come from the named change in a real runnable
  environment and retain its change reference, route or command, and environment.
  A mock or intended UI cannot stand in for the product result. Missing evidence
  alone does not become a human question. When more than three human questions
  remain, the current surface names every deferred decision and brings them
  forward as earlier questions are resolved.
- Browser verification completes the temporary review surface, not the product
  change. Human choices become resolved only through an explicit conversational
  response; the temporary surface is not a canonical project decision record.
- `human-review` chooses the smallest useful representation. Simple reviews
  can stay in conversation; comparison, navigation, or continued review may
  warrant HTML. Its template keeps behavior explanations available even when no
  product decision is open. Use concrete actions and outcomes in instructions
  and visible labels, keeping necessary technical names in context.
- `build-prototype` and HTML output from `human-review` use the same
  host-independent handoff: run the finished HTML using a method supported by
  the current harness and share an address the user can open. This delivery
  contract is separate from browser verification and each skill carries it
  directly.
- `implement` requires one completed and triaged automated review, unless the
  user explicitly waives it. Failed execution supplies no review evidence.
  It also owns the runnable product handoff after its acceptance criteria pass,
  including while review is pending with a named blocker. When the repository
  exposes
  the actual result through a user-reviewable local server, run and verify the
  changed routes and states, share an address, and keep the current checkout's
  server available until review finishes or later delivery cleanup, without
  disrupting another checkout or unrelated process. This access is not
  `human-review` and does not imply human approval.

## Boundaries

- Instructions may constrain outcomes and safety without prescribing a fixed
  sequence.
- Use a deterministic bundled script when concurrency or destructive lifecycle
  operations require atomic ownership and exact target verification.
- Prefer executable positive direction over lists of forbidden actions.
- UI metadata must continue to match the skill after a substantial edit.
- Eval outputs are disposable; stable prompts and assertions may remain so later
  pruning can rerun the experiment.

## Why

Skill context competes with the user's task, repository context, and other
instructions. Procedures the model already performs reduce adaptability and add
tokens without changing behavior. The durable value is the counter-default: a
constraint tied to an observed failure or project-specific truth.

Positive direction keeps attention on the result the agent must produce.
Unnecessary prohibitions narrow useful judgment, duplicate harness policy, and
make a skill brittle across capable models.

AI output can grow faster than human review capacity. Prioritizing API, database,
UI, or another layer categorically misses both harmless changes in a sensitive
layer and consequential commitments elsewhere. Human review needs enough
understanding of the work to uncover mistaken assumptions and mismatches with
intent, including ones the AI did not flag. The user reported granting approval
without understanding the work. Limiting the review to AI-selected unresolved
decisions can leave that failure intact even when the user explicitly agrees.
Actual results and evidence support this understanding as well as decisions
about product intent, local context, and acceptable risk.

The user switches between AI work sessions and reports that reconstructing
context consumes attention and lowers review quality. The review therefore
needs continuity as well as an understandable explanation. Research on
[programming task resumption](https://www.microsoft.com/en-us/research/publication/evaluating-cues-for-resuming-interrupted-programming-tasks/)
and [the cost of verifying AI predictions](https://arxiv.org/html/2212.06823v2)
motivates this direction; the resulting multi-session review experience still
needs evaluation with the user on actual changes. Easier reading or an explicit
approval alone is insufficient evidence of better review.

## Reconsider when

- A surviving procedure no longer changes outcomes in forward tests.
- A trigger description under- or over-fires on realistic routing evals.
- A task becomes fragile enough that deterministic scripts or a fixed sequence
  are safer than open-ended instructions.

## Still-rejected alternatives

- General step-by-step workflows — capable models already explore, plan, and
  verify without being forced through a universal sequence.
- Predicted failures as justification for permanent procedure — guardrails earn
  their context cost from observed behavior.
- Relying on another installed skill — skills.sh users may possess only the
  current skill.
- A `run-server` skill as an `implement` dependency — it names a technical
  mechanism rather than the handoff outcome and breaks standalone installation;
  reconsider a separately invokable preview skill only if users repeatedly need
  the same lifecycle outside implementation.
- A generic verification skill as an `implement` dependency — framework skills
  own their distinct runtime loops, while `implement` already owns selection and
  the completion gate.
- Compressing instructions into aphorisms — short text with floating referents
  can lose executable meaning even when its argument is correct.
- Exhaustive diff summaries, review-time estimates, severity codes, and
  layer-based review queues for `human-review` — they spend the limited attention
  the skill exists to protect without making behavior, mechanisms, or
  consequences easier for the human to understand and inspect.

## Evidence worth preserving

- Executing the human-review Todo fixture showed that clearing writes storage
  but reloading restores the hardcoded list. Its old evaluation expected local
  persistence and irreversible clearing without establishing either. The
  revised case requires the reload observation and keeps the demonstrated
  defect separate from the choice about undo behavior.
- A trigger eval showed the phase-based `project-knowledge` description missing
  all plan-mode decision queries; activity-based wording improved routing while
  remaining imperfect, so trigger prompts stay in the repository.
- Adding the discovery-time clause to that description scored 29 of 29 on a
  shuffled blind routing run, with the original 21 prompts unchanged and all
  eight new discovery and noise prompts correct. Two of the new prompts were
  held out of the wording work.
- A blind routing check separated `expo-smoke-test` from `expo-dev-loop` on
  eight prompts, run twice with the two descriptions presented in opposite
  order to control for position bias: 16 of 16 correct. Single-target edit
  checks routed to `expo-dev-loop`, both-platform and pre-delivery checks and
  an explicit core-loop regression routed to `expo-smoke-test`, and two
  non-verification prompts activated neither. The deciding wording is the
  closing redirect sentence in `expo-smoke-test`'s description.
- An explain-visually pruning eval found most form-selection instructions inert
  but retained the over-rendering brake. Later renderer testing required fresh
  held-out controls because each revised clause fitted the prompt that produced
  it.
- A fresh `human-review` audit found a fixed five-step queue duplicating the
  template contract and conflicting with this file's situational-method rule, so
  the skill now states selection constraints while the asset owns presentation
  detail. A separate stress test found that a short surface could hide omitted
  commitments and that a hand-drawn UI could be mistaken for evidence, producing
  the coverage and provenance rules above.
- An initial forward run left template placeholders while claiming browser
  verification, so the asset now renders a blocking incomplete-template banner
  until its guard is removed. Held-out Todo, API and invoice runs then preserved
  real provenance, kept mechanical release blockers out of the human queue, and
  produced zero to two human questions without leaving template residue.
- A zero-question control later called its review complete while browser
  verification was unavailable. Browser verification is therefore an explicit
  completion gate: an unchecked surface remains a draft. A fresh isolated
  control found an installed headless browser, verified overview, evidence,
  disclosures and a narrow viewport, and only then reported completion.
- A later section-by-section `human-review` audit separated review disposition
  from evidence status, treated specification silence as unresolved, and defined
  three questions as the active set rather than the total scope. Fresh controls
  kept a text-only summary out of the visual workflow, separated two newly
  introduced account-deactivation policies from a mechanical blocker and
  unverified production evidence, and presented five decisions as three active
  questions plus two named deferred commitments. The account control passed
  browser verification; the five-question control correctly remained an
  unverified draft when browser verification did not finish.
- Two held-out forward runs exercised the revised `implement` review text on a
  fixture whose implementation carried two planted defects. Given six findings
  of mixed kinds, the run repaired only the acceptance-criterion break and the
  reproducible ordinary-path defect, reran the affected verification, left the
  spec's already-disposed streaming trade-off unrepaired and unrecorded, wrote
  the out-of-scope defect to `docs/follow-ups/`, kept the style note and an
  unreproducible suspicion in the handoff, invoked no reviewer, and reported
  completion. The second run, told to establish reviewer availability itself,
  invoked `code-review medium` once and got a review of the session's working
  directory rather than its own repository; it detected the mismatch, repaired
  nothing from it, reported the review as producing no evidence about its diff,
  and still reported the verified work complete. That earlier wording separated
  repair from record but also allowed an unusable review to satisfy completion.
  The 2026-09-07 pipeline decision replaces that completion fallback.
- Compressing that review text from 54 lines to 37 kept every behavior eight
  Sonnet runs checked — counting a declared checkpoint and the final pass as
  two reviews and no more, handing off a user-only reviewer with only the
  commands the session confirmed, triaging six mixed findings to their separate
  dispositions, refusing an explicit request to re-review a spent scope, and
  taking the standard mode for a runtime-verified UI change. Two sentences
  broke because compression removed their reasoning while keeping their
  conclusion. Depth selection chose a cloud mode the model cannot invoke once
  "prefer a model-invocable reviewer" was cut, and the wrong-scope rule went
  unapplied because it never named the signal that detects the case. Bounding
  the choice to invocable modes and naming the signal — findings citing paths
  the change does not contain — fixed both, confirmed on fresh held-out
  scenarios: a one-shot production migration drew the deepest invocable mode
  with the cloud mode offered rather than selected, and a notifications change
  reviewed as the payments module was separated from an ordinary out-of-scope
  finding. A conclusion without its reason survives compression as text and not
  as behavior.
- Baseline `build-prototype` and `human-review` controls created and sometimes
  browser-verified their temporary HTML while still returning only a file path,
  offering to run it later, or never reaching a usable link. Isolated post-build
  controls showed that a single host-independent outcome sentence makes both
  harnesses run the HTML and return an address.
- An earlier workflow-pruning eval reduced `implement` from 78 to 29 lines and
  `split-into-tasks` from 102 to 38 while preserving task boundaries, selected
  and final reviews, meaningful commits, full verification, and safe
  interruption handling. A later review removed the remaining implementation
  context and universal reviewer mechanics because no observed default failure
  justified prescribing them. The first split draft failed to update shared
  spec constraints and invented an unsettled audit policy; one narrow constraint
  and a fresh webhook control corrected both. A separate stock-reservation
  control caught and fixed the pre-existing `complete` versus `completed` state
  drift.
- The imported Git skill bodies were reduced from 464 to 137 lines while
  retaining authority, preservation, remote-state, and completion contracts.
  The first routing runner incorrectly converted failed Claude invocations into
  empty selections, so those scores were discarded. After invalid runs became
  explicit failures, a fresh one-pass suite scored 81 of 112 prompts with zero
  invalid invocations: all 56 negative prompts avoided false activation, while
  only 25 of 56 positive prompts activated implicitly. Descriptions therefore
  remain concise and direct invocation is the reliable route. The worktree
  server helper passed seven isolated ownership and failure cases, then
  preserved a live Portless process owned by another repository worktree.
