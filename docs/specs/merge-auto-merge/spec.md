# `merge`의 조건부 auto merge

## 문제

`merge` 요청에서 GitHub의 필수 조건이 끝날 때까지 에이전트가 기다린 뒤 병합 명령을 내리면, 조건이 충족된 순간 GitHub가 병합할 수 있는 기능을 활용하지 못한다. 반대로 모든 명령에 `--auto`를 붙이면 이미 병합 가능한 PR은 즉시 병합되고, 저장소에서 auto merge를 허용하지 않는 경우에는 대기 중인 PR의 예약이 실패할 수 있다. GitHub의 필수 조건에 포함되지 않은 검증도 auto merge가 대신 기다려주지 않는다.

## 사용자에게 보이는 결과

- 병합을 요청하면, 현재 PR과 저장소의 조건에 맞는 경로로 실제 병합까지 진행한다.
- GitHub가 auto merge를 허용하고 최신 base에 대한 검증을 강제하며, 남은 대기가 GitHub의 필수 병합 조건뿐인 PR은 조건 충족 후 GitHub가 병합하도록 설정한다.
- auto merge를 사용할 수 없거나 적합하지 않은 PR은 필요한 검증을 기다린 뒤 일반 병합으로 완료한다. 설정 실패를 병합 완료로 보고하지 않는다.
- 어느 경로에서도 원격 `MERGED` 상태를 확인한 뒤에만 기존 작업 트리 정리, 로컬 base 동기화, 해당하는 이슈 동기화를 수행한다.

## 승인된 범위

- `merge` 스킬이 auto merge를 선택할 조건과 일반 병합 경로를 명확히 한다.
- 병합 방식은 기존처럼 커밋을 보존할 가치에 따라 rebase 또는 squash를 선택한다. Auto merge 여부가 병합 방식을 바꾸지 않는다.
- PR의 현재 head, base, 관련 검증, GitHub 필수 조건, 저장소의 auto merge 허용 여부를 근거로 선택한다.
- [Skill design](../../decisions/skill-design.md)은 Git 전달 스킬의 독립성과 원격 완료 증거를 규정한다. [기존 merge 복구 스펙](../merge-rebase-blocker-recovery/spec.md)은 rebase 차단, head 변경, 최신 CI 재검증을 규정한다.

## 수용 기준

1. 저장소에서 auto merge를 허용하고 GitHub가 최신 base에 대한 검증을 강제하며, 에이전트가 직접 확인할 관련 검증은 끝났고 현재 PR에는 GitHub가 강제하는 조건만 남았으면 해당 PR의 선택한 병합 방식으로 auto merge를 설정한다. 설정 성공을 병합 성공으로 보고하지 않고 원격 결과를 기다린다.
2. PR이 이미 병합 가능해도 관련 검증과 리뷰를 먼저 확인한다. 이 경우 `--auto`가 대기 예약을 보장한다고 가정하지 않고 일반 병합을 완료한다.
3. 저장소에서 auto merge를 허용하지 않거나, GitHub가 최신 base 검증을 강제하지 않거나, 관련 검증이 GitHub의 필수 조건으로 강제되지 않아 아직 끝나지 않았으면 `--auto`로 선행 예약하지 않는다. 검증이 끝나고 현재 head와 base의 병합 조건을 다시 확인한 뒤 일반 병합한다.
4. Auto merge 설정이 거절되면 오류의 원인을 확인하고 현재 PR을 재평가한다. 검증이나 리뷰를 우회하지 않으며, 안전하게 일반 병합할 수 있을 때만 그 경로로 계속한다.
5. Auto merge 설정 후 PR head나 base가 바뀌면 변경된 상태와 검증 결과를 다시 평가한다. 더 이상 병합 의도가 검증되지 않아 작업을 멈춰야 한다면 예약된 auto merge를 해제하고 그 결과를 확인한다.
6. CI 실패, 필수 리뷰 미충족, 충돌, 권한 부족 등으로 병합을 완료하지 못하면 PR과 사용자 작업을 보존하고 확인된 차단 원인을 알린다. 예약만 살아 있는 상태를 완료라고 주장하지 않는다.
7. 두 경로 모두 GitHub가 `MERGED`를 보고하기 전에는 병합 후 정리나 이슈 동기화를 하지 않는다. 병합 후 작업이 실패하면 이미 검증된 병합과 실패한 후속 작업을 구분해 보고한다.
8. 구현 검증은 최소한 다음 경우를 다룬다: auto merge가 허용되고 최신 base 검증과 필수 체크가 강제되는 PR, 최신 base 검증 없이 필수 체크가 대기 중인 PR, 이미 병합 가능한 PR, auto merge가 꺼진 저장소, GitHub에서 필수가 아닌 관련 CI가 대기 중인 PR, 예약 후 head가 변경된 PR. GitHub에 실제 PR을 병합하는 검증은 안전한 테스트 대상에서만 수행한다.

## 확정된 제약과 이유

- Auto merge는 저장소에서 허용해야 하며, 개별 PR에 설정한다. GitHub는 [필수 리뷰와 체크가 충족되면 병합](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/automatically-merging-a-pull-request)한다. 저장소 설정을 켜는 것만으로 모든 PR이 자동 병합되지는 않는다.
- 현재 `gh` 2.100.0은 PR이 이미 병합 가능하면 `--auto`를 받아도 직접 병합한다. [GitHub CLI 구현](https://github.com/cli/cli/blob/v2.100.0/pkg/cmd/pr/merge/merge.go#L593)과 임시 디렉터리에서 실행한 해당 버전의 두 자동화 테스트로 확인했다. 따라서 `--auto`를 단순한 안전 대기 장치로 취급하지 않는다.
- GitHub의 필수 조건은 저장소마다 다르다. 에이전트가 확인해야 하지만 GitHub가 강제하지 않는 검증은 auto merge 설정 전에 끝낸다.
- GitHub가 최신 base 검증을 강제하지 않으면 예약 후 base가 바뀌어도 이전 base에서 통과한 검증으로 병합할 수 있다. 에이전트의 상태 확인만으로 병합 직전의 변경을 원자적으로 막을 수 없으므로 이 경우 일반 병합을 사용한다.
- 사용자의 `merge` 요청은 기존처럼 실제 병합과 후속 정리까지의 결과를 요구한다. Auto merge 예약은 중간 상태다.

## 가정 (수정 가능)

- Auto merge를 사용할 수 없는 저장소에는 기존의 일반 병합 경로가 적합하다.
- 저장소의 필수 병합 조건과 관련 검증은 실행 시점에 확인할 수 있다. 확인할 수 없으면 예약을 앞당기지 않고 검증을 기다린다.

## 범위 밖

- 저장소의 auto merge 설정, branch protection, ruleset, CI 구성을 이 스펙으로 변경하는 일. 저장소 소유자가 별도로 관리한다.
- Merge queue의 도입이나 여러 PR의 병합 순서 지정. Auto merge는 개별 PR의 병합 시점에 관한 기능이다.
- 기존 이슈 동기화, 작업 트리 소유권, 병합 방식 선택 규칙을 변경하는 일.

## 보류한 점

- 없음.

## 남은 위험

- PR의 비필수 검증이 뒤늦게 시작되거나 저장소 규칙이 바뀌면, 예약 전에 확인한 조건과 GitHub가 실제 강제하는 조건이 달라질 수 있다. 구현 시 현재 상태를 다시 확인하고, 예약 후 변경을 감지해야 한다.
- GitHub가 최신 base 검증을 강제하더라도 예약 후 새 비필수 검증이 생길 수 있으므로, PR이 열린 동안 이를 감지하면 예약을 해제하고 검증한다.
- Auto merge를 설정한 뒤 작업이 중단되면 GitHub가 나중에 병합할 수 있으므로, 재개 시 PR의 실제 상태부터 확인해야 한다.

## 조사 및 비파괴 검증

- 2026-09-30 현재 설치된 `gh` 2.100.0과 같은 태그의 GitHub CLI 소스를 작업 트리 밖 임시 디렉터리에서 검사했다. `go test ./pkg/cmd/pr/merge -run '^TestMergeRun_autoMerge' -count=1 -v`의 두 테스트가 통과했다: `BLOCKED` PR은 auto merge 설정 요청을 보내고, `CLEAN` PR은 직접 병합 요청을 보낸다. 테스트는 모의 GitHub 응답을 사용했으며 실제 PR을 변경하지 않았다.
- 실시간 조회에서 `toy-crane/flyn`은 auto merge가 허용돼 있고 `main`의 필수 상태 체크가 설정돼 있었다. [PR #325](https://github.com/toy-crane/flyn/pull/325)는 auto merge가 설정된 뒤 체크가 끝나 `MERGED`로 전환된 실제 사례다.
- 실시간 조회에서 `toy-crane/skills`는 auto merge가 꺼져 있고 `main`에 적용되는 필수 병합 규칙도 없었다. 저장소 소유자가 설정을 바꾸면 이 상태는 다시 확인해야 한다.
