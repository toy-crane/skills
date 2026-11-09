# Testing

## Decisions

- A test for new behavior is written before that behavior exists and is seen
  failing on an assertion: missing symbols are stubbed first so the failure is
  the wrong or missing behavior, not a compile error. The agent may write
  several such tests before implementing them together; there is no
  one-test-at-a-time cycle. When the user explicitly asks for one test at a
  time or red-green-refactor, it follows that cycle.
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
- An acceptance criterion about the quality of LLM output, which varies run to
  run and no deterministic assertion can decide, is proven by an eval through
  `llm-evals`, not by a test against a mocked model call. A mocked call proves
  only the code around the model, so `tdd` hands such a criterion back with
  that reason and still tests the surrounding code.
- An eval follows the same discipline as a test. Its red is the baseline
  score measured before the behavior changes. Its green is a held-out score at
  or above the spec's target and above the baseline outside the noise floor.
  Changes are proposed from train cases only, and the score comes from cases
  the proposer never read. Cases and grader are never weakened, removed, or
  re-split to reach green; changing them after approval needs the user's
  approval again. Expected answers stay out of the model's reach.
- An eval's rounds score train cases only. The held-out split is scored at the
  gates: when the train score first reaches the target, and at the end. A gate
  whose held-out score does not follow the train score reverts to the last gate
  that passed.
- A capability eval ends by graduating. The cases the final variant passed on
  every repetition move into the project's single regression suite, carrying
  the same runner and grader; the climb's variants, traces, and split are
  deleted and one scored line is kept. Cases that did not pass repeatedly stay
  in a capability eval while the criterion is open, and are recorded as known
  failures once it closes.
- An eval never runs a (variant, case, repetition) that already has a scored
  result from the same cases and grader; it reads that result instead. A gate
  on an unsplit set takes the variant's round score, a second gate on the same
  variant takes the first gate's score, and graduation picks its cases from the
  final variant's existing results rather than a fresh full run. A gate still
  runs the regression suite for a variant whose suite rows do not exist yet,
  and attempts that failed before a scorable output run again. Cost is cut by not repeating runs, not by testing on a cheaper model
  than the one the product or skill actually runs on.
- A regression suite is held at the level its cases reached, so a score below
  it means something broke. A climb runs it at its gates, not every round, and
  a gate fails when the suite drops below the baseline recorded for it outside
  the noise floor on cases that baseline passed; nothing graduates from a
  failed gate, and failures the baseline already carried are not that climb's.
  Outside a climb, `implement` runs it when the change touches the behavior it
  guards and reports the result as evidence ([pipeline](pipeline.md)).
- A regression case is changed or removed only when a decision to change that
  behavior exists, or when the feature it covers is gone. A failing score is
  never a reason to remove one.
- The project chooses where its eval root lives; the layout under that root is
  fixed. The root holds the runner that calls the product's entry point, one
  folder per capability eval, and `regression/`, which holds `log.md` and one
  folder per graduated criterion carrying that criterion's cases and grader. A
  capability eval's folder is named for the spec folder whose criterion it
  proves, and for the criterion too when that spec has more than one, so two
  criteria handed over separately never share a folder; it holds its cases, its
  grader, the climb state, and one results folder per variant. Graduation moves
  the cases, the grader, and whatever that grader reads — frozen baseline
  outputs, fixtures, expected answers — into the matching folder under
  `regression/`, deletes the rest of that folder, and appends one scored line
  to `log.md`.
- Graduation records the eval root's path in the project's agent instructions,
  so later work finds the regression suite without guessing: in `AGENTS.md`,
  created when missing, and also in `CLAUDE.md` when that file exists and does
  not load `AGENTS.md`.
- Cases, graders, the runner, and everything under `regression/` are committed.
  A variant's results folders are not, and graduation deletes them.
- Skill and agent behavior is LLM output too, so creating or changing a skill
  through this workflow proves its behavior criteria with an eval. The entry
  point is an agent run with the skill installed in a disposable workspace,
  graded on the end state it leaves. The baseline is the previous skill text,
  or no skill for a new one.
- The `tdd` forward comparison is `tdd`'s eval, run through `llm-evals` rather
  than as a standalone script. Its two tasks, hidden criteria tests, seeded
  mutants, and scoring signals stay; with two tasks it is scored whole and
  read as directional, not split into train and test.

## Boundaries

- These rules govern how the `tdd` skill chooses and writes tests and how
  `llm-evals` builds and climbs an eval. Which check proves each
  acceptance criterion, and the runtime evidence still owed for the running
  product, belong to `implement` ([pipeline](pipeline.md)).
- Enforcement stays in the skill text. No hook blocks production edits until a
  test fails.
- These rules fix the layout under a project's eval root, not the root's own
  path. Where that root goes is the project's, and the agent instructions carry
  it.

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

LLM output quality needed its own check because `tdd` mocks the model as an
external API, so the prompt that decides the behavior went unproven and the
criterion came back as unprovable. An eval is the same idea in a noisy
medium: the expected answers exist before the prompt changes, the baseline is
the red, and the held-out split plays the role of independent expected values,
because a proposer that tunes on the cases it scores seals its own fit into
the number. The eval discipline follows claude-api's `build-eval` and
`hillclimb` guides (anthropics/skills, Apache-2.0).

Scoring the held-out split every round selects on it. After twenty rounds the
final number is the best of twenty draws against the cases that decide green,
and at 25 cases by 2 reps a round's movement sits inside a ±14-point noise
floor anyway, so the choice it buys is mostly a coin flip. Scoring train only
and opening a gate when train reaches the target keeps the deciding score
independent and drops the rounds that bought nothing.

Without graduation a capability eval has no end: its cases, variants, and
traces stay, and the next criterion builds another eval beside it. Graduating
leaves one regression suite per project and deletes the climb. Keeping the
grader intact across graduation costs model calls on every regression run, but
dropping the rubric would stop guarding the regressions only a judge can see,
which is the half of the behavior code checks cannot reach.

## Reconsider when

- The forward comparison shows the revised `tdd` meets fewer acceptance criteria,
  lets more seeded bugs through, or produces more tests that never failed on
  an assertion than the one-test cycle it replaced.
- Sessions show agents claiming a red they never observed often enough that a
  harness check would be cheaper than the misses.
- LLM-output criteria turn out to be rare and small enough that a separate
  `llm-evals` skill costs more to maintain than an eval branch inside `tdd`.
- Running the regression suite costs enough that a climb's gates or an
  `implement` run skip it; its size, its grader mix, or how often it runs then
  needs a limit.
- Gates turn out to be rare enough that a held-out failure leaves too many
  rounds to unwind, or train and held-out scores track each other closely
  enough that the separation buys nothing.

## Evidence worth preserving

- Forward comparison on 2026-10-29 (`scripts/run-tdd-comparison.sh`,
  claude-opus-5-5, Claude Code 2.1.312, a feature task and a bug task, three
  runs per version each; the baseline is the one-test cycle at `0154388`):

  | | one-test cycle | revised |
  |---|---|---|
  | acceptance criteria met | all 7 in 3/3 runs | all 7 in 3/3 runs |
  | new tests | 42 | 46 |
  | fake reds on the stub or unfixed code | 0 | 0 |
  | seeded mutants caught | 24/27 | 25/27 |
  | new tests never seen failing on an assertion | 12 | 0 |
  | bug runs reproducing before the fix | 3/3 | 3/3 |
  | tests labeled as protecting nothing | 0 | 0 |
  | turns | 126 | 56 |
  | tokens, cache reads included | 3.12M | 1.57M |
  | cost | $2.32 | $1.54 |

  The cycle's unseen reds were tests that passed at once because an earlier
  minimal step already covered them. Two tasks and three runs each cannot
  separate small differences from noise. After the move to `llm-evals`, the
  same comparison reruns as `tdd`'s eval against baseline `0154388`.
- The user's `dearly` project on 2026-11-09, before any graduation step
  existed: 21 per-feature eval tools, ten of them added after an earlier
  consolidation, and a committed `results/` directory at 804MB. Its chat eval
  alone holds 676 cases and judges about 525 of them per run. Nothing in the
  workflow ever retired an eval.

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
- An eval branch inside `tdd` — a deterministic red on an assertion and a
  paid, approved, noise-bounded climb are different disciplines, and mixing
  them would roughly double `tdd` and blur which red counts.
- A separate eval skill reached only through its description — inside
  `implement` nobody would invoke it, so LLM-output criteria would keep coming
  back unproven.
- Building evals without user approval and showing the cases only in the
  hand-back — a wrong case set is found only after the climb has spent its
  budget, and nobody trusts the resulting number.
- Scoring the held-out split every round and keeping whichever change raises it
  — the split stops being held out once it decides what to keep, and at these
  set sizes most of its per-round movement is noise.
- Keeping only the code checks when a case graduates — cheaper on every
  regression run, but the behavior a judge was needed for stops being guarded;
  revisit if regression cost blocks runs.
- Running the eval on a cheaper model than the one users run, such as Sonnet
  for a skill used on Opus — it halves the price but measures another reader,
  and a score gained there need not hold on the real model; removing repeated
  runs saves the same half without changing what is measured.
- Rerunning the final variant to graduate or to score a gate it was already
  scored on — the same variant on the same cases adds no information, and on a
  5-case set at 2 reps it doubled a climb from 20 runs to 40.
- A size cap on the regression suite, or dropping the oldest cases — cost
  control was deferred rather than designed, and an age-based rule removes
  cases no decision retired.
- One fixed path for every project's eval root — projects keep evals beside the
  code they test, such as `apps/api/eval/` or a skill's own `evals/`, so a
  fixed root is broken on arrival; the layout under the chosen root is fixed
  instead and the agent instructions carry the root.
