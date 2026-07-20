# Implementation planning is just-in-time; an optional to-plan skill writes a reviewable plan.md

After clarify (and prototype, when taken) end at the spec folder, the pipeline
forks on one variable only: how much review the "how" deserves. The default
route hands spec.md straight to a fresh implementation session, plan mode
included. Decomposition happens there, just-in-time against the code as it
stands, because a plan derived at execution time is always fresher than one
authored ahead of it, and what must survive the gap between sessions is the
slow-aging layer (decisions, criteria), not predictions about code. The
optional route invokes `to-plan`, which drafts plan.md into the spec folder as
a review surface: approach, order, acceptance criteria, seams, off-limits
areas, and risks, opened by a verbatim advisory contract (the code is the
terrain and the plan a map; where they disagree the terrain wins, and
decision-level divergence flows back to spec.md). Writing derivable content
down is justified there not as information transport but because a concrete
draft draws out the user's corrections, and those corrections are the only
cargo the document must carry across time.

This materializes the plan.md that 0002 anticipated and retires its tasks.md
anticipation: pre-cut task lists encode predictions that rot as execution
discovers the terrain, and every defense against the rot (behavior-shaped
tickets, rolling replans, anchoring units to existing structure) converges
back onto just-in-time planning against a stable spec. It also renames 0002's
"dossier" to "spec folder" in all text going forward.

## Considered Options

- **Port to-spec from mattpocock/skills** (rejected): clarify already ends by
  synthesizing a spec, and already short-circuits to the summary when the
  conversation has resolved every branch.
- **A tickets skill (port to-tickets)** (rejected): at this repo's scale the
  work unit is already one spec per worktree, so pre-cut slices divide
  nothing; at any scale they rot, as above.
- **A standing workflow route for parallel implementation** (rejected): zero
  practiced runs to encode; parallel write-work is reliable only when shared
  decisions are externalized until units become mechanical, a condition
  feature work here is unlikely to meet; and the day a spec genuinely
  overflows a session, the orchestration can be derived on demand.
- **Port implement** (rejected): plan mode, built-in review commands, and the
  personal commit and pr skills already cover it.
- **A plan.md template file** (rejected for now): one reader per instance
  means cross-instance uniformity buys little; the only pinned text is the
  two-line contract, which lives verbatim in the skill text; promote to
  templates/ only if real usage shows format drift.

## Consequences

`skills/to-plan` joins the published set and plugin.json (0.6.0). GLOSSARY
gains Spec folder and Plan. clarify's single "dossier" becomes "spec folder".
The vendored grill-with-docs trio (grilling, grill-with-docs, domain-modeling
under `.agents/skills/`, their `.claude/skills/` symlinks, and
skills-lock.json) retires; writing-great-skills stays. Evals for to-plan wait
for first real usage.
