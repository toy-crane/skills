# A stated decision carries the condition that would overturn it

shape-idea's method is to put forward a draft and let the user correct it, but
it has no way to tell a considered yes from a skimmed one. The skill already
owns one forcing function — two or three rendered variants that differ only on
the governing question, where a real choice cannot be nodded through — and it is
scoped to experiential branches. Assumptions under standing veto and prose
decisions have no equivalent. A decision stated cleanly invites agreement, and
the better the model writes, the fewer footholds the user has to disagree from:
the wrong fifth of a draft hides inside the right four fifths. This is the rare
failure that grows with capability rather than shrinking.

The body now asks that a stated decision carry the condition that would overturn
it, and that the condition be one only the user can know. Both halves are
load-bearing. Without the first, the user is handed a verdict and can only nod
or object wholesale. Without the second, the instruction degrades into hedging
every decision with conditions the session could have resolved itself, which
pushes work back onto the user — the exact motion the skill's opening paragraph
forbids. So a checkable condition is not stated; it is checked.

It sits after "Everything else stays prose" rather than inside the assumption
bullet, because the failure is not specific to assumptions. A prose decision the
user nods at costs the same as an assumption they never read. The variants
bullet is untouched: it already carries its own version.

The evidence is reasoned, not observed, and decision thin-skills-over-fixed-procedures asks for observed and
repeated. Two things argue the paragraph belongs anyway, and one argues it may
not. It constrains the form of a stated decision rather than ordering steps,
which is the class thin-skills-over-fixed-procedures leaves to skills — "Ask exactly one per turn" in the same
section has the same shape. It is three lines, so it is cheap to delete. But
whether the model already names overturning conditions unprompted has not been
tested, and if it does, this is precisely the inert kind of line decision explain-visually-keeps-only-the-counter-defaults
deleted. The test that settles it: an eval prompt carrying a decision whose
overturning condition lives only in the user's head, run against a body without
this paragraph. If the model names the condition on its own, the paragraph goes.

## Considered Options

- **Extend the assumption bullet instead** (rejected): scopes the guard to
  decisions the session made silently, when a prose decision the user skimmed
  fails identically.
- **Mirror the variants bullet — offer two prose alternatives per decision**
  (rejected): doubles the reading and manufactures a choice where none exists.
  The overturning condition costs one clause and no extra turn.
- **Carry a worked example in the body** (rejected): an example fixes the
  meaning to whatever domain it is drawn from, and the constraint is general.
  explain-visually-keeps-only-the-counter-defaults's finding was that the model supplies form on its own; it needs the rule,
  not the illustration.
- **Run the eval first and add nothing yet** (deferred, not rejected): the
  cleaner order by thin-skills-over-fixed-procedures's standard. The paragraph ships ahead of it because it
  is three lines and reversible, and the eval question is recorded above so the
  next pruning pass runs it rather than re-derives it.

## Consequences

`skills/shape-idea/SKILL.md` gains three lines; nothing is removed. Version
0.19.0. The paragraph enters with its counter-default status untested, which is
a debt this record names rather than hides — the next pruning pass owes it an
eval before keeping it. The closing summary still lists assumptions flat;
ranking them by which is most likely wrong was raised alongside this and is left
out as a separate change.
