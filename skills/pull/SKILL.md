---
name: pull
description: Rebase the current Git checkout onto the latest origin/main without losing local work. Always use this skill for an actual main synchronization operation, including requests to pull or sync main, update a branch from main, rebase onto origin/main, bring incoming main commits into the current checkout, or update a detached worktree from main. Use it even when the request says "rebase" or "apply incoming main commits" without saying "pull."
---

# Pull main

Bring the current checkout onto the latest `origin/main` through a rebase so
the history remains linear.

Preserve all local work. A dirty working tree is not authority to commit,
stash, or discard its contents; leave it intact and identify what prevents a
safe update. Fetch the remote truth before deciding whether any update is
needed.

Rebase rather than introducing a merge commit. Resolve a conflict when the
intended result is established by the request and project evidence. When intent
is ambiguous, keep the original work recoverable and report the conflicting
files and the smallest decision needed to continue.

Finish when the checkout is based on the fetched `origin/main`, local work is
preserved, and the user knows whether it was already current or which commits
arrived.
