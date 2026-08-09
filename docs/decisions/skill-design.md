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
- Put trigger conditions in frontmatter descriptions. `project-knowledge`
  triggers when project terms are being clarified or choices that may constrain
  future work are being considered or settled in any session, including
  planning, but not for lookup or execution of settled work.
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
- `human-review` routes human attention by the commitment a change introduces,
  not by file type or technical layer. It activates when the user explicitly
  asks to inspect actual outcomes and judge unresolved commitments or material
  consequences; completion, size, or consequence alone does not trigger an
  automatic handoff. AI handles mechanically checkable defects and presents a
  concise change summary, zero to three active human questions, the actual
  result, and evidence only on demand.
- Before `human-review` compresses a change, it accounts for every changed
  commitment with a review disposition of summary, human question, or mechanical
  issue and an evidence status of observed, inferred, or unverified. Material
  implementation choices and consequences left open by the governing request or
  decisions remain unresolved. The complete coverage stays behind the evidence
  path; release blockers and material unknowns remain visible in the overview.
  This fixed check prevents compression from making an omitted change invisible.
- A result labeled observed must come from the named change in a real runnable
  environment and retain its change reference, route or command, and environment.
  A mock or intended UI cannot stand in for the product result. Missing evidence
  alone does not become a human question. When more than three human questions
  remain, the current surface names every deferred commitment and brings them
  forward as earlier questions are resolved.
- Browser verification completes the temporary review surface, not the product
  change. Human choices become resolved only through an explicit conversational
  response; the temporary surface is not a canonical project decision record.

## Boundaries

- Instructions may constrain outcomes and safety without prescribing a fixed
  sequence.
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
layer and consequential commitments elsewhere. The remaining human value is to
validate intent, supply project context, and accept or reject risks that automated
checks cannot decide.

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
- Compressing instructions into aphorisms — short text with floating referents
  can lose executable meaning even when its argument is correct.
- Exhaustive diff summaries, review-time estimates, severity codes, and
  layer-based review queues for `human-review` — they spend the limited attention
  the skill exists to protect without identifying the decision a human owns.

## Evidence worth preserving

- A trigger eval showed the phase-based `project-knowledge` description missing
  all plan-mode decision queries; activity-based wording improved routing while
  remaining imperfect, so trigger prompts stay in the repository.
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
