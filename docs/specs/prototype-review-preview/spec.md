# Prototype review preview

## Confirmed behavior

When a working prototype is presented or re-presented for review, make it
available through a local preview route supported by the current harness and
share the exact address the user can open.

The preview is part of the open review, not a separate delivery step. Verify
that the address responds before describing it as live, and keep it reachable
while the review remains open when the harness lifecycle permits. If the
harness cannot keep a user-accessible preview available, state that limitation
and present the best artifact path it supports instead.

The published instruction describes this observable result without naming a
platform, command, runtime, port, or server implementation. The harness chooses
the mechanism from its current capabilities and permissions.

## Rationale

An exact review address lets the user inspect the artifact immediately instead
of locating and opening a temporary file. Leaving the mechanism to the harness
keeps the skill portable across local agents and environments with native
preview support.

The preview remains local review infrastructure. Persistence does not authorize
publishing the prototype, creating a hosted project, or deploying it to an
external service.

## Assumptions

- Reuse a still-live preview after prototype updates when it continues to serve
  the working artifact.
- A harness may expose a local preview through its own user-facing address; the
  shared contract is reachability, not the address shape.
- Process identifiers and stop commands are useful when naturally available,
  but are not part of the cross-harness contract.

## Off-limits

- Do not prescribe a platform-specific preview technology in the published
  skill.
- Do not create an external deployment or publicly hosted artifact without
  separate user authority.
- Do not turn preview infrastructure into production code or a preserved
  work-unit artifact.

## Validation evidence

- A local Codex forward run selected an available server mechanism, browser-
  verified the generated prototype, and returned a live HTTP address. Its child
  process ended with the non-interactive harness, so a claim that every preview
  survives the final response would be false.
- A full Claude Code run created the prototype but did not reach the preview
  handoff before the bounded run was stopped. An isolated post-build control
  selected an available mechanism, verified HTTP 200, returned the exact
  address, and left the preview reachable after the command exited.
- A Codex control requiring persistence after the response began selecting an
  external deployment path. It was stopped before a deployment succeeded. This
  observed failure requires the explicit local-only and no-publishing boundary.

## Deferred points

- Native cloud or remote harnesses were not exercised. Their user-facing URL
  bridging remains to be verified without weakening the local-only and
  no-publishing boundary.
- Interactive Codex persistence across later review turns was not directly
  reproduced by the non-interactive CLI control.

## Remaining risks

- A harness may verify an address from inside its environment even though the
  user cannot open it. Implementation must treat user reachability as the goal
  and disclose when only an internal address is available.
- Overly strong persistence wording may encourage an agent to create external
  infrastructure; overly weak wording may leave a preview alive only during
  the startup command. The local review lifecycle and honest-fallback language
  must remain together.
