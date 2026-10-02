---
name: merge
description: Carry the current repository change through a verified GitHub pull request merge into the requested base, or the repository's remote default branch when none is named, then clean up only the merged worktree, releasing its resources through the project's declared cleanup commands. Always use this skill for an actual PR merge or its post-merge cleanup, including requests to inspect, finish, land, or merge an existing PR; create a PR and merge it; preserve meaningful commits; or clean up an already-merged worktree. Report an existing merge instead of duplicating it. A sweep of a repository's accumulated worktrees belongs to clean-worktrees.
---

# Merge pull request

Carry the current request's change through a pull request, verified merge, and
safe local cleanup. Complete the necessary commit, synchronization, publication,
and PR work, using the available `pull` skill for base synchronization.

Start from current remote truth. Preserve unrelated work, commit only the
request's changes as logical Conventional Commits, resolve the named base or
the remote's advertised default branch. If the change or its pull request is
already merged, verify and report that outcome instead of creating another one.
For an existing open PR, fetch its current head and synchronize the checkout
with it, preserving both the observed remote commits and in-scope local work.
If their intended combination is unclear, report the blocker before rebasing
or publishing. Then invoke `pull` with that resolved remote and base before verification,
publication, and creating or updating the ready-for-review PR. If `pull` is
unavailable, fetch that base and rebase the current checkout onto it when it is
not already included in HEAD. Preserve unrelated local work; do not silently
commit, stash, or discard it to make synchronization possible. Resolve conflicts
only when the intended result is established; otherwise keep the work
recoverable and report the blocker. Verify the resulting HEAD before publication,
and publish rewritten history only against the remote PR branch state just
observed.
When the repository's `AGENTS.md` or `CLAUDE.md` carries an `## Issue tracker`
section, read its linked detailed convention when present; legacy inline
conventions also work, without a separate setup skill installation. Without
the section, skip every issue step in this skill. For a configured tracker,
read the `Spec-Folder: docs/specs/<slug>/` trailers from the branch's commits
before merging, while the branch still exists and before a squash can drop
them, and keep those folders for the steps below.

Before creating or updating the PR, gather the spec folders it carries: every
`docs/specs/<slug>/` folder the branch adds or changes, and every folder a
trailer names, that still exists at the head; skip deleted folders. A folder's
`spec.md` names its issue with an `Issue: <tracker>:<id>` line; use that ID and
create nothing. For each gathered folder without that line, create one issue
through the convention's create operation: the title is the first heading of
`spec.md` with no prefix, the body is one spec section rendered from
`spec.md` between the convention's spec section markers, and the issue
carries the convention's review signal. The section
holds the first section's text, the remaining section headings, the folder
path, and the issues of folders its `Blocked by: docs/specs/<other>/` lines
name, read from their own `Issue:` lines; report a blocker folder that has
none. Write `Issue: <tracker>:<id>` in the convention's ID form beside the
spec's other links and commit it on the same branch before publishing. Never
search the tracker by title to find or reuse an issue. If the issue was
created but the line could not be committed, stop before merging and report
the created ID so a rerun records it instead of creating another.

Put an `Issue: <tracker>:<id>` line in the PR body for each linked issue, so
later reconciliation can find the PR after a squash merge; a direct fix of a
known issue without a spec folder carries the same line. Put the convention's
closing reference in a PR body only when its diff and verification show
implementation delivery; a trailer or `Issue:` line alone is insufficient. A
spec-only PR links its issue without closing it.

If a linked convention cannot be read, report the missing information rather
than guessing issue operations or claiming that the issue was linked or closed.

## Make the body understandable

When creating or updating an open PR, write for a reviewer without the
conversation history: explain the problem, concrete before-and-after behavior,
why it changed, and what verification establishes. Scale the explanation to the
change; a typo fix needs only a brief description and relevant validation.
Include mechanisms, a diagram for complex flows, actual alternatives and
trade-offs, affected users or integrations, and specific unresolved judgments
when they help assess the change. Keep the whole change understandable beyond
those highlighted judgments; omit empty sections and invented alternatives or
questions.

For screen changes, capture the actual base and head at matching viewport,
data, and state, or reuse evidence verified to match those revisions. Embed
before-and-after screenshots side by side in the body, with a short explanation
of the difference and its reason. Identify the revisions, screen and capture
conditions, including unavoidable differences. Add actual interaction video
when still images cannot explain the important behavior. Separate observed
results from source inference and unverified states; a prototype is not runtime
evidence. When updating an existing PR, bring its explanation and evidence into
line with the final change, replacing outdated visual claims.

Before uploading, inspect screenshots and videos for credentials, personal
data, and private information. Use safe seeded data or redact those details
throughout the media, keeping comparison conditions and the relevant change
visible. Upload only the inspected, safe media as GitHub attachments, using a
supported mechanism in the current environment. For GitHub CLI, check attachment support: `gh pr create` and
`gh pr edit` accept repeatable `--attach` on supported versions and rewrite
matching local image references in `--body-file` to uploaded URLs. A Markdown
table can place the two images side by side. Keep review captures outside
repository history; no separate image host is needed.

If baseline execution, capture, or upload is unavailable, state the exact limit
and present only the evidence obtained. Inspect the resulting remote body and
attachments before reporting them as available to reviewers; a local path is
not a published image. A partial upload may still create the PR: inspect and
repair that PR instead of duplicating it. Carry successful attachment URLs from
the remote body into its replacement, and replace unusable local references
with an honest limitation if recovery fails.

## Merge and clean up

Preserve multiple commits with a rebase merge only when they are meaningful,
independent units worth retaining in the base branch; use a squash merge
otherwise.
If GitHub cannot rebase-merge the pull request because its commits conflict
with the base, repeat the `pull` synchronization above on the PR branch.
Resolve conflicts when the intended combined result
is established, preserve unrelated local work, and publish rewritten history
only against the PR branch state just observed. If intent is unclear or the
remote branch changed unexpectedly, keep the PR open and report the blocker.

After updating the PR head, use only verification of the current head; earlier
CI results do not verify the new commit. Finish relevant checks that GitHub
does not require before allowing a merge. Enable auto-merge only when the
repository permits it, GitHub enforces checks against the current base (for
example, by requiring branches to be up to date or using a merge queue), and
only GitHub-enforced requirements remain pending. Verify that it is enabled,
then wait for the remote to report `MERGED`. If current-base verification is
not enforced, auto-merge is unavailable, or the PR is already mergeable, finish
its relevant CI and required checks and reviews, then merge directly with the
chosen method after rechecking the current head and base. `gh pr merge --auto`
can merge an already-mergeable PR immediately;
it is not a general wait flag. If enabling auto-merge fails, reassess the PR
and use direct merge only after its verification and requirements pass.

While waiting, recheck the current head, base, relevant CI, and required checks
and reviews. If the head or base changes, reassess mergeability and repeat
verification for the current head. A head-match option on the enable request
does not pin later auto-merge to that head; a push by someone with write access
can leave auto-merge armed. Whenever new agent-side or non-required verification
is needed, including after a base-only change or a late check on the same head,
disable pending auto-merge while the PR is still open and verify its removal
before waiting for that verification. Also disable it if merge intent can no
longer be established and work must stop. Before ending with an open PR because
CI failed or a requirement remains unmet, disable any pending auto-merge and
verify its removal. Report those blockers rather than bypassing them. Respect
required checks and reviews without imposing a review request that the
repository does not require, and treat the remote pull request state as the
authority for whether the merge succeeded.

Clean up only after the remote reports `MERGED`, and only the merged worktree.
The project releases that worktree's development resources with its own
commands. Read `AGENTS.md` and `CLAUDE.md` and use the first
`## Worktree cleanup` section found: its fenced code block lists one command
per line, and text outside the block is for people. Without that section, stop
no process.

Decide with the bundled [worktree removal helper](scripts/remove-worktree.sh),
passing the fetched base and the merged pull request's head commit so a
squashed branch can still be deleted:
`inspect <worktree> --base <remote>/<base> --pr-head <sha>`. Run it from this
session's own working directory; the helper counts its working directory as
this session's, so running it after changing into the worktree reads as
`session-inside`.

- `session-inside`: this session works inside the worktree. Run the declared
  commands, then `remove` with the same arguments. The folder stays, HEAD
  detaches at the base, and only the branch is deleted, so the session keeps
  working.
- `ready`: run the declared commands, then `remove` with the same arguments.
  It checks again and removes the worktree and branch only when no process
  still works inside the folder.
- `attached`, `codex-managed`, or `blocked`: leave the worktree, its processes,
  and its branch as they are, and report the reason and any `holder` lines. A
  live session, terminal, or app still uses an attached worktree; the Codex app
  manages its own worktrees and snapshots them before removal.

Run the declared commands in order inside the worktree folder. Stop at the
first failure and leave the folder and branch so the commands can run again.
Never stop a process yourself or force a removal; a process the commands did
not stop, uncommitted work, or a lock keeps the folder in place. Report the
helper's result lines, including a `holder leftover` process or a branch kept
for unmerged commits, beside the verified merge. Preserve other worktrees,
processes, and user changes, then bring the canonical base checkout to the
merged remote state using whatever safe mechanism the current host provides.

## Reconcile spec folders with the issue tracker

After the remote reports `MERGED`, and only when the repository's `AGENTS.md`
or `CLAUDE.md` carries an `## Issue tracker` section, bring the tracker into
line with the spec folders now on the base branch, using the convention's tool,
issue ID form, and operations. Read both files and use the first section found and its
linked detailed convention when present. Without the section, skip this entirely.

Diff the merge range for `docs/specs/<slug>/` folders and find each folder's
issue by the `Issue:` line in its `spec.md`, never by title. Create no issue
here; a folder without the line has none yet. For each issue whose `spec.md`
changed, refresh only its bounded spec section through the convention,
keeping its title and every other part of its body, and recheck that content
afterward. An issue an agent created is treated exactly like one a person
wrote: its title does not follow later spec title changes. Replace its
blocking edges when its `Blocked by` lines changed, resolving each blocker
folder through its own `Issue:` line. Deleting a folder never closes its
issue; only confirmed implementation delivery does.

After a PR that actually delivered implementation, close the issue of each
implemented folder named by its `Spec-Folder` trailer if still open, whatever
the tracker's automatic closing does: a merge into a non-default base, a squash
message without the trailer, or a tracker with no closing reference can leave
it open otherwise. A spec-only merge never closes the issue, even when its
commits carry that trailer. A direct small implementation PR may have no spec
folder or trailer: inspect the current PR's exact `Issue:` line, diff, and
verification, then close that issue now when they establish implementation
delivery. A line alone never closes an issue. Verify the resulting tracker
state and report a failed close for retry. After a spec-only PR merges, leave
its issue open and use the convention's mark-ready operation to clear the PR
review or in-progress signal and leave it in a non-active,
ready-for-implementation state. Check for newer active implementation first;
never demote work that has already started. Verify the resulting state so
`implement` can claim it without a special resume request. If the convention
lacks this operation or the update fails, report the blocked handoff instead of
assuming the issue is ready.

A tracker failure never undoes the verified merge: report which operation
failed and why. On later runs, search merged PR bodies for the exact
`Issue: <tracker>:<id>` line, fetch each issue by that ID, and retry an open
issue's closure only when that PR's diff
and verification establish actual implementation delivery. A linked spec PR or
trailer alone is insufficient. For a merged spec-only PR, retry the recorded
mark-ready operation when the issue still carries its
review or active signal and no newer implementation has started. Report
missing evidence or a failed retry. This catch-up works after the original
branch and trailers disappear in a squash merge.

Finish with the merged pull request URL, merge strategy, verified remote state,
cleanup result, and the tracker issues created, updated, or closed. Keep a
cleanup or tracker failure visible without misreporting the already verified
merge.
