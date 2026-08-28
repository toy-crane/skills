# Expo smoke test

## User-visible outcomes

- A user in an Expo or React Native project can invoke `expo-smoke-test` before
  delivery, or ask for a both-platform check, and get the current change's flow
  and the `PRODUCT.md` core loop verified on iOS and Android, each with its own
  runtime evidence.
- The two platform runs happen in parallel where the harness allows concurrent
  sessions, and sequentially elsewhere, with the same evidence either way.
- The core loop becomes a durable regression: the first run records it as
  `.ad` scripts in the target app repository, and later runs replay them.
- `expo-dev-loop` users see no change. The fast per-edit loop keeps its
  one-representative-target default.
- The skill ships through both channels and stands alone when installed by
  itself.

## Approved scope

### One new published skill

Create `skills/expo/expo-smoke-test/` as a sibling of `expo-dev-loop`.
`expo-dev-loop` remains the per-edit inner loop and is not modified. The
frontmatter description triggers on pre-delivery checks, both-platform
verification requests, and core-loop regression requests — not on ordinary
single-target change verification, which keeps routing to `expo-dev-loop`.

### Target and scope of one run

The skill inspects the request, the current diff, and root `PRODUCT.md`. It
verifies two things per platform: the smallest complete flow affected by the
current change, and a representative journey derived from the core loop in
`PRODUCT.md`. It reads `PRODUCT.md` only; it never creates or edits it. When
`PRODUCT.md` or its core loop is missing, the run verifies the change flow
only and reports the gap without blocking.

### Devices

Simulators and emulators are the default targets. A physical device is used
when one is connected and the user asks for it. An explicit physical-iOS
request without the signed XCTest runner prerequisites reports the exact
missing setup as a blocker instead of silently substituting a simulator.

### Two isolated sessions, parallel where possible

Each platform gets its own named `agent-device` session with its own runtime
hints. State-changing commands stay serial within a session; the two sessions
run concurrently when the harness supports it and sequentially when it does
not. Completion requires independent evidence from each platform: one
platform's result is never inferred from the other, and the report separates
the platforms.

### Runtime path per platform

The whole change is classified once, restated inline from the same contract
`expo-dev-loop` carries: Metro fast path for JS/TS-only changes, native
rebuild for anything that alters the binary, native path when mixed or
uncertain. Native rebuilds of the two platforms may run sequentially while
verification still runs per session.

### Core-loop record and replay

When no recorded core-loop script exists, the run drives the journey live,
confirms with the user that the journey represents the core loop, and records
one `.ad` script per platform at a stable committed path in the target app
repository. Later runs replay the scripts as the regression check. A replay
divergence is re-verified live from the divergence point and the script is
updated. Secrets are never recorded into scripts; recorded flows use
pre-authenticated state or fixture credentials.

### Evidence and completion

Each platform's verification proves the four layers `expo-smoke-test` restates
inline: the intended update or build is loaded, the reproduction window shows
no relevant runtime errors, the named outcome passes an exact assertion, and
deeper layers are inspected only when the change claims them. When
`expo-dev-loop` is installed, per-platform verification may be delegated to
it; when absent, the inline contract suffices. Blocked runs name the app,
platform, session, failed gate, and next command or user action. Workarounds
with open root causes and evidenced out-of-scope defects route through
`project-knowledge`, with the direct `docs/follow-ups/<slug>.md` fallback.

### Aligned surfaces

- `.claude-plugin/plugin.json`: the skill's path in `skills`, version bumped.
- Symlinks in `.agents/skills/` and `.claude/skills/`; README links the skill.
- `docs/decisions/skill-naming.md`: records `expo-smoke-test` as a deliberate
  standard-term exception to verb-object grammar, with the `expo` stack marker
  justified by the flat install namespace.

## Observable acceptance criteria

- Given a pre-delivery check request in an Expo project with both platform
  targets available, the run produces per-platform evidence for the change
  flow and the core loop from two isolated sessions, and the report never
  claims one platform from the other's run.
- Given a missing `PRODUCT.md` or core loop, the run verifies the change flow
  only, reports the gap, and leaves `PRODUCT.md` untouched.
- Given no recorded core-loop script, the run records per-platform `.ad`
  scripts after user confirmation of the journey; a later run replays them.
- Given a replay divergence, the run re-verifies live and updates the script.
- Given a harness without concurrent sessions, platforms run sequentially and
  the evidence contract is unchanged.
- Given an explicit physical-iOS request without runner signing, the run
  reports the exact prerequisites as the blocker.
- Given only `expo-smoke-test` installed, a run completes without referencing
  another skill's text.
- Given an ordinary "verify this change" request with no both-platform or
  delivery framing, `expo-dev-loop` triggers instead.
- `claude plugin validate . --strict` passes; the plugin version is bumped.

## Settled constraints and rationale

- A sibling skill, not an `expo-dev-loop` extension: the per-edit loop's value
  is speed on one representative target, and one description covering both
  cadences would blur routing and `implement`'s per-surface skill selection.
- The name `expo-smoke-test` takes the standard QA term for this activity.
  Smoke testing is defined as a broad, shallow pass over the handful of flows
  whose failure makes a build pointless, which is what the core-loop half of
  this skill does; the change-flow half is what the same vocabulary calls
  sanity testing. Using the established word means the trigger needs no
  explanation. The stack marker stays because skill names install into a flat
  global namespace.
- Parallelism is an optimization, not the contract. The contract is session
  isolation plus per-platform evidence, so the skill stays harness-neutral
  and degrades to sequential runs without weakening completion.
- Record-then-replay for the core loop: replaying a confirmed script is
  cheaper and more stable than re-deriving the journey from product prose
  each run, and divergence reports carry ranked selector suggestions that
  keep maintenance bounded.
- Simulators and emulators are the default because iOS physical devices need
  one-time signing setup and unlock/connection state, which is too heavy a
  default for a repeatable loop; Android physical needs only USB debugging,
  so the option stays cheap when requested.

## Evidence

- `agent-device` 0.20.0, verified in this session. `help react-native`
  documents two concurrent named sessions on different devices with
  per-session Metro hints. `help replay` documents `.ad` replay, divergence
  reports with ranked selector suggestions, `--env` variable injection, and
  `--from` resume. `help physical-device` documents iOS prerequisites
  (Developer Mode, signed AgentDeviceRunner via team id and bundle id) and
  Android's USB-debugging-only requirement. `help workflow` warns that
  recorded fill/type inputs are written literally, grounding the no-secrets
  rule. Reopen the session design if a release drops named-session
  concurrency or replay, or changes `.ad` semantics.
- Naming research, August 2026. QA sources agree on the triad: smoke is broad
  and shallow over critical flows per build, sanity is narrow and deep over a
  specific change, regression is the full re-check. The React Native and Expo
  ecosystem's umbrella term is E2E, with Maestro and Detox as the tools and
  `e2e:ios` / `e2e:android` as the common script names. E2E was rejected
  because it names a test-suite runner category rather than an agent-driven
  verification loop. Sources: CloudBees "Smoke, Sanity, and Regression
  Testing Triad", BrowserStack "Sanity Testing vs Smoke Testing", minitap
  "Automated Smoke Tests", Maestro "The 3 Best React Native Testing
  Frameworks".

## Assumptions

- A1. Cadence is on-demand plus delivery checkpoint, not per-edit. If the
  user wants it per-change, only the trigger description changes.
- A2. Default script path is `e2e/core-loop.<platform>.ad` in the target app
  repository; an existing project convention overrides it.
- A3. The first recorded journey needs one user confirmation before it
  becomes the standing regression baseline.
- A4. The exact version number and README wording are implementation choices.

## Off-limits

- Changing `expo-dev-loop`'s contract or its representative-target default.
- Creating or editing `PRODUCT.md` from this skill.
- Assuming another installed skill's text; anything required is restated
  inline.
- Hardcoding one harness's concurrency mechanics as the contract.
- Recording secrets into `.ad` scripts.
- Touching the vendored `writing-great-skills` skill.

## Deferred points

- Whether one shared `.ad` script can serve both platforms in apps with
  consistent testIDs; confirm per target project before merging scripts.
- CI wiring (`prepare ios-runner`, runner caching, `close --shutdown`); v1
  targets local interactive runs.
- Whether `implement` or the pipeline decision should name `expo-smoke-test`
  as a delivery-checkpoint option; description-based triggering ships first.

## Remaining risks

- Trigger overlap with `expo-dev-loop` is unmeasured; the repo's routing-eval
  practice applies if misrouting is observed.
- The name may read as a lighter check than the contract requires, since
  ordinary smoke tests do not demand four layers of runtime evidence. The
  description carries the actual depth.
- Parallel native builds can contend for CPU and disk; the sequential-build,
  parallel-verify allowance mitigates but is unmeasured.
- Replay may report divergence noise on apps with unstable accessibility
  surfaces, costing live re-verification time.
- The core-loop journey derivation from product prose is model-judged; the
  one-time confirmation and the recorded script bound the drift.
