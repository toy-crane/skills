# Selecting natural-korean drops Claude Code's default coding instructions

**Symptom**: `output-styles/natural-korean.md` says it defines only response
register and does not touch how work is done, tools, or code. Its frontmatter
has no `keep-coding-instructions` field, so selecting it removes Claude Code's
default coding instructions from the system prompt.

**Observed evidence**: Claude Code 2.1.327's bundled output-style schema
(`strings /opt/claude-code/bin/claude | grep keep-coding-instructions`)
describes the field as "If true, the default coding instructions stay in the
system prompt alongside this style", and the loader reads it as optional with
no true default. Found during a shape-idea session on 2026-11-18.

**Suspected cause**: The style was written before the field mattered, or on the
assumption that a custom style only appends. Not confirmed by a run that
compares system prompts with the field present and absent.

**What was tried**: Nothing; the session was shaping a separate output style.

**Proposed next step**: In a scratch copy, start Claude Code with the style
selected, with and without `keep-coding-instructions: true`, and compare the
system prompts (for example via `--debug` or a transcript); if the default
instructions are missing without it, add the field and bump the plugin version.
