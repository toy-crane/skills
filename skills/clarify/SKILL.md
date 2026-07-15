---
name: clarify
description: Align intent before action by resolving consequential uncertainty in a plan or design. Use for clarification or stress-testing before implementation.
---

# Minimum sufficient alignment

Reach **minimum sufficient alignment** by resolving the consequential gaps between the user's intent and the work you intend to do, with human attention proportional to risk.

## 1. Build the material decision map

Do the legwork first: inspect the environment, existing artifacts, and authoritative sources for facts that would otherwise become questions. Extract the user's stated outcome, governing principles, hard constraints, and non-goals.

Identify only the open points whose plausible resolutions would materially change the intended work, together with their dependencies.

Route each open point:

- **Fact** — investigate it from the environment or an authoritative source.
- **Deferred** — leave it unresolved because it cannot materially affect the current outcome.
- **Decision candidate** — apply the divergence test to determine who should decide it.

A decision candidate becomes a **Human decision** when multiple plausible interpretations remain, those interpretations produce materially different outcomes, choosing incorrectly would cause meaningful rework or a difficult reversal, and prior context cannot select among them.

Otherwise, treat it as an **Agent decision**: choose a sensible safety measure, implementation detail, reversible default, or option strongly implied by prior decisions. Reserve only its material consequence for the alignment brief.

This step is complete when relevant facts have been investigated, every material decision candidate has been routed to the human or the agent, and deferred points are safely outside the current outcome.

## 2. Resolve consequential divergence

Work through the decision map upstream first so each resolution collapses the most downstream choices. For each non-perceptual Human decision, ask one question at a time. Wait for the answer, then propagate it through the decision map before asking again.

Use two kinds of question deliberately for non-perceptual decisions:

- **Discovery** — when the user's governing preference is still unknown, ask neutrally; that reveals priorities better than seeking approval of an agent-authored answer.
- **Convergence** — once the relevant preference is known, recommend the choice that follows from the user's expressed preference and name the meaningful trade-off.

Treat a terse confirmation as sufficient when the decision and its consequence were visible. When competing interpretations of a non-perceptual decision survive, make the choice concrete with a scenario or counterexample instead of accumulating approvals.

When the unresolved divergence is perceptual — how something looks, reads, is laid out, or behaves — use the `/wireframe` skill. Carry forward the confirmed facts, constraints, and surviving interpretations. The wireframe owns choosing the governing perceptual decision, representing it, and obtaining the user's confirmation. Resume here with the confirmed decision and propagate it through the decision map.

This step is complete when the user's principles select among the material interpretations and every remaining point is an Agent decision or Deferred.

## 3. Capture durable knowledge

Use the `/domain-modeling` skill as canonical domain terms and durable decisions crystallise; follow its criteria for `GLOSSARY.md` and decision records.

This step is complete when every resolved domain term and qualifying durable decision has been recorded.

## 4. Present the alignment brief

Present a concise proposal:

### Confirmed intent

- The outcome, governing principles, hard constraints, and non-goals learned from the user.

### Proposed approach

- The material decisions you intend to make, including consequential defaults you derived yourself; connect non-obvious choices to the user's principles and name what they trade away.

### Boundaries and remaining uncertainty

- Deferred scope, assumptions that remain changeable, and risks the user should know before work begins.

Treat Human decisions confirmed during resolution, including through a wireframe, as settled. If a user correction or the synthesis reveals new material divergence, route it through step 2. Otherwise, the brief closes alignment and the requested work may begin. When clarification itself is the whole request, the brief is the completed result.

The skill is complete when the user can predict the material result, every Human decision has been explicitly confirmed at the point it was resolved, and every remaining point is an Agent decision or Deferred.
