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
    - **A cluster already at its minimum.** If listing the cluster's rejected
      alternatives on their own takes about as much room as the records
      themselves, there is no redundancy left to squeeze and compacting would
      only lose things. Leave it and say so.

16. **The ledger is built before every compaction, and it is what decides
    whether to compact.** Not a test artifact — the input. Extract the
    cluster's rejected alternatives, measure them against the records, and
    compact only if decision 15's third test passes. This is why decision 14
    needs no exemption: a cluster whose rejections cannot all survive is a
    cluster that does not get compacted.

    Extraction under-reads by default. `## Considered Options` headings are
    the easy two thirds; the rest sit in body prose and consequences as bare
    negatives, as an earlier record's position being overturned, or as a
    rejected mechanism rather than a rejected name. Re-read for those before
    trusting a count.

### Promotion

17. **A decision earns a line in `CLAUDE.md` only when a session that never
    read the history would otherwise get it wrong.** The record keeps the
    reasoning. `CLAUDE.md` keeps the rule and a link. Recency and
    hard-won-ness earn nothing.

### Caps

18. **Two caps, both completion criteria of this skill.** `CLAUDE.md` at 120
    lines (currently 94, so it binds now) and `docs/decisions/README.md` at
    40 lines. Nothing watches them between runs. Without them the criteria
    above are advice: promotion becomes one-way. Note the index cap can no
    longer force a merge on its own, since decision 15 can refuse one; when
    both bind, report it rather than compacting a minimal cluster to fit.

### Retirement

19. **A spec folder for shipped work is deleted.** Git holds it. Read it
    before deleting: once gone you cannot tell whether it held something
    worth promoting.

20. **The glossary carries current terms only,** and no history note a record
    should carry.

### Form

21. **Thin, per 0009. No phases.** consolidate-memory's criteria carry over;
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
> every rejected alternative, and dropping the sequence. The merged record
> takes the lowest number of the group; the others are deleted and their
> citations updated.
>
> Before compacting anything, list the cluster's rejected alternatives and
> weigh them against the records. If stating them on their own takes about as
> much room as the records do, the records are already at their minimum:
> leave them alone and say so. That list is what decides, so build it
> carefully — the `## Considered Options` headings are the easy part, and the
> rest hide in body prose and consequences as bare negatives, as an earlier
> position being overturned, or as a rejected mechanism rather than a
> rejected name.
>
> Also leave alone a live debate, and a record whose body is itself reused —
> an eval's method, a measurement.
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

Part of this work. Expect it to compact little or nothing.

The ledger was extracted before writing this: 148 entries across the three
clusters, about 34,200 characters stated independently, against 26,077
characters of source records. **The ledger is larger than the records it came
from.** Under decision 15's third test these clusters are already at their
minimum and do not compact. That is the skill working, not failing.

The 148 is an upper bound. The omission pass was told to assume it had missed
something, which biases toward over-collection, and it flagged some of its own
finds as double-counted or not real rejections. The true count sits somewhere
between the 40 a first hand-count found and 148. Around 90 would put the
clusters back inside the test. Decision 16 exists so a run measures this
instead of inheriting a guess.

```
docs/decisions/     52,236자 · 17개  →  압축은 아마 0. 번호 충돌만 해소.
docs/specs/         38,221자 · 6개   →  compact-decisions/ 하나만 남음
CLAUDE.md            4,880자 · 94줄  →  0002가 올라감 (약 +400자)
GLOSSARY.md          4,952자         →  그대로
docs/decisions/README.md  없음       →  17줄 · 약 2,200자

세션이 매번 읽는 양   62,068자  →  약 64,700자   (+4%)
```

**If nothing compacts, this run makes the per-session read slightly larger.**
The index and the promoted section are new bytes and nothing came out. Say so
plainly rather than reporting a saving that did not happen.

The value of the run is correctness, not size. After it, the project's current
position on each decision is stated once in the index instead of being
reconstructed from 52,236 characters of argument, and the reconstruction is
where a session picks up a skill name that no longer exists. The size win is
entirely in the deferred item below, and the index is its precondition.

## How this is tested

The passing condition is **loss-free, not boundary-matching**. The cluster
boundaries above were drawn by hand in one session; a run that cuts them
differently is not thereby wrong. What a run may never do is lose a rejected
alternative or compact a subject still under debate.

**Why the test set is almost entirely absence checks.** A diff shows what
changed. It does not show what went missing. A merged record that dropped one
rejection reason reads, in the diff, as five files becoming one — exactly what
success looks like. Decision 10 makes the diff the review, so the tests exist
to cover the one thing the diff cannot.

**Declining to compact is a pass.** Under decision 15 the correct answer on
these three clusters is probably to leave them alone. A run that compacts
anyway and loses entries fails; a run that reports "already minimal, left
alone" and says why succeeds, even though the diff is nearly empty.

### The rejection ledger

Written before any run, from the cluster records as they stand, at
`docs/specs/compact-decisions/rejection-ledger.md`. Every entry is an
alternative some record ruled out, named tersely enough to grep for.
Extraction ran per cluster and was then re-read by a second pass whose only
instruction was to find what the first missed, because under-reading body
prose is the predictable failure — that pass added 35 of the 148 entries.

The ledger serves two purposes and they are different. It is the answer key
for whether a compacted record lost anything. It is also the pre-registered
comparison for decision 16: a run builds its own ledger, and how close that
comes to this one is the measurement of whether a model can do this step
unaided. A run that finds 40 entries and concludes the clusters compact has
failed the extraction, not the compaction.

### Mechanical checks

1. No dangling reference: every `NNNN` cited in any surviving document
   resolves to a file that exists.
2. No duplicate record numbers.
3. `docs/decisions/README.md` has one line per record and fits 40 lines.
4. `CLAUDE.md` fits 120 lines.
5. No spec folder names work already shipped into `skills/`.

### Read checks, fixed before the run

6. If a cluster was compacted, every rejection-ledger entry for it survives.
   This is the test; the rest is trim.
7. If a cluster was not compacted, the run said which and why, in ledger
   terms. Silence is a fail — an untouched folder must be a decision, not an
   omission.
8. The run's own ledger is within range of the pre-registered one. Forty
   entries means it read only the headings.
9. 0009 and 0017 are still two records. They look like a cluster and are not.
10. `CLAUDE.md` gained the lifecycle rule and nothing else.

Nothing here catches promoting too little. Check 10 catches an over-full
`CLAUDE.md`, not an under-full one, and no fixture exists for the omission.

### How runs are staged

Git makes a run cheap to discard, so this is not a one-shot. Runs happen in
throwaway worktrees off one commit and are compared.

- **Blind run.** A session given `SKILL.md` and the repo, and not this spec.
  It has to find the clusters and build its own ledger. This is the run that
  tests judgment and it is the one that matters. The expected correct
  behaviour is now specific: extract enough rejections to see that the
  clusters are at their minimum, then decline to compact them and report it.
  A run that cheerfully merges five naming records into one is the failure
  this test exists to catch.
- **Guided run.** A session given this spec. The clusters and the verdict are
  handed to it, so only execution is under test: the index, the promotion,
  the spec-folder deletions, the 0011 renumber.

Repeat the blind run rather than trusting one, per 0017's practice of
answering each prompt twice. Judgment about whether to compact is exactly the
kind of call that varies between runs, and it is the call that decides whether
records get destroyed.

## Files this work touches

- `skills/compact-decisions/SKILL.md` — new
- `skills/domain-modeling/SKILL.md` — file structure and the recording step
- `.claude-plugin/plugin.json` — skills array, keywords, version bump
- `.claude/skills/compact-decisions` — symlink
- `README.md` — skill list and diagram
- `docs/decisions/` — one ADR for this work, then the first run's compaction
- `docs/specs/compact-decisions/rejection-ledger.md` — the pre-registered
  ledger, written in the shaping session so it precedes every run
- `GLOSSARY.md` — Decision index, Record cluster (both written in the
  shaping session)

## Deferred

- **Narrowing shape-idea's read scope. This is where the entire size saving
  now lives.** shape-idea reads all of `docs/decisions/` today. Pointing it
  at the index plus `CLAUDE.md` takes the per-session read from ~64,700 to
  ~12,400 characters. Compaction was supposed to carry part of that and on
  this repo it carries none, which raises rather than lowers the priority of
  this item. Safe only once promotion is known to be good enough, which takes
  one real run to find out. It also changes a different skill.
- **The numbering scheme itself.** "Highest + 1" still collides under
  parallel worktrees; the index only makes it visible.
- **Evals**, after first real usage, per repo practice.

## Considered and rejected

- **Split the rejections into names and reasons: keep every name, keep the
  reason only where the rejection is non-obvious.** It rescued the
  compression ratio (26,077 → ~9,500) and made the check fully mechanical, so
  it was tempting. Rejected as a rule fitted to one measurement. Its stated
  ground was that domain-modeling's template already says to record rejections
  "when the rejection is non-obvious", but the template applies that bar when
  a record is *written*: everything in a Considered Options list already
  passed it. Re-applying it while compacting is not restoring a qualifier, it
  is overruling the record's author. Decision 15's third test does the same
  job without touching what a rejection is worth.
- **Weakening decision 14 to "the rejections that matter must survive."** Same
  objection with less to show for it: it makes the passing condition a
  judgment the compacting pass grades itself on.

## Remaining risks

- **Decision 15's third test is a ratio with no calibration.** "About as much
  room as the records" is doing real work and has been measured exactly once,
  on a repo whose answer we already believed. A run could clear it on a
  cluster that should have been left alone.
- **Extraction quality decides everything downstream.** A pass that reads only
  the `## Considered Options` headings undercounts by roughly a third here,
  and an undercount reads as "this cluster compacts". The ledger catches this
  on the first run because it was written in advance; on later runs, or
  another repo, nothing does.
- **Promotion is a judgment call and decision 17 is untested.** Nothing in the
  test set catches promoting too little.
- **The skill's headline motion may never fire on the repo that motivated
  it.** Compaction is justified by reasoning, the index and promotion by
  observed failures. Shipping a motion whose only evidence is that it did not
  apply here is a real gap; the first run on a repo with architecture-style
  records is what would close it.
- **Links from outside the repo die** when a record number disappears.
- **One repo is a thin evidence base.** Every failure above was observed here,
  and the ledger is drawn from the same seventeen records the skill was
  designed against.
