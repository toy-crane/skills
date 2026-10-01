---
name: clean-worktrees
description: Clean up a repository's accumulated Git worktrees in one pass, removing those whose pull request merged or closed, detached ones already contained in the base, and left-over worktree folders that lost their Git registration, while leaving open, uncommitted, session-attached, and Codex-managed work in place. Use when the user asks to clean up, prune, or tidy stale or piled-up worktrees across a repository. Cleanup right after merging one pull request belongs to merge.
---

# Clean worktrees

Remove the current repository's stale worktrees in one pass, then report what
was removed, what stayed, and why. Do not ask for confirmation along the way:
safety comes from the narrow targets below, and anything that cannot be judged
stays where it is.

## Find the candidates

Fetch the remote first. The base is the branch the user names, otherwise the
remote's advertised default branch. Read `git worktree list --porcelain` for
registered worktrees. For folders that lost their registration, look only
inside folders of the default checkout that also hold a registered linked
worktree, such as `.claude/worktrees/`.

A worktree is a candidate when one of these holds:

- Its checked-out branch has a pull request that merged or closed. Judge this
  from GitHub, for example `gh pr list --head <branch> --state all`, because a
  squash merge leaves the branch tip outside the base history. Any open pull
  request for the branch name keeps the worktree; otherwise use the most
  recently created one, and keep its head commit for the helper.
- Its checked-out branch has no pull request, and the fetched base already
  contains the branch tip.
- Its HEAD is detached and contained in the fetched base.
- It is a folder whose Git registration is gone. The helper below decides
  whether such a folder is safe to remove.

Leave these in place and list them in the report: the default checkout, a
worktree on the base branch, an open pull request, a branch with no pull
request that the base does not contain, and a branch whose tip has commits
beyond its pull request head that the base does not contain. If `gh` is
missing or not authenticated, skip worktrees with a branch, say so, and keep
going with detached worktrees and folders.

## Release and remove each candidate

The project releases a worktree's development resources with its own commands.
Read `AGENTS.md` and `CLAUDE.md` and use the first `## Worktree cleanup`
section found: its fenced code block lists one command per line, and text
outside the block is for people. Without that section, stop no process.

Decide each candidate with the bundled
[worktree removal helper](scripts/remove-worktree.sh), run from this session's
own working directory: `inspect <worktree> --base <remote>/<base>`, adding
`--pr-head <sha>` for a branch with a pull request. The helper counts its
working directory as this session's, so running it after changing into a
candidate reads as `session-inside`.

- `session-inside`: this session works inside the candidate. Run the declared
  commands, then `remove` with the same arguments. The folder stays, HEAD
  detaches at the base, and only the branch is deleted.
- `ready`: run the declared commands, then `remove` with the same arguments.
  It checks again and removes the worktree, or the folder, and its branch only
  when no process still works inside.
- `attached`, `codex-managed`, or `blocked`: leave the candidate, its
  processes, and its branch as they are. A live session, terminal, or app still
  uses an attached worktree. The Codex app manages its own worktrees and
  removes one, after saving a snapshot, when its chat is archived.

When `inspect` reports `branch <name> unmerged`, leave that worktree too: its
branch has commits that exist nowhere else.

Run the declared commands in order inside the candidate's folder. Stop at the
first failure and leave that folder and branch so the commands can run again.
Never stop a process yourself or force a removal. Handle candidates one at a
time; a candidate that stays does not stop the others.

## Report

Finish with one report grouped as follows:

- Removed: each worktree or folder with why it qualified, such as the merged or
  closed pull request number, containment in the base, or a lost registration.
- Folder kept for this session: HEAD detached and the branch deleted.
- Left in place: each one with its reason, such as the open pull request
  number, uncommitted changes, a holder's PID and command, a failed cleanup
  command, a Codex-managed worktree with the archive hint, a folder whose
  `.git` cannot be verified, or a branch without a pull request.
- Not judged: worktrees skipped because GitHub could not be read.

Leave remote branches alone.
