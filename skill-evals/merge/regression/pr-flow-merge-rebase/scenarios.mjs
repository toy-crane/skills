// The fixed situations behind cases.jsonl, one per case id. fixtures.mjs builds
// each one; grade.mjs reads `check` to decide what the end state must show.

const sortTest = (mod, fn) => `import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ${fn} } from '../src/${mod}.js';

test('${fn} puts the newest entry first', () => {
  const out = ${fn}([{ at: 1 }, { at: 3 }, { at: 2 }]);
  assert.deepEqual(out.map((e) => e.at), [3, 2, 1]);
});
`;

export const scenarios = {
  // 1. Earlier conflict resolution dropped a change ------------------------------
  'dropped-http-timeout': {
    builder: 'dropped',
    check: { kind: 'dropped', file: 'src/http.js', mustContain: '60000', branch: 'feat/http-timeout' },
    file: 'src/http.js', testName: 'http', slug: 'http-timeout', branch: 'feat/http-timeout', number: 12,
    title: 'HTTP 타임아웃과 재시도', criteria: ['API 요청 타임아웃은 60초다.', '실패한 요청은 두 번까지 다시 시도한다.'],
    before: `export const config = {\n  baseUrl: 'https://api.example.com',\n  timeoutMs: 30000,\n  retries: 0,\n};\n`,
    prVersion: `export const config = {\n  baseUrl: 'https://api.example.com',\n  timeoutMs: 60000,\n  retries: 2,\n};\n`,
    mainVersion: `const DEFAULT_TIMEOUT_MS = 30000;\n\nexport const config = {\n  baseUrl: 'https://api.example.com',\n  timeoutMs: DEFAULT_TIMEOUT_MS,\n  retries: 0,\n};\n`,
    badResolution: `const DEFAULT_TIMEOUT_MS = 30000;\n\nexport const config = {\n  baseUrl: 'https://api.example.com',\n  timeoutMs: DEFAULT_TIMEOUT_MS,\n  retries: 2,\n};\n`,
    test: `import { test } from 'node:test';\nimport assert from 'node:assert/strict';\nimport { config } from '../src/http.js';\n\ntest('config has a base URL', () => {\n  assert.match(config.baseUrl, /^https:/);\n});\n`,
    readme: '# app\n\nAPI 요청은 60초 뒤 타임아웃되고, 실패하면 두 번 다시 시도합니다.\n',
    prSubject: 'feat(http): raise the timeout to 60s and retry twice', mainSubject: 'refactor(http): name the default timeout',
    prTitle: 'feat(http): raise the timeout to 60s and retry twice',
    prBody: '## 요약\n\n- API 요청 타임아웃을 30초에서 60초로 늘립니다.\n- 실패한 요청을 두 번까지 다시 시도합니다.\n- README에 설정을 적었습니다.\n',
  },
  'dropped-upload-limit': {
    builder: 'dropped',
    check: { kind: 'dropped', file: 'src/upload.js', mustContain: '25', branch: 'feat/upload-limit' },
    file: 'src/upload.js', testName: 'upload', slug: 'upload-limit', branch: 'feat/upload-limit', number: 18,
    title: '업로드 크기와 형식', criteria: ['사진은 25MB까지 올릴 수 있다.', 'webp 사진도 올릴 수 있다.'],
    before: `export const uploadRules = {\n  bucket: 'photos',\n  maxSizeMb: 10,\n  allowedTypes: ['png', 'jpg'],\n};\n`,
    prVersion: `export const uploadRules = {\n  bucket: 'photos',\n  maxSizeMb: 25,\n  allowedTypes: ['png', 'jpg', 'webp'],\n};\n`,
    mainVersion: `const MAX_SIZE_MB = 10;\n\nexport const uploadRules = {\n  bucket: 'photos',\n  maxSizeMb: MAX_SIZE_MB,\n  allowedTypes: ['png', 'jpg'],\n};\n`,
    badResolution: `const MAX_SIZE_MB = 10;\n\nexport const uploadRules = {\n  bucket: 'photos',\n  maxSizeMb: MAX_SIZE_MB,\n  allowedTypes: ['png', 'jpg', 'webp'],\n};\n`,
    test: `import { test } from 'node:test';\nimport assert from 'node:assert/strict';\nimport { uploadRules } from '../src/upload.js';\n\ntest('uploads go to the photos bucket', () => {\n  assert.equal(uploadRules.bucket, 'photos');\n});\n`,
    readme: '# app\n\n사진은 25MB까지, png·jpg·webp 형식으로 올릴 수 있습니다.\n',
    prSubject: 'feat(upload): allow 25MB webp photos', mainSubject: 'refactor(upload): name the size limit',
    prTitle: 'feat(upload): allow 25MB webp photos',
    prBody: '## 요약\n\n- 사진 업로드 한도를 10MB에서 25MB로 올립니다.\n- webp 형식을 허용합니다.\n',
  },

  // 2. A clean rebase re-adds what main already has ------------------------------
  'duplicate-export-menu': {
    builder: 'duplicate',
    check: { kind: 'duplicate', file: 'src/menu.js', needle: "path: '/export'", branch: 'feat/export-page' },
    file: 'src/menu.js', testName: 'menu', slug: 'export-page', branch: 'feat/export-page', number: 21,
    title: '내보내기 화면', criteria: ['메뉴에 내보내기 항목이 하나 보인다.', '내보내기 화면은 노트를 CSV로 내려받게 한다.'],
    before: `export const menu = [\n  { path: '/notes', label: 'Notes' },\n  { path: '/settings', label: 'Settings' },\n];\n`,
    prVersion: `export const menu = [\n  { path: '/notes', label: 'Notes' },\n  { path: '/export', label: 'Export' },\n  { path: '/settings', label: 'Settings' },\n];\n`,
    prExtraFiles: { 'src/export.js': `export function toCsv(notes) {\n  return notes.map((n) => \`\${n.id},\${JSON.stringify(n.title)}\`).join('\\n');\n}\n` },
    mainVersion: `export const menu = [\n  { path: '/notes', label: 'Notes' },\n  { path: '/settings', label: 'Settings' },\n  { path: '/export', label: 'Export' },\n];\n`,
    test: `import { test } from 'node:test';\nimport assert from 'node:assert/strict';\nimport { menu } from '../src/menu.js';\n\ntest('menu starts with notes', () => {\n  assert.equal(menu[0].path, '/notes');\n});\n`,
    prSubject: 'feat(export): add the export page and its menu entry', mainSubject: 'feat(menu): add the export entry for the export flow (#19)',
    prTitle: 'feat(export): add the export page and its menu entry',
    prBody: '## 요약\n\n- 노트를 CSV로 내려받는 내보내기 화면을 더합니다.\n- 메뉴에 내보내기 항목을 더합니다.\n',
  },
  'duplicate-report-permission': {
    builder: 'duplicate',
    check: { kind: 'duplicate', file: 'src/permissions.js', needle: "'reports:read'", branch: 'feat/editor-reports' },
    file: 'src/permissions.js', testName: 'permissions', slug: 'editor-reports', branch: 'feat/editor-reports', number: 27,
    title: '편집자의 리포트 열람', criteria: ['편집자는 리포트를 볼 수 있다.', '편집자 권한 목록에 같은 권한이 두 번 들어가지 않는다.'],
    before: `export const roles = {\n  editor: [\n    'notes:read',\n    'notes:write',\n  ],\n  viewer: ['notes:read'],\n};\n`,
    prVersion: `export const roles = {\n  editor: [\n    'reports:read',\n    'notes:read',\n    'notes:write',\n  ],\n  viewer: ['notes:read'],\n};\n`,
    prExtraFiles: { 'src/reports.js': `import { roles } from './permissions.js';\n\nexport const canReadReports = (role) => roles[role]?.includes('reports:read') ?? false;\n` },
    mainVersion: `export const roles = {\n  editor: [\n    'notes:read',\n    'notes:write',\n    'reports:read',\n  ],\n  viewer: ['notes:read'],\n};\n`,
    test: `import { test } from 'node:test';\nimport assert from 'node:assert/strict';\nimport { roles } from '../src/permissions.js';\n\ntest('viewers can read notes', () => {\n  assert.ok(roles.viewer.includes('notes:read'));\n});\n`,
    prSubject: 'feat(reports): let editors read reports', mainSubject: 'feat(permissions): give editors report access for the dashboard (#24)',
    prTitle: 'feat(reports): let editors read reports',
    prBody: '## 요약\n\n- 편집자 역할에 리포트 열람 권한을 줍니다.\n- 리포트 화면이 그 권한으로 접근을 판단합니다.\n',
  },

  // 3. No conflict, but main changed a default the PR relies on ------------------
  'semantic-page-size': {
    builder: 'incoming',
    check: { kind: 'semantic', branch: 'feat/weekly-report', probe: "import('./src/weekly-report.js').then((m) => { const out = m.firstPage(Array.from({ length: 100 }, (_, i) => ({ at: i }))); console.log(out.length); })", expect: '20' },
    slug: 'weekly-report', branch: 'feat/weekly-report', number: 31,
    title: '주간 리포트', criteria: ['주간 리포트는 최신 항목부터 보여 준다.', '주간 리포트 첫 페이지는 20건을 보여 준다.'],
    seed: {
      'src/paginate.js': `export const DEFAULT_PAGE_SIZE = 20;\n\nexport function paginate(items, size = DEFAULT_PAGE_SIZE) {\n  return items.slice(0, size);\n}\n`,
      'src/list.js': `import { paginate } from './paginate.js';\n\nexport const listPage = (notes) => paginate(notes);\n`,
    },
    prCommits: [[{
      'src/weekly-report.js': `import { paginate } from './paginate.js';\n\nexport function firstPage(entries) {\n  const sorted = [...entries].sort((a, b) => b.at - a.at);\n  return paginate(sorted);\n}\n`,
      'test/weekly-report.test.js': sortTest('weekly-report', 'firstPage'),
    }, 'feat(report): add the weekly report first page']],
    mainCommits: [[{ 'src/paginate.js': `export const DEFAULT_PAGE_SIZE = 50;\n\nexport function paginate(items, size = DEFAULT_PAGE_SIZE) {\n  return items.slice(0, size);\n}\n` }, 'feat(list): show 50 notes per page (#29)']],
    prTitle: 'feat(report): add the weekly report first page',
    prBody: '## 요약\n\n- 주간 리포트 첫 페이지를 더합니다. 최신 항목부터 20건을 보여 줍니다.\n\n## 확인\n\n- `npm test` 통과\n',
  },
  'semantic-retry-attempts': {
    builder: 'incoming',
    check: { kind: 'semantic', branch: 'feat/sync-job', probe: "import('./src/sync-job.js').then(async (m) => { let n = 0; await m.runSync(async () => { n += 1; throw new Error('down'); }).catch(() => {}); console.log(n); })", expect: '3' },
    slug: 'sync-job', branch: 'feat/sync-job', number: 36,
    title: '백그라운드 동기화', criteria: ['동기화가 실패하면 최대 3번까지 시도한다.', '세 번 모두 실패하면 오류를 남긴다.'],
    seed: {
      'src/retry.js': `export const DEFAULT_ATTEMPTS = 3;\n\nexport async function withRetry(fn, attempts = DEFAULT_ATTEMPTS) {\n  let last;\n  for (let i = 0; i < attempts; i += 1) {\n    try { return await fn(); } catch (error) { last = error; }\n  }\n  throw last;\n}\n`,
      'src/save.js': `import { withRetry } from './retry.js';\n\nexport const save = (fn) => withRetry(fn);\n`,
    },
    prCommits: [[{
      'src/sync-job.js': `import { withRetry } from './retry.js';\n\nexport async function runSync(push) {\n  try {\n    return await withRetry(push);\n  } catch (error) {\n    console.error('sync failed', error.message);\n    throw error;\n  }\n}\n`,
      'test/sync-job.test.js': `import { test } from 'node:test';\nimport assert from 'node:assert/strict';\nimport { runSync } from '../src/sync-job.js';\n\ntest('runSync returns what the push returns', async () => {\n  assert.equal(await runSync(async () => 'ok'), 'ok');\n});\n`,
    }, 'feat(sync): add the background sync job']],
    mainCommits: [[{ 'src/retry.js': `export const DEFAULT_ATTEMPTS = 1;\n\nexport async function withRetry(fn, attempts = DEFAULT_ATTEMPTS) {\n  let last;\n  for (let i = 0; i < attempts; i += 1) {\n    try { return await fn(); } catch (error) { last = error; }\n  }\n  throw last;\n}\n` }, 'perf(save): fail fast instead of retrying saves (#33)']],
    prTitle: 'feat(sync): add the background sync job',
    prBody: '## 요약\n\n- 백그라운드 동기화 작업을 더합니다. 실패하면 최대 3번까지 시도하고, 모두 실패하면 오류를 남깁니다.\n',
  },

  // 4. Main gained commits that do not overlap the PR ------------------------------
  'no-overlap-greeting': {
    builder: 'incoming',
    check: { kind: 'clean', branch: 'feat/greeting', file: 'src/greet.js', mustContain: '반가워요' },
    slug: 'greeting', branch: 'feat/greeting', number: 41,
    title: '첫 화면 인사말', criteria: ['첫 화면은 이름과 함께 "반가워요"라고 인사한다.'],
    seed: {
      'src/greet.js': `export const greet = (name) => \`Hello, \${name}\`;\n`,
      'test/greet.test.js': `import { test } from 'node:test';\nimport assert from 'node:assert/strict';\nimport { greet } from '../src/greet.js';\n\ntest('greets by name', () => {\n  assert.match(greet('Mina'), /Mina/);\n});\n`,
      'README.md': '# app\n\nA note app.\n',
    },
    prCommits: [[{ 'src/greet.js': `export const greet = (name) => \`\${name}님, 반가워요\`;\n` }, 'feat(home): greet in Korean']],
    mainCommits: [[{ 'README.md': '# app\n\nA small note-taking app.\n' }, 'docs: describe the app (#38)'], [{ 'docs/guide.md': '# Guide\n\nRun `npm test`.\n' }, 'docs: add a contributor guide (#39)']],
    prTitle: 'feat(home): greet in Korean',
    prBody: '## 요약\n\n- 첫 화면 인사말을 "이름님, 반가워요"로 바꿉니다.\n',
  },
  'no-overlap-currency': {
    builder: 'incoming',
    check: { kind: 'clean', branch: 'feat/krw-format', file: 'src/currency.js', mustContain: 'ko-KR' },
    slug: 'krw-format', branch: 'feat/krw-format', number: 44,
    title: '원화 표시', criteria: ['금액은 원화 형식(예: ₩12,000)으로 보인다.'],
    seed: {
      'src/currency.js': 'export const formatPrice = (n) => `$${n}`;\n',
      'test/currency.test.js': `import { test } from 'node:test';\nimport assert from 'node:assert/strict';\nimport { formatPrice } from '../src/currency.js';\n\ntest('formats a number', () => {\n  assert.equal(typeof formatPrice(1), 'string');\n});\n`,
      'src/cart.js': 'export const total = (items) => items.reduce((n, i) => n + i.price, 0);\n',
    },
    prCommits: [[{ 'src/currency.js': `export const formatPrice = (n) => new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(n);\n` }, 'feat(price): show prices in won']],
    mainCommits: [[{ 'CHANGELOG.md': '# Changelog\n\n- Cart totals.\n' }, 'docs: start a changelog (#42)'], [{ '.editorconfig': 'root = true\n\n[*]\nindent_size = 2\n' }, 'chore: add editorconfig (#43)']],
    prTitle: 'feat(price): show prices in won',
    prBody: '## 요약\n\n- 금액을 원화 형식으로 표시합니다.\n',
  },

  // 5. An overlapping commit lands on main after the agent verified ----------------
  'late-base-export-helper': {
    builder: 'incoming',
    check: { kind: 'late', branch: 'feat/export-trash', file: 'src/export.js' },
    slug: 'export-trash', branch: 'feat/export-trash', number: 51, requireUpToDate: false,
    title: '휴지통 내보내기', criteria: ['휴지통의 노트도 CSV 줄로 내보낼 수 있다.'],
    seed: {
      'src/export.js': `export function toRow(note) {\n  return \`\${note.id},\${JSON.stringify(note.title)}\`;\n}\n\nexport function exportNotes(notes) {\n  return notes.map(toRow).join('\\n');\n}\n`,
      'test/export.test.js': `import { test } from 'node:test';\nimport assert from 'node:assert/strict';\nimport { exportNotes } from '../src/export.js';\n\ntest('exports one row per note', () => {\n  assert.equal(exportNotes([{ id: 1, title: 'a' }]), '1,"a"');\n});\n`,
    },
    prCommits: [[{
      'src/export.js': `export function toRow(note) {\n  return \`\${note.id},\${JSON.stringify(note.title)}\`;\n}\n\nexport function exportNotes(notes) {\n  return notes.map(toRow).join('\\n');\n}\n\nexport function exportTrash(notes) {\n  return notes.filter((n) => n.deleted).map(toRow).join('\\n');\n}\n`,
      'test/export-trash.test.js': `import { test } from 'node:test';\nimport assert from 'node:assert/strict';\nimport { exportTrash } from '../src/export.js';\n\ntest('exports only deleted notes', () => {\n  assert.equal(exportTrash([{ id: 1, title: 'a', deleted: true }, { id: 2, title: 'b' }]), '1,"a"');\n});\n`,
    }, 'feat(export): export notes in the trash']],
    mainCommits: [[{ 'README.md': '# app\n\nNotes with CSV export.\n' }, 'docs: mention CSV export (#48)']],
    inject: {
      message: 'refactor(export): rename toRow to serializeRow (#50)',
      files: { 'src/export.js': `export function serializeRow(note) {\n  return \`\${note.id},\${JSON.stringify(note.title)}\`;\n}\n\nexport function exportNotes(notes) {\n  return notes.map(serializeRow).join('\\n');\n}\n` },
    },
    prTitle: 'feat(export): export notes in the trash',
    prBody: '## 요약\n\n- 휴지통에 있는 노트만 CSV 줄로 내보내는 `exportTrash`를 더합니다.\n\n## 확인\n\n- `npm test` 통과\n',
  },
  'late-base-tax-helper': {
    builder: 'incoming',
    check: { kind: 'late', branch: 'feat/quote-total', file: 'src/pricing.js' },
    slug: 'quote-total', branch: 'feat/quote-total', number: 57, requireUpToDate: false,
    title: '견적 합계', criteria: ['견적 합계는 세금을 포함한다.'],
    seed: {
      'src/pricing.js': `export function applyTax(amount) {\n  return Math.round(amount * 1.1);\n}\n\nexport function lineTotal(line) {\n  return applyTax(line.price * line.qty);\n}\n`,
      'test/pricing.test.js': `import { test } from 'node:test';\nimport assert from 'node:assert/strict';\nimport { lineTotal } from '../src/pricing.js';\n\ntest('a line total includes tax', () => {\n  assert.equal(lineTotal({ price: 100, qty: 2 }), 220);\n});\n`,
    },
    prCommits: [[{
      'src/pricing.js': `export function applyTax(amount) {\n  return Math.round(amount * 1.1);\n}\n\nexport function lineTotal(line) {\n  return applyTax(line.price * line.qty);\n}\n\nexport function quoteTotal(lines) {\n  return applyTax(lines.reduce((n, l) => n + l.price * l.qty, 0));\n}\n`,
      'test/quote.test.js': `import { test } from 'node:test';\nimport assert from 'node:assert/strict';\nimport { quoteTotal } from '../src/pricing.js';\n\ntest('a quote total includes tax', () => {\n  assert.equal(quoteTotal([{ price: 100, qty: 1 }, { price: 50, qty: 2 }]), 220);\n});\n`,
    }, 'feat(quote): add the quote total']],
    mainCommits: [[{ 'docs/pricing.md': '# Pricing\n\nPrices include 10% tax.\n' }, 'docs: describe pricing (#54)']],
    inject: {
      message: 'refactor(pricing): rename applyTax to withTax (#56)',
      files: { 'src/pricing.js': `export function withTax(amount) {\n  return Math.round(amount * 1.1);\n}\n\nexport function lineTotal(line) {\n  return withTax(line.price * line.qty);\n}\n` },
    },
    prTitle: 'feat(quote): add the quote total',
    prBody: '## 요약\n\n- 세금을 포함한 견적 합계 `quoteTotal`을 더합니다.\n\n## 확인\n\n- `npm test` 통과\n',
  },

  // 6. Blocked by a spec folder whose work is not on main yet ----------------------
  'blocked-auth-session': {
    builder: 'blocked',
    check: { kind: 'blocked', branch: 'feat/export-csv' },
    slug: 'export-csv', branch: 'feat/export-csv', number: 61,
    title: 'CSV 내보내기', criteria: ['로그인한 사용자는 자기 노트를 CSV로 내려받는다.'],
    blocker: 'auth-session', blockerTitle: '로그인 세션', blockerCriteria: ['사용자는 이메일로 로그인하고 세션이 유지된다.'],
    blockerBranch: 'feat/auth-session', blockerNumber: 58, blockerSubject: 'feat(auth): keep a login session',
    blockerFiles: { 'src/session.js': 'export const currentUser = (req) => req.session?.user ?? null;\n' },
    blockerPrTitle: 'feat(auth): keep a login session', blockerPrBody: '## 요약\n\n- 이메일 로그인과 세션 유지를 더합니다.',
    seed: { 'src/notes.js': 'export const notesOf = (db, userId) => db.filter((n) => n.owner === userId);\n' },
    prCommits: [[{ 'src/export-csv.js': `import { notesOf } from './notes.js';\n\nexport const exportCsv = (db, user) => notesOf(db, user.id).map((n) => n.title).join('\\n');\n` }, 'feat(export): download your notes as CSV']],
    prTitle: 'feat(export): download your notes as CSV',
    prBody: '## 요약\n\n- 로그인한 사용자가 자기 노트를 CSV로 내려받습니다.\n',
  },
  'blocked-user-settings': {
    builder: 'blocked',
    check: { kind: 'blocked', branch: 'feat/quiet-hours' },
    slug: 'quiet-hours', branch: 'feat/quiet-hours', number: 66,
    title: '방해 금지 시간', criteria: ['사용자가 설정한 방해 금지 시간에는 알림을 보내지 않는다.'],
    blocker: 'user-settings', blockerTitle: '사용자 설정 저장', blockerCriteria: ['사용자 설정이 서버에 저장된다.'],
    blockerBranch: 'feat/user-settings', blockerNumber: 63, blockerSubject: 'feat(settings): store user settings',
    blockerFiles: { 'src/settings.js': 'export const settingsOf = (store, userId) => store[userId] ?? {};\n' },
    blockerPrTitle: 'feat(settings): store user settings', blockerPrBody: '## 요약\n\n- 사용자 설정을 서버에 저장합니다.',
    seed: { 'src/notify.js': 'export const shouldNotify = () => true;\n' },
    prCommits: [[{ 'src/notify.js': `export const shouldNotify = (settings, hour) => {\n  const q = settings.quietHours;\n  return !(q && hour >= q.from && hour < q.to);\n};\n` }, 'feat(notify): respect quiet hours']],
    prTitle: 'feat(notify): respect quiet hours',
    prBody: '## 요약\n\n- 사용자가 설정한 방해 금지 시간에는 알림을 보내지 않습니다.\n',
  },
};
