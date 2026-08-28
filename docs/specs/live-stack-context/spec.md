# Live stack context

## User-visible outcomes

- A user who runs `add-stack-context` gets a complete audit of the technologies
  that directly define the project stack, with skills discovered through
  `find-skills` when available.
- Official vendor skills are installed through their documented method.
  Relevant community skills are presented as reviewed candidates and enter the
  project only after explicit user approval.
- A vendor `llms.txt` or equivalent changing document remains at its official
  source. Later agents receive a compact repository instruction to retrieve the
  current document when working with that technology instead of reading a stale
  checked-in copy.
- `shape-idea` hands a newly settled framework or hosted service to the same
  stack-context behavior without becoming a second implementation of the
  audit.
- Installed plugin users and individually installed skill users receive the
  same behavior, including when `find-skills` is unavailable.

## Approved scope

### Skill discovery and acceptance

For every direct framework, library, developer tool, and hosted service in the
stack checklist, `add-stack-context` uses `find-skills` as its primary skill
discovery capability when available. It verifies each candidate against the
vendor's current official organization or documentation before classifying it.

A vendor-controlled skill may be installed automatically through its documented
method. A community-controlled skill is assessed for relevance, source,
maintenance, and adoption signals and reported to the user as an optional
candidate. The audit does not install it or classify the technology as carrying
official context without explicit approval.

When `find-skills` is absent, the audit searches the current Skills ecosystem
through the available CLI or equivalent source and applies the same acceptance
rules. Absence of the helper skill is not a blocker by itself.

### Other official context

The audit still checks vendor documentation for agent context that is not an
installable skill, including official installers, codemods, package-bundled
documentation, and MCP servers. It applies the vendor's supported method,
preserves user-authored context, and limits changes to the vendor-owned or
explicitly managed surface.

When the vendor provides a changing `llms.txt` or equivalent remote document,
the audit does not copy its contents into the repository. It adds or updates a
small bounded instruction on the repository's established agent-instruction
surface. That instruction identifies the relevant technology, tells an agent to
retrieve the current official source when work touches it, and requires the
guidance to be reconciled with the installed version.

Existing links, imports, or other sharing between `AGENTS.md` and `CLAUDE.md`
remain intact. Where both are independent and active, both expose the same live
retrieval behavior without overwriting user-authored instructions.

### Shaping handoff

When `shape-idea` settles on a framework or hosted service, it invokes
`add-stack-context` if available. If it is not installed, `shape-idea` retains a
concise standalone fallback that discovers official skills, preserves live
vendor-document routes rather than document copies, and accounts for the newly
selected technology. Shaping does not duplicate the full project-wide audit or
install an unapproved community skill.

### Completion report

Every checklist item ends as installed, already present, unavailable from an
official source, or blocked with a concrete reason. The report also distinguishes
community candidates awaiting approval and names the supported update or
task-time retrieval path for every installed context source.

## Observable acceptance criteria

- Given a project whose direct stack includes a technology with an official
  vendor skill, `add-stack-context` discovers it through `find-skills`, verifies
  vendor control, installs it through the documented method, and reports its
  update path.
- Given an official skill and a more popular community skill for the same
  technology, the official skill may be installed automatically while the
  community skill is only reported as an optional candidate.
- Given only a relevant community skill, the audit does not install it or call
  it official without explicit user approval, and it records that official
  context is unavailable when no other vendor channel exists.
- Given no installed `find-skills`, the audit performs equivalent current skill
  discovery without failing or claiming that no skills exist solely because the
  helper is absent.
- Given an official installer, codemod, bundled documentation set, or MCP server,
  the audit considers and applies that channel even when skill search returns no
  result.
- Given a vendor `llms.txt`, no checked-in copy of its contents is created. A
  bounded `AGENTS.md` or `CLAUDE.md` instruction causes later relevant work to
  retrieve the current official source and compare it with the installed
  version.
- Given existing user instructions and a vendor-managed block, the audit
  preserves user content and changes only its own bounded instructions or uses
  the official updater.
- Given `AGENTS.md` and `CLAUDE.md` already share content, the audit preserves
  that relationship and creates no second independently maintained copy.
- Given shaping that selects a new framework while `add-stack-context` is
  available, `shape-idea` delegates the context outcome once. Given the skill is
  unavailable, the standalone fallback reaches the same source and persistence
  boundaries.
- The stack-context skill evals cover official-versus-community selection,
  absent-`find-skills` fallback, non-skill vendor channels, live `llms.txt`
  routing, and preservation of existing repository instructions.
- The published plugin validates successfully and its version advances so
  installed users can receive the changed behavior.

## Settled constraints and rationale

- `find-skills` is the normal discovery surface for skills but not the authority
  that accepts third-party instructions. This preserves its broad ecosystem
  reach without weakening the existing official-source boundary.
- Official vendor skills may install automatically. Community skills require
  explicit approval even when they have high adoption or a reputable author,
  because neither signal proves that the technology's vendor owns the guidance.
- Skill discovery does not replace vendor-document research. Vendors publish
  useful agent context in several forms, and the audit must account for all of
  them.
- Remote changing guidance stays remote and current. Repository instructions
  store only the durable retrieval rule, not the document body.
- `shape-idea` owns when a newly selected technology needs context;
  `add-stack-context` owns how the context is discovered, accepted, installed,
  persisted, and reported.
- Both skills remain independently installable. Invoking a specialized skill is
  preferred when available, but the required outcome survives its absence.

## Assumptions

- The repository's existing choice of `AGENTS.md`, `CLAUDE.md`, or a shared
  relationship between them remains canonical. Supporting both active harnesses
  without breaking that structure is an implementation detail.
- Exact managed-block markers and wording are implementation choices provided
  they remain bounded, preserve user content, and express the live retrieval
  behavior.
- Existing stack inventory and version-matching rules remain unchanged.

## Off-limits

- Checking a vendor document body into the repository as a snapshot when the
  vendor publishes it as changing remote guidance.
- Automatically installing a community-controlled skill based on popularity,
  stars, or search rank.
- Treating `find-skills` as a mandatory installed dependency or as the only way
  to discover vendor context.
- Narrowing stack context to skills and ignoring official codemods, bundled
  documentation, installers, or MCP servers.
- Overwriting user-authored `AGENTS.md` or `CLAUDE.md` content or replacing an
  existing sharing relationship between them.
- Expanding the audit to transitive dependencies or unrelated generic agent
  guidance.

## Deferred points

None.

## Remaining risks

- Task-time retrieval requires network access; an offline session may know the
  correct source but be unable to load it. The audit must report that state
  rather than treating an old copy as current.
- `find-skills` search coverage and ranking can change, so an official skill may
  require a vendor-document fallback to discover.
- Community candidate assessment remains judgment-based. Presenting a candidate
  does not imply endorsement, and explicit approval remains the installation
  boundary.
- Independently maintained `AGENTS.md` and `CLAUDE.md` files can still drift in
  repositories that intentionally keep both; bounded managed instructions make
  that drift detectable but do not eliminate it.
