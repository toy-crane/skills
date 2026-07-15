---
name: clarify
description: Align intent before action by resolving consequential uncertainty in a plan or design. Use for clarification or stress-testing before implementation.
---

# Minimum sufficient alignment

Reach **minimum sufficient alignment** by resolving the consequential gaps between the user's intent and the work you intend to do, with human attention proportional to risk. Calibrate the depth to the stakes and uncertainty so the user can focus on their intent.

## 1. Build the material decision map

Do the relevant legwork first: inspect the environment, existing artifacts, and authoritative sources for facts that would otherwise become questions. Extract the user's stated outcome, governing principles, hard constraints, and non-goals.

Identify only the open points whose plausible resolutions would materially change the intended work, together with their dependencies.

Route each open point:

- **Fact** — investigate it from the environment or an authoritative source.
- **Deferred** — leave it unresolved because it cannot materially affect the current outcome.
- **Decision candidate** — apply the divergence test to determine who should decide it.

A decision candidate becomes a **Human decision** when multiple plausible interpretations remain, those interpretations produce materially different outcomes, choosing incorrectly would cause meaningful rework or a difficult reversal, and prior context cannot select among them.

Otherwise, treat it as an **Agent decision**: choose a sensible safety measure, implementation detail, reversible default, or option strongly implied by prior decisions. Reserve only its material consequence for the alignment brief.

This step is complete when relevant facts have been investigated, every material decision candidate has been routed to the human or the agent, and deferred points are safely outside the current outcome.

## 2. Resolve consequential divergence

Ask one upstream question at a time, choosing the governing uncertainty that can collapse the most downstream decisions. Wait for the answer, then propagate it through the decision map before asking again.

Use two kinds of question deliberately:

- **Discovery** — when the user's governing preference is still unknown, ask neutrally. Concrete scenarios and counterexamples reveal priorities better than asking for approval of an agent-authored answer.
- **Convergence** — once the relevant preference is known, recommend the choice that follows from the user's expressed preference and name the meaningful trade-off.

Treat a terse confirmation as sufficient when the decision and its consequence were visible. For a consequential ambiguity that still admits competing interpretations, test the understanding with a concrete scenario rather than accumulating approvals.

This step is complete when the user's principles select among the material interpretations and every remaining point is an Agent decision or Deferred.

## 3. Capture durable knowledge

Use the `/domain-modeling` skill as canonical domain terms and durable decisions crystallise; follow its criteria for `GLOSSARY.md` and decision records.

Keep the working model in the conversation and the final alignment brief.

This step is complete when every resolved domain term and qualifying durable decision has been recorded.

## 4. Present the alignment brief

Present a concise proposal:

### Confirmed intent

- The outcome, governing principles, hard constraints, and non-goals learned from the user.

### Intended decisions

- The material decisions you intend to make, including consequential defaults you derived yourself; connect non-obvious choices to the user's principles and name what they trade away.

### Boundaries and remaining uncertainty

- Deferred scope, assumptions that remain changeable, and risks the user should know before work begins.

Ask the user what you have misunderstood or what they would change. Incorporate material corrections, then begin the requested work only after the user explicitly confirms the shared understanding. When clarification itself is the whole request, the confirmed brief is the completed result.

The skill is complete when the user can predict the material result and explicitly confirms the shared understanding.
