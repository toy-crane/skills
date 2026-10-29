# Testing

## Decisions

- The `testing` skill sets no fixed test-first cycle. The agent designs from
  the whole agreed behavior, derives tests from it, and writes tests and
  implementation in the order it judges. When the user explicitly asks for
  test-first or TDD, it follows that order.
- Acceptance criteria are the floor of the test scope. Every criterion gets one
  check, either an automated test or runtime evidence. Any other test must name
  what it protects: a reproduced bug, a risk in logic the criteria do not
  reach, or existing behavior the change touches. A test that can name none of
  these is not written.
- Every new test is seen failing once for the right reason: it fails on the
  wrong or missing behavior, not on a missing symbol or a compile error. The
  agent picks how, such as running it before the behavior exists or breaking
  the implementation.
- A bug fix starts with a reproduction test that fails against the existing
  code on the wrong behavior.
- A failing test is made to pass by changing the implementation. It is never
  deleted, skipped, or weakened to reach green; a test that is itself wrong is
  changed visibly with the reason stated.
- Tests observe behavior through public seams, mock only system boundaries,
  and take expected values from a source independent of the implementation.

## Boundaries

- These rules govern how tests are chosen and written. Deciding which check
  proves each acceptance criterion, and gathering runtime evidence, belongs to
  `implement` ([pipeline](pipeline.md)).
- Enforcement stays in the skill text. No hook blocks production edits until a
  test fails.

## Why

The one-test-at-a-time loop named no observed failure it prevents, and the
evidence gathered on 2026-10-29 points against it for current models. In
Böckeler's small experiment (martinfowler.com, Sonnet 4.6), TDD instructions
gave no quality gain, cost 3–8.5x the tokens, and locked in early design so
behavior nobody wrote a test for went unimplemented. In TDAD (arXiv
2603.17973), a procedural TDD prompt raised regressions while telling the agent
which tests to check lowered them. Anthropic's and OpenAI's own guidance
centers on a pass/fail check plus evidence, not on test-first order, and the
Codex repository's agent guidance warned against tests for static values and
removed logic.

What the loop did guarantee, a test seen failing, is kept as a condition
instead of an order. Order alone does not guarantee it: an agent produced a red
from a compile error against a method it had not written yet, so the bug was
never reproduced (mattpocock/skills#1210). Agents deleting or disabling failing
tests to reach green is a failure Kent Beck reported and Anthropic's
long-running harness guards against.

Acceptance criteria alone are too coarse as a ceiling. Specs leave out
implementation detail, so edge cases in complex logic, bugs found while
building, and touched existing behavior would go untested; the named-reason
rule admits those while still excluding tests that protect nothing.

## Reconsider when

- A forward comparison against realistic tasks shows the revised skill misses
  more acceptance criteria or produces more false reds than the cycle it
  replaced.
- Sessions show agents skipping the seen-failing condition often enough that
  an ordering rule or a harness check would be cheaper than the misses.

## Still-rejected alternatives

- Keep the red → green loop and only relax enforcement, as Matt Pocock's `tdd`
  does — it keeps a rule the skill no longer requires and keeps the token cost
  and early design lock-in; revisit if the forward comparison favors the loop.
- Test only the acceptance criteria — it leaves bug reproductions, complex
  internal logic, and touched existing behavior without tests.
- Move test-choice rules into `implement` and keep a pure TDD skill for direct
  use — it widens the change and overlaps `implement`'s runtime evidence
  without a clearer owner for how tests are written.
- Collect our own session evidence before changing anything — this repository's
  skill-design rule puts the burden on keeping a procedure, and the forward
  comparison in the spec covers the remaining doubt.
