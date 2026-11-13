# resolve-follow-ups 회귀 스위트

- 결정: [testing](../../decisions/testing.md). 회귀 스위트는 capability eval을 졸업시켜 만든다는 규칙, 동작이 바뀌지 않는 기존 스킬은 스킬 없음을 기준선으로 쓴다는 규칙, 셀 기록과 두 tier 규칙, 답하지 못한 시행은 결과가 아니라는 규칙을 정한다.
- 용어: [GLOSSARY](../../../GLOSSARY.md). Capability eval, 회귀 스위트, 졸업, 셀, 셀 기록의 정의다.

## 문제

`resolve-follow-ups`는 예약 작업으로 사람 없이 돌면서 follow-up마다 브랜치와 PR을 만든다. 잘못 동작하면 증거 없이 제품 코드를 고치거나 같은 시도로 PR을 또 열고, 실행 중에는 아무도 이를 보지 않는다. 지켜야 할 동작은 `skill-evals/resolve-follow-ups/evals.json`에 14개 케이스로 적혀 있지만, `test-resolve-follow-ups.sh`는 dispatcher의 결정적 동작만 검사하고 worker와 coordinator의 판단은 채점하지 않는다. 스킬 본문이나 모델이 바뀌어 이 동작이 깨져도 알아챌 방법이 없다.

## 사용자에게 보이는 결과

- `skill-evals/resolve-follow-ups/regression/` 아래에 회귀 스위트가 생긴다. 다른 스킬과 같은 방식으로 한 줄 명령으로 다시 돌릴 수 있다.
- 스위트의 각 셀은 스킬 없이 돌린 에이전트가 저지르는 실수 중 `resolve-follow-ups`가 실제로 막아 주는 것을 보여 준다.
- `regression/log.md`에 졸업 기록 한 줄이 남고, `cell-history.json`에 셀마다 시행 기록이 남는다.

## 승인된 범위

- `resolve-follow-ups`의 eval 루트(`skill-evals/resolve-follow-ups/`)에 러너, 케이스, grader를 만든다.
- 스킬 없음을 기준선으로 capability eval을 돌리고, 그린에 닿으면 회귀 스위트로 졸업시킨다.
- `resolve-follow-ups`의 `SKILL.md`는 바꾸지 않는다.

## 인수 기준

1. **지켜야 할 동작.** 현재 `resolve-follow-ups` 본문을 따른 에이전트가 다음을 지킨다.
   - 재현하지 못한 항목은 제품 코드를 고치지 않고 not-reproduced로 돌려주며 follow-up을 남긴다.
   - 정해지지 않은 제품 결정이 걸린 항목은 needs-shaping으로 돌려주고 정책을 고르지 않는다.
   - 같은 시도의 PR이 이미 열려 있으면 worker도 PR도 새로 만들지 않는다.
   - 고친 항목은 검증 뒤 그 follow-up만 지우고, 준비된 PR 하나를 열며 머지하지 않는다.
   - 기준 SHA를 확인하지 못한 체크아웃에서는 고치지 않고 blocked로 돌려준다.
   - 작업 중 발견한 새 결함은 일회용 체크아웃에만 남기지 않고 coordinator에 넘긴다.
   - 지표: held-out 케이스의 (케이스 × 반복 × 검사 항목) 행 통과율. 끝 상태(follow-up 파일, 브랜치, 대역 GitHub에 남은 PR) 검사와 루브릭 판정으로 채점한다.
   - 목표: held-out 90% 이상, 반복 2회. 스킬 없이 돌린 기준선보다 노이즈 범위 밖으로 높다.
   - 케이스 출처: `skill-evals/resolve-follow-ups/evals.json`의 14개 케이스에서 시작하고, 실제 세션 기록에서 같은 상황의 변형을 더해 노이즈 범위를 줄인다. train과 held-out으로 나눈다.
2. **졸업.** 모든 반복에서 통과한 케이스만 `regression/`으로 옮긴다. grader와 그것이 읽는 픽스처를 함께 옮기고, climb의 변형과 결과 폴더는 지운다. 스킬 없이도 통과한 셀은 케이스에 `guards`가 적혀 있을 때만 상위 tier로 간다.
3. **러너.** 모델 진입점이 오류로 끝났다고 보고한 시행은 채점하지 않는다. 이미 채점된 (변형, 케이스, 반복)은 다시 돌리지 않는다.
4. `resolve-follow-ups`의 `SKILL.md`가 이 작업 전과 같다.

## 확정된 제약과 이유

- **기준선은 스킬 없음이다.** 본문이 바뀌지 않으니 "바꾸기 전 본문"은 최종 변형과 같아서 오를 언덕이 없다. 근거는 [testing](../../decisions/testing.md)에 있다.
- **목표는 90%다.** 막는 실수가 되돌릴 수 없는 종류라 높게 잡고, 판정 모델이 한 번 흔들려도 그린에 닿을 여유를 둔다.
- **스킬 본문을 고치지 않는다.** 이 작업은 지금 동작을 지키는 것이다. 현재 본문으로 통과하지 못하는 케이스는 졸업하지 않고 알려진 실패로 기록한다.
- **에이전트는 `claude-sonnet-5-5`로 돌린다.** 이 스킬은 Sonnet에서도 동작해야 하므로, 스위트는 그 하한에서 지킨다는 것을 보여야 한다. 더 강한 모델에서만 통과하는 셀은 Sonnet 사용자의 실패를 숨긴다.
- **케이스와 grader를 약하게 만들어 그린에 닿지 않는다.** 승인 뒤에 바꾸려면 다시 승인을 받는다.

## 가정

- 판정 모델은 `claude-opus-5-5`로 기존 스위트와 같게 둔다. 바꿀 수 있는 가정이다.
- GitHub는 임시 bare 저장소와 대역 `gh` CLI로 대신한다. Codex Scheduled task와 Claude Routine 경로는 케이스가 요구하는 진입점 차이만 흉내 낸다.
- 반복 2회, 동시 실행 4개로 둔다.

## 범위 밖

- `resolve-follow-ups` 본문 수정. 실패가 드러나면 별도 작업이다.
- 모든 스킬의 `evals.json`을 채점하는 공용 러너. [no-runner-for-behavior-eval-cases](../../follow-ups/no-runner-for-behavior-eval-cases.md)가 다룬다.

## 미뤄 둔 것

- 현재 본문이 지켜야 할 동작을 반복해서 놓치는 경우의 수정. 다시 여는 조건: 이 climb에서 알려진 실패로 기록된 케이스가 생기면, 그 증거로 `docs/follow-ups/`에 항목을 남기고 그 항목이 다시 연다.

## 남은 위험

- coordinator와 worker가 나뉜 실행을 한 번의 에이전트 실행으로 흉내 내면, 실제 예약 실행에서만 생기는 실수를 놓칠 수 있다. 구현할 때 어느 케이스가 한 번의 실행으로 충분한지 먼저 가른다.
- 케이스마다 꾸며야 할 환경이 커서 한 번 실행의 비용이 크다. 승인할 때 실행 규모와 비용을 함께 보여 준다.

## Setup before implementation

None.

## Post-release check

None.
