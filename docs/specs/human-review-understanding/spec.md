# Understand and resume human review

## Problem and outcome

The user switches among AI work sessions and loses attention reconstructing
what each change was meant to do. The current human-review skill concentrates
on AI-selected unresolved decisions, so a human can approve without understanding
the work or noticing an assumption the AI did not flag.

The review should make the work understandable and inspectable. Recovering
context and finding related evidence should take less effort, leaving attention
for judgment. An explicit approval alone does not establish understanding.

## Approved behavior

- Reconnect the change to the original request and settled intent. When prior
  review context exists, distinguish what changed since then; otherwise say
  where the review begins without inventing prior understanding.
- Keep the whole change navigable while explaining one coherent behavior at a
  time through before/after, its mechanism, consequences, and nearby evidence.
  The human can inspect choices the AI considers settled and request more depth.
- Show actual outputs where available and label source inspection, supplied
  observations, proposals, and missing runtime evidence accurately. Defects and
  consequential unknowns remain visible even when no product decision is open.
- Use concrete product language in explanations and internal instructions.
  Replace abstract process nouns with the action or outcome they refer to.
- Ask focused questions where intent or a consequential assumption is unsettled.
  Keep at most three active product decisions and name deferred ones. This limit
  does not restrict how much of the work the human may examine. Do not require
  an acknowledgment after every explanation.
- Preserve a return point with the reviewed revision, examined scope, actual
  human statements, open questions, and next useful action. On return, compare
  current work with that revision and revisit only affected observations.
  Navigation and inspected scope never imply agreement or approval.
- Choose a compact representation suitable for the change. Use runnable local
  HTML when navigation, comparison, or continued review benefits from it; simple
  reviews can stay in conversation. HTML examples must be complete, responsive,
  browser-checked, and reachable through a shared address.

## Acceptance

- A review with no unresolved product decision still explains the behavior and
  exposes its evidence rather than ending at a zero-question screen.
- In a review of a multi-part change, the human can locate every changed behavior
  and follow a before/after explanation without reconstructing a file list.
- Returning after a recorded question shows that question and the next action.
  A later change invalidates related earlier observations without erasing
  unaffected discussion or treating prior agreement as approval of new code.
- An opened section or a short acknowledgment alone never becomes acceptance.
- Existing cases for real output, unobserved production behavior, confirmed
  defects, and implementation choices absent from the request retain those
  distinctions in plain language.
- Deliver an example made by applying the revised skill, distinguish example
  data from real project evidence, and exercise its navigation and narrow layout.

## Boundaries and evaluation

No automatic human-review trigger after implementation, mandatory comprehension
quiz, review-time score, or permanent review-state system. Review preparation
does not modify the product or approve deployment. Temporary notes are not
project decisions; confirmed reusable decisions use the project's existing docs.

Prompt and browser checks can establish that the new review supports these
actions. Whether it improves this user's understanding, ability to notice
unflagged assumptions, and effort after switching sessions remains a user trial.
