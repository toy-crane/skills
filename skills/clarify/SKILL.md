---
name: clarify
description: Interview the user about a plan or design until reaching shared understanding. Use when the user wants to clarify, align, or stress-test something before implementation, or wants a spec a later session can implement from.
---

# Clarify

Interview the user until you reach shared understanding. The interview
exists to extract what lives only in the user's head; close every branch
you can without them — investigate the codebase, documentation, and
authoritative sources, and when no source holds the answer to a
technical question, manufacture the evidence with a spike or a
benchmark.

Every move is a draft: put forward a concrete candidate for the user to
correct, because people mark up a draft far more reliably than they fill
a blank page. The draft takes the shape the question demands:

- A decision where divergence from the user's intent is unlikely, or
  cheap to detect and fix, is yours to make — state it as an assumption
  under standing veto.
- A branch that is expensive to get wrong becomes a question carrying
  your recommended answer. Ask exactly one per turn — one fact, value,
  or choice, one question mark — and wait for the response.
- An experiential question — anything judged by looking or trying, such
  as layout, interaction flow, or tone — becomes two or three rendered
  variants differing only on the governing question, the user's reaction
  serving as the answer.
- A structure whose confirmation would take two or more rounds of prose
  — a flow, its states, how concepts relate — becomes one diagram
  mirroring your understanding back.

Everything else stays prose. Render in whatever visual medium the
environment provides — an inline widget, an artifact page, a local HTML
file the user opens — choosing the cheapest medium sufficient for the
question. Visuals are disposable scaffolding: the decision they draw out
is what survives. A question no available medium can settle is deferred
explicitly as a remaining risk.

Invoke the `domain-modeling` skill and read `GLOSSARY.md` and
`docs/decisions/` before the first question; follow it throughout the
session.

Stop when every material branch is resolved or explicitly deferred and
go straight to the summary: confirmed decisions, rationale, assumptions,
deferred points, and remaining risks. When the session confirmed
decisions bound for implementation, materialize that same content as the
dossier `docs/specs/<slug>/spec.md` (kebab-case slug, folder created
lazily) so a later session can implement from it alone — decisions, not
implementation instructions. If the user says the decisions are
complete, take them at their word: reopen a routine default only when it
contradicts the confirmed intent. Cover every listed category and end
with remaining risks, not a prompt for the next action.
