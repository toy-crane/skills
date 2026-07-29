# Check existing solutions first

## Problem

A session hits a problem and builds its own fix on the spot. The answer
often already exists. The dependency's issue tracker holds a worked-out
countermeasure, or the official docs document the method. The user has
observed this repeatedly in shaping sessions (confirmed 2026-07-29):
the failure site and the carrier below are the same skill.

[thin-skills-over-fixed-procedures](../../decisions/thin-skills-over-fixed-procedures.md)
sets the bar for adding a constraint: a repeated, observed failure. This
failure meets it.

[agent-context-installs-at-stack-confirmation-and-setup](../../decisions/agent-context-installs-at-stack-confirmation-and-setup.md)
records why initiative alone will not fix it: agents left installed
skills uninvoked in 56% of runs. Retrieval left to the model's own
initiative fails silently. The rule must sit in text the session has
already loaded when the problem appears.

## The rule

When a problem or a needed capability belongs to an external dependency
— a framework, a library, a service — find how it is already solved
before building your own. Sources: official docs, agent context
installed in the project, the dependency's issue tracker and release
notes. Build your own only when the found answer does not apply, and
record which source you checked and why it fell short.

It is a constraint, not a procedure. No search order, no mandated tool.
The skill names the failure and the gate; the method stays with the
model.

## Carrier

One skill carries the rule: shape-idea — where the pipeline resolves
technical questions, and where the user observed the failure. The rule
is restated inline; skills stand alone, so no skill may assume another
is present.

### shape-idea — sharpen one paragraph

shape-idea already gates spikes on sources, but never names issue
trackers, and "investigate" reads codebase-first. Proposed replacement
for the investigate paragraph:

Current:

> Investigate the codebase, the documentation, and authoritative
> sources. When no source holds the answer to a technical question, make
> the evidence yourself with a spike or a benchmark.

Proposed:

> Investigate the codebase, the documentation, and authoritative
> sources. A question that lives in an external dependency usually has a
> settled answer in its official docs, issue tracker, or release notes;
> look there before making evidence yourself. Only when no source holds
> the answer, make it with a spike or a benchmark.

## Not carriers

- **tdd** — the user judged it unneeded (2026-07-29), and the judgment
  holds against the repo's own bar:
  [thin-skills-over-fixed-procedures](../../decisions/thin-skills-over-fixed-procedures.md)
  admits a constraint only for an observed failure, and none has been
  observed in a tdd session — the draft's placement there was
  inference. tdd is also a testing reference; every section teaches the
  loop, and a problem-solving rule would be its only off-subject
  section. Implementation sessions inherit shaping's research through
  the spec. Reopened only if the failure is actually observed during a
  tdd session.
- **build-prototype** — touches no framework by design (one dummy-data
  HTML file). Same ground as the build-prototype rejection recorded in
  [agent-context-installs-at-stack-confirmation-and-setup](../../decisions/agent-context-installs-at-stack-confirmation-and-setup.md).
- **discover-opportunity, split-into-tasks** — neither solves technical
  problems.
- **add-stack-context** — covers install-time equipping; this rule
  covers problem-time. They complement each other. No change there.
- **knowledge-layer, explain-visually, compact-decisions** — no
  problem-solving moment.

## Scope — confirmed

The rule triggers on external dependencies only. The user confirmed the
observed failure was external-dependency problems, not the project's
own issue tracker or docs (2026-07-29). The narrow trigger is the brake
against sending trivial local bugs to the web.

## Assumptions, each under standing veto

- The citation clause stays ("record which source you checked and why
  it fell short"). Overturned if it proves to be friction in use; the
  rule then drops to check-first alone. Only use can show this.
- Inline restatement per carrier, no new background skill. A shared
  skill cannot be assumed present, and a skill holding search method
  would violate thin-skills.
- Wording may drift between the two carriers over time. Accepted; the
  stack-context constraint set the precedent.

## Off-limits

- The vendored writing-great-skills stays untouched.
- No new skill, no plugin.json skills-array change, no symlink changes.
- This shaping session edits no skill file. Shaping writes documents,
  not source.

## Implementation notes

- Edit skills/shape-idea/SKILL.md as above.
- Bump .claude-plugin/plugin.json version (0.22.0 → 0.23.0) and run
  `claude plugin validate . --strict`.
- The work fits one session. No task split.
- The decision record
  [shape-idea-checks-existing-solutions-first](../../decisions/shape-idea-checks-existing-solutions-first.md)
  and its index line are already written by the shaping session; the
  implementing session edits the skill and bumps the version, nothing
  more.

## Remaining risks

- Sessions with no skill loaded never see the rule, and implementation
  sessions stay uncovered by the tdd decision above. No failure is
  observed at either site today. Each implementation session works
  from a spec that carries shaping's research; if the failure shows up
  there anyway, that observation reopens the tdd carrier. The user's
  own CLAUDE.md could cover plain sessions; out of this work's scope.
- Inline text raises the odds; it does not guarantee. A session deep in
  context may still skip the check. If the failure recurs after this
  ships, the next lever is a harness hook, not more prose.
- Over-triggering: the external-dependency trigger is the brake against
  web searches for trivial local bugs. Watch for noise in use.
