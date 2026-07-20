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

## Versioning is manual

Bump `.claude-plugin/plugin.json`'s `version` when installed plugin users should
see an update. No changeset or CI automation.

## Local use

`scripts/link-skills.sh` symlinks every `skills/` skill into `~/.claude/skills`
and `~/.agents/skills`. Re-run after adding, removing, or renaming a skill; plain
edits and `git pull` need no re-run.

## Writing style

The em dash (U+2014) is banned everywhere in this repo: skill text, docs,
templates, scripts, commit messages, and PR text. Connect clauses with a
comma, a colon, parentheses, or a new sentence instead. When you touch a
line that still carries one, rewrite it away. The vendored `.agents/` tree
keeps its upstream text as-is.

## Going live

Both channels read the `main` branch on GitHub, so changes are installable
only after they land there.
