# shape-idea checks existing solutions before building its own

In shaping sessions the user repeatedly observed the same failure: a
problem or a needed capability belongs to an external dependency — a
framework, a library, a service — and the session builds its own fix,
although the dependency's issue tracker holds a worked-out
countermeasure or the official docs document the method (confirmed
2026-07-29).
[thin-skills-over-fixed-procedures](thin-skills-over-fixed-procedures.md)
admits a constraint into a skill exactly for such repeated, observed
failures, and
[agent-context-installs-at-stack-confirmation-and-setup](agent-context-installs-at-stack-confirmation-and-setup.md)
records why retrieval cannot be left to the model's own initiative
(installed skills left uninvoked in 56% of runs): the rule must sit in
text already loaded when the problem appears.

So shape-idea's investigate paragraph states the rule. A question that
lives in an external dependency is answered from its official docs,
issue tracker, and release notes before evidence is made by hand, and a
self-built answer records which source was checked and why it fell
short. The trigger is deliberately narrow — external dependencies only —
so trivial local bugs do not send the session to the web. This is the
problem-time counterpart to install-time stack context.

## Considered Options

- **A second carrier in tdd** (rejected): the failure is not observed
  in tdd sessions, and the thin-skills bar demands observed, not
  inferred. tdd is a testing reference — every section teaches the
  loop — and implementation sessions inherit shaping's research through
  the spec. An actual observation during a tdd session reopens this.
- **A new background skill holding the rule** (rejected): skills.sh
  installs skills individually, so no skill may assume another is
  present, and a skill carrying search method would violate
  thin-skills. The rule is one paragraph; it lives inline.
- **Project-own prior art in scope** (rejected): the observed failure
  covers external dependencies only, and the narrow trigger is the
  brake against over-searching.
- **Check-first without the citation clause** (rejected): a workaround
  with no source behind it cannot be told apart from the first idea
  that happened to work. The clause drops if use shows it to be
  friction.

## Consequences

shape-idea's investigate paragraph is replaced with the sharpened
wording, carried by `docs/specs/check-existing-solutions-first/` until
it ships in the skill itself. The plugin bumps 0.22.0 → 0.23.0. No new
skill, no plugin.json skills-array or symlink change. Sessions without
a loaded skill stay uncovered on purpose; covering them is
personal-CLAUDE.md territory, outside this repo.
