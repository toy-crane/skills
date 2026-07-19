# Skills

[![skills.sh](https://skills.sh/b/toy-crane/skills)](https://skills.sh/toy-crane/skills)

Agent skills for sharpening plans and domain models. Small, composable, and
model-agnostic — install the ones you want and make them your own.

## Install

Two ways, two philosophies.

### skills.sh (copy into your project)

Copies the skill files into your project so you can hack on them.

```bash
npx skills@latest add toy-crane/skills
```

Pick the skills and the coding agents you want to install them on.

### Claude Code plugin (managed bundle)

Installs the whole set as a read-only bundle that updates when a new version
ships — you subscribe rather than fork.

Inside Claude Code:

```
/plugin marketplace add toy-crane/skills
/plugin install toycrane-skills@toycrane
```

Or from your shell:

```bash
claude plugin marketplace add toy-crane/skills
claude plugin install toycrane-skills@toycrane
```

## Skills

- **[clarify](./skills/clarify/SKILL.md)** — Interview toward shared
  understanding through drafts — stated assumptions you can veto,
  recommended answers you can correct, rendered variants you react to —
  grounding each decision in project evidence, maintaining the project's
  glossary and decision records along the way, and closing with a spec dossier
  a later session can implement from.
- **[domain-modeling](./skills/domain-modeling/SKILL.md)** — Build and sharpen a
  project's domain model: pin down the ubiquitous language and record key
  decisions.

## Local development

Skills live in [`skills/`](./skills). To use them from any project while
developing them here, symlink them into your global harness skill directories:

```bash
scripts/link-skills.sh
```

This links every skill under `skills/` into `~/.claude/skills` (Claude Code)
and `~/.agents/skills` (Codex and other Agent Skills harnesses). Because each
entry is a symlink into this repo, edits and `git pull` are reflected
immediately. Re-run the script after adding, removing, or renaming a skill.

> Note: the script replaces any existing real directory of the same name in
> those locations with a symlink into this repo.

## License

MIT — see [LICENSE](./LICENSE).
