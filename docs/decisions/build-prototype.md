# Build prototype

## Decisions

- Accept `effort=standard` and `effort=high`, with `standard` as the recommended
  default. Both produce a finished-looking prototype and complete the same
  screen, state, interaction, and viewport coverage. `high` broadens mismatch
  discovery across same-coordinate reference fidelity and layout or interaction
  robustness, independently reproduces material candidates when the host
  supports subagents, corrects only the verified set, and rechecks surfaces that
  share the changed token, component, or shell behavior. Delegate the audit to
  one fresh reviewer subagent at high model effort and supply the raw reference
  plus candidate artifact without the builder's findings. Report when reviewer
  independence or model effort is unavailable. Without an inspectable reference
  it strengthens layout robustness but does not claim visual equivalence.
- Build every screen of the surface in one self-contained HTML file with shared
  design tokens, realistic dummy data, relevant edge states, and the pinned
  review shell.
- Keep the review shell to a screen selector, the selected screen's state
  selector, and the viewport cycle. Keep product pixels limited to UI an end
  user could see; review notes, rationale, and change summaries stay in the
  conversation. Each selector option names one product destination or distinct
  surface without current/proposed labels, variants, steps, counts, or indexes;
  screen order is not product progress.
- Treat states as representative direct-entry presets. Supply `Default`
  automatically and add only important multi-step results, forced data or error
  conditions, and materially different screen structures. Keep obvious
  one-click-entry and transient interaction states in the prototype itself even
  when they look substantially different. Synchronize the selector both when an
  interaction enters a declared preset and when it returns to `Default`.
- Keep the skill independently invokable. Use the current request and
  conversation as its primary context, read project truth directly, and read an
  existing work-unit spec only when the request or a prior handoff identifies
  one. Do not require or search for a spec before building.
- Inspect the existing product first and render in its design system from the
  first screen. Copy its tokens and component names; when no system exists, use
  the shell's minimal palette as the finished style. Treat the existing surface
  as evidence and include it in the review only when the user is choosing
  between the baseline and candidate.
- Treat confirmed component relationships as fixed constraints. An overlay,
  drawer, or modal remains attached to its source screen unless the user is
  explicitly reconsidering that relationship.
- Propose the screen inventory as a correctable draft and begin building without
  an approval gate. For a contested detail, render variants that change only
  that detail outside the product screen and state selectors, then fold the
  user's choice back into the single canonical prototype.
- Keep real APIs, production routing, latency, frameworks, and network
  dependencies out of the prototype.
- At approval, reuse an identified work-unit folder or derive a kebab-case slug
  from the product or feature name. Preserve the approved file as
  `docs/specs/<slug>/prototype.html`, linked from the spec. It is a visual
  reference, never production code.
- Record surface decisions in the work-unit spec. Update a project decision
  contract only when the user confirmed a choice that future work should reuse,
  whose rationale prevents reasonable re-litigation, and that came from a real
  trade-off.

## Boundaries

- Keep the shell's screen selector, current-screen state selector, viewport
  cycle, contract comment, and token funnel. State names remain contextual
  rather than following a fixed global taxonomy.
- Drive simulated narrow-view styles from the shell's viewport classes rather
  than browser media queries alone.
- Web, mobile web, and native app mockups in a phone frame are in scope; CLI,
  terminal, and voice interfaces are not.
- Keep the working prototype temporary while review remains open. Do not create
  or populate the durable work-unit folder until every screen is approved or
  explicitly deferred.
- Intermediate variants are disposable once the user selects a direction.
- `shape-idea` may invoke this skill, but this skill does not require
  `shape-idea`, `project-knowledge`, or a pre-existing spec to run to completion.

## Why

A full surface exposes missing screens and cross-screen inconsistencies that no
one knew to mention in prose. One portable file keeps the review cheap and the
shared token funnel makes consistency structural. Using the project's style
from the first render answers whether the new surface belongs in the existing
product, which a generic wireframe cannot. Conversation-first input lets direct
requests and `shape-idea` handoffs use the same workflow; the approved spec and
prototype provide the durable handoff after the visual work settles.

The effort argument spends the extra visual comparison and verification work
only when close matching matters. Broad candidate discovery catches subtle
differences, while independent reproduction prevents the wider search from
turning every suspicion into a correction. Observable comparison, verification,
and convergence criteria make `high` meaningful; a generic request to think
harder would not define a different prototype outcome. The text argument alone
cannot guarantee that every host changes its model-level effort, so the skill
states that evidence boundary directly.

## Reconsider when

- Approved prototypes repeatedly reveal structural faults only during
  implementation; a greenfield-only low-fidelity pass is the first guard to
  test.
- A closed rendering surface can no longer run the self-contained shell.
- Real production wiring becomes necessary to settle an interaction that dummy
  state cannot represent.
- Individually installed skills gain a reliable dependency mechanism that can
  share project-knowledge rules without making this skill unavailable alone.

## Still-rejected alternatives

- A `low` effort value — every prototype must be finished-looking when first
  presented, so a low-fidelity option would weaken the base contract.
- Skeleton-then-fill staging — it doubles the render and hides whether a screen
  belongs in the existing product.
- A mandatory approval stop on the prose screen inventory — it gates a visual
  alignment tool on the medium it exists to escape.
- Requiring a pre-existing spec or a `shape-idea` session — direct prototype
  requests and in-progress shaping may have complete conversational context
  before any spec exists.
- Delegating core context and preservation behavior to `project-knowledge` — it
  shortens this file but breaks standalone installs and direct invocation when
  that skill is unavailable.
- One file per screen or shared external CSS — the surface stops travelling and
  rendering as a single consistent artifact.
- Screen tabs and state pills — their width grows with the surface, and listing
  every reachable UI change obscures the representative states worth reviewing.
- Screen indexes or totals — they imply a linear flow or review progress even
  when the product's screens have no meaningful order.
- A separate coverage inspector or cases taxonomy — it asks the reviewer to
  learn a meta-model instead of navigating screens and representative states.
- Project-stack components or a real API — wiring cost and production behavior
  distract from alignment and break self-containment.
- In-prototype notes, baseline or variant screens, review badges, stamps, and
  change tracking — they mix product and review semantics, duplicate the
  reviewing medium, and create chrome that needs explanation.

## Evidence worth preserving

- A second high-effort Turborepo run captured the already-running native Chat
  screen without taking ownership of another worktree's Metro or simulator
  session. One fresh verifier reproduced missing edit, regenerate, copy, and
  sign-out recovery behavior; its second check caught an event-target lifetime
  bug in the first sign-out repair. A separate reviewer then found lost sent
  text, transient and scroll state leaking between presets, the missing Stop
  control, nondeterministic regenerated content, a sparse top-anchored chat,
  mismatched reference geometry, and an orphaned final syllable. After those
  corrections, that reviewer passed every finding and all 12 screen-state
  coordinates at the three shell viewports. The run shows why broader discovery
  needs independent reproduction, and why `high` must explicitly request a
  reviewer subagent instead of assuming that a generic fresh-context instruction
  will open one.
- A held-constant forward test on the existing Turborepo mobile template ran
  the same five-screen request with only `effort` changed. Both results found
  and repaired layout issues during browser review. The `high` run additionally
  inspected installed HeroUI defaults, matched the real accent role, covered
  chat editing and sign-out failure states, and checked every screen for
  horizontal overflow at all three shell viewports. This supports an added
  convergence pass without weakening `standard`.
- Neither effort run launched the native app because the evaluation could not
  establish safe ownership of the shared Metro and simulator sessions. Both
  remained browser approximations, and `high` reported native pixel equivalence
  as unverified. The argument increases inspection depth but cannot replace an
  actual runnable reference when platform-pixel fidelity is the question.
- Removing the gray pass knowingly accepts that polished styling can make a bad
  hierarchy feel correct. If that failure appears in implementation reviews,
  restore a targeted guard instead of recreating the old two-pass workflow by
  default.
- A standalone forward test correctly started without a pre-existing spec but
  immediately wrote its unapproved prototype and spec under `docs/specs/`.
  Keeping the review file temporary prevents an open visual proposal from
  becoming a durable work-unit artifact.
- In the first structure A/B, the reorganized skill improved greenfield
  consistency but turned a confirmed `DetailDrawer` into a route, changed copy
  alongside a CTA treatment, and inferred navigation from an approved static
  artifact. Explicit relationship, controlled-variant, and no-inference guards
  target those observed failures.
- A live prototype review showed per-screen state pills becoming too numerous
  to scan. Separate inspector and cases experiments added unfamiliar concepts;
  screen tabs still failed to scale. A screen selector plus contextual,
  representative state presets preserved direct access without those costs.
- Initial selector forward tests still promoted a one-click "all read" result
  to a preset and updated selectors on entry without resetting them on recovery.
  Explicit one-click exclusion and bidirectional synchronization target those
  observed failures.
- A later held-out test handled single-step synchronization but missed the point
  where repeated removals crossed into a declared empty condition, then closed
  the open review without asking what to change. Explicit cumulative boundary
  checks and an open-review response contract target those observed failures.
- A structure refactor moved the interaction-versus-preset distinction into the
  template alone. Login and payment forward tests then promoted six-digit paste
  and payment-method choice into review presets. Restoring one concise rule in
  the skill body made both held-out runs pass while leaving screen names,
  product pixels, and review chrome owned by the template contract.
