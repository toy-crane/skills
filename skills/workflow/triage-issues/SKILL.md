---
name: triage-issues
description: Judge new human-written issues from a configured issue tracker once, in a scheduled or manual run, or one named issue. Close proven duplicates, hand a clear small change to implement, and hand anything needing information or a decision to shape-idea in the same run.
---

# Triage new issues

Judge each new issue once so a person never has to decide where it goes. Use
the repository's `## Issue tracker` section in `AGENTS.md` or `CLAUDE.md` and
its linked `docs/issue-tracker.md`. Read both agent files and use the first
section found; existing inline conventions work too. The convention supplies
the tracker, project or team, issue ID form, status and label mapping, the
not-yet-judged query, the summary section markers, issue operations, and PR
links. Do not guess those values from this skill or require the setup skill to
be installed. If the convention or its tool is unavailable, report the exact
missing operation without changing issues or source.

Triage judges; it does not implement, write specs, or ask the person
questions. Whoever runs this skill decides when to run it again, so comments
are evidence for the judgment, never a trigger for it.

## Pick the issue

When the request names an issue, handle that issue alone. When it names none,
take the convention's not-yet-judged query in stable oldest-first order: open
general issues with no summary section and none of the judgment results the
convention records. Close a duplicate or already-delivered request and continue
to the next; stop at the first issue handed to `implement` or `shape-idea`, so
one run carries at most one handoff and its conversation stays about one issue.

Skip issues with active work, the convention's review signal, or an open linked
PR, and issues named by an `Issue:` line in a spec folder on the default branch;
those already have an owner. A PR links an issue when the tracker links it or
its body carries that issue's `Issue: <tracker>:<id>` line. Do not filter by
title. A named issue that already carries a summary section or judgment result
has been judged: report its current judgment and stop, unless the person
explicitly asks for it to be judged again.

## Own the issue while writing the judgment

Use the bundled [claim helper](scripts/claim.sh) with the issue's stable
`<tracker>:<id>` in the convention's ID form, the same value an `Issue:` line
carries. It conditionally creates a remote Git claim ref, so assignment or a
working label is never the lock. A competing run skips the issue. Keep the
returned SHA and secret token in disposable run state, never in an issue,
commit, PR, or log. Verify the claim before each issue write. If ownership is
lost, stop writing and report the partial state.

Release the claim once the judgment is written: after closing a duplicate, or
after the summary section and result signal are in place and before invoking
the next skill. The written judgment keeps later runs away from the issue, and
`implement` claims it through the tracker on its own, so a shaping conversation
that waits days for a person holds no Git claim. Release only the revision this
run still owns; if ownership was lost, do not release another run's claim. If
release fails, report the held ref and retry path rather than assuming the
issue is available. Two-hour recovery is for interrupted runs only.

An interrupted claim older than two hours can be recovered only after reading
the issue's newest activity, branches, and PRs for the earlier attempt. Pass the
observed SHA to `recover`. If a worker may still be active, leave the claim in
place. The helper uses the repository's `origin` remote by default; verify that
the convention's repository and the selected remote are the same before
claiming. If remote refs cannot be created or conditionally updated, skip
writes and report the missing atomic claim capability. Do not replace it with a
label or assignee.

Recheck the skip conditions after claiming; a newly opened PR or new active
work means the issue is no longer this run's to judge.

## Investigate and judge

Read the original report, attachments, comments, related issues, project
context and decisions, current code and behavior, and any relevant runtime
evidence. Resolve technical questions from that evidence. Then pick the one
result that fits:

- **Duplicate or already delivered.** Show the linked evidence and reason, then
  apply the convention's completed disposition. This closes the issue.
- **Clear and small.** The requested result is clear and the change is small:
  no product choice remains and no contract emerges that later work would need
  to reread. Hand it to `implement`. Do not call a speculative implementation
  clear merely to avoid a question about expected behavior.
- **Needs information or a decision.** A fact is missing, a product choice
  remains, the request may be declined, or the change is large enough to need
  a written contract. Hand it to `shape-idea`, which writes the first question
  and owns the conversation that follows.

## Record the judgment before handing off

Write the judgment where the tracker shows it, before invoking any other skill.
Use the bundled [body section renderer](scripts/body-sections.py) on the freshly
fetched body to update only the bounded summary section with the confirmed
facts, the judgment and its reason, and the next step. Preserve the human
report. Then apply the convention's result signal and clear its untriaged
signal: the waiting state `needs-info` for a missing fact or `needs-decision`
for a choice or contract, the ready-for-implementation state for a clear small
change, or the completed disposition for a duplicate. The summary section and
signal are what keep later runs from judging the issue again, so they stay even
when the handoff that follows is missing or fails.

Use the convention's body-update operation to re-read the latest body and
replace only the summary section. Recheck the resulting body against the human
content read immediately before the write. A Git claim serializes agents, not
human edits; when the tracker provides no conditional body update, do not claim
an atomic preservation guarantee. Repair any observed loss of human content
from available revision evidence, or report the lost-edit risk. If a section
boundary is ambiguous, preserve it and report it rather than guessing.

## Hand off in the same run

Invoke the next skill by name with the issue's `<tracker>:<id>` and the
judgment: `implement` for a clear small change, with the result it must
deliver; `shape-idea` for an issue needing information or a decision, with the
open point that blocks it. That skill owns everything after: claiming,
questions, specs, verification, and PRs. If it is not installed, leave the
recorded judgment and report the exact next step a person should take, such as
running that skill on this issue.

## Report the run

Report each issue judged, its result, and the handoff made. Report blocked
claims or failed writes with their exact retry path. A scheduled run that found
no new issue stays quiet.
