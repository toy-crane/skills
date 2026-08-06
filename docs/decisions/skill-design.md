# Skill design

## Decisions

- A published skill states its goal, constraints, and completion criteria, then
  leaves situational method to the model.
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
- `human-review` routes human attention by the commitment a change introduces,
  not by file type or technical layer. Human review is warranted when a new
  product behavior, access boundary, data transformation, external contract, or
  recovery posture would be costly if wrong, hard to reverse, or hard to verify
  automatically. AI handles mechanically checkable defects and presents a
  concise change summary, zero to three human questions, the actual result, and
  evidence only on demand.
- Before `human-review` compresses a change, it accounts for every changed
  commitment as summary, human question, mechanical issue, or unverified. The
  complete disposition stays behind the evidence path; release blockers and
  material unknowns remain visible in the overview. This fixed coverage check
  prevents compression from making an omitted change invisible.
- A result labeled observed must come from the named change in a real runnable
  environment and retain its change reference, route or command, and environment.
  A mock or intended UI cannot stand in for the product result. When more than
  three human questions remain, the current surface names the deferred
  commitments instead of hiding them behind an anonymous count.

## Boundaries

- Instructions may constrain outcomes and safety without prescribing a fixed
  sequence.
- UI metadata must continue to match the skill after a substantial edit.
- Eval outputs are disposable; stable prompts and assertions may remain so later
  pruning can rerun the experiment.

## Why

Skill context competes with the user's task, repository context, and other
instructions. Procedures the model already performs reduce adaptability and add
tokens without changing behavior. The durable value is the counter-default: a
constraint tied to an observed failure or project-specific truth.

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
