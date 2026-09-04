# Writing workflow

## User-visible outcomes

- A user who writes for a publication that lives in the same repository as
  their code, such as a product blog inside a monorepo, can run the same
  premise → brief → draft workflow the code pipeline provides, through three
  new skills in a new `writing` group: `define-publication`, `define-piece`,
  and `draft-piece`.
- `define-publication` interviews the user about one medium and writes its
  standing premise to `docs/publications/<slug>.md`. Invoking it again for the
  same medium revises that file; a new medium gets a new file.
- `define-piece` turns one topic and rough direction into a confirmed brief at
  `docs/briefs/<slug>/brief.md` by proposing correctable candidates one
  decision at a time, without writing body prose.
- `draft-piece` writes the piece from its brief folder into the publication's
  content location, verifies it against the brief's reader questions and any
  embedded code, revises once, and hands off a local preview address when the
  repository serves the publication.
- The three skills share `GLOSSARY.md`, `docs/decisions/README.md`, and
  `project-knowledge` with the code workflow, so a blog about the product uses
  the product's canonical terms and style decisions sit beside code decisions.
- Both distribution channels expose the new skills. The medium-specific parts
  of the workflow live in publication files, so adding a newsletter or brand
  site later adds a publication file, not a skill.

## Approved scope

### Standing premise: `define-publication`

Input is one rough medium direction, such as "a product blog", or an existing
publication file the user wants to change. The skill interviews the user,
starting from one concrete reading scene: who meets the writing, in what
situation, and what they read instead today. It asks one or two closely
related open questions per round, only one when an answer decides the next
question, and reflects only what became newly clear. It does not recommend
answers while drawing out meaning; when the user delegates a choice, it names
the choice, criteria, and limits, then discloses what it chose and why.

The premise checks these areas without treating them as a questionnaire:

- primary readers and the situations in which they read;
- the change the publication promises its readers;
- voice and tone;
- what the publication covers and what it leaves out;
- medium conventions: the form and typical length of a piece, where finished
  pieces live in the repository, and how the rendered result is previewed;
- how a finished piece is evidenced, at minimum the reader-question check and,
  for pieces carrying code, execution of every embedded code block and command;
- observable success signals;
- material assumptions and unknowns.

Before writing, it shows the whole premise once, separating confirmed meaning,
delegated choices, accepted assumptions, and intentional unknowns, and asks the
user to confirm or correct it. It then writes only `docs/publications/<slug>.md`,
rewriting in place without chronology. Product facts are referenced from
`PRODUCT.md`, never copied. Voice shared by every publication of the same
author is not repeated per file; once settled and reusable, it goes to a style
subject in `docs/decisions/` through `project-knowledge`.

### Per-piece brief: `define-piece`

Input is one topic and a broad direction. The skill reads `GLOSSARY.md`, the
relevant decision subjects, and `PRODUCT.md` when the topic concerns the
product. When exactly one publication file exists it uses it; when several
exist it recommends one from the topic and confirms. Evidence the repository
can answer, such as how the code actually behaves, is checked before the user
is asked.

It proceeds by candidates the user corrects rather than blank questions: a
one-sentence thesis, title candidates, and an outline come first. A branch
expensive to get wrong is asked as exactly one question with a recommended
answer and reason. Tone, opening, and other choices judged by reading are
shown as two or three short text variants inline; prose needs no separate
renderer. When a term wobbles or a style choice would be reused,
`project-knowledge` is invoked by name.

Questions stop when every brief-relevant decision is settled or explicitly
deferred. The brief at `docs/briefs/<slug>/brief.md` carries:

- the owning publication;
- the thesis in one sentence;
- the reader of this piece and what they know before reading;
- three to five reader questions the target reader must be able to answer
  from the piece alone;
- scope, what is left out, and why;
- the real material the piece draws on: code, numbers, experience;
- the outline as section headings with what each section does, no paragraphs;
- for pieces with code, which code blocks and commands are execution-checked;
- assumptions, deferred points, and remaining risks.

Piece-level form choices, such as tutorial versus essay within one blog, are
made in the brief, not by creating another publication.

### Drafting: `draft-piece`

Input is one brief folder. The skill reads the brief, the publication file it
names, `GLOSSARY.md`, and relevant decision subjects, and reconstructs current
state from any existing draft before continuing; repository evidence outranks
remembered conversation.

It writes section by section in the outline's order, checking each section
against the brief before moving on. Embedded code and commands are executed at
the time they are written, and any stated output is matched to the real
output. When a discovery would change the thesis, reader, scope, or a reader
question, it stops, preserves the draft, and returns that exact decision to the
user instead of absorbing it.

When the draft is complete it runs two layers of verification:

1. Reader-question check on every piece: a separate agent with no
   conversation context receives only the draft and the brief's reader
   questions and answers them; a question it cannot answer from the draft
   fails.
2. Execution check on pieces with code: every embedded code block and command
   the brief marks runs as written, in the repository, and produces the stated
   result.

It then revises exactly once, repairing only failed reader questions and
factual errors, and records everything else, such as stylistic remarks and
out-of-scope suggestions, without acting on them. A repair that changes
embedded code reruns that code only.

The handoff is the piece file at the publication's content location. When the
repository serves the publication through a local server, the skill starts or
reuses one, verifies the rendered piece, and shares the address and what to
look at. Reusable style decisions and unresolved items go through
`project-knowledge`. It does not commit, open a pull request, or publish; those
go through the existing `git` skills after the user has read the draft.

### Shared context

- `GLOSSARY.md` is shared with the code workflow: a piece about the product
  uses the product's terms.
- Style and structure decisions that pass the reuse gate become their own
  subject files in `docs/decisions/`, listed in the same index as code
  decisions.
- `project-knowledge` is reused unchanged by all three skills.
- Briefs live in `docs/briefs/<slug>/`, separate from `docs/specs/`, because
  their fields and retirement timing differ from work-unit specs.

### Distribution

The skills live under `skills/writing/<name>/`, are listed in
`.claude-plugin/plugin.json`, are symlinked into `.agents/skills/` and
`.claude/skills/`, and are linked from the README with a short account of the
writing pipeline. The plugin version is bumped.

## Observable acceptance criteria

- The installed skill list exposes `define-publication`, `define-piece`, and
  `draft-piece`, each installable and usable on its own, with no other skill's
  text assumed.
- Given only `/define-publication 제품 블로그를 시작하려고 한다`,
  `define-publication` asks one open question about a concrete reading scene
  and does not create a publication file.
- Given a confirmed complete premise, `define-publication` writes exactly one
  `docs/publications/<slug>.md` covering every approved area, referencing
  `PRODUCT.md` for product facts without copying it.
- Given an existing publication file and a change request,
  `define-publication` revises that file in place and makes consequential
  changes explicit.
- Given a topic and one publication file, `define-piece` opens with a thesis,
  title candidates, and an outline for the user to correct rather than a list
  of questions, and asks at most one consequential question at a time.
- Given two or more publication files, `define-piece` recommends one from the
  topic and confirms before continuing.
- `define-piece` finishes with `docs/briefs/<slug>/brief.md` carrying every
  approved field, including three to five reader questions, and contains no
  body paragraphs.
- Given a brief folder, `draft-piece` writes the piece to the location the
  publication file names and executes every marked code block and command
  before finishing.
- Given a draft whose reader-question check fails on one question,
  `draft-piece` repairs that part, reruns the check, and does not start a
  second revision round for remarks that did not fail a criterion.
- Given a discovery during drafting that changes the thesis or scope,
  `draft-piece` stops with the draft preserved and returns the decision instead
  of editing the brief.
- Given a repository that serves the publication locally, `draft-piece` shares
  a reachable preview address for the rendered piece; when it cannot, it
  reports the launch command and blocker without claiming an address.
- `draft-piece` finishes without committing, opening a pull request, or
  publishing.
- Each skill's frontmatter description carries its trigger conditions, and a
  blind routing check on realistic prompts sends medium-premise requests to
  `define-publication` rather than `define-product`, and single-piece briefing
  to `define-piece` rather than `shape-idea`, while code-shaping prompts still
  reach the code skills.
- Both distribution channels expose the three skills, the README links them,
  and `claude plugin validate . --strict` passes.

## Settled constraints and rationale

- The workflow is medium-neutral in its skill bodies; medium-specific
  conventions, locations, preview, and evidence live in the publication file.
  This is why a new medium adds a file rather than a skill.
- One publication file per medium from the start, under `docs/publications/`,
  because a second medium is likely in the target monorepo and moving a single
  root file later would change every skill path and brief reference.
- A publication splits on readers and promise, not on form. Tutorial versus
  essay inside one blog is a brief-level choice.
- Briefs and specs stay in separate folders: their fields differ and a brief
  retires when the piece is published, on a different cycle from work units.
- The brief folder's slug is the piece's slug. `define-piece` chooses it from
  the working title as an overridable assumption, and `draft-piece` fills the
  `<slug>` in the publication file's content location with it, so the brief
  and the piece stay paired without a per-piece decision from the user.
- Verification is two-layered because prose has no runtime: reader questions
  answered by a context-free agent stand in for runtime evidence, and embedded
  code is a claim the reader will reproduce, so it must actually run.
- One revision pass, then triage, because unbounded editing is the writing
  analogue of review loops the code pipeline already rejects.
- Drafting does not publish, matching `implement`, because publication is the
  user's judgment after reading.
- Names: `define-publication` and `define-piece` reuse this repository's
  meaning of `define` as an interview that settles meaning with the user;
  `draft-piece` says the result is a draft for the user to judge, not a
  finished piece. `shape-*` was dropped as a code-side term with no writing
  meaning; `post`, `article`, and other medium words were dropped to keep the
  names valid for later media.
- The three skills reuse `project-knowledge` rather than a writing-specific
  copy because the glossary and decision index are shared.
- Each skill states its goal, inputs, actions, and completion criteria in
  positive terms, restates every constraint it needs inline, and leaves
  situational method to the model, matching the repository's skill-design
  contract. Fixed procedures appear only where this spec names the failure
  they prevent: the write boundary in `define-piece`, the stop-and-return rule
  and the single revision pass in `draft-piece`.
- A publication file is permanent and current per medium, like `PRODUCT.md`.
  A brief folder lives for one piece and is deleted when that piece is
  published, like a spec folder when its work ships.

## Assumptions

- Exact heading wording inside publication files and briefs is chosen during
  implementation as long as every approved field is easy to find.
- The context-free reader-question agent is whatever subagent mechanism the
  current harness offers; the skill describes the check, not a specific tool.

## Off-limits

- Adding a writing mode to `shape-idea`, `implement`, or `define-product`. The
  code skills stay unchanged.
- A writing-specific glossary or decision index; both are shared.
- A skill referencing another skill's discipline by name instead of restating
  what it needs.
- `draft-piece` editing the brief, running more than one revision pass, or
  committing and publishing.
- Copying `PRODUCT.md` content into a publication file, or product facts into a
  brief.
- A series-splitting skill (the `split-into-tasks` analogue) and a retirement
  pass for published briefs in this work unit.

## Deferred points

- Splitting a long series into separately drafted pieces waits until a real
  series exists.
- Whether `maintain-project-context` learns to retire published briefs, or a
  separate pass does, waits until briefs accumulate.
- Where common author voice lives when a second publication appears is decided
  through `project-knowledge` at that time; the default is a style subject in
  `docs/decisions/`.

## Remaining risks

- The reader-question check depends on the questions being well chosen in the
  brief; vague questions pass vague drafts. `define-piece` must push for
  questions with checkable answers.
- A monorepo whose blog is not about its product weakens the shared-glossary
  benefit; the contract assumes the blog writes about the product.
- Prose variants shown inline can bias the user toward the first one read;
  `define-piece` should keep variants short and the governing difference
  explicit.
