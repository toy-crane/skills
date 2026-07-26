# explain picks the form from the gap, not the diagram every time

0015 named the skill `explain` and rejected `explain-visually`, because 0001
keeps the medium out of a skill's identity. The text it shipped did not hold
that line. Its own first sentence ruled prose out, the only noun it gave the
answer was "diagram", and the four gaps it listed to draw — a flow, a
relationship, a state change, a shape — are all structural, exactly the set
boxes and arrows cover. "One level per view" is diagram vocabulary too. A
skill named for the act read as a skill for one medium, and inherited it: the
capability came out of shape-idea's mirror-back diagram.

That bias costs the explanations a picture is bad at. A mechanism is closed by
running real values through it, not by drawing its parts. A why-this-and-not-
that is a comparison. One unfamiliar word is one sentence. The old text reached
those only through a single escape clause for one fact or one word; everything
else was told to draw.

The trigger and scope are unchanged. What changes is the first paragraph: the
form now follows from the gap — structure to a picture, mechanism to a worked
example, alternatives to a comparison, a word to a sentence — and the block on
prose narrows to the real failure, which is restating a failed explanation at
greater length. The warning against building from memory keeps its force by
scaling with the form: the more concrete the answer, the harder it is to doubt,
so a wrong worked example is as costly as a wrong diagram.

## Considered Options

- **Leave 0015's text and treat the bias as wording** (rejected): the bias is
  in the enumerated gaps, not in adjectives. A reader following the list
  literally draws every time.
- **Enumerate the forms exhaustively** (rejected): tables, timelines,
  annotated code, before/after, a runnable snippet. A closed list is the same
  mistake at greater length, and 0009 keeps skills thin.
- **Split a second skill for non-visual explanation** (rejected): the user does
  not know which kind of gap they have. Choosing the form is the skill's work.

## Consequences

`skills/explain/SKILL.md` keeps its three paragraphs and its frontmatter name;
the description and the first and third paragraphs are rewritten. The README
entry and `GLOSSARY.md`'s **Comprehension gap** follow. 0015 stands as the
record of why the skill exists and why it is called `explain`; its decisions 6,
9, and 10, and the matching lines in `docs/specs/explain-skill/spec.md`, are
superseded here. No other skill changes, and the pipeline is untouched.
