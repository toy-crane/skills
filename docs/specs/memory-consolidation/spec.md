# Spec: A consolidation skill for the project's memory layer

**Status: draft — under review (2026-07-27).** The folder slug is provisional
and renames once the skill is named.

Source: [Four design principles for long-horizon agents](https://notes.toycrane.xyz/four-principles-for-long-horizon-agents/).
Principle 3 is the one this acts on. Memory is a promotion process, not
storage. The post gives it a name: *"During sleep, important parts are
transferred to long-term memory. This process corresponds to dreaming."*

## The problem

A project's durable memory lives in four documents with four lifecycles.

| Document | Lifecycle | Maintains itself? |
|---|---|---|
| `docs/decisions/` | append-only history | yes, by growing |
| `GLOSSARY.md` | permanent and current | no |
| `docs/specs/<slug>/` | per unit, retires when the work ships | no |
| `CLAUDE.md` | always loaded, the principle layer | no |

Only the first maintains itself, and it does so by growing. Nothing calls for
the other three. Seventeen records in, this repo shows the drift.

- **Volume.** A shape-idea session reads `CLAUDE.md` + `GLOSSARY.md` +
  every record: 61,238 characters, roughly 15k tokens, before the interview
  starts. `docs/decisions/` alone is 52,236 of that and grows monotonically.
- **Redundancy.** Five records cover one subject (naming: 0006, 0007, 0013,
  0015, 0016; 11,527 characters). Three cover another (prototype: 0001, 0003,
  0004). Two cover a third (planning: 0005, 0012). A session reads all of them
  and reconstructs the current rule itself.
- **Wrong content.** `clarify` appears in 6 records, `draft-plan` in 6,
  `to-plan` in 5, `write-spec` in 3. 0006 lists "write-spec, draft-plan,
  build-prototype" as the naming scheme's own examples; two no longer exist.
  A session reading 0001 believes a skill named `clarify` exists.
- **Numbering collided.** Two records are 0011. PRs #23 and #24 each computed
  "highest + 1" inside its own worktree, exactly as the template instructs.
- **Retirement never ran.** Six spec folders remain, all shipped work.
  `to-plan-skill/` and `clarify-visual-interview/` name skills that are gone.
- **The glossary compensates.** Its Spec folder entry ends with "Called
  'dossier' in records up to 0004", a job the records should do themselves.
- **Promotion happens by hand and has no name.** CLAUDE.md's "Skill naming"
  and "Skills stay thin" sections are principles lifted out of
  0006/0007/0013/0016 and 0009/0017. Nothing triggers this, so skipping it is
  invisible.

## Goal

An offline pass over the project's memory, run after work ships. It merges
what converged, promotes what a future session must know, and deletes what
the product outgrew.

## Decisions

### Position

1. **A separate published skill, not a mode of domain-modeling.**
   domain-modeling runs while you design. This runs after work ships. The
   post's own framing is the argument: consolidation is an offline phase, not
   something done awake. Per 0006 a user-invoked skill takes a verb-object
   name.

2. **Scope is whichever of the four documents exist.** This ships to other
   people's projects. `GLOSSARY.md` and `docs/decisions/` come from
   domain-modeling, `docs/specs/` from shape-idea, `CLAUDE.md` from the
   harness. Work on what is there and name what was absent.

3. **The skill edits; the diff is the review.** No proposal round, no
   pre-approval list. These are committed documents, so the review surface
   already exists and it is the diff. This follows 0014. Close with what
   changed and why.

### What may be edited

4. **The claim is fixed. The address is not.**
   This replaces "a record's body never changes".

   > Forbidden: any edit after which a sentence makes a different claim.
   > Allowed: any edit that only changes which record, file, or name a
   > sentence points at.

   Deleting `write-spec` from 0006 is forbidden: 0007 opens by arguing
   against that exact word, and 0013 cites 0007 doing it. Rewriting 0017's
   "0016 stands as the record of the naming decision" to say 0006 is
   allowed: the claim is unchanged, only the address moved.

### Merging

5. **A converged cluster of records merges into one.** Not pairwise, not
   record-by-record. The merged record holds the current rule and the
   rejected alternatives. It drops the sequence: which came first, which PR,
   which reversal.

6. **The merged record takes the lowest number in its cluster.** Absorbed
   numbers disappear and the sequence gets holes. Holes are fine; a number is
   an address, not an ordinal. Keeping the lowest means citations to it still
   resolve, and the merged record still contains the material they wanted.
   Citations to absorbed numbers are updated under decision 4.

7. **The rejected alternatives are the one thing that must survive.** A
   merged record that states only the current rule cannot do its job. Someone
   proposes `write-spec` again in six months and nothing answers them. The
   domain-modeling template already says this: record rejected alternatives
   when the rejection is non-obvious.

8. **What does not merge.**
   - A cluster still under debate. Merging picks a winner early.
   - A record whose body is itself reused: an eval's method, a measurement,
     a benchmark. 0009 and 0017 look like a cluster and are not. 0017's value
     is the procedure it ran, which the next pruning reuses.

### Promotion

9. **A decision earns a line in `CLAUDE.md` only when a session that never
   read the history would otherwise get it wrong.** The record keeps the
   reasoning. `CLAUDE.md` keeps the rule and a link. Recency and
   hard-won-ness earn nothing.

10. **`CLAUDE.md` has a line cap: 120 lines.** Without a cap promotion is
    one-way and the always-loaded file grows forever. With one, adding a
    principle means folding or dropping another. It is currently 94 lines, so
    the cap binds now. This is consolidate-memory's only enforcing mechanism
    and the reason its criteria are more than advice.

### Index

11. **`docs/decisions/README.md` is the index: one line per record, capped at
    40 lines.** The cap forces merging the way the CLAUDE.md cap forces
    promotion. At the current rate it starts binding in a few months.

### Retirement

12. **A spec folder for shipped work is deleted.** Git holds it. Read it
    before deleting: once it is gone you cannot tell whether it held
    something worth promoting.

13. **The glossary carries current terms only,** and no history note a record
    should carry.

### Form

14. **Thin, per 0009. No phases.** The skill states what each document
    promises, what merges and what does not, what earns promotion, and when
    it is done. consolidate-memory's criteria carry over. Its Phase 1/2/3
    scaffolding does not: reading the files you are about to edit is
    something the model does unprompted.

    The one ordering that matters is written as a constraint, not a phase:
    take what you need before you delete.

    No procedure has earned its place yet because this skill has never run.
    If the first runs show a repeated failure, the guard goes in then. 0017
    is the worked example of that process running in reverse.

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
> - `CLAUDE.md` is loaded by every session. It is capped, so a new line means
>   an old one folds or goes.
>
> Work on whichever exist. Name the ones that were absent.
>
> **Merge what converged.** When several records cover one subject and the
> subject has settled, they become one record holding the current rule and
> the rejected alternatives, and dropping the sequence. The merged record
> takes the lowest number of the group; the others are deleted and their
> citations updated. Do not merge a live debate, and do not merge a record
> whose body is itself reused — an eval's method, a measurement.
>
> **Promote what settled.** A decision earns a line in `CLAUDE.md` only when
> a session that never read the history would otherwise get it wrong. The
> record keeps the reasoning; `CLAUDE.md` keeps the rule and a link to it.
> Recency and hard-won-ness earn nothing.
>
> **Keep the index true.** `docs/decisions/README.md`, one line per record.
>
> Report what you cannot fix rather than forcing it: duplicate numbers, a
> supersession you cannot pin down, a cluster you could not tell had settled.
>
> You are done when no two records cover one settled subject, no spec folder
> describes shipped work, the glossary carries only current terms,
> `CLAUDE.md` is inside its cap and holds what earns it, and the index
> matches the folder. Close with what you changed, what you left, and why.

## First run on this repo

The first run is part of this work. It is also the only test the skill gets
before shipping.

```
docs/decisions/     52,236자 · 17개  →  약 31,500자 · 11개

  0001 + 0003 + 0004              8,219 → ~2,000   (프로토타입)
  0005 + 0012                     6,331 → ~1,800   (계획·분할)
  0006 + 0007 + 0013 + 0015 + 0016  11,527 → ~1,500 (이름)
  0002 0008 0009 0010 0011×2 0014 0017   26,159    (그대로)

  사라지는 번호: 0003 0004 0007 0012 0013 0015 0016
  0011 충돌: 둘 중 하나가 0018로 이동

docs/specs/         38,221자 · 6개   →  0개
CLAUDE.md            4,880자 · 94줄  →  0002가 올라감
docs/decisions/README.md  없음       →  새로 씀

세션이 매번 읽는 양   61,238자  →  약 40,900자  (-33%)
```

## Open points

- **The name.** `consolidate-memory` is taken by the bundled anthropic-skills
  skill. Two identical names in one listing is not shippable.
- **The trigger.** On demand only, or tied to the manual version bump in
  `plugin.json`?
- **The numbering scheme.** Fixing the 0011 collision is now cheap because the
  merge moves files anyway. The scheme that caused it ("highest + 1") lives in
  domain-modeling's template and is out of this scope, so the collision
  recurs whenever two worktrees add a record.

## Deferred

- **Narrowing shape-idea's read scope.** shape-idea currently reads all of
  `docs/decisions/`. Pointing it at the index plus `CLAUDE.md` would take the
  per-session read from ~40,900 to ~10,900 characters. It is only safe once
  promotion is known to be good enough, which takes one real run to find out.
  It also changes a different skill.
- **Evals**, after first real usage, per repo practice.

## Remaining risks

- **Promotion is a judgment call and decision 9 is untested.** A pass can
  promote too much and crowd the always-loaded file, or too little and leave
  the principle buried.
- **Merging is lossy on purpose, and the loss is judged by the same pass that
  performs it.** If a merged record drops a rejection reason, nothing catches
  it. This is the sharpest failure mode.
- **The clusters here were identified by hand in one session.** Whether a
  model finds the same boundaries unaided is unknown.
- **Links from outside the repo die** when a record number disappears. The
  sweep fixes in-repo links only.
- **One repo is a thin evidence base.** Every failure above was observed here.
