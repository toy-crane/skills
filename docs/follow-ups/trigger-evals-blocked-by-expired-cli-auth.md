# Trigger evals cannot run because the nested Claude CLI cannot authenticate

**Symptom**: `scripts/run-claude-trigger-evals.sh` completes but scores nothing.
Every case is marked invalid with `authentication_failed`, and the script ends
with "Trigger eval is invalid because one or more Claude invocations failed."
The three-way routing check for `babysit-specs`, `maintain-project-context`, and
`shape-idea` therefore has no result.

**Observed evidence**: On 2026-09-13, `scripts/run-claude-trigger-evals.sh 2 8
babysit-specs maintain-project-context shape-idea` returned 22 cases with
`valid_runs: 0` and `infrastructure_errors` of `authentication_failed` on all 44
runs. Reproduced outside the script: in a fresh `git init` directory, `claude -p
"reply with the single word OK" --max-turns 1 --output-format stream-json
--verbose` exits 1 with the result line `Failed to authenticate: OAuth session
expired and could not be refreshed`. Claude Code 2.1.267, run from inside a
desktop-app session.

**Suspected cause**: The nested CLI does not inherit a usable credential from the
host session and its own stored OAuth session has expired. Whether a host
session can ever refresh the child's credential was not established.

**What was tried**: The bare `claude -p` reproduction above, run twice several
minutes apart with the same result, which ruled out a transient failure inside
the eval script and located the blocker in CLI authentication. Nothing was
changed to work around it. Every other verification gate for the
`babysit-specs` work ran normally: `claude plugin validate . --strict`, eval
JSON parsing, manifest and symlink resolution, link integrity, and browser
verification of the fixture prototype.

**Proposed next step**: Re-authenticate the CLI from an interactive terminal
(`claude` and complete the login), confirm with the bare `claude -p`
reproduction above, then run `scripts/run-claude-trigger-evals.sh 2 8
babysit-specs maintain-project-context shape-idea`. The result settles the
second deferred point in `docs/specs/babysit-specs/spec.md`: if `shape-idea`
captures the revise-after-ship prompts, ask the user to lift its off-limits for
a one-clause redirect to `babysit-specs`.
