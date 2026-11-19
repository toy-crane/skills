# at-a-glance 한국어 응답을 자연스럽게 만들기

[explain-visually](../../decisions/explain-visually.md)는 이 작업의 기준이다.
at-a-glance가 한국어로 답할 때 natural-korean 문체 규칙을 복사해 담는다는
결정과 기각한 대안이 거기 있다.
[testing](../../decisions/testing.md)은 아래 LLM 품질 기준을 eval로 증명하는
방법(train과 held-out 분리, 졸업)을 정한다.
`output-styles/natural-korean.md`는 한국어 문체 규칙의 원본이다. 규칙 내용은
거기서 가져오고, 이 spec에 옮겨 적지 않는다.

## 문제

at-a-glance를 켜고 한국어로 대화하면 응답이 번역투로 읽힌다(사용자 보고,
2026-11-19). 스타일의 문체 지시가 "Reply in the user's language" 한 줄뿐이기
때문이다. 한국어 문체 규칙은 natural-korean에 있는데, Claude Code는 출력
스타일을 하나만 켤 수 있어서 at-a-glance를 고르면 그 규칙이 빠진다.

## 사용자에게 보이는 결과

- at-a-glance를 켜고 한국어로 답할 때, 응답 문체가 natural-korean을 켰을 때와
  같은 규칙을 따른다. 합쇼체, 완결된 문장, 한국어 어순, 말로 푸는 설명, emdash
  없는 표기가 여기에 든다.
- 내용 종류별 형태(사실은 글, 구조는 다이어그램, 과정은 스테퍼, 메커니즘은
  조작형)와 첫 줄 결론 규칙은 그대로다. 표나 위젯 안의 한국어 글에도 같은 문체
  규칙이 적용된다.
- 다른 언어로 답할 때는 지금과 달라지는 것이 없다.
- natural-korean은 지금처럼 따로 고를 수 있다.

## 범위

- `output-styles/at-a-glance.md`에 한국어로 답할 때만 적용되는 절을 더한다.
  내용은 natural-korean의 "독자와 목표", "문체 원칙", "기준점 예시", "표기
  규칙"이다.
- 설치한 플러그인 사용자가 업데이트를 받도록 플러그인 버전을 올린다.

## 수락 기준

LLM 출력에 대한 기준은 eval로 증명하며, 목표는 held-out 케이스로만 판정한다.
측정 모델은 Sonnet 5.5다.

1. **한국어 문체**: at-a-glance를 켜고 렌더러를 연결한 상태에서, 한국어로 쓴
   held-out 상황 10개를 2회씩 돌린다. 상황은 이 저장소의 실제 주제에서 새로
   만들고, 네 내용 종류와 결과 보고·원인 설명처럼 에이전트가 먼저 하는 설명이
   고르게 섞이게 한다. 응답 본문을 natural-korean의 기준점 예시와 표기 규칙을
   채점 기준으로 삼아 판정하고, 기준을 모두 지킨 시행이 20회 중 18회
   이상이어야 한다. 같은 케이스로 지금 스타일의 기준선을 먼저 기록한다.
2. **문체 기준 상한 확인**: 같은 케이스를 natural-korean만 켜고 돌린 점수와
   비교한다. 1번 점수가 이 점수보다 2회 넘게 낮으면 실패다.
3. **형태 규칙 유지**: `skill-evals/explain-visually/regression/`의
   at-a-glance 회귀 묶음(routing, brake-on, brake-off, stepper, predict)과
   `explain-visually-first-view`의 held-out 점수가 지금 기록보다 eval 노이즈
   범위를 넘어 떨어지지 않는다.

결정적으로 확인하는 기준:

4. at-a-glance의 한국어 절 본문이 natural-korean의 해당 네 절과 글자 단위로
   같다. 이 검사는 저장소에서 다시 돌릴 수 있는 형태로 남아, 한쪽만 고치면
   실패한다.
5. 한국어 절은 한국어로 답할 때만 적용된다고 본문이 밝힌다.
6. `claude plugin validate . --strict`가 통과하고, 플러그인 버전이 올라가 있다.

## 정해진 제약과 이유

- 문체 규칙은 natural-korean에서 복사해 담는다. 언어 중립 원칙만 두면 중복은
  없지만 합쇼체, 표기 규칙, 예시 같은 구체적인 기준점이 빠져 효과가 약하다.
  두 스타일을 합치면 문체만 원하는 사용자가 고를 스타일을 잃는다.
- natural-korean이 원본이다. 문체 규칙을 바꿀 때는 natural-korean을 고치고
  at-a-glance에 같은 내용을 반영한다. 기준 4가 어긋남을 잡는다.
- 한국어 절은 한국어 응답에만 적용한다. at-a-glance가 어느 언어로든 쓸 수
  있어야 한다는 기존 결정을 지키기 위해서다.

## 가정 (바꿀 수 있음)

- 한국어 절은 natural-korean 원문 그대로 한국어로 넣는다. 스타일의 나머지는
  영어로 둔다.
- 절의 위치는 "In the reply" 뒤로 둔다.
- natural-korean 원문 중 "코드, 코드 주석, 커밋 메시지는 프로젝트 관례를
  따른다"는 줄도 함께 옮긴다. 기준 4가 글자 단위 일치를 요구하므로 일부만
  고르지 않는다.

## 건드리지 않는 것

- natural-korean의 내용. 이번 작업은 복사만 한다.
- natural-korean의 `keep-coding-instructions` 누락. 
  `docs/follow-ups/natural-korean-drops-coding-instructions.md`에서 따로 다룬다.
- 다른 언어의 문체 규칙. 요청이 없었다.

## 미룬 결정

없음.

## 남은 위험

- 스타일 본문이 길어져 형태 라우팅 지시의 효과가 떨어질 수 있다. 기준 3이
  이를 잡는다.
- 한국어 절이 영어 본문 속에 있어 모델이 "한국어 응답에만"이라는 조건을 놓칠
  수 있다. 다른 언어 응답에 미치는 영향은 측정하지 않는다.
- 기준 1의 채점은 LLM 판정이라 natural-korean 기준점의 해석이 판정자마다 다를
  수 있다.

## Setup before implementation

None.

## Post-release check

None.
