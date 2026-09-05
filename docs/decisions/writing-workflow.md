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
- Recommend a publication's voice through one short sample paragraph and a
  concise reason grounded in its known readers and purpose. The user reacts to
  the writing; they need not define tone adjectives or choose a preset first.
  Add alternatives when comparison would help. Keep the recommendation
  unsettled until accepted or corrected, and preserve the accepted sample with
  its confirmed characteristics in the publication's voice context. Shared
  author voice retains its existing style-subject owner.
- Writing context shares `GLOSSARY.md`, `docs/decisions/README.md`, and
  `project-knowledge` with the code workflow. Style and structure decisions
  that pass the reuse gate become their own decision subjects in the shared
  index. The premise file and the brief folder are separate from `PRODUCT.md`
  and `docs/specs/`.
- Writing feedback that explicitly settles a reusable style or structure choice
  is preserved during that correction, without a separate request to remember
  it. Keep the rule, reason, scope, useful contrast examples, and evidence of
  user confirmation in its current canonical context; merge with an existing
  rule rather than accumulating duplicates. Unconfirmed generalizations remain
  proposals. A local edit or repeated occurrence does not by itself authorize
  an author-wide preference.
- Later planning and drafting apply the relevant confirmed rules and accepted
  examples. Keep shared context readable by both Claude and Codex, including
  when a writing skill is installed without `project-knowledge`. Update an
  example when later user feedback replaces or rejects it; Git retains the
  correction history, not a second active feedback log.
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
- Drafting checks confirmed style and structure separately from comprehension.
  Its single automatic revision repairs failed reader questions, factual
  errors, and violations of confirmed applicable writing criteria; unresolved
  taste suggestions remain remarks. The limit bounds autonomous revision, not
  later edits the user requests. Drafting stops before commit, pull request,
  or publication. Publishing goes through the `git` skills after the user reads
  the draft.
- A discovery during drafting that changes the thesis, reader, scope, or a
  reader question returns to `define-piece`; drafting does not edit the brief.
- `draft-piece` also applies bounded user corrections to an existing article.
  When it has no brief, the article and explicit correction supply the scope;
  it preserves unaffected meaning and reports that the full brief-based
  reader-question check was unavailable. It does not invent a brief or prior
  editorial intent.

## Boundaries

- Series splitting, retirement of published briefs, and cross-medium
  adaptation of one piece are not part of the pipeline until a real case
  appears.
- The shared glossary assumes the publication writes about the product that
  shares its repository. A blog unrelated to that product is a reason to
  reopen the sharing decision.
- Simplifying wording preserves the piece's thesis, actors, and causal claims.
  Corrections to those meanings stay with the piece's contract rather than
  becoming writing preferences. A clearly scoped exception affects its piece;
  changing a standing preference requires the user's intent to change it.
- Personal writing preferences belong in the consuming project's context, not
  in the published skill's universal instructions.

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

Tone labels do not show what an AI will write. A short sample makes the
recommendation readable before the user accepts it, and retaining that accepted
sample gives later drafting a concrete reference alongside the voice's wording.
This recommendation concerns voice only; it does not supply missing readers or
invent a promise for the publication.

The toycrane-blog writing and proofreading sessions preserved reusable
corrections only after separate user requests near their ends. The proofreading
session had already loaded the writing decisions and still needed related
corrections. This supports addressing capture timing and application together;
it does not establish an improvement rate. A comprehension pass can coexist
with writing the user rejects, so confirmed writing criteria need their own
comparison within the bounded revision rather than being treated as new taste.

## Reconsider when

- A second publication appears and common author voice starts repeating across
  publication files; move it to a style subject then.
- A real multi-part series makes a piece too large to brief and draft as one
  unit.
- Reader-question checks pass while users reject meaning or confirmed writing
  criteria; inspect which check failed to expose the problem instead of treating
  comprehension as evidence of voice alignment.
- Narrow corrections repeatedly become unwanted standing preferences, or
  accumulated examples make unrelated writing copy their content or voice.

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
- Requiring a tone preset or adjectives before recommending voice — labels
  such as "friendly and calm" leave the actual prose for the user to imagine.
  Labels may describe a sample, but do not replace it.
- Saving every correction as a new global rule — it loses scope and can make
  later writing imitate one piece. Preserve confirmed reusable meaning and its
  representative examples in existing current context.
- Relying on reading the rules or answering reader questions alone — neither
  proves that a draft follows confirmed style and structure criteria.

## Evidence worth preserving

- Forward runs on 2026-09-04 with Claude Fable 5.1 in a fixture repository:
  `define-piece` given only a topic wrote the whole brief in its first turn
  until the skill said to present candidates and wait; the rerun presented a
  thesis, three titles, an outline, and one question, and wrote nothing.
  `draft-piece` on the blog-monorepo fixture wrote the piece, executed both
  marked commands, ran the reader-question check through a fresh-context
  subagent, revised nothing, previewed, and left Git untouched; asked to
  change the thesis mid-draft it stopped without touching the brief.
- A blind routing run of 50 cases, two repeats, with `define-product`,
  `shape-idea`, `implement`, and the three writing skills loaded together:
  no writing skill fired on a code prompt, `define-piece` separated from
  `shape-idea` on 9 of 9, and `draft-piece`'s folder-path prompts activated
  implicitly no more often than `implement`'s, so direct invocation remains
  the reliable route for both.
- A prompt audit against Claude Fable 5.1 removed three restated rules; four
  re-probes (publication opening and write, brief write, draft with single
  revision) behaved identically before and after.
