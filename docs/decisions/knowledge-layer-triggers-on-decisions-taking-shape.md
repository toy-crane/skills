# knowledge-layer triggers on decisions taking shape, not on a design phase

The description is the skill's only autonomous-loading lever: shape-idea and
build-prototype call it by name, and every other path loads it only when the
description matches. The shipped window, "while the domain is being worked
out", cut that match two ways — by phase, reading as design-time only, and by
subject, since a technical choice does not read as "domain"; the word is a
leftover of the DDD frame that domain-modeling-becomes-knowledge-layer
already left behind. The cost concentrated on the plan-mode path:
write-plan-retires-into-tdd-and-the-spec keeps planning just-in-time in plan
mode, where decisions with real alternatives settle and nothing invokes this
skill by name. A decision that settles there is captured only if the
description fires.

The trigger criterion moves from phase to activity. Sentence 2 now fires
whenever the project's terms or decisions are taking shape — the three
shipped signals plus "a plan weighing approaches" — in any kind of session,
and sentence 3's guard names executing already-settled decisions alongside
vocabulary lookup. Sentence 1 and the three-sentence identity/trigger/guard
architecture stand. Capture rides approval points that already exist — a plan
presented for approval, a shaping close, a reviewed diff — and the durable
write stays the one the loaded body already makes: the record and its index
line, the glossary entry. The plan text itself still stores nothing.

A trigger eval chose the wording. Twenty realistic queries — ten that must
load the skill (plan-mode weighing in two languages, a direction settling
mid-conversation, a term conflict, a concept needing a name, a mid-execution
fork brought back to the user) and ten near-misses that must not (vocabulary
lookup, executing an approved plan, a compact-decisions-shaped cleanup,
trivial naming) — each run three times per description on claude-fable-5,
the skill registered as a command in a scratch project, a load counted at
any point in the turn. The shipped wording passed 10/20: seven loads of
thirty on the must-load side, zero on every plan-mode query, and a 3/3
over-fire on the cleanup near-miss. The new wording passed 12/20: eight
loads including every plan-mode query at least once, over-fire down to one.
Both under-trigger badly against the pass bar; the change is directionally
right and known to be insufficient alone.

## Considered Options

- **Keep the phase window** (rejected): 10/20 on the eval, with the
  must-load side effectively dead outside glossary conflicts — the skill in
  practice answered only to explicit terminology trouble, which is the
  under-capture this record exists to fix.
- **A pushier, duty-stating sentence 2** (rejected): "a settling term or
  decision must be captured in the layer at the moment it settles, so load
  this skill whenever one is taking shape" scored 11/20 with five must-load
  loads, against a verdict rule pre-registered before results — ship only at
  passes ≥ 12, over-fires ≤ 1, loads > 8. One query jumped to 3/3 while five
  others dropped to zero: pushiness reshuffled which cases fire instead of
  raising the floor.
- **Teach the body to write record candidates into plan documents**
  (deferred, not rejected): thin-skills-over-fixed-procedures gates a fixed
  procedure on a repeated, observed failure, and none is observed. If
  sessions load the skill and still close without a record, this is the
  named next candidate.
- **Judge by first-action detection** (rejected for the verdict): stock
  run_eval fails a query the moment the session's first tool call is not the
  skill, and a background discipline naturally reads the project's files
  first. Under that bar the old wording scored 11/20 and the new 10/20,
  noise around a floor; kept for completeness.

## Consequences

`skills/knowledge-layer/SKILL.md`'s description, the README entry, and
`skills/knowledge-layer/evals/trigger-evals.json` carrying the twenty
queries; `docs/specs/knowledge-layer-description/` retires when this ships.
Version 0.25.0. Eval outputs live outside the repo — rerun rather than
re-read them, and rerun before believing a surprising result: the evidence is
one model at three runs per query, and the cleanup near-miss ran in an
environment with no compact-decisions present to win the routing. The
standing risk is unchanged by the win: loading is necessary, not sufficient,
and both wordings under-trigger against the pass bar. If models improve,
re-prune per explain-visually-keeps-only-the-counter-defaults; if plan-mode
sessions load the skill and still lose decisions, the deferred body
instruction returns.
