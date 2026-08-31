# Runtime verification preflight

## User-visible outcomes

- Runtime verification starts only after the selected target is ready, is
  running the intended project's current result, and has the state required by
  the scenario being checked.
- The result distinguishes runtime readiness, known initial state, and observed
  product behavior. Preparing an environment is never reported as evidence that
  the behavior passed.
- Ordinary development checks stay fast. A whole simulator or emulator reset is
  reserved for checks that need a true fresh-device condition rather than being
  imposed on every edit or smoke run.
- The handoff names what was reset, what was deliberately preserved, and which
  external state remained outside the reset boundary, so “clean” never hides an
  unknown backend or host state.

## Approved scope

### Three explicit gates

Every specialized runtime-verification flow separates these gates in order:

1. **Runtime readiness** proves that the intended target, application or route,
   development runtime, and observation channel are usable and belong to the
   current project.
2. **Known initial state** establishes the state required by the selected
   scenario across the applicable app-local, operating-system, and backend
   boundaries.
3. **Behavior verification** drives the flow and asserts its named result.

A failure names the gate that failed. Passing an earlier gate cannot satisfy a
later one.

### Ownership stays with the specialized verifier

`implement` selects and composes matching runtime-verification skills and owns
the completion claim. It does not contain framework-specific readiness, reset,
or seeding procedures.

Each specialized verifier owns the preflight for the runtime it observes. It
may use a project-provided backend preparation path when that backend is part of
the scenario, but it reports that boundary separately rather than treating a
ready client as proof of ready service state. No generic preflight or runtime-
verification dispatcher is introduced.

### Expo development and smoke profiles

`expo-dev-loop` uses a lightweight preflight on its representative target. It
confirms the selected device, development build, current project bundle, and
observation path. It does not erase a whole simulator or emulator as routine
per-edit preparation.

`expo-smoke-test` establishes shared prerequisites before platform verification
begins and selects one of three state profiles for each claimed platform:

- **Known app state** is the default. It prepares the app-local data, explicit
  permissions, login or fixture state required by the journey, while preserving
  unrelated device state. Known state may be empty or seeded; it means explicit
  and reproducible, not always blank.
- **Fresh device** resets a dedicated simulator or emulator, then restores the
  development build, current project runtime, and required backend fixture
  before driving the journey. It applies when the request or approved behavior
  requires a fresh install, or when the change affects first launch, onboarding,
  OS permissions, secure device storage, application identity, native
  configuration, deep links, push behavior, or another device-level surface.
  Evidence of leaked device state may also escalate a run to this profile.
- **Preserved or prior state** deliberately retains or seeds an earlier state
  for returning-user, upgrade, and migration behavior. A fresh-device reset is
  forbidden when it would remove the condition being verified.

The smoke coordinator owns profile selection and destructive preparation before
platform workers act. Workers do not race to reset shared prerequisites. Each
platform still owes independent readiness, state, and behavior evidence.

Whole-device reset is permitted only on a simulator or emulator dedicated to
the active verification. It never targets a physical device, a user-owned
target, or a target currently shared with another active run.

### Web runtime and backend state remain separate

A Next.js verification flow owns browser and framework readiness: the intended
development server and route are live, the current result is loaded, and the
available framework and browser observations can inspect it.

Supabase or another stateful service remains a separate affected surface. When
the behavior depends on it, verification proves service readiness and uses the
project's deterministic local or test migration and seed contract to establish
the required fixture. A simulator reset or browser restart never counts as a
backend reset. Destructive remote reset is outside ordinary implementation and
verification authority.

### Diagnostics and reporting

Routine preflight uses the narrow checks needed to prove its gates. Broad setup
diagnostics run when the user asks for environment diagnosis or when a failed
gate suggests an unhealthy toolchain; they are not an unconditional tax on
every successful loop.

The verification report includes the selected state profile, target identity,
readiness result, state boundaries prepared or preserved, and behavioral
assertions. A blocked report names the first failed gate and the concrete
prerequisite still missing.

## Observable acceptance criteria

- Given an Expo edit on a healthy representative target, `expo-dev-loop`
  verifies readiness and the changed flow without erasing the whole target.
- Given an Expo smoke run whose journey needs ordinary reproducible state, the
  run uses the known-app-state profile and reports the app, permission, and
  backend boundaries it prepared or preserved.
- Given a first-launch, onboarding, permission, secure-storage, application-
  identity, deep-link, push, or native-configuration change, the smoke run uses
  a dedicated fresh target on every platform whose result it claims, reinstalls
  the required runtime, and verifies the journey after the reset.
- Given a target that is physical, user-owned, shared, or claimed by another
  active run, verification does not erase it and reports the need for a
  dedicated target when fresh-device evidence is required.
- Given returning-user, upgrade, or migration behavior, verification preserves
  or seeds the required prior state and does not erase away the test premise.
- Given an app that launches against the wrong project bundle, stale server, or
  unusable observation channel, readiness fails before behavioral assertions
  begin.
- Given behavior that depends on Supabase or another stateful backend, the run
  verifies and prepares the allowed local or test backend state independently
  of client reset, and does not issue a destructive remote reset.
- Given a ready environment whose named behavior fails, the result reports a
  behavior failure rather than misclassifying it as setup failure.
- Given only one specialized runtime-verification skill installed, that skill
  performs its own preflight without relying on another skill's text.
- The changed published skills remain available through both distribution
  channels, and strict plugin validation passes.

## Settled constraints and rationale

- Preflight belongs to the specialized verifier because readiness and state
  controls are specific to the runtime being observed. Moving their commands
  into `implement` would duplicate framework knowledge and weaken standalone
  installation; a generic dispatcher would add no separate user outcome.
- The default is the least destructive profile that establishes the required
  known state. Whole-device reset gives stronger fresh-install evidence but is
  slower, disrupts unrelated state, and increases setup failures, so its cost is
  justified only by a device-level claim or evidence of contamination.
- Whole-device reset establishes only device-local state. Host toolchains,
  development-server caches, and external services remain separate gates, so
  the result never calls a device reset a complete environment reset.
- Fresh-state and migration-state checks are complementary. Making every run
  fresh would hide precisely the prior-state conditions that migrations and
  returning-user behavior must survive.
- Destructive preparation has one owner before concurrent verification starts.
  This prevents a worker from invalidating another platform's setup or evidence.

## Evidence

- Local `xcrun simctl help erase`, checked 2026-08-31, defines simulator erase
  as erasing a device's contents and settings. It does not claim to reset host
  build tooling or external services.
- Installed `agent-device` 0.20.0, checked 2026-08-31, exposes app-state clearing
  and permission reset as separate operations. Its doctor command diagnoses
  device, app, development-server, and React Native or Expo readiness. No one
  operation establishes all client, OS, host, and backend state.
- The current official Next.js
  [`next-dev-loop`](https://github.com/vercel/next.js/blob/canary/skills/next-dev-loop/SKILL.md)
  already performs a session preflight for its browser and framework
  observation path, supporting runtime-owned rather than `implement`-owned
  preparation. Reopen this conclusion if the official workflow moves that
  responsibility elsewhere.
- Supabase's current
  [local development workflow](https://supabase.com/docs/guides/local-development/cli-workflows)
  and [seeding guidance](https://supabase.com/docs/guides/local-development/seeding-your-database)
  separate local database reset, migrations, and deterministic seed data. A
  linked remote reset is destructive and is not an ordinary verification
  prerequisite.

## Assumptions

- The policy applies to both iOS simulators and Android emulators even though
  their concrete reset and permission mechanisms differ.
- “Dedicated” means the target is allocated only to the active verification and
  can be destructively reset without affecting another user or run.
- A repository that depends on backend state exposes, or can safely construct,
  a deterministic local or test preparation path. Its absence produces a
  blocker rather than permission to reset a remote environment.
- Exact commands and tool versions are implementation choices verified against
  the installed environment when the work is delivered.

## Off-limits

- Creating a generic environment-readiness or runtime-verification dispatcher.
- Erasing a whole simulator or emulator before every development or smoke run.
- Erasing a physical, user-owned, shared, or otherwise unowned target.
- Treating app-state clear, whole-device erase, process restart, or successful
  startup as complete environment readiness or behavioral evidence by itself.
- Destructively resetting a linked or remote backend without separate explicit
  authority.
- Removing prior state from an upgrade, migration, or returning-user scenario.

## Deferred points

- Exact per-platform commands and the smallest reliable set of readiness
  probes; these depend on installed tool behavior and belong to implementation
  verification.
- Whether repeated independent requests to prepare an environment without
  testing eventually justify a stack-specific user-facing skill. No such
  separate outcome is established yet.
- Disposable-target or CI snapshot mechanics. The first delivery targets local
  interactive verification with dedicated existing targets.
- A reusable Supabase-specific verification skill. Until independent demand is
  established, project-owned local or test preparation remains the contract.

## Remaining risks

- App-local clearing may leave relevant state in secure or shared device
  storage; the profile-selection triggers reduce but cannot eliminate a missed
  device-level dependency.
- A fresh-device run is slower and may fail during rebuild or reinstall before
  it reaches product behavior.
- Backend authentication, storage, functions, and database fixtures may not
  share one reset boundary. A project can therefore expose only partial known
  state until its preparation contract covers every affected service.
- Automatic profile selection can miss an indirect device-level consequence.
  Reporting the selected profile and preserved boundaries keeps that gap
  visible and lets an explicit stronger request override it.
- Android fresh-device behavior was not exercised during shaping; the delivery
  must verify parity rather than infer it from iOS semantics.
