---
name: clarify
description: Clarify a plan or design through a relentless, one-question-at-a-time interview, recording the decisions and domain terms as docs (ADRs + glossary) along the way. Use when the user wants to sharpen or stress-test a plan, resolve open design decisions, or be grilled on their thinking.
---

Interview me relentlessly about every aspect of this until we reach a shared understanding. Walk down each branch of the decision tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

Ask the questions one at a time, waiting for feedback on each question before continuing. Asking multiple questions at once is bewildering.

If a *fact* can be found by exploring the environment (filesystem, tools, etc.), look it up rather than asking me. The *decisions*, though, are mine — put each one to me and wait for my answer.

As decisions and terms crystallise, use the `/domain-modeling` skill to capture them — writing the glossary and ADRs down the moment they resolve, not batched up at the end.

Do not act on it until I confirm we have reached a shared understanding.
