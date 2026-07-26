# explain renders what the user asks to have explained; shape-idea keeps its two gates

shape-idea renders for two reasons only — two or three variants for an
experiential question, one diagram to mirror a structure back — and both sit
under `put forward a concrete candidate for the user to correct`. Their purpose
is to get the interviewer's understanding corrected, so everything else,
including a gap in the *user's* understanding, falls through to
`Everything else stays prose`. That gate is deliberately narrow because the
interview's objective function is to spend as little of the user's time as
possible (`close every branch you can without them`), and a render is justified
there only when it compresses several prose questions into one turn (0001).
Explaining runs the other way: the authority is the code and the docs rather
than the user, and the act spends the user's time instead of saving it. Opposite
direction, opposite objective function — so it is a separate skill, `explain`,
scoped to any conversation, and shape-idea gains one line handing off to it.

`explain` fires on the user's explicit request, not on inferred confusion. An
earlier draft carried a signal list (the same question re-asked in different
words, a term avoided in favor of a workaround phrase, substanceless approval
followed by circling back) plus the machinery that made guessing safe: never
announce the diagnosis, render instead, and check comprehension by putting the
next choice in front of the user rather than asking whether it landed. That
apparatus was most of the skill's text and all of its ambiguity, bought to serve
a user who will not speak up — while a user who asks once will ask again. Cut,
the skill is three paragraphs, each overriding exactly one default: answer in
prose only, interrogate the user about what exactly is unclear, draw from what
you already believe.

Two clauses were cut for being someone else's problem. A glossary residue
("when the gap was a term this project owns, invoke `domain-modeling`") gave the
skill its only durable write, but a glossary deficiency is not the stuck user's
concern, the premise is false whenever `explain` runs in a repo the user does not
own, and delegation smuggled back the durable write the skill had just given up.
An over-trigger brake became redundant once the trigger was an explicit request.

## Considered Options

- **A third render gate inside shape-idea** (rejected): locks the capability
  inside shaping sessions, when the point is to have it in any conversation —
  reading an unfamiliar repo, debugging, reviewing. shape-idea takes one handoff
  line instead.
- **`visual-explanation`, a discipline noun** (rejected): the noun class exists
  for skills that fire in the background or are called by other skills
  (domain-modeling, tdd). Once the trigger is the user asking, this one is
  user-facing, and the noun names the artifact rather than the act.
- **`explain-visually`, strict verb-object** (rejected): "visually" is the
  medium, and 0001 keeps the medium out of a skill's identity because the
  available media differ per environment. The real object is whatever the user
  is stuck on, so the verb stands alone.
- **`comprehension-gap`** (rejected): names the trigger, leaving what the skill
  does invisible.
- **Keeping the signal list as an additional trigger** (rejected): see above —
  the silent case is left uncovered on purpose, and reopening it costs the
  brevity that makes the skill readable.

## Consequences

`skills/explain/SKILL.md` is added and registered in the three usual places
(`plugin.json`, the committed `.claude/skills/` symlink, the README list, with
the pipeline diagram untouched since `explain` is not a stage). shape-idea gains
one handoff line and nothing else; no other published skill changes. `GLOSSARY.md`
gains **Comprehension gap** to hold the distinction this record turns on — the
user not understanding the system, against the interviewer not understanding the
user. The silent misunderstanding stays uncovered by design; if real sessions
show it costing something, the signal list is written down here to be revived
rather than rediscovered.
