# knowledge-layer description: trigger criterion rewrite

The description is knowledge-layer's only autonomous-loading lever: shape-idea
and build-prototype invoke the skill by name, but on every other path the model
loads it only when the description matches. The shipped trigger window, "while
the domain is being worked out", narrows that match two ways — by phase (reads
as design-time only) and by subject (technical choices do not read as
"domain", a leftover of the DDD frame that
domain-modeling-becomes-knowledge-layer already left behind). Meanwhile
write-plan-retires-into-tdd-and-the-spec keeps planning just-in-time in plan
mode, a doctrine-approved path where decisions with real alternatives settle
and nothing invokes this skill by name. Decisions settling there are captured
only if the description fires, and today it often will not.

## Confirmed decisions

1. **The trigger criterion moves from phase to activity.** Fire when the
   project's terms or decisions are taking shape, in any kind of session — a
   shaping conversation, a plan weighing approaches, a direction settling
   mid-conversation. Session type and design-phase framing leave the
   criterion entirely.
2. **Capture rides existing approval points; no new interruption is added.**
   The moments this skill is expected to be loaded are moments someone already
   reads and approves something: a plan being written (record candidates land
   in the plan and are approved with it), a shaping session closing, the diff
   a solo session sends for review. The description change is what makes the
   plan-mode moment reachable; the body is not changed to enforce this.
3. **Execution stays non-triggering.** Implementing an already-settled
   decision is named in the guard alongside vocabulary lookup. A fork that
   surfaces mid-execution is not silently decided and recorded; it goes back
   to the user, and triggering applies to that conversation, not to the
   execution around it.
4. **The three-sentence architecture stays.** Identity / trigger / guard;
   sentence 1 is untouched.
5. **Wording is validated by a trigger eval, not by argument.** skill-creator's
   run_eval compares the shipped description and the new one on a single
   scenario set — positives include plan-mode decision weighing; negatives
   include vocabulary lookup, executing an approved plan, and a
   compact-decisions near-miss. The set persists in
   `skills/knowledge-layer/evals/trigger-evals.json`. Precedent for retiring
   and keeping wording on evidence: explain-visually-keeps-only-the-counter-defaults.

Draft wording (sentence 2 and 3 may be adjusted only within decisions 1–4 if
the eval fails; the criterion itself is settled):

> A background discipline: trigger whenever the project's terms or decisions
> are taking shape — a concept getting named, a term turning fuzzy or
> conflicting with GLOSSARY.md, a decision with real alternatives settling, a
> plan weighing approaches — in any kind of session, whether or not the user
> asks. Reading the glossary for vocabulary is not a trigger, nor is executing
> already-settled decisions; load only when the layer itself may change.

## Rationale

- The intent that survived every rebuttal round: important decisions must not
  be lost to session boundaries.
- "The pipeline routes important decisions to shaping" fell to the plan-mode
  path: shape-idea is not mandatory, plan mode is, effectively.
- Moment-by-moment settling detection is unreliable, so capture anchors to
  checkpoints where surviving decisions are already visible (a plan taking
  shape, work being reviewed) rather than to mid-conversation instants.
- Record-worthiness filtering (unit-scoped vs standing position, index
  pollution) is the post-load three-condition test's job, not the trigger's.

## Assumptions (standing veto)

- Background mode and "whether or not the user asks" stay; the naming class
  (discipline noun) is untouched.
- The SKILL.md body is untouched in this unit of work.
- Bulk maintenance of the layer remains compact-decisions' job.

## Off-limits

- Other skills' text, including shape-idea's and build-prototype's invocation
  lines.
- The body's three-condition record test.
- The vendored `.agents/skills/writing-great-skills` skill.
- plugin.json beyond the version bump.

## Deferred

- A session-close sweep for long solo runs (collect decisions at wrap-up) —
  a different mechanism (hooks or implementing-skill text), not this unit.
- Teaching the body to put record candidates inside plan documents — deferred
  until a real failure is observed, per thin-skills-over-fixed-procedures.

## Remaining risks

- The eval proves the wording triggers on scenarios, not that real sessions
  capture every decision; a direction that settles in passing conversation can
  still slip by. Accepted: the goal is guaranteed capture on approval-point
  paths, not total capture.
- Evidence is one model at a few runs per query; rerun before believing a
  surprising result, as the explain-visually eval record advises.
- A wider trigger can still over-fire in noisy implementation sessions; the
  negative cases bound this but do not eliminate it.
