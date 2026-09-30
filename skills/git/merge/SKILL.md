---
name: merge
description: Carry the current repository change through a verified GitHub pull request merge into the requested base, or the repository's remote default branch when none is named, then clean up only the merged worktree and its owned development processes. Always use this skill for an actual PR merge or its post-merge cleanup, including requests to inspect, finish, land, or merge an existing PR; create a PR and merge it; preserve meaningful commits; or clean up an already-merged worktree. Report an existing merge instead of duplicating it.
---

# Merge pull request

Carry the current request's change through a pull request, verified merge, and
safe local cleanup. Complete the necessary commit, synchronization, publication,
and PR work without depending on other skills.

Start from current remote truth. Preserve unrelated work, commit only the
request's changes as logical Conventional Commits, resolve the named base or
the remote's advertised default branch, and create or reuse a ready-for-review
pull request based on its fetched state. If the change or its pull request is
already merged, verify and report that outcome instead of creating another one.
When the repository's `AGENTS.md` or `CLAUDE.md` carries an `## Issue tracker`
section, read its linked detailed convention when present; legacy inline
conventions also work, without a separate setup skill installation. For a
configured tracker, read the
`Spec-Folder: docs/specs/<slug>/` trailers from the branch's
commits before merging, while the branch still exists and before a squash can
drop them, and keep those folders for the steps below. Find each folder's
issue by `Source-Issue` ID when the spec records one, otherwise by the
convention's exact title key. Put the exact `Source-Issue` ID in the PR body
when present, so later reconciliation can find the PR after a squash merge.
Put the convention's closing reference in a PR body only when its diff and
verification show implementation delivery; the
trailer alone is insufficient. A spec-only PR with a source issue links it
without closing it, even if a trailer is present.

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
Respect required checks and reviews, and treat the remote pull request state as
the authority for whether the merge succeeded.

Clean up only after the remote reports `MERGED`. Before removing a linked
worktree, run the bundled [server cleanup helper](scripts/stop-worktree-server.sh)
from that worktree when applicable. Remove only the merged worktree and branch,
preserve other worktrees, processes, and user changes, then bring the canonical
base checkout to the merged remote state using whatever safe mechanism the
current host provides.

## Reconcile spec folders with the issue tracker

After the remote reports `MERGED`, and only when the repository's `AGENTS.md`
or `CLAUDE.md` carries an `## Issue tracker` section, bring the tracker into
line with the spec folders now on the base branch, using the convention's tool,
key, and operations. Read both files and use the first section found and its
linked detailed convention when present. Without the section, skip this entirely.

Diff the merge range for `docs/specs/<slug>/` folders. For a folder with
`Source-Issue: <tracker-qualified-ID>`, find and retain that original issue;
never publish a second pointer. For other added folders, publish a pointer
when no open issue exists. Refresh the managed spec content of each issue whose
`spec.md` changed, update blocking edges when its `Blocked by` lines changed,
and close the open generated pointer of each folder the merge deleted. A
human-written source issue closes on confirmed implementation delivery, not
from folder deletion alone. Then catch up:
publish a pointer for every folder on the base branch without `Source-Issue`
that has no issue at all, open or closed. A spec-first folder the merge range
added gets a new issue when only a closed pointer exists; an open one is reused.

For a generated pointer, derive title and body from `spec.md` by structure,
never by section name: the first heading, text of its first section, remaining
section headings, folder path, and blocking issue references. Replace its
derived title and body whole. For an original human-written issue, keep its
title and report and update only the bounded, generated spec section from
`spec.md`; use the convention's bounded body-update operation and recheck human
content. Match pointer keys exactly, `spec:<slug>` followed by a space or
the end of the title. After a PR that actually delivered implementation,
close the issue of each implemented folder named by its `Spec-Folder` trailer
if still open, whatever the tracker's automatic closing does: a merge into a
non-default base, a squash message without the trailer, or a tracker with no
closing reference can leave it open otherwise. A spec-only merge never closes
the source issue, even when its commits carry that trailer. A direct small
implementation PR may have no spec folder or trailer: inspect the current PR's
exact `Source-Issue` marker, diff, and verification, then close that issue now
when they establish implementation delivery. A marker alone never closes an
issue. Verify the resulting tracker state and report a failed close for retry.
After a spec-only PR merges, leave its human-written source issue open and
clear the PR review or in-progress signal through the convention's recorded
post-spec-merge transition to a non-active, ready-for-implementation state.
Check for newer active implementation first; never demote work that has already
started. Verify the resulting state so `implement` can claim it without a
special resume request. If the convention lacks this operation or the update
fails, report the blocked handoff instead of assuming the issue is ready.

A tracker failure never undoes the verified merge: report which operation
failed and why. On later runs, search merged PR bodies for the exact
`Source-Issue: <tracker-qualified-ID>` marker, resolve each issue through the
convention, and retry an open source issue's closure only when that PR's diff
and verification establish actual implementation delivery. A linked spec PR or
trailer alone is insufficient; report missing evidence or a failed retry. This
catch-up works after the original branch and trailers disappear in a squash
merge.

Finish with the merged pull request URL, merge strategy, verified remote state,
cleanup result, and the tracker issues published, updated, or closed. Keep a
cleanup or tracker failure visible without misreporting the already verified
merge.
