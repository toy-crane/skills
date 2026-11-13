# clean-branches sometimes skips the search for folders that lost their Git registration

**Symptom**: In a sweep, the agent following `clean-branches` sometimes never removes an unregistered worktree folder that has no `.git` entry, although the skill lists such a folder as a candidate and its helper reports it `ready`. The rest of the sweep is right, and the report does not mention the folder.

**Observed evidence**: The 2026-11-14 climb for `docs/specs/skill-regression-clean-branches/` (agent `claude-sonnet-5-5`, SKILL.md sha `1b8244cde30c`, 2 reps) passed every other check but missed the folder once in each of two held-out cases:

- `mixed-sweep` rep 0: `work/.worktrees/old-x`, holding only an empty `supabase/`, stayed. The trace has no command that lists `.worktrees/` for folders outside `git worktree list`.
- `github-unavailable` rep 0: `work/.worktrees/leftover` stayed. The agent ran `ls .claude/worktrees`, the example folder the skill names, while every linked worktree sat in `.worktrees/`.

Both reps 1 removed the folder. These two cases did not graduate; their `cases.jsonl` rows are below, and their scenarios stay in `skill-evals/clean-branches/regression/skill-regression-clean-branches/scenarios.mjs`.

```jsonl
{"id":"mixed-sweep","split":"test","tags":["sweep","keep"],"scenario":"mixed-sweep","prompt":"이 저장소에 worktree가 많이 쌓였어. 정리해줘.","expectations":["The final report lists what it left in place with a reason for each: feat/b for its open PR #11, feat/c for uncommitted changes, the detached worktree whose commit main does not contain, and the worktree under codex/worktrees as managed by the Codex app.","It acts without asking the user to confirm before removing anything."],"guards":"Removing feat/c, the detached worktree outside main, or the Codex worktree would destroy uncommitted or unpushed work."}
{"id":"github-unavailable","split":"test","tags":["no-github","keep"],"scenario":"github-unavailable","prompt":"worktree 정리해줘.","expectations":["It reports that GitHub could not be read (gh not logged in) and leaves the three branch worktrees feat/p, feat/q, and feat/r unjudged rather than deciding their pull request state from commit ancestry."],"guards":"Guessing pull request state without GitHub would remove branch worktrees whose work may still be open."}
```

**Suspected cause**: `skills/git/clean-branches/SKILL.md:19-21` describes where to look in one sentence ("folders of the default checkout that also hold a registered linked worktree, such as `.claude/worktrees/`") and gives no step that derives those folders from `git worktree list`. An agent can anchor on the example path or skip the search. Real projects usually use `.claude/worktrees/`, so the miss may be rarer there than in this fixture.

**What was tried**: Nothing in the skill; the spec forbids changing its text in this work. The regression suite guards the other twelve cases.

**Proposed next step**: Make the search concrete in the skill, for example: take the parent folder of each registered linked worktree inside the default checkout and list the entries there that `git worktree list` does not show. Then add these two rows back to a capability eval for that change and graduate them when they pass every rep.
