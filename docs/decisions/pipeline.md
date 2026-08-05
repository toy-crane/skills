# Pipeline

## Decisions

- `discover-opportunity` is an explicit blank-page phase before shaping. It
  finds possible directions from user-approved traces and relevant external
  change; it does not choose an MVP or detailed product behavior.
- `shape-idea` starts from a concrete problem and broad direction, closes or
  defers material decisions, and writes the implementation-ready spec.
- Implementation planning is just-in-time against current code. There is no
  separate plan-writing skill or durable `plan.md` lifecycle.
- A spec with multiple outcomes that should be implemented and reviewed
  separately is split by `split-into-tasks` into the fewest independently
  deliverable vertical tasks with explicit blockers.
- When shaping settles on a framework or hosted service, install the vendor's
  official agent context in its recommended form. `add-stack-context` provides
  the same capability on demand during project setup.
- Before building a workaround for an external dependency, shape-idea checks
  official documentation, issue trackers, and release notes. If no answer
  applies, the spec records what was checked and why it fell short.

## Boundaries

- Discovery reads personal traces only with the user's agreement and normally
  hands off through conversation rather than a new artifact.
- Tasks are vertical, independently deliverable and verifiable, and separated
  only at outcomes that can be implemented and reviewed on their own. Work that
  becomes meaningful only when completed together remains one task. A task is
  not a fine-grained to-do list.
- `split-into-tasks` ends when the approved task handoff is current. Subsequent
  execution consumes that handoff through the repository's normal workflow.
- Work-unit product constraints belong in `spec.md`; constraints that expire
  with one task belong in that task file. A settled constraint that later work
  should reuse belongs in a decision contract when it passes the project
  decision gate.
- Vendor context uses official sources only and must not be hardcoded to a fixed
  provider list or installation form.

## Why

Discovery and shaping move in opposite directions: discovery broadens from
evidence, while shaping converges on a chosen direction. Plans derived at
execution time age better than stored implementation predictions. Session
duration is not a stable task boundary, so the durable unit is an independently
deliverable outcome rather than a predicted amount of implementation work.

## Reconsider when

- Delivery-sized tasks routinely prove too broad for one fresh implementation
  session or one coherent review.
- Real task runs show that delivery-sized vertical slices still rot before they
  are executed.
- External-dependency workaround failures are repeatedly observed outside
  shape-idea, justifying another standalone carrier for the check-first rule.

## Still-rejected alternatives

- Combining blank-page discovery with shape-idea — convergence turns the first
  plausible direction into a premature spec.
- Recall-only discovery — users cannot self-report opportunities they have not
  recognized; traces reveal repeated behavior and rare intersections.
- Durable `plan.md` and a plan-writing skill — implementation predictions age,
  while decision-level corrections already have homes in specs, tasks, project
  decisions, or repository instructions.
- Session duration as the task boundary — agent sessions can sustain long-running
  work, and sizing against a predicted session fragments one coherent outcome
  into incomplete review points.
- Fine-grained tickets or horizontal layer tasks — they become stale and produce
  changes too broad to verify end to end.
- Depending on agents to discover vendor context on their own — official
  evaluations showed installed context was frequently left unused unless the
  workflow made retrieval explicit.

## Evidence worth preserving

- Vendor evaluations cited when this rule was adopted measured large gains from
  version-matched official context and also showed that agents frequently failed
  to invoke an installed skill without an explicit routing instruction.
