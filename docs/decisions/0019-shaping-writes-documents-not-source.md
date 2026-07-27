# Shaping writes documents, not source

shape-idea sessions were observed editing the product's code
mid-shaping: a fix made "while here" during investigation, spike code
left in the tree, or the session sliding into implementation once the
decisions closed. The failure is structural. The skill's verbs —
investigate, spike, benchmark, render, install — keep the model in a
writing posture, and two of those activities (spikes, vendor context
installs) legitimately write files, so the model generalizes from
"this session writes" to "this session may write anywhere." The only
guard was one clause buried in the surface paragraph ("without
beginning production implementation"); no sentence stated the
session-wide write boundary.

The boundary is now stated once, as a closed positive list: the
session's durable writes to the project are the spec folder, the
glossary and decision records, and installed vendor agent context —
nothing else. Spikes, benchmarks, and rendered visuals are disposable
scaffolding that leaves the code as it found it. Any product-code
edit, however small, is implementation and belongs to the session
that builds from the spec; the shaping session records the urge as a
decision or a remaining risk instead of acting on it.

Three choices in that wording carry the weight. Positive list rather
than prohibition: "never modify code" contradicts the sanctioned
writes, and a rule the session must violate to do its job invites
rationalized exceptions everywhere else. Stated once rather than
per-paragraph reminders: this is a constraint in the thin-skills
sense (decision 0009), and it passes that decision's test — the
failure is observed and repeated. An outlet rather than a bare stop:
"record it as a decision or a remaining risk" gives the model a
compliant action at the exact moment of temptation, which holds
better than prohibition alone.

## Considered Options

- **A bare "do not modify code" sentence** (rejected): fights the
  writes the session is supposed to make; the model either violates
  it knowingly or over-complies and stops writing the spec.
- **Local reminders in each paragraph** (rejected): scattering the
  rule is exactly the bloat the thin-skills criterion prunes; the
  surface paragraph's local clause was even removed as redundant once
  the global boundary existed.
- **State the rule in this repo's AGENTS.md/CLAUDE.md** (rejected):
  published skills must stand alone — skills.sh installs them into
  other projects where this repo's context does not exist.

## Consequences

shape-idea gains one boundary paragraph and sheds the duplicates it
absorbs: the visuals paragraph's "disposable scaffolding" sentence
and the surface paragraph's "without beginning production
implementation" clause. build-prototype already carries its own
version of the boundary ("the prototype is a reference, never
production code") and is unchanged.
