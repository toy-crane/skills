---
name: triage-issues
description: Triage human-written general issues from a configured issue tracker in a scheduled or manual run. Investigate, ask only decisions that need a person, and raise one implementation or spec pull request when ready.
---

# Triage general issues

Reduce the time a person spends deciding what to do with freely written issues.
Use the repository's `## Issue tracker` section in `AGENTS.md` or `CLAUDE.md`
and its linked `docs/issue-tracker.md`. Read both agent files and use the first
section found; existing inline conventions work too. The convention supplies
the tracker, project/team, status and label mapping, issue operations, and PR
links. Do not guess those values from this skill or require the setup skill to
be installed. If the convention or its tool is unavailable, report the exact
missing operation without changing issues or source.

## Select a bounded queue

List open human-written general issues across the configured scope, including
Backlog. Prefer waiting issues with a new human answer or human body edit, then
new issues, then untouched older issues in stable oldest-first order. Count at
most three eligible issues inspected in one run, and raise at most one PR.
Continue to the next candidate after leaving an information or decision request.
Stop selecting PR-producing work after the first PR.

Exclude exact `spec:<slug>` pointer issues, issues with active work or any
linked PR, and issues whose source identity already belongs to a spec folder.
A waiting `needs-info` or `needs-decision` issue becomes eligible when a person
comments or edits its report after the question. Changes to the AI-managed
sections do not count as human edits. Read the newest body and all comments
before deciding whether a reply resolves the question; a clear answer needs no
special decision-maker role. Conflicting or ambiguous replies need one focused
follow-up in the same issue.

## Own an issue before any write

Use the bundled [claim helper](scripts/claim.sh) with a stable tracker-qualified
ID, for example `linear:TEAM-12` or `github:owner/repo#42`. It conditionally
creates a remote Git claim ref, so assignment or a working label is never the
lock. A competing run skips the issue. Keep the returned SHA and secret token
in disposable run state, never in an issue, commit, PR, or log. Verify the claim
before each issue write, branch publication, and PR creation; renew it during
long work and use the new SHA. If ownership is lost, stop writing and report
the partial state. Release only the revision still owned by this run.

An interrupted claim older than two hours can be recovered only after reading
the issue's newest activity, branches, and PRs for the earlier attempt. Reuse
an existing artifact rather than duplicating it, then pass the observed SHA to
`recover`. If a worker may still be active, leave the claim in place. The helper
uses the repository's `origin` remote by default; verify that the convention's
repository and the selected remote are the same before claiming. If remote
refs cannot be created or conditionally updated, skip writes and report the
missing atomic claim capability. Do not replace it with a label or assignee.

Recheck eligibility and the issue's human-written content after claiming and
again before publishing an outcome. A newly linked PR or changed request can
invalidate the planned action. Preserve existing dirty checkout work; use an
isolated branch or worktree from the fetched remote default branch for a PR.

## Investigate and route

Read the original report, attachments, comments, related issues, project
context and decisions, current code and behavior, and any relevant runtime
evidence. Choose the smallest outcome that actually resolves the request:

- If the requested result is clear and the change is small, implement it,
  select a public test seam, verify the affected behavior in the running
  product when one exists, and obtain one completed automated review of the
  whole diff. Repair confirmed ordinary-path defects and rerun affected checks.
  Raise a ready-for-review implementation PR with the evidence and link the
  original issue. Do not claim runtime proof from static checks.
- If the result is clear but spans substantial behavior or requires a durable
  design choice, write `docs/specs/<slug>/spec.md` as the implementation
  contract and raise a spec PR. Record `Source-Issue: <tracker-qualified-ID>`
  and the issue URL beside the spec's source links. Do not start implementation
  in this triage run. An unmerged spec is a draft, and its PR remains linked to
  the original issue.
- If a missing fact prevents either path, ask for precisely that fact in a
  comment and set `needs-info` through the configured convention.
- If a product choice remains, leave `needs-decision`: explain the choice,
  viable options and their consequences, the AI recommendation and its basis.
  Produce or attach screenshots, short video, reproduction steps, comparisons,
  logs, or running links when they help the person decide. Distinguish observed
  evidence, inference, and unknowns. Check media for sensitive data before
  sharing it. Ask in a comment where the person can reply.
- For a proven duplicate or already implemented request, show the linked
  evidence and reason, then apply the convention's completed disposition. For
  a new product request that may be declined, recommend proceed, defer, or
  decline with consequences and leave the choice to a person.

Use available specialized shaping, implementation, verification, or PR skills
when they fit, but carry the outcome above even when those skills are absent.
Resolve technical choices from evidence; do not turn them into human questions.
Do not treat a speculative implementation as a clear small issue merely to
avoid writing a spec or asking about expected behavior.

## Keep one issue readable

Preserve the human report. Use the bundled
[body section renderer](scripts/body-sections.py) on the freshly fetched body
to update only a clearly bounded `Triage 요약` section
with confirmed facts, current state, and next action. Keep questions and human
answers in comments; fold settled answers into the summary. A spec PR also
adds a bounded spec section in that same issue, marked draft until merged.
The repository's `spec.md` is authoritative: render the issue section from it,
and refresh that section when the merged contract changes. Never hand-edit an
independent second spec. If a body edit or section boundary is ambiguous,
preserve it and ask only for the missing distinction.

Use the convention's body-update operation to re-read the latest body and
replace only the AI-managed section. Recheck the resulting body against the
human content read immediately before the write. A Git claim serializes agents,
not human edits; when the tracker provides no conditional body update, do not
claim an atomic preservation guarantee. Repair any observed loss of human
content from available revision evidence, or leave the outcome incomplete and
report the lost-edit risk. Move a newly answered waiting issue directly to
its next evaluated outcome; do not leave it in an unlabelled intermediate
state. Link PRs without closing the original issue on a spec PR. Once a spec
folder has this source issue, `merge`, `implement`, PR creation, and context
maintenance must reuse it rather than publish a `spec:<slug>` duplicate.
After publishing either PR, clear triage and waiting labels and apply the
convention's review or in-progress signal; the linked PR keeps the issue out
of later triage runs.

## Report only new decisions to the person

On a scheduled run, group links to issues that received a **new** decision
request in this run, with one-line descriptions. When none did, keep the run's
user notification quiet; issue comments, body updates, and PRs retain the
results. Report blocked claims or failed writes with their exact retry path.
