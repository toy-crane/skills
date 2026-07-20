# Opportunity discovery precedes idea shaping

`shape-idea` converges: it starts from a chosen problem and broad product
direction, then closes behavior and scope decisions until a later session can
implement from `spec.md`. A user who does not know what to build needs the
opposite motion first. The useful direction often already exists implicitly in
their experience, access, interests, and capabilities, but they do not yet see
where it could apply. Asking one skill to switch invisibly between discovery
and convergence makes it too easy to turn the first plausible thought into a
premature spec.

Add `discover-opportunity` before `shape-idea`. It starts without a chosen
problem or direction; draws out what the user knows firsthand; reflects where
that knowledge could help; and follows the user's recognition until a broad
application direction is worth shaping. It may not define an MVP or detailed
product behavior. Those belong to `shape-idea`.

Discovery normally hands off through the active conversation rather than an
artifact. Its output is lightweight context, not a durable deliverable. Write
a handoff only when the user requests one or the work must cross sessions or
people.

Discovery is user-invoked. It must not trigger automatically from an ordinary
vague request: the user deliberately starts the exploratory interview as a
command. When `shape-idea` receives a blank-page request, it points the user to
that command rather than invoking it on their behalf.

## Considered Options

- **Let `shape-idea` cover both phases** (rejected): its branch-closing
  discipline and implementation-ready stopping condition bias a blank-page
  exploration toward premature convergence.
- **Port `idea-refine` unchanged** (rejected): choosing an MVP, features, or
  detailed scope overlaps the downstream shaping work this pipeline already
  owns.
- **Name the skill `discover-idea`** (rejected): the repeated `idea` in the
  adjacent command names hides the phase boundary, while an opportunity is
  precisely the pre-solution object being discovered.
- **Always write an opportunity brief** (rejected): it formalizes a small
  conversational transition, interrupts momentum, and preserves material that
  `shape-idea` can already receive from the current context.

## Consequences

The common path becomes `discover-opportunity` → `shape-idea` → optional
`draft-plan` → implementation. Discovery remains available as an explicit
user command in both Claude Code and Codex, while shaping carries the fallback
instruction for blank-page requests. The transition normally remains in one
conversation. The plugin adds the published skill and bumps to 0.10.0.
