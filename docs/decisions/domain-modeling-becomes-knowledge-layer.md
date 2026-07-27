# domain-modeling becomes knowledge-layer

The old name said which tradition the discipline comes from, not what the
skill keeps. "Domain modeling" is DDD vocabulary: a reader who has not met
that school gets no hint that this skill maintains two files —
`GLOSSARY.md` and `docs/decisions/` — where a project's settled terms and
decisions accumulate across sessions. The new name states the thing in
words a first-time reader already has.

The layer being maintained has established names in adjacent fields. Agent
tooling calls the markdown-files-that-outlive-a-session pattern a memory
bank; agent-memory products (Mem0, Zep) call themselves memory layers. But
"memory" is already Claude Code vocabulary — CLAUDE.md is "memory",
`/memory` edits it, auto-memory writes it — so a memory-\* skill would read
as managing those. knowledge replaces memory; layer stays. Layer also
carries the accumulation the name wants — layers stack — where the literal
stacking words are reserved by computing (stack, heap, pool) or read as
disorder (pile).

The two-class rule of verb-object-names-for-invoked-skills is untouched:
this skill is invoked by shape-idea and build-prototype and followed in
the background, so it keeps a noun name. What changes inside the class is
what the noun names — the layer the skill maintains rather than the
practice it descends from.

## Considered Options

- **shared-language** (rejected): the plain translation of ubiquitous
  language, but it reads glossary-only; the decision records vanish from
  the name.
- **knowledge-building, knowledge-keeping** (rejected): easy words, and the
  gerund keeps the discipline shape, but the object stays vague; naming
  the concrete layer beats naming the activity around it.
- **memory-bank, memory-layer** (rejected): the industry's own names for
  exactly this layer, but memory collides with what Claude Code already
  calls CLAUDE.md and auto-memory, inside the harness the skill runs in.
- **project-canon, knowledge-stack** (rejected): canon fails the
  plain-words bar; stack is reserved by computing and by this repo's own
  add-stack-context.

## Consequences

`skills/domain-modeling/` becomes `skills/knowledge-layer/`, with its
frontmatter name and description, the `.claude/skills/` symlink, the
plugin.json path, keyword, and description, marketplace.json's matching
pair, the README intro and entry, AGENTS.md's example pair
(knowledge-layer, tdd), shape-idea's and build-prototype's invocation
lines, and shape-idea's evals following. Version 0.22.0. Installed copies
keep the old name until reinstalled, as with the
verb-object-names-for-invoked-skills and explain-becomes-explain-visually
renames. Decision records and retired spec folders keep the old name as
history.
