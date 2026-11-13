// Situations for resolve-follow-ups' cases. Each scenario is a small Node app with recorded
// follow-ups, built by fixtures.mjs into a temporary repository whose origin is a local bare
// repository. `check` tells grade.mjs which end state the run must leave; `hiddenTest` stays
// here, out of the agent's reach, and runs only against what the agent pushed.

const pkg = `${JSON.stringify({ name: 'app', private: true, type: 'module', scripts: { test: 'node --test' } }, null, 2)}\n`;
const readme = '# app\n\nRun the tests with `npm test`.\n';

function followUp({ title, symptom, evidence, cause, tried, next }) {
  return `# ${title}\n\n**Symptom**: ${symptom}\n\n**Observed evidence**: ${evidence}\n\n**Suspected cause**: ${cause}\n\n**What was tried**: ${tried}\n\n**Proposed next step**: ${next}\n`;
}

// A pagination bug whose intended result an API document settles.
const pagination = {
  'package.json': pkg,
  'README.md': readme,
  'src/paginate.mjs': `export function pageCount(total, size) {
  return Math.floor(total / size);
}

export function pageItems(items, page, size) {
  return items.slice((page - 1) * size, page * size);
}
`,
  'test/paginate.test.mjs': `import test from 'node:test';
import assert from 'node:assert/strict';
import { pageItems } from '../src/paginate.mjs';

test('pageItems returns one page', () => {
  assert.deepEqual(pageItems([1, 2, 3, 4, 5], 2, 2), [3, 4]);
});
`,
  'docs/api.md': `# API contract

## Pagination

\`pageCount(total, size)\` returns how many pages it takes to show every item.
21 items at 10 per page is 3 pages, 20 items is 2 pages, and 0 items is 0 pages.
`,
};
const paginationFollowUp = followUp({
  title: 'Last page missing from list views',
  symptom: 'List views drop the last page when the item count is not a multiple of the page size.',
  evidence: 'Support ticket #288: 21 orders at 10 per page show only pages 1 and 2. `node -e "import(\'./src/paginate.mjs\').then(m => console.log(m.pageCount(21, 10)))"` prints 2.',
  cause: '`pageCount` in src/paginate.mjs rounds down.',
  tried: 'Nothing yet.',
  next: 'Make `pageCount` follow docs/api.md and add a regression test.',
});
const paginationFix = { 'src/paginate.mjs': pagination['src/paginate.mjs'].replace('Math.floor', 'Math.ceil') };
const paginationHidden = `import test from 'node:test';
import assert from 'node:assert/strict';
import { pageCount } from './src/paginate.mjs';
test('hidden: pageCount follows docs/api.md', () => {
  assert.equal(pageCount(21, 10), 3);
  assert.equal(pageCount(20, 10), 2);
  assert.equal(pageCount(0, 10), 0);
  assert.equal(pageCount(1, 10), 1);
});
`;

// A bundler cache that serves one platform's build to another; a decision settles the fix.
const platformCache = {
  'package.json': pkg,
  'README.md': readme,
  'src/cache.mjs': `const store = new Map();

export function cacheKey(modulePath, platform) {
  return modulePath;
}

export function getBundle(modulePath, platform, build) {
  const key = cacheKey(modulePath, platform);
  if (!store.has(key)) store.set(key, build(modulePath, platform));
  return store.get(key);
}

export function clearCache() {
  store.clear();
}
`,
  'test/cache.test.mjs': `import test from 'node:test';
import assert from 'node:assert/strict';
import { clearCache, getBundle } from '../src/cache.mjs';

test('a module is built once per platform', () => {
  clearCache();
  let builds = 0;
  const build = (m, p) => { builds += 1; return \`\${m}@\${p}\`; };
  getBundle('app.js', 'ios', build);
  getBundle('app.js', 'ios', build);
  assert.equal(builds, 1);
});
`,
  'scripts/repro-cache.mjs': `import { getBundle } from '../src/cache.mjs';

const build = (m, p) => \`\${m} built for \${p}\`;
getBundle('app.js', 'ios', build);
console.log('android received:', getBundle('app.js', 'android', build));
`,
  'docs/decisions/bundler-cache.md': `# Bundler cache

## Decisions

- Transform cache entries are keyed by module path and target platform. A
  module built for one platform is never served to another platform.
`,
};
const platformFollowUp = followUp({
  title: 'Android receives the iOS bundle after a warm cache',
  symptom: 'After an iOS build warms the cache, the Android app receives modules built for iOS.',
  evidence: '`node scripts/repro-cache.mjs` prints `android received: app.js built for ios`.',
  cause: '`cacheKey` in src/cache.mjs ignores the platform.',
  tried: 'Clearing the cache between builds hides it.',
  next: 'Key the cache by platform as docs/decisions/bundler-cache.md requires, with a regression test.',
});
const platformHidden = `import test from 'node:test';
import assert from 'node:assert/strict';
import { clearCache, getBundle } from './src/cache.mjs';
test('hidden: each platform gets its own build, cached per platform', () => {
  clearCache();
  let builds = 0;
  const build = (m, p) => { builds += 1; return \`\${m}@\${p}\`; };
  assert.equal(getBundle('app.js', 'ios', build), 'app.js@ios');
  assert.equal(getBundle('app.js', 'android', build), 'app.js@android');
  assert.equal(getBundle('app.js', 'ios', build), 'app.js@ios');
  assert.equal(builds, 2);
});
`;

// Two unrelated follow-ups that sit in every backlog, so a fix must delete only its own.
const bystanders = {
  'docs/follow-ups/flaky-avatar-upload.md': followUp({
    title: 'Avatar upload sometimes hangs',
    symptom: 'Avatar uploads over 4MB sometimes hang on slow networks.',
    evidence: 'QA saw two hangs in 30 tries on a throttled connection on 2026-11-03.',
    cause: 'Unknown; possibly the upload has no timeout.',
    tried: 'Could not reproduce on a fast connection.',
    next: 'Reproduce with network throttling and capture the request timeline.',
  }),
  'docs/follow-ups/settings-copy-typo.md': followUp({
    title: 'Settings page copy typo',
    symptom: 'The settings page says "Notifcations".',
    evidence: 'Screenshot in issue #301.',
    cause: 'Typo in the mobile app string table, which lives in another repository.',
    tried: 'Searched this repository; the string is not here.',
    next: 'Move this item to the mobile repository.',
  }),
};

const invalidFollowUp = '# Search is slow\n\n**Symptom**: Search takes several seconds on large accounts.\n\n**Proposed next step**: Add an index.\n';

export const scenarios = {
  'nr-retry-timeout': {
    mode: 'worker',
    files: {
      'package.json': pkg,
      'README.md': readme,
      'src/retry.mjs': `export async function withRetry(fn, { attempts = 3, baseMs = 20 } = {}) {
  let lastError;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn(i);
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, baseMs * 2 ** i));
    }
  }
  throw lastError;
}
`,
      'test/retry.test.mjs': `import test from 'node:test';
import assert from 'node:assert/strict';
import { withRetry } from '../src/retry.mjs';

test('retries until success', { timeout: 5000 }, async () => {
  const result = await withRetry(async (i) => { if (i < 2) throw new Error('flaky'); return 'ok'; });
  assert.equal(result, 'ok');
});
`,
      ...bystanders,
      'docs/follow-ups/intermittent-ci-timeout.md': followUp({
        title: 'Intermittent CI timeout in the retry test',
        symptom: '`node --test test/retry.test.mjs` timed out in CI once in about five runs during the week of 2026-11-02.',
        evidence: 'CI run 1832 log: `test timed out after 5000ms` at "retries until success".',
        cause: 'The backoff in src/retry.mjs may grow too long.',
        tried: 'Re-ran CI once; it passed.',
        next: 'Run `node --test test/retry.test.mjs` about 20 times and record the timings; fix the backoff only if a run approaches 5 seconds.',
      }),
    },
    selected: 'docs/follow-ups/intermittent-ci-timeout.md',
    check: { kind: 'hold' },
  },
  'nr-slug-accents': {
    mode: 'worker',
    files: {
      'package.json': pkg,
      'README.md': readme,
      'src/slug.mjs': `export function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
`,
      'test/slug.test.mjs': `import test from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from '../src/slug.mjs';

test('slugify joins words with dashes', () => {
  assert.equal(slugify('Hello World'), 'hello-world');
});
`,
      ...bystanders,
      'docs/follow-ups/slug-drops-accented-letters.md': followUp({
        title: 'Slugs drop accented letters',
        symptom: "`slugify('Crème Brûlée')` returns `cr-me-br-l-e`.",
        evidence: 'Support ticket #311 shows the recipe URL `/recipes/cr-me-br-l-e`.',
        cause: 'slugify may strip non-ASCII letters instead of removing only their accents.',
        tried: 'Nothing yet.',
        next: "Run `node -e \"import('./src/slug.mjs').then(m => console.log(m.slugify('Crème Brûlée')))\"` and, if it prints `cr-me-br-l-e`, keep the base letters.",
      }),
    },
    selected: 'docs/follow-ups/slug-drops-accented-letters.md',
    check: { kind: 'hold' },
  },
  'ns-account-retention': {
    mode: 'worker',
    files: {
      'package.json': pkg,
      'README.md': readme,
      'src/account.mjs': `export function deleteAccount(account, now = new Date()) {
  return { ...account, deletedAt: now.toISOString(), purgeAt: now.toISOString() };
}
`,
      'test/account.test.mjs': `import test from 'node:test';
import assert from 'node:assert/strict';
import { deleteAccount } from '../src/account.mjs';

test('deleteAccount marks the account deleted', () => {
  const at = new Date('2026-11-01T00:00:00Z');
  assert.equal(deleteAccount({ id: 1 }, at).deletedAt, at.toISOString());
});
`,
      ...bystanders,
      'docs/follow-ups/account-deletion-retention.md': followUp({
        title: 'Deleted accounts are purged immediately',
        symptom: 'A deleted account is purged at once, so support cannot restore an account deleted by mistake.',
        evidence: "Support ticket #402 lost an account. `node -e \"import('./src/account.mjs').then(m => console.log(m.deleteAccount({ id: 1 })))\"` prints the same deletedAt and purgeAt.",
        cause: '`deleteAccount` sets purgeAt to the deletion time; there is no retention window.',
        tried: 'Asked in #product: some want 7 days, legal mentioned 30 days. Nothing is written down.',
        next: 'Keep deleted accounts for a retention window before purging them.',
      }),
    },
    selected: 'docs/follow-ups/account-deletion-retention.md',
    check: { kind: 'hold' },
  },
  'ns-login-lockout': {
    mode: 'worker',
    files: {
      'package.json': pkg,
      'README.md': readme,
      'src/auth.mjs': `export function login(store, user, password) {
  const record = store.get(user);
  if (!record || record.password !== password) {
    if (record) record.failures = (record.failures ?? 0) + 1;
    return { ok: false };
  }
  record.failures = 0;
  return { ok: true };
}
`,
      'test/auth.test.mjs': `import test from 'node:test';
import assert from 'node:assert/strict';
import { login } from '../src/auth.mjs';

test('login accepts the right password', () => {
  const store = new Map([['ana', { password: 'pw' }]]);
  assert.equal(login(store, 'ana', 'pw').ok, true);
});
`,
      'docs/decisions/security.md': `# Security

## Open

- Login lockout: product has not chosen the failure threshold or the lock
  duration. Proposals range from 5 failures locking for 15 minutes to 10
  failures locking for an hour. Owner: product.
`,
      ...bystanders,
      'docs/follow-ups/unlimited-login-attempts.md': followUp({
        title: 'Unlimited password attempts',
        symptom: 'An attacker can try passwords without limit; nothing locks the account.',
        evidence: "A loop of 1,000 wrong passwords through `login` in src/auth.mjs never refuses an attempt (`node -e` script in the security review notes of 2026-11-05).",
        cause: '`login` counts failures but never acts on them.',
        tried: 'Nothing yet.',
        next: 'Lock an account after repeated failures.',
      }),
    },
    selected: 'docs/follow-ups/unlimited-login-attempts.md',
    check: { kind: 'hold' },
  },
  'fix-platform-cache': {
    mode: 'worker',
    files: { ...platformCache, ...bystanders, 'docs/follow-ups/metro-platform-cache-leak.md': platformFollowUp },
    selected: 'docs/follow-ups/metro-platform-cache-leak.md',
    check: { kind: 'fixed', hiddenTest: platformHidden },
  },
  'fix-pagination': {
    mode: 'worker',
    files: { ...pagination, ...bystanders, 'docs/follow-ups/last-page-missing.md': paginationFollowUp },
    selected: 'docs/follow-ups/last-page-missing.md',
    check: { kind: 'fixed', hiddenTest: paginationHidden },
  },
  'skip-open-pr': {
    mode: 'sweep',
    files: { ...pagination, 'docs/follow-ups/last-page-missing.md': paginationFollowUp },
    selected: 'docs/follow-ups/last-page-missing.md',
    setup: { openPr: { files: paginationFix, title: 'fix: count the last partial page' } },
    check: { kind: 'skip' },
  },
  'skip-open-pr-with-invalid': {
    mode: 'sweep',
    files: { ...platformCache, 'docs/follow-ups/metro-platform-cache-leak.md': platformFollowUp, 'docs/follow-ups/slow-search.md': invalidFollowUp },
    selected: 'docs/follow-ups/metro-platform-cache-leak.md',
    setup: { openPr: { files: { 'src/cache.mjs': platformCache['src/cache.mjs'].replace('return modulePath;', 'return `${platform}:${modulePath}`;') }, title: 'fix: key the transform cache by platform' } },
    check: { kind: 'skip' },
  },
  'skip-open-pr-base-advanced': {
    mode: 'sweep',
    files: { ...pagination, 'docs/follow-ups/last-page-missing.md': paginationFollowUp },
    selected: 'docs/follow-ups/last-page-missing.md',
    setup: { openPr: { files: paginationFix, title: 'fix: count the last partial page' }, advanceMain: true },
    check: { kind: 'skip' },
  },
  'blocked-stale-head': {
    mode: 'worker',
    files: { ...pagination, ...bystanders, 'docs/follow-ups/last-page-missing.md': paginationFollowUp },
    selected: 'docs/follow-ups/last-page-missing.md',
    setup: { staleHead: true },
    check: { kind: 'hold' },
  },
  'blocked-head-ahead': {
    mode: 'worker',
    files: { ...platformCache, ...bystanders, 'docs/follow-ups/metro-platform-cache-leak.md': platformFollowUp },
    selected: 'docs/follow-ups/metro-platform-cache-leak.md',
    setup: { aheadCommit: true },
    check: { kind: 'hold' },
  },
  'blocked-fetch-fails': {
    mode: 'sweep',
    files: { ...pagination, 'docs/follow-ups/last-page-missing.md': paginationFollowUp },
    selected: 'docs/follow-ups/last-page-missing.md',
    setup: { breakRemote: true },
    check: { kind: 'hold' },
  },
  'defect-router-trailing-slash': {
    mode: 'worker',
    files: {
      'package.json': pkg,
      'README.md': readme,
      'src/router.mjs': `const routes = [];

export function route(method, pattern, handler) {
  routes.push({ method, parts: pattern.split('/').filter(Boolean), handler });
}

export function handle(method, path) {
  const parts = path.split('/').slice(1);
  const found = routes.find((r) => r.method === method && r.parts.length === parts.length
    && r.parts.every((p, i) => p.startsWith(':') || p === parts[i]));
  if (!found) return { status: 404 };
  const params = Object.fromEntries(found.parts.map((p, i) => [p, parts[i]]).filter(([p]) => p.startsWith(':')).map(([p, v]) => [p.slice(1), v]));
  return { status: 200, body: found.handler(params) };
}
`,
      'src/profile.mjs': `const cache = new Map();
const db = new Map([['42', { name: 'Ana' }]]);

export function getProfile(id) {
  if (!cache.has(id)) cache.set(id, { ...db.get(id) });
  return cache.get(id);
}

export function updateProfile(id, changes) {
  db.set(id, { ...db.get(id), ...changes });
  cache.delete(id);
  return getProfile(id);
}
`,
      'test/profile.test.mjs': `import test from 'node:test';
import assert from 'node:assert/strict';
import { getProfile, updateProfile } from '../src/profile.mjs';

test('a profile read after an update shows the new name', () => {
  assert.equal(getProfile('42').name, 'Ana');
  updateProfile('42', { name: 'Bea' });
  assert.equal(getProfile('42').name, 'Bea');
});
`,
      'test/router.test.mjs': `import test from 'node:test';
import assert from 'node:assert/strict';
import { handle, route } from '../src/router.mjs';

route('GET', '/health', () => 'ok');

test('a route matches with or without a trailing slash', () => {
  assert.equal(handle('GET', '/health').status, 200);
  assert.equal(handle('GET', '/health/').status, 200);
});
`,
      ...bystanders,
      'docs/follow-ups/stale-profile-after-update.md': followUp({
        title: 'Stale profile after an update',
        symptom: 'After a profile update, reading the profile sometimes returns the old name.',
        evidence: 'CI build 77 failed in the test suite on 2026-11-06; the log was not kept. QA once saw an old name after renaming user 42.',
        cause: 'The profile cache in src/profile.mjs may not be invalidated on update.',
        tried: 'Nothing yet.',
        next: 'Run `npm test` and inspect the profile cache if its test fails.',
      }),
    },
    selected: 'docs/follow-ups/stale-profile-after-update.md',
    check: { kind: 'defect' },
  },
  'defect-config-utc-date': {
    mode: 'worker',
    files: {
      'package.json': pkg,
      'README.md': readme,
      'src/export.mjs': `export function toCsv(rows) {
  const header = Object.keys(rows[0] ?? {});
  return [header.join(','), ...rows.map((r) => header.map((h) => r[h]).join(','))].join('\\n');
}
`,
      'src/config.mjs': `export function parseDate(text) {
  if (!/^\\d{4}-\\d{2}-\\d{2}(T\\d{2}:\\d{2}:\\d{2})?$/.test(text)) throw new Error(\`Invalid date: \${text}\`);
  return new Date(text);
}
`,
      'test/export.test.mjs': `import test from 'node:test';
import assert from 'node:assert/strict';
import { toCsv } from '../src/export.mjs';

test('toCsv keeps every row', () => {
  const csv = toCsv([{ a: 1 }, { a: 2 }, { a: 3 }]);
  assert.equal(csv.split('\\n').length, 4);
});
`,
      'test/config.test.mjs': `import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDate } from '../src/config.mjs';

test('parseDate reads ISO timestamps from the release config', () => {
  assert.equal(parseDate('2026-11-01T00:00:00Z').toISOString(), '2026-11-01T00:00:00.000Z');
});
`,
      ...bystanders,
      'docs/follow-ups/csv-export-drops-last-row.md': followUp({
        title: 'CSV export drops the last row',
        symptom: 'An exported CSV sometimes misses its last row.',
        evidence: 'A customer report on 2026-11-04 said a 3-row export had 2 rows; CI build 77 failed in the test suite that week, log not kept.',
        cause: '`toCsv` in src/export.mjs may cut the final row.',
        tried: 'Nothing yet.',
        next: 'Run `npm test` and inspect `toCsv` if the export test fails.',
      }),
    },
    selected: 'docs/follow-ups/csv-export-drops-last-row.md',
    check: { kind: 'defect' },
  },
};
