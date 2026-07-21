# Skills

[![skills.sh](https://skills.sh/b/toy-crane/skills)](https://skills.sh/toy-crane/skills)

Agent skills for discovering opportunities, sharpening plans, screens, and
domain models, then implementing them test-first. Small, composable, and
model-agnostic: install the ones you want and make them your own.

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
ships; you subscribe rather than fork.

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

The usual path is **discover-opportunity → shape-idea → draft-plan (when the
approach needs review) → implementation with tdd**. Discover-opportunity is a
user-invoked command rather than an automatically triggered skill: run
`/discover-opportunity` in Claude Code or `$discover-opportunity` in Codex.
Add-stack-context is user-invoked too: run it when setting up a project
to pull in each vendor's official agent context.
Build-prototype branches from shape-idea when a whole interface must be judged
by using it.

- **[add-stack-context](./skills/add-stack-context/SKILL.md)**: Survey the
  frameworks and services a project builds on and install each vendor's
  official agent context — a skill, an AGENTS.md codemod, bundled docs —
  in the form the vendor recommends, so later sessions start from
  version-matched vendor knowledge instead of training data. User-invoked,
  for project setup.
- **[build-prototype](./skills/build-prototype/SKILL.md)**: Align on UI by
  building it: every screen of a feature in one dummy-data HTML file grown
  from a pinned shell (shared tokens, per-screen state pills, viewport
  presets), walked through as a wireframe skeleton first, filled after
  approval, and preserved beside the spec for the implementing session.
- **[discover-opportunity](./skills/discover-opportunity/SKILL.md)**: Help a
  user who wants to make something but does not know where their tacit
  knowledge could apply surface a promising direction from their experience,
  access, interests, and capabilities, then carry it naturally into
  shape-idea without requiring an intermediate document. It runs only when the
  user invokes it explicitly.
- **[domain-modeling](./skills/domain-modeling/SKILL.md)**: Build and sharpen
  a project's domain model, pinning down the ubiquitous language and
  recording key decisions.
- **[draft-plan](./skills/draft-plan/SKILL.md)**: Turn a spec folder into a
  reviewed implementation plan: one page of approach, order, acceptance
  criteria, test seams, off-limits areas, and risks, drafted whole for you
  to correct and saved beside the spec for the implementing session.
- **[tdd](./skills/tdd/SKILL.md)**: Implement test-first through the
  red → green loop: tests at pre-agreed seams only (adopted from the plan
  document when one fixes them), one vertical slice per cycle, with the
  anti-pattern catalog that keeps tests behavioral instead of
  implementation-coupled. Adapted from
  [mattpocock/skills](https://github.com/mattpocock/skills) (MIT).
- **[shape-idea](./skills/shape-idea/SKILL.md)**: Shape a chosen direction
  into shared, implementation-ready decisions through drafts (stated
  assumptions you can veto, recommended answers you can correct, rendered
  variants you react to),
  grounding each decision in project evidence, inspecting and verifying
  material UI changes, maintaining the project's glossary and decision
  records, and closing with a spec folder a later session can implement from.

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

MIT. See [LICENSE](./LICENSE).
