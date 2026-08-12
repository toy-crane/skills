# Published skill layout

## Decisions

- Keep published skill sources under exactly one of `skills/git/`,
  `skills/workflow/`, or `skills/expo/`.
- Put Git repository delivery operations in `git`, technology-independent
  product and engineering practices in `workflow`, and Expo-specific practices
  in `expo`.
- Treat the group as a source-catalog concern. Keep each skill's immediate
  folder and frontmatter name unchanged, and expose flat invocation paths
  through `.agents/skills/` and `.claude/skills/`.

## Boundaries

- A skill belongs to one group only. Execution order and cross-skill handoffs do
  not determine its directory.
- Moving a published skill between groups changes its distribution path and
  requires the same manifest, symlink, documentation, validation, versioning,
  and skills.sh migration work as any other published path move.

## Why

The three groups match the repository's durable distinctions: Git operations,
portable agent workflows, and Expo-specific runtime work. They make the source
catalog easier to scan without changing the short names users install and
invoke. More granular categories would create small overlapping buckets and
mix execution phases with ownership.

## Reconsider when

- A new platform accumulates enough published skills to justify a stable group.
- `workflow` becomes too broad for maintainers to place a new skill predictably.
- Distribution tooling stops supporting catalog-style nested skill paths.

## Still-rejected alternatives

- A flat `skills/<name>/` catalog — preserves source paths but no longer makes
  the growing published set easy to scan.
- Separate product, engineering, review, and knowledge groups — classifies the
  current set more finely but creates ambiguous boundaries for skills spanning
  multiple phases.

## Evidence worth preserving

- `skills` CLI 1.5.22 discovered and installed a
  `skills/<group>/<name>/SKILL.md` fixture without `--full-depth`, flattening the
  installed names under `.agents/skills/`; `claude plugin validate --strict`
  also accepted manifest entries pointing directly at nested skill folders.
