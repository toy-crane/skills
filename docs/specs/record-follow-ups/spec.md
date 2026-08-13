# Record follow-ups discovered during sessions

## Problem

Sessions apply temporary workarounds (e.g., clearing a shared Metro transform
cache) and observe out-of-scope defects or suspected causes (e.g., a machine-
global cache shared across worktrees leaking one platform's constants into
another's bundle). Nothing durable captures these: spec folders retire when
work ships, decision contracts hold settled decisions only, and conversation
history is not durable evidence. The discovery is lost, and no future session
can resume it.

## Confirmed decisions

1. **Carrier**: `docs/follow-ups/` in the repository, one file per item
   (`docs/follow-ups/<slug>.md`). A GitHub-issue carrier was considered and
   rejected by the user in favor of an in-repo carrier with no remote
   dependency. A single backlog list file was rejected: parallel worktree
   sessions appending to one file collide on merge, matching the sequential-
   number collisions recorded in document-lifecycles evidence. Harness task
   chips were rejected: ephemeral and harness-specific.
2. **Capture criteria**: record when (a) an applied workaround is temporary and
   its root cause stays open, or (b) an out-of-scope defect or suspected cause
   is observed with evidence. Do not record actions fully resolved in the
   session, unevidenced guesses, or defects fixed in the current change.
3. **Rule ownership (hybrid)**:
   - `project-knowledge` owns the rule body: criteria, item format, lifecycle,
     and a follow-up template. Its description gains a discovery-time trigger.
   - `implement` and `expo-dev-loop` each carry one routing sentence with a
     compressed inline fallback for standalone installs.
   - Rationale: repo evidence shows installed skills go unused without explicit
     routing; full rule duplication in every execution skill was rejected for
     maintenance cost; a dedicated mechanism skill was rejected, consistent
     with pipeline.md's rejection of mechanism-only skills.

## Required changes

1. `skills/workflow/project-knowledge/SKILL.md`
   - Description: append a concise discovery-time trigger, e.g. "…or when a
     session applies a temporary workaround or observes an out-of-scope defect
     that future work must address."
   - New section `## Record follow-ups` between "Preserve decisions" and
     "Protect project truth" carrying: the capture criteria above; one file per
     item at `docs/follow-ups/<slug>.md`, written at the moment of discovery;
     the fresh-session bar (symptom, observed evidence, suspected cause, what
     was tried, proposed next step — enough to act without this conversation);
     deletion when the work ships or the item is promoted to a spec folder,
     with Git history as the only archive.
   - New `templates/follow-up.md` following the existing template pattern
     (`templates/glossary.md`, `templates/decision-contract.md`).
2. `skills/workflow/implement/SKILL.md` — one routing sentence after the
   runtime-verification paragraph: when a temporary workaround leaves its root
   cause open or an out-of-scope defect is observed with evidence, record it at
   the moment of discovery through the `project-knowledge` skill; when that
   skill is unavailable, write symptom, evidence, suspected cause, attempts,
   and proposed next step to `docs/follow-ups/<slug>.md` directly.
3. `skills/expo/expo-dev-loop/SKILL.md` — the same routing sentence at the end
   of "Verify after each edit".
4. Decision contracts and glossary (record once this spec is approved):
   - `docs/decisions/document-lifecycles.md`: add the `docs/follow-ups/`
     lifecycle and the rejected alternatives above.
   - `docs/decisions/pipeline.md`: the capture rule and the handoff — a
     follow-up item is a valid `shape-idea` input or direct fix seed.
   - `docs/decisions/skill-design.md`: update the recorded `project-knowledge`
     trigger scope.
   - `GLOSSARY.md`: add **Follow-up**, distinguished from a spec's deferred
     points (decisions postponed during shaping) and human-review's deferred
     commitments (unresolved human questions in a review).
5. Trigger evals: add discovery-scenario prompts to
   `skills/workflow/project-knowledge/evals/trigger-evals.json` — a
   mid-debugging workaround scenario should trigger; a routine in-scope fix
   should not.

## Assumptions (overridable)

- Items are written at the moment of discovery, not at session close.
- Slugs are kebab-case, named for the symptom (e.g.
  `metro-cache-platform-leak`).
- No `plugin.json` or symlink changes: no new skill is created.

## Off-limits

- `human-review` stays read-only during review; its findings become follow-ups
  only when the user says so in conversation.
- `shape-idea`'s deferred points stay in specs; follow-ups do not replace them.

## Deferred points

- Whether future runtime-verification skills automatically carry the routing
  line — decide per skill when one is added.
- Whether `compact-decisions` should also prune stale `docs/follow-ups/` items
  during periodic cleanup — decide when staleness is actually observed.

## Remaining risks

- The description trigger may still under-fire mid-debugging; the routing
  lines are the primary mitigation and the trigger evals the detection.
- `docs/follow-ups/` can accumulate stale items in repositories nobody prunes;
  the deferred `compact-decisions` extension is the likely remedy.
