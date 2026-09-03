# Companion agent distribution

## Decisions

- A published skill may carry purpose-built custom agents under
  `companion-agents/manifest.json`. Each entry owns one stable agent name and
  supplies both native definitions: Claude Code Markdown and Codex TOML.
- Companion agents are runtime helpers of the skill that owns them, not
  independently published skills or a separate user-facing product. The
  coordinator skill remains independently usable and includes an inline
  fallback when its custom agent profile is unavailable.
- `update-project-skills` is the installation path. After `skills.sh` refreshes
  project-local skill copies, its bundled synchronizer materializes companion
  definitions into `.claude/agents/` and `.codex/agents/`.
- `.agents/toycrane-agents-lock.json` proves which agent names the synchronizer
  may later update or retire. Existing names without that ownership remain
  project-owned until the user explicitly approves adoption.
- When a project already governs both clients with
  `.agent-sync/manifest.json`, current Toycrane skills are reconciled as
  `shared_skills` and companion agents as `shared_agents` so the project's own
  coverage check continues to pass. Retired skills are passed explicitly
  because they have already disappeared from `skills-lock.json`.
- The Expo both-platform worker is named `expo-smoke-runner`. One reusable role
  receives either an iOS or Android assignment; the platform belongs in the
  task prompt and session name rather than in two duplicated agent identities.
- `expo-smoke-test` explicitly creates exactly two platform workers and waits
  for both whenever the harness supports subagents. A generic instruction to
  run two sessions concurrently is insufficient because it previously left
  both runs in the coordinator instead of creating isolated contexts.

## Boundaries

- Companion installation is project-local. It does not create user-global
  Claude Code or Codex agent definitions.
- Only skills proven Toycrane-managed by `skills-lock.json` contribute agent
  payloads. A copied directory alone does not establish ownership.
- Native definitions remain paired source files. They may express the same
  operating contract in client-specific syntax and are validated together,
  including agreement between the manifest identity and the name declared by
  each native file.
- Collision detection follows the declared native identity across every agent
  file, not only canonical filenames. Explicit adoption of an identity also
  authorizes removal of alternate-path definitions for that identity.
- The Claude Code plugin may ship the containing skills, but plugin
  installation alone does not materialize Codex agents. Cross-client agent
  installation stays with `update-project-skills`.

## Why

Claude Code and Codex discover project agents from different directories and
file formats. `skills.sh` copies the complete skill folder but does not register
nested files as native custom agents. Keeping the payload beside its owning
skill preserves version coupling, while one deterministic synchronizer handles
the destructive parts: ownership, collision refusal, paired updates, retirement,
and optional project-manifest reconciliation.

One platform-neutral worker avoids prompt drift between iOS and Android while
still providing separate context windows, device sessions, and evidence. The
coordinator retains the shared build and Metro decisions that would race or be
duplicated if each worker rediscovered them.

## Reconsider when

- `skills.sh` natively installs paired Claude Code and Codex custom-agent
  definitions with ownership and retirement semantics.
- A shared agent format becomes directly discoverable by both clients.
- Plugin distribution can install the same project-local agent bundle for both
  clients without a second ownership system.

## Still-rejected alternatives

- Claude Code plugin agents only — leaves Codex without the same worker and
  makes installation depend on one client's plugin system.
- One skill per custom agent — exposes an implementation companion as a second
  product and still does not place it in native agent discovery paths.
- Two agents named for iOS and Android — duplicates one operating contract and
  invites platform versions to drift.
- Symlinking the two native definitions — the formats differ, and project-local
  copies give both clients conventional discoverable files plus explicit
  ownership.

## Evidence worth preserving

- An isolated `skills.sh` 1.5.23 probe copied nested scripts, assets, and agent
  payload directories with a skill, but did not materialize them under either
  client's native agent directory.
- The earlier `expo-smoke-test` wording required concurrent named sessions but
  did not reliably cause Claude Code to create two subagents; the explicit
  worker topology addresses that observed routing failure.
- An isolated Claude Code 2.1.250 forward test loaded the copied project agent,
  invoked `expo-smoke-test`, and reported `spawned: 2`, `completed: 2`,
  `spawned_by_subagents: 0`, and `by_type: {expo-smoke-runner: 2}`. The iOS and
  Android workers received `smoke-ios` and `smoke-android`, returned separately,
  and were aggregated only after both completed.
