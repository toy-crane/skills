# define-product's interview fails four of its own evals on Sonnet

**Symptom**: Run on Sonnet, `define-product` fails `skill-evals/define-product/evals.json`
cases 2, 5, 6, and 8 on nearly every repetition, both before and after the
first-work-unit change. Case 2 gives a complete direction plus an explicit request to
write, yet Sonnet asks more scene questions and writes no `PRODUCT.md`. Case 5 asks
about current alternatives instead of writing, so it never separates capabilities from
feature requirements. Cases 6 and 8 ask two or three numbered questions where the
expectation is one precise question.

**Observed evidence**: On 2026-11-10, while implementing
`docs/specs/define-product-first-work-unit/`, `node skill-evals/define-product/run.mjs
--suite evals` (then at `skill-evals/define-product/first-work-unit/run.mjs --set
regression`) ran all 11 cases at 2 reps with agent `claude-sonnet-5-5` and an Opus 5.5
rubric judge over the API. Baseline skill text `f8d2ef2`: 12/22 rows; cases 2, 5, 6, 8
failed both reps, 7 and 9 one rep. Changed text `f1282e1`: 14/22 rows; 5, 6, 8 failed
both reps, 2 one rep. The judge's quoted evidence, for example case 2: "PRODUCT.md는
아직 만들지 않았습니다. 지금 말씀해 주신 내용만으로는 핵심 의미 일부를 추측해서 써야
하기 때문입니다."

**Suspected cause**: Suspected: Sonnet weighs the skill's "Ask one to three closely
related questions in a round" and "begin with one concrete use scene" over "A detailed
initial request may count as that confirmation", so it keeps interviewing and bundles
questions. These cases were written and read against larger models and never scored on
Sonnet before.

**What was tried**: Nothing. The spec puts `define-product`'s interview and
confirmation procedure off limits, so the first-work-unit change left it alone. Every
case the baseline passed on both reps (1, 3, 4, 10, 11) still passes on both reps after
the change.

**Proposed next step**: Shape a work unit for `define-product`'s interview on Sonnet,
then climb it with `llm-evals` using `--suite evals` cases 2, 5, 6, 8 as the failing
set and the graduated `define-product-first-work-unit` suite as the regression guard.
Start by tightening when a complete written request skips further questions and by
asking a single question per round when one answer determines the next.
