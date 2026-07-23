# What this is

toy-crane's agent skills, distributed two ways: copy-in via **skills.sh**
(`npx skills add toy-crane/skills`) and as a native **Claude Code plugin**
(`toycrane-skills@toycrane`). The repo is its own single-plugin marketplace.

## The published set is `skills/`

`skills/<name>/SKILL.md` is what ships. Each published skill must also appear in
`.claude-plugin/plugin.json`'s `skills` array: the plugin ships exactly that
array, while skills.sh discovers everything under `skills/`. Adding a skill =
create `skills/<name>/`, add its `./skills/<name>` path to `plugin.json`,
symlink it into `.claude/skills/`, then link it from the README. Run
`claude plugin validate . --strict` after touching either `.claude-plugin/`
manifest.

## Published skills are invokable in-repo

Neither harness reads a bare `skills/` directory, so each published skill is
symlinked as `.claude/skills/<name> -> ../../skills/<name>` — the same
mechanism that makes the vendored skill invokable. The symlinks are committed
so they reach every clone and worktree; edits under `skills/` apply in place
with no copy to drift. skills.sh scans `.claude/skills/` too but dedupes by
skill name, so the second path adds nothing to `npx skills add`. Keep the
symlinks in step when adding, removing, or renaming a skill.

## Not everything here ships

`writing-great-skills` (vendored from [mattpocock/skills](https://github.com/mattpocock/skills),
MIT) lives under `.agents/skills/` with a `.claude/skills/` symlink so it is
invokable while working in this repo, but ships through neither channel. The
plugin never carries it: it is deliberately kept out of `plugin.json`, so don't
add it there. skills.sh would otherwise find it — `.agents/skills/` and
`.claude/skills/` are both directories its CLI scans — so its `SKILL.md` carries
`metadata: { internal: true }`, which hides it from `npx skills add` unless
`INSTALL_INTERNAL_SKILLS=1` is set. Keep that frontmatter when updating the
vendored skill.

## Skills stand alone

A published skill must be self-sufficient at execution time: skills load one
at a time and skills.sh installs them individually, so a skill may invoke
another skill by name but must never assume knowledge of another skill's text
("follow X's discipline"). Restate what it needs inline.

## Skills stay thin

A skill states goal, constraints, and completion criteria — not method. A
fixed procedure earns its place only when it guards a repeated, observed
failure (build-prototype's skeleton-then-fill). Prefer pointing at real
artifacts (GLOSSARY.md, specs, prototypes) over describing them in prose,
and re-prune procedures when models improve. Rationale in
[decision 0009](docs/decisions/0009-thin-skills-over-fixed-procedures.md)
and the [source post](https://toycrane.xyz/posts/why-better-models-need-thinner-instructions/).

## Stack context

When shaping or planning settles work onto a framework or hosted service,
shape-idea and draft-plan install its vendor's official agent context (a
skill, an AGENTS.md codemod, bundled docs) into the target project, in the
form the vendor recommends. add-stack-context does the same on demand as a
user-invoked command, for project setup outside the pipeline. Rationale in
[decision 0010](docs/decisions/0010-agent-context-installs-at-stack-confirmation-and-setup.md).

## Skill naming

Two name classes. A skill the user invokes directly is an imperative
verb-object command (discover-opportunity, shape-idea, draft-plan,
build-prototype). A skill that
triggers in the background or is invoked by other skills keeps its discipline
noun (domain-modeling, tdd). Before naming a new skill, check the candidate
against the built-in slash commands of Claude Code and Codex; `/plan` is
reserved by both, which is why the planning skill is draft-plan. Rationale in
[decision 0006](docs/decisions/0006-verb-object-names-for-invoked-skills.md)
and [decision 0007](docs/decisions/0007-shape-idea-names-the-work.md). The
discovery-to-shaping boundary is recorded in
[decision 0008](docs/decisions/0008-opportunity-discovery-precedes-idea-shaping.md).

## Versioning is manual

Bump `.claude-plugin/plugin.json`'s `version` when installed plugin users should
see an update. No changeset or CI automation.

## Going live

Both channels read the `main` branch on GitHub, so changes are installable
only after they land there.
