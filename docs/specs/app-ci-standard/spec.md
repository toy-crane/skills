# 앱 CI 표준: 큐로 머지하고, 비싼 검사는 큐에서 한 번

> **상태 (2026-11-16): 구현 중단, 결정 하나 재검토 필요.** 첫 구현 시도에서 "큐 통과 표시" 방식이 Mergify와 맞지 않는 것이 드러났다(아래 "미룬 결정"). 이 결정을 다시 정하기 전에는 수용 기준 1, 7과 스킬의 GitHub 설정 순서를 구현하지 않는다. 중단 시점의 구현(`setup-ci` 스킬 초안, `merge` 큐 경로 초안, eval 환경 `skill-evals/setup-ci/`)은 로컬 브랜치 `claude/app-ci-standard-wip`에 남아 있다.

## 문제

dearly와 flyn은 같은 스택(bun, turborepo, Expo, Supabase)이고, PR 검사와 머지 규칙의 뼈대도 같다. 하지만 같은 개념을 저장소마다 따로 옮겨 적어서, 의도하지 않은 차이가 생겼다. 그리고 두 앱 모두 GitHub의 "main이 최신이어야 머지 가능(`strict`)" 규칙을 쓴다. 그래서 PR 하나가 머지될 때마다 나머지 PR이 rebase하고 전체 CI를 다시 돌린다. flyn은 하루 22개, dearly는 하루 12개까지 머지가 몰린 날이 있었다.

목표는 두 가지다. 에이전트의 반복 rebase를 없애고, 비싼 전체 CI 횟수를 줄인다. 그 방식을 하나의 표준으로 만들어, 지금 두 앱과 앞으로 만들 앱이 같은 방식을 쓰게 한다.

## 연결 자료

- [skill-layout](../../decisions/skill-layout.md): 새 스킬의 그룹과 배포 경로를 정한다.
- [skill-naming](../../decisions/skill-naming.md): 새 스킬의 이름 규칙을 정한다.
- [skill-design](../../decisions/skill-design.md): 스킬이 다른 스킬을 부를 때의 요구 조건과, Git 전달 스킬이 보고하는 원격 완료 증거를 정한다.
- [testing](../../decisions/testing.md): 스킬 동작의 수용 기준을 eval로 증명하는 방법과, eval을 두는 위치를 정한다.
- dearly의 `docs/decisions/continuous-delivery.md`: 2026-10-18 병합 순서 조율 장치 검토와 그 다시 볼 조건. 이 spec은 목표에 "비싼 CI 줄이기"가 더해진 것을 이유로, 그 문서의 "제자리 직렬부터 실험한다"를 큐 브랜치 방식으로 바꾼다. dearly 문서 자체는 이 스킬을 dearly에 적용할 때 고친다.

## 사용자에게 보이는 결과

- 사용자가 앱 저장소에서 새 스킬을 실행하면, 스킬이 현재 CI와 GitHub 설정을 읽고 표준과 다른 곳을 목록으로 보여 준다.
- 사용자가 승인하면 스킬이 저장소를 표준에 맞춘다. 저장소 파일은 PR로 바꾸고, GitHub 설정은 하나씩 승인을 받아 바꾼다.
- 표준을 따르는 저장소에서는 PR을 큐에 넣으면 끝이다. 에이전트가 rebase하거나 CI를 다시 기다릴 일이 없고, 실제 충돌이 나서 큐에서 빠진 PR만 직접 풀면 된다.
- 전체 CI는 Mergify가 만든 큐 후보에서만 돌고, 여러 PR을 묶어 한 번에 검사한다.
- 큐를 거치지 않고 GitHub 화면에서 바로 머지하려 하면 GitHub이 막는다.
- 같은 스킬을 다시 실행하면 표준에서 어긋난 곳만 보고한다.
- 표준을 적용한 앱 저장소에는 Mergify의 에이전트 스킬과 CLI 안내가 남는다. 나중에 에이전트가 "왜 머지가 안 되지?"에 막히면, 큐에서 빠진 이유와 Mergify가 한 일을 직접 조회해 원인을 찾는다.
- `merge` 스킬은 표준을 따르는 저장소에서 PR을 큐에 넣고, GitHub이 `MERGED`를 보고할 때까지 기다린다.

## 승인된 범위

### 표준의 내용

표준은 PR에 push한 순간부터 main에 머지되는 순간까지만 다룬다.

1. **병합 전략**: Mergify 큐 브랜치 방식이 기본이다. Mergify가 최신 main 위에 큐의 PR들을 얹은 임시 브랜치(`mergify/merge-queue/…`)와 임시 PR을 만들고, 거기서 전체 CI를 돌린다. 통과하면 원래 PR들을 머지하고, 실패하면 원인 PR만 큐에서 뺀다.
2. **두 단계 CI**:
   - 가벼운 검사는 PR에 push할 때마다 돈다. 바뀐 패키지만 lint, 타입 검사, 단위 테스트로 확인하고, 범위는 그 저장소의 pre-push와 같다.
   - 전체 검사는 큐 후보에서만 돈다. CI는 브랜치 이름이 `mergify/merge-queue/`로 시작하는지로 큐 후보를 알아본다.
3. **큐 입장 조건**: 가벼운 검사와 삭제 migration 승인 검사가 통과해야 큐에 들어간다.
4. **묶음 검사**: 여러 PR을 묶어 전체 CI를 한 번 돌린다. 묶음이 실패하면 Mergify가 반씩 나눠 원인 PR을 찾는다.
5. **pre-push**: 가벼운 검사와 같은 범위를 로컬에서 먼저 돌린다.
6. **삭제 migration 검사**: 지금 두 앱의 규칙을 그대로 옮기되, 가벼운 검사 단계에서 돌린다. 몇 초짜리 일 때문에 job을 따로 띄우지 않는다. 저장소에 Supabase migration이 없으면 이 검사는 빠진다.
7. **GitHub 규칙**:
   - Mergify를 main ruleset의 예외(`exempt`)로 둔다.
   - `strict`를 끈다.
   - 필수 검사에는 가벼운 검사와 삭제 migration 승인 검사, 그리고 "큐 통과 표시"를 둔다.
   - "큐 통과 표시"는 원래 PR에 아무도 보고하지 않는 필수 검사다. 그래서 사람과 에이전트는 바로 머지할 수 없고, 예외인 Mergify만 머지할 수 있다.
   - 전체 검사 통과는 Mergify 설정의 머지 조건이 지킨다.

### 새 스킬이 하는 일

1. 저장소의 workflow, Mergify 설정, pre-push 설정, main의 ruleset이나 브랜치 보호를 읽고, 표준과 다른 곳을 목록으로 보여 준다.
2. 승인을 받으면 저장소 파일(workflow, `.mergify.yml`, pre-push 설정)을 표준에 맞게 바꿔 PR로 낸다.
3. Mergify 앱이 설치돼 있지 않으면 설치를 사용자에게 맡기고, 설치 뒤 Mergify가 저장소를 인식했는지 확인한다.
4. GitHub 설정은 바꿀 내용을 하나씩 보여 주고, 승인을 받은 뒤 적용한다. 순서는 Mergify 인식 확인, 예외 등록, `strict` 끄기, "큐 통과 표시" 켜기다. 적용한 뒤 실제 설정을 다시 읽어 확인한다.
5. 시험 PR 하나를 큐에 넣어, 큐 후보에서 전체 검사가 돌고 머지되는지 확인한다.
6. 앱마다 고른 선택지(삭제 migration 검사 유무 등)를 그 앱의 결정 문서에 기록한다. dearly와 flyn에서는 `docs/decisions/continuous-delivery.md`다.
6-1. 저장소에 Mergify를 들여올 때, `add-stack-context`에 Mergify 하나와 그것을 고른 결정(이 표준), 근거를 넘긴다. `add-stack-context`가 Mergify의 에이전트 스킬과 CLI 사용 안내를 앱 저장소의 에이전트 맥락에 남기고, 설치한 스킬 경로와 바꾼 지침 줄을 돌려준다. 그래서 `setup-ci`는 `add-stack-context`를 필수로 요구한다.
7. 이미 표준을 따르는 저장소에서 다시 실행하면, 어긋난 곳만 보고하고 승인 없이는 아무것도 바꾸지 않는다.

### `merge` 스킬의 변화

표준을 따르는 저장소, 즉 Mergify 큐가 켜져 있는 저장소에서 `merge`는 rebase하거나 직접 머지하지 않는다. PR을 큐에 넣고, 큐에서 빠지면 그 이유를 보고하며(`mergify` CLI가 설치돼 있고 로그인돼 있으면 `mergify queue show`로 이유를 읽고, 없으면 Mergify의 체크와 댓글에서 읽는다), GitHub이 `MERGED`를 보고한 뒤에만 정리를 진행한다. 큐가 없는 저장소에서는 지금 동작을 그대로 유지한다. 이 변화가 없으면 표준을 적용한 저장소에서 `merge`가 막힌 머지 버튼 앞에 멈추므로, 새 스킬과 함께 나간다.

## 수용 기준

스킬의 동작은 실행마다 달라질 수 있으므로, 아래 기준은 `llm-evals`의 eval로 증명한다. 사례는 dearly와 flyn의 현재 CI와 GitHub 설정을 본뜬 저장소 상태, 그리고 거기에 일부러 차이를 심은 변형에서 만든다. 학습용과 held-out으로 나누고, held-out 점수로 판정한다. 각 사례는 3번 이상 반복한다.

1. **안전한 순서**: GitHub 설정을 바꾸는 held-out 실행의 100%에서, "큐 통과 표시" 필수 검사는 Mergify의 저장소 인식과 예외 등록이 확인된 뒤에만 켜진다.
2. **승인 없는 변경 없음**: held-out 실행의 100%에서, 스킬은 사용자의 승인 없이 저장소 파일이나 GitHub 설정을 바꾸지 않는다.
3. **차이 찾기**: held-out 사례에 심은 차이의 90% 이상을 찾아내고, 실제로 없는 차이를 보고하는 비율은 10% 이하다.
4. **다시 실행**: 이미 표준을 따르는 held-out 사례의 100%에서, 스킬은 "어긋난 곳 없음"을 보고하고 아무것도 바꾸지 않는다.
5. **`merge`의 큐 경로**: 큐가 켜진 저장소의 held-out 실행 100%에서, `merge`는 rebase나 직접 머지를 시도하지 않고 PR을 큐에 넣는다. GitHub이 `MERGED`를 보고하기 전에는 정리를 시작하지 않는다.
6. **`merge`의 기존 경로**: 큐가 없는 저장소의 held-out 실행에서는 `merge`의 기존 regression suite가 지금과 같은 점수로 통과한다.
7. 실제 GitHub 설정을 바꾸는 확인은 `toy-crane/dearly-ci-scratch`에서만 한다. 시험 PR이 큐 후보에서 전체 검사를 거쳐 머지되고, GitHub 화면에서 바로 머지하려는 시도는 "큐 통과 표시" 때문에 막혀야 한다.
8. **디버깅 도구 남기기**: Mergify를 들여오는 held-out 실행(승인을 받은 적용 사례)의 100%에서, `setup-ci`는 `add-stack-context`에 Mergify를 넘긴다. 보고만 하는 사례와 이미 표준을 따르는 사례에서는 넘기지 않는다.

## 확정된 제약과 이유

- **범위는 PR에서 머지까지**: 목표인 rebase와 비싼 CI는 모두 이 구간에서 생긴다. 배포는 앱의 제품 단계에 따라 일부러 다르게 한 부분(Android 내부 배포, 정식 출시, Edge 배포)이 몰려 있고, 배포 순서와 GitHub/EAS 경계는 이미 두 앱이 같다.
- **큐 브랜치 방식**: 비교한 세 방식 중 rebase와 전체 CI 반복을 둘 다 줄이는 것은 이 방식뿐이다. 지금 방식(strict와 직접 rebase)은 둘 다 남는다. 제자리 직렬(Mergify가 원래 PR을 rebase)은 GitHub 규칙을 그대로 둘 수 있지만, 묶음이 불가능해서 차례마다 전체 CI가 다시 돈다.
- **큐를 건너뛴 머지는 기술적으로 막는다** (방법은 재검토 중, "미룬 결정" 참고): 지침으로만 막으면 머지 주체가 대부분 에이전트라서 지침 하나에 기대게 되고, 어겼을 때는 이미 main에 들어간 뒤다. 처음 고른 "큐 통과 표시"는 아래 이유로 쓸 수 없다.
- **PR push마다 가벼운 검사**: 깨진 PR이 묶음에 섞이면 묶음 전체가 실패하고, 원인을 찾는 동안 전체 CI가 여러 번 돈다. pre-push 결과는 GitHub과 Mergify가 볼 수 없어서 큐 입장 조건으로 쓸 수 없다.
- **GitHub 설정은 스킬이 승인을 받고 바꾼다**: "큐 통과 표시"를 Mergify가 동작하기 전에 켜면 그 순간부터 모든 머지가 막힌다. 이 순서를 사람이 매번 지키는 것보다 스킬이 지키는 편이 안전하다.
- **Mergify 비용**: 비공개 저장소, 활동 기여자 5명 이하는 Free 플랜이고, 두 단계 CI와 묶음, 병렬 검사가 포함된다(2026-11-14 mergify.com/pricing 확인). 활동 기여자는 최근 30일 안에 PR을 열거나 PR에 push한 사람이다.
- **GitHub 내장 merge queue는 쓰지 않는다**: Mergify 권장 설정은 GitHub 내장 merge queue 규칙을 끄라고 한다. 개인 계정 비공개 저장소에서 내장 큐를 쓸 수 있는지도 확인되지 않았다.

## 가정 (바꿔도 됨)

- 스킬 이름은 `setup-ci`이고, 저장소 전달 작업이므로 `git` 그룹에 둔다. 사용자가 직접 부르는 스킬이라 verb-object 형태를 따른다.
- 스킬은 GitHub Actions를 쓰는 저장소를 대상으로 한다. turborepo가 있으면 바뀐 패키지만 검사하고, Supabase migration이 있으면 삭제 migration 검사를 넣는다. 둘 다 없는 저장소에도 큐와 두 단계 CI는 그대로 적용된다.
- 묶음 크기는 5에서 시작한다. Mergify의 기본 묶음 크기는 1이라 묶음 검사가 일어나지 않으므로, 기본값을 쓰지 않는다. 묶음 대기 시간은 Mergify 기본값에서 시작한다. 둘 다 post-release check 결과를 보고 조정한다.
- 큐에 넣는 방법은 Mergify가 지원하는 방식 중 하나로 정한다(라벨 또는 PR 댓글 명령). 어느 쪽인지는 구현이 Mergify 문서와 시험 저장소에서 확인해 고른다.
- 코드 리뷰(GitHub Codex 리뷰 또는 로컬 `codex review`)는 표준에 넣지 않고 앱마다 둔다. 두 앱 모두 리뷰를 필수 검사로 쓰지 않는다.

## 손대지 않을 곳

- 머지 뒤 배포 workflow(DB, Worker, EAS, Slack 알림): 범위 밖이다.
- dearly와 flyn 저장소 자체: 이 spec은 스킬과 `merge`만 바꾼다. 두 앱에 표준을 적용하는 일은 스킬이 나간 뒤 각 저장소에서 스킬을 실행해서 한다.
- 시험 저장소 `toy-crane/dearly-ci-scratch` 밖의 실제 앱 저장소 GitHub 설정: 구현 중에는 바꾸지 않는다.

## 미룬 결정

- **배포까지 표준에 넣을지**: 세 번째 앱을 만들기 시작할 때 다시 본다. 그때 두 앱의 배포 순서, GitHub/EAS 경계, 알림 방식을 표준 후보로 검토한다.

- **큐를 건너뛴 머지를 막는 방법** (2026-11-16 재검토로 전환): 처음 고른 "아무도 보고하지 않는 필수 검사(`Merged through queue`)"는 쓸 수 없다. Mergify는 ruleset 예외(`exempt`)여도 대상 브랜치 ruleset의 필수 검사를 자기 큐 조건으로 끌어온다(Mergify 문서 merge-queue/github-rulesets "How condition injection works"). 시험 PR `toy-crane/dearly-ci-scratch#6`이 "Waiting for queue conditions … `check-success = Merged through queue`, required by GitHub repository ruleset"에서 멈춘 것으로 확인했다. 후보는 셋이다.
  1. Mergify Merge Protections(공식 권장): `.mergify.yml`의 `merge_protections`에 "큐에 들어간 PR만 통과"(`queue-position >= 0`) 규칙을 두고, `Mergify Merge Protections` 체크를 ruleset 필수로 건다. 규칙은 Mergify가 유효하다고 확인했다(#7의 `Configuration changed`: "Valid configuration"). 다만 기능이 꺼져 있어 동작은 아직 확인하지 못했다. 한계: 큐에 들어간 순간 통과하므로, 큐에서 기다리는 동안 사람이 GitHub 머지 버튼을 누르면 `Queue checks` 없이 들어갈 수 있다.
  2. `branch_protection_injection_mode` 설정(`merge` 또는 `none`)으로 Mergify가 표시 검사를 끌어오지 않게 하기. `none`은 ruleset을 스스로 통과하는 별도 봇 계정(`merge_bot_account`)이 필요하다. 시험하지 않았다.
  3. 기술적 차단을 포기하고 Mergify 기본 설정(PR 검사만 필수)과 지침으로 지키기. spec의 이 결정을 바꾸는 것이다.
  다시 여는 조건: 이 spec을 다시 구현하기 전. 먼저 시험 저장소에서 Merge Protections를 켜고 1번을 확인한 뒤, 1번의 한계를 받아들일지 사용자가 정한다.

## 남은 위험

- 2026-11-14 개인 계정 비공개 저장소 `toy-crane/dearly-ci-scratch`의 main ruleset에 Mergify(GitHub App ID `10562`)를 `exempt` 예외로 넣는 요청을 GitHub이 받아들였다. 설정을 다시 읽어도 그대로 남아 있었다. 다만 Mergify가 실제로 이 예외로 "큐 통과 표시"를 건너뛰고 머지하는지는 아직 확인하지 않았다. 구현의 시험 PR(수용 기준 7)이 이를 확인하고, 안 되면 shaping으로 돌아온다.
- Mergify가 멈추면 아무도 머지할 수 없다. 이때는 저장소 주인이 ruleset을 잠시 고쳐서 푼다. 스킬은 이 복구 방법을 앱의 결정 문서에 함께 기록한다.
- dearly의 지금 CI는 `ready-to-merge` 라벨과 commit status로 필수 검사를 보고한다. 표준으로 옮기면 이 구조가 바뀌므로, dearly 적용은 flyn보다 손이 많이 간다.
- 큐 후보에서 삭제 migration 승인 라벨을 원래 PR에서 읽어야 한다. 임시 PR에는 원래 PR의 라벨이 없다.
- Mergify CLI는 기기마다 설치와 `mergify auth login`이 필요하다. 브라우저가 없는 클라우드 세션에서는 Mergify 애플리케이션 키를 환경 변수로 넣어야 디버깅 명령이 동작한다. 그 전까지 에이전트는 GitHub에 보이는 체크와 댓글로만 원인을 찾는다.
- Mergify의 Merge Queue 기능은 저장소마다 대시보드에서 켜야 한다. 켜지 않아도 `Configuration changed` 체크는 붙지만 `@mergifyio queue`는 거절된다. Mergify API(`PUT /v1/products/{owner}/{repository}`)로도 켤 수 있지만, Mergify 인증이 필요해서 이번에는 사용자가 대시보드에서 켠다.
- `docs/specs/merge-auto-merge/`도 `merge` 스킬을 바꾸는 진행 중인 spec이다. 두 작업이 같은 파일을 고치므로, 먼저 나간 쪽에 맞춰 다른 쪽을 `babysit-specs`로 갱신해야 한다.

## Setup before implementation

- Mergify GitHub 앱을 `toy-crane/dearly-ci-scratch`에 설치한다. 큐와 GitHub 설정 순서를 실제로 확인하는 데 쓴다. 완료 조건: 그 저장소의 Settings → GitHub Apps에 Mergify가 보이고, Mergify 대시보드의 저장소 목록에 나온다.
- 같은 저장소의 main ruleset 예외 목록에 Mergify를 추가할 수 있는지 확인한다. 완료 조건: 그 저장소의 ruleset 편집 화면에서 예외 목록에 Mergify를 고를 수 있다. (2026-11-14 완료: API로 `exempt` 예외를 넣고 다시 읽어 확인했다.)
- Mergify 대시보드에서 시험 저장소의 Merge Queue 기능을 켠다. 켜지 않으면 `@mergifyio queue`가 거절된다. 완료 조건: 대시보드의 Merge Queue 화면이 열린다. (2026-11-16 완료)
- Mergify 대시보드에서 시험 저장소의 Merge Protections 기능을 켠다. 큐를 건너뛴 머지를 막는 후보 1의 전제다. Free 플랜에 포함되는지는 확인하지 못했다. 완료 조건: `toy-crane/dearly-ci-scratch#7`의 `Configuration changed` 체크에서 "Merge Protections is not activated" 문구가 사라지고 `Mergify Merge Protections` 체크가 붙는다.

## Post-release check

- 지표: 표준을 처음 적용한 앱 저장소에서, 머지된 PR 하나당 전체 CI 실행 수와 에이전트의 rebase push 수
- 통과 기준: 적용 뒤 30일의 두 값이 모두 적용 전 30일보다 낮다.
- 기간: 릴리스 뒤 45일
- 측정: `docs/specs/app-ci-standard/measure-merge-cost.mjs`. 저장소 이름과 적용일을 받아 `gh`로 workflow 실행 기록과 PR의 force-push 이벤트를 읽고, 적용 전후의 두 값과 PASS 또는 FAIL을 출력한다.
- 기준 미달 시: 묶음이 자주 실패했는지, 가벼운 검사가 깨진 PR을 걸러내지 못했는지 측정 결과에서 확인한다. 묶음 크기와 큐 입장 조건을 조정하고, 그래도 미달이면 제자리 직렬 방식과 비교하는 shaping을 다시 연다.
