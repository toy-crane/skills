# Skills state goal, constraints, and completion criteria; fixed procedures must earn their place

The published set follows one editorial criterion, until now recorded only
in a blog post outside the repo: a skill states goal, constraints, and
completion criteria, and leaves method to the model. The reasoning is laid
out in [Why better models need thinner instructions](https://toycrane.xyz/posts/why-better-models-need-thinner-instructions/):
a model that chooses well at each fork is hindered, not helped, by
step-forcing — a procedure the model already performs reliably blocks the
better situational choice. What instructions cannot replace is reality, so
a skill points at real artifacts — GLOSSARY.md, `docs/specs/<slug>/`,
prototypes, decision records — instead of paraphrasing them in prose: a
paraphrase rots when the artifact moves, and the artifact answers
questions the paraphrase never anticipated.

A fixed procedure earns its place only by naming the repeated, observed
failure it guards. Both words carry weight: observed, a failure actually
hit rather than imagined; repeated, a pattern rather than one accident.
build-prototype's skeleton-then-fill passes — structure corrected after
styling costs hours where it cost minutes, and a user shown styling reacts
to styling instead of structure. A general procedure ("explore the
codebase first, then plan") never passes; a capable model does that
unprompted.

The set already embodies the rule, which is why recording it matters:
without the record the pattern reads as accident, and an edit "improving"
a skill with step-by-step instructions reads as progress.
discover-opportunity carries intent and stop conditions with no step
order; draft-plan names the four calls only the user can make and leaves
the rest to the model under standing veto; tdd is reference — seams,
anti-patterns — not procedure; build-prototype holds the one procedure
that passed the test.

The vendored writing-great-skills governs form: structure, context load,
disclosure, pruning mechanics. This decision governs content: what
deserves to exist in a skill at all. Where the two pull apart —
predictability of process against freedom at each fork — this decision
wins for the published set, and the vendored text stays unedited to avoid
diverging from upstream.

## Considered Options

- **Summarize the post into AGENTS.md** (rejected): a block of general
  principle in the always-loaded file is exactly what the post says to
  cut. The checkable rule fits in one section; the why lives here.
- **Publish the principle as a skill** (rejected): it is editorial policy
  for this repo, not an execution-time task, so it has no place in
  `skills/`.
- **Fold the criterion into writing-great-skills** (rejected): the skill
  is vendored from mattpocock/skills; edits diverge from upstream.

## Consequences

AGENTS.md gains a "Skills stay thin" section stating the checkable rule.
Reviewing a new or edited skill, every fixed step answers "which observed,
repeated failure does this guard?" or goes. A model-generation upgrade
triggers a re-pruning pass over surviving procedures: yesterday's guard is
tomorrow's obstacle. Existing records and the vendored skill keep their
text.
