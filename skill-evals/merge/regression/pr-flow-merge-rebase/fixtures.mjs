// Builds the temporary Git repositories merge's rebase-verification cases run in.
// Each workspace holds origin.git (a bare repository standing in for GitHub),
// work/ (the agent's checkout, on the PR branch), and gh/ (the fake GitHub CLI's
// state). Every case is a fixed situation: the same commits every run.
import { spawnSync } from 'node:child_process';
import { chmodSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
let clock = Date.parse('2026-11-02T09:00:00Z') / 1000;

function git(cwd, args, { allowFail = false } = {}) {
  clock += 60;
  const env = {
    ...process.env, GIT_AUTHOR_NAME: 'Mina Park', GIT_AUTHOR_EMAIL: 'mina@example.com', GIT_COMMITTER_NAME: 'Mina Park',
    GIT_COMMITTER_EMAIL: 'mina@example.com', GIT_AUTHOR_DATE: `${clock} +0900`, GIT_COMMITTER_DATE: `${clock} +0900`,
  };
  const r = spawnSync('git', ['-C', cwd, ...args], { encoding: 'utf8', env });
  if (r.status !== 0 && !allowFail) throw new Error(`git ${args.join(' ')} in ${cwd}: ${r.stderr}`);
  return r;
}
function write(cwd, files) {
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(cwd, path)), { recursive: true });
    writeFileSync(join(cwd, path), text);
  }
}
function commit(cwd, files, message) {
  write(cwd, files);
  git(cwd, ['add', '-A']);
  git(cwd, ['commit', '-q', '-m', message]);
  return git(cwd, ['rev-parse', 'HEAD']).stdout.trim();
}

const packageJson = `${JSON.stringify({ name: 'app', private: true, type: 'module', scripts: { test: 'node --test' } }, null, 2)}\n`;
const agents = `# Agent notes

- Run \`npm test\` before publishing a branch.
- Specs live in \`docs/specs/<slug>/spec.md\`.
`;

// Creates origin.git with \`seed\` on main, and work/ cloned from it.
function start(ws, seed) {
  const seedDir = join(ws, 'seed');
  mkdirSync(seedDir, { recursive: true });
  git(seedDir, ['init', '-q', '-b', 'main']);
  commit(seedDir, { 'package.json': packageJson, 'AGENTS.md': agents, ...seed }, 'chore: initial app');
  spawnSync('git', ['clone', '-q', '--bare', seedDir, join(ws, 'origin.git')]);
  spawnSync('rm', ['-rf', seedDir]);
  spawnSync('git', ['clone', '-q', join(ws, 'origin.git'), join(ws, 'work')]);
  const work = join(ws, 'work');
  git(work, ['config', 'user.name', 'Mina Park']);
  git(work, ['config', 'user.email', 'mina@example.com']);
  // Skills sit in work/.claude, kept out of Git so they never enter a diff.
  writeFileSync(join(work, '.git/info/exclude'), '.claude/\n');
  return work;
}
// Lands commits on origin main from a scratch clone, as another merged PR would.
function landOnMain(ws, commits) {
  const other = join(ws, 'other');
  spawnSync('git', ['clone', '-q', join(ws, 'origin.git'), other]);
  for (const [files, message] of commits) commit(other, files, message);
  git(other, ['push', '-q', 'origin', 'main']);
  spawnSync('rm', ['-rf', other]);
}
function finish(ws, work, { pr, otherPrs = [], requireUpToDate = true, inject = null }) {
  git(work, ['fetch', '-q', 'origin']);
  const origin = join(ws, 'origin.git');
  const ghDir = join(ws, 'gh');
  mkdirSync(ghDir, { recursive: true });
  const initialHead = spawnSync('git', ['--git-dir', origin, 'rev-parse', `refs/heads/${pr.headRefName}`], { encoding: 'utf8' }).stdout.trim();
  writeFileSync(join(ghDir, 'state.json'), `${JSON.stringify({
    repo: 'acme/app', origin, requireUpToDate, pr: { baseRefName: 'main', state: 'OPEN', ...pr }, otherPrs: otherPrs.map((p) => ({ baseRefName: 'main', ...p })),
    initialHead, initialMain: spawnSync('git', ['--git-dir', origin, 'rev-parse', 'refs/heads/main'], { encoding: 'utf8' }).stdout.trim(),
  }, null, 2)}\n`);
  writeFileSync(join(ghDir, 'calls.jsonl'), '');
  mkdirSync(join(ws, 'bin'), { recursive: true });
  writeFileSync(join(ws, 'bin/gh'), `#!/bin/sh\nexec node ${JSON.stringify(join(here, 'fake-gh.mjs'))} "$@"\n`);
  chmodSync(join(ws, 'bin/gh'), 0o755);
  if (inject) {
    // Another PR lands on main as soon as this PR's branch is pushed: after the
    // agent's own verification, before its merge.
    writeFileSync(join(ghDir, 'inject.json'), `${JSON.stringify(inject, null, 2)}\n`);
    const hook = `#!/bin/sh
while read old new ref; do
  if [ "$ref" = "refs/heads/${pr.headRefName}" ] && [ ! -e ${JSON.stringify(join(ghDir, 'injected'))} ]; then
    touch ${JSON.stringify(join(ghDir, 'injected'))}
    env -u GIT_DIR -u GIT_QUARANTINE_PATH -u GIT_OBJECT_DIRECTORY -u GIT_ALTERNATE_OBJECT_DIRECTORIES node ${JSON.stringify(join(here, 'inject.mjs'))} ${JSON.stringify(ws)} >/dev/null 2>&1
  fi
done
`;
    writeFileSync(join(origin, 'hooks/post-receive'), hook);
    chmodSync(join(origin, 'hooks/post-receive'), 0o755);
  }
}
export function injectNow(ws, inject) {
  landOnMain(ws, [[inject.files, inject.message]]);
}

const trailer = (slug) => `\n\nSpec-Folder: docs/specs/${slug}/`;
const spec = (title, criteria, extra = '') => `# ${title}\n${extra}\n## 수용 기준\n\n${criteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n`;

// --- Situation 1: the earlier conflict resolution dropped one of the PR's changes.
function dropped(ws, t) {
  const work = start(ws, {
    [t.file]: t.before,
    [`test/${t.testName}.test.js`]: t.test,
    [`docs/specs/${t.slug}/spec.md`]: spec(t.title, t.criteria),
  });
  git(work, ['checkout', '-q', '-b', t.branch]);
  commit(work, { [t.file]: t.prVersion }, `${t.prSubject}${trailer(t.slug)}`);
  commit(work, { 'README.md': t.readme }, `docs: describe ${t.testName} settings${trailer(t.slug)}`);
  git(work, ['push', '-q', '-u', 'origin', t.branch]);
  landOnMain(ws, [[{ [t.file]: t.mainVersion }, t.mainSubject]]);
  // The user's earlier rebase: the conflict was resolved by taking main's side of
  // the hunk, keeping only part of the PR's change. Not pushed yet.
  git(work, ['fetch', '-q', 'origin']);
  git(work, ['rebase', 'origin/main'], { allowFail: true });
  write(work, { [t.file]: t.badResolution });
  git(work, ['add', t.file]);
  spawnSync('git', ['-C', work, '-c', 'core.editor=true', 'rebase', '--continue'], { encoding: 'utf8', env: { ...process.env, GIT_EDITOR: 'true' } });
  finish(ws, work, { pr: { number: t.number, title: t.prTitle, body: t.prBody, headRefName: t.branch } });
}

// --- Situation 2: main already carries part of the PR's change, and a clean rebase adds it again.
function duplicate(ws, t) {
  const work = start(ws, {
    [t.file]: t.before,
    [`test/${t.testName}.test.js`]: t.test,
    [`docs/specs/${t.slug}/spec.md`]: spec(t.title, t.criteria),
  });
  git(work, ['checkout', '-q', '-b', t.branch]);
  commit(work, { [t.file]: t.prVersion, ...t.prExtraFiles }, `${t.prSubject}${trailer(t.slug)}`);
  git(work, ['push', '-q', '-u', 'origin', t.branch]);
  landOnMain(ws, [[{ [t.file]: t.mainVersion }, t.mainSubject]]);
  finish(ws, work, { pr: { number: t.number, title: t.prTitle, body: t.prBody, headRefName: t.branch } });
}

// --- Situations 3 and 4: main gained commits since the PR branched; the rebase is clean.
function incoming(ws, t) {
  const work = start(ws, { ...t.seed, [`docs/specs/${t.slug}/spec.md`]: spec(t.title, t.criteria) });
  git(work, ['checkout', '-q', '-b', t.branch]);
  for (const [files, subject] of t.prCommits) commit(work, files, `${subject}${trailer(t.slug)}`);
  git(work, ['push', '-q', '-u', 'origin', t.branch]);
  landOnMain(ws, t.mainCommits);
  finish(ws, work, { pr: { number: t.number, title: t.prTitle, body: t.prBody, headRefName: t.branch }, requireUpToDate: t.requireUpToDate ?? true, inject: t.inject ?? null });
}

// --- Situation 6: the PR's spec folder is blocked by a folder whose work has not landed.
function blocked(ws, t) {
  const work = start(ws, {
    ...t.seed,
    [`docs/specs/${t.blocker}/spec.md`]: spec(t.blockerTitle, t.blockerCriteria),
    [`docs/specs/${t.slug}/spec.md`]: spec(t.title, t.criteria, `\nBlocked by: docs/specs/${t.blocker}/\n`),
  });
  git(work, ['checkout', '-q', '-b', t.branch]);
  for (const [files, subject] of t.prCommits) commit(work, files, `${subject}${trailer(t.slug)}`);
  git(work, ['push', '-q', '-u', 'origin', t.branch]);
  git(work, ['checkout', '-q', '-b', t.blockerBranch, 'origin/main']);
  commit(work, t.blockerFiles, `${t.blockerSubject}${trailer(t.blocker)}`);
  git(work, ['push', '-q', '-u', 'origin', t.blockerBranch]);
  git(work, ['checkout', '-q', t.branch]);
  git(work, ['branch', '-q', '-D', t.blockerBranch]);
  finish(ws, work, {
    pr: { number: t.number, title: t.prTitle, body: t.prBody, headRefName: t.branch },
    otherPrs: [{ number: t.blockerNumber, title: t.blockerPrTitle, body: `${t.blockerPrBody}\n\nSpec-Folder: docs/specs/${t.blocker}/`, headRefName: t.blockerBranch, state: 'OPEN' }],
  });
}

export const builders = { dropped, duplicate, incoming, blocked };
