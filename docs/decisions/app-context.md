# App context

## Decisions

- `PRODUCT.md` at the repository root is the single canonical app-level
  context file.
- The app-level context is a concise, product-only account of the application.
  It carries:
  - a one-sentence definition of the app
  - primary users and the situations in which they use it
  - the problem and current alternatives
  - the user change the app promises
  - the app's recurring core loop
  - app-wide capabilities and product boundaries
  - user-experience principles
  - success signals
  - material assumptions and unknowns
- Keep the document current as the product premise changes. Record unsupported
  beliefs only as user-accepted assumptions or intentional unknowns instead of
  turning them into product facts.
- The user remains the authority for product meaning. A rough direction starts
  the `define-product` interview but does not authorize the AI to infer an
  unstated user, situation, problem, current alternative, promised change, core
  loop, boundary, experience principle, or success signal. Product meaning is
  settled through the user's direct confirmation or explicit delegation for a
  clearly scoped choice.
- The document fields are a check on the completed definition, not a
  questionnaire. `define-product` starts from a concrete use scene, asks only
  questions whose answers could change the product, and uses the user's natural
  answers to draft the fields.
- `define-product` owns deliberate product-definition work: it creates the file
  and revises its product meaning with the user. It writes only after the user
  confirms the full direction; a complete initial direction plus an explicit
  request to write may serve as that confirmation when no material meaning has
  to be guessed. `maintain-project-context` may periodically remove duplication,
  reconcile wording with already-settled product decisions, and surface stale
  or conflicting claims, but it must not infer new product intent from code,
  shipped work, or silence.
- `shape-idea` reads `PRODUCT.md` when it exists but does not create or edit it.

## Boundaries

- Exclude technology stacks, architecture, database or file structure,
  repository mechanics, implementation plans, individual screens, detailed
  feature requirements, and work-unit acceptance criteria.
- Experience principles describe how using the product should feel or what the
  experience should protect. Concrete visual systems, component rules, and
  screen designs belong in their existing project or work-unit artifacts.
- App-wide capabilities describe stable product boundaries rather than a
  catalog of planned features.
- Missing information does not become an assumption or unknown through silence.
  Record it in that state only after the user accepts the assumption or chooses
  to leave the point unknown. If the central user, situation, problem, current
  alternative, promised change, or core loop remains a guess, continue the
  interview instead of creating `PRODUCT.md`.
- A maintenance pass may edit the file without reopening product definition
  only when the resulting meaning is already explicit in authoritative project
  context. Ambiguous changes return to the user or `define-product`.

## Why

The context exists to preserve what the app is and why it matters across many
work units. Mixing technical and work-unit detail into the same always-relevant
surface makes it grow, stale, and compete with the specific context later work
needs. A product-only boundary gives shaping a stable premise without replacing
specs, project decisions, repository instructions, or stack documentation.

A root `PRODUCT.md` gives human collaborators and different agent harnesses one
predictable, vendor-neutral address without conflating product meaning with the
repository usage guide or a work-unit spec.

The interview protects a different boundary from work-unit shaping: the product
direction already exists in the user's head, so the task is to draw it out
without replacing it with a smooth AI completion. Starting from an actual use
scene reveals the user's situation and current behavior without anchoring them
to an invented audience or solution detail.

## Reconsider when

- Repeated shaping sessions cannot recover an app-wide product constraint from
  this content without reopening the same product question.
- The document routinely grows beyond a quickly reviewable product overview or
  duplicates another authoritative artifact.

## Still-rejected alternatives

- A broad project-knowledge file mixing product, stack, architecture, data, and
  visual rules — those subjects change at different rates and already have
  separate owners in the workflow.
- A marketing one-pager — persuasion, company background, and sales calls to
  action do not help an AI preserve the product premise for later work.
- A vendor-specific context path or `docs/product.md` — the canonical product
  premise becomes less predictable to find across repositories and harnesses.

## Evidence worth preserving

- Three fresh runs received only `/define-product 웹 페이지 URL을 Markdown으로
  변환해 LLM으로 바로 넘기는 서비스.` Two immediately wrote `PRODUCT.md` and
  invented users, current workarounds, boundaries, experience principles, and
  success signals. The third waited for one answer but first invented the same
  kinds of meaning and recommended a transfer method. This repeated failure
  justifies an explicit interview and confirmation boundary.
- [Kiro steering](https://kiro.dev/docs/steering/) separates `product.md` from
  `tech.md` and `structure.md`, while loading all three as persistent project
  context.
- [Replit custom templates](https://docs.replit.com/teams/custom-templates)
  document a mutable `replit.md` as living project context, and
  [Lovable project knowledge](https://docs.lovable.dev/features/knowledge)
  recommends keeping persistent project knowledge concise and current.
