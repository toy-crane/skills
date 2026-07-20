# Opportunity discovery precedes idea shaping

`shape-idea` converges: it starts from a chosen problem and broad product
direction, then closes behavior and scope decisions until a later session can
implement from `spec.md`. A user who does not know what to build needs the
opposite motion first. Their experience, access, observed workarounds, and
constraints must expand into several problem-level possibilities before one
direction deserves shaping. Asking one skill to switch invisibly between
divergence and convergence makes it too easy to turn the first plausible
thought into a premature spec.

Add `discover-opportunity` before `shape-idea`. It starts without a chosen
audience, problem, or direction; interviews from realities the user can
observe; compares distinct opportunities; and stops when one audience,
desired change, broad direction, fatal assumption, and cheap evidence test
are selected. It may not define an MVP or detailed product behavior. Those
belong to `shape-idea`.

A selected opportunity is written to `docs/opportunities/<slug>.md` rather
than a spec folder. The artifact may never become implementation work, and a
`docs/specs/<slug>/` directory without its `spec.md` anchor would violate the
folder's promise. `shape-idea` reads the opportunity brief when present and
links it from the resulting spec.

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
- **Write the brief into the spec folder** (rejected): opportunities can be
  abandoned before a spec exists, leaving an anchorless folder that looks
  implementation-bound.

## Consequences

The common path becomes `discover-opportunity` → `shape-idea` → optional
`draft-plan` → implementation. Both discovery and shaping descriptions carry
the reciprocal routing boundary so automatic invocation has an explicit
near-miss. The plugin adds the published skill and bumps to 0.10.0.
