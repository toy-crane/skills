# Expo dev loop with Argent

## Objective

Keep `expo-dev-loop` as the runtime-verification skill for Expo and React Native
changes, while replacing its `agent-device` dependency with Argent. The skill
must still distinguish Metro-only changes from changes that require a native
rebuild and must finish only with observable evidence from the running app.

The skill name and its Expo-specific trigger remain unchanged. Argent is the
device, debugger, profiler, and reusable-flow provider; it does not replace the
repository's own Expo build and start commands.

## Required behavior

### Establish the project and target

- Inspect the request, current diff, Expo configuration, package manifest, and
  repository-provided commands before selecting a runtime path.
- Honor an explicitly requested platform or device. Otherwise use one available
  representative local target and report that coverage. Evidence from one
  platform never establishes iOS and Android parity.
- Resolve the actual device and installed app identifier through Argent. Do not
  invent a simulator, emulator, bundle identifier, package name, or development
  client URL.
- Read command schemas from the installed version through Argent's tool
  catalogue and descriptions. The skill may name stable capabilities but must
  not assume remembered argument shapes.

### Install Argent when absent

- Check Argent availability once before the first Argent action. Availability
  may be established by loaded Argent MCP tools or by the `argent` executable.
- When Argent is absent, automatically run the vendor-supported project-local,
  non-interactive installation with telemetry disabled:

  ```bash
  npx @swmansion/argent@latest init --local --yes --no-telemetry
  ```

- Local installation is intentional. It versions Argent with the application,
  installs its official skills and rules, records the MCP configuration, and
  avoids requiring a global machine setup.
- The skill must disclose the files changed by installation, including the
  package manifest and lockfile, `.argent/install.json`, editor MCP
  configuration, and installed vendor context. It must preserve unrelated
  existing configuration.
- Installation success does not itself prove the app. If the current agent
  session has not loaded the newly configured MCP server, continue through the
  project-local CLI (`npx --no-install argent run ...`, with tool schemas read
  from that same installed version). Require a session restart only when the
  needed capability is unavailable through both surfaces.
- Use an already installed project version without silently updating it.
  Automatic installation applies only when Argent is absent.

### Choose the runtime path

- A JavaScript or TypeScript behavior, React component, style, navigation, or
  bundle-loaded asset change may reuse the running Expo Go or development build
  and Metro connection. Apply a full JavaScript reload when Fast Refresh is not
  sufficient.
- Expo configuration that affects the binary, config plugins, native modules or
  dependencies, permissions, entitlements, icons, splash configuration, native
  project files, SDK or React Native upgrades, and native startup behavior
  require the repository-supported native build and a development build.
- Mixed or uncertain changes take the native path. Expo Go cannot prove native
  behavior.
- Preserve the project's managed or checked-in native workflow. Do not generate
  native directories merely to make verification convenient.

### Prove the running behavior

Verify the smallest complete affected user flow on the selected target:

1. **Loaded:** the running app contains the current Metro update or rebuilt
   native binary and has no incompatible-client, bundle, install, or startup
   failure.
2. **Healthy:** the focused reproduction window has no relevant JavaScript
   error, RedBox or LogBox failure, native crash, or rejected request. Argent's
   JavaScript log view is not evidence that native system logs are clean; native
   startup and crash claims require the repository's Xcode or Android logging
   path when Argent does not expose the needed signal.
3. **Correct:** inspect the current accessibility or React tree, perform the
   user actions, and assert the named destination or state with structural
   waits and checks. A screenshot or a successful action response alone is not
   behavioral proof.
4. **Sound at the claimed layer:** use React, network, native hierarchy, or
   performance diagnostics only when the requested change makes a claim at
   that layer.

Coordinates must come from the latest applicable `describe`, React tree, or
native hierarchy result. Refresh discovery after a state change and before each
tap rather than deriving coordinates from a screenshot. If an action reports
success but the asserted state does not change, treat the action as failed.

For JavaScript network verification, activate capture before reproducing the
request and activate it again after every Metro reload. Do not interpret an
empty capture as proof that no request occurred unless the capture window is
known to cover the reproduction. Use native network evidence for traffic that
can bypass JavaScript `fetch` when the selected target supports it.

Evidence must match the claim: structural assertions for behavior, screenshots
or screenshot diffs for pixels, focused logs for runtime health, network
details for requests, profiler artifacts for performance, and an MP4 only when
motion or a reviewable interaction needs it.

### Preserve reusable verification only when requested

- A one-off change check remains an interactive verification and creates no
  durable test artifact.
- When the user requests a replayable path, persist an Argent flow under
  `.argent/flows/` with structural assertions and deterministic setup.
- When the user requests a regression or acceptance test, require stable
  evidence and two unchanged complete passes before calling the flow reliable.

### Finish and clean up

- Finish only when the selected runtime contains the current change, the exact
  user-visible expectation passes, relevant errors are absent during the
  reproduction, and every platform claim has matching device evidence.
- Report the target, runtime path, exercised flow, assertions, evidence paths,
  and installation changes. Separate observations from inference and unverified
  coverage.
- Stop only the Argent device services used by this session. Never use an
  unscoped machine-wide shutdown as routine cleanup. Preserve a healthy Metro
  server for the next edit loop unless cleanup was requested.
- If blocked, name the app, platform, device, failed gate, and exact next action.
  A passing build, type check, or unit test does not close a blocked runtime
  gate.

## Supported scope

- Primary Expo targets are local iOS Simulators and Android Emulators.
- A physical Android device connected through ADB may be used when the user
  selects it and its required Argent capabilities are available.
- Expo Go supports interaction, React tree inspection, and React profiling, but
  native profiling of the application requires a development build.
- Argent's TV, Vega, Electron, Chromium, and design-variant capabilities are not
  added to `expo-dev-loop`'s trigger. They remain available through their own
  vendor workflows when separately requested.

## Off-limits

- Physical iPhone verification is not claimed: Argent's stable local iOS scope
  is the Simulator, and its hosted iOS runners are not a settled replacement.
- The skill does not install Argent globally, enable telemetry, enable
  experimental Argent Lens, or update an existing Argent installation without
  an explicit request.
- The skill does not duplicate Argent's full official manuals. It retains the
  Expo-specific runtime-path and proof contract and uses the installed vendor
  context for specialized debugger, profiler, permissions, recording, and flow
  procedures.
- An Argent tool's optimistic response is never accepted as the final state
  assertion.

## Assumptions

- Node.js `>=20.12.0` is available when automatic installation is needed. This
  follows the current `@swmansion/argent` package engine rather than the older
  Node 18 statement in Expo's integration page.
- The application repository permits development dependencies and committed
  project-local agent configuration. This is overridable by repository policy;
  a conflicting policy blocks installation rather than authorizing a global
  fallback.
- The existing `expo-dev-loop` name, trigger, and Metro-versus-native
  classification remain useful and require no rename.

## Deferred points

- No cloud or remote iOS execution provider is selected. Adding one would
  change cost, credentials, data handling, and physical-device coverage.
- Physical iPhone coverage has no fallback in this change.
- The exact generated editor configuration set is owned by the versioned Argent
  installer and may evolve. The skill reports the observed result rather than
  hardcoding a closed file list.

## Remaining risks

- Argent is pre-1.0 and releases frequently. Installed-version tool discovery
  reduces command drift but does not remove behavioral regressions.
- Current public issues include silently omitted React-tree siblings, JavaScript
  network capture loss across reloads, optimistic iOS gesture success, false
  Android cold-launch failures, and profiler reports that can be incomplete or
  misleading. Independent post-action assertions and explicitly bounded
  capture windows mitigate these risks but do not eliminate them.
- Argent's installer changes several project and editor-context files. Automatic
  installation is approved for this workflow, but repositories with stricter
  dependency or configuration ownership may reject those writes.
- This spec was shaped against `origin/main`, where `expo-dev-loop` exists under
  `skills/expo/expo-dev-loop/`. The current checkout branch predates that file;
  implementation must use a baseline containing the published skill and its
  runtime-verification routing changes.

## Evidence used for the decision

- Argent 0.20.0 exposed 73 tools through its shipped CLI on 2026-08-13.
- The official repository documents local installation, supported targets,
  interaction, flows, visual comparison, debugging, and profiling:
  <https://github.com/software-mansion/argent>
- Expo documents its Expo Go and development-build boundaries:
  <https://docs.expo.dev/agents/argent/>
- Current release notes and open issues were checked before settling the proof
  rules:
  <https://github.com/software-mansion/argent/releases/tag/v0.20.0>
  and <https://github.com/software-mansion/argent/issues>.
