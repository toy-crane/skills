# Writing workflow

## Decisions

- The writing pipeline mirrors the code pipeline's structure with its own
  skills: `define-publication` settles a medium's standing premise,
  `define-piece` settles one piece's brief, and `draft-piece` writes the piece
  from that brief. It shares concepts with `define-product`, `shape-idea`, and
  `implement`, never their text.
- Skill bodies are medium-neutral. Everything that differs by medium, such as
  form and length conventions, where finished pieces live, how they are
  previewed, and what evidences a finished piece, lives in the publication
  file. A new medium adds `docs/publications/<slug>.md`, not a skill.
- One publication file per medium from the first medium, under
  `docs/publications/`. A publication splits on readers and promise, not on
  form.
- Writing context shares `GLOSSARY.md`, `docs/decisions/README.md`, and
  `project-knowledge` with the code workflow. Style and structure decisions
  that pass the reuse gate become their own decision subjects in the shared
  index. The premise file and the brief folder are separate from `PRODUCT.md`
  and `docs/specs/`.
- Briefs live in `docs/briefs/<slug>/brief.md` and record what the piece must
  do, never body prose. A brief retires when its piece is published.
- The brief folder's slug is the piece's slug: `define-piece` picks it from the
  working title as an overridable assumption, and `draft-piece` substitutes it
  into the publication file's content location. The user settles nothing per
  piece; the location is fixed once per publication.
- A finished draft is evidenced in two layers: reader questions from the brief
  answered by an agent that sees only the draft, on every piece; and execution
  of every embedded code block and command as written, on pieces carrying
  code.
- Drafting revises once, repairing only failed reader questions and factual
  errors, records the rest, and stops before commit, pull request, or
  publication. Publishing goes through the `git` skills after the user reads
  the draft.
- A discovery during drafting that changes the thesis, reader, scope, or a
  reader question returns to `define-piece`; drafting does not edit the brief.

## Boundaries

- Series splitting, retirement of published briefs, and cross-medium
  adaptation of one piece are not part of the pipeline until a real case
  appears.
- The shared glossary assumes the publication writes about the product that
  shares its repository. A blog unrelated to that product is a reason to
  reopen the sharing decision.

## Why

Prose has no runtime, so the code pipeline's evidence had to be translated
rather than copied: reader questions stand in for observed behavior, and
embedded code is a claim the reader will reproduce. Keeping medium specifics in
publication files lets one skill set serve a blog today and a newsletter or
brand site later without renaming anything, which matters because renaming a
published skill in this repository touches the manifest, symlinks,
documentation, and every copy-in install. Sharing the glossary and decision
index is the concrete benefit of the monorepo: the product's words and the
writing's words stay the same words.

## Reconsider when

- A second publication appears and common author voice starts repeating across
  publication files; move it to a style subject then.
- A real multi-part series makes a piece too large to brief and draft as one
  unit.
- The reader-question check passes drafts the user rejects on reading; the
  questions, not the mechanism, are the first suspect.

## Still-rejected alternatives

- A writing mode inside `shape-idea` and `implement` — every evidence,
  handoff, and review sentence in those skills is code-shaped, so the mode
  would be a second skill hidden in a conditional.
- A separate repository for writing skills — the target project is a monorepo
  holding the blog beside the code, so the skills install together and share
  context.
- One root premise file, moved to a folder when a second medium appears — the
  move would change every skill path and brief reference; the target monorepo
  is likely to hold several media.
- Reusing `docs/specs/` for briefs — fields and retirement timing differ.
- Deriving the piece file's slug from the final title — it would be chosen a
  second time at drafting and could drift from the brief folder; revisit if
  publications need title-derived URLs that the brief slug cannot serve.
- Unbounded revision until the reviewer is silent — the writing analogue of the
  review loops the code pipeline already rejects.
