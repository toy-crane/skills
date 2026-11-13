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
  and attempts that failed before a scorable output run again. Cost is cut by
  not repeating runs, not by testing on a cheaper model than the one the
  product or skill actually runs on.
- A trial the model never finished answering is not a result. A trial that
  ended on an API error, such as a usage or rate limit, a network failure, or
  a timeout, is never graded. It counts as neither a pass nor a fail, never
  enters the cell history, and the next run fills it. The runner decides this
  from what the model's own entry point reports, never from the grader's
  reading of the output.
- Trials run concurrently whatever the model access, API key or
  subscription. Limits are not the eval's concern: the eval does not wait,
  back off, or plan around them. A limit only ends trials early, and the rule
  above keeps those trials out of the score.
- The approval asks for the repetition count as its own choice. It is never
  below 2, because graduation keeps only cases that passed on every
  repetition and one pass cannot tell a stable case from a lucky one. The
  recommendation is 2; 3 only when the set stays under 10 cases or the
  behavior is known to vary run to run. A request for more than 3 is answered
  with more cases instead, since repetitions show only how one case varies and
  the noise floor shrinks slowly with them.
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
- Every regression run records, per cell, how many trials ran and how many
  passed, the results of its most recent trials in order, and the cell's
  result at the baseline of the climb that graduated it. This cell history is
  one committed file beside `log.md`. Its size does not grow with the number
  of runs, and it grows only from runs that happen anyway, so keeping it costs
  no model call.
- The regression suite has two tiers. The upper tier runs whenever the suite
  runs. The lower tier runs only when the model the product or skill runs on
  changes. A cell whose most recent trials all passed, over enough trials, is
  demoted to the lower tier; it is never deleted for passing. An older failure
  does not keep a cell in the upper tier for good, and each proposal shows the
  cell's total failures so a cell that once caught a real break can be kept. A demoted cell that
  fails outside the noise floor moves back up and is reported as a regression.
  Demotion and promotion are proposed with their evidence and applied only
  after the user approves them.
- A cell that already passed at the baseline graduates into the upper tier
  only when its case states what it guards against, such as a behavior the
  change could push too far. Without that reason it graduates into the lower
  tier.
- Reading the cell history to find cells whose recent trials all passed,
  checks whose history is identical, graduated cells that flip, and cells
  that always fail is a separate skill from `llm-evals`. It reads only; it
  changes the suite through the user's approval and runs a model only for a
  verification the user approved the spend for.
- The project chooses where its eval root lives; the layout under that root is
  fixed. The root holds the runner that calls the product's entry point, one
  folder per capability eval, and `regression/`, which holds `log.md`, the
  cell history, and one folder per graduated criterion carrying that criterion's cases and grader. A
  capability eval's folder is named for the spec folder whose criterion it
  proves, and for the criterion too when that spec has more than one, so two
  criteria handed over separately never share a folder; it holds its cases, its
  grader, the climb state, and one results folder per variant. Graduation moves
  the cases, the grader, and whatever that grader reads — frozen baseline
  outputs, fixtures, expected answers — into the matching folder under
  `regression/`, deletes the rest of that folder, and appends one scored line
  to `log.md`.
- An eval root never sits inside a folder that ships to users, such as a
  skill's own folder. Evals exist to improve the thing they measure, so its
  users never need them, and installers copy a skill folder whole. This
  repository keeps each skill's evals in `skill-evals/<name>/`, outside
  `skills/`.
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

A trial cut off by an error says nothing about the behavior. Graded, it
becomes a fail the behavior never earned: the score drops, and the cell
history keeps a false failure that later reads as a flip or a guard. Trials
are independent and each one draws the same cost or usage, so concurrency
changes only wall time. Waiting for limits would add a mechanism to every
runner for something a rerun already fixes.

## Reconsider when

- The forward comparison shows the revised `tdd` meets fewer acceptance criteria,
  lets more seeded bugs through, or produces more tests that never failed on
  an assertion than the one-test cycle it replaced.
- Sessions show agents claiming a red they never observed often enough that a
  harness check would be cheaper than the misses.
- LLM-output criteria turn out to be rare and small enough that a separate
  `llm-evals` skill costs more to maintain than an eval branch inside `tdd`.
- Demotion does not cut the cost of a regression run enough that climbs'
  gates and `implement` runs stop skipping it; the grader mix or how often the
  upper tier runs then needs a limit.
- A demoted cell's behavior breaks between model changes and nothing reports
  it; the lower tier then needs a schedule of its own.
- Gates turn out to be rare enough that a held-out failure leaves too many
  rounds to unwind, or train and held-out scores track each other closely
  enough that the separation buys nothing.
- Runs stopped by a limit leave so many trials unfilled that rerunning them by
  hand costs more than waiting inside the runner would.

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
- On 2026-11-09, `npx skills add` (vercel-labs/skills `d3701c1`) copied a
  skill folder recursively and excluded only `.git`, `__pycache__`,
  `__pypackages__`, and `metadata.json`; no ignore file, frontmatter field, or
  file list could narrow it (vercel-labs/skills#1241 asks for one). Every
  skill's `evals/` therefore reached installed projects, and the shape-idea
  and `tdd` runners failed there because they assumed this repository's
  `skills/<group>/` layout. Anthropic's skill-creator keeps `evals/` in the
  skill folder too, but its `.skill` packager drops that folder before
  shipping.

- On 2026-11-12, recorded runs in two of the user's projects, read per cell.
  `dearly` `regression/chat` (175 cases, 54 checks, 5 runs): of 2,837
  (case, check) pairs, 2,636 always passed, 187 flipped, and 14 always failed;
  20 of the 54 checks never failed in 2,100 rows; 103 of 175 graduated cases
  flipped, and 11 cases that graduated at 2/2 scored 0/2 the next day. A run
  made 358–716 judge calls and a subscription limit stopped gates twice.
  `claude-code-playbook` `regression/lesson-authoring` (341 cells, 11 runs): 6
  checks never failed in 111 trials, 5 of them with identical histories; 76 of
  278 graduated cells failed later; a full run cost $72–83 in drafting. In
  both, per-cell results were ignored by Git and only the aggregate was
  committed, so the seed run's per-cell results were already gone.
- The same day's reading of published guidance: Anthropic's "Demystifying
  evals for AI agents" says an eval at 100% tracks regressions but gives no
  signal for improvement; Hamel Husain's evals FAQ says a saturated eval gives
  no new information and should be retired or run less often, expensive
  judges first. No source found gives a routine for deleting application eval
  cases, and one warns that pruning case by case biases the suite toward
  current strengths.
- On 2026-11-13, the output schema in the Claude Code 2.1.323 binary showed
  that `claude -p --output-format stream-json` ends a turn that stopped on an
  API error with a `result` whose `subtype` is still `success`, plus
  `is_error: true` and `api_error_status`. Before the limit it emits
  `system`/`api_retry` events for its own retries and a `rate_limit_event`
  whose `status` becomes `rejected`, with `resetsAt` and `rateLimitType`.
  All six runners under `skill-evals/` checked only `subtype`, so a limited
  trial reached the judge and was graded a fail. This was read from the
  schema, not observed on a real limit.

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
- A size cap on the regression suite, or dropping the oldest cases — an
  age-based rule removes cases no decision retired; cost is controlled by
  demoting never-failed cells instead.
- Deleting a never-failed cell after approval — it makes the suite lightest,
  but removing cases one by one tilts the suite toward what the system already
  does well, and a deleted cell cannot report the day a new model breaks it.
- Keeping only cumulative counts in the cell history — smaller, but one
  failure then marks a cell for good, so the upper tier only grows back: in
  `dearly`, 103 of 175 cases had failed at least once, capping demotion at 72
  cases and shrinking that cap with every later failure.
- Keeping the audit inside `llm-evals` — the audit reads history without
  running anything and is used at a different moment than a climb, so it would
  grow a skill that is already long for a step most climbs never need.
- One fixed path for every project's eval root — projects keep evals beside the
  code they test, such as `apps/api/eval/` or `skill-evals/<name>/`, so a
  fixed root is broken on arrival; the layout under the chosen root is fixed
  instead and the agent instructions carry the root.
- Running trials one at a time on a subscription to spare the usage limit —
  the same trials draw the same usage either way, so it only makes the run
  slower.
- Making each runner wait out a limit, back off, and resume on its own — it
  adds a mechanism to every runner for what a rerun already fills, and the
  CLI already retries short limits; revisit under the reconsider condition
  above.
