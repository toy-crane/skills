# build-explainer — spec

A new published skill that turns content that is hard to grasp in prose —
a change set, a plan, an analysis, a system's structure, a comparison of
options — into one self-contained HTML page built to be understood by
looking. Shaped 2026-07-25 from the user's /shape-idea request (quoted,
Korean): "변경사항이나 계획 등등 다양한 내용들을 쉽게 이해하기 위해 html을
만드는 스킬을 만들고 싶은데, Claude와 Codex 둘 다 쓸 수 있어야 해. 각
플랫폼에 적합한 기능을 알아서 유도하도록 해줘. 특정 기능을 언급하지 말고."
No opportunity handoff; the request itself named the problem.

## Confirmed decisions

1. **Purpose and scope.** The skill produces an Explainer (see
   GLOSSARY.md): one HTML page whose only job is that its reader
   understands the content at a glance. Any content the user wants
   understood is in scope — changes, plans, analyses, architectures,
   trade-off comparisons. Out of scope: aligning on a product's UI
   (that is build-prototype) and producing pages that ship as product
   code (that is implementation).

2. **Name: `build-explainer`.** The skill is user-invoked, so it takes
   an imperative verb-object name per decision 0006. The verb follows
   build-prototype's precedent for an HTML deliverable; the object keeps
   the name-to-glossary pairing (build-**explainer** ↔ Explainer) that
   0013 preserved for write-plan. Checked against Claude Code and Codex
   built-in slash commands: no collision.

3. **Both harnesses, one text.** Cross-platform reach comes from the
   existing distribution channels (skills.sh installs per-agent; the
   plugin covers Claude Code), so the skill earns it by being written
   harness-neutrally, not by per-platform variants. Nothing in the text
   may assume one harness's invocation syntax, file layout, or UI.

4. **Platform capabilities induced by capability language, never tool
   names.** This is the user's explicit requirement ("특정 기능을 언급하지
   말고") and already this repo's doctrine (decision 0001; glossary term
   Visual medium). The skill states delivery as: render the page in
   whatever visual medium the environment provides, cheapest sufficient
   one first; when the environment offers no way to display HTML, write
   the file and tell the user how to open it. Each harness resolves that
   sentence to its own best surface without the skill naming any.

5. **One self-contained file.** Inline styles and scripts, no build
   step, no framework, no network dependency. The same file must open
   identically as a local file from a terminal harness and on any hosted
   preview a harness provides; a CDN link or web font breaks the first
   case silently. Interactivity (toggles, collapsible sections) is
   allowed within that constraint when it serves understanding.

6. **Grounded in the artifact it explains.** The skill reads the real
   change set, plan, or code before rendering; every statement on the
   page must trace to it. An explainer that decorates instead of
   informing has failed — accuracy outranks polish.

7. **Form chosen per content, by the model.** No fixed catalog of
   layouts (timeline, before/after, diagram, table) and no template
   file. Decision 0009: a fixed procedure or artifact earns its place
   only against a repeated, observed failure; build-prototype's shell
   passed that test, nothing here has yet.

8. **Ephemeral by default.** The page is a communication aid, not a
   project artifact: written outside the project's tracked tree, never
   committed, kept only when the user asks. This deliberately contrasts
   with prototype.html, which survives beside its spec because an
   approved surface is a decision; an explainer explains an artifact
   without becoming one.

9. **Description draft** (the triggering surface; implementation adjusts
   wording only if validation or triggering evals demand):

   > Build a self-contained HTML explainer so changes, plans, or any
   > hard-to-grasp content is understood by looking instead of reading
   > prose. Use when the user wants a change set, plan, analysis, or
   > system explained visually, asks to see something as a page, or when
   > a prose explanation keeps failing to land. For aligning on a
   > product's UI screens, use build-prototype instead.

10. **Skill text carries, at minimum:** the goal (reader understands at
    a glance; the page shows structure that prose hides), constraints
    (grounded, self-contained, harness-neutral capability-described
    delivery, ephemeral), and completion criteria (the user's questions
    about the content are answered; the page can be discarded without
    losing anything). Method stays with the model.

## Scope of implementation

Repo mechanics per CLAUDE.md: create `skills/build-explainer/SKILL.md`,
add `./skills/build-explainer` to `.claude-plugin/plugin.json`'s skills
array (and a keyword), symlink `.claude/skills/build-explainer`, link it
from README's skills list noting it is user-invoked, bump the plugin
version, run `claude plugin validate . --strict`. The GLOSSARY.md
Explainer entry lands with this spec.

## Assumptions (standing veto)

- The name `build-explainer` is the user's to veto; rename cost is
  bounded and rehearsed (0006, 0013 renames).
- The skill text is English, matching the rest of the published set,
  though the request arrived in Korean.
- The skill is primarily user-invoked; the description also lets it
  trigger when a prose explanation keeps failing, mirroring how
  build-prototype accepts hand-offs.
- Ephemeral-by-default is the right lifecycle; a user who wants a kept
  page can simply ask.

## Deferred points and remaining risks

- Whether an explainer should ever be preserved in a spec folder as a
  decision-bearing artifact (the way prototype.html is) — deferred
  until a real session wants it.
- Triggering overlap with build-prototype: the description carries an
  explicit routing sentence, but real usage may still confuse "show me
  the screens" with "help me understand"; watch and tune the
  description if misroutes are observed.
- Codex-side invocation was not exercised from this session; the text
  is harness-neutral by construction, but the first Codex install
  should confirm discovery and triggering behave.
