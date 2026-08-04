---
name: shape-idea
description: Turn a chosen problem and broad direction into shared decisions and an implementation-ready spec. Use when the user wants to clarify behavior or scope, stress-test an idea, align before implementation, or produce a spec.
---

# Shape Idea

Shape a concrete problem and broad direction into implementation-ready
decisions.

## Stay in shaping

Durable project writes are limited to the spec folder, glossary, current
decision contracts, and installed vendor agent context. Leave product code
unchanged.

Keep technical experiments, benchmarks, variants, comparison renders, and
component previews temporary. Preserve `prototype.html` only when the artifact
covers the whole surface and the user explicitly approves it as the prototype.

Translate confirmed product-change requests into required behavior in the spec.
Record unresolved requests as deferred points and their possible impact as
remaining risks.

## Establish project truth

Before the first question, invoke `project-knowledge` and apply it throughout the
session. If it is unavailable, do not skip its responsibilities: read
`GLOSSARY.md` when present, use `docs/decisions/README.md` to load only relevant
decision subjects when present, update confirmed terms, surface terminology or
decision conflicts for human resolution, and apply the authority rules below.

Use available evidence to resolve what you can before asking the user.

For a question about an external dependency, check its official documentation,
issue tracker, and release notes before building a workaround. If none answers
the question, run a small technical experiment or benchmark and record which
sources fell short.

When a decision settles on a framework or hosted service, check whether its
vendor publishes official agent context. Install what is missing in the form
the vendor recommends.

## Choose a decision form

Present a concrete candidate for the user to correct.

- When a choice is inexpensive to reverse and a mismatch with the user's intent
  is unlikely or easy to detect, decide and state the result as an assumption
  the user can override. Do not promote an AI-chosen assumption to a project
  decision contract.
- When a branch is expensive to get wrong, ask exactly one question per turn.
  Request one fact, value, or choice, include a recommended answer with a concise
  reason, and wait for the response.
- For a choice judged by looking or trying, such as layout, interaction flow, or
  tone, render two or three variants that differ only on that choice. Use the
  user's reaction as the answer. When the question covers a whole surface rather
  than one choice, invoke `build-prototype`. If it is unavailable, defer the
  whole-surface decision instead of treating a partial render as approval.
- When a flow, state model, or relationship has multiple branches, transitions,
  or links, render one diagram before moving to a downstream decision. Ask at
  most one question about an unresolved part of the diagram and wait for the
  response. Keep a linear structure that fits in one sentence in prose.

Keep all other decisions in prose.

## Preserve human authority

A user's explicit choice becomes a project decision contract only when it is
hard to reverse, surprising without context, and the result of a real trade-off;
feature-local choices stay in the spec.

When a proposed decision depends on information only the user can know, state
that information and ask whether it applies. Verify any condition you can check
yourself.

## Make rendered decisions trustworthy

Use the lowest-effort available visual medium that can resolve the question. If
no available visual medium can make an experiential question judgeable, defer
the decision explicitly and record the unresolved uncertainty as a remaining
risk.

When the user asks for an explanation rather than a decision, invoke
`explain-visually`. If it is unavailable, answer in one sentence when that is
sufficient; otherwise use the best available renderer.

When settling a visible or interactive decision, inspect the current surface
first. Use a runnable product or preview when it contains the candidate change;
otherwise render a sufficient substitute.

Separate verification from user judgment. Verify only the states needed to make
the comparison trustworthy. Present the variants for one unresolved
experiential decision together, then wait for the user's reaction.

Skip review only when the change follows an already confirmed pattern, affects
only routine presentation details, or the user explicitly delegates the
judgment. Record the reason, treating only agent-judged reasons as assumptions.

## Close autonomously

Stop asking questions as soon as every implementation-relevant decision is
resolved or explicitly deferred. Do not wait for the user to declare completion.
Summarize confirmed decisions, rationale, assumptions, any off-limits areas and
why, deferred points, and remaining risks.

When decisions are ready for implementation, write the same content to
`docs/specs/<slug>/spec.md`, creating the kebab-case folder when needed. Keep
decisions in the spec, not implementation instructions.

Do not prompt for another action after the summary and remaining risks.
