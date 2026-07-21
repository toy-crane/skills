# What this is

toy-crane's agent skills, distributed two ways: copy-in via **skills.sh**
(`npx skills add toy-crane/skills`) and as a native **Claude Code plugin**
(`toycrane-skills@toycrane`). The repo is its own single-plugin marketplace.

## The published set is `skills/`

`skills/<name>/SKILL.md` is what ships. Each published skill must also appear in
`.claude-plugin/plugin.json`'s `skills` array: the plugin ships exactly that
array, while skills.sh discovers everything under `skills/`. Adding a skill =
create `skills/<name>/` **and** add its `./skills/<name>` path to `plugin.json`,
then link it from the README. Run `claude plugin validate . --strict` after
touching either `.claude-plugin/` manifest.

## Not everything here ships

`writing-great-skills` (vendored from [mattpocock/skills](https://github.com/mattpocock/skills),
MIT) lives under `.agents/skills/` with a `.claude/skills/` symlink so it is
invokable while working in this repo, and is deliberately kept out of
`plugin.json`. Don't add it to the plugin. It is currently still discoverable by
skills.sh, a known loose end left open on purpose, to be tidied later.

## Skills stand alone

A published skill must be self-sufficient at execution time: skills load one
at a time and skills.sh installs them individually, so a skill may invoke
another skill by name but must never assume knowledge of another skill's text
("follow X's discipline"). Restate what it needs inline.

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

## Local use

`scripts/link-skills.sh` symlinks every `skills/` skill into `~/.claude/skills`
and `~/.agents/skills`. Re-run after adding, removing, or renaming a skill; plain
edits and `git pull` need no re-run.

## Going live

Both channels read the `main` branch on GitHub, so changes are installable
only after they land there.
