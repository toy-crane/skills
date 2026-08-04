---
name: shape-idea
description: Turn a chosen problem and broad direction into shared decisions and an implementation-ready spec. Use when the user wants to clarify behavior or scope, stress-test an idea, align before implementation, or produce a spec.
---

# Shape Idea

Start from a concrete problem and broad direction.

Resolve questions from available evidence before asking the user.

## Before the first question

Invoke the `project-knowledge` skill. Read `GLOSSARY.md`, then use
`docs/decisions/README.md` to load only the decision subjects relevant to this
work. Follow `project-knowledge` throughout the session.

For a question about an external dependency, check its official documentation,
issue tracker, and release notes before building a workaround. If none answers
the question, run a small technical experiment or benchmark and record which
sources fell short.

When a decision settles on a framework or hosted service, check whether its
vendor publishes official agent context. Install what is missing in the form
the vendor recommends.

## Work from drafts

Present a concrete candidate for the user to correct.

- When divergence from the user's intent is unlikely or cheap to detect, decide
  and state the result as an assumption the user can override. Do not promote an
  AI-chosen assumption to a project decision contract.
- When a branch is expensive to get wrong, ask one question with a recommended
  answer. Ask exactly one question per turn, requesting one fact, value, or
  choice with one question mark, and wait for the response.
- For a choice judged by looking or trying, such as layout, interaction flow, or
  tone, render two or three variants that differ only on that choice. Use the
  user's reaction as the answer. When the question covers a whole surface rather
  than one choice, invoke `build-prototype`.
- When confirming a flow, state model, or relationship would take multiple prose
  rounds, render one diagram of your current understanding.

Keep other decisions in prose. A user's explicit choice becomes a project
decision contract only when it is hard to reverse, surprising without context,
and the result of a real trade-off; feature-local choices stay in the spec.

When stating a decision, include the condition that would overturn it if only
the user can know that condition. Check conditions you can verify yourself.

Use the cheapest sufficient visual medium available. Explicitly defer a question
that no available medium can settle and record it as a remaining risk. When the
user asks for an explanation rather than a decision, invoke `explain-visually`.

## Write boundary

Durable project writes are limited to the spec folder, glossary and current
decision contracts, and installed vendor agent context. Keep technical
experiments, benchmarks, and rendered visuals temporary. Leave product code
unchanged, and record a requested product code change as implementation behavior
or a remaining risk in the spec.

## Surfaces

When work materially changes a visible or interactive surface, inspect the
current surface before settling its design. If a runnable product or preview
already includes the change, exercise its states before closing. Otherwise
render the cheapest sufficient substitute.

Separate verification from user judgment. Verify that the states work, then
present unresolved experiential decisions together for review and wait for the
user's reaction. Skip that review only when the change is routine, the surface
is already confirmed, or the user explicitly delegates it. Record that basis as
an assumption.

## Close

Stop when every implementation-relevant decision is resolved or explicitly
deferred. Summarize confirmed decisions, rationale, assumptions, off-limits
areas, deferred points, and remaining risks.

When decisions are ready for implementation, write the same content to
`docs/specs/<slug>/spec.md`, creating the kebab-case folder when needed. Keep
decisions in the spec, not implementation instructions.

Record off-limits areas and why they must not change. Ask about ownership
boundaries and work in flight rather than inferring them from the code.

If the user says the decisions are complete, accept that unless a routine
default contradicts confirmed intent. End with the summary and remaining risks,
not a prompt for another action.
