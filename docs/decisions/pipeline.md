# Pipeline

## Decisions

- `define-product` owns creating the permanent app-level context for a
  from-scratch application and making deliberate changes to its product meaning
  with the user. It is the greenfield entry point before work-unit shaping and
  does not produce a work-unit spec. Its input includes at least a rough app
  direction or problem the user already wants to pursue. That seed starts an
  interview; it does not authorize the AI to complete missing product meaning.
  The skill draws out the user's actual use situation, current behavior, and
  desired change, confirms the complete direction, and only then writes
  `PRODUCT.md`. It converges the chosen seed rather than discovering
  opportunities from a blank page.
- `discover-opportunity` is not part of the pipeline. The greenfield entry point
  leaves a durable current artifact instead of handing a chosen direction to
  shaping through conversation alone.
- `shape-idea` remains independent. It starts from a concrete problem and broad
  direction, reads app-level context when one exists, closes or defers material
  work-unit decisions, and writes the implementation-ready spec. Missing
  app-level context neither blocks shaping nor makes `shape-idea` create it. It
  owns new specs only; revising an existing one against later work belongs to
  `babysit-specs`.
- `shape-idea` closes by summarizing the complete product contract and making
  the approved change judgeable from the user's point of view. It chooses the
  explanation and approved visual evidence that best reveal the intended
  experience and important downstream consequences, while distinguishing
  intended behavior from implemented evidence.
- `babysit-specs` owns cross-work-unit spec revision. It takes one or more
  spec folders, or every folder under `docs/specs/` when none is named, takes
  each spec's last commit as its baseline, and compares the contract with the
  Git history since it plus the current behavior of the surfaces the spec
  names, including its linked prototype rendered against the current surface.
  It triages by meaning rather than by cost: a correction that preserves the
  approved meaning is applied in place as an overridable assumption, while one
  that would change an approved outcome, criterion, constraint, off-limits
  area, or deferred point is settled by one question with a recommendation. It
  rewrites `spec.md` in place with no change log, never edits product source,
  names a folder whose revised outcomes no longer fit the folder-division rule
  for `shape-idea` to re-divide, routes prototype drift to
  `build-prototype` or records it as a risk, and reports a fully delivered spec
  as a retirement candidate instead of deleting it.
- `maintain-project-context` periodically reconciles the durable context left by
  the workflow, including `PRODUCT.md`. It can reflect already-settled meaning
  and remove stale or duplicated wording without becoming a pipeline gate or a
  product decision-maker. When an issue tracker is configured, it also repairs
  each spec folder's issue, found by its `Issue:` line, against spec folders on
  the fetched remote default branch; it never treats tracker prose or state as
  product authority.
  A material ambiguity is returned to the user or `define-product` rather than
  inferred from implementation.
- Every spec-producing path writes the same stable product contract:
  user-visible outcomes, approved scope, observable acceptance criteria,
  settled constraints and rationale, assumptions, off-limits areas and
  reasons, deferred points, remaining risks, and setup before implementation.
  It records behavior and decisions rather than predicted implementation.
  `build-prototype` creates or updates this contract when its approved surface
  closes without a prior shaping handoff and consequential behavior outside
  that surface is settled or explicitly deferred.
- Implementation planning is just-in-time against current code. There is no
  separate plan-writing skill or durable `plan.md` lifecycle.
- A shaped change with several outcomes is divided into spec folders by
  `shape-idea`, not into task files inside one folder. A folder holds an
  outcome that could land on the default branch and stay there even if the
  rest never arrives. Preparation useful only to a later outcome, or a part
  that would regress current behavior on its own, joins the folder of the
  outcome that first needs it. Outcomes that pass that test still stay in one
  folder unless one is wanted earlier than the rest, a wait outside the
  repository such as a legal review or store release separates them, a later
  outcome builds on a foundation whose material risk tests cannot settle, such
  as security, permissions, a data migration, or an external contract, so it
  needs its own review before a defect compounds through it, or they are
  unrelated changes with no reason to share a pull request. Each reason must be
  a fact of the change that the user stated or the repository shows. Dependence
  alone never separates outcomes, nor does a risk inferred from the kind of
  work or the general value of smaller reviews. Operations or states inside one
  workflow, technical layers, including a server, API, or data layer only the
  rest of the change uses, and session size never divide a folder. Work done
  only outside the repository never becomes a folder: preparation goes to
  `Setup before implementation`, and actions after release stay in the spec.
  Dependent folders carry `Blocked by: docs/specs/<other>/` lines.
- `implement` receives one selected `docs/specs/<slug>/` folder as a single
  handoff bundle anchored by `spec.md`. Before implementation it loads the spec,
  explicitly linked decision contracts,
  any other decision contract implicated by repository evidence, and every
  prototype or screen-state artifact the handoff identifies as an approved or
  selected implementation reference. It reads textual sources and renders or
  otherwise inspects visual artifacts; mere presence in the folder does not
  establish approval. It implements `spec.md` directly, one folder per run,
  and derives the active outcome's implementation
  approach just in time from the current repository state.
- Before changing source for an outcome, `implement` compares the spec's
  assumptions, settled constraints, and acceptance criteria with the current
  code and the Git history since the spec folder's last commit; its own
  commits advance that baseline. A mismatch that would
  change an approved outcome, acceptance criterion, off-limits area, or product
  constraint stops that outcome before any source change, names the stale point
  and its evidence, and routes it to `babysit-specs` for that folder alone.
  The check reads the selected spec
  against the repository, so `implement` still never reads sibling spec
  folders.
- The spec-writing skills own the producer side of that loading rule. A spec
  links the approved prototype and the decision contracts its work unit depends
  on. Linked sources are pointed at
  rather than restated, and a link names a complementary source beside the
  product contract rather than adding a field to it.
- Explicit product contracts and approved references complement one another:
  the former retain their stated product meaning, while an approved visual
  reference supplies the concrete composition and states it covers. A conflict
  names both sources and the affected behavior or screen-state coordinate,
  blocks that outcome and its dependents, and returns the decision to shaping;
  neither source silently overrides the other.
- `implement` maps every acceptance criterion of the active outcome to at
  least one check: an automated test, an eval, runtime evidence, or a
  combination. An eval proves a criterion about the quality of LLM output that
  varies run to run; `implement` hands those criteria to `llm-evals`
  ([testing](testing.md)). Runtime
  evidence stays owed for behavior in the running product even when a test
  also proves it. `implement` hands `tdd` the active outcome, the criteria
  to prove by automated tests, the approved references, and the spec as
  design context. `tdd` selects the public test seams and hands
  back the code change, the passing tests each tied to its criterion or named
  reason with the failing assertion it was seen to produce, and any handed
  criterion it could not prove automatically with the reason. `implement`
  covers those through runtime evidence or reports them incomplete, and
  reports each criterion with its checks and evidence.
- When the project holds a regression suite and the change touches the
  behavior it guards, `implement` runs that suite and reports the result as
  evidence beside the criterion's own checks ([testing](testing.md)). A climb
  runs it at its gates, so this covers the changes that reach the behavior
  without one.
- Approval of an eval is split in two. The spec states what good means for an
  LLM-output criterion: the metric, the target on held-out cases, and where
  the cases come from, so implementation cannot lower the bar. Before building
  the eval, `llm-evals` asks once how to reach the model: an API key,
  recommended when one exists, or a Claude Code or Codex subscription through
  its CLI. Without a key it offers the subscription instead of stopping, and
  stops only when neither exists. It then builds the concrete case set and
  grader, and pauses once before its first
  paid run to show the cases, graded samples, run size, noise floor beside the
  target gain, and estimated cost, or estimated usage-limit consumption on a
  subscription, for the user's approval. After approval it climbs without asking until
  green, a plateau of three rounds inside the noise floor, or the approved
  spend; an unreached target goes back to `implement` with the best held-out
  score and failure causes, and the criterion stays incomplete.
  Technical uncertainty is resolved through repository evidence; only
  unresolved expected behavior or a change to the agreed product contract
  requires a user decision.
- For each affected product surface, `implement` uses an available matching
  runtime-verification skill. When none is available, implementation authority
  covers investigating the repository and current environment, selecting the
  strongest usable runtime observation path, and carrying out that verification
  without pausing for approval of the technical method. Behavior not verified
  in the running product remains incomplete; static checks do not replace it.
- Each outcome's focused runtime verification ends with adjacent probes: after
  the acceptance criteria pass, `implement` exercises at least one deliberate
  misuse next to each changed behavior, at the same surface and through the
  same runtime path, chosen from what the change touches rather than from a
  fixed checklist. A probe that holds is still recorded with what was tried.
  Probe results are triaged by the same rules as whole-diff review findings:
  repair what breaks an acceptance criterion or is a confirmed defect on a
  path ordinary use reaches, record an evidenced out-of-scope defect as a
  follow-up, and report behavior the spec leaves open as a decision the user
  owns. Probes run before review so their repairs are reviewed; the final
  changed-flow and core-loop gate adds none.
- For a screen-based outcome with an approved visual or state reference,
  runtime verification compares the actual implementation at every applicable
  screen, state, and viewport coordinate. It checks composition, content,
  hierarchy, containment, placement, visibility, and relevant transitions and
  recovery rather than treating element presence or navigation alone as a
  match. Every claimed platform supplies its own actual-screen comparison for
  the same applicable screens and states through that platform's intended layout
  and native conventions. A non-visual handoff adds no prototype or screen gate.
- Each specialized runtime-verification skill owns its runtime preflight and
  separates readiness, known initial state, and observed behavior. It uses the
  least destructive state profile that proves the scenario: app-scoped known
  state by default, a dedicated fresh target only for device-level claims or
  evidenced contamination, and deliberately preserved prior state for upgrade,
  migration, or returning-user behavior. Client reset never implies host or
  backend reset, and destructive preparation has one owner before concurrent
  observation begins.
- After the whole-diff review and any must-fix repairs, or an explicit review
  waiver, `implement` re-verifies the changed flow and the
  representative core-loop journey from `PRODUCT.md` on every platform its
  result claims. When no core loop is defined, it verifies the changed flow and
  reports the missing regression coverage rather than inventing a journey. A
  later repair that changes executable product behavior invalidates earlier
  final runtime evidence, so this gate repeats on the repaired revision without
  a second review pass. Focused runtime checks and outcome reconciliation stay
  before review; final core-loop verification is not a review prerequisite.
- Each outcome is complete after its acceptance criteria and focused
  deterministic verification pass, followed by reconciliation of the observed
  behavior with every required handoff source and applicable acceptance or
  approved-reference criterion. When repository policy calls for commits,
  code and tests form one meaningful checkpoint.
- During reconciliation, `implement` may update technical assumptions,
  verification, and acceptance wording while preserving the
  approved observable product contract. A proposed change to a user-approved
  outcome, scope, observable acceptance criterion, off-limits area, or other
  product constraint preserves current artifacts and evidence, blocks affected
  and dependent work, and pauses implementation for a shaping decision.
- A previously completed outcome whose acceptance criteria no longer pass is
  not current completion evidence. Repair or block it before final completion
  continues.
- After every outcome is implemented, rerun the complete deterministic
  verification, then complete one pass of the active harness's automated
  code-review process over the entire implementation diff against the selected
  spec and acceptance criteria, covering interactions between outcomes and
  omitted requirements. It stays inside `implement` because must-fix findings
  return to implementation. Because each folder runs separately, this pass also
  finishes before any folder that names it in `Blocked by:` starts, which is
  what an intermediate review between dependent outcomes used to buy.
- The review depth is `implement`'s judgment for the change at hand, weighing
  what the change touches against what verification already settles. It names
  the mode explicitly where the harness offers modes, because one given no mode
  may reuse an earlier invocation's, and takes the harness's standard mode when
  nothing argues either way. The run stays single at any depth. Wherever the
  harness accepts review context, the reviewer receives the required handoff
  sources or their repository paths: the spec's approved scope, off-limits
  areas and remaining risks, linked decision
  contracts, applicable approved reference artifacts, and the focused
  verification evidence already collected. A pass counts only
  when the reviewer finishes inspecting the intended scope and returns findings
  or an explicit no-findings result. Failed, partial, silent, and mistargeted
  attempts are not completed passes.
- `implement` fixes a finding only when it shows an approved acceptance
  criterion failing, or is a defect or caused regression in the changed
  behavior that reproduction confirms on a path ordinary use reaches. It then
  reruns the affected verification, then performs the final changed-flow and
  core-loop runtime gate on every claimed platform after triage and repairs.
  A failure at that final gate returns to repair and affected verification,
  followed by final verification of the repaired revision. It sends no scope
  through the reviewer twice in that
  run, including repairs made to an already-reviewed scope. Every other finding
  is recorded instead: an evidenced defect or open workaround becomes a
  follow-up, an already-disposed trade-off is noted as disposed, and a material
  consequence the spec leaves open is named in the handoff as a decision the
  user owns.
- Completion requires every required handoff source to have been inspected and
  every applicable acceptance and approved-reference criterion to be reconciled with
  the executable revision, alongside passing verification, reverified must-fix
  repairs, and each required automated review finishing and being triaged or
  explicitly waived for that scope. An unread source or uncompared criterion
  keeps the result incomplete. Recorded findings can remain; zero findings is
  not the gate.
- `implement` closes its completion report by making the delivered change
  directly reviewable from the user's point of view. It chooses the strongest
  evidence the current executable revision affords so the user can understand
  the resulting experience, follow important downstream effects, and notice a
  mismatch with the approved intent without having to ask what changed. The
  presentation follows the work rather than a fixed screen or report checklist;
  intended or stale visuals never stand in for the delivered result.
- Review execution reuses applicable user authorization without asking again.
  A service-backed request identifies the actual destination and diff, spec,
  and related source context, and carries that authorization accurately.
  Read-only file access does not imply local-only processing. The skill cannot
  grant permission for a new service or wider source scope.
- Recoverable command, compatibility, environment, and transient errors are
  resolved within the authorized scope and retried without consuming the pass.
  An explicit policy denial instead requires a materially safer permitted
  alternative or the specific missing authority, with its rationale preserved;
  switching tools or services to bypass the same denial is not recovery.
  When a model-invocable reviewer lacks user permission, establish the service
  and source scope and ask for that permission; a confirmed manual command does
  not resolve the authorization blocker.
- A user-only or absent reviewer, missing permission, or unresolved execution
  failure leaves overall completion pending. Preserve verified outcomes and provide their
  evidence, exact review blocker, and next required action. Name a user command
  only when the active harness confirms it. Only the user can waive review.
- After the review pass and any must-fix repairs, or while review is pending,
  `implement` runs the actual product when the repository exposes it through a
  user-reviewable local
  server, verifies the changed routes and essential states, and shares a
  reachable address while keeping the current checkout's server available until
  review finishes or later delivery cleanup.
- Context or harness interruption resumes from the spec folder, Git history, current diff, and test results. Preserve completed outcomes and
  request user confirmation before absorbing dirty state of uncertain
  ownership.
- Before beginning another outcome, `implement` reloads the current handoff and
  repository evidence. The same context may continue, but remembered
  conversation alone cannot supply the next outcome's plan or current truth.
- When shaping settles on a framework or hosted service, route its current
  agent context through `add-stack-context`. The
  [stack-context](stack-context.md) contract owns discovery, source acceptance,
  live vendor-document routing, and the audit used during setup, stack changes,
  and entry into an unchecked project.
- Setup that lives outside the repository and that implementation needs, such
  as a vendor account, an issued key, or a console or DNS setting, is listed
  by `shape-idea`, or `build-prototype` when it writes the spec, in the spec's
  `## Setup before implementation` section: one line per item naming what is
  needed, which outcome it serves, and the observable condition that shows it
  is done. The section reads `None.` when nothing is needed and never holds a
  secret value. Each done condition must be observable without the work the
  spec delivers. After claiming the folder and before its first source change,
  `implement` does what it can of each item itself, then checks every done
  condition. If any item remains, it reports all remaining items at once and
  stops before changing source; it resumes when the user says they are done
  and the conditions pass, never asking for or printing a secret value.
  `babysit-specs` keeps the section when it rewrites a spec. A spec without
  the section proceeds as before.
- Before building on or working around a third-party package or tool,
  `shape-idea` grounds its conclusion in evidence of how that dependency
  actually behaves and confirms it in the project. The spec records what was
  checked, what fell short, and the upstream change that would reopen the
  decision.
- When execution applies a workaround whose root cause stays open, or observes
  an out-of-scope defect with evidence, it records a follow-up at the moment of
  discovery through `project-knowledge`. `implement` and each
  runtime-verification skill carry this routing; `project-knowledge` owns the
  criteria and format. A recorded
  follow-up is a valid `shape-idea` input or a direct fix seed for a later
  session.
- `setup-issue-tracker` keeps the always-loaded tracker section focused on
  purpose, explicit user authority to resume active work, and PR-linked closure.
  It routes issue work to `docs/issue-tracker.md`, which holds repository-specific
  keys, tools, claim states, closing behavior, and operations. Exact argument
  lists come from current tool help; general guidance stays with the skill.
  Consumers read the linked convention without requiring the setup skill to be
  installed and continue to support existing inline conventions. This avoids
  loading MCP recipes into every session while preserving custom tracker behavior.
  When scheduled general-issue triage is enabled, the same convention records
  its triage states.
  An active issue requires an explicit user request to resume even when the
  assignee is the current account: shared accounts do not identify sessions.
- One spec folder links to one tracker issue through a single
  `Issue: <tracker>:<id>` line in its `spec.md`, such as `Issue: linear:FLY-145`
  or `Issue: github:#12`. PR bodies carry the same line, including a direct fix
  of a known issue with no spec folder. Every lookup fetches the issue by that
  ID; no skill lists issues or searches titles to find one. Titles carry no
  key or prefix, and no label marks a spec issue: an issue tied to a spec is
  under review or waiting for implementation, so the review signal, an open
  linked PR, or a default-branch `Issue:` line keeps it out of general triage. Without a tracker section no issue is created, no `Issue:`
  line is written, and every skill skips its tracker steps. Skill bodies name
  no specific tracker; tools, state names, and closing references live only in
  the setup templates and the repository's `docs/issue-tracker.md`.
- `pr` creates the issue. Just before opening a PR that carries a spec folder
  (added, changed, or named by a `Spec-Folder` trailer) whose `spec.md` has no
  `Issue:` line, it creates one issue titled with the spec title, carrying the
  review signal and a bounded spec section as its body, commits the line on
  the same branch, and then opens the PR. `merge` and `triage-issues` open
  PRs by invoking `pr` ([skill-design](skill-design.md)). `shape-idea` and `triage-issues` write
  the line only for an issue ID they already know, from the user or the issue
  triage started from; they never find one by title search. Duplicates that
  still arise are tidied by a person in the tracker.
- Once created, an agent-made issue is handled exactly like a human-written
  one: its title and body stay, and only its bounded spec section is refreshed
  from `spec.md`, so its title does not follow later spec title changes. The
  repository's `spec.md` remains the implementation contract; the section is a
  readable copy, not a separately edited authority. `merge` refreshes the
  section and blocking edges for folders the merge changed, and
  `maintain-project-context` periodically repairs every default-branch
  folder's issue by ID. The tracker holds the claim, blocking edges, and open
  or closed state.
- `implement` still takes the folder as input and claims the issue its
  `Issue:` line names; a folder without the line proceeds unclaimed until its
  PR creates the issue. Cross-folder ordering is a
  `Blocked by: docs/specs/<other>/` line in `spec.md`, written whether or not a
  tracker exists, and `implement` leaves a `Spec-Folder` commit trailer so `pr`
  and `merge` can find the folder whose issue to close. A PR closes the issue
  only when its diff and verification establish implementation delivery; a
  merged spec-only PR leaves the issue open and moves it through the
  convention's mark-ready operation to a non-active, ready-for-implementation
  state, never back to general triage. Folder deletion alone never closes an
  issue. An open linked PR excludes the issue from triage; when a spec PR
  closes unmerged, triage returns the issue to a non-active state such as
  Backlog after checking for other active work. A separate stale-review query
  finds those issues, because the new-issue query skips them; the cleanup
  clears a stale review signal and does not make the issue new. Merged PR bodies keep the
  exact `Issue:` line so a later pass can retry a failed close or ready
  transition after the branch and trailers are gone. Blocker edges come from
  the `Issue:` lines of the folders a `Blocked by` line names; when one has no
  line, the dependent issue's blocker set stays unchanged and is reported.
- `triage-issues` handles each issue once, when it is new: the one issue a
  request names, or otherwise only the issues the convention's not-yet-judged
  query returns, those with no `Triage 요약` or spec section and no triage
  result.
  Its outcomes are unchanged: a duplicate closes, a clear small change becomes
  a verified PR, a designed change becomes a spec PR, and a missing fact or
  product choice becomes a question. It does not re-select a waiting issue on
  a human comment or body edit and reads comments only as evidence. Continuing
  a waiting issue after a person answers belongs to whoever runs the skills,
  through `shape-idea`; without a runner, a person invokes it.
- The old `Source-Issue` line, `spec:<slug>` title key, and managed-issue
  listing are not read for compatibility. Each project renames the line in its
  active spec folders when it updates the skills, and rerunning
  `setup-issue-tracker` replaces an outdated convention.
- `resolve-follow-ups` sweeps the fetched remote default-branch backlog in
  discovery order and starts no more than three eligible workers. Each item gets
  its own verified fresh-base worktree, branch, commit series, and ready-for-
  review pull request. A worker edits only after reproducing the symptom and
  finding a settled deterministic success condition; it never merges its pull
  request.
- Attempt state is disposable local coordination data keyed by the current
  follow-up lifetime, content, and base commit. Atomic owner claims prevent
  duplicate workers, repository-wide coordinate reservations prevent two
  attempts from sharing one worktree, and cleanup revalidates that reservation
  before asking Git to remove a still-clean checkout. Clean initialized
  submodules are deinitialized through isolated temporary Git metadata without
  changing shared repository settings or bypassing Git's final dirty-worktree
  refusal. Terminal results retain decisive evidence. An
  interrupted non-terminal claim is recovered only after the adapter proves its
  worker ended and cleans up its exact bound worktree or missing Git registration.
  Prepare persists the canonical worktree target before checkout creation, and
  terminal identity retains owner and cleanup coordinates, so either interruption
  window remains recoverable. Active claims and pull-request outcomes continue to
  suppress unchanged content across unrelated base advancement; deletion followed
  by re-creation starts a fresh lifetime even when the Markdown is identical,
  including when a merge restores the path against its default-branch parent.
  Non-PR outcomes become retryable when the base changes, but only after any
  surviving terminal worktree is reconciled. A published branch is reconciled
  with its pull request before any interrupted claim can be recovered.

## Boundaries

- `define-product` owns deliberate app-level product definition, while
  `shape-idea` owns work-unit shaping and `maintain-project-context` owns
  periodic cross-artifact hygiene. None makes another's artifact a required
  input, and the app-level context does not absorb work-unit scope or acceptance
  criteria.
- A user with no app direction is outside the greenfield skill's input
  contract. The pipeline does not mine personal traces or invent candidate
  opportunities to manufacture that missing seed.
- A partial direction is valid input to the interview but not a complete
  product definition. Missing central meaning blocks the `PRODUCT.md` handoff
  until the user supplies it or delegates the exact choice. A less central gap
  crosses the handoff only when the user accepts it as an assumption or chooses
  to leave it unknown.
- `implement` follows only the selected folder's formal handoff and material it
  explicitly links or current repository evidence implicates; it does not read
  every sibling file merely because it is present. Verified discoveries never
  silently change an approved product contract or reference.
- Work inside one spec folder is sequential. Parallel work runs across spec
  folders, coordinated by an opt-in issue tracker: when
  the repository's agent instructions carry an `## Issue tracker` section,
  each `docs/specs/<slug>/` folder names its issue with an `Issue:` line that
  `pr` writes when it creates the issue. `implement` claims that issue as its
  first write, and the implementation pull request closes it.
  `maintain-project-context` later repairs drift folder by folder through the
  recorded IDs. Without the section every skill
  behaves as before. Parallel bulk migrations inside one folder still require a
  separately chosen execution model.
- The active harness is authoritative for reviewer topology and mechanics.
  `implement` requires one completed review pass and its triage, unless the
  user explicitly waives that review, without prescribing a universal reviewer
  process, and never repeats the pass to reach
  a quiet result.
- The runnable handoff applies only to an actual product result exposed by a
  repository-supported local server. Preserve other checkouts and unrelated
  processes, and report an exact launch command and blocker when the environment
  cannot provide a reachable address. Server access is evidence delivery, not
  human approval.
- A harness-specific review command may be named only when the active
  installation confirms it for that reviewer. Such guidance remains conditional
  and preserves the portable completion contract: deliver verified outcomes and
  record the completed review or explicit waiver; otherwise keep the review
  pending with its blocker and next required action, without inventing a command.
- Conversation history is useful while available but is not durable evidence.
  After a real interruption, repository artifacts determine what remains. A
  discovery reported only in the closing message is therefore not preserved.
- A follow-up that does not reproduce remains unchanged. A reproduced item that
  needs a product decision or material trade-off returns to `shape-idea`; the
  sweep does not invent intent to keep automation moving. A different defect
  discovered by a worker is returned to the coordinator for serialized
  follow-up recording, commit, and durable follow-up-only pull-request handoff
  before that disposable worker is cleaned up.
- Reconciliation is an outcome-completion responsibility inside `implement`,
  not a separate installed skill or a substitute for the final review pass.
- Preserve unrelated changes and confirm ownership when dirty-state ownership
  or overlap cannot be established safely.
- Pause when a proposed product-contract change invalidates an outcome,
  acceptance criterion, off-limits area, or other approved constraint; the same
  blocker persists without evidence of progress; or continuing needs authority
  the user has not granted. Keep retries and reconciliation
  within the approved authority and work boundaries.
- Work-unit product constraints belong in `spec.md`. A settled constraint that
  later work
  should reuse belongs in a decision contract when it passes the project
  decision gate.
- Vendor context uses official sources only and must not be hardcoded to a fixed
  provider list or installation form.
- Whole-device reset is permitted only on a simulator or emulator dedicated to
  the active verification. Physical, user-owned, shared, and otherwise unowned
  targets are never erased. Destructive remote backend reset requires separate
  explicit authority and is not ordinary implementation verification.

## Why

App-level context and work-unit shaping operate at different lifetimes. A
from-scratch app needs one current premise that survives across features, while
each shaping session must still converge on one implementation-ready work unit.
Keeping their skills separate lets either be invoked without the other and
prevents app identity from becoming feature scope. Plans derived at execution
time age better than stored implementation predictions. Delivery outcomes,
rather than predicted session duration, remain the durable unit of work.

The spec folder is that unit. Task files inside a folder duplicated what spec
folders already provide, independent delivery, dependency order, and a tracker
issue, while carrying their own status, supersession, and frontier rules that
`implement` had to keep. Use had fallen to almost nothing once spec folders
could block one another: across the user's projects 27 of about 450 specs were
ever split, at 12% in August 2026 and 1% in October, while `Blocked by:` lines
between folders rose from none to twenty a month. As models carry longer work
in one run, splitting for model limits disappears; what remains is splitting
for delivery and coordination, which a folder and its issue express directly.
The bar is higher than the old task bar because each folder costs its own run,
review, and pull request. Applied to the last three task breakdowns, it turned
thirteen tasks into eight folders. Planning only the active outcome lets
current code and earlier verified discoveries inform the implementation path.

Focused reconciliation closes the flow-back path that verification alone does
not: it makes observed implementation facts update unfinished work before stale
assumptions compound downstream, while preserving user authority over product
outcomes and acceptance.

Cross-work-unit revision triages by meaning because the cheap-and-reversible
rule governs new choices during shaping. Applied to revising approved text it
would raise a question on almost every touch, which removes the reason to
invoke `babysit-specs` at all.

The spec folder is the stable implementation address, so `implement` needs one
input contract. Keeping one folder per run leaves the order of dependent folders
to the person, tracker, or runner that starts each run, and keeps `implement`
free of a loop across folders. Complete verification proves
known behavior; one automated review pass adds an independent look at the diff
without forcing every host through the same reviewer topology. That independent
look is what the standard mode buys, which is why the default is the harness's
ordinary review rather than its cheapest.

Repeating that pass is a different mechanism from running it. Reviewers report
candidates, so a rule that ends only at zero findings has no reachable stopping
point and spends its later rounds re-arguing settled trade-offs. Reproduction
decides what returns to implementation, the recorded remainder keeps the rest
visible, and the user keeps the judgments that need product intent. Requiring a
completed review preserves that independent look; accepting recorded findings
prevents a return to the zero-findings loop. An execution failure supplies no
review evidence, so verified implementation and pending review stay distinct.

The runnable handoff lets the user inspect the verified implementation without
turning server mechanics into a separate pipeline phase.

Specialized runtime-verification skills own framework-specific observation
loops, while `implement` owns their selection and the completion gates that
remain: acceptance criteria, reconciliation, and verification in the running
product. A generic dispatcher would duplicate that orchestration without adding
a separate user outcome. The same ownership includes preflight because only the
specialist knows which runtime, state boundary, and observation channel make its
evidence meaningful. App-scoped known state keeps the common loop fast, while a
conditional dedicated-device reset pays the higher cost only when the claim
depends on first-device state. Keeping prior-state verification as a separate
profile prevents clean-install confidence from hiding upgrade and migration
defects.

Exercising only the flow the acceptance criteria name confirms the intended
path and stops there, so a change can pass while the state right next to it
misleads users. Adjacent probes cover that gap at the cost of a few extra
interactions. Placing them in focused verification keeps any repair inside the
reviewed diff; placing them after review would ship unreviewed repairs and
rerun the final gate. Reusing the review triage rules keeps one standard for
what `implement` may change on its own, so a probe never turns behavior the
spec leaves open into an unapproved product decision.

Meaningful code checkpoints preserve useful recovery evidence without turning
Git into a second orchestration state machine.

Follow-up sweeps need stricter mechanics than ordinary implementation because
the backlog may move after a scheduled checkout starts and concurrent workers
can otherwise mix changes or suppress retries. Fetching before enumeration,
per-item isolation, reproduction and authority gates, and owner-fenced local
state keep automation reviewable without turning follow-up files into a queue.

## Reconsider when

- Setup items listed during shaping are regularly wrong or stale by the time
  implementation starts, so deriving them at implementation start would be
  more accurate than recording them in the spec.
- Folders divided by the folder-division rule repeatedly need to land
  together, or one folder repeatedly hides a material defect that a review
  between its outcomes would have caught.
- Running dependent folders one at a time costs enough runs, reviews, and pull
  requests that a single run across several folders would pay for itself.
- Defects a deeper review mode would have caught repeatedly surface after
  handoff, or depth selection collapses in practice into always taking the
  fallback mode, making the criteria inert.
- Triage repeatedly returns defects to the user or a follow-up that should have
  been repaired in the run that introduced them.
- A harness ships a reviewer designed to converge, such as a mode that
  re-verifies only named findings, or gives a cheap mode independent reviewer
  context.
- Authorized reviews still fail repeatedly after accurate destination and
  source-scope requests and supported execution paths; revisit the integration
  with current evidence rather than silently relaxing completion.
- Git history and the spec folder cannot reconstruct real interrupted runs
  safely.
- Outcome reconciliation repeatedly misses downstream contract changes or its
  reread cost exceeds the rework it prevents.
- Parallel spec work needs claims inside one folder, or the active state and
  explicit resumption rule cannot prevent competing claims.
- Merges made outside `merge` leave folders unpublished long enough that
  sessions claim the same folder before the next catch-up.
- Vendor workaround failures are repeatedly observed outside `shape-idea`,
  justifying another standalone carrier for the check-first rule.
- Recorded follow-ups accumulate unresolved in real repositories, justifying a
  pruning pass rather than only per-item deletion.
- Follow-up sweeps run from several machines often enough that local attempt
  state permits material duplicate work, justifying a shared queue.
- Codex provides native per-subagent worktree roots with equivalent fresh-base,
  ownership, and cleanup guarantees, making the external worker adapter
  unnecessary.
- Users repeatedly forget to invoke `babysit-specs` and `implement`'s load-time
  check keeps catching stale specs only at the next implementation, justifying
  a closing mention of remaining spec folders despite `implement`'s
  sibling-unaware boundary.
- `implement`'s load-time staleness check repeatedly stops an outcome on Git
  history that does not touch the spec's meaning, justifying a narrower scope
  for it.
- Adjacent probes repeatedly find nothing worth reporting while adding
  noticeable runtime cost, or their findings keep returning to the user as open
  decisions that shaping should have settled.
- Claude Code's bundled `/verify` becomes reliably model-invocable and
  available in Codex, or starts mapping evidence to spec acceptance criteria,
  making it a candidate runtime-verification specialist.

## Still-rejected alternatives

- Letting `implement` derive outside setup from the spec only when it starts —
  the need is already known when shaping selects the service, and deriving it
  later tells the user at the last moment. Implementing outcomes that do not
  need the setup while the user finishes it was also rejected: it interleaves
  waiting with delivery, and outcomes that do not need the setup belong in
  their own folder.
- Triage that detects human answers from comment authors, timestamps, and body
  fingerprints and re-evaluates waiting issues — the runner already knows when
  a person replied, and a shared skill should not guess it from tracker
  history.
- Keeping `discover-opportunity` as a separate conversational entry point — its
  handoff disappears with the session and does not provide the durable app
  premise the greenfield workflow needs.
- Folding blank-page opportunity discovery into the app-context skill —
  divergent search and convergence on a durable app premise require different
  evidence and stopping conditions, while the supported workflow already starts
  from a user-chosen direction.
- Making `shape-idea` create or own app-level context — it couples a permanent
  app artifact to a work-unit shaping lifecycle and makes independent use
  ambiguous.
- Folding spec revision into `shape-idea` as a second entry point — it reuses
  the shaping rules without restating them, but grows a skill whose text
  already competes with the user's task for context. The user chose the
  separate skill on that ground.
- Having `implement` scan sibling spec folders at its close-out — it would
  cross the boundary that keeps `implement` on one selected folder, and the
  scan is speculative because a sibling may be reshaped before it is built.
- Durable `plan.md` and a plan-writing skill — implementation predictions age,
  while decision-level corrections already have homes in specs, project
  decisions, or repository instructions.
- A separate roadmap, execution ledger, or run-state file — spec folders and
  their `Blocked by:` lines already carry the authoritative contract and the
  order of work; duplicating them creates another artifact that can drift.
- Task files inside a spec folder, cut by `split-into-tasks` — they duplicate
  what separate folders provide and need their own status, supersession, and
  frontier rules. Existing `tasks/` folders get no compatibility path.
- Letting `implement` take several folders and run them in `Blocked by:` order
  — it would restore the old one-run task loop, but the user kept one folder
  per run so `implement` stays simple and ordering stays with whoever starts
  each run.
- Hand-editing a second spec contract in an issue, as Matt Pocock's `to-spec`
  does — the folder holds several documents an issue cannot carry, and a
  hand-written copy drifted in this repository, where three of nine queued
  specs were edited after they were written. A generated readable section in
  the issue keeps one issue without giving it separate authority.
- Creating the issue after merge under a `spec:<slug>` title key — at that
  point the number cannot be written back into `spec.md`, so every later
  lookup had to list issues or search titles. Linear search ranks by meaning
  and can miss an exact title, and flyn accumulated 13 same-title duplicates of
  Done spec issues (FLY-96 to FLY-108). The prefix was also unwanted in titles.
- Creating the issue when shaping closes — an abandoned shape would leave an
  issue behind, while every path (shaping, triage, and a spec delivered with
  its implementation) already passes through PR creation.
- Searching the tracker by title for an existing issue before creating one —
  that search is what produced the duplicates; only an ID a person gives is
  trusted, and remaining duplicates are tidied by hand.
- A `spec` label marking spec issues — review and ready states already keep
  them out of general triage.
- A CI workflow that mirrors spec folders to issues — it ties the convention
  to GitHub Actions and GitHub Issues, while `pr` and `merge` follow whatever
  tracker the section names.
- A separate full reconciliation skill — issue state is a derived surface
  of the same spec lifecycle already inspected by `maintain-project-context`.
  Keeping the full repair in that periodic pass avoids another optional owner,
  while `merge` retains the narrow post-merge update path.
- A claim marker inside the folder — a file written on a branch is invisible
  to a session that checked out the default branch, so two sessions take the
  same folder; the assignee field is visible the moment it is written.
- A separately invoked reconciliation skill for alignment inside one work unit
  — that alignment is part of outcome completion, so it stays in `implement`
  rather than becoming one more required skill, or a user invocation, that
  every ordinary implementation would wait on. Revision across work units is
  different: it happens
  between implementations rather than inside one, and `implement`'s load-time
  staleness check keeps correctness from depending on anyone remembering to
  invoke `babysit-specs`.
- Session duration as a work boundary — predicted limits fragment coherent
  outcomes prematurely.
- A `run-server` pipeline skill — it exposes a technical mechanism rather than
  the handoff outcome; reconsider a separately invokable preview workflow only
  after repeated independent user requests establish a separate outcome.
- A generic runtime-verification dispatcher — matching framework skills already
  own their observation loops, while `implement` owns the implementation
  completion gate and remains usable when none is installed.
- Replacing `implement`'s runtime verification with Claude Code's bundled
  `/verify`, or invoking it as a required step — it judges a diff and its
  description rather than spec acceptance criteria, approved reference
  coordinates, the core-loop journey, or per-platform evidence; it has no state
  profiles; whether the model may invoke it depends on a server-side rollout
  flag; it does not exist in Codex; and it leaves an uncommitted
  `.claude/skills/verify/SKILL.md` recipe in the repository. Only its
  adjacent-probe step was adopted, restated in `implement`.
- A generic environment-readiness skill — readiness and state controls belong
  to the runtime that can interpret them, while a separately invoked helper
  would make a required completion gate optional and duplicate orchestration.
- Erasing every simulator or emulator before every runtime check — it spends
  fresh-install cost on claims that need only known app state, disrupts shared
  work, and removes the prior state required to verify upgrades and migrations.
- Treating a whole-device erase as a complete clean environment — host build
  tooling and external backend state remain outside the device reset boundary.
- Pausing for approval when no matching runtime-verification skill is installed
  — the user already authorized the technical implementation path, and skill
  availability does not turn ordinary verification-method selection into a
  product decision.
- Limiting final runtime verification to the changed acceptance criteria — a
  locally correct change can still break the product's primary journey; the
  bounded core loop catches that regression without requiring an exhaustive
  application-wide test on every implementation.
- A dedicated follow-up recording skill — it names a mechanism rather than a
  user outcome and would add another installable dependency, while
  `project-knowledge` already owns durable project memory.
- One recurring schedule per follow-up — schedule state grows with the backlog
  and duplicates selection policy that one bounded sweep can own.
- Several follow-ups in one worker checkout or pull request — one failure or
  overlap couples otherwise independent evidence and review.
- A speculative fix from a recorded symptom, a stale local base, or unsettled
  product intent — none establishes that the proposed patch is the verified
  result the project wants.
- Relying on the `project-knowledge` trigger description alone to fire during
  execution — installed context goes unused without explicit routing, the same
  effect measured for vendor agent context.
- Repeating the automated review until it reports nothing — measured runs did
  not converge, and the reviewers are tuned to surface candidates rather than
  to certify a diff.
- Removing the automated review or making it opt-in — its first pass caught
  user-visible defects that verification did not.
- Fixing one review mode for every change — no observed failure justifies it,
  the single pass already bounds the cost of a deeper mode, and a fixed level
  removes judgment the implementer is better placed to apply.
- Counting an invocation or failed attempt as completed review — it allows a
  finished handoff without the independent inspection the workflow promises.
- Treating a skill's review requirement as user authorization, describing
  service-backed review as no transmission, or requesting the same already
  granted authority again — these obscure the real execution boundary.
- Review after every edit — it adds fixed cost without requiring a material
  risk boundary.
- One universal fresh-reviewer protocol — it duplicates or constrains the
  review capabilities already provided by each harness.
- State-only phase commits, correction counters, or a separate run-state
  file — they create more orchestration state than the
  implementation needs and can drift from code.
- Unlimited repair loops — they turn a persistent blocker into unbounded cost
  without adding new evidence.
- Skipping a blocked dependency — later folders would inherit an unresolved
  foundation and make integrated verification ambiguous.
- Fine-grained tickets or horizontal layer folders — they become stale and
  produce changes that are not independently usable end to end.
- Depending on agents to discover vendor context on their own — official
  evaluations showed installed context was frequently left unused unless the
  workflow made retrieval explicit.

## Evidence worth preserving

- On 2026-11-08 a folder-division eval of `shape-idea` (claude-opus-5-5, ten
  held-out cases run twice: three real divisions, six former
  `split-into-tasks` cases, one outside-work case) scored 16/20 exact with the
  rule as first settled and three over-divisions. Saying that dependence alone
  never separates raised it to 18/20; also excluding inferred risk and
  technical layers kept 18/20 at 9/10 per repetition with one over-division,
  on the todo-api case, where the judge counted an API addition placed with
  the UI that first needs it as split across folders. This narrowed the
  foundation reason to a stated material risk.

- On 2026-11-07, two `/verify` runs (Claude Code 2.1.319, claude-opus-5-5) on
  a Todo title-search commit each passed every intended check, cost about
  $0.37–0.40, and took 2–4 minutes. Their adjacent probes found what the
  intended checks did not: an item added while a non-matching search was
  active was saved but never appeared, and a search combined with the `완료`
  filter reported no match although the item existed under `진행중`. Both runs
  also wrote an uncommitted `.claude/skills/verify/SKILL.md`. The skill's text
  was read from that version's bundled files.

- On 2026-10-02, while moving flyn's human conversation to a messenger with a
  resident runner, the user limited `triage-issues` to new issues and removed
  reply detection. A wider split that would have made triage only judge and
  hand off, let `implement` take issues, and let `shape-idea` hand small
  changes to `implement` was deferred to keep the shared skills unchanged where
  not needed.
- A Flyn work unit linked an approved `prototype.html` from `spec.md` and
  recorded 25 screen-state cases checked at three widths, with 98 prototype
  checks passing. The later implementation session listed the artifact but
  never inspected or rendered it, then used device checks of element presence
  and navigation to claim conformance. It missed a detail cover, placed a continue
  action outside its conversation card, omitted location copy, and diverged
  from approved screen compositions. This supports loading the formal handoff
  before source changes, comparing actual screens at the approved coordinates,
  and making unread or uncompared handoff criteria block completion; another
  always-on producer-side review would not address this consumer failure.
- A held-constant four-task Todo implementation eval completed in 31m43s with
  five meaningful commits and no state-only commits. The previous fixed
  fresh-worker protocol was still incomplete after 57m49s with 23 commits and
  at least 15 child-agent invocations. This supports removing fixed
  orchestration overhead, not prescribing a replacement context topology.
- Seven inspected Codex and Claude implementation sessions across four
  repositories showed repeated flow-back failures: verified implementation
  changed downstream contracts, completed code diverged from its final spec, a
  late security review invalidated an earlier completion path, and an initially
  reported performance win failed after product and operational constraints
  were applied. These cases support reconciliation at verified outcome
  boundaries rather than relying on final review or session memory alone.
- In that Todo eval, a risk-selected intermediate review and the final review
  found distinct blocking security issues; a final-review-only variant finished
  in similar time. This supported declaring intermediate review only where risk
  justified it and always retaining the integrated final review. Dividing such
  work into separate folders now gives each boundary its own final review.
- Vendor evaluations cited when the context-installation rule was adopted
  measured large gains from version-matched official context and also showed
  that agents frequently failed to invoke an installed skill without an
  explicit routing instruction.
- Claude Code 2.1.226 exposed `/review` as an alias for `code-review`. A live
  invocation entered the automated review process; a forced Skill permission
  denial then handed `/review` to the user. This supports conditional alias
  guidance, not a cross-version assumption.
- Claude Code 2.1.235 `code-review` modes: `low` reads the diff once in the
  calling session with no subagents and at most four findings; `medium` runs
  eight finder subagents plus one verifier per candidate and is tuned for
  precision; `high` keeps that fan-out but is tuned for recall and instructs
  the reviewer to err on the side of surfacing; `xhigh` and `max` add angles
  and a sweep. With no mode given it reuses the last one typed, so the mode is
  named explicitly. Codex 0.147.0 `review` takes custom review instructions and
  has no effort dial.
- One implementation session took 18 minutes to implement and commit, then ran
  five recall-tuned review rounds over 83 of its 102 minutes. Output tokens
  were 113,003 before the first review and 219,304 inside the review rounds;
  each single pass cost 7 to 26 minutes and 22,400 to 34,302 output tokens.
  Findings fell 10, 6, 5, 4, 1 without reaching zero, and a security trade-off
  the spec had already disposed of was re-flagged in every round, ending as the
  last round's only finding. The first pass alone returned 10 findings of which
  8 were real, in scope, and new. This supports one standard pass with triage:
  the first look carries the value, and repetition converged on re-litigation.
- A second session ended when the user interrupted a third repair round for a
  pathological-input defect the orchestrator itself judged not to affect
  ordinary use. A third reported a fully working, runtime-verified product as
  incomplete because its reviewer was user-only. These originally motivated
  the completion fallback; the 2026-09-07 decision below replaces that fallback
  while retaining the one-pass triage rule.
- On 2026-09-07, task `01a079b9-b926-77d3-8332-3f8e522150d5` requested
  `codex review --uncommitted` as read-only with no transmission. Automatic
  approval review rejected it because sending the diff and related context to
  the model service lacked explicit authorization. No code-review result was
  produced, but the skill allowed completion. A separate model evaluation also
  failed because Codex CLI 0.147.0 did not support the selected model. The user
  approved requiring completed review, distinguishing execution failures from
  a spent pass, and accurately reusing existing authorization. This replaces
  completion-on-review-failure, not the prohibition on automatic review loops.
- Three simulated handoff scenarios compared the old and revised instructions.
  Both recovered supplied execution failures and reused supplied authorization.
  Under a denial, the old wording reported completion; the revision kept review
  pending but handed off a manual command instead of asking for permission.
  The explicit permission-request sentence addresses that observed failure. A
  new scenario with a named service and source scope passed with both the
  pre-clarification and final wording. These are instruction-behavior checks
  with supplied tool outcomes, not proof that live approval policy permits a run.
- A user queued nine spec folders in this repository and implemented them one
  at a time. Three of the nine were edited after they were written, always
  inside the implementation commit that changed the code, so no interview
  settled those edits and no skill owned them. One later implementation session
  discovered mid-way that its spec was stale and discarded every change it had
  made. This supports an owner for cross-work-unit revision and a staleness
  check before the first source change, where the same discovery costs nothing.
- A blind three-way routing run on 2026-09-13 separated `babysit-specs` from
  `shape-idea` and `maintain-project-context` on 22 cases at 2 repeats, with
  `shape-idea` loaded as a distractor. `babysit-specs` scored 10 of 10: all five
  revise-after-ship prompts activated it, and its five negatives went to the
  right neighbour or to none. `shape-idea` captured no revise prompt, which is
  why its description keeps no redirect clause and stays unchanged. The one
  failure was a pre-existing `maintain-project-context` retirement prompt that
  activates no skill; a controlled 6-run before-and-after scored 1 of 6 both
  with and without the redirect clause added that day, so the clause is not its
  cause.
- The `resolve-follow-ups` dispatcher test exercises fetched remote ordering,
  atomic claims, stale and changed bases, dirty checkout hooks, interrupted
  claim recovery, terminal evidence, exact worktree ownership, unpublished
  changes, and cleanup. An automated whole-diff review exposed remote-only
  backlog loss, abandoned claims, dirty prepared workers, and lost non-PR
  evidence; the added controls reproduce each failure before accepting the
  corrected lifecycle.
