---
name: implement
description: Implement or resume settled work from a selected spec folder. Use when the user provides a `docs/specs/SLUG/` folder and wants its settled spec or approved tasks completed in the current checkout with verification, one triaged pass of the current harness's automated code-review process, and a runnable product handoff when the repository exposes one through a local server.
---

# Implement

## Load the current handoff

Treat `spec.md` as the approved product contract. Non-superseded approved task
files, when present, form its current shallow delivery map: `pending`,
`in-progress`, and `blocked` tasks are active unfinished work, while `completed`
tasks are current proof. A `superseded` task is inactive recovery history;
exclude it from the frontier, blockers, reconciliation, and completion gates,
but inspect it when current evidence implicates its prior implementation. If an
active task still names superseded history as a blocker, reconcile that stale
reference before continuing.

Before selecting or starting each outcome, and again after an interruption,
reconstruct current truth from the spec, every active unfinished task, any
completed or superseded task implicated by current evidence, relevant project
decisions, code, Git state and current diff, and verification evidence.
Repository evidence outranks remembered conversation; rerun verification that
predates the relevant code. Preserve completed outcomes whose current evidence
still passes, and confirm ownership before absorbing ambiguous dirty changes.
Then work sequentially from the current unblocked frontier; when no task files
exist, implement `spec.md` directly.

Derive only the active outcome's technical approach just in time. A task
boundary requires this reload; it does not by itself require a new session,
worker, or reviewer. Keep the spec folder as the single handoff instead of
adding a roadmap, execution ledger, durable implementation plan, or run-state
file.

## Implement and reconcile one outcome

Use the `tdd` skill at a pre-agreed public seam when available. Otherwise retain
the same observable seam and implement one red-to-green behavior at a time.

Use an available runtime-verification skill matching each affected surface, or
verify through the repository's supported runtime. Keep the outcome incomplete
when its changed behavior cannot be verified in the running product; builds,
type checks, and tests do not replace runtime evidence.

Complete the outcome and its acceptance criteria with focused verification.
Before marking it complete or starting dependent work, reconcile the observed
behavior with the product contract and every active unfinished task. This gate
also applies when implementing `spec.md` without task files.

For a verified discovery that preserves the product contract:

- Correct the active outcome's disposable technical approach and any recorded
  technical assumption.
- Persist actual downstream effects in affected active unfinished task
  boundaries, order, blockers, task-specific constraints, verification, or
  observably equivalent task-acceptance wording. Record concise revision
  evidence and preserve unaffected task contracts.

When tasks exist, record current status and whichever verification, blocker, or
revision evidence applies. Where commits are expected, commit code, tests, and
the task update as one meaningful checkpoint. Run only task-declared
intermediate review checkpoints, each as one pass over its declared cumulative
scope focused on its declared risk, triaged by the same rules as the final
review; reconciliation adds no review checkpoint.

## Preserve authority and durable discoveries

Implementation authority covers the technical path and active unfinished task
map only while the approved product contract stays intact. When a discovery
would change an approved outcome, scope, observable spec acceptance criterion,
off-limits area, or other product constraint, preserve the current artifacts
and evidence, leave the affected outcome and its dependents blocked, and stop
before absorbing the change. Present the exact decision for the user to settle
through shaping.

If later code, integration, verification, or review invalidates a completed
task, preserve its prior evidence and return it to `in-progress` or `blocked`.
Keep dependent and final work blocked until that task's acceptance criteria and
focused verification pass again. `completed` means current proof, not historical
success.

Resolve in-scope discrepancies and affected tasks in the current work. Route a
workaround whose root cause remains open, or an evidenced out-of-scope defect,
through `project-knowledge` at discovery time. If unavailable, write the
symptom, observed evidence, suspected cause, what was tried, and proposed next
step to `docs/follow-ups/<slug>.md`.

## Review the whole diff once

After every outcome passes reconciliation, run the complete required
verification. Then run the current harness's automated code review exactly once
over the entire diff against the selected spec and acceptance criteria. Prefer a
model-invocable reviewer; a rejection recorded only in an earlier session is not
current evidence, so retry that reviewer once in the active session.

Name the mode explicitly where the harness offers modes, since one given no
mode may reuse an earlier invocation's. Choose the depth this change warrants,
weighing what it touches against what verification already settles, and take
the harness's standard mode when nothing argues either way. In Claude Code that
is `code-review medium`; Codex has no mode dial. The pass stays single at any
depth. Wherever the reviewer accepts instructions or context, give it the spec's
approved scope, off-limits areas, remaining risks, and the relevant decision
contracts, so it does not re-argue trade-offs the project already settled.

A pass that did not review the intended scope is not spent. Correct the target
and run it once.

## Triage the findings and report them as evidence

Repair a finding only when it shows an approved acceptance criterion failing, or
is a defect or caused regression in the changed behavior that you confirm by
reproducing it on a path ordinary use reaches. A reviewer's assertion is not
that confirmation. Rerun only the affected verification afterwards, and send no
scope through the reviewer twice: a scope already reviewed, including the
repairs made to it, is done for this run. A later pass over a scope this run has
not yet reviewed, such as the whole diff after an intermediate checkpoint,
remains that scope's own single pass. When someone asks for another look at an
already-reviewed scope, name the confirmed user command instead of invoking the
reviewer again yourself.

Record every other finding instead of repairing it. Route an evidenced defect or
an open workaround through `project-knowledge`, or write the symptom, observed
evidence, suspected cause, what was tried, and proposed next step to
`docs/follow-ups/<slug>.md` when that skill is absent. Note a trade-off already
disposed of by the spec, an accepted remaining risk, or a decision contract as
disposed. Keep an out-of-scope, stylistic, or unconfirmed finding in the
handoff. Name a material consequence the spec leaves open, such as a security
trade-off or a pathological-input failure, as a decision the user owns, and
offer `human-review` for judging it rather than opening another repair round.

Completion requires every acceptance criterion, reconciliation gate, and the
complete verification to pass, the single review pass to have been attempted,
and its must-fix findings to be repaired and reverified. The review outcome
belongs in the handoff rather than in that condition: record the mode used, what
came back, what was repaired, what was recorded and where, and what awaits a
user decision. When the reviewer is user-only, rejected, errors, times out, or
does not exist, say so and why, and report the verified work as complete. Offer
an exact user command as an optional next step only when the active harness
confirms it for that reviewer; in Claude Code, `/review` may alias
`code-review`, so use only the command the active session confirms, and invent
none when the harness confirms none.

## Hand off the runnable product

After that report, when the repository exposes the actual result through a
user-reviewable local server, run it through the supported development or
preview path. Verify the changed routes and essential states, share a
reachable address, and name what to review.

Reuse a healthy server owned by the current checkout or start an isolated one
while preserving other checkouts and unrelated processes. Keep that server
running until review finishes or authorized delivery cleanup stops it. If the
environment cannot provide a reachable address, report the exact launch command
and blocker without claiming a working URL. When the repository has no such
server, hand off its verified result without inventing one. Access to a running
result is evidence delivery, not human approval.
