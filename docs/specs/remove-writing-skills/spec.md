# 글쓰기 스킬 걷어내기

[skill-layout](../../decisions/skill-layout.md)은 배포 그룹의 기준이고, 이번
작업으로 `writing` 그룹이 빠진다.
[document-lifecycles](../../decisions/document-lifecycles.md)는 "Git 기록이
유일한 보관소"라는 규칙을 가진다. 지운 내용을 따로 보관하지 않는 근거다.

## 문제

지금 버전의 글쓰기 스킬(`define-publication`, `define-piece`, `draft-piece`)이
마음에 들지 않는다. 나중에 다시 만들 계획이지만, 그때까지 이 버전이 배포되거나
다른 작업의 기준으로 쓰이면 안 된다.

## 결과

- 플러그인(`toycrane-skills@toycrane`)과 skills.sh(`npx skills add
  toy-crane/skills`) 어느 쪽으로 설치해도 글쓰기 스킬 세 개가 오지 않는다.
- 이 저장소에서 작업할 때도 Claude Code와 Codex 어느 쪽에서도 세 스킬을
  부를 수 없다.
- 저장소의 살아 있는 문서(README, 매니페스트, skills.sh 그룹, 에이전트 지침,
  결정 문서, 용어집)에 세 스킬 이름, `writing` 그룹, 이 버전의 글쓰기 개념이
  남지 않는다.
- 이미 플러그인을 설치한 사용자는 업데이트를 받으면 세 스킬이 사라진다.

## 범위

- 세 스킬의 폴더 전체(본문, eval, 참조 문서, `agents/openai.yaml`).
- 배포 연결: 플러그인 `skills` 목록, 두 에이전트용 심볼릭 링크, skills.sh의
  "Writing" 그룹, 플러그인과 마켓플레이스의 설명 문구와 키워드.
- README의 글쓰기 파이프라인 절과, 첫머리 소개에서 글쓰기를 언급한 부분.
- 이 버전의 설계를 담은 프로젝트 문서:
  - `writing-workflow` 결정 문서와 결정 색인의 해당 줄
  - 용어집의 Publication, Piece, Brief, Reader question 항목
  - skill-naming의 글쓰기 스킬 이름 결정
  - document-lifecycles의 `docs/publications/`, `docs/briefs/` 수명 규칙과,
    `maintain-project-context` 범위 목록에 든 "publication premises",
    "published brief folders"
  - skill-layout의 `writing` 그룹(설정된 그룹 목록, 근거, 기각된 대안)
  - `CLAUDE.md`와 `AGENTS.md`가 나열하는 그룹 목록의 `writing`

## 수용 기준

- `skills/` 아래에 글쓰기 스킬 폴더가 없고, `.agents/skills/`와
  `.claude/skills/`에 세 스킬을 가리키는 링크가 없다.
- 플러그인 `skills` 목록에 세 스킬이 없고, `claude plugin validate . --strict`가
  통과한다.
- 플러그인 `version`이 올라가 있다.
- 저장소 전체에서 `define-publication`, `define-piece`, `draft-piece`,
  `skills/writing`, `writing-workflow`를 검색하면 아래 "남기는 것"에 적은
  위치 말고는 나오지 않는다.
- 용어집과 결정 문서에 Publication, Piece, Brief, Reader question이 글쓰기
  개념으로 정의돼 있지 않다.
- 지운 결정 문서를 가리키던 링크가 하나도 깨지지 않는다.

## 정해진 제약과 근거

- 보관 폴더나 "나중에 되살릴 것" 메모를 만들지 않는다. 다시 작업할 때는
  Git 기록에서 꺼내 본다. 마음에 들지 않는 설계가 문서로 남아 있으면 다음
  설계의 기준처럼 읽히기 때문이다.
- 설계 문서까지 지우는 것은 사용자가 확인한 결정이다.
- 결정 문서를 지우는 일은 새 결정 계약이 아니다. 다시 쓸 일반 규칙이 아니라
  이번 작업에만 해당하는 선택이라 이 spec에만 둔다.

## 남기는 것과 이유

- `.agents/skills/writing-great-skills`와 그 링크: 이름에 "writing"이 들어
  있을 뿐, 스킬을 쓰는 법에 관한 별개의 내부 스킬이다.
- README의 `define-product` 흐름도에 있는 "writing already requested?": 글쓰기
  스킬이 아니라 `PRODUCT.md`를 쓰는 시점을 가리킨다.
- `docs/specs/required-skills/spec.md`의 세 스킬 언급: 이미 배포된(#128)
  spec이다. 고치지 않고, 그 폴더를 정리할 때 `maintain-project-context`가
  함께 처리한다.
- 다른 스킬 본문: 확인해 보니 세 스킬에 기대는 스킬이 없다.

## 가정

- 버전은 0.x의 다음 minor(0.67.0)로 올린다. 바꾸기 쉬운 선택이다.
- 플러그인과 마켓플레이스 설명 문구는 글쓰기 언급만 빼고 나머지 표현은 그대로
  둔다.

## 미룬 것

- 새 글쓰기 스킬의 모양과 이름. 다시 작업할 때 새로 정한다.

## 남은 위험

- skills.sh로 설치한 프로젝트는 다음에 `update-project-skills`를 돌리면 세
  스킬이 제거된다. 의도한 동작이지만, 그 프로젝트에 있던
  `docs/publications/`, `docs/briefs/` 파일은 읽어 줄 스킬 없이 남는다.
- `npx skills add`로 한 스킬씩 직접 설치한 프로젝트는 스스로 지우기 전까지
  이전 버전을 그대로 가진다.
- `main`에 합쳐지기 전까지는 두 배포 경로 모두 여전히 세 스킬을 내보낸다.
