# `human-review`를 은퇴시킨다

관련 자료:

- [skill-design](../../decisions/skill-design.md): 이번 shaping에서 `human-review` 설계 규칙을 지우고, 은퇴 이유를 기각 대안에 남겼다.
- [pr-descriptions](../../decisions/pr-descriptions.md): `human-review`가 하던 변경 전후·이유·증거 설명을 이제 PR 본문이 맡는다. 이번 작업으로 바뀌지 않는다.

## 문제

`human-review`는 사람이 AI가 한 작업을 이해하고 검토하도록 돕는 스킬이다. 그런데 그 일은 이미 다른 곳에서 다 하고 있다.

- 변경 전후, 이유, 증거는 PR 본문이 보여 준다. 관찰한 것, 소스에서 추론한 것, 확인하지 못한 것도 거기서 나눠 적는다.
- 이해가 안 되는 부분은 `explain-visually`가 설명한다.
- 미결정 제품 동작은 원래 `shape-idea`와 `babysit-specs`가 다룬다.

이 스킬에만 있던 것은 세션을 넘나들며 리뷰를 이어 가는 기능뿐이다. 세션 기록상 `human-review`를 쓴 세션은 10개였고, 같은 기간 `implement`는 290개였다. 다른 스킬이 부르지도 않는다. implement가 권하던 문장은 `required-skills` 작업에서 이미 지웠다.

## 사용자에게 보이는 결과

- `human-review`가 플러그인과 skills.sh 양쪽에서 사라진다. `update-project-skills`로 갱신한 프로젝트에서도 지워진다.
- 작업을 이해하고 싶을 때는 PR 본문을 보거나 `explain-visually`를 부른다. 세션을 넘는 리뷰 이어 하기는 대신하는 기능 없이 없어진다.

## 승인된 범위

- `human-review` 스킬 폴더(본문, 템플릿 asset, evals, UI 메타데이터)와 배포 경로를 모두 없앤다.
- 플러그인 버전을 올린다.

## 수용 기준

1. `skills/workflow/human-review/`, `plugin.json`의 해당 항목, `.agents/skills/`와 `.claude/skills/`의 심볼릭 링크, `skills.sh.json` 그룹 항목, README의 링크가 모두 없다. `claude plugin validate . --strict`가 통과한다.
2. 스킬 본문, README, 플러그인 manifest 어디에도 `human-review`가 나오지 않는다. 남는 곳은 결정 문서의 기각 대안 한 줄과, 다른 spec 폴더의 과거 기록뿐이다.
3. `.claude-plugin/plugin.json`의 `version`이 올라가 있다.

## 확정된 제약과 이유

- **새 자리를 만들지 않는다.** 사용자가 "기존에 이미 다 커버하고 있다"고 보고, 세션을 넘는 리뷰 이어 하기도 대신할 곳 없이 버리기로 했다.

## 가정 (수정 가능)

- `skills.sh.json`의 "Review and explanation" 그룹은 `explain-visually` 하나만 남는다. 그룹 제목은 "Explanation"으로 바꾼다.

## 범위 밖

- 다른 spec 폴더의 기록: `docs/specs/required-skills/spec.md`에는 "`human-review` 스킬 자체는 남는다"는 문장이 있고, `docs/specs/review-sessions/`의 조사 문서와 프로토타입에도 이름이 나온다. 각 폴더의 개정이나 은퇴는 `babysit-specs`와 `maintain-project-context`가 맡는다.
- `split-into-tasks` 은퇴: 서로 관련 없는 변경이라 [retire-split-into-tasks](../retire-split-into-tasks/)에 따로 둔다.
- 결정 문서(`skill-design`, `skill-naming`, `pipeline`): 이번 shaping에서 이미 고쳤다.

## 보류한 점

없음.

## 남은 위험

- 세션을 넘는 리뷰 이어 하기가 다시 필요해지면 대신할 기능이 없다. 그때는 결정 문서의 기각 대안을 다시 연다.

## Setup before implementation

None.
