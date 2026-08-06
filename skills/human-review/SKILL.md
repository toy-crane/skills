---
name: human-review
description: Turn a completed repository change into a minimal visual handoff for human judgment. Summarize the outcome, isolate consequential commitments that are costly if wrong, hard to reverse, or hard to verify automatically, show actual results, and keep evidence on demand. Use after substantial or consequential AI-authored code, UI, API, database, or infrastructure work when the user asks what changed, wants a visual review, or cannot reasonably inspect the whole diff. Do not use for a small ordinary diff, defect hunting alone, or non-repository content.
---

# Human Review

Protect human attention. Let automated review handle mechanically checkable
correctness; ask the human to accept or reject the consequential promises the
change introduces.

## Establish the result

Read the request, repository instructions, current diff or named change, and any
relevant specs or project decisions. Inspect the actual product and rerun the
smallest checks needed to support each claim. Treat an AI-authored summary as a
claim, never as proof.

Review the completed work without fixing or broadening it. Mark missing evidence
as unverified instead of converting it into a completion claim.

## Find the human judgment

Reason from commitments, not file types. A commitment is a new product behavior,
access boundary, data transformation, external contract, or failure and recovery
posture.

Build the human queue in this order:

1. Extract every commitment introduced by the completed change.
2. Remove commitments already settled by the request, a current spec, or a
   project decision. Demonstrate their result without asking for approval again,
   unless an owner still needs to accept the observed permission, money,
   data-loss, external-contract, irreversible-action, or recovery consequence.
3. Remove commitments whose intended answer and behavior are established by
   direct automated evidence and require no separate risk acceptance.
4. Keep an unresolved commitment only when a different human answer would change
   the implementation, or an owner must explicitly accept a permission, money,
   data-loss, external-contract, irreversible-action, or recovery consequence.
5. Order the remainder by cost of error, difficulty of reversal, then lack of
   direct evidence. Show at most the first three.

Always inspect permissions and data exposure, destructive migrations, money,
public APIs and events, irreversible user actions, and rollback or recovery. Do
not route a harmless database change merely because it is a schema change, or
hide a consequential UI behavior merely because it is not one.

Do not expose secrets or personal data in the artifact. Redact representative
values without hiding the behavior under review. Never rerun a destructive
production action merely to create review evidence; use an existing safe result
or mark it unverified.

Keep routine defects, style, internal refactors with demonstrated equivalence,
and other mechanically settled findings out of the human queue. Do not use model
confidence as evidence. Present zero to three independent questions at once; if
more remain, say that another set remains rather than silently dropping them.

## Build the review surface

Copy [assets/review.html](./assets/review.html) to a temporary location outside
the repository and replace its example content. Leave product source unchanged
and do not commit the review artifact. Keep it free of network dependencies;
bundle local media or place it beside the temporary HTML when needed.

The first screen contains only:

- Three to five plain-language lines covering the whole outcome, the main
  changed behaviors or boundaries, the observed failure or recovery behavior or
  a material unverified limit, and material scope that stayed out. Include
  important changes even when they do not become human questions. Do not invent
  excluded scope when none is established.
- The current set of human questions, phrased in the user's product language.
- A quiet note when additional unresolved questions remain beyond the current
  set.
- One quiet path to the checks and source evidence.

Do not show review-time estimates, severity codes, scores, model confidence,
file counts, line counts, or test counts. Do not expose internal terms when a
plain product sentence works.

Translate the template labels and decision controls into the user's language.
Give duplicated review screens unique element IDs. Remove unused patterns,
screens, and placeholders; when no question remains, remove all review screens
and show the truthful zero-question state on the overview.

Open each question on the actual result before its explanation:

- UI behavior: a rendered before/after state or short replay.
- API or event contract: real request and response values before and after.
- Data change: representative rows before and after plus the tested recovery
  result.
- Permission change: a principal-by-action access table.
- Operational change: the failure, detection, and recovery trace.

Ask one decision in that view. Put why it was routed, commands, tests, sources,
and raw output behind a disclosure. Distinguish direct evidence from inference.

Render the finished artifact in a browser. Exercise every route, disclosure,
comparison or replay, decision control, and relevant narrow viewport before
presenting it. Return a direct link and one preview image when the host supports
them.

## Keep ownership human

Present the surface and begin with the first unresolved question. When none
remains, stay on the overview and point to the evidence that closed the queue.
Do not treat silence, navigation, a local button selection, or an AI
recommendation as approval. When the user decides in the conversation, state the
choice plainly and return requested product changes to the calling session; the
temporary surface is not a project decision record.
