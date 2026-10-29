# Testing

## Decisions

- A test for new behavior is written before that behavior exists and is seen
  failing on an assertion: missing symbols are stubbed first so the failure is
  the wrong or missing behavior, not a compile error. The agent may write
  several such tests before implementing them together; there is no
  one-test-at-a-time cycle. When the user explicitly asks for TDD or
  red-green-refactor, it follows that cycle.
- A test that guards existing behavior is seen failing by breaking the
  implementation or by running it against the unfixed code.
- A bug fix starts with a reproduction test that fails against the existing
  code on the wrong behavior.
- The agent designs from the whole active outcome before writing code, and
  writes no code that no criterion or named reason requires.
- Acceptance criteria are the floor of the test scope. Any further test names
  what it protects: a reproduced bug, a risk in logic the criteria do not
  reach, or existing behavior the change touches. A test that can name none of
  these is not written.
- Before finishing, the agent finds and runs the existing tests that cover
  code the change touches.
- A failing test is made to pass by changing the implementation. It is never
  deleted, skipped, or weakened to reach green. Changing a test after it has
  run against the implementation requires citing the line of the approved
  contract that shows the test was wrong.
- Each new test is reported with the criterion or reason it serves and the
  actual failing assertion output observed, expected against actual.
- Tests observe behavior through public seams, mock only system boundaries,
  and take expected values from a source independent of the implementation.
  Test names and interfaces use the project's current terms.

## Boundaries

- These rules govern how tests are chosen and written. Which check proves each
  acceptance criterion, and the runtime evidence still owed for the running
  product, belong to `implement` ([pipeline](pipeline.md)).
- Enforcement stays in the skill text. No hook blocks production edits until a
  test fails.

## Why

Writing the test before the behavior keeps the expected value independent:
with no implementation to run, the agent cannot paste the code's own output
into the assertion and seal a bug inside the test. A test written after the
code and then shown failing by breaking the code only proves the test reacts
to change, not that its expected value is right. Seeing a real red matters
even inside a test-first loop: an agent took a compile error against a method
it had not written yet as its red, so the bug was never reproduced
(mattpocock/skills#1210). Simon Willison names the same reason for the red
step: skipping it risks a test that already passes.

What is dropped is the alternation of one test and one minimal implementation.
Evidence on it is mixed and none of it is a controlled frontier-model study:

- Böckeler's exploratory experiment (martinfowler.com, Sonnet 4.6, 22 runs)
  measured no quality difference between TDD and non-TDD runs, token ratios of
  roughly 3–8.5x that include cache reads and likely overstate cost, and a
  test-first-without-alternation arm that did as well as no instructions. She
  hypothesizes that alternation locks in early design and leaves behavior
  nobody wrote a test for unimplemented.
- TDAD (arXiv 2603.17973) found a procedural TDD prompt raised test-level
  regressions on two 4-bit local models; the arm that cut them still carried
  TDD and added which tests to check. The author warns frontier models may
  differ.
- Kent Beck and an Anthropic adoption guide recommend the one-test loop with
  agents. Claude Code's current best-practices page centers on giving the agent
  a pass/fail check and asking for evidence, and keeps test-first only for bug
  reproduction.

The change is therefore a hypothesis that the forward comparison in the
`testing-skill` spec tests, not a settled finding about the loop.

Acceptance criteria alone are too coarse as a ceiling: specs leave out
implementation detail, so bug reproductions, edge cases in complex logic, and
touched existing behavior would go untested. The named-reason rule admits
those while excluding tests that protect nothing. Never weakening failing
tests guards a failure Kent Beck reported and Anthropic's long-running harness
forbids; requiring the contract line closes the escape of calling a test wrong
after a large implementation fails it.

## Reconsider when

- The forward comparison shows `testing` meets fewer acceptance criteria,
  lets more seeded bugs through, or produces more tests that never failed on
  an assertion than the one-test cycle it replaced.
- Sessions show agents claiming a red they never observed often enough that a
  harness check would be cheaper than the misses.

## Still-rejected alternatives

- Keep the one-test-at-a-time cycle and only relax enforcement, as Matt
  Pocock's `tdd` does — it keeps the alternation the evidence does not support
  and its token cost; revisit if the forward comparison favors the cycle.
- Leave test order entirely to the agent — expected values can then be copied
  from the implementation's output, sealing bugs into tests.
- Test only the acceptance criteria — it leaves bug reproductions, complex
  internal logic, and touched existing behavior without tests.
- Move test-choice rules into `implement` and keep a pure TDD skill for direct
  use — it widens the change and overlaps `implement`'s runtime evidence
  without a clearer owner for how tests are written.
