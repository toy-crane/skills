# Decision index

Standing positions only, one line each, grouped by subject. A record that
supersedes another replaces its line; the superseded record keeps its file and
is reached through the citing record. The records hold the evidence and the
rejected alternatives.

## Documents and decision records

- [spec-dossiers-under-docs-specs](spec-dossiers-under-docs-specs.md) — One unit of work gets one folder, `docs/specs/<slug>/`, anchored by spec.md, on its own lifecycle: created lazily, retired wholesale when the work ships.
- [decisions-get-an-index-and-a-compaction-pass](decisions-get-an-index-and-a-compaction-pass.md) — The index states the current position and compact-decisions maintains it; a record's claims are fixed while its addresses are not, and a cluster compacts only when the merged record would come out no larger.
- [slug-addresses-and-a-standing-index](slug-addresses-and-a-standing-index.md) — Records are addressed by slug alone, and the index lists only standing positions grouped by subject; superseding replaces a line, and history is reached through citations.

## Naming

- [verb-object-names-for-invoked-skills](verb-object-names-for-invoked-skills.md) — User-invoked skills take imperative verb-object names; skills that fire in the background keep discipline nouns. `/plan` is reserved by both harnesses.
- [shape-idea-names-the-work](shape-idea-names-the-work.md) — The clarification workflow is named shape-idea: the name states the work, not the document it hands off.
- [draft-plan-becomes-write-plan](draft-plan-becomes-write-plan.md) — The planning skill is write-plan: the plan document is itself the review surface, so writing it is an honest name.

## Skill design

- [thin-skills-over-fixed-procedures](thin-skills-over-fixed-procedures.md) — A skill states goal, constraints, and completion criteria; a fixed procedure must name the repeated, observed failure it guards.

## Pipeline

- [jit-planning-with-optional-to-plan](jit-planning-with-optional-to-plan.md) — Implementation planning is just-in-time by default; an optional skill writes a reviewable plan.md when the how deserves review.
- [opportunity-discovery-precedes-idea-shaping](opportunity-discovery-precedes-idea-shaping.md) — discover-opportunity runs before shape-idea as a user-invoked blank-page phase, and may not choose an MVP or detailed product behavior.
- [agent-context-installs-at-stack-confirmation-and-setup](agent-context-installs-at-stack-confirmation-and-setup.md) — Official vendor agent context installs wherever the stack gets settled — shaping, planning — and on demand through add-stack-context.
- [discovery-draws-material-from-outside-self-report](discovery-draws-material-from-outside-self-report.md) — Discovery sources its own material from the user's traces and current external change, and the user judges it; recall cannot produce the unrecognized.
- [session-grain-tasks-via-split-into-tasks](session-grain-tasks-via-split-into-tasks.md) — Work exceeding one session splits into session-grain tasks, one file each, because the binding constraint is review bandwidth. Fine-grain lists stay rejected.
- [plan-draft-lands-on-disk-before-review](plan-draft-lands-on-disk-before-review.md) — The plan draft is written to plan.md before review, and the review is held on the file rather than in the conversation.

## Shaping

- [visual-media-over-prototype-routing](visual-media-over-prototype-routing.md) — The interview settles experiential questions through whatever visual medium the environment provides, named by capability and never by tool.
- [retire-prototype-collapse-clarify-into-drafts](retire-prototype-collapse-clarify-into-drafts.md) — The interview's four proposing moves are one concept, the draft: a concrete candidate put forward for the user to correct.
- [shaping-writes-documents-not-source](shaping-writes-documents-not-source.md) — A shaping session's durable writes are the spec folder, the glossary and decision records, and installed vendor context — never product code.

## Prototype

- [prototype-returns-full-surface-single-file](prototype-returns-full-surface-single-file.md) — The prototype is a full-surface build — every screen in one self-contained HTML file from a pinned shell, skeleton first, preserved beside the spec.

## explain-visually

- [explain-renders-on-request](explain-renders-on-request.md) — Explaining is its own skill and fires only when the user asks; the silent-confusion case is left uncovered on purpose.
- [explain-becomes-explain-visually](explain-becomes-explain-visually.md) — explain becomes explain-visually: rendering is the skill's content rather than its medium, and the verb-object scheme takes an adverb here.
- [explain-visually-keeps-only-the-counter-defaults](explain-visually-keeps-only-the-counter-defaults.md) — An eval retired the instructions the model now follows unprompted and kept the over-rendering brake; re-prune surviving procedures when models improve.
- [explain-visually-looks-for-a-renderer](explain-visually-looks-for-a-renderer.md) — explain-visually looks for the best renderer the session actually has instead of settling for text in the reply.
