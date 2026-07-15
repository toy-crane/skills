---
name: clarify
description: Align intent before action by resolving consequential uncertainty in a plan or design. Use for clarification or stress-testing before implementation.
---

# Minimum sufficient alignment

Find the consequential gaps between the user's intent and the work you intend to do, spending as little human attention as the risk permits. The target is **minimum sufficient alignment**: enough shared understanding to act faithfully, not an exhaustive specification.

Choose the depth adaptively from the stakes and uncertainty of the work. Keep that calibration inside the skill so the user can focus on their intent.

## 1. Build a decision map

Do the legwork first: inspect the environment, existing code, documents, and available tools for facts the user should not have to supply. Extract the user's stated outcome, governing principles, hard constraints, and non-goals. Map the remaining choices and their dependencies.

Classify each open point:

- **Fact** — discover it from the environment or an authoritative source.
- **Human decision** — a goal, preference, hard constraint, organisation-specific rule, or costly and difficult-to-reverse trade-off.
- **Agent decision** — a standard safety measure, implementation detail, reversible default, or choice strongly implied by prior decisions.
- **Deferred** — outside the current outcome and safe to leave unresolved.

Apply the **divergence test** before spending the user's attention. A question is warranted when multiple plausible interpretations remain, those interpretations produce materially different outcomes, choosing incorrectly would be costly or difficult to reverse, and prior context cannot select among them. Otherwise, make a sensible agent decision and reserve only its material consequence for the alignment brief.

This step is complete when every material branch is classified and factual gaps have been investigated rather than delegated to the user.

## 2. Resolve consequential divergence

Ask one question at a time and wait for the answer. Each question should resolve one decision, even when brief context or alternatives are needed to make the trade-off clear.

Prefer upstream questions about outcomes, priorities, failure modes, and trade-offs; one governing principle should collapse several downstream branches. Propagate each answer through the decision map before asking again.

Use two kinds of question deliberately:

- **Discovery** — when the user's governing preference is still unknown, ask neutrally. Concrete scenarios and counterexamples reveal priorities better than asking for approval of an agent-authored answer.
- **Convergence** — once the relevant preference is known, recommend the choice that follows from it and name the meaningful trade-off. Ground the recommendation in what the user already said.

Treat a terse confirmation as sufficient when the decision and its consequence were visible. For a consequential ambiguity that still admits competing interpretations, test the understanding with a concrete scenario rather than accumulating approvals.

Move on when the user's principles select among the material interpretations and everything left is low-impact, reversible, strongly implied, or deferred.

## 3. Capture durable knowledge

Use the `/domain-modeling` skill when a canonical domain term or durable decision actually crystallises. Record real domain language when it resolves, and let that skill's criteria decide whether a decision deserves a long-lived record.

Use the conversation as the working model. Update broader specifications at coherent branch checkpoints or in the final alignment brief, and group related documentation under the repository's commit policy. This keeps durable knowledge without turning each answer or implementation default into permanent ceremony.

This step is complete when agreed durable knowledge is preserved and temporary interview mechanics have stayed out of the domain model.

## 4. Present the alignment brief

As soon as minimum sufficient alignment is reached, present a concise proposal:

### Confirmed intent

- The outcome, governing principles, hard constraints, and non-goals learned from the user.

### Intended decisions

- The material decisions you intend to make, including consequential defaults you derived yourself.
- For a non-obvious choice, connect it to the user's principle and name what it trades away.

### Boundaries and remaining uncertainty

- Deferred scope, assumptions that remain changeable, and risks the user should know before work begins.

Ask the user what you have misunderstood or what they would change. Revise the brief when a correction changes the intended work. Begin the requested work only after the user explicitly confirms the shared understanding; when clarification itself is the whole request, the confirmed brief is the completed result.

The skill is complete when the user can predict the material result you intend to produce, has had one clear opportunity to correct it, and explicitly confirms the shared understanding.
