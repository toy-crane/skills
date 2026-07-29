# build-prototype renders in the project's style from the first screen

Retire build-prototype's two-pass staging. The prototype is built once, in the
project's own design system; where the project has no design system it is built
minimally and stays that way. The screen inventory becomes the session's one
stop.

Decision record: [prototype-builds-in-the-project-style-from-the-start](../../decisions/prototype-builds-in-the-project-style-from-the-start.md).

## Confirmed decisions

1. **The skeleton pass is removed.** There is no wireframe-gray first render and
   no approval gate between fidelities. Every screen is built at full fidelity
   the first time it is shown.

2. **The design system is the default basis.** When the project has one, its
   tokens are copied verbatim into `:root` and screen elements are named after
   the system's own component names (`data-component`, components the system
   lacks marked as new). This was already the skill's instruction; it now
   applies from the first render instead of the second.

3. **Minimal is the fallback and it is terminal.** With no design system to copy,
   the prototype is built in a minimal neutral style and nothing swaps it out
   later. Visual identity is not what the prototype aligns. If the user supplies
   a direction the session applies it immediately — as a request, not as a
   stage the skill schedules.

4. **The screen inventory is an explicit stop.** The session proposes the screen
   list as a draft and waits for the user to correct or confirm it before
   building. This is the only wait point in the skill.

5. **Everything else in the fill survives unchanged**, now as properties of the
   single build: realistic dummy data (real-length names, plausible sentences,
   awkward numbers, never lorem ipsum), edge states exposed through the state
   pills where they bite, and no real data, latency, or production wiring.

6. **Detection is not specified.** The skill states the branch — system, or none
   — and leaves finding the system to the model. No file-scanning procedure is
   written.

## Rationale

The retired pass guarded two real failures: structure corrected after styling
costs hours where it cost minutes, and a user shown styling reacts to styling
instead of structure. Both are traded away knowingly. The pass bought its
protection by rendering the prototype as a product the project is not, which
makes it blind to the question most runs actually arrive with — whether a new
screen belongs in an existing product. It also cost a second full render on a
skill whose unit of work is the entire surface. The inventory stop absorbs the
cheap-correction role: a list is text, and it is now the last point where being
wrong is free.

## Changes to make

Shaping wrote the glossary, the decision record, and its index line already.
The following are implementation.

- `skills/build-prototype/SKILL.md` — replace the "Skeleton, then fill" section.
  Fold the surviving fill content into one build, state the design-system /
  minimal branch, and make the inventory a stop. The section heading changes
  with it; "Skeleton, then fill" no longer describes anything.
- `skills/build-prototype/templates/shell.html` — keep the gray `:root` block
  and the `.wf-line` / `.wf-pic` helpers. Rewrite the `Tokens:` contract note
  (lines 15-21) and the wireframe-helper note (line 22): the gray block is the
  fallback for a project with no design system, not a stage to replace, and the
  helpers belong to the minimal style rather than to a skeleton pass.
- `skills/build-prototype/evals/evals.json` —
  - eval 1: replace the wireframe-gray first-pass expectation with the design
    system / minimal branch and the inventory stop.
  - eval 2: its assertion "It stays in the skeleton pass instead of starting the
    fill" has nothing left to guard. Rewrite the case against the inventory stop
    (structural corrections still apply exactly and nothing else moves).
  - eval 3: the prompt ("뼈대는 승인이야. 이제 채워줘") presumes the staging.
    Replace it; the fill is no longer a phase the user triggers.
  - eval 7: now consistent with the skill rather than the exception to it.
    Verify, adjust only if its wording implies a pass.
- `skills/build-prototype/agents/openai.yaml` — `default_prompt` describes the
  two passes ("walk me through a wireframe skeleton pass, then swap in the real
  design tokens"). Rewrite.
- `README.md:86-90` — the build-prototype entry says "walked through as a
  wireframe skeleton first, filled after approval". Rewrite.
- `AGENTS.md`, "Skills stay thin" — the parenthetical example
  (`build-prototype's skeleton-then-fill`) no longer exists. Keep the rule and
  cite this retirement in its place. Note that the published set now holds no
  fixed procedure.
- `.claude-plugin/plugin.json` — bump `version` from `0.23.0`. Behavior change
  to a shipped skill, so a minor bump.

## Assumptions

Stated under standing veto; correct any that are wrong.

- The minimal fallback reuses the shell's existing gray tokens rather than
  introducing a second palette. Nothing new is designed for it.
- `.wf-line` and `.wf-pic` are kept. They are the minimal style's vocabulary
  now, and they cost nothing when a design system is in use.
- The inventory stop is the skill's only wait. The screen-by-screen review after
  the build stays a review, not a second gate.
- The version bump is minor (`0.24.0`), not patch.
- No eval run is commissioned for this change. The failure the pass guarded is
  the user's attention landing on the wrong axis, which scoring model output
  cannot observe.

## Off-limits

- `docs/decisions/prototype-returns-full-surface-single-file.md` and
  `docs/decisions/thin-skills-over-fixed-procedures.md` — both keep their text.
  Records are append-only; the first is partially superseded and the second
  merely loses an illustration. Neither file is edited.
- `.agents/skills/writing-great-skills/` — vendored, and its `metadata:
  { internal: true }` frontmatter stays.
- Every other skill under `skills/`. This change touches build-prototype's text
  and the files that describe it, nothing else in the published set.
- The shell's review chrome (`sh-*`): screen tabs, state pills, viewport cycle.
  Untouched — the chrome is pinned on purpose.
- No work in flight elsewhere was declared. If another session is editing
  build-prototype, this spec collides with it.

## Deferred

- How a partial design system is handled — tokens but no component names, or a
  system covering some screens and not others. Left to model judgment rather
  than written into the skill.

## Remaining risks

- **The traded failure may return.** A design system can make a wrong
  information hierarchy read as settled, and the inventory stop does not catch
  that: it catches wrong screens, not wrong structure inside a right screen. The
  signal to watch for is prototypes approved with structural faults that surface
  during implementation. If it appears, reinstating a gray pass for greenfield
  only is the first thing to reach for, and the finding belongs against the
  decision record.
- **Wasted work grows when the inventory is wrong late.** A screen deleted after
  the build now costs a themed, filled screen. The stop reduces this but does not
  remove it — a user who confirms a list and changes their mind after seeing it
  is exactly the case the old gray pass made cheap.
- **The set now has no fixed procedure**, so the rule in AGENTS.md governs
  nothing concrete. It survives as an editorial test with a retirement as its
  worked example, which is untested as teaching material.
