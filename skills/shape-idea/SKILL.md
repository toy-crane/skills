---
name: shape-idea
description: Shape a chosen idea or opportunity into shared, implementation-ready decisions. Use when the user can already name the problem or intended change and has a broad direction, but wants to clarify, align, or stress-test behavior and scope before implementation, or wants a spec a later session can implement from. If the user does not yet know what to build, tell them to invoke discover-opportunity instead.
---

# Shape Idea

Shape the user's chosen idea until you and the user understand it the same way.
If the user cannot yet name a concrete problem or a broad direction, send them to
`discover-opportunity`. Do not invoke it for them, and do not manufacture a spec
from a blank page. When discovery just established a direction, carry its
conversational summary forward; it needs no intermediate document.

The interview exists to extract what lives only in the user's head. So close
every branch you can without them.

## Before the first question

Invoke the `knowledge-layer` skill and read `GLOSSARY.md` and
`docs/decisions/`. Follow knowledge-layer throughout the session.

Investigate the codebase, the documentation, and authoritative sources. When no
source holds the answer to a technical question, make the evidence yourself with
a spike or a benchmark.

When a decision lands the work on a framework or hosted service, check whether
its vendor publishes official agent context: a skill, an AGENTS.md codemod,
bundled docs. Install what is missing, in the form the vendor recommends. Vendor
knowledge that matches the version beats training data, and it equips every later
session, not just this one.

## Every move is a draft

Put forward a concrete candidate for the user to correct. People mark up a draft
far more reliably than they fill a blank page. The draft takes the shape the
question demands.

- When divergence from the user's intent is unlikely, or cheap to detect and fix,
  the decision is yours. State it as an assumption under standing veto.
- A branch that is expensive to get wrong becomes a question carrying your
  recommended answer. Ask exactly one per turn, requesting one fact, value, or
  choice with one question mark, and wait for the response.
- An experiential question (anything judged by looking or trying: layout,
  interaction flow, tone) becomes two or three rendered variants that differ only
  on the governing question. The user's reaction is the answer. When the question
  outgrows variants — a whole surface rather than one choice — invoke the
  `build-prototype` skill.
- A structure whose confirmation would take two or more rounds of prose (a flow,
  its states, how concepts relate) becomes one diagram mirroring your
  understanding back.

Everything else stays prose.

State a decision with the condition that would overturn it, when only the user
can know that condition. A condition you can check yourself is not one to state:
go check it.

Render in whatever visual medium the environment provides: an inline widget, an
artifact page, a local HTML file the user opens. Pick the cheapest one sufficient
for the question. Defer a question no available medium can settle, explicitly, as
a remaining risk. When the user asks you to explain something rather than to
confirm it, invoke the `explain-visually` skill.

## What you may write

Shaping writes documents, not source. Its durable writes to the project are the
spec folder, the glossary and decision records, and installed vendor agent
context. Nothing else.

Spikes, benchmarks, and rendered visuals are disposable. They leave the project's
code as they found it. The decision they draw out survives; the artifact does
not.

Changing the product's code is implementation, however small the edit looks, and
it belongs to the session that builds from the spec. When a fix begs to be made
on the spot, record it as a decision or a remaining risk instead.

## Surfaces

When work materially changes a visible or interactive surface, inspect the
current surface before settling its design. When a runnable product or preview
already contains the change, exercise its states before closing. Otherwise render
the cheapest sufficient substitute.

Keep your own verification separate from the user's judgment. Verify the states
work. Then present the experiential decisions still open, batched into one review,
and wait for the user's reaction. Skip that review only when the change is
routine, the surface is already confirmed, or the user delegates it explicitly.
Record the basis as an assumption.

## Closing

Stop when every material branch is resolved or explicitly deferred. Go straight
to the summary: confirmed decisions, rationale, assumptions, off-limits areas,
deferred points, and remaining risks.

When the session confirmed decisions bound for implementation, write that same
content to `docs/specs/<slug>/spec.md` (kebab-case slug, folder created lazily),
so a later session can implement from it alone. The spec holds decisions, not
implementation instructions. Link the opportunity handoff when the user supplied
one.

Off-limits areas belong in the spec too: what this work must not touch, and why.
Ownership boundaries and work in flight elsewhere are invisible in the code, so
ask rather than infer.

If the user says the decisions are complete, take them at their word. Reopen a
routine default only when it contradicts the confirmed intent. Cover every listed
category, and end with remaining risks rather than a prompt for the next action.
