# explain draws what the user asks about; shape-idea keeps its two gates

shape-idea renders for two reasons: variants for an experiential question, and
one diagram to mirror a structure back. Both exist to get the interviewer's
understanding corrected. Everything else stays prose, and that gate is narrow on
purpose — the interview spends as little of the user's time as it can.

Explaining runs the other way. The authority is the code and the docs, not the
user, and the act spends the user's time rather than saving it. So it is a
separate skill, `explain`, usable in any conversation. shape-idea gets one line
pointing to it.

`explain` fires when the user asks. An earlier draft also watched for silent
confusion: the same question asked twice, a term avoided, an empty approval
followed by a return to the subject. Guessing needed support — never say "you
seem confused", check understanding by offering the next choice instead of
asking — and that support was most of the skill's text. It served a user who will
not speak up, and a user who asks once will ask again. Cut, the skill is three
paragraphs.

Two more clauses went. One called `domain-modeling` when the gap was a project
term. A thin glossary is not the stuck user's problem, the premise breaks in a
repo the user does not own, and it put back the durable write the skill had just
dropped. The other was a brake on over-drawing, which the narrower trigger made
pointless.

## Considered Options

- **A third render gate in shape-idea** (rejected): traps the capability inside
  shaping sessions. The point is to have it while reading an unfamiliar repo,
  debugging, or reviewing.
- **`visual-explanation`** (rejected): the noun class is for skills that fire in
  the background or are called by other skills. This one is user-facing, and the
  noun names the artifact instead of the act.
- **`explain-visually`** (rejected): "visually" is the medium, and 0001 keeps the
  medium out of a skill's identity. The real object is whatever the user is stuck
  on, so the verb stands alone.
- **`comprehension-gap`** (rejected): names the trigger, hides the act.
- **Keeping the signal list too** (rejected): see above. The silent case is
  uncovered on purpose.

## Consequences

`skills/explain/SKILL.md` is added and registered in `plugin.json`, the
`.claude/skills/` symlink, and the README list. The pipeline diagram is
untouched; `explain` is not a stage. shape-idea gains one line and nothing else.
`GLOSSARY.md` gains **Comprehension gap** for the distinction this record turns
on. The silent misunderstanding stays uncovered; the signal list is written down
above so it can be revived instead of rediscovered.
