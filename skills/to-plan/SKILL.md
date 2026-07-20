---
name: to-plan
description: "Draft a reviewable implementation plan (plan.md) from a spec folder before implementation. Use when the how deserves review: several plausible approaches, areas that must not be touched, likely retries or delegation, or verification criteria worth pinning down. Needs an existing spec folder; for work that fits one sitting with an obvious approach, skip it and implement straight from the spec."
---

# To Plan

Turn a spec folder into a reviewed implementation plan. Spec folders live
at `docs/specs/<slug>/`: when none is named, list the candidates and ask
which; when none exists, stop and say a spec is needed first, rather than
planning from conversation. Read the folder's spec.md and approved
prototype, plus `GLOSSARY.md` and `docs/decisions/` where the repo keeps
them, explore the codebase, then draft plan.md and put it in front of the
user to correct. The document is a review surface: its purpose is to draw
out corrections and the decisions only the user can make, before any code
is written.

Every move is a draft. Fill every section yourself and present the draft
whole, because the sections constrain each other: an approach cannot be
judged apart from the criteria and off-limits areas it must satisfy.
Raise a question only for a fork the draft cannot settle, one per turn
with a recommended answer; each answer can reshape the draft and dissolve
the questions behind it. The user's essential calls are the choice of
approach, whether the acceptance criteria are sufficient to mean done,
off-limits areas invisible in the code, and which risks to accept;
everything else is yours under standing veto.

plan.md opens with this contract, verbatim:

> The code is the terrain and this plan is a map: where they disagree, the
> terrain wins. A divergence at the decision level flows back to spec.md
> instead of being worked around.

Then six sections:

- **Approach**: the chosen strategy and why, with the rejected
  alternatives one line each.
- **Order**: what lands first and where the work becomes verifiable; work
  exceeding one session splits at session grain, never into a pre-cut
  task list, whose predictions rot as execution learns the terrain.
- **Acceptance criteria**: observable conditions that define done, as a
  checklist the implementing session can self-grade against.
- **Verification and seams**: where tests grip the system and at what
  height. Prefer existing seams; the fewer and higher they are, the freer
  the implementation stays to refactor beneath them.
- **Off-limits**: what this work must not touch, and why.
- **Risks and open questions**: what may surface mid-implementation,
  especially anything that would flow back to the spec.

Keep the document to about a page; a review surface longer than that gets
stamped instead of read. Name modules and behavior, never file paths or
code snippets, which rot as the code moves. The one exception is a
prototype-produced snippet that encodes a decision more precisely than
prose can (a schema shape, a state machine), trimmed to its decision-rich
part.

Keep the draft in the conversation and write plan.md beside spec.md only
once the user approves, so an interrupted review never leaves a
half-agreed file looking authoritative; when plan.md already exists,
present the new draft as a revision of it. The implementing session reads
spec and plan together; plan mode remains the place to check the plan
against the code as it stands.
