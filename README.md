# Skills

[![skills.sh](https://skills.sh/b/toy-crane/skills)](https://skills.sh/toy-crane/skills)

A composable, model-agnostic set of skills for product discovery, shaping,
prototyping, task splitting, implementation, human review, project
knowledge, and test-first development. Install selected skills or the complete
plugin.

## Install

Choose copy-in installation or the managed plugin.

### skills.sh (copy into your project)

Copies selected skill folders into your project for local editing.

```bash
npx skills@latest add toy-crane/skills
```

Choose the skills and coding agents to install.

### Claude Code plugin (managed bundle)

Installs the complete set as a read-only bundle. Updates arrive with new plugin
versions.

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

## The pipeline

Six skills cover discovery through implementation.

```mermaid
flowchart LR
    DO["discover-opportunity<br/>(no direction yet)"] --> SI["shape-idea<br/>(problem named,<br/>direction rough)"]
    SI --> BP["build-prototype<br/>(judge it by using it)"]
    SI --> SPEC[/spec folder/]
    BP --> SPEC
    SPEC --> ST["split-into-tasks<br/>(multiple deliverables)"]
    SPEC --> IM["implement<br/>(spec folder)"]
    ST --> IM
    IM --> DONE["verified and reviewed"]
    TDD[tdd] -. "optional test-first loop" .-> IM
```

Invoke `discover-opportunity` when no problem or direction is known. It runs only
on `/discover-opportunity` in Claude Code or `$discover-opportunity` in Codex.
Start with `shape-idea` when the problem and a broad direction are already known.
The discovery handoff remains in the conversation rather than a separate file.

`shape-idea` records implementation-ready decisions in
`docs/specs/<slug>/spec.md`. `build-prototype` can start from the current
conversation alone; when a whole interface is approved, it creates or updates
the spec and preserves `prototype.html` beside it. Use `split-into-tasks` only
when the spec contains outcomes that should be delivered separately. It also
marks the few intermediate reviews justified by material or downstream risk.
Then pass the spec folder to `implement`. It runs approved tasks sequentially
when they exist and otherwise implements `spec.md` directly. After complete
verification, the current harness's native review process checks the integrated
result. Implementation planning is just in time, and `tdd` can provide the
test-first loop.

Pass the folder itself, not an individual spec or task file.

Claude Code:

```text
/implement docs/specs/checkout/
```

Codex:

```text
$implement docs/specs/checkout/
```

The handoff lives at one stable path:

```text
docs/specs/checkout/
├── spec.md
├── prototype.html      # optional
└── tasks/              # optional approved task files
```

Invoke the same folder again after an interruption. `implement` reconstructs
progress from the folder, Git, the current diff, and verification results.

- **[discover-opportunity](./skills/discover-opportunity/SKILL.md)**: Find
  side-project directions from agreed personal traces and relevant current
  change. Runs only when explicitly invoked and hands the chosen direction to
  `shape-idea` without creating a document.
- **[shape-idea](./skills/shape-idea/SKILL.md)**: Clarify a chosen problem and
  direction through correctable drafts, project evidence, and rendered UI
  variants. Maintains project terms, records only settled decisions that future
  work should reuse, then writes an implementation-ready spec.
- **[build-prototype](./skills/build-prototype/SKILL.md)**: Build every screen in
  one dummy-data HTML file using the project's design system, or the shell's
  minimal style when none exists. Review the rendered screens and preserve the
  approved prototype beside the spec.
- **[split-into-tasks](./skills/split-into-tasks/SKILL.md)**: Split an existing
  spec into the fewest approved, independently deliverable vertical tasks with
  explicit blockers, acceptance criteria, focused verification, minimal state,
  and only risk-justified intermediate review checkpoints.
  Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT).
- **[implement](./skills/implement/SKILL.md)**: Implement an approved spec
  folder, using its tasks sequentially when present and its spec directly when
  absent, then finish with full verification and the current harness's native
  review process.
- **[tdd](./skills/tdd/SKILL.md)**: Implement one red → green slice at a time at
  pre-agreed public seams. Includes rules for stable seams and behavioral tests.
  Adapted from
  [mattpocock/skills](https://github.com/mattpocock/skills) (MIT).

## Outside the pipeline

Five additional skills run independently of the pipeline. They handle stack
setup, project knowledge, visual explanation, final human judgment, and periodic
cleanup.

- **[add-stack-context](./skills/add-stack-context/SKILL.md)**: Audit the
  technologies that define a project's stack and install each vendor's official
  agent context in its recommended form. Runs during agent setup, after stack
  changes, or on entering an unaudited project.
- **[project-knowledge](./skills/project-knowledge/SKILL.md)**: Maintain project
  terms and settled decisions that future work should reuse whenever they are
  taking shape, including while a plan weighs alternatives. Does not run for
  lookup, routine implementation details, or execution of settled decisions.
- **[explain-visually](./skills/explain-visually/SKILL.md)**: Render explanations
  with the best available tool. Use one sentence instead when one sentence fully
  answers the question.
- **[human-review](./skills/human-review/SKILL.md)**: Turn a completed, substantial
  or consequential repository change into a minimal visual handoff. Show the
  whole outcome, then route only commitments that still need human judgment.
- **[compact-decisions](./skills/compact-decisions/SKILL.md)**: Periodically clean
  up decision files, the glossary, shipped specs, and agent instructions after
  work accumulates. Shorten the documents without changing confirmed decisions.

## Acknowledgements

The skill-writing philosophy behind this project is deeply inspired by
[Matt Pocock](https://github.com/mattpocock)'s work—especially his approach to
making stochastic systems more predictable through clear, compact, and
checkable instructions. Thank you to Matt for articulating and openly sharing
these ideas through [mattpocock/skills](https://github.com/mattpocock/skills).

## License

MIT. See [LICENSE](./LICENSE).
