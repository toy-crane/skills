# Resolve follow-ups through isolated verified pull requests

## Problem

Projects can accumulate evidence-backed files under `docs/follow-ups/`, but
resolving them still depends on someone noticing each item and starting a new
session. Running one scheduled automation per file creates unnecessary schedule
management, while letting several writing agents share one checkout risks mixed
changes and coupled pull requests. Some recorded symptoms may also be transient,
so an automated fix must not begin from an unverified report.

## Outcome

Publish a `resolve-follow-ups` workflow skill that a manual invocation, Codex
Scheduled task, or Claude Routine can use to sweep a bounded set of follow-ups.
Each selected item is handled by one isolated worker in its own worktree and
branch. A worker opens an independent ready-for-review pull request only after
it reproduces the symptom, confirms that the intended behavior is already
settled, and verifies the fix. The workflow never merges its own pull requests.

## Invocation and batch boundary

- One invocation is one sweep, not one follow-up. The Schedule or Routine owns
  whether the sweep runs once, daily, or two or three times per day.
- A sweep selects at most three qualifying files from `docs/follow-ups/`, with
  older qualifying discoveries taking precedence so newer files cannot starve
  them indefinitely.
- Every selected follow-up must retain the five fields required by the current
  follow-up format. An incomplete item is reported but not inferred from the
  original conversation or repaired speculatively.
- A sweep may run workers concurrently only after their scopes are shown to be
  independent. Otherwise it processes them separately without sharing a
  checkout, branch, commit, or pull request.
- One failed worker does not prevent other independent selected items from
  reaching their own outcomes.

## Shared worker contract

Every platform adapter gives a worker exactly one follow-up path and one fresh
isolated checkout. The worker owns that item through one of the terminal
outcomes below.

### Establish a trustworthy base

- Start from the fetched remote default branch rather than an arbitrary local
  branch or a stale cached ref. A failed fetch or mismatched worktree `HEAD`
  blocks that item instead of falling back silently.
- Use one new branch and worktree for the item. Files changed for another
  follow-up must never enter its diff.
- Record the follow-up content identity and base commit used for the attempt so
  an unchanged non-reproducible or blocked item is not retried by every sweep.
  It becomes automatically eligible again when its follow-up content or the
  remote default-branch commit changes.

### Pass the reproduction gate

- Before modifying product source, reproduce the recorded symptom through the
  command, route, test, or environment named by its observed evidence.
- Preserve concrete baseline evidence: the failing assertion, exit status,
  observable output, or runtime state that distinguishes failure from success.
- If the symptom is not reproducible within the bounded run, stop without a
  speculative source change or resolution pull request. Keep the follow-up and
  report what was attempted and what evidence would make another attempt useful.
- If reproduction exposes a different defect, keep the selected follow-up open
  and route the newly observed out-of-scope defect through the existing
  follow-up lifecycle.

### Confirm that the fix is authorized

- Derive intended behavior from current tests, specifications, decision
  contracts, supported runtime behavior, or an unambiguous compatibility
  contract.
- Continue automatically only when the intended behavior is already settled
  and success can be checked deterministically.
- When resolving the symptom requires choosing product behavior, changing a
  public contract, or accepting a material trade-off, leave the follow-up open
  and report it as needing `shape-idea`. The worker does not make that decision
  merely because it can produce a plausible patch.

### Repair and verify

- Make the smallest coherent change that addresses the reproduced cause and
  retain a regression check through a pre-agreed public seam when one is
  available.
- Re-run the reproduction evidence after each meaningful candidate change and
  continue only while a new attempt is supported by new evidence. The loop is
  bounded; repeated failures without new evidence become a blocker rather than
  unlimited repair work.
- Run the repository's focused deterministic checks and the affected runtime
  verification required to establish the user-visible or externally observable
  result. Static checks alone do not close a runtime symptom.
- Treat the item as resolved only when the original failure now passes and the
  relevant regression checks remain green.

### Publish one reviewable result

- Commit the verified fix and delete its `docs/follow-ups/<slug>.md` file in the
  same branch. Git history remains the archive for the resolved record.
- Open one ready-for-review pull request for that branch. Include the original
  reproduction evidence, post-fix evidence, checks run, and any remaining
  uncertainty in its description.
- Do not combine multiple follow-ups in one pull request and do not merge the
  pull request automatically.
- After the branch is safely published and the pull-request result is recorded,
  clean up the local worker process and worktree without touching another
  worker's checkout.

## Platform adapters

The skill preserves the shared worker contract while using the active host's
native isolation where it provides the same guarantees.

### Claude Routine

- Within an existing Claude session, dispatch each selected item to a subagent
  with worktree isolation. The native creation path must be paired with a
  creation-time base check or `WorktreeCreate` policy that stops when the remote
  default branch cannot be fetched; Claude's documented local-`HEAD` fallback
  is not sufficient for this workflow. Claude otherwise owns the native
  worktree lifecycle and the parent Routine collects the workers' terminal
  outcomes.
- An external headless automation may instead start a top-level Claude process
  in a dedicated worktree. That adapter must explicitly clean up non-interactive
  worktrees after the branch has been published.
- A Routine does not start a nested Claude CLI process merely to reproduce
  isolation already guaranteed by its native worktree subagents.

### Codex Scheduled task

- The scheduled task acts as the sweep coordinator. Its own background
  worktree does not count as per-item isolation.
- Because a spawned Codex subagent does not currently provide a reliable
  per-worker working-directory boundary, a deterministic adapter creates and
  verifies each item worktree, then starts a top-level non-interactive Codex
  worker rooted in that directory.
- The adapter owns worker concurrency, exit status, attempt identity, and
  cleanup. The skill owns eligibility, reproduction, authorization,
  verification, and pull-request outcomes.

## External capability evidence

- Claude documents `isolation: worktree` for subagents, `--worktree` for
  top-level sessions, `WorktreeCreate` and `WorktreeRemove` lifecycle hooks, and
  `-p` for non-interactive execution. Its worktree documentation also says the
  default fresh-base path may fall back to local `HEAD` when fetching fails, so
  this workflow needs the stricter creation-time check above:
  <https://code.claude.com/docs/en/worktrees> and
  <https://code.claude.com/docs/en/headless>.
- Codex documents `codex exec` for scripts, CI, and scheduled jobs and `-C` for
  setting the worker's workspace root:
  <https://learn.chatgpt.com/docs/non-interactive-mode> and
  <https://learn.chatgpt.com/docs/developer-commands?surface=cli>.
- Codex documents a background worktree for a scheduled run but not a distinct
  worktree for each spawned subagent. A request for per-spawn working-directory
  selection remains open, so the Codex adapter cannot currently rely on native
  child-worker isolation:
  <https://learn.chatgpt.com/docs/automations?surface=app>,
  <https://learn.chatgpt.com/docs/agent-configuration/subagents>, and
  <https://github.com/openai/codex/issues/18969>.

## Sweep report

The coordinator returns one compact result per considered follow-up using only
these terminal outcomes:

- `pull-request`: reproduced, verified, and published for human review
- `not-reproduced`: unchanged source; follow-up retained
- `needs-shaping`: intended behavior or trade-off is unsettled; follow-up retained
- `blocked`: environment, base, permissions, or verification prevented a safe
  conclusion; follow-up retained
- `invalid-follow-up`: required evidence fields are incomplete; file retained
- `skipped-unchanged`: the same follow-up content and base commit already reached
  a non-PR outcome

The report links each pull request and names the evidence or next condition for
every non-PR outcome. It does not present a skipped or blocked item as fixed.

## Acceptance criteria

- A sweep with five qualifying follow-ups starts no more than three workers and
  requires only the one Schedule or Routine invocation.
- Two independent reproduced defects produce two worktrees, branches, commits,
  and ready-for-review pull requests with no shared changes.
- A transient symptom that cannot be reproduced produces no product-source
  change and no resolution pull request, remains recorded, and is skipped on an
  unchanged subsequent sweep.
- A reproduced issue whose correct behavior is not settled produces no patch
  and is reported as needing `shape-idea`.
- A worker based on a stale or unverified remote ref stops before editing.
- A successful pull request proves the failure before the fix, proves the result
  afterward, runs the relevant regression verification, and removes only its
  resolved follow-up file.
- Neither platform adapter merges a pull request or modifies another worker's
  checkout.
- Claude uses native worktree-isolated subagents when invoked by a Routine;
  Codex uses a separately rooted top-level worker for each selected item.

## Assumptions

- `resolve-follow-ups` is the public skill name and it belongs under
  `skills/workflow/`.
- The target is a Git repository with a discoverable remote default branch and
  credentials that permit branch publication and pull-request creation.
- Each host already has its corresponding CLI authenticated when its adapter
  requires a non-interactive worker.
- The default sweep limit is three. Schedule frequency, resource limits, and
  notification delivery remain host configuration rather than skill state.
- Attempt identities may be stored as disposable local automation state; they
  are not project knowledge and must not add status fields to follow-up files.

## Off-limits

- Automatic merging or direct writes to the remote default branch
- One schedule per follow-up
- Multiple follow-ups in one worker, branch, or pull request
- A speculative patch when the recorded symptom does not reproduce
- Choosing unsettled product behavior in order to make automation continue
- Treating the coordinator's worktree as isolation for all item workers
- Adding priority, status, assignee, estimate, or attempt metadata to the
  tracked follow-up format

## Deferred points and remaining risks

- Exact wall-clock, token, and concurrency limits are host policy. The adapter
  must enforce a finite budget, but the published skill should not hardcode one
  provider's limits for the other.
- A local attempt identity prevents repeated work on one machine but does not
  synchronize retries across multiple machines. Reconsider a shared queue only
  if the workflow is later run by several coordinators against the same
  repository.
- Independent pull requests can still conflict when they land. Human review,
  CI, and the repository's merge queue remain responsible for rebasing and
  integrated verification.
- Codex may later add native per-subagent working-directory or worktree
  isolation. When it provides the same creation, base-verification, and cleanup
  guarantees, replace the external adapter rather than retaining duplicate
  orchestration.
