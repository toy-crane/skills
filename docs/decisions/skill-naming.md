# Skill naming

## Decisions

- A skill users invoke directly takes a short imperative verb-object name.
- A skill that triggers in the background or is invoked by other skills keeps a
  discipline noun.
- Check candidate names against built-in commands in Claude Code and Codex;
  `/plan` is reserved by both.
- `shape-idea` names the work of turning a chosen direction into bounded,
  implementation-ready decisions; the spec is its handoff, not its activity.
- `project-knowledge` names the current terms and human-approved durable
  decisions it maintains. As a discipline noun, it fits a background or
  inter-skill capability without implying that the AI owns those decisions.
- `explain-visually` is the deliberate exception to verb-object grammar: the
  object changes on every invocation, while visual rendering is the capability
  the skill adds.

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
- `domain-modeling` for project knowledge — it names a DDD tradition rather
  than the files the skill maintains.
- `knowledge-stewardship` — it describes the AI's caretaker role accurately but
  is longer and more abstract than the project artifacts people need to find.
- `memory-layer` — memory already names CLAUDE.md and harness-managed memory.
