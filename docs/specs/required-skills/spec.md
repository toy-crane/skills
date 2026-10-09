# 스킬이 부르는 스킬은 필수로 만들기

[skill-design](../../decisions/skill-design.md)은 "이름으로 부르는 스킬은
필수이고, 없으면 시작 전에 멈춘다"는 규칙과 외부 스킬 예외의 기준이다.
[stack-context](../../decisions/stack-context.md)는 `find-skills`가 외부
스킬로서 선택 사항으로 남는 이유를 든다.
[worktree-cleanup](../../decisions/worktree-cleanup.md)은 워크트리 제거
절차와, 그 헬퍼를 `clean-branches` 한 곳에만 두는 결정을 가진다.
[skill-naming](../../decisions/skill-naming.md)은 `clean-worktrees`를
`clean-branches`로 바꾸는 이름 결정이다.

## 문제

지금의 "스킬은 혼자서도 돌아간다" 원칙에는 두 가지가 섞여 있다. 다른 스킬의
본문을 안다고 가정하지 않는 것(유지)과, 다른 스킬이 설치돼 있지 않아도 같은
결과를 내도록 대체 경로를 본문에 두는 것(폐기)이다.

- 플러그인과 `update-project-skills`는 전체를 설치하므로, 대체 경로는
  skills.sh로 스킬 하나만 고른 사람에게만 실행된다.
- 그런데 대체 경로는 원래 경로를 밀어냈다. 2주 동안 PR을 만든 42개 세션 중
  `pr`을 로드한 것은 11개뿐이었고, 28개는 `merge`가 복사해 둔 규칙으로 PR을
  만들었다.
- 복사본은 관리 비용이 든다. `remove-worktree.sh`는 `merge`와
  `clean-worktrees`에 두 벌 있고, CI `shared-helpers`는 두 파일이 같은지만
  검사한다.
- `skills` CLI 1.7.1은 frontmatter에서 `name`과 `description`만 읽고 의존성
  선언 필드가 없다. 그래서 하나만 설치하는 경우는 막을 수 없고, 스킬이 직접
  감지해야 한다.

## 사용자에게 보이는 결과

- 플러그인 사용자와 `update-project-skills` 사용자는 달라지는 것이 없다.
- skills.sh로 `merge`만 설치한 사용자는, 지금은 품질이 낮은 결과를 모른 채
  받지만, 바뀐 뒤에는 작업이 시작되기 전에 "`pr`, `pull`, `clean-branches`가
  필요합니다"와 설치 명령을 받는다.
- "머지해 줘"의 마지막 정리 단계는 `clean-branches`가 처리한다. 워크트리에서
  작업했으면 워크트리와 로컬 브랜치를, 일반 체크아웃에서 작업했으면 로컬
  브랜치만 정리한다. 사용자가 보는 결과는 지금과 같다.
- "쌓인 브랜치(워크트리) 정리해 줘"는 `clean-branches`가 받는다. 이름만
  바뀌고 하는 일은 같으며, 원격 브랜치는 건드리지 않는다.

## 승인된 범위

- 이 저장소의 스킬을 이름으로 부르는 모든 자리에서 "없을 때" 대체 경로를
  지운다. 현재 대상:
  - `merge` → `pr`, `pull`, `clean-branches`
  - `triage-issues` → `pr`
  - `implement` → `tdd`, `babysit-specs`, `project-knowledge`
  - `shape-idea` → `project-knowledge`, `add-stack-context`,
    `explain-visually`, `build-prototype`
  - `babysit-specs` → `project-knowledge`, `build-prototype`
  - `maintain-project-context` → `define-product`
  - `expo-dev-loop`, `expo-smoke-test`, `resolve-follow-ups`, `define-piece`,
    `draft-piece`, `define-publication` → `project-knowledge`
  이름이 사용자에게 보내는 안내문이나 경계 문장에만 나오는 경우는 의존성이
  아니다. `triage-issues`가 "답이 오면 `shape-idea`로 이어 간다"고 적은
  것, `resolve-follow-ups`가 "나중 `shape-idea` 세션이 정한다"고 적은 것이
  그 예다.
- `implement`에서 `human-review`를 언급하는 유일한 문장(리뷰 결과 분류에서
  "사용자 몫인 결정은 `human-review`로 판단하도록 권한다")을 지운다. 그
  결정을 사용자 몫으로 핸드오프에 적는 동작은 그대로이고, 어떤 스킬로
  판단할지 권하는 부분만 빠진다. `implement/evals/evals.json`에서 그 권유를
  기대하는 단언도 함께 지운다. `human-review` 스킬 자체는 남는다. 이로써
  이 저장소의 다른 스킬 본문에는 `human-review`가 나오지 않는다.
- 각 스킬은 작업을 시작하기 전에 자기가 부를 스킬이 설치돼 있는지 확인하고,
  없으면 멈춘다. 부수 작업용 스킬(`project-knowledge`로 후속 과제 기록)도
  같은 기준이다.
- `clean-worktrees`를 `clean-branches`로 바꾼다. 폴더, frontmatter 이름,
  `plugin.json` 경로, `skills.sh.json`의 "Git delivery" 그룹 항목,
  `.agents/skills/`와 `.claude/skills/` 심볼릭 링크, README, `merge` 안의
  참조가 함께 바뀐다. `skills.sh.json`은 `notGrouped: bottom`이라 항목을
  빠뜨리면 새 스킬이 그룹 밖 맨 아래로 밀린다.
- `clean-branches`의 일괄 정리는 워크트리 없는 로컬 브랜치도 후보로 본다.
  지금은 `git worktree list`에서 출발해 워크트리에 체크아웃된 브랜치만
  보는데, 일반 체크아웃에서 머지한 브랜치는 워크트리가 없어서 한 번도
  후보가 되지 않는다. 새 이름이 약속하는 단위가 브랜치이므로, PR이 머지되거나
  닫힌 로컬 브랜치를 워크트리와 같은 기준으로 판정한다: GitHub에서 브랜치
  이름으로 PR을 찾고, tip이 PR head와 같거나 base에 포함될 때만 지우며,
  base 브랜치와 지금 체크아웃된 브랜치는 건드리지 않는다. PR이 없는
  브랜치는 지금 워크트리에서 그러듯 남기고 보고한다.
- `clean-branches`는 `merge`가 넘기는 한 브랜치를 받는 경로를 얻는다.
  워크트리가 있으면 지금의 헬퍼 판정으로 워크트리와 로컬 브랜치를 정리한다.
  머지한 브랜치가 일반 체크아웃(주 체크아웃)에 체크아웃돼 있으면 헬퍼를
  쓰지 않는다. 헬퍼는 주 체크아웃을 `main-checkout`으로 보고 `blocked`를
  돌려주기 때문이다. 대신 지금 `merge`가 하는 그대로 그 체크아웃을 머지된
  base 상태로 옮기고 로컬 브랜치만 지운다. 커밋 안 한 변경이 있으면
  브랜치를 남기고 보고한다.
- `remove-worktree.sh`와 그 eval은 `clean-branches`에만 남긴다. `merge`의
  복사본과 CI `shared-helpers` 워크플로를 지우고, `CLAUDE.md`와 `AGENTS.md`의
  "Skills stand alone"과 "Merging into main" 절을 새 규칙에 맞게 고친다.
- README의 "각 스킬은 독립적으로 설치 가능하다"는 설명을 새 규칙으로 바꾼다.
- 이미 출시됐지만 은퇴하지 않은 스펙 폴더 중 이 작업과 모순되는 네 개를
  지운다: `docs/specs/clean-worktrees/`(#121)와
  `docs/specs/merge-worktree-cleanup/`(#120)은 옛 이름과 "헬퍼를 두 벌
  싣고 CI로 맞춘다"는 요구를, `docs/specs/use-pr-skill-for-prs/`(#127)는
  "`pr`이 없을 때 `merge`가 쓰는 짧은 본문과 인라인 이슈 연결"을,
  `docs/specs/merge-rebase-blocker-recovery/`는 "`merge`는 단독 설치에서도
  복구를 책임진다"는 전제를, `docs/specs/pr-video-first/`(#126)는 "`pr`과
  `merge`는 각자 독립 설치되므로 같은 PR 본문 규칙 사본을 가진다"는
  제약을 들고 있다. 남겨 두면 이 스펙과 모순되는 수용 기준이 저장소
  컨텍스트에 남는다. 그 결정 내용은 `worktree-cleanup.md`,
  `skill-design.md`, `pr-descriptions.md`가 이미 가지고 있다.
  `docs/specs/merge-auto-merge/`는 남기되, 지워지는
  `merge-rebase-blocker-recovery/`로 가는 링크와 "Git 전달 스킬의 독립성"
  문구를 `merge` 스킬 본문이 그 복구 동작을 가진다는 문장으로 바꾼다.
- 설치된 플러그인 사용자가 업데이트를 받도록 `plugin.json` 버전을 올린다.

## 수용 기준

- 배포되는 스킬 폴더 어디에도(`SKILL.md`뿐 아니라 `references/`,
  `agents/`, `evals/`까지) 이 저장소의 스킬에 대해 "없으면/unavailable/
  absent/when available" 조건으로 분기하는 문장이나 그런 동작을 기대하는
  평가 단언이 없다. `find-skills`에 대한 분기는 남는다.
- 필수 스킬이 하나 빠진 상태에서 스킬을 부르면, 파일이나 Git 상태를 바꾸기
  전에 빠진 스킬 이름과 설치 명령을 보고하고 끝난다. 예:
  `pr`이 없는 `merge`는 커밋·rebase·PR 생성 중 아무것도 하지 않는다.
- 전부 설치된 상태에서 `merge`는 `pull` → 검증 → `pr` → 머지 →
  `clean-branches` 순으로 다른 스킬을 실제로 불러 끝까지 간다. 워크트리가
  없는 체크아웃에서 머지한 경우 로컬 브랜치 삭제와 base 체크아웃 복귀만
  일어난다.
- `clean-branches`를 직접 부르면 지금 `clean-worktrees`와 같은 후보 판정,
  제거, 보고를 하고, 거기에 더해 PR이 머지되거나 닫힌 워크트리 없는 로컬
  브랜치를 지운다. PR 없는 브랜치, base 브랜치, 체크아웃된 브랜치는 남고
  보고에 이유가 적힌다.
- 저장소에 `remove-worktree.sh`가 한 벌만 있고, `.github/workflows/`에는
  `plugin-manifest`와 `codex-review-gate`만 남는다.
- `claude plugin validate . --strict`가 통과하고, `plugin.json`의 `skills`
  배열에 `clean-worktrees`가 없고 `clean-branches`가 있다.
- `update-project-skills`는 복사 설치된 옛 `clean-worktrees`를 "더 이상
  배포되지 않는 스킬"로 보고한다. 기존 동작이며 새 코드가 필요 없다.

## 확정된 제약과 이유

- 이름으로 부르면 필수다. 부르는 쪽은 넘기는 것과 돌려받는 것만 적는다.
  예: `merge`는 `pr`에 remote와 base를 넘기고 PR URL을 돌려받는다. 규칙을
  한 곳에만 두기 위해서다.
- 없으면 "시작 전에 멈추고 설치 명령 안내"다. 품질이 낮아진 대체 경로는
  아무도 알아차리지 못하지만 멈춤은 보인다. 그리고 skills.sh의 `--skill`
  단일 설치는 막을 수 없으므로 어차피 빠진 경우의 동작을 정해야 한다.
- 외부 스킬(`find-skills`)은 예외다. 다른 배포자의 스킬이라 플러그인에 실을
  수 없고, 같은 검색은 CLI 명령 하나로 대신할 수 있다.
- 부수 작업용 스킬도 필수다. 기록이 빠진 채 진행되면 그 누락도 조용하다.
- `merge`는 정리를 `clean-branches`에 맡긴다. 스킬마다 설치 위치가 달라서
  다른 스킬 폴더 안의 스크립트를 경로로 가리킬 수 없고, 복사본을 두면
  방금 버린 원칙으로 돌아간다.
- 이름은 `clean-branches`다. 머지한 작업에는 항상 브랜치가 있고 워크트리는
  있을 때만 있다. 복수형인 이유는 직접 부르는 상황이 일괄 정리이기
  때문이다.

## 가정 (바꿀 수 있음)

- 필수 스킬 목록은 각 `SKILL.md` 본문 첫머리에 한 줄로 둔다. `skills` CLI가
  frontmatter에서 `name`과 `description`만 읽으므로 frontmatter에 두어도
  도구가 읽지 않는다.
- 안내하는 설치 명령은 `npx skills@latest add toy-crane/skills --skill
  <name>` 형태다. 대상 프로젝트가 다른 패키지 매니저를 고정했으면 skill-design의
  기존 결정대로 그 runner를 쓴다.
- 설치 여부 확인 방법은 모델에 맡긴다. Claude Code와 Codex 모두 로드된 스킬
  목록을 보여 준다.
- `clean-branches`의 description은 일괄 정리와 `merge`가 넘기는 한 브랜치를
  함께 받는다고 적고, "머지 직후 정리는 `merge` 몫"이라는 문장은 지운다.
- `plugin.json` 버전은 minor를 올린다.
- 출시된 다섯 스펙 폴더의 삭제는 이 작업에서 한다. 보통은
  `maintain-project-context`의 정기 정리 몫이지만, 이 작업이 그 폴더들의
  요구를 직접 뒤집기 때문이다.

## 손대지 않는 것과 이유

- 각 스킬의 나머지 본문. 이번 작업은 의존성 문장, `merge`가 정리를 넘기는
  문장, `clean-branches`가 그 한 브랜치를 받는 경로, `implement`의
  `human-review` 권유 문장, 복사본만 바꾼다.
- `human-review` 스킬 자체. 사용자가 직접 부르는 스킬로 남는다.
- `remove-worktree.sh`의 판정 자체. 주 체크아웃을 `blocked`로 보는 것은 그
  폴더를 지우면 안 되기 때문이고, 브랜치만 지우는 경로는 스킬 본문이 맡는다.
- `add-stack-context`의 `find-skills` 분기. 외부 스킬 예외로 확정했다.
- `.agents/skills/writing-great-skills`. 배포되지 않는 vendored 스킬이라
  규칙 대상이 아니다.
- 새 CI 검사. 대체 경로가 다시 생기는 것은 리뷰로 잡는다.

## 미룬 결정

- skills.sh가 의존성 선언을 지원하게 되면, 시작 시 확인 대신 선언으로
  옮길지. 그때까지는 스킬이 직접 확인한다.
- `update-project-skills`가 빠진 필수 스킬을 채워 넣는 단계를 가질지. 지금은
  공통 스킬을 모두 설치하므로 필요한 경우가 없다. Expo 스킬이 요구하는
  `project-knowledge`도 공통 스킬이다.

## 남은 위험

- 에이전트가 "멈추라"는 지시를 무시하고 즉석에서 대체 경로를 만들 수 있다.
  옛 실패의 반대 방향이다. `pr`을 뺀 `merge` 호출 한 번으로 확인한다.
- `implement`만 설치한 사용자는 이제 `tdd`, `babysit-specs`,
  `project-knowledge`까지 설치해야 한다. 설치 명령을 한 줄로 안내하므로
  비용은 한 번이다.
- 복사 설치로 `clean-worktrees`를 쓰던 사용자는 `update-project-skills`를
  돌리기 전까지 옛 이름과 새 이름이 함께 보일 수 있다.
