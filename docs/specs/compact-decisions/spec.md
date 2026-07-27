# Spec: The compact-decisions skill and domain-modeling's decision index

**Status: draft — under review (2026-07-27).**

Source: [Four design principles for long-horizon agents](https://notes.toycrane.xyz/four-principles-for-long-horizon-agents/).
Principle 3 is the one this acts on. Memory is a promotion process, not
storage. The post names the phase: *"During sleep, important parts are
transferred to long-term memory. This process corresponds to dreaming."*

Two pieces of work: a new published skill, `compact-decisions`, and a change
to `domain-modeling` that gives decisions an index.

## The problem

A project's durable memory lives in four documents with four lifecycles.

| Document | Lifecycle | Maintains itself? |
|---|---|---|
| `docs/decisions/` | append-only history | yes, by growing |
| `GLOSSARY.md` | permanent and current | no |
| `docs/specs/<slug>/` | per unit, retires when the work ships | no |
| `CLAUDE.md` | always loaded, the principle layer | no |

Only the first maintains itself, and it does so by growing. Seventeen records
in, this repo shows the drift.

- **Volume.** A shape-idea session reads `CLAUDE.md` + `GLOSSARY.md` + every
  record: 61,238 characters before the interview starts. `docs/decisions/`
  alone is 52,236 of that and grows monotonically.
- **Redundancy.** Five records cover naming (0006, 0007, 0013, 0015, 0016;
  11,527 characters). Three cover the prototype (0001, 0003, 0004). Two cover
  planning (0005, 0012). A session reads all of them and reconstructs the
  current rule itself.
- **Wrong content.** `clarify` appears in 6 records, `draft-plan` in 6,
  `to-plan` in 5, `write-spec` in 3. 0006 lists "write-spec, draft-plan,
  build-prototype" as the naming scheme's own examples; two no longer exist.
- **Numbering collided.** Two records are 0011. PRs #23 and #24 each computed
  "highest + 1" inside its own worktree, exactly as the template instructs,
  and the two new files never conflicted on merge.
- **Retirement never ran.** Six spec folders remain, all shipped work.
- **The glossary compensates.** Its Spec folder entry ends with "Called
  'dossier' in records up to 0004", a job the records should do themselves.
- **Promotion happens by hand and has no name.** CLAUDE.md's "Skill naming"
  and "Skills stay thin" sections are principles lifted out of
  0006/0007/0013/0016 and 0009/0017. Nothing triggers this, so skipping it is
  invisible.

Underneath all of it is one asymmetry. The glossary states what a term is now
and never argues. The records argue and never state the current position. So
the current position exists nowhere, and every session rebuilds it from
52,236 characters of history.

## Part one: domain-modeling gains a decision index

`docs/decisions/README.md`, one line per record, is a first-class artifact
alongside `GLOSSARY.md`.

```
용어   GLOSSARY.md          현재 · 짧음   ← 읽는 것
결정   README.md            현재 · 짧음   ← 읽는 것
근거   docs/decisions/      역사 · 김     ← 찾아가는 것
```

1. **The index line is written before the record.** One sentence stating what
   was decided. A decision that cannot be stated in one sentence has not
   settled yet. This is the point of the change: a test, in the same family
   as domain-modeling's other tests, not bookkeeping.

2. **The index and the folder always match.** Line format:
   `- [NNNN](NNNN-slug.md) — one sentence.`

3. **domain-modeling stays centred on the discipline**, not on the artifact.
   Challenging terms, sharpening fuzzy language, stress-testing with
   scenarios, and cross-referencing code remain the skill's substance. The
   index joins the file structure and the recording step; it does not become
   the skill's organizing idea.

4. **No cap and no notification in domain-modeling.** Caps belong to
   `compact-decisions` as its own completion criteria. Deciding when to
   compact is the user's call.

5. **Side effect, taken deliberately: the numbering collision becomes loud.**
   Two worktrees adding a record currently produce two files that never
   conflict. Once both must also append a line to one index file, git reports
   the conflict. The scheme ("highest + 1") is unchanged and still produces
   the collision; it stops being silent. Not airtight, since a sorted index
   can absorb both lines without conflicting, but free.

## Part two: the compact-decisions skill

### Position

6. **Name: `compact-decisions`.** Verb-object per 0006. `compact` names what
   the skill does now that merging is its centre: it makes the layer smaller.
   `consolidate-memory` was rejected because the bundled
   `anthropic-skills:consolidate-memory` already holds that name and targets
   the agent's own memory, leaving two similarly-described skills competing
   for one invocation.

7. **A separate skill, not a mode of domain-modeling.** domain-modeling runs
   while you design. This runs after work ships. The post's framing is the
   argument: consolidation is an offline phase, not something done awake.

8. **Trigger: invocation only.** No schedule, no cap watcher, no other skill
   suggesting it. The user decides when enough has shipped.

9. **Scope is whichever of the four documents exist.** This ships to other
   people's projects. Work on what is there and name what was absent.

10. **The skill edits; the diff is the review.** No proposal round, no
    pre-approval list. These are committed documents, so the review surface
    already exists and it is the diff. Follows 0014.

### What may be edited

11. **The claim is fixed. The address is not.**

    > Forbidden: any edit after which a sentence makes a different claim.
    > Allowed: any edit that only changes which record, file, or name a
    > sentence points at.

    Deleting `write-spec` from 0006 is forbidden: 0007 opens by arguing
    against that exact word and 0013 cites 0007 doing it. Rewriting 0017's
    "0016 stands as the record of the naming decision" to say 0006 is
    allowed: the claim is unchanged, only the address moved.

### Compacting

12. **A converged cluster of records becomes one record.** Not pairwise, not
    record-by-record. The merged record holds the current rule and the
    rejected alternatives, and drops the sequence: which came first, which
    PR, which reversal.

13. **The merged record takes the lowest number in its cluster.** Absorbed
    numbers disappear and the sequence gets holes. A number is an address,
    not an ordinal. Keeping the lowest means citations to it still resolve
    and still find their material. Citations to absorbed numbers are updated
    under decision 11.

14. **The rejected alternatives must survive.** A merged record stating only
    the current rule cannot do its job: someone proposes `write-spec` again
    in six months and nothing answers them. The domain-modeling template
    already requires this for non-obvious rejections.

15. **What does not compact.**
    - A cluster still under debate. Merging picks a winner early.
    - A record whose body is itself reused: an eval's method, a measurement.
      0009 and 0017 look like a cluster and are not — 0017's value is the
      procedure the next pruning run reuses.

### Promotion

16. **A decision earns a line in `CLAUDE.md` only when a session that never
    read the history would otherwise get it wrong.** The record keeps the
    reasoning. `CLAUDE.md` keeps the rule and a link. Recency and
    hard-won-ness earn nothing.

### Caps

17. **Two caps, both completion criteria of this skill.** `CLAUDE.md` at 120
    lines (currently 94, so it binds now) and `docs/decisions/README.md` at
    40 lines. Nothing watches them between runs. Without them the criteria
    above are advice: promotion becomes one-way and nothing forces a merge.
    This is the one enforcing mechanism carried over from consolidate-memory.

### Retirement

18. **A spec folder for shipped work is deleted.** Git holds it. Read it
    before deleting: once gone you cannot tell whether it held something
    worth promoting.

19. **The glossary carries current terms only,** and no history note a record
    should carry.

### Form

20. **Thin, per 0009. No phases.** consolidate-memory's criteria carry over;
    its Phase 1/2/3 scaffolding does not, because reading the files you are
    about to edit is something the model does unprompted. The one ordering
    that matters is written as a constraint: take what you need before you
    delete. No procedure has earned its place yet because this skill has
    never run; if the first runs show a repeated failure, the guard goes in
    then.

## Skill text contract

Draft body, to refine in place.

> The project's memory has drifted from the product. This runs after the work
> shipped, not during it.
>
> Four documents, four promises.
>
> - `GLOSSARY.md` is permanent and current. Rewrite it freely. Terms only,
>   and no history note a record should carry.
> - `docs/decisions/` is history. You may never edit a record so that a
>   sentence makes a different claim. You may always update which record,
>   file, or name a sentence points at.
> - `docs/specs/<slug>/` lives for one unit of work and is deleted once that
>   work ships. Take what you need before you delete.
> - `CLAUDE.md` is loaded by every session.
>
> Work on whichever exist. Name the ones that were absent.
>
> **Compact what converged.** When several records cover one subject and the
> subject has settled, they become one record holding the current rule and
> the rejected alternatives, and dropping the sequence. The merged record
> takes the lowest number of the group; the others are deleted and their
> citations updated. Do not compact a live debate, and do not compact a
> record whose body is itself reused — an eval's method, a measurement.
>
> **Promote what settled.** A decision earns a line in `CLAUDE.md` only when
> a session that never read the history would otherwise get it wrong. The
> record keeps the reasoning; `CLAUDE.md` keeps the rule and a link to it.
> Recency and hard-won-ness earn nothing.
>
> Report what you cannot fix rather than forcing it: duplicate numbers, a
> supersession you cannot pin down, a cluster you could not tell had settled.
>
> You are done when no two records cover one settled subject, no spec folder
> describes shipped work, the glossary carries only current terms,
> `docs/decisions/README.md` matches the folder and fits 40 lines, and
> `CLAUDE.md` fits 120 lines and holds what earns it. Close with what you
> changed, what you left, and why.

## First run on this repo

Part of this work, and the only test the skill gets before shipping.

```
docs/decisions/     52,236자 · 17개  →  약 31,500자 · 11개

  0001 + 0003 + 0004                 8,219 → ~2,000   (프로토타입)
  0005 + 0012                        6,331 → ~1,800   (계획·분할)
  0006 + 0007 + 0013 + 0015 + 0016  11,527 → ~1,500   (이름)
  0002 0008 0009 0010 0011×2 0014 0017     26,159     (그대로)

  사라지는 번호: 0003 0004 0007 0012 0013 0015 0016
  0011 충돌: 둘 중 하나가 0018로 이동

docs/specs/         38,221자 · 6개   →  compact-decisions/ 하나만 남음
CLAUDE.md            4,880자 · 94줄  →  0002가 올라감
docs/decisions/README.md  없음       →  11줄

세션이 매번 읽는 양   61,238자  →  약 40,900자  (-33%)
```

## Files this work touches

- `skills/compact-decisions/SKILL.md` — new
- `skills/domain-modeling/SKILL.md` — file structure and the recording step
- `.claude-plugin/plugin.json` — skills array, keywords, version bump
- `.claude/skills/compact-decisions` — symlink
- `README.md` — skill list and diagram
- `docs/decisions/` — one ADR for this work, then the first run's compaction
- `GLOSSARY.md` — Decision index, Record cluster (both written in the
  shaping session)

## Deferred

- **Narrowing shape-idea's read scope.** shape-idea reads all of
  `docs/decisions/` today. Pointing it at the index plus `CLAUDE.md` takes
  the per-session read from ~40,900 to ~10,900 characters. Safe only once
  promotion is known to be good enough, which takes one real run to find out.
  It also changes a different skill.
- **The numbering scheme itself.** "Highest + 1" still collides under
  parallel worktrees; the index only makes it visible.
- **Evals**, after first real usage, per repo practice.

## Remaining risks

- **Compaction is lossy on purpose, and the loss is judged by the same pass
  that performs it.** If a merged record drops a rejection reason, nothing
  catches it. Decision 14 is the only defense and it is self-checking. This
  is the sharpest failure mode.
- **Promotion is a judgment call and decision 16 is untested.**
- **The clusters here were identified by hand in one session.** Whether a
  model finds the same boundaries unaided is unknown.
- **Links from outside the repo die** when a record number disappears.
- **One repo is a thin evidence base.** Every failure above was observed here.
