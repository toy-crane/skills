# explain becomes explain-visually, comprehensive within the medium

A model explains in prose without being asked. The skill adds one thing on top
of that: it renders instead. So rendering is not this skill's medium, it is its
whole content — and a name that hides it hides the only reason to invoke it.
`explain` reads as the act every assistant already performs, which is both a
weak promise to the user and a bad trigger: it invites firing on gaps a single
sentence closes, where the skill has nothing to add.

0015 rejected this name on the grounds that 0001 keeps the medium out of a
skill's identity. That reading stretches 0001, which bars naming a *tool* — a
widget, an artifact page, an HTML file — so the capability survives a change of
environment. "Visually" names no tool. It survives every environment the skill
runs in, which is exactly the test 0001 sets.

The cost is real and accepted: the verb-object scheme (0006) gets an adverb
here. The object of explaining changes every time — 0015's own reason for
leaving the slot empty — and the adverb fills it with the part that does not
change.

Comprehensive within that medium, and this is the second half of the change.
The shipped text listed four gaps to draw (a flow, a relationship, a state
change, a shape), all structural, all box-and-arrow. That left out the
explanations a picture is good at but a diagram is not: a mechanism shown by
running real values through it, alternatives placed side by side, a table, a
timeline, annotated code, a before-and-after. The skill now takes the form from
the gap and refuses a closed vocabulary of shapes.

## Considered Options

- **Keep `explain`, drop the visual bias** (rejected, and briefly implemented):
  makes the skill medium-neutral, at which point it restates what the model does
  by default. The push to render was the capability.
- **`explain-with-a-picture`, `show`, `visualize`** (rejected): "show" and
  "visualize" name the medium as the act and lose the gap being closed;
  "with-a-picture" narrows to the one shape the change is trying to widen past.
- **Enumerate every visual form** (rejected): a closed list is the same mistake
  as the four structural gaps, one level up. 0009 keeps skills thin.

## Consequences

`skills/explain/` becomes `skills/explain-visually/`, with its frontmatter
`name`, the `plugin.json` skill path and keyword, the `.claude/skills/` symlink,
the README entry and its outside-the-pipeline line, shape-idea's pointer, and
`GLOSSARY.md`'s **Comprehension gap** following. Version 0.15.0. 0015 stands as
the record of why the skill exists, when it fires, and what it writes; its
decisions 3, 6, 9, and 10, its `explain-visually` rejection, and the matching
lines in `docs/specs/explain-skill/spec.md` are superseded here. Installed
copies keep the old name until reinstalled, as with the 0006, 0007, and 0013
renames. A one-sentence gap now falls outside the skill and is answered by the
model directly, which is the intended split.
