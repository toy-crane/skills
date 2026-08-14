---
name: expo-dev-loop
description: Verify Expo and React Native changes in a running app with Argent. Use after editing screens, navigation, interactions, app configuration, config plugins, native dependencies, permissions, startup behavior, or performance, or whenever the user asks to confirm an Expo change on an iOS Simulator, Android Emulator, or ADB-connected Android device. Classify whether the change can use the Metro fast path or requires a native rebuild, then finish only with observable runtime evidence.
---

# Expo Dev Loop

Prove the changed behavior in the running app. Static inspection, type checks,
unit tests, and a successful bundle support the result but do not replace device
verification. Argent supplies device control and diagnostics; use the
repository's own commands to start Metro, build, and install the app.

## Establish the project and target

Inspect the request, current diff, Expo config, package manifest, and
repository-provided commands. Identify the intended flow, platform, device, and
observable result. Honor an explicitly requested target. Otherwise use one
available representative local target and state that coverage; never infer iOS
and Android parity from one run.

Check once whether Argent MCP tools are loaded or an existing project or global
Argent executable is available. If Argent is absent, install its official
project-local agent context automatically with telemetry disabled:

```bash
npx @swmansion/argent@latest init --local --yes --no-telemetry
```

Report the files the installer actually changed, including the package manifest
and lockfile, `.argent/install.json`, MCP configuration, and installed vendor
skills or rules. Preserve unrelated configuration. Use an existing project
version without silently updating it, and never substitute a global install.

Installation is setup, not runtime evidence. A newly configured MCP server may
not appear until the next agent session. When Argent MCP tools are unavailable,
continue through the installed project CLI if it exposes the needed capability:

```bash
npx --no-install argent tools
npx --no-install argent tools describe <tool>
npx --no-install argent run <tool> <flags>
```

Read tool schemas from the installed version rather than recalling parameter
shapes. Require a session restart only when the needed capability is available
through neither the loaded MCP tools nor the project-local CLI. Use relevant
official Argent skills when installed, while retaining the Expo-specific path
and proof requirements below.

Resolve the actual device and installed app identifier through Argent. Do not
invent a simulator, emulator, bundle identifier, package name, or development
client URL. The supported Expo targets are local iOS Simulators, Android
Emulators, and user-selected ADB-connected Android devices. Do not claim
physical iPhone or hosted iOS coverage.

## Choose the runtime path

Classify the whole change before launching the app:

- **Metro path:** JavaScript or TypeScript behavior, React components, styles,
  navigation code, and bundle-loaded assets that do not alter the native app.
  Reuse the running Expo Go or development build and Metro server. Let Fast
  Refresh apply the change or use Argent's Metro reload when a full JavaScript
  reload is needed.
- **Native path:** Expo app config that affects the binary, config plugins,
  native modules or dependencies, permissions, entitlements, icons or splash
  configuration, native project files, SDK or React Native upgrades, and native
  startup behavior. Use the repository-supported build command, normally
  `npx expo run:ios` or `npx expo run:android`, install the development build,
  and relaunch it through Argent.

Use the native path for a mixed change or when native impact remains uncertain.
Expo Go cannot prove native behavior. Preserve the project's managed or
checked-in native workflow rather than generating native directories merely for
verification. Expo Go can support interaction, React tree inspection, and React
profiling, but profiling the application's native layer requires a development
build.

## Verify the running behavior

Exercise the smallest complete affected user flow and check four layers:

1. **Loaded:** the intended Metro update or rebuilt binary is running, without
   an incompatible-client, bundle, build, install, or startup failure.
2. **Healthy:** the focused reproduction has no relevant JavaScript error,
   RedBox or LogBox failure, native crash, or rejected request. JavaScript logs
   do not prove native system logs are clean; use the repository's Xcode or
   Android logging path when a native startup or crash claim needs that signal.
3. **Correct:** inspect the current accessibility, React, or native tree, act on
   the app, and assert the named destination or state with structural waits and
   checks. A screenshot or successful action response alone is not behavioral
   proof.
4. **Sound at the claimed layer:** inspect React renders, network data, native
   hierarchy, or performance artifacts only when the change makes a claim at
   that layer.

Derive tap coordinates from the latest applicable tree, never from a screenshot.
Refresh discovery after state changes and before each tap. If Argent reports an
action or launch success but the expected state is not observed, treat it as a
failed action rather than retrying or claiming completion.

For JavaScript network verification, activate capture before reproduction and
activate it again after every Metro reload. An empty result proves no request
only when the capture window covers the reproduction. Use native network
evidence for traffic that can bypass JavaScript `fetch` when the target supports
it.

Match evidence to the claim: structural assertions for behavior, screenshots
or screenshot diffs for pixels, focused logs for runtime health, request details
for networking, profiler artifacts for performance, and an MP4 when motion or a
reviewable interaction needs it.

## Preserve reusable verification when requested

Keep an ordinary change check interactive and disposable. When the user asks
for a replayable path, save an Argent flow under `.argent/flows/` with
structural assertions and deterministic setup. For a requested acceptance or
regression test, require stable evidence and two unchanged complete passes
before reporting the flow as reliable.

When a workaround such as clearing a cache or rebuilding leaves its root cause
open, or you observe an out-of-scope defect with evidence, record it at the
moment of discovery through the `project-knowledge` skill. If that skill is
unavailable, write the symptom, observed evidence, suspected cause, what was
tried, and a proposed next step to `docs/follow-ups/<slug>.md` yourself.
Reporting it only in conversation loses it.

## Finish the loop

Finish only when the selected runtime contains the current change, the exact
user-visible expectation passes, relevant errors are absent during reproduction,
and every platform claim has device evidence. Report the target, runtime path,
flow, assertions, artifacts, and any installation changes, separating observed
results from inference and unverified coverage.

If blocked, name the app, platform, device, failed gate, and exact next action.
Stop only the Argent device services used by this session; an unscoped shutdown
can disrupt another agent. Leave a healthy Metro server running for the next
edit loop unless cleanup was requested. Passing static checks never closes a
blocked runtime gate.
