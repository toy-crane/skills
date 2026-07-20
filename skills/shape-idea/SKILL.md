---
name: shape-idea
description: Shape a chosen idea or opportunity into shared, implementation-ready decisions. Use when the user can already name the problem or intended change and has a broad direction, but wants to clarify, align, or stress-test behavior and scope before implementation, or wants a spec a later session can implement from. If the user does not yet know what to build, use discover-opportunity instead.
---

# Shape Idea

Shape the user's chosen idea until you reach shared understanding. When no
concrete problem or intended change is chosen and no broad direction can be
named, invoke `discover-opportunity` and do not manufacture a spec from the
blank page.
When discovery just established a direction, carry its conversational summary
forward without requiring an intermediate document. The interview exists to
extract what lives only in the user's head, so close every branch you can
without them. Investigate the codebase, documentation,
and authoritative sources, and when no source holds the answer to a
technical question, manufacture the evidence with a spike or a
benchmark.

Every move is a draft: put forward a concrete candidate for the user to
correct, because people mark up a draft far more reliably than they fill
a blank page. The draft takes the shape the question demands:

- When divergence from the user's intent is unlikely, or cheap to
  detect and fix, the decision is yours to make. State it as an
  assumption under standing veto.
- A branch that is expensive to get wrong becomes a question carrying
  your recommended answer. Ask exactly one per turn, requesting one
  fact, value, or choice with one question mark, and wait for the
  response.
- An experiential question (anything judged by looking or trying:
  layout, interaction flow, tone) becomes two or three rendered
  variants that differ only on the governing question, with the user's
  reaction serving as the answer. When the question outgrows variants
  (a whole surface rather than one choice), invoke the
  `build-prototype` skill.
- A structure whose confirmation would take two or more rounds of
  prose (a flow, its states, how concepts relate) becomes one diagram
  mirroring your understanding back.

Everything else stays prose. Render in whatever visual medium the
environment provides (an inline widget, an artifact page, a local HTML
file the user opens), choosing the cheapest medium sufficient for the
question. Visuals are disposable scaffolding: the decision they draw
out is what survives. A question no available medium can settle is
deferred explicitly as a remaining risk.

When work materially changes a visible or interactive surface, inspect
the current surface before settling its design. When a runnable product
or preview already contains the change, exercise its states before
closing; otherwise render the cheapest sufficient substitute without
beginning production implementation. Keep self-verification and user
judgment separate: verify that the states work, then present unresolved
experiential decisions, batch related decisions into one review, and
wait for the user's reaction. Skip that review only when the change is
routine, the surface is already confirmed, or the user explicitly
delegates it; record the basis as an assumption.

Invoke the `domain-modeling` skill and read `GLOSSARY.md` and
`docs/decisions/` before the first question; follow it throughout the
session.

Stop when every material branch is resolved or explicitly deferred and
go straight to the summary: confirmed decisions, rationale, assumptions,
deferred points, and remaining risks. When the session confirmed
decisions bound for implementation, materialize that same content as the
spec folder `docs/specs/<slug>/spec.md` (kebab-case slug, folder created
lazily) so a later session can implement from it alone. The spec holds
decisions, not implementation instructions; link the opportunity handoff
when the user supplied one. If the user says the
decisions are complete, take them at their word: reopen a routine
default only when it contradicts the confirmed intent. Cover every
listed category and end with remaining risks, not a prompt for the next
action.
