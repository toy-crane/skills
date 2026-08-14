# Glossary

Canonical language for the decisions and artifacts produced by these agent skills.

**Draft**:
A concrete candidate put forward for the user to correct, rather than a blank question for them to answer: a stated assumption under standing veto, a recommended answer, rendered variants, a mirrored structure. The interview's every move; the user's correction is the unit of progress.
_Avoid_: Straw man, proposal as umbrella terms

**Opportunity**:
An application direction discovered in the user's experience, access, interests, or capabilities before detailed product behavior is chosen. It connects something the user knows firsthand with a person or situation it could help and a change it might enable.
_Avoid_: Idea, feature, solution

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

**Spec**:
The durable product contract a shape-idea or build-prototype session writes for later implementation: user-visible outcomes, approved scope, observable acceptance criteria, settled constraints and rationale, assumptions, off-limits areas and reasons, deferred points, and remaining risks. It records behavior rather than predicted implementation. Visuals are disposable except an approved prototype, preserved beside the spec as its visual half.
_Avoid_: Alignment brief, summary

**Spec folder**:
The per-work-unit folder `docs/specs/<slug>/` that carries one unit's whole handoff: spec.md as the anchor, prototype.html when a surface was approved, tasks/ when the work was cut into multiple delivery outcomes. Lives per unit and retires wholesale when the work ships.
_Avoid_: Dossier, issue folder

**Comprehension gap**:
A point where the user does not understand the system: a level, a mechanism, why not the alternative, or a single word. Not the same as the interviewer not understanding the user. The first is closed by rendering from the code and docs, in whatever form the gap calls for; the second by rendering for the user to correct.
_Avoid_: Confusion, knowledge gap

**Task**:
A delivery-sized unit cut from a spec: a complete, independently deliverable and verifiable path through every layer it touches, separated only when it can stand on its own. Work that becomes meaningful only when completed together remains one task. Together the tasks are the work unit's shallow roadmap; implementation plans only the active outcome in detail and may revise unfinished tasks after verified discoveries while preserving the approved product contract. Tasks whose genuine blockers are all done form the frontier implementation may continue through. A task boundary always carries focused verification and reconciliation, but is not automatically a context or automated-review boundary. Distinct from a pre-cut to-do list, which lacks these properties and stays rejected.
_Avoid_: Ticket, slice, subtask, to-do

**Follow-up**:
An open item a session discovered but did not resolve, kept in `docs/follow-ups/<slug>.md`: a temporary workaround whose root cause stays open, or an out-of-scope defect observed with evidence. Carries symptom, observed evidence, suspected cause, what was tried, and a proposed next step, so a later session can act without the original conversation. Distinct from a spec's deferred points, which are decisions postponed during shaping, and from human-review's deferred commitments, which are unresolved questions inside one review.
_Avoid_: Backlog item, ticket, TODO

**Decision index**:
The router at `docs/decisions/README.md`, one line per durable subject, saying when to read each current decision contract without restating its decision. Readers open the index and only the subjects relevant to their work.
_Avoid_: Standing-position summary, ADR list

**Decision contract**:
The settled current decisions for one durable subject, stored in one mutable `docs/decisions/<subject>.md` file. A decision settles when the user confirms it or it is made under authority the user explicitly delegated for that class of decision. The contract carries the rules and minimum reasons needed now, plus boundaries, reconsideration conditions, still-relevant rejected alternatives, and expensive evidence when they matter. Git history carries prior versions.
_Avoid_: ADR, decision log, record cluster
