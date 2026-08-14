# Skill naming

## Decisions

- A skill users invoke directly takes a short imperative verb-object name.
- A skill that triggers in the background or is invoked by other skills keeps a
  discipline noun.
- Check candidate names against built-in commands in Claude Code and Codex;
  `/plan` is reserved by both.
- `define-product` names the work of turning a user-chosen app direction into
  permanent, current product context. It does not use the `one-pager` artifact
  format or imply application scaffolding in its name.
- `maintain-project-context` names the deliberate periodic pass that keeps the
  project's durable context current, concise, and internally consistent. The
  object covers product context, terms, decisions, completed work-unit records,
  and always-loaded repository guidance without granting authority to invent
  new product meaning or project decisions.
- `shape-idea` names the work of turning a chosen direction into bounded,
  implementation-ready decisions; the spec is its handoff, not its activity.
- `project-knowledge` names the current terms and settled decisions for future
  reuse that it maintains. As a discipline noun, it fits a background or
  inter-skill capability without naming a specific decision-maker.
- `explain-visually` is the deliberate exception to verb-object grammar: the
  object changes on every invocation, while visual rendering is the capability
  the skill adds.
- `human-review` names the human judgment that remains after AI handles
  mechanically checkable review. It is not named after its HTML output or a
  technical layer because the capability is deciding whether consequential
  commitments should be accepted.
- `implement` is a deliberate one-word exception to verb-object grammar: the
  object is the selected spec folder and changes on every invocation. It names
  the complete responsibility without exposing task, agent, or orchestrator
  mechanics.
- `resolve-follow-ups` names the user-visible outcome of clearing recorded
  follow-up work. Worktrees, workers, schedules, and pull requests remain
  execution details rather than the skill name.
- `commit`, `pull`, `push`, `pr`, and `merge` are one-word exceptions because
  they are already the standard user-facing Git operations. Their object is the
  current repository change or branch, and longer verb-object aliases would be
  less predictable in both Claude Code and Codex.

## Boundaries

- Folder names, frontmatter names, manifest paths, symlinks, documentation, UI
  metadata, and inter-skill references change together when a skill is renamed.
- Historical names may appear in Git history but not in current contracts or
  examples.

## Why

Invoked names should read as commands a user can predict, while background names
should read as practices. Naming the work instead of its deliverable or source
tradition keeps the trigger understandable without prior knowledge of the
repository.

## Reconsider when

- A host removes the distinction between invoked and background skills.
- Claude Code and Codex no longer reserve overlapping command names.

## Still-rejected alternatives

- Bare deliverable nouns such as `plan` or `spec` — they collide with built-ins
  or with artifacts discussed in ordinary prose.
- A namespace or one uniform verb for all skills — the names stop matching what
  users naturally ask each skill to do.
- `write-spec` for shaping — it overstates document production and hides the
  investigation and decision work.
- `create-one-pager` for app context — it names the output format rather than
  the product-definition work.
- `start-app` for app context — it implies scaffolding or implementation beyond
  the context artifact.
- `shape-app` for app context — it makes its app-level responsibility difficult
  to distinguish from the work-unit responsibility of `shape-idea`.
- `domain-modeling` for project knowledge — it names a DDD tradition rather
  than the files the skill maintains.
- `knowledge-stewardship` — it describes the AI's caretaker role accurately but
  is longer and more abstract than the project artifacts people need to find.
- `memory-layer` — memory already names CLAUDE.md and harness-managed memory.
- Naming the maintenance pass after decision compaction — decisions are only
  one of the durable context surfaces it reconciles, while compaction omits
  currency and consistency from the user-visible outcome.
- `show-results` for human review — it centers presentation rather than the
  scarce human judgment the skill protects.
