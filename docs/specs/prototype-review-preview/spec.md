# HTML review preview

## Confirmed behavior

`build-prototype` and `human-review` use the same delivery contract after they
finish and verify their HTML artifact:

> Run the finished HTML using a method supported by the current harness and
> share an address the user can open.

The instruction stays at this outcome level. It names no platform, command,
runtime, port, server implementation, persistence mechanism, or deployment
policy. The current harness chooses how to satisfy it from its available
capabilities and permissions.

Browser verification and user delivery remain separate obligations. Existing
browser-verification gates stay intact; the new sentence ensures that a
verified artifact is also presented in a form the user can open.

## Rationale

A temporary file path does not consistently produce a usable handoff across
harnesses. The shared sentence directs the agent to make the HTML runnable and
provide the usable result without prescribing a mechanism that may not exist in
another host.

## Acceptance criteria

- `build-prototype` runs the finished prototype HTML and shares an address the
  user can open when presenting the surface for review.
- `human-review` runs the finished review HTML and shares an address the user
  can open after its browser-verification gate passes.
- Both skills carry the requirement directly so either remains independently
  installable.
- Stable eval expectations reject a bare temporary file path as the completed
  handoff and require the runnable address.
- UI metadata still describes both skills accurately.

## Validation evidence

- Baseline Codex and Claude Code runs could create and inspect the temporary
  HTML while still failing to leave a usable review handoff: one returned only
  a file path, one offered to start a server later, and one completed browser
  verification without reaching a runnable-address handoff.
- Isolated post-build controls showed that both harnesses can choose an
  available mechanism, verify its address, and report it when the outcome is
  requested directly.

## Remaining risk

A harness can report an address that is reachable only from inside its own
environment. Forward tests must judge whether the returned address is actually
usable from the review context, not merely whether an internal request succeeds.
