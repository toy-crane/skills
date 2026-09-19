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
section, read the `Spec-Folder: docs/specs/<slug>/` trailers from the branch's
commits before merging, while the branch still exists and before a squash can
drop them, and keep those folders for the steps below. Find each folder's
issue by the section's key and put the section's closing reference in any
pull request body you create.

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
line with the spec folders now on the base branch, using the section's tool,
key, and operations. Read both files and use the first section found. Without
the section, skip this entirely.

Diff the merge range for `docs/specs/<slug>/` folders. Publish one issue for
each folder the merge added that has no open issue yet, regenerate the body of
each issue whose `spec.md` changed, update blocking edges when its `Blocked by`
lines changed, and close the open issue of each folder the merge deleted. Then
catch up: publish an issue for every folder on the base branch that has no
issue at all, open or closed, so merges made outside this skill and folders
that predate the section are covered without duplicating a folder whose issue
already closed. A folder the merge range added gets a new issue when only a
closed one exists; an open one is reused, so reporting an already merged pull
request never publishes twice.

Derive the body from `spec.md` by structure, never by section name, so any
language works: the first heading as the title after the key, the text of the
first section, the remaining section headings as a list, the folder path, and
the issue of each `Blocked by: docs/specs/<other>/` line as a blocking edge.
Overwrite the body whole; nobody edits it by hand. Match the key exactly,
`spec:<slug>` followed by a space or the end of the title, so a slug never
matches a longer one. Then close the issue of every folder the branch's
`Spec-Folder` trailers named if it is still open, whatever the tracker's
automatic closing does: a merge into a non-default base, a squash message
without the trailer, a tracker with no closing reference, or a pull request
that added and implemented the same folder all leave it open otherwise.

A tracker failure never undoes the verified merge: report which operation
failed and why, and let the next `merge` catch up.

Finish with the merged pull request URL, merge strategy, verified remote state,
cleanup result, and the tracker issues published, updated, or closed. Keep a
cleanup or tracker failure visible without misreporting the already verified
merge.
