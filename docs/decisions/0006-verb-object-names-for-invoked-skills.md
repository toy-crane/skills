# Invoked skills carry verb-object names; discipline skills keep discipline nouns

The published set had four grammatical forms across five names (clarify,
to-plan, prototype, domain-modeling, tdd). The rule that replaces them
splits on how a skill is reached. A skill the user invokes directly is a
command, so its name is an imperative verb-object pair taken from the
leading verb of its own description: write-spec, draft-plan,
build-prototype. A skill that triggers in the background or is invoked
by other skills is a practice, not a command, so it keeps its discipline
noun: domain-modeling, tdd.

Bare deliverable nouns (spec, plan, prototype) were the first choice and
failed on a reserved word: `/plan` is a built-in slash command in both
Claude Code (plan mode, `/plan open`, `/plan share`) and Codex CLI
(`ModeKind::Plan`, since roughly January 2026). In Claude Code a
same-named skill shadows the built-in; in Codex the built-in always wins
and the skill is reachable only as `$plan`. Either direction confuses
routing, which 0005 anticipated when it flagged that `to-plan` "still
shares a word with plan mode". Verb-object names dissolve the collision
instead of dodging it.

## Considered Options

- **Deliverable nouns: spec, plan, prototype, domain-model** (rejected):
  plan is reserved by both harnesses, and a skill named spec collides in
  prose with the artifact every skill text calls "the spec".
- **Namespace prefix: spec, spec-plan, spec-prototype** (rejected): the
  autocomplete grouping is worth little at five skills, and the names
  stop matching what a user actually says to invoke them.
- **One uniform verb (draft-\*)** (rejected): no single verb is honest
  for all skills, and Draft is already a glossary term of art.

## Consequences

clarify becomes write-spec, to-plan becomes draft-plan, prototype
becomes build-prototype; plugin.json bumps to 0.8.0. Copies installed
via skills.sh keep the old names until reinstalled, and local symlinks
need one `scripts/link-skills.sh` re-run after the rename lands on main.
Records up to 0005 and retired spec folders keep the old names. New
skills follow the two-class rule, checking candidate names against both
harnesses' built-in slash commands first.
