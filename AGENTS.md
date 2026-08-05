# What this is

toy-crane's agent skills, distributed two ways: copy-in via **skills.sh**
(`npx skills add toy-crane/skills`) and as a native **Claude Code plugin**
(`toycrane-skills@toycrane`). The repo is its own single-plugin marketplace.

## The published set is `skills/`

`skills/<name>/SKILL.md` is what ships. Each published skill must also appear in
`.claude-plugin/plugin.json`'s `skills` array: the plugin ships exactly that
array, while skills.sh discovers everything under `skills/`. Adding a skill =
create `skills/<name>/`, add its `./skills/<name>` path to `plugin.json`,
symlink it into both `.agents/skills/` and `.claude/skills/`, then link it from
the README. Run
`claude plugin validate . --strict` after touching either `.claude-plugin/`
manifest.

## Published skills are invokable in-repo

Neither Codex nor Claude Code reads a bare `skills/` directory, so each
published skill is symlinked as `.agents/skills/<name> -> ../../skills/<name>`
for Codex and `.claude/skills/<name> -> ../../skills/<name>` for Claude Code.
The symlinks are committed so they reach every clone and worktree; edits under
`skills/` apply in place with no copy to drift. skills.sh scans both agent
directories too but dedupes by skill name, so the extra paths add nothing to
`npx skills add`. Keep both sets of symlinks in step when adding, removing, or
renaming a skill.

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

## Project decisions

Before changing document lifecycles, skill naming or design, the pipeline,
shape-idea, build-prototype, or explain-visually, read
[docs/decisions/README.md](docs/decisions/README.md) and only the linked subject
files relevant to the change. Do not duplicate their content here.

## Versioning is manual

Bump `.claude-plugin/plugin.json`'s `version` when installed plugin users should
see an update. No changeset or CI automation.

## Going live

Both channels read the `main` branch on GitHub, so changes are installable
only after they land there.
