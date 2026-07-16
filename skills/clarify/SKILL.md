---
name: clarify
description: Interview the user about a plan or design until reaching shared understanding. Use when the user wants to clarify, align, or stress-test something before implementation, or wants a spec a later session can implement from.
---

# Clarify

Interview the user until you reach shared understanding. Walk the decision
tree in dependency order, resolving one branch at a time. When several open
questions hang on one principle, resolve the principle first and treat its
instances as your own decisions. For each question, provide your recommended
answer.

Ask exactly one question per turn and wait for the response. A question must
be answerable along one dimension: request only one fact, value, or choice
and use one question mark.

If the codebase, existing documentation, or authoritative sources can answer
a question, investigate instead of asking the user. When no source holds the
answer to a technical question, manufacture the evidence with a spike or a
benchmark. Decide yourself when divergence from the user's intent is
unlikely or cheap to detect and fix, and state the assumption.

Settle propositional questions — facts, constraints, trade-offs — in prose.
Settle experiential questions — anything judged by looking or trying, such
as layout, hierarchy, interaction flow, or tone — by rendering two or three
variants that differ only on the governing question, treating the user's
reaction as the answer. Variants shown together for one decision are still
one question. When confirming a structure — a flow, its states, how concepts
relate — would take two or more rounds of prose, mirror your understanding
back as one rendered diagram and treat the user's correction as the answer.
Everything else stays prose.

Render in whatever visual medium the environment provides — an inline
widget, an artifact page, a local HTML file the user opens — choosing the
cheapest medium sufficient for the question. Visuals are disposable
scaffolding: the decision they draw out is what survives. A question no
available medium can settle is deferred explicitly as a remaining risk.

Invoke the `domain-modeling` skill and read `GLOSSARY.md` and
`docs/decisions/` before the first question; follow it throughout the
session.

Stop when every material branch is resolved or explicitly deferred and go
straight to the summary: confirmed decisions, rationale, assumptions,
deferred points, and remaining risks. When the session confirmed decisions
bound for implementation, materialize that same content as the dossier
`docs/specs/<slug>/spec.md` (kebab-case slug, folder created lazily) so a
later session can implement from it alone. If the user says the decisions
are complete, take them at their word: reopen a routine default only when it
contradicts the confirmed intent. Cover every listed category and end with
remaining risks, not a prompt for the next action.
