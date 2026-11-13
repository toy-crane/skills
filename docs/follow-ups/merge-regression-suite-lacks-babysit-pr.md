# The merge regression suite stops every run because babysit-pr is not installed

**Symptom**: `node skill-evals/merge/run.mjs --suite pr-flow-merge-rebase`
scores 0 of 12 rows. Every run stops at merge's required-skill check before
any rebase or merge work, saying `babysit-pr` is not installed.

**Observed evidence**: Variant `self-ship-v1`, run on 2026-11-13 with API
access, agent `claude-sonnet-5-5`, judge `claude-opus-5-5`: all 12 judged rows
cite the missing `babysit-pr`, and two more runs ended as harness errors. The
runner's companion list, `skill-evals/merge/run.mjs` line 23, installs only
`pull`, `pr`, `push`, `commit`, and `clean-branches` into each workspace.

**Suspected cause**: #150 (`addbe01`) made `merge` require `babysit-pr`, but the
merge runner's companion list was not updated. The suite breaks the same way
on `main`, not only on the branch that observed it.

**What was tried**: The run's `cell-history.json` rows were discarded so the
broken run does not count. Merge's change for `docs/specs/pr-flow-self-ship/`
was checked instead with `skill-evals/babysit-pr/run.mjs --skill merge`
(cases 42 and 43), which installs every published skill. The suite itself is
still broken.

**Proposed next step**: Add `babysit-pr` to the merge runner's companions and
give the suite's fixtures a replayed pull request state that `babysit-pr` can
read as ready, so it does not wait out its 30-minute idle limit. Then rerun the
suite at the no-change ref to re-establish its baseline.
