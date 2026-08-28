# Stack context

## Decisions

- `add-stack-context` owns the project-wide audit of direct stack technologies,
  discovery of agent-facing context, source acceptance, installation, and the
  final accounting for every technology.
- Skill discovery starts with `find-skills` when it is available. Because a
  published skill must work when installed alone, `add-stack-context` retains
  the same search outcome through the Skills CLI or equivalent current sources
  when `find-skills` is absent.
- A skill controlled by the technology's vendor may be installed automatically
  through its documented method. A community skill may be assessed and reported
  as a candidate, but requires explicit user approval before installation and
  never substitutes for official context in the audit result.
- Vendor-provided installers, codemods, bundled documentation, and MCP servers
  remain valid official context. Discovery through `find-skills` does not narrow
  the audit to installable skills.
- A vendor `llms.txt` or equivalent changing document is read from the current
  official source when relevant work begins. Its contents are not copied into
  the repository. A compact managed instruction in the repository's existing
  `AGENTS.md` or `CLAUDE.md` tells later agents when and where to retrieve the
  current source.
- Existing user-authored instructions and any established sharing relationship
  between `AGENTS.md` and `CLAUDE.md` are preserved. The audit updates only its
  bounded managed instructions or uses the vendor's documented updater.

## Boundaries

- `find-skills` is a discovery mechanism, not a trust or installation-policy
  authority. Popularity, install count, or repository stars do not establish
  vendor ownership.
- The official-source restriction governs automatic installation. It does not
  hide useful community candidates from the user or prevent an explicitly
  approved installation.
- The live-document rule applies to changing external guidance. Version-matched
  documentation shipped with an installed package may remain local when that is
  the vendor's supported update path.
- A stack audit does not turn every transitive dependency into a context item
  and does not add generic agent instructions unrelated to the declared stack.

## Why

Skills are the most reusable form of agent context, so a dedicated skill
discovery capability should be the normal way to find them. Its ecosystem
search is intentionally broader than this project's automatic-installation
authority, so discovery and acceptance must remain separate. Official-only
automatic installation keeps third-party instructions from entering a project
based on popularity alone while still letting the user opt into a reviewed
community skill.

Copying a changing vendor document turns a current source into an unmanaged
snapshot. An always-loaded routing instruction preserves the benefit of vendor
context while making the document itself current at the moment it matters.

## Reconsider when

- The Skills ecosystem exposes verified vendor ownership that is strong enough
  to replace independent source validation.
- A standard dependency declaration lets individually installed skills require
  `find-skills` without losing standalone execution.
- Vendors provide a version-pinned, automatically updated local context format
  that is more reliable than task-time retrieval.

## Still-rejected alternatives

- Copy each `llms.txt` into the repository — the copy becomes stale without a
  vendor-owned update mechanism.
- Let `find-skills` choose what gets installed — its community discovery and
  popularity heuristics exceed the authority granted to an automatic stack
  audit.
- Ignore community skills completely — it hides potentially useful capability
  even though the user can safely approve it after review.
- Require `find-skills` as an installed dependency — plugin and individually
  installed skills cannot assume it is present.

## Evidence worth preserving

- The currently installed `find-skills` skill searches the open ecosystem and
  ranks candidates using install count, source reputation, and repository
  stars; those signals are useful for discovery but do not prove vendor control.
- The original stack-context decision preserved a vendor evaluation in which
  an always-loaded `AGENTS.md` route to version-matched documentation
  outperformed an optional skill that agents frequently failed to invoke.
