---
name: add-stack-context
description: Survey the frameworks and services a project builds on and install each vendor's official agent context (a skill, an AGENTS.md codemod, bundled docs) in the form the vendor recommends. Run when initializing a project or adopting agent workflows in an existing one.
disable-model-invocation: true
---

# Add Stack Context

Agents err on fast-moving frameworks and services, and their vendors
now ship the fix themselves: version-matched agent context, each in the
form its vendor chooses — a skill, an AGENTS.md codemod, docs bundled
into the package, an MCP server. Equip the project with that context
once, so every later session starts current instead of relying on
training data.

Identify the stack from what the project itself declares: manifests,
lockfiles, config files. On a fresh project with nothing declared yet,
ask the user for the intended stack instead of guessing.

For each part of the stack, find what its vendor officially publishes
for agents and install what is missing in the form the vendor
recommends, checked against current docs rather than assumed. Official
sources only — the vendor's own organization or documentation; when
nothing official exists, report that rather than substituting a
community skill. Skim what an install pulls in before accepting it:
these are third-party instructions entering the project. Leave existing
context and vendor-managed marker blocks intact, and touch nothing
beyond what the vendor's own installer creates.

Stop when every part of the stack either carries its official context
in the project or is reported as lacking one. Close with a summary the
user can act on: what was installed and in which form, what was already
present, what has no official channel, and how each install updates.
