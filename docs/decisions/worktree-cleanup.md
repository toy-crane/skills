# Worktree cleanup

## Decisions

- A project declares how to release a worktree's resources in a
  `## Worktree cleanup` section of `AGENTS.md` or `CLAUDE.md`, the first one
  found. The section holds one fenced code block with one command per line.
  Text outside the block is for people.
- A skill that removes a worktree runs those commands in order, with the
  worktree folder as the working directory, before removing it. It also runs
  them when the folder stays because the current session works inside it. A
  failing command stops the sequence and leaves the folder and branch in place.
- Without that section, no process is stopped. Skills never signal processes
  chosen by their working directory.
- The current session is the command that performs the check and its ancestor
  processes. When any of them works inside the worktree, the folder stays: HEAD
  detaches at the merged base and only the branch is deleted.
- A process working inside the folder is attached when the process that
  launched it from outside the folder is still running. It is left over when it
  has been reparented to PID 1. A worktree with an attached process is left
  untouched and reported. Left-over processes are stopped only by the
  project's declared commands.
- Immediately before removal, a read-only check looks for any process still
  working inside the folder. If one remains, the folder stays and the report
  names its PID and command.
- Worktrees under the Codex worktree root, `$CODEX_HOME/worktrees` and
  `~/.codex/worktrees` by default, follow the Codex app's own lifecycle. They are
  left untouched and reported, unless the current session works inside one.
- A local branch is deleted only when its tip equals the head of the pull
  request that merged or closed, or is contained in the base. Removal never
  forces past uncommitted changes or a lock.
- A folder that has lost its Git registration is removed only when it has no
  `.git` entry and sits directly inside a Git-ignored folder of the default
  checkout that also holds registered linked worktrees, such as
  `.claude/worktrees/`. With a `.git` entry, uncommitted work cannot be ruled
  out, so the folder stays.
- `merge` and `clean-worktrees` ship the same removal helper, so each stands
  alone when installed by itself. A pull request check fails when the shipped
  copies differ.

## Boundaries

- The procedure removes one worktree that a skill has already chosen. Choosing
  which worktrees qualify belongs to the calling skill.
- Docker containers, emulators, and other resources that do not work inside
  the folder are released only by the project's declared commands.
- A Git worktree's removal does not delete its remote branch.

## Why

Projects start their development servers with their own commands, so they also
stop them with their own commands. A general skill cannot guess the tool, and
the previous Portless-only helper did nothing in projects without Portless.
Claude Code sessions keep their worktree as the process working directory, so
stopping processes by working directory would end the agent's own session or
another one. Deleting a folder under a running session breaks that session.
Running the cleanup commands before removal matters because they work only in
the worktree's own folder. When the folder disappears first, its processes and
containers stay until the next development command runs.

A merge usually runs inside the worktree it merges, so the folder stays. If the
cleanup commands ran only when the folder was removed, those merged worktrees
would keep holding their servers, emulators, and database stacks.

The Codex app runs its sessions from an `app-server` process whose working
directory is `/`, so no process shows which worktree a Codex chat is using. The
app keeps the worktree of a pinned or in-progress chat. It removes the others
when their chat is archived or a count limit is reached, and saves a snapshot
first so the chat can restore it.

## Reconsider when

- Codex exposes which worktree a chat uses through a documented interface.
- Claude Code or Codex sessions stop working inside their worktree folder.
- A supported host reparents orphaned processes to a subreaper instead of PID 1
  often enough that left-over processes are never cleaned.

## Still-rejected alternatives

- A bundled helper for one process manager — it assumes a project tool inside a
  general skill and does nothing elsewhere; revisit only for a skill scoped to
  that tool.
- Stopping every process that works inside the folder — it ends the agent's own
  session or another agent's session.
- Treating every non-current process as attached — a development server whose
  session has ended would block cleanup forever.
- Reading the Codex app's internal state database — the schema is undocumented
  and versioned, so an update can silently break the check.
- Treating Codex worktrees like any other — it can delete the folder of an
  in-progress chat and loses the snapshot Codex takes before its own removal.
- Running the cleanup commands only when the folder is removed — merged
  worktrees kept for the current session keep their resources.
- One skill delegating removal to another installed skill — the first skill
  loses its cleanup when installed alone.

## Evidence worth preserving

- On 2026-10-01 the flyn repository had 22 Git worktrees. Four belonged to
  merged pull requests; two of those held API and Metro processes and an
  Android emulator, and one held a worktree-only Supabase stack. Nine detached
  worktrees were clean and contained in `main`. Seven folders had lost their Git
  registration. Later the same day, the two left under `.claude/worktrees/` had
  no `.git` and held only empty `supabase/` paths, while the three under
  `~/.codex/worktrees/` were full checkouts with a `.git` file.
- On the same machine, Claude desktop session processes (Claude Code 2.1.284)
  used their worktree as working directory, with a Claude app helper as parent.
  One flyn worktree with no session still ran an API server whose parent was
  PID 1.
  The Codex `app-server` (codex-cli 0.159.2) used `/` as its working directory.
