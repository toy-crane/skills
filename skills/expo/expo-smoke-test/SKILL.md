---
name: expo-smoke-test
description: Verify an Expo or React Native change together with the app's core loop on both iOS and Android using agent-device. Use before delivering a change, when the user asks to confirm behavior on both platforms, or when the core loop should be exercised again as a regression. Coordinate shared prerequisites, then spawn exactly two isolated platform subagents—prefer the installed expo-smoke-runner profile—wait for both, and finish only with separate runtime evidence for each platform. For verifying one change on a single target during ordinary editing, use expo-dev-loop instead.
---

# Expo Smoke Test

Prove two things on each platform: the current change works, and the app's core
loop still works. Static inspection, type checks, unit tests, and a successful
bundle support the result but do not replace device verification.

## Establish the run

Inspect the request, the current diff, the Expo config, and the package
manifest to identify the flow the change affects and its observable result.

Read root `PRODUCT.md` when it exists and derive one representative journey
from its core loop. Read that file only; never create or edit it. When
`PRODUCT.md` or its core loop is absent, verify the change flow alone and
report the missing regression coverage.

Use the installed CLI's version-matched guidance instead of remembered command
shapes:

```bash
agent-device help workflow
agent-device help react-native
```

If `agent-device` is unavailable, report that runtime verification is blocked
and give `npm install -g agent-device@latest` as the setup command.

Point each platform's client at this project's own dev server rather than a
default port another checkout may already hold. Pass the port as a session
runtime hint with `--metro-port`, and confirm from the running tools which port
this project actually serves.

## Choose devices and sessions

Use a local simulator and emulator as the default targets. Use a physical
device when one is connected and the user asks for it. A physical iOS target
additionally needs Developer Mode and a signed XCTest runner; when that setup
is missing, report the exact prerequisites from
`agent-device help physical-device` as a blocker rather than substituting a
simulator.

Run every platform against a development build of the project itself. A
development build is the binary this change will ship in, so it is the only
client that can carry the project's own native modules, config plugins,
permissions, and entitlements. Expo Go is a fixed prebuilt shell: passing there
proves the JavaScript behaved inside a different binary than the one being
delivered, which is not the evidence this check exists to produce. When no
development build is installed, build one with the repository-supported command,
normally `npx expo run:ios` or `npx expo run:android`, before verifying.

Give each platform its own named session, so both apps can run at once. Target
devices by the names `agent-device devices` reports, which are not adb serials
or simulator UDIDs, and open the development build by its own app id:

```bash
agent-device devices --platform ios
agent-device apps --platform ios
agent-device open <app-id> --platform ios --device "<name>" --session smoke-ios --relaunch
agent-device open <app-id> --platform android --device "<name>" --session smoke-android --relaunch
```

Open the actual installed app identifier or development-client URL reported by
the running tools; do not invent one. A URL target rejects `--relaunch`, so open
the app id when the journey needs a clean process and pass the URL afterward
only if the build needs to be pointed at a specific dev server.

Carry `--session <name>` on every command in a named-session flow. Without it a
command targets the implicit default session instead of the platform you meant.

Keep state-changing commands serial inside a single session. Run the two
sessions concurrently through the two platform workers described below.
Concurrent runs contend for CPU and device I/O, so allow longer per-command
timeouts than a solo run needs.

## Classify the runtime path

Classify the whole change once, before launching:

- **Metro path:** JavaScript or TypeScript behavior, React components, styles,
  navigation code, and bundle-loaded assets that do not alter the native app.
  Reuse the installed development build and its Metro server, and let Fast
  Refresh or `agent-device metro reload` apply the change.
- **Native path:** app config that affects the binary, config plugins, native
  modules or dependencies, permissions, entitlements, icons or splash
  configuration, native project files, SDK or React Native upgrades, and
  startup behavior. Rebuild with the repository-supported command, install the
  resulting development build, and relaunch it.

Both paths run on a development build; the classification decides whether that
build must be rebuilt, not which client to use. Use the native path for a mixed
change or when native impact remains uncertain. Preserve the project's managed
or checked-in native workflow rather than regenerating native directories as an
incidental verification step. Native builds for the two platforms may run one
after another while verification still runs per session.

## Delegate exactly two platform workers

The coordinator owns everything shared: inspect the change and `PRODUCT.md`,
classify the runtime path once, select both targets and app identifiers, prepare
the development builds, start or identify the project-owned Metro server, and
define the changed flow plus core-loop journey. Finish native builds serially
when they would contend for the same project state. Do not make either platform
worker rediscover or mutate this shared setup.

Once those prerequisites are ready, use the harness's subagent capability to
spawn exactly two workers concurrently:

- one `expo-smoke-runner` for iOS with session `smoke-ios`;
- one `expo-smoke-runner` for Android with session `smoke-android`.

Give each worker only its platform assignment, including the project directory,
target device, app id or development-client URL, Metro port, runtime path,
changed flow and exact expected outcome, core-loop journey or its confirmed
absence, evidence requirements, and its fixed session name. The worker drives
the app and returns evidence; it never covers the other platform or spawns a
nested agent.

Wait for both workers, then aggregate their reports against the completion gate.
One worker finishing or passing never substitutes for the other. This explicit
topology prevents the observed failure where a generic concurrency hint leaves
both sessions in the coordinator instead of creating isolated test contexts.

Select the custom agent named `expo-smoke-runner` when the installation exposes
it. If subagents are available but that profile is not installed, still spawn
exactly two general-purpose subagents and include this skill's complete
per-platform verification contract in each assignment. This keeps the skill
self-contained. If the harness exposes no subagent capability at all, run both
named sessions directly, preserve the same evidence gate, and report that
platform-context isolation was unavailable.

## Verify each platform

On each platform, exercise the smallest complete flow the change affects, then
the core-loop journey. Check four layers for each:

1. **Loaded:** the intended Metro update or native build is running on that
   target, with no bundle, build, or incompatible-client error.
2. **Healthy:** reproduce inside a focused log window and check for relevant
   JavaScript errors, native crashes, RedBox or LogBox failures, and rejected
   network requests.
3. **Correct:** drive the flow with `press`, `fill`, `scroll`, `back`, and
   other appropriate commands using `--settle`; verify the named outcome with
   an exact `wait`, `is`, `get`, or `find` assertion. A screenshot alone does
   not prove a behavioral expectation.
4. **Sound at the claimed layer:** inspect the React tree, props, hooks,
   re-renders, native performance, network data, or traces only when the change
   makes a claim about that layer.

Use refs from the latest snapshot or settled diff. A state-changing command
invalidates earlier refs; refresh the snapshot or use a stable id, label, role,
or testID before the next action. Prefer semantic selectors and use coordinates
only when the accessibility surface cannot expose the target, recording that
limitation with visual evidence.

Collect evidence proportional to the claim: a screenshot for visual output,
focused logs for runtime behavior, network output for request behavior, and
performance artifacts for performance claims.

When an overlay dismissal reports that the overlay is still visible, capture a
screenshot before concluding it blocks the run. A development client's own
floating controls can register as an overlay while the app UI stays fully
reachable; report what the screenshot shows rather than retrying the dismissal.

## Drive the core loop

Drive the core-loop journey on the running app every run, on each platform.
Derive it from `PRODUCT.md` so that file stays its single definition, and
confirm the derived journey with the user when the core loop admits more than
one reasonable reading.

Assert readiness before the first interaction, then work from the current
screen: read it, act, and assert the outcome each step establishes. End on an
assertion that proves the journey reached its destination.

```bash
agent-device wait 'id="<first-target>"' 60000 --session smoke-ios
agent-device fill 'id="<input>"' "<value>" --settle --session smoke-ios
agent-device press 'id="<action>"' --settle --session smoke-ios
agent-device wait 'id="<destination>"' 15000 --session smoke-ios
```

A replayed recording does not satisfy this. Replay checks each step against the
element identity captured when the script was made and stops at the first
mismatch, so a diverging run leaves the rest of the journey unexercised while
reporting a failure the app did not cause, and a passing run certifies
fingerprints rather than behavior. Report a core loop as verified only from
this run driving it on that platform's running app.

Read a failure for what it is before reporting it. An assertion that fails on a
loaded, healthy app is a regression; a daemon timeout, a lost device, or a
snapshot the accessibility layer could not capture says nothing about the app,
so recover and re-drive rather than reporting the core loop as broken.

## Finish the run

Finish only when each platform separately shows the current change loaded, the
change flow passing its exact expectation, the core-loop journey passing or its
absence reported, and no relevant runtime errors during the reproduction.
Report each platform's target, flows, assertions, and artifact paths on its own,
separating observed results from remaining inference. Evidence from one platform
never establishes the other.

If verification is blocked, name the app, platform, session, failed gate, and
the exact next command or user action needed. Each worker closes its own session
when finished; the coordinator closes any session it had to run directly. Leave
a healthy Metro server running for the next edit loop unless the user requested
cleanup; in CI, release the devices with `agent-device close --shutdown`.

When a workaround such as clearing a cache or rebuilding leaves its root cause
open, or you observe an out-of-scope defect with evidence, record it at the
moment of discovery through the `project-knowledge` skill. If that skill is
unavailable, write the symptom, observed evidence, suspected cause, what was
tried, and a proposed next step to `docs/follow-ups/<slug>.md` yourself.
Reporting it only in conversation loses it.
