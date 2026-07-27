# Rejection ledger

Pre-registered for the `compact-decisions` first runs. Written 2026-07-27,
before any run, from the cluster records as they stand at `f5ceb0e`.

Every entry is something a record ruled out. A run that compacts a cluster
may not lose an entry that a reader could plausibly re-propose. See the spec
for what “plausibly” does here — it is the load-bearing word, and this file
is the evidence that it has to be.

Extraction ran one agent per cluster, then a second whose only instruction was
to find what the first missed. The second pass added 35 of the 148 entries, all
from body prose and consequences sections.

## Skill naming

Records 0006 · 0007 · 0013 · 0015 · 0016 — 11,527 characters, 59 entries.

### 0006

- **Deliverable nouns: `spec`, `plan`, `prototype`, `domain-model`** — plan is reserved by both harnesses, and a skill named spec collides in prose with the artifact every skill text calls "the spec" `considered-options`
- **Namespace prefix: `spec`, `spec-plan`, `spec-prototype`** — the autocomplete grouping is worth little at five skills, and the names stop matching what a user actually says to invoke them `considered-options`
- **One uniform verb (`draft-*`)** — no single verb is honest for all skills, and Draft is already a glossary term of art `considered-options`
- **Bare deliverable nouns (spec, plan, prototype) — "were the first choice"** — failed on a reserved word: `/plan` is a built-in slash command in both Claude Code (plan mode, `/plan open`, `/plan share`) and Codex CLI (`ModeKind::Plan`) `body-prose`
- **`to-plan`** — 0005 flagged that it "still shares a word with plan mode"; verb-object names dissolve the collision instead of dodging it `body-prose`
- **Ship a skill that shadows the built-in (or is reachable only as `$plan`)** — in Claude Code a same-named skill shadows the built-in, in Codex the built-in always wins — either direction confuses routing `body-prose`
- **Four grammatical forms across five names (clarify, to-plan, prototype, domain-modeling, tdd)** — the replacing rule splits on how a skill is reached, not on ad-hoc per-skill grammar `body-prose`
- **Discipline nouns for user-invoked skills** — a skill the user invokes directly is a command, so it takes an imperative verb-object pair; only background/skill-invoked practices keep the discipline noun `body-prose`
- **Retroactively renaming older records and retired spec folders** — records up to 0005 and retired spec folders keep the old names `consequences`
- **Verb-object names for background/discipline skills (renaming `domain-modeling`, `tdd` into verb-object form)** — The two-class rule cuts both ways, and the extractor captured only one direction. "A skill that triggers in the background or is invoked by other skills is a practice, not a command, so it keeps its discipline noun: domain-modeling, tdd." Applying the new verb-object scheme uniformly across the whole published set is ruled out here — the rule splits on how a skill is reached, so extending the command grammar to non-invoked skills is rejected as explicitly as discipline nouns are rejected for invoked ones. `body-prose` *(found by the omission pass)*
- **Bare imperative verb with no object (`clarify`), and bare deliverable noun as a name (`prototype`)** — Rejected as name forms, not just as members of the "four grammatical forms" lump the extractor recorded. The consequences make the specific replacements: "clarify becomes write-spec, ... prototype becomes build-prototype." The bare-verb form is a distinct rejected class — it is the same form 0015 later revives for `explain` and 0016 re-rejects ("reads as the act every assistant already performs"), so losing it here breaks the through-line across the cluster. `body-prose opening + consequences` *(found by the omission pass)*
- **Back-compatible aliases, deprecation shims, or automated migration for renamed skills** — Rejected as a mechanism, stated as a bare fact in every rename record and therefore invisible to a heading-driven extraction. 0006: "Copies installed via skills.sh keep the old names until reinstalled, and local symlinks need one `scripts/link-skills.sh` re-run." Repeated verbatim in 0007, 0013 ("as with the 0006 and 0007 renames"), and 0016 ("as with the 0006, 0007, and 0013 renames"). Four records decline to ship an old-name alias and accept a manual re-link instead; the extractor lists none of it. `consequences` *(found by the omission pass)*
- **Naming a new skill before checking it against harness built-ins** — The closing sentence sets a gate that rules out the naming procedure that produced the failure: "New skills follow the two-class rule, checking candidate names against both harnesses' built-in slash commands first." Name-first-verify-later is rejected — this is the rule CLAUDE.md now encodes, and it is a rejection of a process rather than of a name, which is exactly the class the extractor skipped. `consequences` *(found by the omission pass)*

### 0007

- **Keep `write-spec`** — overemphasizes document production and makes the interview, investigation, and decision work sound incidental `considered-options`
- **`align-idea`** — suggests bringing people into agreement around an already-formed idea, while this workflow also discovers and changes the idea's shape `considered-options`
- **`shape-change`** — describes implementation-bound work well but assumes the change boundary exists before the skill has established it `considered-options`
- **`write-spec` (naming the skill after its durable artifact)** — named the durable artifact but obscured the work that produces it — writing spec.md is the handoff, not the activity; note 0013 later revives the `write-` verb for write-plan because plan.md is itself the review surface `body-prose`
- **Naming the skill after alignment** — alignment is the success condition of the shaping work rather than the action itself `body-prose`
- **Back-porting `shape-idea` into decision 0006 and older records** — historical records retain `write-spec` as the name that was current when they were written `consequences`
- **A narrow object noun for the shaping skill (shape-feature, shape-plan, shape-refactor, shape-policy)** — Rejected in a subordinate clause justifying `idea`: it "names the input broadly enough to include a feature, redesign, refactor, policy, or plan." Every one of those five nouns is a candidate object being ruled out for binding the skill to one kind of input. The extractor caught only `shape-change`, which is the considered-options bullet. `body-prose` *(found by the omission pass)*

### 0013

- **Keep `draft-plan`** — the rough-draft reading misstates the deliverable (a plan complete enough to implement from), leaving "draft" a one-off verb `considered-options`
- **`draft-tasks`** — the new sibling skill was not going to extend the verb — it fell to the same rough-draft objection `considered-options`
- **`to-plan`** — rejected, again: a preposition with the verb elided; a route sign rather than a command, meaningful only to someone who already knows the to-X lineage `considered-options`
- **`plan-work`** — names the activity but breaks the name-to-glossary pairing on a generic object, and sits next to the built-in `/plan` in autocomplete `considered-options`
- **Bare `plan`** — impossible: `/plan` is reserved by both harnesses (0006) `considered-options`
- **Applying 0007's anti-`write-` objection ("writing is the byproduct") to the plan skill** — unlike the interview behind shape-idea, plan.md is itself the review surface, so writing it is an honest name for producing it — a partial reversal of 0007's reasoning `body-prose`
- **Reopening/replacing the verb-object scheme (0006)** — it remains the only naming class that covers the whole published set — later bent (not replaced) by 0016's adverb `body-prose`
- **Renaming the glossary term **Draft**** — the glossary term Draft (the interview discipline) is untouched by the skill rename `consequences`
- **Naming the skill after its review contract (the draft / review / publish-on-approval cycle)** — The record concedes the contract reading is correct and rejects it as a naming basis anyway — the extractor's reason for "keep draft-plan" records only the rough-draft misreading. "'Draft' names the skill's review contract (draft, review, publish on approval) but reads first as rough, unfinished... The verb should name the work: for this skill the document is the work." Naming a skill after its process is ruled out even when the process name is accurate, while the contract itself is kept. `body-prose` *(found by the omission pass)*

### 0015

- **A third render gate in shape-idea** — traps the capability inside shaping sessions; the point is to have it while reading an unfamiliar repo, debugging, or reviewing `considered-options`
- **`visual-explanation`** — the noun class is for skills that fire in the background or are called by other skills; this one is user-facing, and the noun names the artifact instead of the act `considered-options`
- **`explain-visually`** — "visually" is the medium, and 0001 keeps the medium out of a skill's identity — REVERSED by 0016, which holds 0001 bars naming a tool, not a medium `considered-options`
- **`comprehension-gap`** — names the trigger, hides the act `considered-options`
- **Keeping the signal list too** — the silent case is uncovered on purpose `considered-options`
- **Watching for silent confusion (same question twice, a term avoided, an empty approval followed by a return to the subject)** — guessing needed support that was most of the skill's text; it served a user who will not speak up, and a user who asks once will ask again `body-prose`
- **The guessing support clauses — never say "you seem confused", check understanding by offering the next choice** — cut with the silent-confusion trigger they propped up; without them the skill is three paragraphs `body-prose`
- **Calling `domain-modeling` when the gap is a project term** — a thin glossary is not the stuck user's problem, the premise breaks in a repo the user does not own, and it put back the durable write the skill had just dropped `body-prose`
- **A brake on over-drawing** — the narrower (user-asks) trigger made it pointless `body-prose`
- **A durable write in the explain skill** — dropped from the skill; reinstating it was counted as a cost against the domain-modeling clause `body-prose`
- **Widening shape-idea's render gates past its two (variants, one mirror diagram)** — everything else stays prose, and that gate is narrow on purpose — the interview spends as little of the user's time as it can `body-prose`
- **Making `explain` a pipeline stage** — the pipeline diagram is untouched; `explain` is not a stage `consequences`
- **Giving shape-idea any explaining machinery of its own, beyond a single pointer line** — Distinct from the rejected "third render gate" (a gate on shape-idea's existing renders): this rejects integration surface of any size. "shape-idea gets one line pointing to it" and, in consequences, "shape-idea gains one line and nothing else." The justification is a rejected premise too — shaping treats the user as the authority, explaining treats "the code and the docs" as the authority, so explaining cannot be a sub-step of the interview. `body-prose second paragraph` *(found by the omission pass)*
- **Rendering inside shape-idea to serve the user's understanding** — Ruled out mid-argument by a purpose clause the extractor read past: shape-idea's two renders (variants, one mirror diagram) "both exist to get the interviewer's understanding corrected." A render aimed at the user's comprehension is therefore outside those gates by construction — that need routes to the separate skill. The extractor recorded only the ban on widening the gates numerically, not the ban on repurposing them. `body-prose` *(found by the omission pass)*
- **The silent-confusion trigger, rejected only provisionally ("for now")** — The extractor records the cut as permanent. The record does not: "The silent misunderstanding stays uncovered; the signal list is written down above so it can be revived instead of rediscovered." The signal list is preserved in the record precisely so the rejection can be reversed — a deliberately reopenable rejection, which changes what a later reader may do with it. `consequences` *(found by the omission pass)*

### 0016

- **Keep `explain`, drop the visual bias** — rejected, and briefly implemented: makes the skill medium-neutral, at which point it restates what the model does by default — the push to render was the capability `considered-options`
- **`explain-with-a-picture`** — narrows to the one shape the change is trying to widen past `considered-options`
- **`show`** — names the medium as the act and loses the gap being closed `considered-options`
- **`visualize`** — names the medium as the act and loses the gap being closed `considered-options`
- **Enumerate every visual form** — a closed list is the same mistake as the four structural gaps, one level up; 0009 keeps skills thin `considered-options`
- **`explain` (the bare verb as the skill name)** — reads as the act every assistant already performs — a weak promise to the user and a bad trigger, inviting firing on gaps a single sentence closes `body-prose`
- **0015's reading that 0001 keeps the medium out of a skill's identity** — that reading stretches 0001, which bars naming a tool (a widget, an artifact page, an HTML file) so the capability survives a change of environment; "visually" names no tool `body-prose`
- **Leaving the object slot empty because the object changes every time (0015's reason)** — the adverb fills the slot with the part that does not change — reverses 0015's justification for the bare verb `body-prose`
- **Keeping the verb-object scheme (0006) unbroken here** — the cost is real and accepted: this skill takes an adverb instead of an object `body-prose`
- **The four gaps to draw (a flow, a relationship, a state change, a shape)** — all structural, all box-and-arrow — leaves out a mechanism run with real values, alternatives side by side, a table, a timeline, annotated code, a before-and-after `body-prose`
- **A closed vocabulary of shapes** — the skill now takes the form from the gap and refuses it `body-prose`
- **Retaining 0015's decisions 3, 6, 9, 10 and its `explain-visually` rejection** — superseded here, along with the matching lines in docs/specs/explain-skill/spec.md; 0015 still stands for why the skill exists, when it fires, and what it writes `consequences`
- **Firing on a one-sentence gap** — it now falls outside the skill and is answered by the model directly, which is the intended split `consequences`
- **Naming a skill after the rendering tool (a widget, an artifact page, an HTML file)** — Reaffirmed as rejected in the subordinate clause that licenses `explain-visually`: 0001 "bars naming a *tool* — a widget, an artifact page, an HTML file — so the capability survives a change of environment. 'Visually' names no tool." The record reverses 0015's medium reading while keeping the tool bar live; the extractor kept the reversal and dropped the boundary that makes it narrow, so the entry reads as if 0001 no longer constrains naming at all. `body-prose` *(found by the omission pass)*
- **Superseding 0015 wholesale (retiring or rewriting the record rather than voiding four of its decisions)** — Partial supersession is chosen and the total kind is declined: "0015 stands as the record of why the skill exists, when it fires, and what it writes; its decisions 3, 6, 9, and 10, its `explain-visually` rejection, and the matching lines in `docs/specs/explain-skill/spec.md` are superseded here." The extractor captured the superseded items but not the decision to leave the rest of 0015 authoritative — a rejection of a mechanism (how a record is overturned), not of a name. `consequences` *(found by the omission pass)*

### Flagged as not a real rejection

- Duplicate, not a second rejection: "Bare deliverable nouns (spec, plan, prototype) — 'were the first choice'" (0006, body-prose) is the same rejection as "Deliverable nouns: spec, plan, prototype, domain-model" (0006, considered-options). The body paragraph restates the options bullet with its history; counting it twice inflates 0006's list and splits one reason (reserved word + prose collision) across two entries.
- Weak: "Renaming the glossary term **Draft**" (0013, consequences). The record never weighs this — "The glossary term Draft (the interview discipline) is untouched" is a scope boundary preempting a misreading of the rename, not an alternative that was considered and turned down. Same pattern as "Making `explain` a pipeline stage" (0015), though that one at least denies a plausible positioning.

## The prototype skill and visual media

Records 0001 · 0003 · 0004 — 8,219 characters, 46 entries.

### 0001

- **Keep the /prototype routing** — build weight and skill hand-off mid-interview — partially reversed by 0004, which regains one narrow routing at surface scale `considered-options`
- **Name concrete tools like an inline widget API** — binds the skill to one surface `considered-options`
- **Approximate every question inline regardless of fidelity** — reactions to an insufficient medium recorded as confirmed decisions produce false alignment `considered-options`
- **naming the medium by tool name (rather than by capability)** — clarify is a published skill that runs on surfaces we don't control (terminal, desktop app, web) `body-prose`
- **approximating a question no available medium can settle** — it must be deferred explicitly as a remaining risk instead of approximated `body-prose`
- **treating visuals as the deliverable** — visuals are disposable scaffolding, and decisions are the deliverable — narrowed by 0004, which preserves the approved prototype.html `body-prose`
- **retiring the prototype skill (removing it from the repo)** — the prototype skill stays in the repo for direct invocation; only clarify's routing is removed — reversed by 0003, which retires it from the published set `consequences`
- **clarify's issue-artifact delivery clause** — dropped along with the routing, since delivery now happens through the environment's visual medium `consequences`
- **Settling an experiential or structural question through a run of prose questions** — 0001 line 8-9: "A rendered reaction also compresses several prose questions into one turn, which serves the skill's question-reduction goal directly" — the multi-turn prose interrogation of an experiential question is ruled out mid-argument, not just the /prototype route. The extractor captured the rejection of /prototype and of tool-named media but never the rejection of prose itself as the medium. `body-prose` *(found by the omission pass)*
- **Escalating fidelity beyond what the question demands (defaulting to the richest available medium)** — 0001 line 11-13: "pick the cheapest medium sufficient for the question and escalate fidelity only when the question itself demands it." The extractor captured both under-fidelity rejections (approximating inline regardless of fidelity; approximating a question no medium can settle) but missed the symmetric over-fidelity rejection, which is the other half of the same rule sentence. `body-prose` *(found by the omission pass)*
- **Leaving evals #3, #4, #6, #7 in the /prototype-era medium language** — 0001 line 26-27: they "must be rewritten around the new medium language" — the existing eval text is ruled out, not merely made stale. A consequence-level rejection sitting in the same sentence as the issue-artifact clause the extractor did capture. `consequences` *(found by the omission pass)*

### 0003

- **Keep prototype until the rebuild lands** — subscribers would keep installing semantics slated for replacement, and the rebuild owes nothing to the old text `considered-options`
- **Describe each proposing move separately (status quo)** — four sites restating one mechanism; a leading word says it once and recruits priors the model already holds `considered-options`
- **"Straw man" as the leading word** — outside Anglo standards culture the fallacy reading dominates, and a leading word must anchor the humans who read and fork a published skill `considered-options`
- **"Lazy consensus" as the leading word** — covers the assumption-veto move but not variants or structural mirroring `considered-options`
- **prototype stays in the repo for direct invocation** — reversing 0001's consequence — since 0001 removed clarify's routing the two shared no textual edge, so retiring prototype orphans nothing `body-prose`
- **fill a blank page (ask without putting forward a concrete candidate)** — people mark up a draft more reliably than they fill a blank page `body-prose`
- **interrogation (spending questions on low-risk decisions instead of assuming with veto)** — questions are spent only on branches that are expensive to get wrong `body-prose`
- **rebuild prototype from the old skill's text** — a future prototype returns as a fresh skill under its own decision record `consequences`
- **Editing the skill text as model capability grows (a capability-tuned rewrite)** — 0003 line 14-16: "the interview naturally shifts from interrogation toward assumption review as model capability grows; the same clause absorbs more decisions without the text changing." This rules out re-tuning the text per model generation — the exact structural twin of 0004's molt-point rejection ("harness evolution replaces it without touching the skill text"), which the extractor did capture. It caught one and missed the other. `body-prose` *(found by the omission pass)*
- **Choosing the leading word on the model's priors alone (assuming an Anglo standards-culture readership)** — 0003 line 27-29, subordinate clause: "a leading word must anchor the humans who read and fork a published skill, not only the model." This rejects a selection criterion, not a name — model-legibility alone is insufficient, and Anglo-standards-culture connotation cannot be assumed. The extractor recorded the two rejected words but not the rejected criterion behind them, which is what generalizes to future naming. `considered-options` *(found by the omission pass)*
- **Reopening or reverting 0001's visual-medium decision for clarify** — 0003 line 35-36 ("its visual-medium decision for clarify stands unchanged") and 0004 line 65 ("0001's visual-medium decision otherwise stands"). Both records explicitly decline the bundled option of revisiting the medium decision while reshuffling prototype — a scope guard stated as a bare positive that rules out the reversal. Nothing in the extraction reflects that either record considered and declined this. `consequences` *(found by the omission pass)*

### 0004

- **Replace the build step with an external design product** — alignment would happen away from the session's context and re-enter through prose, recreating the loss the skill exists to remove `considered-options`
- **Keep the run scoped to one uncertainty, as retired** — question-scale uncertainty already has a home in clarify's variants; the gap is surface-scale `considered-options`
- **Project-stack components with dummy data** — wiring cost fights cheap exploration, stack fidelity buys nothing for a reference artifact, and a framework route cannot be preserved as a frozen file `considered-options`
- **A utility-CSS framework inside the file** — every delivery mechanism breaks self-containment, and ready-made classes bypass the token funnel that consistency depends on `considered-options`
- **Screen-per-file with shared CSS** — consistency by convention rather than construction, and a multi-file surface neither travels nor renders as one thing `considered-options`
- **In-file review devices** — rejected after trial: each duplicated the reviewing medium's own affordances or tracked protocol state that only the final materialization needs `considered-options`
- **numbered pointing badges** — chrome that needs explaining has failed; pointing at problems belongs to the reviewing medium or to prose `body-prose`
- **a collapse pill** — killed by trial use — chrome that needs explaining has failed `body-prose`
- **approval stamps** — killed by trial use — chrome that needs explaining has failed `body-prose`
- **change highlights** — killed by trial use — chrome that needs explaining has failed `body-prose`
- **chrome regenerated per run (unpinned shell.html)** — it is plumbing that rots silently when regenerated per run, two such bugs surfaced while drafting it `body-prose`
- **real tokens and finished styling before the structure is approved** — skeleton first in wireframe gray, because rough styling directs feedback at structure, not fonts and colors `body-prose`
- **naming concrete library and framework names in the skill text** — 0001's no-tool-names discipline extended here from tool names to library and framework names `body-prose`
- **"visuals are disposable scaffolding" applied to the approved surface** — alignment reached by looking cannot round-trip through prose alone, so the approved surface survives at docs/specs/<slug>/prototype.html — narrows 0001 `body-prose`
- **the preserved prototype as production code** — the preserved file is a reference, never production code `body-prose`
- **ad-hoc mockups (consistency by aspiration)** — cross-screen consistency, their observed failure, is made structural by the :root token funnel all screens style through `body-prose`
- **no clarify routing into a build at any scale (0001's blanket rejection)** — at surface scale the mode switch into a build is no longer a cost but the point — reverses 0001's rejection at exactly this scale `body-prose`
- **editing the skill text when the harness evolves** — the template file is the shell's molt point: harness evolution replaces it without touching the skill text `consequences`
- **Prose (and relying on the user to raise the problem) as the route to unmentioned misalignment** — 0004 line 5-7: "The rebuilt skill exists for what neither prose nor variants can reach: misalignment the user cannot flag because it was never mentioned." The extractor captured the variants half via the "Keep the run scoped to one uncertainty" option but dropped the prose half and the user-will-flag-it assumption — which is the record's actual justification for existing. `body-prose` *(found by the omission pass)*
- **Any review chrome beyond the three shipped controls** — 0004 line 15-16: "screen tabs, per-screen state pills, a viewport cycle, and nothing else." A bare negative setting a general bar, broader than the four named devices the extractor listed (badges, collapse pill, stamps, highlights) — those were the tried instances; "and nothing else" forecloses untried ones too. `body-prose` *(found by the omission pass)*
- **Preserving the working visuals produced between passes** — 0004 line 30-31: "Working visuals between passes remain disposable." Only the approved surface survives; intermediate passes are explicitly not kept. The extractor captured the narrowing of 0001's disposability rule for the approved file but not the carve-out that keeps everything else disposable — the boundary is itself a rejection of versioning the intermediates. `body-prose` *(found by the omission pass)*
- **A general clarify-to-build routing (re-routing question-scale experiential questions into a build)** — 0004 line 32-35: "Clarify regains one narrow routing ... at exactly this scale." The extractor recorded the reversal of 0001's blanket rejection but not the deliberate narrowness — question-scale routing into a build stays rejected, superseded only when the question "outgrows variants (a whole surface rather than one choice)". `body-prose` *(found by the omission pass)*
- **A partial-surface build (only the screens the question touches)** — 0004 line 7-8: "Its unit of work is therefore the whole surface, every screen a feature needs with dummy data." This is distinct from the retired one-uncertainty-per-run scoping the extractor captured: it also rules out a hero-screen or happy-path subset within a single run. `body-prose` *(found by the omission pass)*
- **The GLOSSARY's existing Spec definition (writing sessions only, no preserved-prototype exception)** — 0004 line 66-67: "Spec widens to name both writing sessions and the preserved-prototype exception." An overturned prior position — the standing definition is insufficient and is replaced. The extractor's list contains no glossary-level overturn. `consequences` *(found by the omission pass)*

## Planning and task splitting

Records 0005 · 0012 — 6,331 characters, 43 entries.

### 0005

- **Port to-spec from mattpocock/skills** — clarify already ends by synthesizing a spec, and short-circuits to the summary once the conversation has resolved every branch `considered-options`
- **A tickets skill (port to-tickets)** — at this repo's scale the work unit is already one spec per worktree, so pre-cut slices divide nothing, and at any scale they rot — REVERSED by 0012, which found the binding constraint is the user's review bandwidth, not scale; the concept returned as split-into-tasks at session grain `considered-options`
- **A standing workflow route for parallel implementation** — zero practiced runs to encode; parallel write-work is reliable only when shared decisions are externalized until units become mechanical, which feature work here is unlikely to meet; and the orchestration can be derived on demand the day a spec overflows a session `considered-options`
- **Port implement** — plan mode, built-in review commands, and the personal commit and pr skills already cover it `considered-options`
- **A plan.md template file** — rejected for now — one reader per instance means cross-instance uniformity buys little, and the only pinned text is the two-line contract, which lives verbatim in the skill text; promote to templates/ only if real usage shows format drift `considered-options`
- **tasks.md (0002's anticipation)** — retired — pre-cut task lists encode predictions that rot as execution discovers the terrain `body-prose`
- **pre-cut task lists** — they encode predictions that rot as execution discovers the terrain `body-prose`
- **behavior-shaped tickets** — a defense against task-list rot that converges back onto just-in-time planning against a stable spec `body-prose`
- **rolling replans** — a defense against task-list rot that converges back onto just-in-time planning against a stable spec `body-prose`
- **anchoring units to existing structure** — a defense against task-list rot that converges back onto just-in-time planning against a stable spec `body-prose`
- **a plan authored ahead of execution (decomposition before the implementation session)** — a plan derived at execution time is always fresher than one authored ahead of it; what must survive the gap between sessions is the slow-aging layer (decisions, criteria), not predictions about code `body-prose`
- **a mandatory planning stage (plan.md always written)** — the pipeline forks on how much review the "how" deserves; the default route hands spec.md straight to a fresh implementation session and to-plan is the optional route `body-prose`
- **plan.md justified as information transport** — writing derivable content down is justified not as information transport but because a concrete draft draws out the user's corrections, which are the only cargo the document carries across time `body-prose`
- **the plan overriding the code (map wins over terrain)** — the code is the terrain and the plan a map; where they disagree the terrain wins, and decision-level divergence flows back to spec.md `body-prose`
- **"dossier" (0002's term)** — renamed to "spec folder" in all text going forward `body-prose`
- **the vendored grill-with-docs trio (grilling, grill-with-docs, domain-modeling under .agents/skills/, their .claude/skills/ symlinks, skills-lock.json)** — retires with this decision; only writing-great-skills stays vendored `consequences`
- **evals for to-plan written up front** — they wait for first real usage `consequences`
- **Relying on plan mode alone when the "how" deserves review (no written plan.md at all)** — 0005 keeps plan mode as the *default* route's decomposition mechanism ("hands spec.md straight to a fresh implementation session, plan mode included"), but rules it out for the review case: an in-session plan is not a review surface, and the whole point of drafting plan.md is that a concrete draft on disk draws out the user's corrections. The extractor captured the inverse rejection (mandatory planning) but not this one — that plan mode alone is insufficient when review is wanted. `title + body-prose` *(found by the omission pass)*
- **Forking the pipeline on any variable other than how much review the "how" deserves (e.g. routing by size, complexity, or risk)** — "the pipeline forks on one variable only: how much review the 'how' deserves" — the words "one variable only" explicitly rule out every other routing criterion. Notably, 0012 later adds a *second* fork (work exceeding one session), which makes this an overturned position too. `body-prose` *(found by the omission pass)*
- **Letting decision-level divergence be absorbed by plan.md (or left in the code) instead of flowing back to spec.md** — the verbatim contract is "advisory" and says decision-level divergence "flows back to spec.md". Two things are ruled out mid-clause: a *binding/prescriptive* plan contract, and the plan (or the implementation session) becoming the home of amended decisions. The extractor only captured "the plan overriding the code"; it missed that the plan is also barred from being the place decisions get re-recorded — the slow-aging layer stays in spec.md. `body-prose` *(found by the omission pass)*
- **Continuing straight from the shaping/clarify session into implementation (one long session carrying context forward)** — the handoff is repeatedly to "a fresh implementation session", and the argument is about "the gap between sessions" and what "must survive" it. A same-session continuation would make the whole freshness/slow-aging-layer argument moot, so the record tacitly rules it out. Stated only in a subordinate framing, never as a heading. `body-prose` *(found by the omission pass)*
- **0005's position that session-overflow orchestration "can be derived on demand" rather than routed** — partially REVERSED by 0012 and not flagged as a reversal by the extractor. 0005 argued the day a spec overflows a session the orchestration can be derived ad hoc; 0012 installs a standing, named, published route for exactly that case (split-into-tasks). Only the *parallel-execution* half of 0005's position survives ("stays unrouted until practiced runs exist"). `0005 considered-options` *(found by the omission pass)*

### 0012

- **Rename the pipeline to to-spec / to-plan / to-tasks** — the to-X form cannot cover discover-opportunity, build-prototype, or add-stack-context, so it would split the published set into two naming classes, and it elides the verb where this skill's intent (splitting because the work is too big) lives `considered-options`
- **Publish to a real tracker (GitHub, Linear)** — the user opens each task's session by hand, so native blocking links buy nothing, and the repo has no tracker-configuration mechanism to pay for `considered-options`
- **Port the prefactoring instruction** — a method directive; the thin-skills principle (0009) leaves method to the model `considered-options`
- **An execute/implement companion skill** — rejected, again — plan mode, tdd, commit, and pr already cover a task's session, as 0005 found `considered-options`
- **Fine-grain task lists** — still rejected — the properties that make a task reviewable (vertical, verifiable, session-sized) are exactly what a to-do-list slice lacks; 0005's objection to that grain stands `considered-options`
- **0005's rejection of to-tickets / task splitting as such** — REVERSED here — real usage produced the counterexample: when a plan outgrows one session the binding constraint is the user's review bandwidth, so the concept returns at session grain as split-into-tasks `body-prose`
- **model context as the binding constraint on task size** — the binding constraint is the user's review bandwidth, not model context `body-prose`
- **one giant session for oversized work** — a plan too big to read in one sitting gets stamped instead of reviewed, and the change a giant session produces is equally unreviewable `body-prose`
- **splitting into "a pre-cut task list" (sub-session grain)** — write-plan/draft-plan's Order section already split oversized work at session grain, never into a pre-cut task list; split-into-tasks only materializes those session-grain pieces as files `body-prose`
- **dismissing the rot objection** — the rot objection is answered rather than dismissed — coarse session grain, the map contract in every task file, status updates by implementing sessions, and re-cutting the remainder when learning invalidates later tasks `body-prose`
- **plan.md as a prerequisite for splitting** — the skill takes the spec folder; plan.md is an input when present, never a prerequisite `body-prose`
- **publishing task files before reviewing the breakdown** — the skill reviews the breakdown with the user before writing anything `body-prose`
- **Parallel execution across worktrees** — stays unrouted until practiced runs exist `consequences`
- **evals for split-into-tasks written up front** — evals wait for first real usage `consequences`
- **Leaving the session-grain split as prose inside write-plan's Order section (no separate splitting skill)** — this is the status quo 0012 overturns and the extractor missed entirely: "draft-plan's Order section already split oversized work ... split-into-tasks materializes those session-grain pieces as files *instead of prose*". The rejected option is not a different grain — it is the same grain left unmaterialized, which is the strongest do-nothing alternative available to 0012. `body-prose` *(found by the omission pass)*
- **A single tasks.md list document (one file holding all tasks), or tasks stored outside the spec folder** — "publishes one file per task under docs/specs/<slug>/tasks/" rules out the single-document form 0002 originally anticipated and 0005 retired — even at the session grain that 0012 rehabilitates. One-file-per-task is a mechanism choice against the list-file mechanism, and the location choice keeps tasks inside the spec folder rather than in a top-level directory or a tracker. `body-prose` *(found by the omission pass)*
- **Horizontal / layer-shaped slices, and non-verifiable scaffolding-only tasks** — a task is defined as "a tracer-bullet vertical slice: a complete path through every layer it touches, independently verifiable". The definition rules out slicing by layer (all the schema, then all the API, then all the UI) and any slice that cannot be verified on its own. The extractor's "fine-grain task lists" entry covers size, not shape — the shape rejection is separate and is stated only inside the definition. `body-prose` *(found by the omission pass)*
- **A fixed linear order (numbered sequence) as the execution contract for tasks** — tasks declare "the tasks that block it" and "Unblocked tasks form the frontier a next session picks from" — a blocking graph plus a pick-from frontier, which displaces the linear Order-section sequence that plan.md used. Ordering as a prescribed sequence is ruled out in favor of dependency declarations. `body-prose` *(found by the omission pass)*
- **Task status maintained by anything other than the implementing session (a coordinator, an orchestrator skill, or an external tracker)** — "implementing sessions update task status as they finish" — status upkeep is assigned to the session doing the work, which rules out a separate tracking mechanism and reinforces the tracker rejection. The extractor folded this into a generic "rot objection answered" entry and lost the mechanism-level rejection. `body-prose` *(found by the omission pass)*
- **split-into-tasks as a mandatory pipeline stage** — the handoff is conditional — "write-plan's Order section hands work *exceeding one session* to split-into-tasks by name" — so work that fits one session skips it. This is the same optional-route stance 0005 took for to-plan, applied to splitting, and the extractor captured it only for 0005. `consequences` *(found by the omission pass)*
- **"Ticket" as the vocabulary term for a unit of split work** — the concept is ported back from to-tickets but the record deliberately renames it: "Each **task** (now a glossary term)", and the consequences say "GLOSSARY gains Task". "Ticket" is dropped along with the tracker it implies. A naming rejection stated only by substitution — exactly the kind this repo records elsewhere (0006, 0007, 0013). `body-prose` *(found by the omission pass)*

### Flagged as not a real rejection

- "rolling replans" — the record says the three defenses "converge back onto just-in-time planning against a stable spec", i.e. rolling replanning IS substantially the chosen approach, not an option ruled out. Listing it as a rejected alternative inverts the argument; at most it was rejected as a redundant separate mechanism.
- "the vendored grill-with-docs trio" — a consequences-section housekeeping retirement, not an alternative weighed against just-in-time planning. Defensible only under a very loose reading of "rejected alternative"; it never competed with the decision.
- Double-counting: "tasks.md (0002's anticipation)" and "pre-cut task lists" are the same rejection from the same sentence (0005, lines 19-21) split into two entries. Likewise "Fine-grain task lists" (0012 considered-options) and "splitting into 'a pre-cut task list' (sub-session grain)" (0012 body-prose) are one rejection counted twice.

## Count

148 entries across the three clusters. Stated independently they run to
about 34,200 characters, against 26,077 characters of source records.

