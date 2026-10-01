# 쌓인 worktree 정리 (`clean-worktrees`)

Blocked by: docs/specs/merge-worktree-cleanup/

## 문제

`merge`는 자기가 병합한 worktree 하나만 정리한다. 다른 경로로 병합됐거나 닫힌 PR의 worktree, 이미 base에 들어간 분리된(detached) worktree, Git 등록이 풀린 채 남은 폴더는 아무도 치우지 않는다. 2026-10-01 flyn에는 Git worktree가 22개 쌓여 있었다. 병합된 PR의 worktree 4개, 깨끗하고 커밋이 `main`에 들어간 분리된 worktree 9개, 등록이 풀린 폴더 7개가 있었고, 일부는 개발 서버와 에뮬레이터, 전용 Supabase 스택을 잡고 있었다.

## 사용자에게 보이는 결과

- 사용자가 저장소에서 `clean-worktrees`를 부르면, 그 저장소의 worktree와 등록이 풀린 폴더를 살펴 안전하게 지울 수 있는 것만 정리한다. 실행 중에 확인이나 승인을 묻지 않는다.
- 끝나면 한 번에 보고한다. 지운 것, 폴더를 남기고 브랜치만 지운 것, 남겨 둔 것을 나누고, 남겨 둔 것마다 이유를 붙인다.
- 이유는 사용자가 다음 행동을 고를 수 있을 만큼 구체적이다. 열린 PR 번호, 커밋하지 않은 변경, 붙은 프로세스의 PID와 명령, 실패한 정리 명령, Codex가 관리하는 worktree 같은 것이다.

## 승인된 범위

- 찾는 대상은 세 가지다.
  1. 브랜치가 checkout된 worktree 가운데 그 브랜치의 PR이 병합됐거나 닫힌 것. squash merge에서는 병합된 브랜치의 끝이 base 이력에 없으므로, 병합 여부는 커밋 조상 관계가 아니라 GitHub의 PR 상태로 판단한다.
  2. HEAD가 분리된 worktree 가운데 그 커밋이 원격 base에 포함된 것.
  3. Git 등록이 풀린 채 남은 폴더.
- 건드리지 않는 것: 열린 PR의 worktree, 커밋하지 않은 변경이 있는 worktree, 세션이 붙은 worktree, 기본 checkout, PR이 없는 브랜치의 worktree. 사용자가 정한 제외 목록은 "PR이 없고 base에 포함되지 않은 브랜치"였지만, 대상 목록에 PR 없는 브랜치가 없으므로 base에 포함돼도 지우지 않는다.
- 고른 대상을 지우는 단계는 `merge`와 같은 [worktree-cleanup](../../decisions/worktree-cleanup.md) 절차를 쓴다. 정리 섹션 실행, 현재 세션 판별, 붙음과 남음의 구분, Codex worktree, 브랜치 삭제 조건은 그 문서가 정한다. 이 Skill은 그 절차를 따로 정의하지 않는다.
- 첫 판은 사람이 직접 부르는 Skill이다.
- 이름은 `clean-worktrees`, 그룹은 `git`이다.

## 수용 기준

1. 판단 전에 원격을 fetch한다. base는 사용자가 지정한 브랜치, 없으면 원격의 기본 브랜치다.
2. 브랜치의 PR이 squash로 병합된 worktree는 공통 절차로 제거되고, 보고에 PR 번호가 나온다.
3. PR이 병합되지 않고 닫혔으며 로컬 브랜치 끝이 그 PR의 head와 같으면 제거된다. 그 커밋은 GitHub의 PR에 남는다.
4. 열린 PR의 worktree는 그대로 두고 PR 번호와 함께 보고한다. 같은 브랜치 이름에 열린 PR이 하나라도 있으면 열린 것으로 본다.
5. PR이 없는 브랜치의 worktree는 base에 포함되든 아니든 그대로 두고 보고한다. 막 만든 worktree처럼 고유한 커밋이 없어도 대상이 아니다.
6. 분리된 HEAD가 원격 base에 포함되면 제거되고, 포함되지 않으면 그대로 둔다.
7. 커밋하지 않은 변경(무시되지 않는 새 파일 포함)이 있는 worktree는 대상 조건을 만족해도 그대로 둔다.
8. 띄운 쪽이 살아 있는 프로세스가 붙은 worktree는 정리 명령도 실행하지 않고 그대로 두며, PID와 명령을 보고한다. 남은 프로세스만 있는 worktree는 정리 명령을 실행한 뒤 지우기 직전 확인을 거친다.
9. 기본 checkout과 base 브랜치는 어떤 경우에도 지우지 않는다.
10. Codex worktree 루트 아래의 등록된 worktree는 그대로 두고, 따로 묶어 보고한다. 루트 아래에서 등록이 풀린 폴더는 찾지 않는다. 해당 채팅을 Codex에서 보관하면 Codex가 스냅숏을 남기고 지운다고 알린다.
11. 등록이 풀린 폴더는 결정 문서의 조건(기본 checkout 안에서 Git이 무시하고 등록된 linked worktree도 놓인 폴더 바로 아래, `.git` 없음)을 만족할 때만 대상이 된다. 정리 명령과 지우기 직전 확인을 거쳐 폴더를 지운다. `.git`이 남아 있는 폴더는 커밋하지 않은 작업이 없는지 확인할 수 없으므로 그대로 두고 보고한다. `~/code/` 처럼 저장소 밖에서 linked worktree와 다른 폴더가 섞인 곳은 찾지 않는다.
12. 현재 세션이 커밋하지 않은 변경이 없는 대상 worktree 안에서 실행 중이면 공통 절차대로 정리 명령을 실행하고, 폴더를 남긴 채 HEAD를 분리하고 브랜치만 지운다.
13. 실행 중에 사용자에게 묻지 않는다. 판단할 수 없는 대상은 남겨 두고 보고한다.
14. `gh`를 쓸 수 없거나 인증이 안 되어 있으면 브랜치 worktree는 판단하지 않고 그 사실을 보고한다. 분리된 worktree와 등록이 풀린 폴더는 계속 처리한다.
15. `merge`와 이 Skill이 싣는 삭제 절차의 사본이 같다는 것을 저장소가 검증한다.
16. 구현 검증은 이 저장소의 평가와 스크래치 Git 저장소로 1–14번의 대상과 제외를 재현한다. 실제 flyn worktree는 쓰지 않는다.

## 확정된 제약과 이유

- [worktree-cleanup](../../decisions/worktree-cleanup.md): 하나를 지우는 절차는 `merge`와 공유한다. 사용자가 이 세션에서 고른 붙음 기준, 폴더를 남길 때의 정리 명령, Codex worktree 처리가 여기 들어 있다.
- [Skill naming](../../decisions/skill-naming.md): 사용자가 직접 부르는 Skill은 짧은 동사-목적어 이름을 쓴다. 사용자가 `clean-worktrees`를 골랐다.
- [Skill layout](../../decisions/skill-layout.md): Git 저장소를 다루는 작업이므로 `git` 그룹에 둔다.
- 확인과 승인 단계를 더하지 않고, 지울 대상을 좁게 정의하는 기본값으로 안전을 지킨다. 사용자의 선호다.
- 병합 여부는 GitHub의 PR 상태로 판단한다. flyn은 squash merge를 쓰므로 병합된 브랜치의 HEAD가 `main` 이력에 없다.

## 가정 (수정 가능)

- 브랜치의 PR은 이 저장소에서 그 브랜치 이름을 head로 가진 PR이다. 열린 PR이 없으면 가장 최근에 만든 PR의 상태를 쓴다.
- 로컬 브랜치 끝이 PR head와 다르고 base에도 포함되지 않으면(푸시하지 않은 커밋이 있으면) worktree 전체를 그대로 두고 보고한다.
- 잠긴 worktree, base 브랜치가 checkout된 linked worktree는 그대로 둔다.
- 원격 브랜치는 지우지 않는다.
- 한 번 실행은 현재 저장소 하나만 다룬다.

## 범위 밖

- 예약 실행. 아래 보류한 점을 따른다.
- Codex가 관리하는 worktree의 정리. Codex 앱의 수명 관리에 맡긴다.
- 프로세스를 직접 멈추는 일. 프로젝트가 선언한 명령만 자원을 푼다.
- flyn 저장소의 수정과 실행.

## 보류한 점

- 예약 실행 여부와 주기. flyn에 쌓인 worktree로 써 본 뒤 정한다. 기기, Docker, 폴더가 모두 로컬에 있어 클라우드 Routine으로는 돌릴 수 없다. 정하기 전까지는 사람이 직접 부른다.

## 남은 위험

- 등록이 풀린 폴더에는 checkout이 없다. 프로젝트의 정리 명령이 그런 폴더에서 동작하지 않으면 명령이 실패하고 폴더는 남는다. flyn이 그런 폴더도 치우려면 선언하는 명령이 checkout 없는 폴더에서도 동작해야 한다.
- Codex worktree는 Codex의 개수 제한과 보관에만 의존하므로 계속 쌓일 수 있다.
- 브랜치 이름을 여러 PR에서 다시 썼다면 가장 최근 PR의 상태로 판단한다.
- Codex 설정에서 worktree 루트를 바꿨거나, Codex 앱 채팅이 루트 밖 폴더에서 돌고 있으면 그 채팅은 보이지 않는다.
