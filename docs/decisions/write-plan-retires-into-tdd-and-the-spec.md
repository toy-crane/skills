# write-plan retires; its seam rule goes to tdd and off-limits to the spec and task files

[jit-planning-with-optional-to-plan](jit-planning-with-optional-to-plan.md)
justified plan.md not as information transport but as bait: a concrete draft
draws out the user's corrections, and those corrections are the only cargo the
document carries across time. That reasoning stands. What it does not
establish is that plan.md is where the corrections belong.

Sorted by how long they stay true, the corrections leave almost nothing
behind. A correction that changes what the product must do goes to spec.md —
write-plan's own contract already said so, in the verbatim line about
decision-level divergence flowing back. A correction true of every unit of
work goes to the always-loaded file. A correction true only while one task
runs goes to that task's file. What remains is the choice among approaches
that all satisfy the spec, which has no home in spec.md and matters only when
several sessions must agree on it — and the skill that runs at exactly that
moment is
[session-grain-tasks-via-split-into-tasks](session-grain-tasks-via-split-into-tasks.md).
For work one session implements, plan mode draws out the same corrections
against fresher code and writes nothing.

The evidence gap is the other half. jit-planning-with-optional-to-plan closed
by deferring evals to first real usage; none was ever written. shape-idea,
discover-opportunity, build-prototype, and explain-visually all carry evals.
This was the only pipeline skill justified by reasoning alone, which is why it
never became convincing.

Applying the test in
[explain-visually-keeps-only-the-counter-defaults](explain-visually-keeps-only-the-counter-defaults.md)
— keep only what the model does not already do — leaves three lines in the
body. The map contract, "name modules and behavior, never file paths", the
session-grain rule, and self-gradeable acceptance criteria already live
verbatim in split-into-tasks; draft-first, one question per turn with a
recommended answer, the standing veto, and vendor agent context live in
shape-idea; the rest describes what a current model does unprompted.

The one-page ceiling is dropped rather than moved. Length is a symptom: a
three-page spec is long because it carries background and architecture the
code already holds, which "the spec holds decisions, not implementation
instructions" already excludes. And explain-visually-keeps-only-the-counter-defaults
recorded what compressing a text by a length rule produces — sentences
carrying no instruction, referents floating free, a body that had to grow back.

The seam rule moves to tdd, reworded. "The fewer and higher they are" is not
carried over: it contradicts tdd's own sentence about testing effort landing
on critical paths and complex logic, and it presumes seams already exist, so
it says nothing about a new module. The replacement judges a seam by whether
its name will outlive the refactoring — a use case or a domain concept, never
a helper that fell out of today's implementation — which decides brownfield
and greenfield with one test.

Off-limits splits by lifetime. What bounds the work goes in spec.md; what is
true only while the task runs goes in the task file. Both are asked for
explicitly, because ownership boundaries and other people's in-flight work are
invisible in the code and a model will not infer them.

## Considered Options

- **Keep write-plan, narrowed to delegation and multi-session work**
  (rejected): that is the only trigger that survived the sort above, and
  split-into-tasks already runs at that moment. A skill whose whole trigger is
  another skill's precondition is a section of that skill.
- **Fold plan.md into spec.md** (rejected): the spec holds decisions, and an
  approach chosen among spec-satisfying alternatives is not one. Mixing them
  puts implementation predictions inside the document later sessions read as
  settled.
- **Move the one-page ceiling to the always-loaded file** (rejected): wrong
  instrument for the failure, and explain-visually-keeps-only-the-counter-defaults
  is the evidence against it.
- **Move the seam rule verbatim into tdd** (rejected): "fewer and higher"
  collides with the critical-paths sentence already there, and leaves the
  greenfield case unanswered.
- **Run the A/B eval before deciding** — one spec cut into tasks, implemented
  with and without plan.md, measuring whether approaches diverge (rejected for
  now): the cheaper test is to run the next few units without a plan and
  record where sessions diverged. If they do, this record is what gets
  superseded.

## Consequences

`skills/write-plan` leaves the published set, `plugin.json`,
`marketplace.json`, the `.claude/skills/` symlinks, and the README path
diagram, which now runs shape-idea → split-into-tasks. Version 0.21.0.

tdd gains a "reuse a seam before creating one" paragraph, and loses the
plan.md conditional from its pre-agreed-seams rule, from the following
question, and from `agents/openai.yaml`; the README entry follows. shape-idea's
closing gains off-limits areas. split-into-tasks' task files gain the
short-lived kind and stop taking plan.md as an input. GLOSSARY drops the
**Plan** term, drops plan.md from **Spec folder**, and adds off-limits areas to
**Spec**. The always-loaded file drops write-plan from the stack-context
sentence and the naming list; the fact that `/plan` is reserved by both
harnesses keeps its own sentence, since it still governs naming.

In the index this line replaces three: jit-planning-with-optional-to-plan and
plan-draft-lands-on-disk-before-review under Pipeline, whose subject is gone,
and draft-plan-becomes-write-plan under Naming, which named a skill that no
longer ships. All three keep their files and are reached from here.
agent-context-installs-at-stack-confirmation-and-setup stands, but its line
drops "planning" as an install site; shaping and add-stack-context remain.
Records are not rewritten.

explain-visually's second eval asked why write-plan and not draft-plan. It now
asks why shape-idea and not write-spec
([shape-idea-names-the-work](shape-idea-names-the-work.md)) — the same rename
shape, on a skill that still exists.

No eval was run for this decision. The test is the next few units of work: if
sessions cutting from one spec diverge on approach, the plan document comes
back.
