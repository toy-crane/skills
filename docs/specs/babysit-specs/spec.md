# Babysit specs

## User-visible outcomes

- A user who queued several spec folders and has just shipped one can invoke
  `babysit-specs` and get every remaining spec brought back in line with what
  shipped. Staleness that preserves the approved meaning is fixed without a
  question. Staleness that would change what the user approved is settled one
  question at a time, each with a recommended answer.
- A user who never runs `babysit-specs` still does not lose work. Before
  `implement` changes source for an outcome, it compares the spec against the
  current repository and stops on a stale point that would change the approved
  contract, naming the point and the route to fix it.
- The user ends a `babysit-specs` run with a report: what was updated without a
  question and why, what was asked and how it settled, which specs now look
  fully delivered, and which task files or prototypes still need a follow-up
  pass.
- `shape-idea` does not grow. Its text, evals, and metadata are unchanged.

## Decision contracts this work depends on

- `docs/decisions/pipeline.md`: `implement` loads only the selected folder and
  what it links, pauses for a shaping decision when a discovery would change
  the approved contract, and owns reconciliation inside one work unit. Its
  rejected alternative "a separately invoked reconciliation or convergence
  skill" is reworded by this work to that within-work-unit boundary.
- `docs/decisions/shape-idea.md`: the settlement rule, the eight fields of the
  product contract, one question at a time with a recommendation, the write
  boundary, the link obligation, and the deferred-point interim marking. These
  are the rules `babysit-specs` restates inline because it may be installed
  alone.
- `docs/decisions/skill-design.md`: every published skill is self-sufficient; a
  fixed procedure names an observed failure; trigger conditions live in the
  description; UI metadata matches the skill.
- `docs/decisions/skill-naming.md`: an invoked skill takes a verb-object name
  checked against built-in commands in Claude Code and Codex.
- `docs/decisions/document-lifecycles.md`: a spec folder carries one unit of
  work, Git is the only archive, and `maintain-project-context` retires shipped
  folders.
- `docs/decisions/skill-layout.md`: a technology-independent practice lives
  under `skills/workflow/` and is exposed through both symlink directories.

## Approved scope

### A new invoked skill revises active specs against what shipped

`babysit-specs` takes one or more `docs/specs/<slug>/` folders. With none
named, it takes every folder present under `docs/specs/`. For each spec it
reads `spec.md`, the active task files, and the prototype and decision
contracts the spec links.

The baseline for "what changed" is the spec's last commit, including a
previous `babysit-specs` revision. The skill establishes what changed since
that commit from the repository's Git history and from the current behavior of
the surfaces the spec names. A sibling spec folder that has disappeared since
the baseline is read as shipped. It then compares every field of the contract
against that current truth and lists only the points that no longer hold:
an assumption that is no longer true, an acceptance criterion the shipped
work already satisfies, a constraint the current code contradicts, a term or
pattern the shipped work introduced that this spec should now use, and a
linked prototype that no longer matches the current surface.

### Staleness is triaged by meaning, not by cost

A point whose correction preserves what the user approved is updated in place,
marked as an agent-chosen assumption the user can override, and listed in the
report with its reason. A renamed term, a criterion another work unit already
delivered, a moved path, and a link that points at a retired folder are
examples. The product the user gets does not change, even though approved text
does.

A point whose correction would change what the user approved is settled by one
question with a recommended answer and a concise reason, then the skill waits.
An outcome the shipped work makes redundant or impossible, a design the shipped
work's new pattern contradicts, a constraint the shipped code breaks where the
break may have been intentional, and an off-limits area the shipped work
entered are examples. Decisions the shipped work does not touch are not
reopened.

The shape-idea rule that decides cheap, reversible choices without asking is
about new choices. Applied to revision it would ask on almost every touch of
approved text and defeat the purpose of the skill, so the triage axis here is
whether the meaning survives, not whether the edit is cheap.

### Writes stay inside the spec folder

The skill rewrites `spec.md` in place under the same slug. It adds no change
log section or revision file; Git holds the history. It never edits product
source, configuration, or dependencies in the target repository, and any
experiment it needs runs in a scratch directory outside the working tree.

Task files are named, not edited. When a revised outcome reaches a task, the
report names that task for `split-into-tasks` to re-cut. When a completed task
delivered an outcome the revision changed, its evidence is left untouched and
the task is named so `implement` re-verifies it. A linked prototype that no
longer matches the current surface is regenerated for the affected screens
through `build-prototype` when that skill is available; otherwise the drift is
recorded as a remaining risk in the spec.

A spec whose acceptance criteria all pass against the current repository is
reported as a retirement candidate. The skill does not delete it; retirement
stays with `maintain-project-context` or the user.

A revision that settles a choice future work should reuse is routed through
`project-knowledge` when that skill is available and written to its decision
contract directly when it is not.

### The skill stands alone

Because `shape-idea` may be absent from the install, `babysit-specs` carries
inline: the settlement rule that a choice is settled only when the user confirms
it or it is made under explicitly delegated authority; one question at a time
with a recommended answer; the distinction between an assumption and a settled
constraint; the write boundary above; the eight fields of the product contract
so a rewritten spec keeps its shape; the obligation to preserve the spec's links
to its approved prototype and decision contracts; and the rule that a deferred
point's interim behavior is marked interim wherever the contract restates it.
It refers to no other skill's text.

### `implement` checks for staleness before it changes source

Before changing source for an outcome, `implement` compares the spec's
assumptions, settled constraints, and acceptance criteria against the current
repository state and the Git history since the spec's last revision. A
mismatch that would change an approved outcome, acceptance criterion,
off-limits area, or product constraint stops the outcome before any source
change, names the stale point, and routes it to `babysit-specs` when that
skill is available. The existing inline fallback, presenting the exact decision
for the user to settle through shaping, remains for installs without it.

The existing handling of a discovery made in the middle of implementation is
unchanged: preserve the current artifacts and evidence, block the affected
outcome and its dependents, and stop. This work adds the check at the start,
where a stale spec costs nothing yet.

### Three neighbors route by what they touch

- `shape-idea` turns a problem and direction into a new spec.
- `babysit-specs` revises the behavior of active specs against what shipped
  since they were written.
- `maintain-project-context` runs hygiene: in active specs it touches only
  links and terms already confirmed elsewhere, and it retires shipped folders.

The `babysit-specs` description closes with the redirects to the other two.
The `maintain-project-context` description gains one clause redirecting
behavior revision of an active spec to `babysit-specs`. A trigger eval
separates the three on realistic prompts.

### Aligned surfaces

- `skills/workflow/babysit-specs/SKILL.md`, `agents/openai.yaml`,
  `evals/evals.json`, and `evals/trigger-evals.json`: new.
- `skills/workflow/implement/SKILL.md` and `evals/evals.json`: the load-time
  staleness check and the `babysit-specs` route with its inline fallback.
- `skills/workflow/maintain-project-context/SKILL.md`: the redirect clause in
  its description.
- `docs/decisions/pipeline.md`: `babysit-specs` enters the pipeline as the
  owner of cross-work-unit spec revision; the `implement` load-time check is
  recorded; the rejected alternative about a separately invoked reconciliation
  skill is reworded to the within-work-unit boundary; the discarded-work case
  below is preserved as evidence.
- `docs/decisions/skill-naming.md`: a `babysit-specs` entry with the name
  evidence below.
- `docs/decisions/document-lifecycles.md`: the spec-folder line names
  `babysit-specs` as the reviser of an active spec.
- `GLOSSARY.md`: the `Spec` entry says the contract is revised by
  `babysit-specs` after other work ships.
- `.claude-plugin/plugin.json`: the skill's path in `skills`, a keyword, and a
  version bump.
- `.agents/skills/babysit-specs` and `.claude/skills/babysit-specs`: symlinks
  to `../../skills/workflow/babysit-specs`.
- `README.md`: the skill's entry in the workflow list.
- `claude plugin validate . --strict` passes after the manifest change.

`skills/workflow/shape-idea/`, `build-prototype`, `split-into-tasks`,
`project-knowledge`, `tdd`, and `resolve-follow-ups` show no diff from this
work. The new skill carries no companion agents.

## Observable acceptance criteria

- `skills/workflow/babysit-specs/SKILL.md` exists, `plugin.json` lists its
  path, both symlink directories resolve to it, `README.md` links it, and
  `claude plugin validate . --strict` passes.
- The skill's description states its input, says it revises active specs
  against what shipped since they were written, and closes by redirecting a
  new spec to `shape-idea` and hygiene or retirement to
  `maintain-project-context`.
- The skill text states the baseline as the spec's last commit and the
  comparison against Git history since it plus the current behavior of the
  named surfaces.
- The skill text states the meaning triage: a meaning-preserving point is
  updated in place, marked as an overridable assumption, and reported with its
  reason; a meaning-changing point is settled by one question with a
  recommended answer before the skill continues; untouched decisions are not
  reopened.
- The skill text states the write boundary: `spec.md` in place, no change log,
  no product source, task files named rather than edited, prototype drift
  routed to `build-prototype` or recorded as a risk, and fully delivered specs
  reported rather than deleted.
- The skill text restates inline every obligation listed under "The skill
  stands alone" and refers to no other skill's text.
- The skill's closing report lists silent updates with reasons, asked
  decisions with their outcomes, retirement candidates, and tasks or
  prototypes awaiting a follow-up pass.
- A forward eval on a fixture with one shipped spec and one stale sibling shows
  the run updating the meaning-preserving points without a question, asking
  exactly one question for the meaning-changing point, writing no product
  source, and ending with that report.
- `implement`'s text says that before changing source for an outcome it
  compares the spec's assumptions, constraints, and acceptance criteria against
  the current repository and Git history since the spec's last revision, and
  that a meaning-changing mismatch stops before source changes, names the
  point, and routes to `babysit-specs` with the inline shaping fallback. Its
  mid-implementation preserve-and-block text is unchanged.
- A forward eval on a fixture whose spec is stale shows `implement` stopping
  before any source change and naming the stale point.
- A blind trigger eval routes new-spec prompts to `shape-idea`,
  revise-after-ship prompts to `babysit-specs`, and hygiene or retirement
  prompts to `maintain-project-context`.
- `pipeline.md`, `skill-naming.md`, `document-lifecycles.md`, and
  `GLOSSARY.md` carry the changes listed under aligned surfaces.
- `skills/workflow/shape-idea/` shows no diff from this work.

## Settled constraints and rationale

- Revision is a separate invoked skill, not a `shape-idea` entry point. The
  user's reason is to keep `shape-idea` from growing; a revision entry would
  have added a section to a skill whose text competes with the user's task for
  context. Confirmed by the user this session. The pipeline's rejection of a
  separately invoked reconciliation skill was about alignment inside one work
  unit, where optional invocation would make correctness optional. That
  boundary stays with `implement`. Cross-work-unit revision is invoked
  separately, and the `implement` load-time check is what keeps correctness
  from depending on anyone remembering to run it.
- The name is `babysit-specs`. The user chose it over `revise-spec`. Claude
  Code 2.1.267 contains `babysit-prs` only as the placeholder example in its
  `/loop` skill's description and input field, not as a shipped command, and
  Codex 0.147.0 contains nothing under the name. So the name collides with no
  built-in, and the "babysit-something" grammar is one Claude Code users have
  already seen. Confirmed by the user this session.
- The triage axis is meaning, not cost. The cheap-and-reversible rule governs
  new choices during shaping; applied to revision it would ask on almost every
  edit to approved text, which removes the reason the skill exists. The
  meaning axis lets the skill fix what does not change the product and ask
  about what does.
- `implement` gains a fixed check because of an observed failure. The user
  reported an implementation session that discovered mid-way that its spec was
  stale and discarded all the work it had done. A check before the first source
  change would have stopped it at zero cost. The check compares against the
  current repository rather than reading sibling folders, so `implement`'s
  boundary of loading only the selected folder is unchanged.
- `spec.md` is rewritten in place with no change log. Git is the only archive,
  and a spec that carries its own history grows with every revision while the
  reader wants only the current contract.
- `babysit-specs` names task files and never edits them. `split-into-tasks`
  owns the breakdown and its supersession rules; a second writer would drift
  from them.
- Retirement stays with `maintain-project-context`. `babysit-specs` can see
  that a spec is fully delivered, but deleting a folder is the hygiene pass's
  confirmed action, and reporting keeps one owner for it.

## Assumptions

Agent-chosen defaults, overridable.

- With no folder named, the skill takes every folder present under
  `docs/specs/`. Naming folders restricts the run to those.
- The baseline is the spec's last commit. A spec with uncommitted edits is
  compared from its last committed version, and the report says so.
- When `split-into-tasks` is absent, affected tasks are still named in the
  report and not edited.
- When `build-prototype` is absent, prototype drift is recorded as a remaining
  risk in the spec rather than regenerated.
- The report is given in conversation. No report file is written.
- Whether the redirect clause in `maintain-project-context`'s description is
  needed is settled by the trigger eval; if the three skills separate without
  it, implementation may drop the clause.
- Section order and length of the new skill text, and its Codex UI metadata
  wording, are implementation's call as long as the obligations above are
  present.
- The `implement` check reads the Git range since the spec's last revision;
  how it summarizes that range is implementation's call.

## Off-limits

- `skills/workflow/shape-idea/` in full: text, evals, fixtures, and metadata.
  The user's reason for a separate skill is that this one does not grow.
- `build-prototype`, `split-into-tasks`, `project-knowledge`, `tdd`, and
  `resolve-follow-ups`: unchanged. The new skill invokes the first three by
  name when available and carries its own fallback.
- Product source in the target repository: `babysit-specs` never edits it.
- A change log section, revision file, roadmap, or run-state file: excluded.
  Git and the spec folder already carry what is needed.
- Automatic invocation: no hook, loop, or `implement` close-out that scans
  sibling folders. `implement` keeps loading only the selected folder.
- Companion agents for the new skill: none.

## Deferred points

- Whether `implement`'s closing report should mention that other spec folders
  remain and suggest `babysit-specs`. This would make `implement` aware of
  sibling folders, which its boundary currently forbids. Interim behavior:
  `implement` stays unaware of siblings and the load-time check is the safety
  net. Reopen if users repeatedly forget to run `babysit-specs` and the check
  keeps catching stale specs only at the next implementation.

## Remaining risks

- The meaning triage is a judgment. A run may classify a meaning-changing
  point as meaning-preserving and update it without asking. The report lists
  every silent update with its reason and each is marked as an overridable
  assumption, so the user can reverse it, but only if they read the report.
- Routing between three neighboring skills is unreliable when the user does
  not invoke by name; the recorded routing suite activated only 25 of 56
  positive prompts implicitly. Direct invocation is the reliable route, and
  the trigger eval measures the rest.
- The `implement` check reads Git history on every outcome. In a busy
  repository it may stop on changes that do not touch the spec's meaning.
  Reconsider the check's scope if it repeatedly stops on non-issues.
- With the all-folders default over many specs, a run can become a long
  interview. One question at a time still applies, and naming folders bounds
  the run.
- A spec that was never committed has no baseline, so the comparison falls back
  to the current state alone and may miss a change.
