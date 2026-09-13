# Codex review as a required GitHub gate on `main`

## Problem

Codex already reviews every pull request in `toy-crane/skills`, but nothing on
GitHub enforces its result. `main` has no ruleset and no branch protection, the
repository has no CI, and a pull request can merge before Codex has looked at
it or with its findings unaddressed. Observed on PR #106: Codex reviewed the
opening commit only; three later pushes merged unreviewed.

Codex itself gives GitHub nothing a ruleset can require. Its clean pass is a 👍
reaction on the pull request body, its findings are a `COMMENTED` review with
inline threads, and its per-review record is one summary comment it edits in
place. None of those is a check run or commit status.

## User-visible outcomes

- A pull request into `main` cannot merge until Codex has completed a review of
  the pull request's current head commit.
- A pull request into `main` cannot merge while any Codex review thread is
  unresolved.
- Nothing lands on `main` except through a pull request, and `main` cannot be
  force-pushed or deleted.
- The Codex gate shows on the pull request as one check named for Codex,
  green when the head commit is reviewed and red otherwise, with a reason a
  reader can act on (for example, "no Codex review of `<sha>` yet; comment
  `@codex review`").

## Approved scope

Two pieces of work:

1. **A repository-owned gate check.** A GitHub Actions workflow in this
   repository that reads Codex's own signals on the pull request and reports
   them as a check run on the head commit. It re-evaluates on every push to
   the pull request, whenever the pull request becomes ready for review, and
   whenever Codex creates or edits its comments, so the check turns green on
   its own once Codex finishes. It never checks out or executes pull request
   code and needs no secrets beyond the workflow token.
2. **A ruleset on `main`** carrying the required items listed below, enabled
   only after the gate workflow exists on `main`.

## Required items for the `main` ruleset

These are the items to add, in the order they matter:

| Item | Setting | Why |
| --- | --- | --- |
| Require a pull request before merging | on; required approvals **0** | The gate is a pull request check, so direct pushes must be impossible. Codex never approves, and the repository has one maintainer, so any approval count above zero blocks every merge. |
| Require status checks to pass | on; required check: the Codex gate check | This is the gate itself. Leave "require branches to be up to date" **off**: Codex reviews the head commit, not the merge result, and the setting would force a re-push and a fresh Codex round on every base change. |
| Require conversation resolution before merging | on | Codex posts findings as review threads. This makes every one of them block merge until a human resolves it, without the gate having to parse severities. |
| Block force pushes | on | Protects the reviewed history and the gate workflow file itself. |
| Restrict deletions | on | Same. |
| Bypass list | empty | The owner is gated too; the escape hatch is disabling the ruleset, which is visible in the repository settings. |

Deliberately not required: an approval count of one or more, code owner
review, signed commits, linear history, and deployment environments. See
"Off-limits".

A second required check, `claude plugin validate . --strict`, is a candidate
because `AGENTS.md` already demands it after any manifest change. It is not in
this unit's required list; see "Deferred".

## Acceptance criteria

1. Open a pull request against `main` and push nothing else. Before Codex
   finishes, the gate check is red and names the unreviewed head commit. After
   Codex's summary comment reports a completed code review of that commit, the
   gate check turns green with no human action.
2. On a pull request whose opening commit Codex reviewed, push a new commit.
   The gate check turns red on the new head. Commenting `@codex review` from a
   human account, and Codex completing that review, turns it green again.
3. On a pull request where Codex left inline findings, the merge button stays
   blocked while any Codex thread is unresolved, and unblocks once every
   thread is resolved and the gate is green.
4. A summary comment or review posted by any account other than the Codex
   GitHub app (`chatgpt-codex-connector[bot]`) does not turn the gate green.
5. A push directly to `main`, a force-push to `main`, and a deletion of `main`
   are all rejected by GitHub.
6. A pull request with the gate green, no unresolved threads, and zero
   approvals can be merged by the owner.
7. A draft pull request is not gated; Codex does not review drafts and drafts
   cannot merge anyway.

## Settled constraints and rationale

- **Evidence is the exact head commit, not "Codex looked once".** Codex here
  reviews on open and on ready-for-review only; it does not re-review pushes.
  PR #106 shows three unreviewed commits merging. A gate that accepts any past
  Codex review would enforce nothing after the first push.
- **The gate does not request the review itself.** Community reports say Codex
  ignores `@codex` comments authored by bot accounts, so a workflow-posted
  request would not work. A human comments `@codex review`, or marks the pull
  request draft and ready again. Reconsider if Codex starts honoring bot
  requests or reviewing `synchronize` events.
- **Findings block through conversation resolution, not through the gate.**
  Codex's documentation says it posts only P0 and P1 on GitHub, but this
  repository's PRs carry P2 threads (#101, #104, #105, #106). Parsing badges
  would tie the gate to an undocumented format; "every Codex thread resolved"
  is severity-independent and native to GitHub.
- **Repository-owned workflow, not a marketplace action.** Two community
  actions exist for exactly this (`JoeyTeng/codex-review-gate-action`, which
  publishes a `codex/github-review-gate` check run, and `mikelward/codex-review`,
  which publishes a `codex` commit status). Both are third-party code running
  with repository permissions, one requires three workflows plus a managed
  CODEOWNERS file, and the signals they read are the same summary comment,
  review, and reaction this repository can read in a few dozen lines. Neither
  is vendor-controlled, so neither is adopted without explicit approval.
  Reconsider if OpenAI ships an official check or status.
- **Workflow before ruleset.** GitHub only reports a required check once a run
  with that name exists on the pull request. Requiring the check before the
  workflow is on `main` blocks the pull request that adds the workflow.
- **The existing Git skills need no change.** `pr` already "honors repository
  checks" and `merge` already "respects required checks and reviews"; this unit
  changes repository settings, not the published skills.

## Assumptions (overridable)

- The gate reads Codex's summary comment (the one marked
  `codex-pull-request-review-summary`) as the completion record: a
  "Code Review … Completed" row whose commit equals the head commit is a pass.
  The 👍 reaction is corroborating evidence only, because reactions carry no
  commit and emit no webhook.
- The gate re-evaluates on `issue_comment` created/edited, because Codex edits
  that summary comment on every review, including clean ones (PR #103).
- Codex's optional security review row is not required; only the code review
  row counts.
- A red gate is a failed check, not a pending one, so the pull request never
  waits on a job that cannot finish.
- The check's name contains "codex" so a reader connects it to the review.

## Off-limits

- `skills/`, `.claude-plugin/`, `README.md`, and the published skill texts:
  nothing here changes what ships.
- A `## Code Review Rules` section in `AGENTS.md` for Codex: it changes what
  Codex flags, not whether its result is enforced. Separate idea.
- Required approvals ≥ 1, code owner review, or a human-approval requirement
  of any kind: with one maintainer these block every merge outright.
- Signed commits: pull requests from hosted agent sessions are unsigned.
- Linear history: the `merge` skill already chooses squash or rebase by commit
  meaning; enforcing it changes nothing today and would surprise a future
  merge-commit decision.

## Deferred

- **A manifest check as a second required check.** Running
  `claude plugin validate . --strict` in CI needs the Claude Code CLI installed
  headless; whether validation runs without sign-in is unverified. Decide after
  the Codex gate lands. Interim behavior: the validate command stays a manual
  step per `AGENTS.md`.
- **Symlink and README consistency check.** `AGENTS.md` requires each published
  skill to be in `plugin.json`, symlinked twice, and linked from the README.
  No script exists; out of this unit.
- **Gate behavior for pull requests from forks.** Workflow tokens are read-only
  there. No forks contribute today. Interim: unspecified.

## Remaining risks

- **Every push after opening needs a human `@codex review`.** For pull requests
  driven by hosted agent sessions, which push fixes in rounds, that is one
  comment per round from the owner. If that cost is too high, the reconsideration
  is a weaker gate (any completed Codex review plus resolved threads), which
  reopens the PR #106 hole.
- **Codex's summary comment format is undocumented.** The gate parses a table
  Codex may change. A format change turns the gate red everywhere, not green,
  so the failure is visible rather than silent.
- **Codex can miss a review request** (service outage, quota). The gate stays
  red until the owner re-requests or disables the ruleset.
- **"Codex ignores bot comments"** comes from community write-ups, not OpenAI
  documentation. If wrong, the gate could request reviews itself, removing the
  first risk.

## Evidence checked

- Codex documentation, `learn.chatgpt.com/docs/third-party/github`: Codex
  posts "a review on the pull request, just like a teammate would", triggers on
  `@codex review` or automatically on new pull requests, flags P0 and P1 on
  GitHub, reads `## Code Review Rules` from `AGENTS.md`. Silent on check runs,
  re-review on push, and bot-authored requests.
- This repository: `main` has no ruleset and no branch protection; merge
  commits, squash, and rebase are all allowed; no `.github/` directory. PR #103
  (clean): 👍 reaction plus summary comment "Completed, `cb5136b`, PR opened".
  PR #106 (findings): `COMMENTED` review from `chatgpt-codex-connector[bot]`,
  P2 inline threads, summary comment showing only the opening commit, four
  commits in the pull request.
- `JoeyTeng/codex-review-gate-action` v2 and `mikelward/codex-review`: both
  exist because Codex publishes no check; both poll the same signals.
