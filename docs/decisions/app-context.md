# App context

## Decisions

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
- Keep the document current as the product premise changes. State unsupported
  beliefs as assumptions or unknowns instead of turning them into product facts.

## Boundaries

- Exclude technology stacks, architecture, database or file structure,
  repository mechanics, implementation plans, individual screens, detailed
  feature requirements, and work-unit acceptance criteria.
- Experience principles describe how using the product should feel or what the
  experience should protect. Concrete visual systems, component rules, and
  screen designs belong in their existing project or work-unit artifacts.
- App-wide capabilities describe stable product boundaries rather than a
  catalog of planned features.

## Why

The context exists to preserve what the app is and why it matters across many
work units. Mixing technical and work-unit detail into the same always-relevant
surface makes it grow, stale, and compete with the specific context later work
needs. A product-only boundary gives shaping a stable premise without replacing
specs, project decisions, repository instructions, or stack documentation.

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

## Evidence worth preserving

- [Kiro steering](https://kiro.dev/docs/steering/) separates `product.md` from
  `tech.md` and `structure.md`, while loading all three as persistent project
  context.
- [Replit custom templates](https://docs.replit.com/teams/custom-templates)
  document a mutable `replit.md` as living project context, and
  [Lovable project knowledge](https://docs.lovable.dev/features/knowledge)
  recommends keeping persistent project knowledge concise and current.
