# Skill design

## Decisions

- A published skill states its goal, inputs, actions, and completion criteria in
  positive terms, then leaves situational method to the model.
- Use prohibitions only when they protect a real authority or safety boundary or
  prevent a repeated observed failure. Express ordinary constraints as the
  behavior the agent should produce.
- A fixed procedure must name a repeated, observed failure it prevents. Remove
  the procedure when improved models handle that failure without instruction.
- Point at real artifacts instead of paraphrasing them. Keep detailed material
  in a referenced resource and load it only when needed.
- A published skill never assumes another skill's text is loaded: skills load
  one at a time, so it restates what it needs inline rather than pointing at
  another skill's discipline. Delegation is different from knowledge. A skill
  that invokes another skill of this set by name requires it: it states what it
  hands over and what it gets back, and carries no inline path for the case
  where that skill is missing. Before doing any work, it checks that every
  skill it will invoke is installed, and when one is missing it stops and names
  the skill with the command that installs it. A side task, such as recording
  a follow-up through `project-knowledge`, is required the same way as a main
  step. A name that only appears in a message to the user, such as "rerun
  `setup-issue-tracker`", or in a boundary sentence, is not a dependency.
- Skills outside this set, such as `find-skills`, stay optional: a skill uses
  one when it is present and keeps the same outcome itself when it is not.
- `llm-evals` carries the eval discipline it needs in its own text, distilled
  from claude-api's `build-eval` and `hillclimb` guides, plus the red/green
  contract and `implement` hand-back those guides lack. `claude-api` stays an
  optional skill outside this set: when it is installed and the model under
  test is Claude, `llm-evals` may use its runner scaffold and report builder;
  otherwise it builds the same runner contract in the project's language.
- `resolve-follow-ups` keeps intent, reproduction, and reporting guidance in
  its standalone skill while a bundled dispatcher owns the low-freedom
  operations whose races are costly: fetched ordering, attempt identity,
  atomic ownership, worktree binding, terminal state, recovery, and cleanup.
- An orchestration skill may use a specialized skill selected by trigger match
  on the current surface, such as an Expo verification loop, while retaining
  the outcome itself when no such specialist is installed. A specialist chosen
  this way is not named, so it is not a required skill. `implement` applies
  this to runtime verification rather than depending on a generic verification
  dispatcher.
- Put trigger conditions in frontmatter descriptions. `project-knowledge`
  triggers when project terms are being clarified, when choices that may
  constrain future work are being considered or settled in any session including
  planning, or when a session applies a temporary workaround whose root cause
  stays open or observes an out-of-scope defect with evidence, but not for
  lookup or execution of settled work.
- `project-knowledge` owns the follow-up criteria, format, and lifecycle.
  Execution skills carry only a routing sentence to it and require it.
- Evaluate suspected counter-defaults against realistic prompts. When wording is
  revised after seeing a failure, test the revision on a new held-out control.
- Git delivery skills state the requested repository outcome, the authority the
  request grants, the state that must be preserved, and the evidence required
  for completion. They leave ordinary Git command selection to the model.
- `commit`, `pull`, `push`, and `pr` each own their outcome. `merge` composes
  them: it invokes `pull` with its resolved remote and base before verification
  and publication, so base integration and conflicts are handled before PR
  preparation, and invokes `pr` to create or update the pull request, so PR
  body and issue-linking guidance has one copy. `triage-issues` raises its
  pull requests through `pr` the same way. `merge` treats `pr`'s finish as an
  intermediate step and continues to verification and merge, then hands the
  merged branch to `clean-branches`, which owns the removal helper.
- A bundled deterministic script also earns its place when a measurement must
  be comparable across runs. `review-sessions` ships its session extraction
  and aggregation so a later pass counts the same sessions, exclusions, and
  signals as the first; prompt-driven mining cannot guarantee that, and the
  skill's re-measurement after a fix depends on it. The model reads only the
  event windows the script selects.
- Deterministic Git helpers earn their fixed procedure only where ownership is
  unsafe to infer. The worktree removal helper decides whether a worktree is
  used by the current session, an attached process, or a left-over one, and
  removes it only when nothing works inside; it never signals a process.
  [worktree-cleanup](worktree-cleanup.md) owns that procedure. Host-specific
  worktree UI commands remain outside the published contract.
- `babysit-pr` owns answering a pull request's CI and review bots; `implement`
  and `merge` invoke it before handing off or merging. A review thread the
  agent fixed, or declined with written evidence, is resolved by the agent
  after its reply posts. Conversation resolution exists to stop findings from
  merging unanswered, as on PR #106, not to require a person's click; the
  reply stays on the thread for later review. Comments posted on the user's
  behalf carry an agent-authored note and no model name.
- Pull request bases come from the user's request or the remote's advertised
  default branch. Git delivery skills do not assume that `main` exists when the
  repository uses `master`, `trunk`, or another default.
- A push publishes existing commits and leaves dirty changes local. A pull
  preserves dirty work rather than silently committing, stashing, or discarding
  it. PR and merge requests authorize the in-scope commits needed to complete
  their larger outcomes.
- `build-prototype`'s HTML output uses a host-independent handoff: run the
  finished HTML using a method supported by the current harness and share an
  address the user can open. This delivery contract is separate from browser
  verification and the skill carries it directly.
- `implement` requires one completed and triaged automated review, unless the
  user explicitly waives it. Failed execution supplies no review evidence.
  It also owns the runnable product handoff after its acceptance criteria pass,
  including while review is pending with a named blocker. When the repository
  exposes
  the actual result through a user-reviewable local server, run and verify the
  changed routes and states, share an address, and keep the current checkout's
  server available until review finishes or later delivery cleanup, without
  disrupting another checkout or unrelated process. This access does not
  imply human approval.
- A skill that drives an external CLI takes its runner from the target
  project's package manager. `update-project-skills` runs the `skills.sh` CLI
  as `<runner> skills@latest`, and the Expo skills name `expo run:ios` and
  `expo run:android` without a runner prefix, because npm aborts `npx` with
  `EBADDEVENGINES` in a project whose `package.json` pins another package
  manager through `devEngines`. A global `npm install -g` reads no project pin
  and stays as written.

## Boundaries

- Instructions may constrain outcomes and safety without prescribing a fixed
  sequence.
- Use a deterministic bundled script when concurrency or destructive lifecycle
  operations require atomic ownership and exact target verification, or when
  a measurement must stay comparable across runs.
- Prefer executable positive direction over lists of forbidden actions.
- UI metadata must continue to match the skill after a substantial edit.
- Eval outputs are disposable; stable prompts and assertions may remain so later
  pruning can rerun the experiment.

## Why

Skill context competes with the user's task, repository context, and other
instructions. Procedures the model already performs reduce adaptability and add
tokens without changing behavior. The durable value is the counter-default: a
constraint tied to an observed failure or project-specific truth.

Positive direction keeps attention on the result the agent must produce.
Unnecessary prohibitions narrow useful judgment, duplicate harness policy, and
make a skill brittle across capable models.

## Reconsider when

- A surviving procedure no longer changes outcomes in forward tests.
- A trigger description under- or over-fires on realistic routing evals.
- A task becomes fragile enough that deterministic scripts or a fixed sequence
  are safer than open-ended instructions.
- skills.sh lets a skill declare the skills it requires, so the install can
  pull them in instead of the skill checking at its start.

## Still-rejected alternatives

- General step-by-step workflows — capable models already explore, plan, and
  verify without being forced through a universal sequence.
- Predicted failures as justification for permanent procedure — guardrails earn
  their context cost from observed behavior.
- An inline fallback for a required skill that is missing — plugin users and
  `update-project-skills` always install the whole set, so the fallback runs
  only for a one-skill skills.sh install, yet agents took it as the main path:
  28 of 42 PR-creating sessions used `merge`'s copied rules instead of `pr`. A
  shortened fallback also degrades silently where a stop is visible.
- Requiring `claude-api` for `llm-evals` — it contradicts the rule that skills
  outside this set stay optional, it skips projects on other model providers,
  and its roughly 800 lines of interactive eval guides carry no red/green
  contract or `implement` hand-back. Vendoring those guides whole, which their
  Apache-2.0 license allows, was rejected for size and upstream drift.
- A full copy of `pr`'s body guidance in `merge`, kept identical by a CI
  check — it prevents drift but keeps the long duplicate and needs
  section-comparison tooling.
- A `run-server` skill as an `implement` dependency — it names a technical
  mechanism rather than the handoff outcome; reconsider a separately invokable
  preview skill only if users repeatedly need the same lifecycle outside
  implementation.
- A generic verification skill as an `implement` dependency — framework skills
  own their distinct runtime loops, while `implement` already owns selection and
  the completion gate.
- Compressing instructions into aphorisms — short text with floating referents
  can lose executable meaning even when its argument is correct.

- Keeping `human-review` as a published skill — PR bodies already show
  before-and-after results, reasons, and evidence separated into observed,
  inferred, and unverified ([pr-descriptions](pr-descriptions.md)), and
  `explain-visually` explains what the human does not follow. Its only unique
  part was resuming a review across sessions, used in about ten sessions
  against 290 for `implement`, so the user retired it without a new home.

## Evidence worth preserving

- A trigger eval showed the phase-based `project-knowledge` description missing
  all plan-mode decision queries; activity-based wording improved routing while
  remaining imperfect, so trigger prompts stay in the repository.
- Adding the discovery-time clause to that description scored 29 of 29 on a
  shuffled blind routing run, with the original 21 prompts unchanged and all
  eight new discovery and noise prompts correct. Two of the new prompts were
  held out of the wording work.
- A blind routing check separated `expo-smoke-test` from `expo-dev-loop` on
  eight prompts, run twice with the two descriptions presented in opposite
  order to control for position bias: 16 of 16 correct. Single-target edit
  checks routed to `expo-dev-loop`, both-platform and pre-delivery checks and
  an explicit core-loop regression routed to `expo-smoke-test`, and two
  non-verification prompts activated neither. The deciding wording is the
  closing redirect sentence in `expo-smoke-test`'s description.
- An explain-visually pruning eval found most form-selection instructions inert
  but retained the over-rendering brake. Later renderer testing required fresh
  held-out controls because each revised clause fitted the prompt that produced
  it.
- Two held-out forward runs exercised the revised `implement` review text on a
  fixture whose implementation carried two planted defects. Given six findings
  of mixed kinds, the run repaired only the acceptance-criterion break and the
  reproducible ordinary-path defect, reran the affected verification, left the
  spec's already-disposed streaming trade-off unrepaired and unrecorded, wrote
  the out-of-scope defect to `docs/follow-ups/`, kept the style note and an
  unreproducible suspicion in the handoff, invoked no reviewer, and reported
  completion. The second run, told to establish reviewer availability itself,
  invoked `code-review medium` once and got a review of the session's working
  directory rather than its own repository; it detected the mismatch, repaired
  nothing from it, reported the review as producing no evidence about its diff,
  and still reported the verified work complete. That earlier wording separated
  repair from record but also allowed an unusable review to satisfy completion.
  The 2026-09-07 pipeline decision replaces that completion fallback.
- Compressing that review text from 54 lines to 37 kept every behavior eight
  Sonnet runs checked — counting a declared checkpoint and the final pass as
  two reviews and no more, handing off a user-only reviewer with only the
  commands the session confirmed, triaging six mixed findings to their separate
  dispositions, refusing an explicit request to re-review a spent scope, and
  taking the standard mode for a runtime-verified UI change. Two sentences
  broke because compression removed their reasoning while keeping their
  conclusion. Depth selection chose a cloud mode the model cannot invoke once
  "prefer a model-invocable reviewer" was cut, and the wrong-scope rule went
  unapplied because it never named the signal that detects the case. Bounding
  the choice to invocable modes and naming the signal — findings citing paths
  the change does not contain — fixed both, confirmed on fresh held-out
  scenarios: a one-shot production migration drew the deepest invocable mode
  with the cloud mode offered rather than selected, and a notifications change
  reviewed as the payments module was separated from an ordinary out-of-scope
  finding. A conclusion without its reason survives compression as text and not
  as behavior.
- Baseline `build-prototype` controls, and those of a since-retired review
  skill, created and sometimes
  browser-verified their temporary HTML while still returning only a file path,
  offering to run it later, or never reaching a usable link. Isolated post-build
  controls showed that a single host-independent outcome sentence makes both
  harnesses run the HTML and return an address.
- An earlier workflow-pruning eval reduced `implement` from 78 to 29 lines and
  `split-into-tasks` from 102 to 38 while preserving task boundaries, selected
  and final reviews, meaningful commits, full verification, and safe
  interruption handling. A later review removed the remaining implementation
  context and universal reviewer mechanics because no observed default failure
  justified prescribing them. The first split draft failed to update shared
  spec constraints and invented an unsettled audit policy; one narrow constraint
  and a fresh webhook control corrected both. A separate stock-reservation
  control caught and fixed the pre-existing `complete` versus `completed` state
  drift.
- The imported Git skill bodies were reduced from 464 to 137 lines while
  retaining authority, preservation, remote-state, and completion contracts.
  The first routing runner incorrectly converted failed Claude invocations into
  empty selections, so those scores were discarded. After invalid runs became
  explicit failures, a fresh one-pass suite scored 81 of 112 prompts with zero
  invalid invocations: all 56 negative prompts avoided false activation, while
  only 25 of 56 positive prompts activated implicitly. Descriptions therefore
  remain concise and direct invocation is the reliable route.
- Running `update-project-skills` in a bun-pinned Expo project on 2026-09-09
  aborted every `npx -y skills@latest` call. npm 11.17.0 refused the project's
  `devEngines.packageManager` pin of bun 1.3.6 with `EBADDEVENGINES`. npm's
  `package-json` documentation gives an undefined `onFail` the value `error`,
  and `--engine-strict=false` does not bypass the check, while both `bunx` and
  `pnpm dlx` ran the CLI. `npx` aborts the same way on a locally installed
  binary, which is the `npx expo run:*` case, while `npm install -g` keeps
  working from inside the same project. That session recovered on its own by
  switching to `bunx`, so the instruction saves one failed call rather than a
  stuck run. Neither the `update-project-skills` nor the Expo wording has been
  tested on a held-out control.
- In dearly session records for the two weeks before 2026-10-09, 42 sessions
  ran `gh pr create`; only 11 loaded `pr`. Of the other 31, 28 created the PR
  inside `merge` from its copied body rules and 3 were `triage-issues` runs,
  whose generic "use available PR skills when they fit" sentence never led to
  `pr`. A GitHub PR template is no substitute: `gh` 2.100.0 ignores it whenever
  `--body` or `--body-file` is passed, which agents always do.
- The `skills` CLI 1.7.1 installs skills one at a time through `--skill` and
  reads only `name` and `description` from a `SKILL.md` frontmatter; it has no
  field for declaring that one skill requires another. A required skill can
  therefore be missing only after a one-skill skills.sh install, and the skill
  itself has to detect that at its start.
