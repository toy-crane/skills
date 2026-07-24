# Spec: The split-into-tasks skill and the write-plan rename

Confirmed 2026-07-24 in a shape-idea session. This spec folder is the handoff
contract for adding the `split-into-tasks` skill and renaming `draft-plan` to
`write-plan`. Companion records: ADR
[0012](../../decisions/0012-session-grain-tasks-via-split-into-tasks.md)
(session-grain task splitting, reopening 0005's tickets rejection), ADR
[0013](../../decisions/0013-draft-plan-becomes-write-plan.md) (the rename),
and `GLOSSARY.md` (Task; Spec folder's tasks/ mention — both already updated
in the shaping session).

## Goal

Give the pipeline a way to handle work that exceeds one session. The observed
failure is review bandwidth, not model context: a plan too big to read in one
sitting gets stamped instead of reviewed, and a giant implementation session
produces a change too big to review. `split-into-tasks` cuts such work into
session-sized tasks — one file each in the spec folder — so the user reviews
the breakdown once, then runs and reviews one fresh session per task.

## Confirmed decisions

1. **The concept is Matt Pocock's to-tickets, adopted at session grain.**
   Tracer-bullet vertical slices: each task cuts a complete path through
   every layer it touches, is independently verifiable when done, and
   declares which tasks block it. Unblocked tasks form the frontier a next
   session may pick up. The canonical term is **task** (glossary entry
   written); ticket, slice, subtask stay out of the vocabulary.
2. **Position: an optional gate on the spec folder, beside write-plan.** The
   skill takes `docs/specs/<slug>/`; plan.md is an input when present, never
   a prerequisite. Entry points stay three: small obvious work implements
   straight from spec; how-review work passes through write-plan; work
   exceeding one session passes through split-into-tasks (with or without a
   plan). When no spec folder is named it lists candidates and asks; when
   none exists it stops rather than cutting from conversation.
3. **The breakdown is reviewed before anything is written.** The skill
   presents a numbered list — title, blocked-by, what the task delivers —
   and iterates on granularity, edge correctness, and merge/split until the
   user approves. No files before approval, so an interrupted review never
   leaves a half-agreed breakdown looking authoritative.
4. **Publishing is local files only**: `docs/specs/<slug>/tasks/<NN>-<slug>.md`,
   one file per task, numbered in dependency order (blockers first). Each
   file: what to build (end-to-end behavior from the user's perspective,
   never a layer-by-layer list), blocked-by, status, acceptance criteria as
   a checklist. No tracker path, no tracker configuration.
5. **Each task file opens with the map contract** used by write-plan: the
   code is the terrain and the task a map; where they disagree the terrain
   wins; decision-level divergence flows back to spec.md. The implementing
   session updates its task's status and checkboxes on finishing; when a
   session's learning invalidates later tasks, the remaining tasks are
   re-cut. This is the designed defense against 0005's rot objection.
6. **Wide refactors are the one exception to vertical slicing.** A
   mechanical change whose blast radius spans the codebase is sequenced
   expand–contract: expand beside the old form, migrate in batches (each
   batch a task blocked by the expand), contract once no caller remains.
7. **No file paths or code snippets in task files**, with the standing
   exception: a prototype-produced snippet that encodes a decision more
   precisely than prose, trimmed to its decision-rich part.
8. **Dropped from the original**: the tracker publishing branch (decision 4)
   and the prefactoring instruction ("make the change easy, then make the
   easy change") — a method directive the thin-skills principle (ADR 0009)
   excludes. No execute/implement skill either: the user opens each task's
   session; plan mode, tdd, commit, and pr cover execution.
9. **draft-plan becomes write-plan.** "Draft" reads as rough/unfinished; the
   plan document is the review surface itself, so write names the work
   honestly. Verb-object naming stays the set-wide scheme; the to-X lineage
   (to-spec, to-plan, to-tasks) stays rejected because it cannot cover the
   set and elides the verb where this skill's intent lives.
10. **write-plan's Order section hands oversized work to split-into-tasks by
    name.** The anti-fine-grain stance ("never a pre-cut task list" at
    sub-session grain) survives; only the session-grain split now has a
    named skill instead of prose.

## Skill text contract (split-into-tasks)

Frontmatter description, approved verbatim as the draft to refine in place:

> Split work that exceeds one session into session-sized tasks, published
> one file per task for fresh sessions to pick up. Use when a spec — or its
> plan — is too big to implement or review in one sitting. Needs an existing
> spec folder; for work that fits one session, skip it and implement
> straight from the spec.

Body covers, thinly (goal, constraints, completion criteria — no method):
input and preconditions (decision 2), the task definition restated inline
because skills stand alone (decision 1), the wide-refactor exception
(decision 6), the pre-publish review (decision 3), the publishing shape
(decisions 4 and 7), and the execution contract (decision 5). Reading
GLOSSARY.md and docs/decisions/ and exploring the codebase before cutting is
part of input handling, as in write-plan.

## Assumptions

- This work's spec folder is `docs/specs/split-into-tasks/`.
- plugin.json: `./skills/split-into-tasks` joins the skills array,
  `./skills/draft-plan` becomes `./skills/write-plan`, keywords follow, and
  the version bumps from 0.12.0 (minor). Symlinks in `.claude/skills/`
  follow both changes; README's list and mermaid diagram follow; CLAUDE.md's
  naming examples and GLOSSARY.md's Plan entry swap draft-plan for
  write-plan.
- Task numbering restarts per spec folder; two digits suffice.
- The glossary term Draft (the interview discipline) is untouched by the
  rename; only the skill name drops the word.

## Deferred

- Evals for split-into-tasks: after first real usage, per repo practice.
- Parallel task execution across worktrees: the frontier makes it possible;
  no standing route until practiced runs exist (0005's rejection stands).
- A task-file template under templates/: only on observed format drift.

## Remaining risks

- Task-grain estimation is still a prediction: a task can overflow its
  session despite the sizing rule. Mitigation is re-cutting the remainder
  (decision 5), untested until first use.
- Status tracked inside task files depends on implementing sessions
  remembering to update it; a stale frontier misleads the next session.
- The published rename breaks name recall for installed users until they
  reinstall; skills.sh copies keep the old name until refreshed.
