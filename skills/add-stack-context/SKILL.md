---
name: add-stack-context
description: Install the official agent context published for a project's frameworks and hosted services, using each vendor's recommended form. Use when initializing a project or adding agent workflows to an existing project.
disable-model-invocation: true
---

# Add Stack Context

Identify the stack from manifests, lockfiles, and config files. On a fresh
project with nothing declared yet, ask the user for the intended stack.

For each part of the stack, check current vendor documentation for official
agent context and install what is missing in the form the vendor recommends.
Accept only sources from the vendor's own organization or documentation; when
nothing official exists, report that instead of substituting a community skill.
Review what an install adds before accepting it. Preserve existing context and
vendor-managed marker blocks, and do not modify files beyond what the vendor's
installer creates.

Stop when every part of the stack has official context installed, already has
it, or is reported as having no official channel. Summarize what was installed
and how it updates, what was already present, and what has no official channel.
