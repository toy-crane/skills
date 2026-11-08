# `split-into-tasks`를 은퇴시키고, 여러 성과는 spec 폴더로 나눈다

관련 자료:

- [pipeline](../../decisions/pipeline.md): spec 폴더 분할 기준, implement 한 번에 한 폴더, 폴더 경계마다 따로 받는 최종 리뷰를 정한다. 분할 기준의 문장은 그 결정에 있고, 여기에는 옮겨 적지 않는다.
- [document-lifecycles](../../decisions/document-lifecycles.md): spec 폴더에 무엇이 들어가는지 정한다.
- [GLOSSARY](../../../GLOSSARY.md): `Spec folder` 정의. `Task` 용어는 이번 shaping에서 지웠다.

## 문제

`split-into-tasks`는 spec 하나를 폴더 안의 task 파일 여러 개로 나눈다. 그런데 같은 일을 spec 폴더 여러 개와 `Blocked by:` 줄이 이미 더 잘한다. 따로 배포하고, 의존 순서를 지키고, 트래커 이슈 하나씩을 갖는 일이다.

사용자 프로젝트들의 git 이력을 보면, 지금까지 만든 spec 약 450개 가운데 task로 나뉜 것은 27개였다. 비율은 2026년 8월 12%에서 10월 1%로 떨어졌고 11월에는 0이다. 같은 기간에 폴더 사이의 `Blocked by:` 줄은 0개에서 한 달 20개로 늘었다. 가장 최근 분할인 dearly `japan-launch`도 task마다 Linear 이슈를 따로 달아 task를 사실상 spec 폴더처럼 썼다.

그런데도 task 파일 때문에 `implement`는 상태, `superseded`, frontier, 중간 리뷰 체크포인트 규칙을 계속 들고 다닌다. 모델이 한 번에 더 긴 일을 해낼수록 모델 한계 때문에 나눌 이유는 사라진다. 남는 것은 전달과 조율 때문에 나누는 경우이고, 그건 spec 폴더가 그대로 담는다.

## 사용자에게 보이는 결과

- `shape-idea`로 여러 성과에 걸친 변경을 정리하면, 마지막에 폴더 분할안 전체를 한 번에 보여 준다. 승인하면 성과마다 spec 폴더를 쓰고, 기다려야 하는 폴더에는 `Blocked by: docs/specs/<other>/` 줄을 단다.
- 한 흐름 안의 일은 지금처럼 spec 하나로 남는다. 저장소 밖에서만 하는 일은 폴더가 되지 않는다.
- `split-into-tasks`는 플러그인과 skills.sh 양쪽에서 사라진다. `update-project-skills`로 갱신한 프로젝트에서도 지워진다.
- `implement`는 폴더 하나의 `spec.md`만 구현한다. 폴더에 `tasks/`가 남아 있어도 읽지 않는다.
- 폴더 A를 기다리는 폴더 B는 A의 implement 실행이 리뷰까지 마친 뒤에 시작한다. 예전 중간 리뷰 체크포인트는 이 경계가 대신한다.
- 다음에 어느 폴더를 실행할지는 사람, 트래커, 러너가 고른다. implement는 여러 폴더를 한 번에 받지 않는다.

## 승인된 범위

- `split-into-tasks` 스킬과 그 배포 경로를 모두 없앤다.
- `shape-idea`가 pipeline 결정의 분할 기준에 따라 spec 폴더를 하나 또는 여러 개 쓴다.
- `implement`에서 task 파일과 중간 리뷰 체크포인트에 관한 규칙을 모두 뺀다.
- `babysit-specs`에서 task 파일을 다루는 규칙을 빼고, 개정 결과 분할 기준에 맞지 않게 된 폴더는 `shape-idea`에 다시 나누도록 넘긴다.
- 플러그인 버전을 올린다.

## 수용 기준

1. `skills/workflow/split-into-tasks/`, `plugin.json`의 해당 항목, `.agents/skills/`와 `.claude/skills/`의 심볼릭 링크, `skills.sh.json` 그룹 항목, README의 링크·다이어그램·폴더 설명이 모두 없다. `claude plugin validate . --strict`가 통과한다.
2. `implement` 본문과 evals 어디에도 task 파일, `superseded`, frontier, task 상태, 선언된 중간 리뷰 체크포인트가 나오지 않는다. 입력은 spec 폴더 하나다.
3. `shape-idea` 본문은 pipeline 결정의 분할 기준을 따르게 하고, 그 기준을 스킬 안에 직접 적는다. 스킬은 다른 문서를 읽었다고 가정하지 않기 때문이다. 분할안은 승인을 받은 뒤에만 쓰고, 의존 폴더에는 `Blocked by:` 줄을 단다.
4. `babysit-specs` 본문과 evals에 task 파일을 고치거나 이름을 대는 규칙이 없다. 개정한 성과가 분할 기준에 맞지 않게 되면 그 폴더를 `shape-idea`에 다시 나누라고 보고한다.
5. **`shape-idea`의 분할 판단 eval.** 지표는 사례마다 성과를 폴더에 배정한 결과와 `Blocked by:` 간선이 기대와 정확히 일치하는지다. 목표는 held-out 사례 10개 중 9개 이상 일치, 그리고 한 흐름 안의 일을 나눈 과분할 0건이다. 사례 출처는 다음과 같다.
   - 실제 분할 3건: dearly `japan-launch`(폴더 6개, 02←01, 06←02·05), dearly `login-flyn-structure`(폴더 1개), robo `channel-and-thread-conversations`(새 Robo가 옛 Robo를 바로 대체한다는 전제에서 폴더 1개).
   - `split-into-tasks` evals의 분할 판단 사례 6건(2, 3, 7, 8, 9, 12번)을 `shape-idea` 입력으로 바꾼 것.
   - 저장소 밖 준비와 출시 뒤 조작만 성과 사이에 끼어 있는 사례 1건.
6. 기존 `shape-idea` eval 가운데 spec을 하나만 쓰던 사례는 여전히 하나만 쓴다.
7. 이 저장소의 `docs/decisions/`, GLOSSARY, 스킬 본문이 서로 어긋나지 않는다. task를 언급하는 곳은 결정 문서의 근거와 증거 기록, 그리고 은퇴를 설명하는 기각 대안뿐이다.
8. `.claude-plugin/plugin.json`의 `version`이 올라가 있다.

## 확정된 제약과 이유

- **분할 기준은 pipeline 결정을 따른다.** 사용자가 기존 사례 세 건에 기준을 적용한 결과(task 13개 → 폴더 8개)를 보고 확정했다. 폴더 하나를 나눌 때마다 실행, 리뷰, PR이 하나씩 더 생기므로 예전 task 기준보다 문턱이 높다.
- **implement는 한 번에 한 폴더만 받는다.** 여러 폴더를 `Blocked by:` 순서로 돌리는 안을 사용자가 기각했다. implement를 단순하게 두고, 순서는 실행을 시작하는 쪽이 고른다.
- **기존 `tasks/` 폴더는 지원하지 않는다.** 멈추고 안내하는 동작도 두지 않는다. 사용자가 legacy 지원은 필요 없다고 정했다.
- **중간 리뷰 체크포인트를 적는 칸을 따로 두지 않는다.** 폴더마다 implement가 따로 돌고 끝에서 리뷰를 하므로, 뒤 폴더가 시작되기 전에 앞 폴더의 리뷰가 항상 끝난다.

## 가정 (수정 가능)

- 같은 shaping에서 나온 폴더는 slug 앞부분을 같게 붙인다(예: `japan-launch-legal-docs`). 폴더 목록에서 한 묶음으로 보이게 하려는 것이다.
- 여러 폴더에 걸치는 공통 제약은 폴더마다 다시 적는다. implement가 다른 spec 폴더를 읽지 않기 때문이다. 다른 작업에서도 다시 쓸 만한 제약만 decision contract로 올린다.
- `skills.sh.json`에서 `split-into-tasks`만 빼고 그룹 구성은 그대로 둔다.
- eval 목표인 "10개 중 9개, 과분할 0건"은 이번 shaping에서 제가 정한 값이다.

## 범위 밖

- 사용자의 다른 저장소에 남아 있는 `tasks/` 폴더를 spec 폴더로 바꾸는 일: dearly `japan-launch`, dearly `login-flyn-structure`, robo `channel-and-thread-conversations`. 이 저장소 밖의 일이다.
- implement가 여러 폴더를 한 번에 실행하는 기능: 기각됐다.
- `human-review` 은퇴: 서로 관련 없는 변경이라 [retire-human-review](../retire-human-review/)에 따로 둔다.
- 결정 문서와 GLOSSARY: 이번 shaping에서 이미 고쳤다.

## 보류한 점

없음.

## 남은 위험

- `tasks/`가 남은 폴더에 implement를 돌리면, task 경계를 모른 채 `spec.md` 전체를 한 번에 구현한다. 위 세 폴더는 implement를 돌리기 전에 바꿔야 한다. 이 스킬을 쓰는 다른 사용자의 저장소에서도 같은 일이 생길 수 있다.
- 폴더가 늘어나면 실행, 리뷰, PR 횟수도 늘어난다. 이 비용이 커지면 pipeline 결정의 재검토 조건에 걸린다.
- 폴더마다 다시 적은 공통 제약은 개정할 때 서로 어긋날 수 있다. `babysit-specs`가 폴더를 하나씩 개정할 때 잡아야 한다.

## Setup before implementation

None.
