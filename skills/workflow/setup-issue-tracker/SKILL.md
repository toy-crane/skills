---
name: setup-issue-tracker
description: Record once per repository which issue tracker coordinates its spec folders, so merge, pr, implement, and maintain-project-context can publish, claim, close, and reconcile one issue per docs/specs/<slug>/ folder. Run by hand before the first parallel implementation; rerun to change trackers or upgrade an older convention.
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
- **Seven operations**, each written as what to run: list every managed issue in
  every state, find the issue for a folder (returning whether it is open, its
  assignee, and its open blockers), publish an issue, update its derived title
  and body, replace its blockers by removing stale edges and adding missing
  ones, claim it, and close it. The list operation returns each issue's
  identifier, title, and state so a maintenance pass can find orphan and
  duplicate exact keys.

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
changes only what the user wants changed. Treat an older section without `List
managed issues` as incomplete and include that operation in the proposed
upgrade while preserving its tracker, key, tool, and already-complete
operations. At the same time replace a legacy body-only update with the derived
title-and-body operation and replace an additive-only blocker update with the
complete stale-removal and missing-addition operation; otherwise the upgraded
section still cannot support full reconciliation.

Keep the section compact enough to stay in an always-loaded file: the tracker,
the key, the tool, and the seven operations. When the user's free-form
description runs past a paragraph, move it to `docs/issue-tracker.md` and leave
a one-line route in the section.

Show the drafted section before writing it, then write it and report which
file carries it. Do not publish issues for existing spec folders here: the
next `merge` incrementally publishes missing folders, and the next
`maintain-project-context` run can perform a full reconciliation.
