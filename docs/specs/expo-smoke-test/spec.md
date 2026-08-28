# Expo smoke test

## User-visible outcomes

- A user in an Expo or React Native project can invoke `expo-smoke-test` before
  delivery, or ask for a both-platform check, and get the current change's flow
  and the `PRODUCT.md` core loop verified on iOS and Android, each with its own
  runtime evidence.
- The two platform runs happen in parallel where the harness allows concurrent
  sessions, and sequentially elsewhere, with the same evidence either way.
- Every run drives the core loop on the actual app. The user gets evidence that
  the journey was exercised end to end this time, not that a recording matched.
- `expo-dev-loop` keeps its per-edit cadence and one-representative-target
  default; it gains the same development-build requirement.
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

### Client

Every run verifies against a development build of the project. Expo Go is not
an accepted client for this skill: it is a fixed prebuilt shell that cannot
carry the project's own native modules, config plugins, permissions, or
entitlements, so passing there proves only that the JavaScript behaved inside a
different binary than the one being delivered. When no development build is
installed, the run builds one before verifying. The Metro-versus-native
classification decides whether that build must be rebuilt, not which client to
use.

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

### Core-loop drive

Every run drives the core-loop journey on the actual app, on each platform,
from the current screen state: read the screen, act, and assert the named
outcome. The journey is derived from `PRODUCT.md` each run, so that file stays
its single definition. Confirm the derived journey with the user when the core
loop admits more than one reasonable reading.

A recorded-and-replayed script is not an accepted substitute. Replay verifies
each step against the identity captured at record time and stops at the first
mismatch, so a diverging run never exercises the rest of the journey, and a
passing one is gated on fingerprints rather than on the app behaving.

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
- Given a `PRODUCT.md` core loop, every run drives that journey on each
  platform's running app and asserts its final outcome, including runs where an
  earlier run already passed.
- Given a core loop that admits more than one reading, the run confirms the
  derived journey with the user before treating it as the checked journey.
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
- The core loop is driven live every run because a smoke test's whole product
  is the observation that the app still works. Replay was measured and rejected:
  it stops at the first identity mismatch, so a diverging run leaves the rest of
  the journey unexercised while reporting a failure the app did not cause, and a
  passing run certifies fingerprints rather than behavior. Live driving costs
  more wall clock and re-derives the journey from `PRODUCT.md` each time, which
  is the price of every result meaning something.
- The development build is the client because this skill's whole output is
  pre-delivery confidence. Verification is only as good as the binary it ran
  in, and Expo Go's native surface is fixed by Expo rather than by the project,
  so it cannot exercise the project's own native modules, config plugins,
  permissions, or entitlements. Accepting it would let a run report both-platform
  confidence for a binary that will never ship. The cost is that a first run in
  a project without a development build must build one.
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
- Forward run on a real fixture, August 2026. An Expo SDK 57 app with a
  PRODUCT.md core loop was driven on a dedicated iOS 26.5 simulator and a
  dedicated API 35 arm64 emulator. The first pass ran on Expo Go 57.0.9; the
  contract then moved to development builds and the whole pass was repeated on
  `npx expo run:ios` and `npx expo run:android` output. On the development
  builds, two named sessions verified the change flow independently: each read
  `Disabled`, pressed the toggle, and read `Enabled` through exact `get text`
  assertions. Core-loop scripts recorded and replayed on both platforms.
  Concurrent replays on Expo Go both exited 0 (iOS 9.4s, Android 11.7s, against
  7–8s and 3–6s solo), confirming session isolation and the contention cost.
- Defects that surfaced only by running it: a relative `--save-script` path
  resolves against the daemon's working directory and silently wrote outside
  the project; a URL target rejects `--relaunch`; an iOS replay fails while
  another daemon holds the runner lease; the device names `agent-device`
  reports are neither adb serials nor simulator UDIDs; and a development build
  launched with a stale dev-server URL silently loaded a **different project's
  bundle** from another checkout's Metro on the default port, surfacing that
  project's source paths as if they were this one's. An Android emulator also
  needs a port reverse to reach a non-default host Metro port.
- Replay reliability, measured on the development builds. iOS passed 5 of 8;
  all three failures were `identity-mismatch` on the recorded accessibility
  ancestry, not app changes. Android passed 3 of 6; all three failures were
  daemon timeouts under sustained load, with no divergence. An earlier Expo Go
  sample suggested that recording from a fresh session made replay stable
  (3 of 3); the development-build measurement contradicts that, so the fresh-
  session rule is not a reliability fix and the skill no longer claims it is.
  A missing `expo-linking` native module also proved the client argument
  directly: the development build raised it as a RedBox, while Expo Go ships
  that module prebuilt and would have masked it.
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
- A2. The journey is re-derived from `PRODUCT.md` each run rather than stored,
  so `PRODUCT.md` remains its only definition and no second artifact can drift
  from it.
- A3. Confirmation is asked only when the core loop admits more than one
  reasonable journey, not on every run.
- A4. The exact version number and README wording are implementation choices.

## Off-limits

- Accepting Expo Go, or any prebuilt shell the project does not build, as the
  client that satisfies a platform's evidence. The user extended this to
  `expo-dev-loop`, which now carries the same client requirement.
- Changing `expo-dev-loop`'s representative-target default or its per-edit
  cadence.
- Creating or editing `PRODUCT.md` from this skill.
- Assuming another installed skill's text; anything required is restated
  inline.
- Hardcoding one harness's concurrency mechanics as the contract.
- Reporting a core loop as verified on evidence other than this run driving it
  on that platform's running app.
- Touching the vendored `writing-great-skills` skill.

## Deferred points

- Whether a long core loop needs a way to resume mid-journey after an
  infrastructure failure, now that no recorded plan exists to resume from.
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
  parallel-verify allowance mitigates but is unmeasured. Concurrent replays
  measured 1.3 to 3 times their solo duration.
- Driving live costs more wall clock per run than a clean replay did, and the
  journey is re-derived by the model each time, so a vaguely written core loop
  can be read differently across runs. `PRODUCT.md` and the confirmation step
  bound this, but neither prevents it.
- Physical devices and the iOS runner signing blocker remain unverified.
- The core-loop journey derivation from product prose is model-judged; the
  one-time confirmation and the recorded script bound the drift.
