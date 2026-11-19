---
name: explain-visually
description: Render an explanation as a diagram, comparison, trace with real values, or annotated code. Use when the user asks to have a concept, decision, flow, or code explained, or says they do not follow, or when the at-a-glance output style hands over a process, a mechanism, or a structure too large for the reply.
---

# Explain Visually

Render the subject when a visual explanation is needed.

First decide whether one sentence fully answers the question. Rendering costs
the user's time, so when one sentence is enough, write it and stop: no
drawing, table, list, or arrow flow, even when a structure sits behind the
answer, and not to contrast it with something else or to list related items.

Otherwise pick the form from the kind of content:

- Structure or relationships: a static diagram with its labels on the drawing.
- A process of several steps: a stepper. Every step name is visible from the
  start, and a step that branches or ends in different outcomes shows each
  branch's name beside it in that same always-visible row. The user moves to
  the next step; it never plays on its own.
- A mechanism, whose result changes with an input, a state, or a condition,
  including a rule that maps cases to outcomes: a manipulable view, not a
  stepper. Its first view asks the user to predict the result for one
  concrete case and hides it until they commit, then reveals the result and
  the controls to change the input. The reply around the view says only what
  to try: stating the result or the rule that decides it gives the prediction
  away.

Whatever the form, the first view, before any input, names every stage,
every branch a stage splits into, and every case a control can show, with the
direction between them; controls add detail only, and a prediction hides the
result it asks about and the rule that decides it, and nothing else.

Check the available tools and use the best renderer the session provides.
Tools listed only by name as deferred count as available; load them with
ToolSearch before drawing. Use
text in the reply only when nothing in the session can draw: numbered steps
for a stepper, and for a mechanism the prediction question followed by a table
of values and their results.
