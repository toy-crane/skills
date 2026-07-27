# explain-visually looks for a renderer, gated on a one-sentence test

0017 cut this skill to nine lines and set its rendering rule in terms of the
reply: plain text is usually enough, and a rendered page is for when the reply
cannot hold the drawing. On a surface that has an inline renderer, that sentence
is an instruction to produce ASCII, and it was followed. Four prompts against
this repo, answered by the shipped body, produced fenced box-and-arrow text in
every render-warranted run and never once reached for a rendering tool.

The constraint behind 0017's phrasing is still right. Inline custom visuals
exist on Claude web, desktop, and Cowork and not on iOS, Android, or a plain
terminal session installed by skills.sh, and 0001 bars a skill from naming a
tool. But naming no tool and looking for no tool are different things. The body
now says to look: draw it with the best renderer this session actually has,
check the available tools before choosing a form, and take text in the reply
when nothing in the session can draw. That degrades on its own — a session with
no renderer lands on the old behaviour — so it names nothing and still fires
where a renderer exists.

Sixteen runs across three rounds, four prompts sourced from this repo, scoring
assertions fixed before any output was read.

The renderer result is decisive and replicated: the shipped body reached for a
rendering tool in none of three render-warranted runs, the renderer-first body
in three of three, and it survived both later revisions of the brake. The prose
changed character as a side effect — it stopped duplicating the drawing and
became commentary on it.

The brake is where the work went. 0017 identified over-rendering as this skill's
real failure and kept one paragraph against it. That paragraph does not hold in
any arm: the shipped body drew an ASCII tree and a table for a one-line glossary
question, and did it again for a one-line question about the committed symlinks.
Renderer-first did not introduce over-rendering. It made it cost fourteen tool
calls and five minutes instead of five calls and one minute. Median wall clock
went from 73s to 254s, which is an argument for a brake that holds rather than
against reaching for a renderer.

Two revisions were needed. Moving the brake ahead of the draw instructions and
naming its cost won the case it was written against and lost a held-out one: the
clause said a term they have not met is a definition, the held-out question was
not about a term, and the run drew. That failure named the general trap. The
model was not answering at length; it drew because structure sat behind the
subject while the answer was still one sentence. The clause now says exactly
that, and all three controls pass — including one held out until after the
clause was written — with the renderer result unchanged.

The held-out prompt is the part of the method worth keeping. Round two's clause
passed the prompt it was written against; re-running only that prompt would have
returned a clean pass and a false conclusion. Round three needed a third prompt
for the same reason, the second having become fitted by then. Each wording
revision retires one control.

## Considered Options

- **Leave 0017's rule alone** (rejected): it is the direct cause. The body told
  the model plain text was usually enough, and the model complied every time.
- **Name the tools** (rejected): 0001 bars it and the surfaces genuinely differ.
  "The best renderer this session actually has" names none and still degrades
  correctly where there is none.
- **Ship renderer-first with the brake as 0017 left it** (rejected): defensible,
  since the shipped body fails the controls too and the renderer-first body was
  already no worse on them. Rejected because renderer-first raises the price of
  that failure three and a half times, which is precisely when a brake stops
  being optional.
- **Keep revising the wording past round three** (rejected in advance): the
  stopping rule was fixed before round three ran. Had the held-out control
  failed there, the finding would have been that wording is not the lever, and
  the choice would have been to ship with over-rendering recorded as open or to
  reconsider the approach.

## Consequences

`skills/explain-visually/SKILL.md` goes from nine body lines to twelve. The
brake moves ahead of the draw instructions and carries its cost, and a third
paragraph sends the model to look at what the session can render. The README
entry follows. Version 0.17.0. 0017 stands as the record of what to cut and why
this skill is a handle for rendering; the half of its argument that set the rule
in terms of the reply rather than the tooling is superseded here.

The eval lives outside the repo, so a later re-prune reruns rather than re-reads
it — four prompts, three rounds, one run per cell, one model, on a Claude Code
session that does have an inline renderer. That last point bounds the renderer
result: it says the body reaches for a renderer where one exists, not that it
behaves well where none does. The `---TOOLS---` footer used to observe tool calls
may itself prime tool use; it was applied identically to every arm, and the bias
runs toward the null.

Two things stay open. Widget contents are invisible to the scorer, so
form-fits-the-gap was inferred from the surrounding prose on every renderer run
rather than read directly. And over-rendering is guarded by a clause that has
held across three controls, not solved; if a future model reaches for a renderer
on a question a sentence closes, that clause is the first place to look.
