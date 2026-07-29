# build-prototype renders in the project's style from the first screen

Retire build-prototype's two-pass staging. The prototype is built once, in the
project's own design system; where the project has no design system it is built
minimally and stays that way. Nothing is staged or gated in front of the build.

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
   later. Visual identity is not what the prototype aligns. A user who wants a
   particular look says so and the session applies it — the skill does not
   branch for that case, and does not advertise it.

4. **Nothing gates the build.** The screen inventory is proposed as a draft, as
   it already was, and the session builds from it without waiting for approval.
   A mandatory stop was considered and rejected; see the decision record.

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
skill whose unit of work is the entire surface.

Nothing compensates for it, on purpose. The obvious compensation — stopping on
the screen inventory — is a fixed procedure by AGENTS.md's test, guarding a
failure that was predicted rather than observed, and it gates a skill built to
escape prose behind the approval of a prose list.

## Changes to make

Shaping wrote the glossary, the decision record, and its index line already.
The following are implementation.

- `skills/build-prototype/SKILL.md` — replace the "Skeleton, then fill" section.
  It should come out **short**: use the project's design system when there is
  one, minimal when there is not, then build. The surviving fill content folds
  into the single build. The section heading changes with it; "Skeleton, then
  fill" no longer describes anything. Do not add a detection procedure, a
  greenfield branch, or a wait point — the thinness is the deliverable here, not
  a side effect.
- `skills/build-prototype/templates/shell.html` — keep the gray `:root` block
  and the `.wf-line` / `.wf-pic` helpers. Rewrite the `Tokens:` contract note
  (lines 15-21) and the wireframe-helper note (line 22): the gray block is the
  fallback for a project with no design system, not a stage to replace, and the
  helpers belong to the minimal style rather than to a skeleton pass.
- `skills/build-prototype/evals/evals.json` —
  - eval 1: replace the wireframe-gray first-pass expectation with the design
    system / minimal branch. The screen inventory stays a draft; assert it is
    not posed as a question, not that the session waits.
  - eval 2: its assertion "It stays in the skeleton pass instead of starting the
    fill" has nothing left to guard. Rewrite the case so structural corrections
    still apply exactly and nothing else moves.
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
  cite this retirement in its place. The published set now holds no fixed
  procedure.
- `.claude-plugin/plugin.json` — bump `version` from `0.23.0`. Behavior change
  to a shipped skill, so a minor bump.

## Assumptions

Stated under standing veto; correct any that are wrong.

- The fallback style is called **minimal**, not skeleton. "Skeleton" now names
  the retired pass, and reusing it for the surviving style is the one confusion
  worth spending a word to avoid. GLOSSARY's Prototype entry already says
  minimally.
- The minimal fallback reuses the shell's existing gray tokens rather than
  introducing a second palette. Nothing new is designed for it.
- `.wf-pic` is kept. `.wf-line` is kept too, but expect it to go unused — see
  the test build below.
- The screen-by-screen review after the build stays a review, not a gate.
- The version bump is minor (`0.24.0`), not patch.
- No eval run is commissioned for this change. The failure the pass guarded is
  the user's attention landing on the wrong axis, which scoring model output
  cannot observe.

## Observed in a test build

One prototype was built to these decisions before implementation — greenfield,
so the minimal fallback applied — and rendered in a browser. It was disposable
and is not in the repo. Three things it settled:

- **`.wf-line` has no role left.** It puts a gray bar where text goes, and a
  terminal minimal style puts real text there instead; the build never reached
  for it. `.wf-pic` was used throughout, for thumbnails a prototype legitimately
  has no images for. Keep both for now and revisit `.wf-line` if a second build
  also finds no use for it.
- **The minimal path costs more than the design-system path**, which is the
  reverse of how the fallback reads on paper. With a system, the work is copying
  tokens; without one, cards, rows, chips, toggles, and fields are all written
  from scratch — over a hundred lines in this build. Nothing to fix, but the
  implementing session should not describe the fallback as the cheap branch.
- **The shell's chrome works unmodified** at this scale: six tabs built
  themselves, per-screen state pills varied correctly (three, four, and none
  depending on the screen), the viewport cycle reached 390, and no console
  errors appeared.

What the build did *not* settle is whether a minimal prototype reads as
finished or as an unfinished wireframe. Decision 3 rests on it and only a user
looking at one can answer it. Until someone does, treat it as open.

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
  information hierarchy read as settled, and nothing in the skill catches that
  any more. The signal to watch for is prototypes approved with structural
  faults that surface during implementation. If it appears, reinstating a gray
  pass for greenfield only is the first thing to reach for, and the finding
  belongs against the decision record.
- **A wrong screen list is now expensive.** A screen deleted after the build
  costs a themed, filled screen rather than a gray box, and no gate stands in
  front of that. This is the accepted price of decision 4; if it bites
  repeatedly, that repetition is the observed failure a stop would have needed
  in the first place, and it can be added then on evidence.
- **The set now has no fixed procedure**, so the rule in AGENTS.md governs
  nothing concrete. It survives as an editorial test with a retirement as its
  worked example, which is untested as teaching material.
