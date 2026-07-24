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
The full-surface build: every screen a feature needs in one self-contained HTML file with shared design tokens, dummy data, and per-screen state toggles, built skeleton first and filled after approval. Where a variant settles one question, the prototype surfaces the questions nobody knew to ask; the approved file survives beside the spec as its visual half.
_Avoid_: Mockup, wireframe, demo

**Structural mirroring**:
Rendering the interviewer's current understanding of a structure (a flow, its states, concept relationships) back to the user, so agreement is judged by looking instead of re-described in prose.
_Avoid_: Diagramming

**Spec**:
The durable handoff document a shape-idea or build-prototype session writes as it ends: confirmed decisions, assumptions, deferred points, and remaining risks, addressed to a later implementation session. Decisions are the deliverable; visuals are disposable, except an approved prototype, preserved beside the spec as its visual half.
_Avoid_: Alignment brief, summary

**Spec folder**:
The per-work-unit folder `docs/specs/<slug>/` that carries one unit's whole handoff: spec.md as the anchor, plan.md when planning ran as its own step, prototype.html when a surface was approved, tasks/ when the work was cut for multi-session execution. Lives per unit and retires wholesale when the work ships. Called "dossier" in records up to 0004.
_Avoid_: Dossier, issue folder

**Plan**:
The optional implementation map a write-plan session writes beside the spec for review: approach, order, acceptance criteria, seams, off-limits areas, and risks, under an advisory contract that the code wins where they disagree and decision-level divergence flows back to the spec.
_Avoid_: Ticket list, task breakdown

**Task**:
A session-sized cut of work that exceeds one sitting: a complete, independently verifiable path through every layer it touches, sized for one fresh session to implement and one review to read, declaring which tasks block it. Tasks whose blockers are all done form the frontier a next session may pick up. Distinct from a pre-cut to-do list, which lacks these properties and stays rejected.
_Avoid_: Ticket, slice, subtask, to-do
