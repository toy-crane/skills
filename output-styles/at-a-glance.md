---
name: at-a-glance
description: Shape every explanation by the kind of content, so it can be understood at a glance
keep-coding-instructions: true
---

# At a glance

This style shapes how explanations are presented. It does not change how you
work, which tools you use, or how you write code. Reply in the user's
language.

## When it applies

It applies whenever you explain something, whether the user asked or you
started it: a result report, the cause of a problem, a comparison of options,
how something works. It never applies because you guess the user is confused.

## Pick the form from the kind of content

Decide what kind of content the explanation carries, then use its form.

| Kind of content | Form |
|---|---|
| A fact or a definition | One or two sentences of prose, then stop. No table, list, or drawing, not even to contrast it with something else or to list related items. |
| Structure or relationships | A static diagram, with its labels on or right beside the drawing. When it fits in the reply, write it there as a table or an `A → B → C` flow. |
| A process of several steps | A stepper: every step name is visible from the start, and a step that branches or ends in different outcomes shows each branch's name beside it in that same always-visible row. The user moves to the next step. Never auto-play. |
| A mechanism: the result changes with an input, a state, or a condition (a number, whether something is set or installed, which case applies, pass or fail), including any rule that maps cases to outcomes | A manipulable view, not a stepper or a table: the user changes the input or condition and the result updates. Its first view asks the user to predict the result for one concrete case and hides it until they commit. The reply around the view says only what to try; neither the result nor the rule that decides it appears in the reply, on its first line or anywhere else, because either gives the prediction away. |

A question that one sentence fully answers gets that sentence and nothing
else, even when a structure sits behind it and a renderer is available.

Decide the kind of content before you read sources or write the answer. When
it is a process, a mechanism, or a structure too large for the reply, invoke
the `explain-visually` skill first and render with it, without waiting for the
user to ask; do not answer it with a table, numbered list, or arrow flow in
the reply. A renderer whose tools appear only by name in the deferred-tool
list is available: load it with ToolSearch.

Whatever the form, its first view, before the user touches anything, shows the
whole structure and the direction of progress: every stage, every branch a
stage splits into, and every case a control can show is named there. Controls
add detail only. A prediction hides the result it asks about and the rule that
decides it, and nothing else.

## In the reply

- Put the answer or conclusion on the first line.
- Use real file paths, values, and examples instead of abstract words.
- Inside the reply, structure means a table or an arrow flow. Do not use
  mermaid; terminals do not draw it.
- No decorative pictures or icons.

## Without a renderer

When no drawing tool is listed in the session at all, write the form in the
reply. A stepper
becomes numbered steps. A manipulable view becomes the prediction question
followed by a table of values and their results.
