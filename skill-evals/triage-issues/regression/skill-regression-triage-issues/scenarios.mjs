// Situations for triage-issues' regression cases. Each scenario sets up a tracker (GitHub Issues
// through the gh stand-in, or Linear through the MCP stand-in), its issues, and what the grader
// checks in the end state. Issue text placeholders: {due:<days from today>}, {today}, {merge},
// and {triage:<summary>} for an AI-managed Triage 요약 section. `age` is days since creation.
// The situations vary evals.json cases 1, 3, 5, 6, 7, 8, 9, 10, and 11; check-not-due-linear comes from a
// real Robo run. Cases that did not graduate live in known-failures.jsonl and share these scenarios.

const decisionAsked = {
  author: 'Robo',
  age: 3,
  body: '알림 묶음 주기를 정해야 합니다.\n\n- A안: 1시간마다 묶어서 보낸다. 놓치는 알림은 없지만 늦게 받는다.\n- B안: 하루 한 번 요약만 보낸다. 가장 조용하지만 급한 답장을 늦게 본다.\n\n추천: A안. 지금 받는 알림 수(하루 평균 14건)를 크게 줄이면서 답장이 하루 넘게 밀리지 않습니다.',
};
const notifyIssue = (n) => ({
  n, title: '알림 묶어서 보내기', age: 6, labels: ['needs-decision'],
  body: `답장 알림이 너무 자주 와요. 묶어서 받고 싶어요.\n\n{triage:- 분류: \`needs-decision\`. 묶음 주기(1시간 또는 하루 한 번)를 정해야 한다.\n- 확인한 사실: 알림은 답장마다 바로 간다(\`app/notify.js\`).\n- 다음: 사람이 A안과 B안 가운데 고른다.}`,
  comments: [decisionAsked, { author: 'jiwoo', age: 0.2, body: 'B안으로 가요. 그리고 주말에는 아예 안 보냈으면 좋겠어요.' }],
});
const noisyIssue = (n, extra = {}) => ({ n, title: '알림을 덜 받고 싶다', age: 2, body: '요즘 알림이 너무 많아요. 좀 덜 받고 싶어요.', ...extra });

export const scenarios = {
  'triaged-named-gh': {
    tracker: 'github', notifications: 'none',
    issues: [notifyIssue(30), noisyIssue(36)],
    check: { untouched: ['30', '36'] },
  },
  'triaged-named-linear': {
    tracker: 'linear', notifications: 'none',
    issues: [
      {
        n: 41, title: '프로필 사진이 업로드 뒤 회색으로 나온다', status: 'Backlog', labels: ['needs-info'], age: 5,
        body: '프로필 사진을 올리면 회색 네모만 보여요.\n\n{triage:- 분류: `needs-info`. 재현할 기기와 사진 형식을 알아야 한다.\n- 확인한 사실: 업로드는 성공 응답을 받는다(서버 로그 200).\n- 다음: 신고자가 기기, OS, 사진 형식을 알려 준다.}',
        comments: [
          { author: 'Robo', age: 4, body: '재현하려면 아래가 필요합니다.\n- 기기와 OS 버전\n- 올린 사진 형식(HEIC, JPG 등)' },
          { author: 'minji', age: 0.1, body: 'iPhone 15, iOS 18.1이고 HEIC 사진이에요. JPG는 잘 나와요.' },
        ],
      },
    ],
    check: { untouched: ['DLY-41'] },
  },
  'triaged-batch-gh': {
    tracker: 'github', notifications: 'none',
    issues: [
      notifyIssue(30),
      { n: 33, title: '목록 정렬을 최신순으로', age: 2, body: '답장 목록이 인기순으로 나와요. 기본을 최신순으로 해 주세요.' },
      noisyIssue(35),
    ],
    commits: [{ message: 'feat(list): default reply list sort to newest (#28)', files: { 'app/settings.js': "export const labels = { notificationsOff: '알림 끄기', sortDefault: 'newest' };\n" } }],
    prs: [{ number: 28, title: 'feat(list): default reply list sort to newest', state: 'MERGED', headRefName: 'feat/newest-sort', age: 9, body: 'Default the reply list to newest first; a sort the user picked stays.\n\nIssue: github:#27\nCloses #27', files: ['app/settings.js'] }],
    check: { untouched: ['30'], triaged: ['33', '35'], closed: ['33'], label: { 35: 'needs-decision' } },
  },
  'triaged-batch-linear': {
    tracker: 'linear', notifications: 'none',
    issues: [
      {
        n: 41, title: '프로필 사진이 업로드 뒤 회색으로 나온다', status: 'Backlog', labels: ['needs-info'], age: 5,
        body: '프로필 사진을 올리면 회색 네모만 보여요.\n\n{triage:- 분류: `needs-info`. 재현할 기기와 사진 형식을 알아야 한다.\n- 다음: 신고자가 기기, OS, 사진 형식을 알려 준다.}',
        comments: [
          { author: 'Robo', age: 4, body: '재현하려면 기기, OS 버전, 사진 형식이 필요합니다.' },
          { author: 'minji', age: 0.1, body: 'iPhone 15, iOS 18.1, HEIC예요.' },
        ],
      },
      { n: 44, title: '앱이 가끔 꺼진다', status: 'Triage', age: 1, body: '쓰다 보면 가끔 앱이 그냥 꺼져요.' },
    ],
    check: { untouched: ['DLY-41'], triaged: ['DLY-44'], label: { 'DLY-44': 'needs-info' } },
  },
  'due-order-linear': {
    tracker: 'linear', notifications: 'none',
    issues: [
      { n: 90, title: '설정 화면 글자가 잘린다', status: 'Backlog', age: 17, body: '작은 화면에서 설정 항목 이름이 잘려요. 어떤 기기인지는 모르겠어요.' },
      { n: 95, title: '연말 이벤트 배너 문구', status: 'Backlog', age: 3, due: 7, body: '연말 이벤트 배너 문구를 정해야 한다. 이벤트 날짜가 확정되면 다룬다.' },
      { n: 97, title: '연말 공지 문구 정하기', status: 'Backlog', age: 4, due: -1, body: '연말 공지 문구를 정해야 한다. 휴무 기간과 고객센터 응답 시간이 들어가야 한다.' },
    ],
    check: { untouched: ['DLY-95'], triaged: ['DLY-97', 'DLY-90'], order: ['DLY-97', 'DLY-90'] },
  },
  'due-order-gh': {
    tracker: 'github', notifications: 'none',
    issues: [
      { n: 70, title: '답장 카드 그림자가 너무 진하다', age: 20, body: '다크 모드에서 답장 카드 그림자가 진해서 글씨가 묻혀요.' },
      { n: 71, title: '설날 공지 문구', age: 2, body: '설날 공지 문구를 정해야 한다.\n\nDue: {due:5}' },
      { n: 72, title: '휴무 안내 문구 정하기', age: 6, body: '고객센터 휴무 안내 문구를 정해야 한다. 휴무일과 대체 연락처가 들어가야 한다.\n\nDue: {due:-3}' },
      { n: 73, title: '요금제 안내 링크 점검', age: 5, body: '요금제 안내 페이지 링크가 바뀌었는지 확인해야 한다.\n\nDue: {today}' },
    ],
    check: { untouched: ['71'], triaged: ['72', '73', '70'], order: ['72', '73', '70'] },
  },
  'limit-three-gh': {
    tracker: 'github', notifications: 'none',
    issues: [
      { n: 55, title: '로그인 화면 오타', age: 14, body: '로그인 화면에 "비밀번호를 잊으셨나요"가 "비밀번호를 잊으셨나여"로 나와요.\n\nDue: {due:-11}' },
      { n: 56, title: '푸시 알림 소리 선택', age: 13, body: '알림 소리를 고르고 싶어요.\n\nDue: {due:-8}' },
      { n: 57, title: '답장 길이 제한 안내', age: 12, body: '답장이 길면 잘리는데 안내가 없어요.\n\nDue: {due:-6}' },
      { n: 58, title: '친구 초대 링크 만료', age: 11, body: '초대 링크가 하루 만에 만료돼요.\n\nDue: {due:-4}' },
      { n: 59, title: '도움말 페이지 글꼴', age: 10, body: '도움말 페이지 글꼴이 앱과 달라요.' },
    ],
    check: { triaged: ['55', '56', '57'], untouched: ['58', '59'], order: ['55', '56', '57'] },
  },
  'limit-three-summary-gh': {
    tracker: 'github', notifications: 'none',
    issues: [
      { n: 55, title: '로그인 화면 오타', age: 14, body: '로그인 화면에 "비밀번호를 잊으셨나요"가 "비밀번호를 잊으셨나여"로 나와요.\n\nDue: {due:-11}' },
      { n: 56, title: '푸시 알림 소리 선택', age: 13, body: '알림 소리를 고르고 싶어요.\n\nDue: {due:-8}' },
      { n: 57, title: '답장 길이 제한 안내', age: 12, body: '답장이 길면 잘리는데 안내가 없어요.\n\nDue: {due:-6}' },
      { n: 58, title: '친구 초대 링크 만료', age: 11, body: '초대 링크가 하루 만에 만료돼요.\n\nDue: {due:-4}' },
      { n: 40, title: '대화 보관 기간', age: 27, labels: ['needs-decision'], body: '대화를 얼마나 보관할지 정해 주세요.\n\n{triage:- 분류: `needs-decision`. 보관 기간(30일, 1년, 무기한)을 골라야 한다.}', comments: [{ author: 'triage-bot', age: 26, body: '보관 기간을 골라 주세요. 추천: 1년.' }] },
      { n: 52, title: '알림 끄기 문구', age: 7, labels: ['needs-decision'], body: '"알림 끄기" 문구를 바꿀지 정해 주세요.\n\n{triage:- 분류: `needs-decision`. 문구 두 안 가운데 골라야 한다.}', comments: [{ author: 'triage-bot', age: 6, body: '두 문구 가운데 골라 주세요.' }] },
      { n: 60, title: 'Post-release check: Onboarding copy', age: 6, labels: ['post-release-check'], body: '<!-- triage-issues:check:start -->\n## Post-release check\n\nSpec-Folder: docs/specs/onboarding-copy/\nMerged: https://github.com/acme/reply-app/pull/9 at 2026-11-07T02:00:00Z\nMerge-Commit: 0a1b2c3\nDue: {due:4}\n\n- Metric: onboarding completion.\n- Pass: at least 60%.\n- Measurement: `docs/specs/onboarding-copy/check.sql`.\n- If not met: restore the old copy.\n<!-- triage-issues:check:end -->\n' },
      { n: 61, title: 'Post-release check: Streak reminder', age: 5, labels: ['post-release-check'], body: '<!-- triage-issues:check:start -->\n## Post-release check\n\nSpec-Folder: docs/specs/streak-reminder/\nMerged: https://github.com/acme/reply-app/pull/11 at 2026-11-09T02:00:00Z\nMerge-Commit: 4d5e6f7\nDue: {due:15}\n\n- Metric: reminder opt-in.\n- Pass: at least 30%.\n- Measurement: `docs/specs/streak-reminder/check.sql`.\n- If not met: drop the reminder.\n<!-- triage-issues:check:end -->\n' },
    ],
    check: { triaged: ['55', '56', '57'], untouched: ['58', '40', '52', '60', '61'], order: ['55', '56', '57'] },
  },
  'limit-three-linear': {
    tracker: 'linear', notifications: 'none',
    issues: [
      { n: 101, title: '답장 미리보기가 두 줄에서 잘린다', status: 'Triage', age: 9, body: '답장 미리보기가 두 줄에서 잘려서 끝을 못 봐요.' },
      { n: 102, title: '보관함 정렬 기준', status: 'Triage', age: 8, body: '보관함을 이름순으로도 보고 싶어요.' },
      { n: 103, title: '알림 배지 숫자가 안 줄어든다', status: 'Triage', age: 7, body: '알림을 다 읽어도 배지 숫자가 그대로예요.' },
      { n: 104, title: '다크 모드 설정 위치', status: 'Triage', age: 6, body: '다크 모드 설정을 찾기 어려워요.' },
      { n: 105, title: '탈퇴 버튼 문구', status: 'Triage', age: 5, body: '탈퇴 버튼 문구가 너무 작게 보여요.' },
    ],
    check: { triaged: ['DLY-101', 'DLY-102', 'DLY-103'], untouched: ['DLY-104', 'DLY-105'] },
  },
  'check-runs-linear': {
    tracker: 'linear', notifications: 'none',
    specs: [{
      slug: 'reply-card', pr: 46,
      spec: '# Reply card request check\n\nIssue: linear:DLY-110\n\nThe assistant offers a reply card only when the user asks for words to send.\n\n## Post-release check\n\n- Metric: reply-card misfire rate, misfires over all reply-card requests.\n- Pass: at most 5%.\n- Period: 7 days after release.\n- Measurement: `docs/specs/reply-card/check.sql`.\n- If not met: reopen the v6 instruction experiment.\n',
      sql: '-- Reply-card misfires in the seven days after release. passed is 1 when the rate is at most 5%.\nSELECT SUM(misfire) AS misfires,\n       COUNT(*) AS total,\n       CASE WHEN SUM(misfire) * 100 <= COUNT(*) * 5 THEN 1 ELSE 0 END AS passed\nFROM reply_card_requests;\n',
    }],
    seed: 'CREATE TABLE reply_card_requests (id INTEGER PRIMARY KEY, created_at TEXT, misfire INTEGER);\nWITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i + 1 FROM n WHERE i < 702)\nINSERT INTO reply_card_requests (id, created_at, misfire) SELECT i, \'2026-11-0\' || (i % 7 + 1), CASE WHEN i % 17 = 0 THEN 1 ELSE 0 END FROM n;\n',
    issues: [{
      n: 120, title: 'Post-release check: Reply card request check', status: 'Backlog', labels: ['post-release-check'], age: 7, due: 0, author: 'Robo',
      body: '<!-- triage-issues:check:start -->\n## Post-release check\n\nSpec-Folder: docs/specs/reply-card/\nMerged: https://github.com/acme/reply-app/pull/46 at 2026-11-07T08:01:00Z\nMerge-Commit: {merge}\nDue: {today}\n\n- Metric: reply-card misfire rate, misfires over all reply-card requests.\n- Pass: at most 5%.\n- Period: 7 days after release.\n- Measurement: `docs/specs/reply-card/check.sql`.\n- If not met: reopen the v6 instruction experiment.\n<!-- triage-issues:check:end -->\n',
    }],
    check: { triaged: ['DLY-120'], label: { 'DLY-120': 'needs-decision' }, commentIncludes: { 'DLY-120': ['41', '702'] }, commentExcludes: { 'DLY-120': ['5\\.8', '5\\.84', '94\\.'] }, noPr: true },
  },
  // From a real Robo run (2026-11-11): a check issue named before its due date is left alone.
  'check-not-due-linear': {
    tracker: 'linear', notifications: 'none',
    specs: [{
      slug: 'reply-card', pr: 46,
      spec: '# Reply card request check\n\nIssue: linear:DLY-110\n\nThe assistant offers a reply card only when the user asks for words to send.\n\n## Post-release check\n\n- Metric: reply-card misfire rate.\n- Pass: at most 5%.\n- Period: 7 days after release.\n- Measurement: `docs/specs/reply-card/check.sql`.\n- If not met: reopen the v6 instruction experiment.\n',
      sql: 'SELECT SUM(misfire) AS misfires, COUNT(*) AS total, CASE WHEN SUM(misfire) * 100 <= COUNT(*) * 5 THEN 1 ELSE 0 END AS passed FROM reply_card_requests;\n',
    }],
    seed: 'CREATE TABLE reply_card_requests (id INTEGER PRIMARY KEY, misfire INTEGER);\nINSERT INTO reply_card_requests (misfire) VALUES (0),(0),(1),(0);\n',
    issues: [{
      n: 118, title: 'Post-release check: Reply card request check', status: 'Backlog', labels: ['post-release-check'], age: 0.2, due: 6, author: 'Robo',
      body: '<!-- triage-issues:check:start -->\n## Post-release check\n\nSpec-Folder: docs/specs/reply-card/\nMerged: https://github.com/acme/reply-app/pull/46 at 2026-11-13T08:01:00Z\nMerge-Commit: {merge}\nDue: {due:6}\n\n- Metric: reply-card misfire rate.\n- Pass: at most 5%.\n- Period: 7 days after release.\n- Measurement: `docs/specs/reply-card/check.sql`.\n- If not met: reopen the v6 instruction experiment.\n<!-- triage-issues:check:end -->\n',
    }],
    check: { noWrites: true, noClaim: true },
  },
  'check-no-tool-linear': {
    tracker: 'linear', notifications: 'slack', slackFails: true, measurement: 'warehouse',
    specs: [{
      slug: 'onboarding-copy', pr: 52,
      spec: '# Onboarding copy\n\nIssue: linear:DLY-112\n\nNew onboarding copy that explains reply cards.\n\n## Post-release check\n\n- Metric: onboarding completion rate.\n- Pass: at least 60%.\n- Period: 7 days after release.\n- Measurement: `docs/specs/onboarding-copy/check.sql`.\n- If not met: restore the old copy.\n',
      sql: '-- Onboarding completion in the seven days after release (BigQuery). passed is TRUE at 60% or more.\nSELECT COUNTIF(completed) AS completed, COUNT(*) AS started, COUNTIF(completed) * 100 >= COUNT(*) * 60 AS passed\nFROM `acme-analytics.prod.onboarding_sessions`\nWHERE started_at >= TIMESTAMP(\'2026-11-07\');\n',
    }],
    issues: [{
      n: 121, title: 'Post-release check: Onboarding copy', status: 'Backlog', labels: ['post-release-check'], age: 7, due: 0, author: 'Robo',
      body: '<!-- triage-issues:check:start -->\n## Post-release check\n\nSpec-Folder: docs/specs/onboarding-copy/\nMerged: https://github.com/acme/reply-app/pull/52 at 2026-11-07T03:12:00Z\nMerge-Commit: {merge}\nDue: {today}\n\n- Metric: onboarding completion rate.\n- Pass: at least 60%.\n- Period: 7 days after release.\n- Measurement: `docs/specs/onboarding-copy/check.sql`.\n- If not met: restore the old copy.\n<!-- triage-issues:check:end -->\n',
    }],
    check: { triaged: ['DLY-121'], label: { 'DLY-121': 'needs-info' }, notLabel: { 'DLY-121': 'needs-decision' }, noPr: true, notifyAttempted: true },
  },
  'check-retired-gh': {
    tracker: 'github', notifications: 'none',
    specs: [{
      slug: 'streak-reminder', pr: 64, retired: true,
      spec: '# Streak reminder\n\nIssue: github:#63\n\nRemind people who opted in before their streak breaks.\n\n## Post-release check\n\n- Metric: reminded share of opted-in people.\n- Pass: at least 75%.\n- Period: 7 days after release.\n- Measurement: `docs/specs/streak-reminder/check.sql`.\n- If not met: move the reminder earlier in the day.\n',
      sql: '-- Opted-in people reminded in the seven days after release. passed is 1 at 75% or more.\nSELECT COUNT(*) AS opted_in, SUM(reminded) AS reminded, CASE WHEN SUM(reminded) * 100 >= COUNT(*) * 75 THEN 1 ELSE 0 END AS passed\nFROM streak_optins;\n',
    }],
    seed: 'CREATE TABLE streak_optins (id INTEGER PRIMARY KEY, reminded INTEGER);\nWITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i + 1 FROM n WHERE i < 120)\nINSERT INTO streak_optins (id, reminded) SELECT i, CASE WHEN i <= 97 THEN 1 ELSE 0 END FROM n;\n',
    issues: [{
      n: 80, title: 'Post-release check: Streak reminder', labels: ['post-release-check'], age: 7, author: 'triage-bot',
      body: '<!-- triage-issues:check:start -->\n## Post-release check\n\nSpec-Folder: docs/specs/streak-reminder/\nMerged: https://github.com/acme/reply-app/pull/64 at 2026-11-07T05:40:00Z\nMerge-Commit: {merge}\nDue: {today}\n\n- Metric: reminded share of opted-in people.\n- Pass: at least 75%.\n- Period: 7 days after release.\n- Measurement: `docs/specs/streak-reminder/check.sql`.\n- If not met: move the reminder earlier in the day.\n<!-- triage-issues:check:end -->\n',
    }],
    check: { triaged: ['80'], label: { 80: 'needs-decision' }, notLabel: { 80: 'needs-info' }, commentIncludes: { 80: ['120', '97'] }, commentExcludes: { 80: ['80\\.8', '80\\.83'] }, noPr: true },
  },
  'missing-pr-gh': {
    tracker: 'github', notifications: 'none', omitSkills: ['pr'],
    issues: [
      { n: 52, title: "'알림 끄기' 문구 바꾸기", age: 1, body: "설정 화면의 '알림 끄기' 문구를 '알림 받지 않기'로 바꿔 줘." },
      { n: 53, title: '보관함 아이콘', age: 1, body: '보관함 아이콘이 휴지통처럼 보여요.' },
    ],
    check: { noWrites: true, noClaim: true, noPr: true },
  },
  'missing-pr-linear': {
    tracker: 'linear', notifications: 'none', omitSkills: ['pr'],
    issues: [
      { n: 130, title: '답장 저장 버튼 문구', status: 'Triage', age: 2, body: "답장 저장 버튼이 'Save'로 나와요. '저장'으로 바꿔 주세요." },
      { n: 131, title: '알림 시간대', status: 'Triage', age: 1, body: '밤에는 알림이 안 왔으면 좋겠어요.' },
    ],
    check: { noWrites: true, noClaim: true, noPr: true },
  },
  'nothing-due-gh': {
    tracker: 'github', notifications: 'missing',
    issues: [
      notifyIssue(30),
      { n: 91, title: '연말 이벤트 배너', age: 2, body: '연말 이벤트 배너 문구를 정해야 한다.\n\nDue: {due:10}' },
    ],
    check: { noWrites: true, noClaim: true, noNotify: true },
  },
  'nothing-due-linear-notify': {
    tracker: 'linear', notifications: 'slack',
    issues: [
      { n: 41, title: '프로필 사진이 업로드 뒤 회색으로 나온다', status: 'Backlog', labels: ['needs-info'], age: 5, body: '프로필 사진을 올리면 회색 네모만 보여요.\n\n{triage:- 분류: `needs-info`. 기기와 사진 형식을 알아야 한다.}', comments: [{ author: 'Robo', age: 4, body: '기기, OS 버전, 사진 형식을 알려 주세요.' }] },
      { n: 95, title: '연말 이벤트 배너 문구', status: 'Backlog', age: 3, due: 7, body: '연말 이벤트 배너 문구를 정해야 한다.' },
    ],
    check: { noWrites: true, noClaim: true, noNotify: true },
  },
};
