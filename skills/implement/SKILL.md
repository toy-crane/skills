---
name: implement
description: Implement or resume settled work from requirements, a spec, or approved task files. Use when the user wants that work completed in the current checkout with verification and independent review; not for shaping or task splitting.
---

# Implement

Implement the selected work as settled. For a task set, follow its blockers and
keep this context as the implementation owner across tasks and review fixes.
After an actual interruption, reconstruct progress from the spec, tasks, Git,
diff, and tests, then continue the remaining work in one context. Do not absorb
ambiguous dirty changes without confirmation.

Complete each outcome and its acceptance criteria with focused verification.
When task files exist, check their acceptance criteria, mark finished tasks
`completed`, and record verification evidence. Where commits are expected,
commit code, tests, and the task update together as a meaningful checkpoint.

At a declared `## Review checkpoint`, give a fresh read-only reviewer the
cumulative diff, requirements, verification evidence, and stated risk. Fix its
blocking correctness, security, regression, or specification findings in this
implementation context, rerun affected checks, and have the reviewer recheck.

After all outcomes, run the complete required verification and one fresh
read-only review of the entire implementation diff. Repair findings here and
repeat verification and review until no blocker remains. Finish only when every
acceptance criterion passes. If independent review is unavailable, report the
missing gate instead of claiming completion. Remote writes require separate
authorization.
