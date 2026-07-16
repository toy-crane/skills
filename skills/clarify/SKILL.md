---
name: clarify
description: Interview the user about a plan or design until reaching shared understanding, while challenging it against project evidence and maintaining the project's glossary and decision records. Use when the user wants to clarify, align, or stress-test something before implementation, or wants a spec a later session can implement from.
---

# Clarify

Interview the user until you reach shared understanding. Walk the decision
tree in dependency order, resolving one branch at a time. When several open
questions hang on one principle, resolve the principle first and treat its
instances as your own decisions. For each question, provide your recommended
answer.

Ask exactly one question per turn and wait for the response. A question must
be answerable along one dimension: request only one fact, value, or choice
and use one question mark. Do not hide a checklist of inputs beneath it.

If the codebase, existing documentation, or authoritative sources can answer
a question, investigate instead of asking the user. When no source holds the
answer to a technical question, manufacture the evidence with a spike or a
benchmark. Decide yourself when divergence from the user's intent is
unlikely or cheap to detect and fix, and state the assumption.

Match the medium to the kind of question. Settle propositional questions —
facts, constraints, trade-offs — in prose. Settle experiential questions —
anything judged by looking or trying, such as layout, hierarchy, interaction
flow, or tone — by rendering two or three variants that differ only on the
governing question, treating the user's reaction as the answer. Variants
shown together for one decision are still one question. When confirming a
structure — a flow, its states, how concepts relate — would take two or more
rounds of prose, mirror your understanding back as one rendered diagram and
treat the user's correction as the answer. Everything else stays prose.

Render in whatever visual medium the environment provides — an inline
widget, an artifact page, a local HTML file the user opens — choosing the
cheapest medium sufficient for the question and escalating fidelity only
when the question itself demands it. Visuals are disposable scaffolding:
they exist to draw the reaction, and the recorded decision is what survives.
A question no available medium can settle is deferred explicitly as a
remaining risk, never settled by approximation.

Invoke the `domain-modeling` skill before the first question and follow it
throughout the session: read `GLOSSARY.md` and `docs/decisions/` before
questioning, challenge terminology and decisions that conflict with them,
and record resolved terms and qualifying decisions there the moment they
crystallize.

Stop when every material branch is resolved or explicitly deferred.
Summarize the confirmed decisions, rationale, assumptions, deferred points,
and remaining risks; when the session confirmed decisions bound for
implementation, materialize that same content as the dossier
`docs/specs/<slug>/spec.md` (kebab-case slug, folder created lazily) so a
later session can implement from it alone. When no material branch remains,
do not invent another question or request confirmation. If the user says the
decisions are complete or asks for a summary, do not reopen routine defaults
unless they contradict the confirmed intent. Cover every listed category and
end with remaining risks, not a prompt for the next action.
