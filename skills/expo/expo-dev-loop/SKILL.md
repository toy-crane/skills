---
name: expo-dev-loop
description: Verify Expo and React Native changes in a running app with agent-device. Use after editing screens, navigation, interactions, app configuration, config plugins, native dependencies, permissions, startup behavior, or performance, or whenever the user asks to confirm an Expo change on an iOS or Android simulator, emulator, or physical device. Establish target readiness and the scenario's required state, classify whether the change can use the Metro fast path or requires a native rebuild, then finish only with observable runtime evidence.
---

# Expo Dev Loop

Prove the changed behavior in the running app. Static inspection, type checks,
unit tests, and a successful bundle support the result but do not replace device
verification.

## Establish the target

Inspect the request, current diff, Expo config, and package manifest. Identify
the intended flow, platform, device, and observable result. When the request
does not require both platforms, use one available representative local target
and state that coverage; never infer iOS and Android parity from one run.

Use the installed CLI's version-matched guidance instead of remembered command
shapes:

```bash
agent-device help workflow
agent-device help react-native
```

If `agent-device` is unavailable, report that runtime verification is blocked
and give `npm install -g agent-device@latest` as the setup command.

## Choose the runtime path

Classify the whole change before launching the app:

- **Metro path:** JavaScript or TypeScript behavior, React components, styles,
  navigation code, and bundle-loaded assets that do not alter the native app.
  Reuse the running development build and Metro server. Let Fast Refresh apply
  the change or use `agent-device metro reload` when a full JS reload is
  needed.
- **Native path:** Expo app config that affects the binary, config plugins,
  native modules or dependencies, permissions, entitlements, icons or splash
  configuration, native project files, SDK or React Native upgrades, and
  startup behavior. Use the repository-supported build command, normally
  `npx expo run:ios` or `npx expo run:android`, install the resulting
  development build, and relaunch it.

Use the native path for a mixed change or when native impact remains uncertain.
Both paths run on a development build of the project, so the classification
decides whether that build must be rebuilt rather than which client to use.
Expo Go is a fixed prebuilt shell whose native surface belongs to Expo rather
than to this project, so a result observed there is about a different binary
than the one being shipped; build a development build instead. Preserve the
project's managed or checked-in native workflow rather than regenerating native
directories as an incidental verification step.

## Pass preflight before observation

Keep three gates separate and report the first one that fails:

1. **Runtime readiness:** the intended target, development build, project-owned
   Metro server, and observation session are usable, and the loaded bundle or
   native build belongs to this checkout.
2. **Known initial state:** app-local data, OS permissions, login or fixture
   state, and any affected backend have the state the scenario requires.
3. **Behavior verification:** the ready app is driven and its named outcome is
   asserted. A successful launch or prepared state never satisfies this gate.

Use narrow readiness checks in the ordinary loop. Run `agent-device doctor`
only when the user asks for setup diagnosis or a failed readiness check suggests
an unhealthy device, app, development server, or runner.

Choose the least destructive state profile that proves the behavior:

- **Known app state:** prepare only the app data, explicit permissions, login,
  and fixture state the flow needs. App-state clearing and permission reset are
  separate boundaries; report which were changed and which were preserved.
- **Fresh device:** use only when the behavior depends on first-device state,
  such as first launch, OS permission history, secure storage, application
  identity, deep links, push behavior, native configuration, or another
  device-level surface. A simulator or emulator is dedicated only when the
  request or project allocation establishes that ownership; absence from an
  advisory claim list is not proof. Fresh-device preparation requires
  `agent-device` 0.20.10 or newer, whose device claims reject foreign local
  mutations. Acquire the exact target through the loop's final named session
  with `agent-device open`, confirm `agent-device device status` names that
  session and workspace, and keep the claim through reset, boot, reinstall,
  Metro reconnection, and observation. If the claim cannot be acquired or held
  across the selected reset mechanism, stop before reset. Address only that
  target, never all devices. After reset, re-establish any allowed backend
  fixture before observation.
- **Preserved or prior state:** retain or seed the earlier app and backend state
  required by returning-user, upgrade, or migration behavior. Do not clear away
  the premise being tested.

Never erase a physical, user-owned, shared, or otherwise unowned target. When a
fresh-device check has no eligible virtual target, report the runtime-readiness
blocker. When a usable target exists but its required state cannot safely be
established, report the known-initial-state blocker. Do not substitute
destructive app or backend actions. Treat a stateful backend as a separate
affected surface: use only the project's deterministic local or test
preparation path, and never infer backend state from a ready client or
destructively reset a remote service under ordinary verification authority.

## Prepare the observation loop

Keep state-changing device commands serial within one session. Open the actual
installed app identifier or development-client URL reported by the running
tools; do not invent one. A URL target rejects `--relaunch`, so open the app id
when startup or clean process state matters, then capture the initial
interactive snapshot.

Point the client at this project's own dev server rather than a default port
another checkout may already hold. Pass the port as a session runtime hint with
`--metro-port`, and confirm the loaded bundle belongs to this project: a
development build left pointing at a stale URL loads another project's bundle
and reports that project's source paths as if they were this one's.

When Expo MCP local capabilities are already available, use its Router sitemap,
current Expo documentation, or short app-log collection as framework-side
context. Treat them as optional discovery and diagnostics; `agent-device`
remains the device-side proof.

## Verify after each edit

Exercise the smallest complete user flow affected by the edit and check four
layers:

1. **Loaded:** the intended Metro update or native build is running on the
   selected target, with no bundle, build, or incompatible-client error.
2. **Healthy:** reproduce inside a focused log window and check for relevant
   JavaScript errors, native crashes, RedBox or LogBox failures, and rejected
   network requests.
3. **Correct:** drive the flow with `press`, `fill`, `scroll`, `back`, and other
   appropriate commands using `--settle`; verify the named outcome with an
   exact `wait`, `is`, `get`, or `find` assertion. A screenshot alone does not
   prove a behavioral expectation.
4. **Sound at the claimed layer:** inspect the React tree, props, hooks,
   re-renders, native performance, network data, or traces only when the change
   makes a claim about that layer.

Use refs from the latest snapshot or settled diff. A state-changing command
invalidates earlier refs; refresh the snapshot or use a stable id, label, role,
or testID before the next action. Prefer semantic selectors and use coordinates
only when the accessibility surface cannot expose the target, recording that
limitation with visual evidence.

Collect evidence proportional to the claim: a screenshot for visual output,
focused logs for runtime behavior, network output for request behavior,
performance artifacts for performance claims, and a recorded `.ad` replay for
a flow worth keeping as a regression check.

When a workaround such as clearing a cache or rebuilding leaves its root cause
open, or you observe an out-of-scope defect with evidence, record it at the
moment of discovery through the `project-knowledge` skill. If that skill is
unavailable, write the symptom, observed evidence, suspected cause, what was
tried, and a proposed next step to `docs/follow-ups/<slug>.md` yourself.
Reporting it only in conversation loses it.

## Finish the loop

Finish only when the selected runtime contains the current change, the exact
user-visible expectation passes, relevant runtime errors are absent during the
reproduction, and every platform claim has device evidence. Report the target,
state profile, readiness evidence, prepared and preserved state boundaries,
flow, assertions, and artifact paths, separating observed results from remaining
inference or unverified coverage.

If verification is blocked, name the app, platform, session, failed gate, and
the exact next command or user action needed. Close the `agent-device` session
when finished. Leave a healthy Metro server running for the next edit loop
unless the user requested cleanup; in CI, release the device with
`agent-device close --shutdown`.
