---
name: draft-piece
description: Draft or resume one piece of writing from a selected brief folder. Use when the user provides a `docs/briefs/SLUG/` folder and wants its confirmed brief written into the publication's content location, verified against the brief's reader questions and any embedded code, revised once, and previewed locally when the repository serves the publication. Do not use to change the brief, to define a publication, or to commit or publish the piece.
---

# Draft Piece

## Load the current handoff

Treat `brief.md` as the confirmed contract for the piece. Read the publication
file it names under `docs/publications/`, `GLOSSARY.md`, and the relevant
subjects from `docs/decisions/README.md` when present. The publication file
supplies the form, the content location, the preview method, and any
medium-specific evidence; the brief supplies the thesis, reader, reader
questions, scope, material, outline, and execution-checked code.

Before starting, and again after an interruption, reconstruct current state
from the brief, the publication file, any existing draft at the content
location, Git state and the current diff, and verification evidence.
Repository evidence outranks remembered conversation; a draft on disk is
compared against the brief before continuing, not rewritten from memory.
Confirm ownership before absorbing ambiguous dirty changes.

## Write against the brief

Write the piece at the location the publication file names, filling any
`<slug>` in that location with the brief folder's slug so the brief and the
piece stay paired, section by section in the outline's order. After each section, check it against the
brief: the thesis it serves, the reader question it answers, the scope it
stays inside, the material it draws on. Use the project's terms from
`GLOSSARY.md` and the voice the publication file and style decisions set.

Embedded code and commands are claims the reader will reproduce. Run each one
in this repository at the time it is written, and match any stated output to
the real output. When a marked block cannot run in the current environment,
record the exact failed gate and prerequisite in the handoff and keep the
piece incomplete; reading the code is not running it.

When a discovery would change the thesis, the reader, a reader question, the
scope, or what the piece leaves out, stop. Preserve the draft and the
evidence, state the exact decision, and return it to the user for the brief to
be resettled. Drafting authority covers wording, structure inside the outline,
and technical detail while the brief stays intact; it does not extend to
editing the brief.

Route a workaround whose root cause stays open, or an evidenced out-of-scope
defect found while running the piece's code, through `project-knowledge` at
discovery time. If that skill is unavailable, write the symptom, observed
evidence, suspected cause, what was tried, and proposed next step to
`docs/follow-ups/<slug>.md`.

## Verify in two layers

When the draft is complete, run both checks before revising anything:

1. **Reader questions, on every piece.** Hand the draft text and the brief's
   reader questions, and nothing else from this conversation or the brief, to
   a separate agent with no other context, and have it answer each question
   from the draft alone. A question it cannot answer, or answers wrongly,
   fails. Use whatever fresh-context agent the current harness offers.
2. **Execution, on pieces with code.** Every block and command the brief marks
   runs as written, in the repository, and produces the stated result. Rerun
   any block whose surrounding text changed since it last ran.

Add any medium-specific check the publication file names.

## Revise once, then record

Revise exactly once. Repair a failed reader question by changing the part of
the piece that should have answered it, and repair a factual error the
execution check exposed. When a repair changes embedded code, rerun that code.
Everything else the checks or your own reading surfaces, such as stylistic
remarks, a better structure outside the outline, or an idea the scope leaves
out, is recorded in the handoff rather than acted on. A second revision round
is not started; further editing is the user's call after reading.

Reusable style or structure choices made while drafting go through
`project-knowledge` when available; otherwise note them in the handoff.

## Hand off the draft

Report the piece's location, the result of each verification layer, what the
single revision changed, and what was recorded without action. Retirement of
the brief folder happens when the piece is published, not here.

When the repository serves the publication through a local server, run it
through the supported development or preview path, reuse a healthy server
owned by the current checkout or start an isolated one without disturbing
other checkouts, verify that the rendered piece loads with the current draft,
and share the address and what to look at. Keep the server running until the
user finishes reading or later delivery cleanup stops it. If the environment
cannot provide a reachable address, report the exact launch command and
blocker without claiming a working URL. When the repository has no such
server, hand off the file without inventing one.

Stop before committing, opening a pull request, or publishing. Those follow
the user's reading of the draft, through the repository's Git skills or the
user's own commands.
