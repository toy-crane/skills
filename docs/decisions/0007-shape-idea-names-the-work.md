# The clarification workflow is named shape-idea

`write-spec` named the durable artifact but obscured the work that produces
it. The skill investigates available evidence, puts forward concrete drafts,
surfaces hidden branches, and resolves or defers material decisions until the
user and agent share an implementation-ready understanding. Writing
`spec.md` preserves that understanding for the next session; it is the
handoff, not the activity.

Rename the skill to `shape-idea`. `shape` names the transformation from a
partial thought to bounded decisions, while `idea` names the input broadly
enough to include a feature, redesign, refactor, policy, or plan. Alignment is
the success condition of that shaping work rather than the action itself.

## Considered Options

- **Keep `write-spec`** (rejected): overemphasizes document production and
  makes the interview, investigation, and decision work sound incidental.
- **`align-idea`** (rejected): suggests bringing people into agreement around
  an already-formed idea, while this workflow also discovers and changes the
  idea's shape.
- **`shape-change`** (rejected): describes implementation-bound work well but
  assumes the change boundary exists before the skill has established it.

## Consequences

The published directory, manifest entries, invocation examples, related skill
references, and eval prompts move from `write-spec` to `shape-idea`.
`plugin.json` bumps to 0.9.0. Existing skills.sh copies keep the old name until
reinstalled, and local symlinks need one `scripts/link-skills.sh` run after the
rename lands on main. Decision 0006 and older historical records retain
`write-spec` as the name that was current when they were written.
