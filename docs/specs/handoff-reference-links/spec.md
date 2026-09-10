# Handoff reference links

## User-visible outcomes

- A spec that `shape-idea` writes names the approved prototype and the decision
  contracts the work depends on, so `implement` loads them as required sources
  instead of leaving them to its own discretion.
- A prototype approved through `build-prototype` in the middle of a shaping
  session is still linked from `spec.md` after shaping writes its final
  contract.
- A task file says only what the task alone can say: the prototype screens and
  states that task delivers, and a decision contract only that task depends on.
  It repeats no link the spec already carries.
- An implementer reading one task knows which approved screens that task's
  change must match, and the reviewer receives the same narrowing.

## Decision contracts this work depends on

- `docs/decisions/pipeline.md`: `implement` loads decision contracts
  explicitly linked by the spec or active tasks; presence in the folder does
  not establish approval; work-unit constraints belong in `spec.md` and
  task-expiring constraints in the task file.
- `docs/decisions/skill-design.md`: a fixed procedure or structure must name a
  repeated, observed failure; every published skill restates what it needs
  inline.
- `docs/decisions/shape-idea.md`: `spec.md` is the stable product contract
  shaping closes with, and shaping writes only to the spec folder, glossary,
  decision contracts, and vendor agent context.

## Approved scope

### The spec links its required sources

`shape-idea`'s instruction for writing `spec.md` gains one obligation: link
the approved `prototype.html` when one exists, and each decision contract this
work depends on. A link an earlier `build-prototype` close-out already wrote is
preserved, not rewritten away. The linked files are pointed at, never restated;
`implement` reads them itself once they are named.

The obligation covers the decision contracts the work *depends on*, the
constraints implementation must honor. Files the work will *edit* are a
separate matter that existing specs already record under aligned surfaces and
this change does not touch.

### Task files narrow, never repeat

`split-into-tasks` already says a task references an approved prototype when
relevant without copying its implementation, but gives that reference no home
and no shape. The wording is sharpened to say what and where: a task records
in its Constraints the prototype screens and states it delivers, and any
decision contract only that task depends on. Spec-level links are not repeated
in task files, and a task never links `spec.md` itself: the spec is the anchor
`implement` loads before any task. The task template gains no new section.

### The producer rule sits beside the consumer rule

`docs/decisions/pipeline.md` already records that `implement` loads decision
contracts explicitly linked by the spec or active tasks, and that presence in
the folder alone does not establish approval. The same subject gains the
producer side of that rule: the spec links what implementation must load, and
a task adds only task-scoped references.

### Product-contract enumerations stay as they are

The fields of the product contract are enumerated in `docs/decisions/shape-idea.md`,
in `docs/decisions/pipeline.md` under "every spec-producing path", in the
`Spec` entry of `GLOSSARY.md`, and in the `shape-idea` eval assertions. Those
lists describe product meaning: outcomes, scope, criteria, constraints,
assumptions, off-limits areas, deferred points, risks. A link is not a ninth
field; it is how the spec names the complementary sources beside it, the
prototype the glossary already calls the spec's visual half and the contracts
the work honors. The enumerations therefore do not change. The link obligation
is recorded as its own sentence beside the `spec.md` line in
`docs/decisions/shape-idea.md`, and as the producer rule in `pipeline.md`.

### Aligned surfaces

- `skills/workflow/shape-idea/SKILL.md`: the `spec.md` writing instruction
  gains the link obligation.
- `docs/decisions/shape-idea.md`: the link obligation is recorded beside the
  existing `spec.md` decision, without changing that decision's enumeration.
- `skills/workflow/shape-idea/evals/evals.json`: a case or assertion that a
  closing spec links the approved prototype and the contracts it depends on
  belongs here; existing enumeration assertions are unchanged.
- `skills/workflow/split-into-tasks/SKILL.md`: the prototype-reference sentence
  is sharpened as above.
- `skills/workflow/split-into-tasks/evals/evals.json`: the assertion that a
  task references an approved prototype when relevant is kept consistent with
  the sharpened wording.
- `docs/decisions/pipeline.md`: the producer-side rule is added beside the
  consumer-side rule; the "every spec-producing path" enumeration is unchanged.

`skills/workflow/implement/SKILL.md`, `skills/workflow/build-prototype/SKILL.md`,
`GLOSSARY.md`, and `templates/task.md` are unchanged: the consumer already
loads linked sources, the prototype skill already links its own close-out, the
term's meaning does not change, and no observed failure earns a template
section.

## Observable acceptance criteria

- `shape-idea`'s instruction for writing `spec.md` names linking the approved
  `prototype.html` when one exists and each decision contract the work depends
  on, says to preserve a link an earlier `build-prototype` close-out wrote, and
  says not to restate the linked contents.
- `docs/decisions/shape-idea.md` states the same link obligation, and its
  existing enumeration of the product contract's fields is unchanged.
- `split-into-tasks` says a task records, in its Constraints, the prototype
  screens and states it delivers and any decision contract only that task
  depends on, and that links the spec already carries, and `spec.md` itself,
  are not repeated in a task.
- `templates/task.md` in `split-into-tasks` has the same sections before and
  after this change.
- `pipeline.md` states the producer-side rule in its Decisions, and the
  existing consumer-side statements about `implement` loading linked sources
  and the "every spec-producing path" enumeration are unchanged.
- The `split-into-tasks` eval assertion about referencing an approved prototype
  describes the sharpened behavior rather than the old open-ended one.
- Neither edited skill refers to the other skill's text; each states what it
  needs inline.
- `implement`, `build-prototype`, and `GLOSSARY.md` show no diff from this
  work.

## Settled constraints and rationale

- The link is the approval signal. `implement` deliberately refuses to infer
  approval from a file's presence in the spec folder and reads only what the
  handoff explicitly links or repository evidence implicates. Its fallback path
  depends on the implementer noticing from code that a decision applies; the
  explicit link is the reliable path, and nothing on the producer side was
  writing it. None of the eight specs in this repository links a decision
  contract the work depends on; the two that link any contract list it under
  aligned surfaces as a file the work edits. Confirmed by the user this
  session.
- Work-unit references live in the spec; task-scoped references live in the
  task. This is the rule `pipeline.md` already applies to constraints: what
  belongs to the work unit goes in `spec.md`, what expires with one task goes
  in the task file. A per-task copy of spec-level links would be a second
  source that drifts, the thing the decision index and `CLAUDE.md` exist to
  prevent. Confirmed by the user this session.
- Point, do not copy. `implement` reads a linked file itself, so restating its
  contents in the spec or a task adds a copy with no reader and a drift risk
  with one.
- No new template section. `skill-design` admits a fixed structure only against
  a repeated, observed failure. No spec in this repository has a `tasks/` folder
  yet, so no such failure has been observed; the existing sentence is sharpened
  instead.
- The link is not a product-contract field. Adding it to every enumeration of
  the contract would make four lists drift on a mechanic that is not product
  meaning; recording it once beside the `spec.md` decision and once as the
  producer rule keeps the enumerations stable.

## Assumptions

Agent-chosen defaults, overridable.

- No implementation session working from task files has been observed missing
  a prototype screen or a decision contract. If one has, the template question
  reopens.
- A link is a repository path `implement` can open from the repository root;
  whether it is written as inline code or a Markdown link is presentation.
- The link obligation sits at the end of `shape-idea`'s "Write the product
  contract" section, after the list of what `spec.md` contains. Exact placement
  is implementation's call.
- A spec that links no decision contract because the work depends on none is
  correct; the obligation is not a requirement to find one.
- Whether the `shape-idea` eval suite gains a new case or an assertion inside
  an existing closing case is implementation's call.

## Off-limits

- Product source outside the shaping paths was not touched this session. The
  two skill bodies, the two eval files, and the two decision contracts are
  implementation's to change; shaping wrote only this spec.
- A general "References" section in the task template is excluded, for the
  drift reason recorded above.
- `implement`'s loading rule is excluded from change; the consumer side is
  already correct and this work only supplies what it expects.
- `build-prototype`'s close-out is excluded from change; it already saves and
  links the approved surface.
- The product-contract enumerations in `shape-idea.md`, `pipeline.md`,
  `GLOSSARY.md`, and the `shape-idea` evals are excluded from change, for the
  reason recorded above.
- The existing specs without decision links are not retrofitted. They predate
  the rule, and `implement`'s repository-evidence fallback still covers them.

## Deferred points

None. Both consequential branches, whether to link at all and where task-level
references belong, were settled during shaping.

## Remaining risks

- Task-level narrowing relies on the split choosing correctly which screens a
  task delivers. A too-narrow list could lead the reviewer to skip a screen the
  task actually changed. The spec-level link still names the whole prototype,
  so the whole remains reachable; the narrowing is a filter, not a fence.
- The sharpened `split-into-tasks` wording has no real split in this
  repository to test against. The first work unit here that produces a
  `tasks/` folder is its first test.
- The link obligation depends on `shape-idea` recognizing which decision
  contracts the work depends on. A contract the shaping session never read
  cannot be linked, which leaves `implement` on its repository-evidence
  fallback for that contract, the same position as today.
