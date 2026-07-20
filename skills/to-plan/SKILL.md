---
name: to-plan
description: "Draft a reviewable implementation plan (plan.md) from a spec folder before implementation. Use when the how deserves review: several plausible approaches, areas that must not be touched, likely retries or delegation, or verification criteria worth pinning down. For work that fits one sitting with an obvious approach, skip it and implement straight from the spec."
---

# To Plan

Turn a spec folder into a reviewed implementation plan. Read spec.md, the
approved prototype if one exists, `GLOSSARY.md`, and `docs/decisions/`,
explore the codebase, then put a complete draft of plan.md in front of the
user to correct. The document is a review surface: its purpose is to draw
out corrections and the decisions only the user can make, before any code
is written.

Every move is a draft. Fill every section yourself, present the whole
draft at once (a review surface works only when seen whole), and raise a
question only for a fork the draft cannot settle, one per turn with a
recommended answer. The user's essential calls are the choice of
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
- **Order**: what lands first and where the work becomes verifiable; when
  the work exceeds one session, how it splits into sequential sessions.
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

Save the approved draft as plan.md beside spec.md. The implementing
session reads the two together; plan mode remains the place to check the
plan against the code as it stands.
