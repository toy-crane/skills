---
name: setup-issue-tracker
description: Record once per repository which issue tracker coordinates its spec folders, so merge, pr, and implement can publish, claim, and close one issue per docs/specs/<slug>/ folder. Run by hand before the first parallel implementation; rerun only to change trackers.
disable-model-invocation: true
---

# Set up the issue tracker

Give this repository one issue tracker convention that the other skills read
from its agent instructions. Nothing else changes: the spec folder under
`docs/specs/<slug>/` stays the only contract, and an issue is a pointer to one
folder that carries the claim, the blocking edges, and a body derived from
`spec.md`. Repositories without this section keep every skill's current
behavior, so write it only when the user wants parallel implementation across
spec folders.

## Explore, then recommend

Read what is already there before asking anything: the Git remotes, whether
`AGENTS.md` and `CLAUDE.md` exist and whether either already carries an issue
tracker section, and which tracker tools this session can actually use (a
GitHub CLI login, a Linear MCP server or CLI, or nothing). Lead with a
recommendation the user can accept in a word: the remote's host when the
repository lives on GitHub, an existing section's tracker when one exists, and
otherwise the tool the session can reach. Confirm one item at a time.

Settle these items:

- **Tracker**: GitHub Issues, Linear, or another tracker the user describes in
  one paragraph.
- **Key**: how a spec folder maps to an issue. The default is an issue title
  that starts with `spec:<slug>` followed by a space or the end of the title,
  matched exactly so `spec:checkout` never matches `spec:checkout-v2`.
- **Tool**: the command or server the skills use, verified to exist in this
  session rather than assumed.
- **Six operations**, each written as what to run: find the issue for a folder
  (returning whether it is open, its assignee, and its open blockers), publish
  an issue, update its body, update its blockers, claim it, and close it.

Start from the matching template and adjust it to what exploration found:
[templates/github.md](templates/github.md),
[templates/linear.md](templates/linear.md), or
[templates/other.md](templates/other.md) for a tracker the user describes.

## Write the section

Record the convention as an `## Issue tracker` section in the repository's
agent instructions. Edit `AGENTS.md` when it exists, `CLAUDE.md` when only that
exists, and `AGENTS.md` when both exist as separate files; when neither exists,
ask which one to create. Never create the second file beside an existing one.
When the section already exists, replace it in place and leave the surrounding
content untouched; rerunning this skill shows the current convention and
changes only what the user wants changed.

Keep the section compact enough to stay in an always-loaded file: the tracker,
the key, the tool, and the six operations. When the user's free-form
description runs past a paragraph, move it to `docs/issue-tracker.md` and leave
a one-line route in the section.

Show the drafted section before writing it, then write it and report which
file carries it. Do not publish issues for existing spec folders here: the
next `merge` publishes every folder on the default branch that has no issue.
