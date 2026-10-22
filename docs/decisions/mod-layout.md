# Mod layout

## Decisions

- Keep each mod, a Claude Code plugin whose behavior comes from a hooks
  module, in `mods/<name>/` with its own `.claude-plugin/plugin.json`.
- List each mod as its own entry in `.claude-plugin/marketplace.json`, beside
  `toycrane-skills`, so it installs separately as `<name>@toycrane`.
- Never add a hooks module to the root `toycrane-skills` plugin.

## Boundaries

- A mod ships through the plugin channel only. skills.sh scans for `SKILL.md`
  and never carries one.
- A mod's own `plugin.json` carries `author` and `license`, which
  `claude plugin validate --strict` requires of every marketplace entry.
- Mods are not symlinked into `.agents/skills/` or `.claude/skills/`; while
  developing one, load it with `--plugin-dir mods/<name>`.

## Why

A hooks module intercepts tool calls, prompts, or the interface for everyone
who installs the plugin that carries it. Bundling one into `toycrane-skills`
would impose it on people who only want the skills. A separate marketplace
entry keeps the install opt-in while the repository stays the single
marketplace.

## Reconsider when

- Mods accumulate enough shared code or release cadence to justify their own
  repository.
- Claude Code lets one plugin ship an optional hooks module that installers
  turn on separately.

## Still-rejected alternatives

- A hooks module inside `toycrane-skills` — installs interception code for
  every skill user; revisit only if hooks modules become opt-in per plugin.
- A separate repository per mod — splits the marketplace users add; revisit
  when a mod needs its own release process.

## Evidence worth preserving

- A scratch copy of this repository with a second marketplace entry whose
  `source` is `./mods/<name>` passed `claude plugin validate . --strict` and
  the same check on the mod folder, once the mod's `plugin.json` named
  `author` and `license`.
