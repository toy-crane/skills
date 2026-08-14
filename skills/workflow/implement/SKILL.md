---
name: implement
description: Implement or resume settled work from a selected spec folder. Use when the user provides a `docs/specs/SLUG/` folder and wants its settled spec or approved tasks completed in the current checkout with verification, the current harness's automated code-review process, and a runnable product handoff when the repository exposes one through a local server.
---

# Implement

Treat the selected spec folder as the stable handoff: `spec.md` is the approved
product contract, and approved task files, when present, are the current shallow
delivery map. Implement tasks sequentially from the current unblocked frontier;
otherwise implement `spec.md` directly. Before each outcome, reload the current
spec, every unfinished task, relevant project decisions, code, Git state, and
verification evidence, then derive that outcome's technical approach just in
time. Do not rely on remembered conversation or persist a separate roadmap,
execution ledger, durable implementation plan, or run-state file.

Use the `tdd` skill where behavior can be verified through a pre-agreed public
seam.

Use an available runtime-verification skill that matches each affected surface.
If none is available, verify the changed behavior through the repository's
supported runtime. If the changed behavior cannot be verified in the running
product, leave verification incomplete. Builds, type checks, and tests do not
replace this runtime check.

Keep an in-scope discrepancy, an affected unfinished task, or an invalidated
completed outcome in the current work; none is a follow-up. When a workaround
leaves its root cause open, or you observe an out-of-scope defect with evidence,
record it at the moment of discovery through the `project-knowledge` skill. If
that skill is unavailable, write the symptom, observed evidence, suspected
cause, what was tried, and a proposed next step to
`docs/follow-ups/<slug>.md` yourself. Reporting it only in conversation loses
it.

After an actual interruption, reconstruct progress from repository state, not
remembered conversation, then continue the remaining work. Confirm ownership
before incorporating ambiguous dirty changes.

Complete each outcome and its acceptance criteria with focused verification.
Before marking it complete or beginning dependent work, reconcile the observed
behavior with the approved product contract and every unfinished task. Apply
verified technical discoveries to technical assumptions, unfinished task
boundaries and order, blockers, task-specific constraints, verification, and
observably equivalent task-acceptance wording, recording concise revision
evidence. Leave unaffected task contracts unchanged. This gate also applies
when implementing `spec.md` without task files.

A change to an approved outcome, scope, observable spec acceptance criterion,
off-limits area, or other product constraint is outside implementation
authority. Stop before absorbing it and present the exact decision for the user
to settle through shaping. If later code, integration, verification, or review
invalidates a completed task, preserve its prior evidence, return it to
`in-progress` or `blocked`, and repair it or leave completion blocked before
dependent or final work continues. `completed` means its criteria pass now,
not merely that they passed earlier.

When tasks exist, record current status and concise verification, blocker, and
revision evidence. Where commits are expected, commit code, tests, and the task
update together as a meaningful checkpoint. Run only task-declared intermediate
review checkpoints; reconciliation itself does not add a review invocation.

After every outcome currently passes its reconciliation gate, run the complete
required verification, then use the current harness's automated code-review
process on the entire implementation diff against the selected spec and
acceptance criteria. Prefer a
model-invocable review facility when the harness provides one. A rejection
recorded only in an earlier session is not current evidence; before handing
off on that basis, retry the reviewer once in the active session.

Completion requires every acceptance criterion and the final review gate to
pass. If the current review cannot produce an outcome because it is user-only,
rejected, errors, or times out, report an exact user-invocable command when the
active harness confirms one. In Claude Code, the Skill tool may expose the
reviewer as `code-review` even when user-facing aliases exist; use `/review`
when the active session confirms that equivalence. If no confirmed command
is available or no review facility exists, report the reviewer's unavailability
as the remaining gate. Leave either fallback with the review gate outstanding
and do not claim completion.

After all acceptance criteria and the final review gate pass, when the
repository exposes the implemented result through a user-reviewable local
server, run the actual product through its repository-supported development or
preview path. Verify the changed routes and essential states in that running
instance, then share an address the user can open and name what to review.

Reuse a healthy server owned by the current checkout or start an isolated
instance while preserving other checkouts and unrelated processes. Keep the
server running until the user finishes review or a later authorized delivery
step cleans up the current checkout. When the active environment cannot provide
a reachable address, report the exact launch command and blocker as the
remaining handoff limitation. Access to the running result does not imply human
approval.
