# Product context workflow

## User-visible outcomes

- A user starting a from-scratch application with a rough direction can invoke
  `define-product` to draw out the product meaning they already have in mind.
  After the user confirms the complete direction, the skill creates one durable
  root `PRODUCT.md` that gives later AI work the current app-level premise.
- Invoking `define-product` again updates that same product definition with the
  user instead of creating a parallel artifact or silently preserving obsolete
  meaning.
- `shape-idea` uses `PRODUCT.md` when it exists and remains independently usable
  when it does not.
- A user can invoke `maintain-project-context` for a periodic hygiene pass over
  durable project context, including `PRODUCT.md`, terms, decisions, completed
  work-unit records, and always-loaded repository guidance.
- The published workflow no longer offers blank-page opportunity discovery, and
  the former decision-only maintenance name is no longer exposed.

## Approved scope

### Product definition

`define-product` starts from an app direction or problem the user already wants
to pursue. That seed starts an interview rather than supplying every missing
part of the product. The skill begins with a concrete use scene, asks only
questions that could change the app-level meaning, and keeps one current
`PRODUCT.md` containing:

- a one-sentence definition of the app;
- primary users and their usage situations;
- the problem and current alternatives;
- the user change the app promises;
- the recurring core loop;
- app-wide capabilities and product boundaries;
- experience principles;
- success signals;
- material assumptions and unknowns.

The user remains the authority for product meaning. Repository and external
evidence may answer factual questions but cannot replace the user's intended
user, situation, problem, promised change, core loop, boundary, experience
principle, or success signal. The skill asks open questions without recommended
answers while drawing out meaning. If the user has not made a choice, it offers
to leave the point unknown or decide it together; options and recommendations
begin only after the user chooses the latter.

The skill writes only after the user confirms one full draft that distinguishes
directly confirmed meaning, choices made under clearly scoped delegation,
accepted assumptions, and intentional unknowns. A complete initial direction
with an explicit write request may serve as that confirmation when it requires
no material guess and does not conflict with existing meaning. Missing central
meaning continues the interview rather than becoming an automatic assumption
or unknown.

### Work-unit shaping

`shape-idea` reads the root product definition when present and treats it as
app-level context. It owns only the selected work unit and does not create or
edit `PRODUCT.md`. Missing product context does not block it.

### Periodic maintenance

`maintain-project-context` replaces the decision-only maintenance entry point.
It keeps durable context current, concise, and internally consistent without
becoming the semantic owner of the artifacts it touches. It may apply meaning
that an authoritative project source already makes explicit, remove duplication
and obsolete wording, clean up confirmed shipped work-unit records, and surface
conflicts. It leaves ambiguous meaning unchanged and asks for the exact missing
decision or returns deliberate product-definition work to `define-product`.

### Retired entry point

`discover-opportunity` is removed from the published and in-repository skill
set. The supported greenfield flow assumes a rough direction and begins with
`define-product`.

## Observable acceptance criteria

- The installed skill list exposes `define-product` and
  `maintain-project-context`, with each usable as a standalone installation.
- The installed skill list and current documentation contain no invokable
  `discover-opportunity` or decision-only maintenance entry point.
- Given only `/define-product 웹 페이지 URL을 Markdown으로 변환해 LLM으로 바로
  넘기는 서비스.`, `define-product` preserves only that stated direction, asks
  one open question about the actual user, situation, page, and current way of
  getting its content into an LLM, and does not create `PRODUCT.md`.
- Given one answer to that first question while other central meaning remains
  unresolved, `define-product` briefly reflects what became clear and asks the
  next product question instead of completing the file by inference.
- Given a complete app direction, an explicit request to write, and no conflict
  with existing meaning, `define-product` produces the single root file with
  every approved product-content category represented and asks no redundant
  question.
- Given an existing `PRODUCT.md`, `define-product` revises the same file and
  preserves still-current meaning while making consequential changes explicit
  to the user.
- Given no app direction, `define-product` explains that its required seed is
  missing without mining personal traces or manufacturing opportunities.
- Given a repository with `PRODUCT.md`, `shape-idea` reads it before settling a
  work-unit contract and does not copy the whole document into the work-unit
  spec.
- Given a repository without `PRODUCT.md`, `shape-idea` proceeds from the
  concrete work-unit direction without creating the missing file.
- Given duplicated or stale durable context whose current meaning is already
  explicit, `maintain-project-context` safely reconciles it across its approved
  surfaces.
- Given a conflict whose intended meaning is not explicit,
  `maintain-project-context` preserves the conflicting sources and asks one
  precise question instead of choosing from code, timestamps, or silence.
- Both distribution channels expose the same renamed and added skills, their
  user-facing documentation resolves to the published entries, and the plugin
  package validates successfully.

## Settled constraints and rationale

- `PRODUCT.md` is product-only. Technical stack, architecture, data or file
  structure, repository mechanics, implementation plans, individual screens,
  detailed feature requirements, and work-unit acceptance criteria retain their
  existing owners. This keeps app identity stable without making the permanent
  context grow with every feature.
- App-wide capabilities describe durable boundaries rather than a backlog.
  Experience principles describe qualities the product should protect rather
  than a concrete design system.
- Product definition and work-unit shaping remain independent because their
  artifacts have different lifetimes and either skill may be installed alone.
- A rough solution direction grants permission to begin the product interview,
  not permission to infer missing intent. The output fields check the completed
  definition; they are not a fixed questionnaire and do not require the user to
  speak in document terminology.
- Product meaning settles through direct user confirmation or explicit
  delegation for one clearly scoped choice. Silence does not turn a gap into a
  fact, assumption, unknown, or delegated decision.
- Periodic maintenance can edit several durable artifacts but cannot create new
  product meaning or project decisions. File-writing authority does not confer
  decision authority.
- The skill names describe user-visible work rather than output formats:
  `define-product` for deliberate product definition and
  `maintain-project-context` for periodic cross-artifact hygiene.

## Assumptions

- `maintain-project-context` remains available for explicit invocation and may
  activate when durable context has clear accumulation, duplication, conflict,
  or staleness signals. It is not a mandatory gate after every completed work
  unit.
- Presentation details such as exact heading wording in `PRODUCT.md` may be
  chosen during implementation as long as every approved content category stays
  easy for humans and AI agents to find.

## Off-limits

- Blank-page idea generation, personal-trace mining, and opportunity search.
- Folding product definition into `shape-idea` or making `PRODUCT.md` mandatory
  for work-unit shaping.
- Turning `PRODUCT.md` into a marketing one-pager, technical overview, roadmap,
  feature catalog, or work-unit spec.
- Inferring product intent or a settled project decision from shipped code,
  document recency, or lack of objection.
- Completing unspoken product meaning from a rough solution, leading the user
  with recommended answers during the interview, or writing `PRODUCT.md` while
  its central user, situation, problem, current alternative, promised change,
  or core loop remains a guess.
- Keeping compatibility aliases for the retired or renamed entry points in the
  current published skill set.

## Deferred points

None.

## Remaining risks

- `maintain-project-context` and the background `project-knowledge` capability
  both touch durable knowledge. Their triggers must make the distinction between
  incremental capture and periodic cross-artifact hygiene apparent.
- Product context can still drift between maintenance passes when a product
  change is settled outside `define-product` but never recorded in an
  authoritative project artifact.
- An interview can become tiring if the skill repeats full summaries or asks
  about fields that do not change later work. It must reflect only newly learned
  meaning each round and keep non-material gaps out of the conversation.
