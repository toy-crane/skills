---
name: expo-smoke-test
description: Verify an Expo or React Native change together with the app's core loop on both iOS and Android using agent-device. Use before delivering a change, when the user asks to confirm behavior on both platforms, or when the recorded core-loop journey should run again as a regression. Run one isolated device session per platform, record the core loop as a replayable script, and finish only with separate runtime evidence for each platform. For verifying one change on a single target during ordinary editing, use expo-dev-loop instead.
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

## Choose devices and sessions

Use a local simulator and emulator as the default targets. Use a physical
device when one is connected and the user asks for it. A physical iOS target
additionally needs Developer Mode and a signed XCTest runner; when that setup
is missing, report the exact prerequisites from
`agent-device help physical-device` as a blocker rather than substituting a
simulator.

Give each platform its own named session, so both apps can run at once. Target
devices by the names `agent-device devices` reports, which are not adb serials
or simulator UDIDs:

```bash
agent-device devices --platform ios
agent-device open "Expo Go" exp://127.0.0.1:<metro-port> --platform ios --device "<name>" --session smoke-ios --relaunch
agent-device open exp://127.0.0.1:<metro-port> --platform android --device "<name>" --session smoke-android
```

Open the actual installed app identifier, development-client URL, or Expo Go
project URL reported by the running tools; do not invent one. On iOS prefer the
host-shell-plus-URL form. On Android a URL target rejects `--relaunch`, so open
the host package first when the journey needs a clean process.

Carry `--session <name>` on every command in a named-session flow. Without it a
command targets the implicit default session instead of the platform you meant.

Keep state-changing commands serial inside a single session. Run the two
sessions concurrently when the harness supports concurrent work, and
sequentially when it does not; each platform owes the same evidence either way.
Concurrent runs contend for CPU and device I/O, so allow longer per-command
timeouts than a solo run needs.

## Classify the runtime path

Classify the whole change once, before launching:

- **Metro path:** JavaScript or TypeScript behavior, React components, styles,
  navigation code, and bundle-loaded assets that do not alter the native app.
  Reuse the running app and Metro server, and let Fast Refresh or
  `agent-device metro reload` apply the change.
- **Native path:** app config that affects the binary, config plugins, native
  modules or dependencies, permissions, entitlements, icons or splash
  configuration, native project files, SDK or React Native upgrades, and
  startup behavior. Build with the repository-supported command, normally
  `npx expo run:ios` or `npx expo run:android`, install the resulting
  development build, and relaunch it.

Use the native path for a mixed change or when native impact remains uncertain.
Expo Go cannot prove a native change; use a development build. Preserve the
project's managed or checked-in native workflow rather than regenerating native
directories as an incidental verification step. Native builds for the two
platforms may run one after another while verification still runs per session.

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

When the `expo-dev-loop` skill is available, it may carry one platform's
verification. Target selection, both-platform coverage, the core-loop
regression, and the completion gate stay here.

## Record or replay the core loop

When no recorded core-loop script exists for a platform, record one in a
session that starts clean, because the recorded target carries the accessibility
ancestry observed at record time. Start a fresh session whose armed open is its
first action, assert readiness before the first interaction, drive the journey,
end on a selector-targeted assertion that proves the destination, confirm with
the user that the journey represents the core loop, then publish without
closing:

```bash
agent-device open "Expo Go" exp://127.0.0.1:<metro-port> --platform ios --device "<name>" --session core-ios --relaunch --save-script=/abs/path/to/project/e2e/core-loop.ios.ad
agent-device wait 'id="<first-target>"' 60000 --session core-ios
# drive the core-loop journey
agent-device wait 'id="<destination>"' 15000 --session core-ios
agent-device session save-script --session core-ios
```

Give `--save-script` an absolute path. A relative path resolves against the
daemon's working directory rather than the project, which silently writes the
script outside the repository. Follow the project's existing script-path
convention for the absolute target when it has one.

Assert readiness immediately after the open. A script that interacts straight
after opening races the bundle load and diverges on every cold replay.

Recorded `fill` and `type` inputs are written literally, so record only
pre-authenticated state or non-secret fixture credentials.

When a script exists, replay it as the regression check. Stop the session that
owns the device runner first: a replay starts its own daemon and fails on iOS
while another daemon holds the runner lease. Re-verify a reported divergence
live from the step it names, then re-record the script from a clean session so
the recorded journey matches current intended behavior. A divergence reporting
that the selector still matches but the recorded identity does not usually
means the script was recorded in an already-warm session, not that the app
changed.

## Finish the run

Finish only when each platform separately shows the current change loaded, the
change flow passing its exact expectation, the core-loop journey passing or its
absence reported, and no relevant runtime errors during the reproduction.
Report each platform's target, flows, assertions, and artifact paths on its own,
separating observed results from remaining inference. Evidence from one platform
never establishes the other.

If verification is blocked, name the app, platform, session, failed gate, and
the exact next command or user action needed. Close both sessions when
finished, and leave a healthy Metro server running for the next edit loop
unless the user requested cleanup; in CI, release the devices with
`agent-device close --shutdown`.

When a workaround such as clearing a cache or rebuilding leaves its root cause
open, or you observe an out-of-scope defect with evidence, record it at the
moment of discovery through the `project-knowledge` skill. If that skill is
unavailable, write the symptom, observed evidence, suspected cause, what was
tried, and a proposed next step to `docs/follow-ups/<slug>.md` yourself.
Reporting it only in conversation loses it.
