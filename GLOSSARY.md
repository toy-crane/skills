# Glossary

Canonical language for the decisions and artifacts produced by these agent skills.

**Draft**:
A concrete candidate put forward for the user to correct, rather than a blank question for them to answer: a stated assumption under standing veto, a recommended answer, rendered variants, a mirrored structure. The interview's every move; the user's correction is the unit of progress.
_Avoid_: Straw man, proposal as umbrella terms

**Experiential question**:
A question judged by looking or trying (layout, hierarchy, interaction flow, tone) and settled by reacting to something rendered rather than argued in prose. Its complement, a propositional question, settles in prose.
_Avoid_: Perceptual decision

**Visual medium**:
Whatever surface the running environment provides for rendering something the user judges by looking: an inline widget, an artifact page, a local HTML file. Chosen per question, cheapest sufficient one first; never a fixed tool.
_Avoid_: Widget, prototype, artifact as umbrella terms

**Variant**:
One of a small set of alternatives that differs on the governing decision while holding confirmed constraints fixed. Losing variants are discarded once the decision lands.
_Avoid_: Mockup, option

**Prototype**:
The full-surface build: every screen a feature needs in one self-contained HTML file with shared design tokens, dummy data, and per-screen state toggles, rendered in the project's own design system from the first screen and minimally where there is none. Where a variant settles one question, the prototype surfaces the questions nobody knew to ask; the approved file survives beside the spec as its visual half.
_Avoid_: Mockup, wireframe, demo

**Comparison**:
A temporary `compare.html` forming a decision layer separate from the product prototype. It shows up to three variants for the user's specific situation, scoped to the component, screen, or related views needed to judge that question. The chosen outcome is integrated into the canonical prototype, then the comparison is discarded. Comparisons are created per unresolved decision, not per product screen.
_Avoid_: Prototype

**Spec**:
The durable product contract a shape-idea or build-prototype session writes for later implementation: user-visible outcomes, approved scope, observable acceptance criteria, settled constraints and rationale, assumptions, off-limits areas and reasons, deferred points, remaining risks, and setup before implementation. It records behavior rather than predicted implementation. Visuals are disposable except an approved prototype, preserved beside the spec as its visual half. It is revised in place by `babysit-specs` when later work ships and leaves it stale; Git carries the previous versions.
_Avoid_: Alignment brief, summary

**Spec folder**:
The per-work-unit folder `docs/specs/<slug>/` that carries one unit's whole handoff: spec.md as the anchor and prototype.html when a surface was approved. It holds one outcome that could land on the default branch and stay there even if related work never arrives; a change with several such outcomes becomes several folders linked by `Blocked by:` lines. One `implement` run takes one folder. Lives per unit and retires wholesale when the work ships.
_Avoid_: Dossier, issue folder, task

**Comprehension gap**:
A point where the user does not understand the system: a level, a mechanism, why not the alternative, or a single word. Not the same as the interviewer not understanding the user. The first is closed by rendering from the code and docs, in whatever form the gap calls for; the second by rendering for the user to correct.
_Avoid_: Confusion, knowledge gap

**Setup before implementation**:
Work outside the repository that implementation needs before it can run, such as a vendor account, an issued key, or a console or DNS setting. Listed in a spec's `## Setup before implementation` section, one line per item with what it serves and the condition that shows it is done. The agent does what it can of each item; the rest is the user's. Distinct from `Blocked by:` lines, which are dependencies between spec folders, and from the runtime prerequisite `implement` reports when a check fails.
_Avoid_: Prerequisite, manual setup

**Follow-up**:
An open item a session discovered but did not resolve, kept in `docs/follow-ups/<slug>.md`: a temporary workaround whose root cause stays open, or an out-of-scope defect observed with evidence. Carries symptom, observed evidence, suspected cause, what was tried, and a proposed next step, so a later session can act without the original conversation. Distinct from a spec's deferred points, which are decisions postponed during shaping.
_Avoid_: Backlog item, ticket, TODO

**Decision index**:
The router at `docs/decisions/README.md`, one line per durable subject, saying when to read each current decision contract without restating its decision. Readers open the index and only the subjects relevant to their work.
_Avoid_: Standing-position summary, ADR list

**Decision contract**:
The settled current decisions for one durable subject, stored in one mutable `docs/decisions/<subject>.md` file. A decision settles when the user confirms it or it is made under authority the user explicitly delegated for that class of decision. The contract carries the rules and minimum reasons needed now, plus boundaries, reconsideration conditions, still-relevant rejected alternatives, and expensive evidence when they matter. Git history carries prior versions.
_Avoid_: ADR, decision log, record cluster

**Mod**:
A Claude Code plugin whose behavior comes from a hooks module that changes Claude Code's own interface or behavior, such as a pane, a slash command, or a hook on tool calls. Lives in `mods/<name>/` and installs separately from the skills plugin.
_Avoid_: Hook plugin, extension

**Adjacent probe**:
A deliberate misuse `implement` exercises next to a changed behavior after that behavior's acceptance criteria pass, at the same surface and through the same runtime path: an empty value, a repeated action, an action with other state still applied, an interruption. Chosen from what the change touches, not from a fixed checklist, and recorded even when the product holds. Distinct from an acceptance check, which confirms the intended path, and from the final core-loop gate, which guards the product's primary journey against regression.
_Avoid_: Fuzzing, edge-case test, push on it

**Eval**:
The check `llm-evals` uses to prove an acceptance criterion about LLM output that varies run to run: an approved case set, a runner that calls the product's entry point (for a skill, an agent run with the skill installed), and a grader, scored over repeated runs. Its red is the baseline score measured before the behavior changes; its green is a held-out score at or above the spec's target and above the baseline outside the noise floor. Distinct from an automated test, which a deterministic assertion decides.
_Avoid_: Benchmark, LLM test, prompt test

**Capability eval**:
The eval a climb works on: it starts below the spec's target so there is a hill to climb, and it is finished once its held-out score reaches green. A low score means there is room to improve.
_Avoid_: Quality eval, benchmark

**Regression suite**:
The project's single graduated case set, held at the level its cases reached and carrying the same runner and grader the capability eval used. A score below that level means something broke, not that there is room to improve.
_Avoid_: Smoke eval, regression tests

**Graduation**:
Moving a finished capability eval's repeatedly passing cases into the regression suite and deleting the climb's variants, traces, and split, so the question changes from whether the behavior can be reached to whether it still holds.
_Avoid_: Promotion, archiving

**Cell**:
One case judged by one check of the grader: the smallest unit of an eval that passes or fails. A grader that gives a single verdict has one cell per case. Whether an eval is needed is judged per cell, because a case can carry checks that never fail beside checks that do.
_Avoid_: Assertion, data point

**Cell history**:
The committed record, kept beside the regression suite's `log.md`, of how many trials each cell ran and how many it passed, the results of its most recent trials in order, and its result at the baseline of the climb that graduated it. It is what tells a cell never seen failing from one that guards something.
_Avoid_: Results, ledger, run log

**Demotion**:
Moving a regression cell whose most recent trials all passed from the tier that runs whenever the suite runs to the tier that runs only when the model changes. The cell is kept, and a failure there moves it back up. Distinct from removing a case, which still needs a decision to change the behavior or the feature being gone.
_Avoid_: Pruning, retiring, archiving
