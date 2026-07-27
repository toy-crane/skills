# explain-visually keeps only what the model does not already do

0009 said to re-prune when models improve. This is the first pruning run with
evidence behind it rather than judgment. Four prompts against the real repo,
each answered twice — once by the shipped twenty-one-line body, once by a body
reduced to the single sentence "Describe it visually." — scored against
assertions fixed before any output was read.

Three of the four came back identical, 4/4 both ways. The one-line body did not
ask the user what was unclear, on a prompt written to be vague enough to invite
it. It did not collapse into box-and-arrow diagrams: it produced a comparison
table for a why-this-and-not-that, and a trace with this repo's real skill names
for a mechanism. No mermaid appeared in any of the eight runs. Both instructions
the body spent paragraphs on — guess the gap instead of asking, take the form
from the gap rather than a fixed vocabulary — describe what the model already
does unprompted. The second of those was the half of 0016 that was not the
rename; it is retired here on the evidence, not by accident, which is the reason
this record exists.

One case diverged, and it is the one the body still has to cover. Asked what a
glossary term means, the one-line body answered in 317 words with three fenced
renders, a table, and a state machine invented for the occasion; the shipped
body answered in 165 with no diagram and a citation. Over-rendering is the
failure this skill actually has, and the clause guarding it was buried as a
trailing subordinate in a paragraph about something else. It is now the second
of two paragraphs, and it carries its reason.

That reason came out of a second pass, over the visualization tooling a skill
now runs beside. artifact-design wants a design plan before the first line of
code; dataviz wants a seven-step procedure and a validator run; the Artifact
tool wants CSP-safe, theme-aware, favicon'd pages. None of them overlap this
skill — they are craft-of-the-artifact, and this is choose-the-explanation — but
all of them start from the assumption that a page is already being built.

What none of them describe is the rung below: custom visuals, rendered inline in
the conversation and discarded as it moves on, on by default with no toggle, and
carrying the platform's own escalation rule — persistent or shareable becomes an
artifact, everything else stays inline. It exists on Claude web, desktop, and
Cowork, and not on iOS, Android, or the Claude Code surfaces this repo is
usually read from. So the cheap rung is real on some surfaces, absent on others,
and a skill that ships to all of them cannot name it — which is why the body
says as cheaply as the gap allows and stops there. Restraint and cheapness stay,
stated in the same breath, and the enumerations go.

Work-from-real-sources went too. It survived the earlier draft on the strength
of a real asymmetry — a wrong picture costs more than a wrong sentence — but the
run that lacked the instruction still worked from the repo, and the shipped run
volunteered which of its claims it could not verify. Neither behavior needed
asking for.

The frontmatter description is untouched. It is routing metadata rather than
instruction, its enumeration is the promise the user reads before invoking, and
no trigger eval was run here.

## Considered Options

- **The bare one-line body** (rejected): scored 81% against the shipped body's
  94%, entirely on the over-rendering case. Being a fast handle to summon
  rendering is most of the skill's value, but a handle with no brake spends
  three hundred words on a vocabulary question.
- **Keep the form vocabulary, cut only the craft advice** (rejected): the
  conservative trim proposed before the eval ran. The eval says the vocabulary
  is inert, and keeping inert text because it was expensive to write is how a
  skill thickens.
- **Cut the brake too and rely on the bundled skills** (rejected): they are
  bundled with a Claude Code build, not with this repo. A skill installed by
  skills.sh into a plain terminal session has none of them, and 0001 already
  settled that a published skill cannot assume a surface.

## Consequences

`skills/explain-visually/SKILL.md` drops from twenty-one body lines to five; the
README entry loses the enumeration it mirrored. 0016 stands as the record of the
rename and of why rendering is the skill's content; its second half, the open
list of forms, is superseded here. Version 0.16.0. The eval set and its outputs
live outside the repo, so a later re-prune reruns rather than re-reads them —
four prompts, one run per cell, one model, all sourced from this repo, which is
thin enough that a surprising result should be rerun before it is believed. All
eight ran on a Claude Code surface, where no inline renderer exists, so the
finding that the form varied and no mermaid appeared is bounded by that surface;
the same prompts on web would have had custom visuals available. The
over-rendering result is not bounded that way — it is a question of how much,
not of which medium. If
a future model over-renders less, the remaining paragraph is the next candidate
to go, and the skill becomes the bare handle rejected above.
