---
name: implement
description: Implement or resume settled repository work from implementation-ready requirements, a spec, or approved task files. Use when the user wants that work completed in the current checkout through deterministic verification and independent review; not for shaping or task splitting.
---

# Implement

## Keep one implementation owner

Treat the selected requirements or spec, approved task files, repository
instructions, relevant project decisions, and current code as the authority.
Preserve settled outcomes and constraints. If several active work units match,
have the user select one before changing files.

Use the current write-capable context as the implementation owner for the whole
work unit. Continue through related task boundaries with the code model,
decisions, failed attempts, and test evidence already learned. Replace this
context only after an actual interruption makes it unavailable, not because a
task ended or the remaining work is predicted to be large.

Implement one coherent spec directly. For approved tasks, follow dependency
order and complete each vertical outcome before starting a dependent task. A
task boundary is a delivery and verification checkpoint, not a context boundary.

## Checkpoint complete outcomes

Carry each outcome through every layer its acceptance criteria require. Add or
update focused deterministic tests, run the checks that establish the outcome,
inspect its complete diff, and update its acceptance checkboxes, status, and
concise verification or blocker evidence.

Follow the repository's commit policy. Where commits are expected, place code,
tests, and the task update in the same meaningful checkpoint. Keep phase
transitions, review state, counters, and commit identifiers out of standalone
commits. Use focused checks at intermediate boundaries and reserve the full
required suite for the integrated result unless risk or repository policy calls
for it earlier.

## Review selected boundaries

Run an independent review only where a task declares a
`## Review checkpoint`. After that boundary's deterministic verification and
meaningful checkpoint, give a fresh read-only reviewer the governing
requirements, tasks in scope, exact cumulative diff, verification evidence, and
stated risk. Ask for blocking correctness, security, regression, or
specification findings with file-and-line evidence; style advice does not block.

Keep repairs with the implementation owner. Fix blocking findings in this
context, rerun affected checks, and ask the same reviewer to verify the repair
when possible. Keep the reviewer read-only and confirm Git state is unchanged.
If no independent review context is available, report that limitation rather
than marking the checkpoint passed.

## Finish the integrated result

After all outcomes are implemented, run the complete deterministic verification
required by the repository and requirements. Then give one fresh read-only
reviewer the entire implementation diff and ask it to inspect cross-task
interactions and omitted requirements under the same blocking criteria. This
final review applies to split and unsplit work without a task-file declaration.

Repair final findings in this implementation context, rerun affected checks and
the complete required verification, and obtain a passing re-review. Finish only
when every acceptance criterion is met, verification passes, no blocking review
finding remains, and the worktree state is understood. Remote writes such as
push, hosted review, merge, or deployment require separate authorization.

## Resume after interruption

Reconstruct the next action from the requirements, task statuses, Git history,
current diff, and test results. Continue from the last completed vertical
checkpoint in one new implementation context across the remaining work.

Repository evidence outranks a prior summary. Preserve dirty changes whose
ownership is known; request confirmation before absorbing ambiguous changes.
Record a concise blocker and ask for the smallest needed decision when state
cannot be reconciled, a failure persists without progress, or completion needs
new authority.
