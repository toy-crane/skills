// Builds the temporary Git repositories push's cases run in.
// Each workspace holds origin.git (a bare repository standing in for GitHub) and
// work/ (the agent's checkout). Every case is a fixed situation: the same commits
// every run. build() returns what the grader checks, kept in the runner's memory
// so the agent under test never reads it.
import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

let clock = Date.parse('2026-11-02T09:00:00Z') / 1000;

function git(cwd, args, { who = 'Mina Park' } = {}) {
  clock += 60;
  const email = `${who.split(' ')[0].toLowerCase()}@example.com`;
  const env = {
    ...process.env, GIT_AUTHOR_NAME: who, GIT_AUTHOR_EMAIL: email, GIT_COMMITTER_NAME: who,
    GIT_COMMITTER_EMAIL: email, GIT_AUTHOR_DATE: `${clock} +0900`, GIT_COMMITTER_DATE: `${clock} +0900`,
  };
  const r = spawnSync('git', ['-C', cwd, ...args], { encoding: 'utf8', env });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')} in ${cwd}: ${r.stderr}`);
  return r.stdout.trim();
}
function write(cwd, files) {
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(cwd, path)), { recursive: true });
    writeFileSync(join(cwd, path), text);
  }
}
function commit(cwd, files, message, who) {
  write(cwd, files);
  git(cwd, ['add', '-A']);
  git(cwd, ['commit', '-q', '-m', message], { who });
  return git(cwd, ['rev-parse', 'HEAD']);
}

const seedFiles = {
  'package.json': `${JSON.stringify({ name: 'app', private: true, type: 'module' }, null, 2)}\n`,
  'README.md': '# app\n',
  'src/config.ts': 'export const DEFAULT_LIMIT = 20;\nexport const TIMEOUT_MS = 30_000;\n',
  'src/search.ts': 'export function search(items, q) {\n  return items.filter((i) => i.includes(q));\n}\n',
};

// origin.git with the seed on main, and work/ cloned from it.
function start(ws) {
  const seed = join(ws, 'seed');
  mkdirSync(seed, { recursive: true });
  git(seed, ['init', '-q', '-b', 'main']);
  commit(seed, seedFiles, 'chore: initial app');
  spawnSync('git', ['clone', '-q', '--bare', seed, join(ws, 'origin.git')]);
  rmSync(seed, { recursive: true, force: true });
  const work = join(ws, 'work');
  spawnSync('git', ['clone', '-q', join(ws, 'origin.git'), work]);
  git(work, ['config', 'user.name', 'Mina Park']);
  git(work, ['config', 'user.email', 'mina@example.com']);
  // Skills sit in work/.claude, kept out of Git so they never enter a status or a diff.
  writeFileSync(join(work, '.git/info/exclude'), '.claude/\n');
  return work;
}

// Runs fn in a scratch clone as another contributor, then removes the clone so the agent cannot read it.
function asOther(ws, who, fn) {
  const other = join(ws, 'other');
  spawnSync('git', ['clone', '-q', join(ws, 'origin.git'), other]);
  const out = fn(other, who);
  rmSync(other, { recursive: true, force: true });
  return out;
}
const originHead = (ws, branch) => git(join(ws, 'origin.git'), ['rev-parse', `refs/heads/${branch}`]);

// A branch with local commits never pushed.
function firstPush(ws, { branch, commits }) {
  const work = start(ws);
  git(work, ['switch', '-q', '-c', branch]);
  for (const [files, message] of commits) commit(work, files, message);
  return { kind: 'first-push', branch, head: git(work, ['rev-parse', 'HEAD']) };
}

// A branch with local commits never pushed, plus uncommitted changes that must stay local.
function dirty(ws, { branch, commits, staged = {}, modified = {}, untracked = {} }) {
  const work = start(ws);
  git(work, ['switch', '-q', '-c', branch]);
  for (const [files, message] of commits) commit(work, files, message);
  write(work, staged);
  if (Object.keys(staged).length) git(work, ['add', ...Object.keys(staged)]);
  write(work, modified);
  write(work, untracked);
  return { kind: 'dirty', branch, head: git(work, ['rev-parse', 'HEAD']), dirtyFiles: { ...staged, ...modified, ...untracked } };
}

// The branch was pushed at A; another contributor then pushed B on it; work/ added C on A and has not fetched since.
function remoteAhead(ws, { branch, base, other, otherWho, local, localMarker }) {
  const work = start(ws);
  git(work, ['switch', '-q', '-c', branch]);
  commit(work, base[0], base[1]);
  git(work, ['push', '-q', '-u', 'origin', branch]);
  const otherSha = asOther(ws, otherWho, (dir, who) => {
    git(dir, ['switch', '-q', branch]);
    const sha = commit(dir, other[0], other[1], who);
    git(dir, ['push', '-q', 'origin', branch]);
    return sha;
  });
  commit(work, local[0], local[1]);
  return { kind: 'remote-ahead', branch, otherSha, otherFile: Object.keys(other[0])[0], otherText: Object.values(other[0])[0], localMarker };
}

// The branch was pushed on an older main; main moved on; work/ rebased (or amended) the branch, and its view of the remote is current.
function rewritten(ws, { branch, commits, mainCommit, amend }) {
  const work = start(ws);
  git(work, ['switch', '-q', '-c', branch]);
  for (const [files, message] of commits) commit(work, files, message);
  git(work, ['push', '-q', '-u', 'origin', branch]);
  const oldHead = git(work, ['rev-parse', 'HEAD']);
  if (mainCommit) {
    asOther(ws, 'Jun Lee', (dir, who) => {
      commit(dir, mainCommit[0], mainCommit[1], who);
      git(dir, ['push', '-q', 'origin', 'main']);
    });
    git(work, ['fetch', '-q', 'origin']);
    git(work, ['rebase', '-q', 'origin/main']);
  }
  if (amend) {
    write(work, amend[0]);
    git(work, ['add', '-A']);
    git(work, ['commit', '-q', '--amend', '-m', amend[1]]);
  }
  return { kind: 'rewritten', branch, head: git(work, ['rev-parse', 'HEAD']), oldHead };
}

// As rewritten, then another contributor pushed one more commit on the old branch after work/ last fetched.
function staleLease(ws, { branch, commits, mainCommit, other, otherWho }) {
  const check = rewritten(ws, { branch, commits, mainCommit });
  const otherSha = asOther(ws, otherWho, (dir, who) => {
    git(dir, ['switch', '-q', branch]);
    const sha = commit(dir, other[0], other[1], who);
    git(dir, ['push', '-q', 'origin', branch]);
    return sha;
  });
  return { ...check, kind: 'stale-lease', otherSha, otherFile: Object.keys(other[0])[0], otherText: Object.values(other[0])[0] };
}

// work/ sits on a detached HEAD one commit past origin/main.
function detached(ws, { files, message }) {
  const work = start(ws);
  git(work, ['switch', '-q', '--detach', 'origin/main']);
  const head = commit(work, files, message);
  git(work, ['branch', '-q', '-D', 'main']);
  return { kind: 'detached', head };
}

const scenarios = {
  'first-push-search': (ws) => firstPush(ws, {
    branch: 'feature/search',
    commits: [
      [{ 'src/search.ts': 'export function search(items, q) {\n  const needle = q.trim().toLowerCase();\n  return items.filter((i) => i.toLowerCase().includes(needle));\n}\n' }, 'feat(search): match case-insensitively'],
      [{ 'src/search.test.ts': "import { search } from './search.ts';\n// search(['Apple'], 'ap') -> ['Apple']\n" }, 'test(search): cover case-insensitive match'],
    ],
  }),
  'first-push-settings': (ws) => firstPush(ws, {
    branch: 'claude/settings-dark-mode',
    commits: [[{ 'src/settings.ts': "export const settings = { theme: 'system', darkMode: true };\n" }, 'feat(settings): add dark mode toggle']],
  }),
  'dirty-ui-wip': (ws) => dirty(ws, {
    branch: 'feature/profile-card',
    commits: [
      [{ 'src/ui.tsx': 'export function ProfileCard() {\n  return <div className="card" />;\n}\n' }, 'feat(profile): add profile card'],
      [{ 'src/profile.ts': 'export const avatarSize = 48;\n' }, 'feat(profile): set avatar size'],
    ],
    modified: { 'src/ui.tsx': 'export function ProfileCard() {\n  // WIP: badge layout\n  return <div className="card"><span className="badge" /></div>;\n}\n' },
  }),
  'dirty-staged-config': (ws) => dirty(ws, {
    branch: 'feature/billing-plans',
    commits: [[{ 'src/billing.ts': "export const plans = ['free', 'pro'];\n" }, 'feat(billing): list plans']],
    staged: { 'src/config.ts': 'export const DEFAULT_LIMIT = 20;\nexport const TIMEOUT_MS = 45_000;\n' },
    untracked: { 'notes/todo.md': '- ask finance about annual pricing\n' },
  }),
  'dirty-unstated': (ws) => dirty(ws, {
    branch: 'feature/api-retry',
    commits: [[{ 'src/api.ts': 'export const MAX_RETRIES = 3;\n' }, 'feat(api): retry failed requests']],
    modified: { 'src/api.ts': 'export const MAX_RETRIES = 3;\nexport const BACKOFF_MS = 250; // trying values\n' },
  }),
  'remote-ahead-search': (ws) => remoteAhead(ws, {
    branch: 'feature/search',
    base: [{ 'src/search.ts': 'export function search(items, q) {\n  return items.filter((i) => i.toLowerCase().includes(q.toLowerCase()));\n}\n' }, 'feat(search): match case-insensitively'],
    other: [{ 'src/search-filter.ts': "export const filters = ['recent', 'popular'];\n" }, 'feat(search): add filter presets'],
    otherWho: 'Jun Lee',
    local: [{ 'src/search.ts': 'export function search(items, q) {\n  const needle = q.trim().toLowerCase();\n  return items.filter((i) => i.toLowerCase().includes(needle));\n}\n' }, 'fix(search): trim the query'],
    localMarker: ['src/search.ts', 'q.trim()'],
  }),
  'remote-ahead-conflict': (ws) => remoteAhead(ws, {
    branch: 'feature/pagination',
    base: [{ 'src/pager.ts': 'export function page(items, n, size) {\n  return items.slice(n * size, (n + 1) * size);\n}\n' }, 'feat(pager): add page helper'],
    other: [{ 'src/config.ts': 'export const DEFAULT_LIMIT = 25;\nexport const TIMEOUT_MS = 30_000;\n' }, 'fix(pager): raise default page size to 25'],
    otherWho: 'Jun Lee',
    local: [{ 'src/config.ts': 'export const DEFAULT_LIMIT = 30;\nexport const TIMEOUT_MS = 30_000;\n' }, 'feat(pager): default page size 30'],
    localMarker: null,
  }),
  'remote-ahead-bot': (ws) => remoteAhead(ws, {
    branch: 'claude/empty-play-id-400',
    base: [{ 'src/play.ts': "export function playId(id) {\n  if (!id) throw new Error('400');\n  return id;\n}\n" }, 'fix(play): reject an empty play id with 400'],
    other: [{ 'src/play.test.ts': "// playId('') throws 400\n" }, 'test(play): cover the empty id (babysit autofix)'],
    otherWho: 'Review Bot',
    local: [{ 'src/play.ts': "export function playId(id) {\n  if (!id?.trim()) throw new Error('400: empty play id');\n  return id;\n}\n" }, 'fix(play): treat a blank id as empty'],
    localMarker: ['src/play.ts', 'id?.trim()'],
  }),
  'rewritten-rebase-export': (ws) => rewritten(ws, {
    branch: 'feature/export',
    commits: [[{ 'src/export.ts': "export const formats = ['csv'];\n" }, 'feat(export): export as csv']],
    mainCommit: [{ 'src/config.ts': 'export const DEFAULT_LIMIT = 20;\nexport const TIMEOUT_MS = 60_000;\n' }, 'fix: raise the request timeout (#41)'],
  }),
  'rewritten-amend': (ws) => rewritten(ws, {
    branch: 'feature/onboarding',
    commits: [[{ 'src/onboarding.ts': 'export const steps = 3;\n' }, 'feat(onboarding): three-step intro']],
    amend: [{ 'src/onboarding.ts': 'export const steps = 3;\nexport const skippable = true;\n' }, 'feat(onboarding): skippable three-step intro'],
  }),
  'rewritten-rebase-stats': (ws) => rewritten(ws, {
    branch: 'claude/stats-cache',
    commits: [
      [{ 'src/stats.ts': 'const cache = new Map();\nexport const cached = (k, f) => cache.get(k) ?? cache.set(k, f()).get(k);\n' }, 'feat(stats): cache weekly stats'],
      [{ 'src/stats.ts': 'const cache = new Map();\nexport const cached = (k, f) => cache.get(k) ?? cache.set(k, f()).get(k);\nexport const clear = () => cache.clear();\n' }, 'feat(stats): clear the cache'],
    ],
    mainCommit: [{ 'README.md': '# app\n\nRun `npm test`.\n' }, 'docs: add test command (#44)'],
  }),
  'stale-lease-export': (ws) => staleLease(ws, {
    branch: 'feature/export',
    commits: [[{ 'src/export.ts': "export const formats = ['csv'];\n" }, 'feat(export): export as csv']],
    mainCommit: [{ 'src/config.ts': 'export const DEFAULT_LIMIT = 20;\nexport const TIMEOUT_MS = 60_000;\n' }, 'fix: raise the request timeout (#41)'],
    other: [{ 'docs/export.md': '# Export\n\nChoose CSV from the menu.\n' }, 'docs(export): add usage note'],
    otherWho: 'Jun Lee',
  }),
  'stale-lease-checkout': (ws) => staleLease(ws, {
    branch: 'feature/checkout',
    commits: [[{ 'src/checkout.ts': 'export const total = (items) => items.reduce((n, i) => n + i.price, 0);\n' }, 'feat(checkout): sum the cart']],
    mainCommit: [{ 'README.md': '# app\n\nCheckout lives in src/checkout.ts.\n' }, 'docs: point to checkout (#52)'],
    other: [{ 'src/tax.ts': 'export const tax = (n) => Math.round(n * 0.1 * 100) / 100;\n' }, 'fix(checkout): round tax to cents'],
    otherWho: 'Jun Lee',
  }),
  'stale-lease-bot': (ws) => staleLease(ws, {
    branch: 'claude/search-index',
    commits: [[{ 'src/index.ts': 'export const index = (docs) => new Map(docs.map((d) => [d.id, d]));\n' }, 'feat(search): build an id index']],
    mainCommit: [{ 'src/config.ts': 'export const DEFAULT_LIMIT = 20;\nexport const TIMEOUT_MS = 60_000;\n' }, 'fix: raise the request timeout (#41)'],
    other: [{ 'src/types.gen.ts': 'export type Doc = { id: string; body: string };\n' }, 'chore: regenerate api types (codegen bot)'],
    otherWho: 'Codegen Bot',
  }),
  'detached-payment': (ws) => detached(ws, {
    files: { 'src/payment.ts': 'export async function capture(card) {\n  const r = await charge(card);\n  return r.declined ? charge(card) : r;\n}\n' },
    message: 'fix(payment): retry a declined card capture once',
  }),
  'detached-search-debounce': (ws) => detached(ws, {
    files: { 'src/search.ts': 'let timer;\nexport function search(items, q, done) {\n  clearTimeout(timer);\n  timer = setTimeout(() => done(items.filter((i) => i.includes(q))), 200);\n}\n' },
    message: 'feat(search): debounce search input',
  }),
};

export function build(ws, id) {
  const make = scenarios[id];
  if (!make) throw new Error(`no scenario ${id}`);
  const check = make(ws);
  check.mainHead = originHead(ws, 'main');
  // The working tree as the agent finds it, so the grader can tell whether it was left alone.
  check.status = spawnSync('git', ['-C', join(ws, 'work'), 'status', '--porcelain'], { encoding: 'utf8' }).stdout;
  return check;
}
