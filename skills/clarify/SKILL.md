---
name: clarify
description: Interview the user about a plan or design until reaching shared understanding, while challenging it against project evidence and maintaining durable domain memory. Use when the user wants to clarify, align, or stress-test something before implementation.
---

# Clarify

Interview the user until you reach shared understanding. Walk the decision
tree in dependency order, resolving one branch at a time. For each question,
provide your recommended answer.

Ask exactly one question per turn, never bundle multiple questions into one
message, and wait for the response. A question must be answerable along one
dimension: request only one fact, value, or choice and use one question mark.
Do not hide a checklist of inputs beneath it.

If the codebase, existing documentation, or authoritative sources can answer
a question, investigate instead of asking the user. Make reversible choices
or choices strongly implied by prior decisions yourself, and state the
assumption.

Use `/domain-modeling` throughout the session: load existing project memory
before questioning, challenge terminology and decisions that conflict with
it, and persist resolved terms and qualifying decisions as they crystallize.
Do not batch memory updates at the end.

When the user cannot reliably decide without seeing or trying alternatives,
use `/prototype` for that one question. Treat the user's reaction as the
answer, persist any durable learning through `/domain-modeling`, then resume
the interview.

Stop when every material branch is resolved or explicitly deferred. Summarize
the confirmed decisions, rationale, assumptions, deferred points, and
remaining risks. When no material branch remains, do not invent another
question or request confirmation. If the user says the decisions are complete
or asks for a summary, do not reopen routine defaults unless they contradict
the confirmed intent. Cover every listed category and end with remaining
risks, not a prompt for the next action.
