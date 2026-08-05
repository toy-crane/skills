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

**Structural mirroring**:
Rendering the interviewer's current understanding of a structure (a flow, its states, concept relationships) back to the user, so agreement is judged by looking instead of re-described in prose.
_Avoid_: Diagramming

**Spec**:
The durable handoff document a shape-idea or build-prototype session writes as it ends: confirmed decisions, assumptions, off-limits areas, deferred points, and remaining risks, addressed to a later implementation session. Decisions are the deliverable; visuals are disposable, except an approved prototype, preserved beside the spec as its visual half.
_Avoid_: Alignment brief, summary

**Spec folder**:
The per-work-unit folder `docs/specs/<slug>/` that carries one unit's whole handoff: spec.md as the anchor, prototype.html when a surface was approved, tasks/ when the work was cut for multi-session execution. Lives per unit and retires wholesale when the work ships.
_Avoid_: Dossier, issue folder

**Comprehension gap**:
A point where the user does not understand the system: a level, a mechanism, why not the alternative, or a single word. Not the same as the interviewer not understanding the user. The first is closed by rendering from the code and docs, in whatever form the gap calls for; the second by rendering for the user to correct.
_Avoid_: Confusion, knowledge gap

**Task**:
A delivery-sized unit cut from a spec: a complete, independently deliverable and verifiable path through every layer it touches, separated only when it can be implemented and reviewed on its own. Work that becomes meaningful only when completed together remains one task. Tasks whose genuine blockers are all done form the frontier a fresh implementation session may pick up. Distinct from a pre-cut to-do list, which lacks these properties and stays rejected.
_Avoid_: Ticket, slice, subtask, to-do

**Decision index**:
The router at `docs/decisions/README.md`, one line per durable subject, saying when to read each current decision contract without restating its decision. Readers open the index and only the subjects relevant to their work.
_Avoid_: Standing-position summary, ADR list

**Decision contract**:
The human-approved current decisions for one durable subject, stored in one mutable `docs/decisions/<subject>.md` file. It carries the rules and minimum reasons needed now, plus boundaries, reconsideration conditions, still-relevant rejected alternatives, and expensive evidence when they matter. Git history carries prior versions.
_Avoid_: ADR, decision log, record cluster
