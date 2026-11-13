# implement 회귀 스위트

- 결정: [testing](../../decisions/testing.md). 회귀 스위트는 capability eval을 졸업시켜 만든다는 규칙, 졸업은 최종 변형의 기존 결과에서 케이스를 고른다는 규칙, 셀 기록과 두 tier 규칙, 답하지 못한 시행은 결과가 아니라는 규칙을 정한다.
- 결정: [pipeline](../../decisions/pipeline.md). `implement`가 리뷰 지적을 고치는 방식과, 회귀 스위트가 지키는 동작을 바꾸는 변경에서 그 스위트를 돌린다는 규칙이다.
- 용어: [GLOSSARY](../../../GLOSSARY.md). Capability eval, 회귀 스위트, 졸업, 셀, 셀 기록의 정의다.

## 문제

`implement`는 spec 폴더에서 PR까지 이어지는 흐름의 중심이다. [toy-crane/skills#149](https://github.com/toy-crane/skills/pull/149)는 리뷰 지적을 재현된 범위만큼만 고치도록 본문을 바꾸고, `skill-evals/implement/pr-flow-review-fixes/`의 capability eval로 증명했다(Sonnet 5.5, 반복 2회, held-out 3/8 → 7/8). 그런데 졸업 규칙이 생기기 전이라 회귀 스위트로 옮기지 않았다. 그 climb의 결과 행은 커밋되지 않아 지금은 남아 있지 않다. 그래서 이 동작은 열린 capability eval로만 남아 있고, 다시 깨져도 알아챌 방법이 없다.

## 사용자에게 보이는 결과

- `skill-evals/implement/regression/pr-flow-review-fixes/` 아래에 회귀 스위트가 생긴다. 다른 스킬과 같은 방식으로 한 줄 명령으로 다시 돌릴 수 있다.
- `skill-evals/implement/pr-flow-review-fixes/`의 열린 capability eval은 사라진다.
- `regression/log.md`에 졸업 기록 한 줄이 남고, `cell-history.json`에 셀마다 시행 기록과 기준선 결과가 남는다.

## 승인된 범위

- 기존 `pr-flow-review-fixes` 케이스 10개와 grader, 기존 `run.mjs`로 기준선과 현재 본문을 다시 돌린다.
- 그린을 확인한 뒤 회귀 스위트로 졸업시킨다.
- `implement`의 `SKILL.md`는 바꾸지 않는다.

## 인수 기준

1. **지켜야 할 동작.** 현재 `implement` 본문을 따른 에이전트가 리뷰 지적을 다룰 때 다음을 지킨다.
   - 새 helper를 더하기보다 코드를 지우거나 조건을 좁혀서 고친다.
   - 재현된 경우만 고치고, 재현되지 않은 확장은 고치지 않은 채 기록한다.
   - 틀린 지적은 file:line, 테스트, 출력 같은 증거로 반박한다.
   - 고친 뒤 전체 diff를 spec 의도에 비춰 다시 읽고, 아무것도 요구하지 않는 코드를 걷어 낸다.
   - 정말로 새 상태가 필요한 수정은 그대로 한다.
   - 지표: held-out 케이스의 (케이스 × 반복 × 검사 항목) 행 통과율. 기존 grader로 채점한다.
   - 목표: #149가 닿은 수준인 held-out 7/8(약 88%) 이상, 반복 2회. 기준선보다 노이즈 범위 밖으로 높다.
   - 케이스 출처: 기존 `pr-flow-review-fixes/cases.jsonl`의 10개 케이스와 그 train/held-out 구분을 그대로 쓴다.
2. **졸업.** 모든 반복에서 통과한 케이스만 `regression/pr-flow-review-fixes/`로 옮긴다. grader와 그것이 읽는 픽스처를 함께 옮기고, 원래 capability eval 폴더는 지운다. 기준선에서도 통과한 셀은 케이스에 `guards`가 적혀 있을 때만 상위 tier로 간다.
3. **러너.** 모델 진입점이 오류로 끝났다고 보고한 시행은 채점하지 않는다. 이미 채점된 (변형, 케이스, 반복)은 다시 돌리지 않는다.
4. `implement`의 `SKILL.md`가 이 작업 전과 같다.

## 확정된 제약과 이유

- **기준선은 #149 직전 본문이다.** 이 eval은 그 본문을 기준선으로 실제 climb를 거쳐 그린에 닿았다. 동작이 바뀌지 않는 스킬에 쓰는 "스킬 없음" 기준선은 여기에는 맞지 않는다.
- **결과 행이 없으니 기준선과 현재 본문을 다시 돌린다.** 졸업은 원래 기존 결과에서 케이스를 고르지만, 남은 행이 없어서 셀 기록을 채울 근거가 없다.
- **목표는 원래 climb가 닿은 수준이다.** 이미 증명된 수준을 지키는 것이 목적이므로 새 목표를 정하지 않는다.
- **에이전트는 `claude-sonnet-5-5`로 돌린다.** 이 스킬은 Sonnet에서도 동작해야 하고, 원래 climb도 Sonnet으로 증명했다.
- **스킬 본문을 고치지 않는다.** 현재 본문으로 통과하지 못하는 케이스는 졸업하지 않고 알려진 실패로 기록한다.
- **케이스와 grader를 약하게 만들어 그린에 닿지 않는다.**

## 가정

- 판정 모델은 `claude-opus-5-5`로 기존 스위트와 같게 둔다. 바꿀 수 있는 가정이다.
- #149 직전 본문은 `9f079fc^`의 `implement` `SKILL.md`로 본다.

## 범위 밖

- `implement` 본문 수정.
- `implement`의 다른 동작(검증, PR 넘기기 등)에 대한 새 eval.

## 미뤄 둔 것

- 다시 돌린 결과가 원래 수준에 못 미치는 경우의 수정. 다시 여는 조건: 현재 본문의 held-out이 7/8에 못 미치면, 그 증거로 `docs/follow-ups/`에 항목을 남기고 그 항목이 다시 연다.

## 남은 위험

- #149 이후 `implement` 본문이 바뀌었다면 현재 본문의 점수가 원래 v-최종과 다를 수 있다. 그 차이는 회귀로 보고하고, 케이스를 고쳐 맞추지 않는다.

## Setup before implementation

None.

## Post-release check

None.
