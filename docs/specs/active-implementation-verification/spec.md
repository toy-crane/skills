# Active implementation verification

## User-visible outcomes

- A user who invokes `implement` gets evidence that the delivered behavior was
  exercised in the running product without having to request verification or
  name a verification skill separately.
- The implementation uses a matching runtime-verification skill when one is
  available. Its absence does not produce an approval checkpoint: the agent
  investigates the repository and current environment and constructs the
  strongest usable runtime verification path itself.
- During implementation, changed behavior is checked through a focused runtime
  loop. Before completion, the changed flow and the product's representative
  core loop are exercised again on every platform the result claims.
- The handoff distinguishes behavior observed in the running product from
  supporting static evidence and from coverage that could not be verified. A
  changed behavior without runtime evidence is not reported as complete.

## Approved scope

### Establish the verification obligation

For the active outcome, `implement` derives the behavior that must be proved
from the selected spec, its observable acceptance criteria, applicable task
constraints, the affected product surfaces, and the claims the implementation
will make. It selects evidence appropriate to each claim rather than treating a
build, type check, test suite, screenshot, or code inspection as universally
sufficient.

This is just-in-time implementation work, not a new durable plan or ledger.
When task files exist, they retain only the concise verification evidence their
current lifecycle already permits.

### Select and construct the strongest usable runtime path

For every affected product surface, `implement` uses an available specialized
runtime-verification skill whose trigger matches the change. The specialist
owns its framework-specific observation loop and exact completion checks.

When no matching skill is available, `implement` does not ask the user to
approve a verification method. It investigates the repository-supported
runtime and the capabilities available in the current environment, consults
current authoritative guidance when a framework or tool's behavior matters,
and combines the strongest usable observations into an equivalent check of the
changed behavior. Skill availability is an optimization, not an authority or
completion boundary.

If the environment cannot expose the changed behavior after the available
in-scope paths have been exhausted, `implement` records the exact failed gate
and required prerequisite. Passing static checks does not convert that result
into completed runtime verification.

### Verify while implementing

After a meaningful behavior change, `implement` exercises the smallest
complete user flow affected by that change through the selected runtime path.
The observation proves that the current change is loaded, the reproduction is
free of relevant runtime errors, and the named behavior reaches its exact
observable result. It inspects deeper layers such as network behavior,
component state, native behavior, or performance only when the implementation
makes a claim about that layer.

The cadence is governed by meaningful behavioral changes rather than every
keystroke. A specialized skill may define a stronger cadence for its surface.

### Re-verify the changed flow and core loop before completion

After all outcomes pass their focused checks, `implement` re-runs the changed
flow and a representative journey derived from the root `PRODUCT.md` core loop
on the running product. This is a bounded regression check of the product's
primary journey, not an exhaustive application-wide suite.

If the automated review leads to a repair that changes executable product
behavior, that repair invalidates the earlier runtime evidence. `implement`
re-runs the same changed-flow and core-loop gate on the repaired revision before
handoff, without sending the repaired scope through a second review pass.

Every platform named in the result owes its own runtime evidence. Evidence from
one platform does not establish another. When `PRODUCT.md` or a core loop is
absent, `implement` re-verifies the changed flow and reports that core-loop
regression coverage was unavailable without inventing a journey or editing
`PRODUCT.md`.

When the core loop admits materially different journeys, its interpretation is
a product question rather than verification-method approval. Preserve the
current evidence and obtain the missing product clarification before claiming
that the core loop passed.

### Preserve the existing completion and review boundaries

Runtime verification remains one part of `implement`'s existing completion
contract. Acceptance criteria, focused deterministic checks, reconciliation,
complete verification, the single triaged automated review pass, and runnable
handoff retain their current ownership and order. Runtime verification does not
replace deterministic tests or automated review, and either of those does not
replace runtime evidence.

Questions return to the user only when implementation would change the approved
product contract, when the core product journey itself is ambiguous, or when
continuing genuinely requires authority that implementation did not grant.
Ordinary selection of a verification technique stays autonomous.

## Observable acceptance criteria

- Given an affected surface with a matching runtime-verification skill
  available, `implement` invokes it during implementation and satisfies its
  runtime completion conditions instead of relying only on repository checks.
- Given a Next.js change with `next-dev-loop` available, `implement` uses the
  running framework and browser observations to prove the changed route's
  behavior before completion.
- Given an Expo change with both `expo-dev-loop` and `expo-smoke-test`
  available, `implement` uses the focused loop while editing and the
  both-platform changed-flow plus core-loop check before delivery.
- Given no matching runtime-verification skill, `implement` inspects the
  repository and current environment, carries out the strongest usable runtime
  path without asking for method approval, and reports the observations that
  establish the result.
- Given no matching skill and an available browser, device, service endpoint,
  CLI, or repository-supported development runtime, `implement` uses the
  relevant capability rather than treating the missing skill as a blocker.
- Given passing builds, type checks, and tests but no usable runtime path for a
  changed behavior, `implement` leaves that behavior incomplete and names the
  failed gate and prerequisite.
- Given a defined `PRODUCT.md` core loop, final verification drives both the
  changed flow and one representative core-loop journey on every claimed
  platform, with separate evidence for each platform.
- Given a must-fix review finding whose repair changes executable product
  behavior, the final changed-flow and core-loop gate runs again on the repaired
  revision on every claimed platform, while the automated review remains a
  single pass.
- Given no defined core loop, final verification re-runs the changed flow,
  reports the missing regression coverage, and leaves `PRODUCT.md` unchanged.
- Given a runtime claim about a deeper layer such as networking, native
  integration, component behavior, or performance, the evidence observes that
  layer rather than inferring it from visible output alone.
- Existing implementation scenarios that do not expose a user-reviewable
  server, use task files, resume after interruption, or require the final
  automated review retain their current behavior.

## Settled constraints and rationale

- `implement` owns verification selection and the completion gate, while
  specialized skills own framework-specific loops. A generic verification
  dispatcher would duplicate orchestration and make standalone installation
  more fragile without creating a distinct user outcome.
- Missing skill coverage never creates an approval checkpoint. Invoking
  `implement` already delegates technical implementation and verification
  choices while the product contract remains intact.
- Final regression is bounded to the changed flow and core loop. Checking only
  changed acceptance criteria can miss a broken primary journey; exhaustively
  traversing the whole application on every implementation would add unbounded
  cost unrelated to the claims being delivered.
- Runtime evidence is claim-shaped. Exact behavioral assertions establish
  correctness, screenshots establish visible output, logs establish runtime
  health, and deeper instrumentation is required only for deeper claims.
- Final runtime evidence must describe the executable revision being handed
  off; a later repair cannot inherit evidence from the revision it replaced.
- Every claimed platform requires direct evidence because platform parity is
  an implementation claim, not a safe inference.
- Verification evidence stays in the existing handoff and task lifecycle. A
  second durable verification plan or run-state artifact would drift from the
  spec, code, and current runtime.

## Assumptions

- The agent may choose and operate ordinary non-destructive verification tools
  within the authority already granted for implementation, subject to repository
  policy and the environment's safety boundaries.
- A meaningful behavior change, rather than an individual text edit, is the
  default focused-loop boundary when no specialist defines a stricter cadence.
- A uniquely stated `PRODUCT.md` core loop can be translated into one
  representative journey without an additional user checkpoint.

## Off-limits

- Creating a generic runtime-verification dispatcher or a mandatory dependency
  on another installed skill.
- Hardcoding a closed list of supported frameworks, verification tools, or
  commands into `implement`.
- Asking the user to approve an ordinary verification method solely because a
  matching skill is absent.
- Treating builds, type checks, unit tests, code review, screenshots, or
  successful process startup as substitutes for exercising changed behavior.
- Expanding the final regression gate into an exhaustive traversal of every
  product surface.
- Editing `PRODUCT.md` to manufacture a missing core loop.
- Changing the existing automated-review single-pass rule, human-review
  authority, or product-contract change boundary.

## Deferred points

- Persisting a machine-readable verification manifest for CI or external audit.
- Automatically generating a reusable end-to-end test from a successful live
  verification run.
- Adding more framework-specific runtime-verification skills; this work makes
  `implement` use them when present but does not define their individual loops.
- Defining a project-wide regression journey when the product has no
  `PRODUCT.md` core loop.

## Remaining risks

- A hand-constructed fallback can provide weaker or less repeatable evidence
  than a maintained framework-specific skill. The handoff must keep the exact
  observed coverage visible.
- A vague or stale core loop can make the final regression journey unstable
  across runs; materially different interpretations still require product
  clarification.
- Runtime infrastructure, credentials, devices, or realistic data can remain
  unavailable even after the agent exhausts its usable paths, leaving otherwise
  implemented behavior incomplete.
- Stronger verification increases execution time. The meaningful-change cadence
  and bounded final journey limit that cost, but runtime-heavy projects may
  still need later evidence-based tuning.
- Instruction wording may still fail to activate an available specialist or
  may over-trigger broad verification. Held-out scenarios must cover skill
  selection, fallback construction, core-loop regression, platform claims, and
  blocked runtime evidence, including invalidation after a review repair.

## Evidence considered

- The current `implement` contract already selects an available matching
  runtime-verification skill and rejects static checks as a substitute, but it
  does not require proactive fallback construction or a final core-loop
  regression.
- The current Expo skills demonstrate two useful cadences: a focused
  representative-target loop during ordinary editing and a separate
  both-platform changed-flow plus core-loop check before delivery.
- The current official Next.js `next-dev-loop` cross-checks framework-side
  runtime information with a real browser and separates compilation, runtime
  health, visible behavior, and React-level behavior. It demonstrates why one
  generic static command cannot establish every implementation claim.
