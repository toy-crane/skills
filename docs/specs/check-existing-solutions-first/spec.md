# Check existing solutions first

> **DRAFT** — under review in the 2026-07-29 shaping session. One question
> is still open (scope, below). Correct this file directly or in chat.

## Problem

A session hits a problem and builds its own fix on the spot. The answer
often already exists. The dependency's issue tracker holds a worked-out
countermeasure, or the official docs document the method. The user has
observed this across sessions (reported 2026-07-29).

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

## Carriers

Only two skills solve technical problems mid-session: tdd and
shape-idea. Each restates the rule inline, because skills stand alone —
skills.sh installs them individually, so neither may assume the other is
present.

### tdd — new section

tdd has no guard today: a dependency misbehaves during red–green and
nothing points upstream. Proposed section, placed after "Anti-patterns":

> ## Before building your own fix
>
> When a failing test, an error, or a needed capability traces to an
> external dependency — a framework, a library, a service — find how it
> is already solved before building your own. Check the official docs
> and any agent context installed in the project, then the dependency's
> issue tracker and release notes. Most problems at that boundary have a
> settled answer: a documented option, a fixed version, a known
> workaround.
>
> Build your own only when the found answer does not apply, and record
> which source you checked and why it fell short, in the comment or
> commit that introduces the workaround. A workaround with no source
> behind it cannot be told apart from the first idea that happened to
> work.

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

- **build-prototype** — touches no framework by design (one dummy-data
  HTML file). Same ground as the build-prototype rejection recorded in
  [agent-context-installs-at-stack-confirmation-and-setup](../../decisions/agent-context-installs-at-stack-confirmation-and-setup.md).
- **discover-opportunity, split-into-tasks** — neither solves technical
  problems.
- **add-stack-context** — covers install-time equipping; this rule
  covers problem-time. They complement each other. No change there.
- **knowledge-layer, explain-visually, compact-decisions** — no
  problem-solving moment.

## Open question

Scope of the observed failure. Does it cover only external
dependencies, or also the project's own prior art — its issue tracker,
its docs? The rule above assumes external only, to keep the trigger
narrow and avoid sending trivial local bugs to the web. If the user
also saw sessions ignore the project's own sources, the rule names
those too.

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

- Edit skills/tdd/SKILL.md and skills/shape-idea/SKILL.md as above.
- Bump .claude-plugin/plugin.json version (0.22.0 → 0.23.0) and run
  `claude plugin validate . --strict`.
- The work fits one session. No task split.
- The decision record and its index line are written by the shaping
  session at close, not by the implementing session.

## Remaining risks

- Sessions with no skill loaded never see the rule. A plain chat
  session that hits a problem stays uncovered. The user's own CLAUDE.md
  could cover that; out of this work's scope.
- Inline text raises the odds; it does not guarantee. A session deep in
  context may still skip the check. If the failure recurs after this
  ships, the next lever is a harness hook, not more prose.
- Over-triggering: the external-dependency trigger is the brake against
  web searches for trivial local bugs. Watch for noise in use.
