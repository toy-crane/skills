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
- `expo-smoke-test` takes the established QA term for its activity rather than
  verb-object grammar. Smoke testing already names a broad, shallow pass over
  the flows whose failure makes a build pointless, which is what the skill's
  core-loop half does. A skill name installs into a flat global namespace, so
  the `expo` marker keeps the stack scope visible next to same-concept skills
  for other stacks.
- `commit`, `pull`, `push`, `pr`, and `merge` are one-word exceptions because
  they are already the standard user-facing Git operations. Their object is the
  current repository change or branch, and longer verb-object aliases would be
  less predictable in both Claude Code and Codex.
- `define-publication`, `define-piece`, and `draft-piece` name the writing
  pipeline. `define` keeps this repository's meaning of an interview that
  settles meaning with the user, for a medium and for one piece respectively.
  `draft-piece` says the handoff is a draft the user judges, not a finished
  piece. `shape-*` was rejected as a code-side term with no writing meaning;
  `post`, `article`, and other medium words were rejected so the names stay
  valid when a newsletter or brand site joins the same repository; `brief` as a
  one-word name was rejected because it reads as a noun as often as a verb.
- `update-project-skills` names the outcome a user asks for: every skill
  installed in the project brought to its latest published version. The object
  is the project's installed set from every source, and the Toycrane-specific
  reconciliation of new, retired, and companion-agent-bearing skills is a step
  inside that outcome rather than the name. `project` keeps the scope distinct
  from a user-global update.

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
- `expo-e2e-check` for the both-platform pass — E2E names a test-suite runner
  category in the React Native ecosystem, where Maestro and Detox own the term,
  rather than an agent-driven verification loop.
- A bare `smoke-test` without the stack marker — installed skill names share one
  flat namespace, so the same concept for another stack would collide.
- `sync-toycrane-skills` for the installed-skill update — it named one source
  and the reconciliation mechanism; once the skill refreshes every installed
  skill, a source-branded name under-describes the outcome the user asks for.
