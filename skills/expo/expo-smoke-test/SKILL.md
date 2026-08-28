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
sessions concurrently when the harness supports concurrent work, and
sequentially when it does not; each platform owes the same evidence either way.
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
agent-device open <app-id> --platform ios --device "<name>" --session core-ios --relaunch --metro-port <metro-port> --save-script=/abs/path/to/project/e2e/core-loop.ios.ad
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
while another daemon holds the runner lease.

A replay result is not by itself product evidence. A recorded step binds to the
accessibility identity captured at record time, and that identity is not stable
across relaunches on iOS, so a divergence is at least as likely to be a
recording artifact as a real regression. Never report a divergence as a broken
core loop. Re-verify live from the step it names, and report the core loop as
passing or failing on what the live run shows. Distinguish a divergence from an
infrastructure failure such as a daemon timeout, which says nothing about the
app at all; re-run those rather than investigating them as app behavior.

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
