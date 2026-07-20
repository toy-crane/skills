---
name: discover-opportunity
description: Discover a concrete opportunity worth shaping when the user does not yet know what to build. Use for blank-page requests where the user wants a project, product, feature, or improvement but cannot yet name a concrete problem, desired change, or direction. Explore lived context, evidence, and constraints; compare opportunities and select one. If the user already knows the problem or intended change and has a broad direction, use shape-idea instead.
---

# Discover Opportunity

Help the user decide what is worth shaping before deciding how it should
work. This stage begins without a chosen problem or product direction and
ends with one opportunity the user wants to pursue. When the request already
names a concrete problem or intended change and a plausible direction, stop
discovery and invoke `shape-idea`; its job is to resolve behavior and scope.

Start from evidence in the user's life and reach, not a feature brainstorm.
Inspect the codebase, project documents, prior research, or supplied material
when they exist. Ask about realities the user can observe directly: people
and workflows they know, recurring friction and workarounds, outcomes people
already seek, unusual access or capability, and the time, money, or risk the
user is willing to spend. Research external claims only after the search has
narrowed enough to know what evidence would change the choice.

Interview one decision at a time. Ask exactly one question per turn,
requesting one fact, example, or choice with one question mark, then wait.
Never return the blank page by asking what they want to build. Offer a
concrete interpretation or two for them to correct whenever their answer is
vague, because recognition is easier than invention. Do not force a fixed
questionnaire; each answer should determine the cheapest next uncertainty to
remove.

Once there is enough context to diverge usefully, put forward three
opportunity drafts that are genuinely different at the audience, problem, or
desired-outcome level. Do not disguise three feature variants as three
opportunities. Each draft contains:

- the audience and situation;
- the recurring problem, unmet need, or costly workaround;
- the desired change in that audience's life or work;
- the evidence already available and what remains inference;
- why the user has credible access or an advantage in learning about it;
- the assumption that would kill the opportunity if false; and
- the cheapest reversible way to learn whether that assumption holds.

Compare the drafts on problem intensity, frequency, access to affected
people, evidence quality, and cost of learning. Recommend one and say plainly
when none is strong enough. The recommendation is a draft under the user's
veto: their reaction may revise the framing, combine insights, or return the
search to an earlier branch.

Keep the boundary with `shape-idea` hard. This skill may select a broad
direction, but it does not define an MVP, screens, features, detailed flows,
data models, policies, or implementation. Those decisions prematurely turn
an opportunity into a product. A cheap evidence test may be proposed or run;
production implementation may not begin.

Stop when one opportunity has all of the following, or when the user decides
there is no worthwhile opportunity yet:

- a named audience in a concrete situation;
- an important desired change grounded in a problem, need, or workaround;
- evidence separated from assumptions;
- a broad direction worth shaping;
- one riskiest assumption and a cheap next test; and
- explicit nearby opportunities not being pursued.

When the user chooses to continue with an opportunity, summarize it and
materialize the same content at `docs/opportunities/<slug>.md` using a
kebab-case slug. Use the headings Opportunity, Audience and Situation,
Evidence and Workarounds, Desired Change, Chosen Direction, Alternatives Not
Chosen, Assumptions and Cheapest Tests, and Not Pursuing. End by stating that
`shape-idea` can now turn this opportunity into observable behavior and a
spec. If no opportunity survives, write no handoff file; an honest empty
result is better than manufacturing work.
