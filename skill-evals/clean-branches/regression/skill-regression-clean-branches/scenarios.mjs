// The fixed situations behind cases.jsonl, one per case id. Each builds its workspace with
// fixtures.mjs and returns the agent's working directory (relative to the workspace) and the
// end-state checks grade.mjs applies. Paths in checks are relative to the workspace.
//
// Check kinds: gone (folder removed and unregistered), present (folder still there, `file`
// optionally still holding `contains`), branchGone, branchKept (`at` = the tip it must keep),
// cleanup (the declared commands ran in that folder, in order), noCleanup, detachedAt (HEAD
// detached at origin's main), onMainAt (on branch main at origin's main), alive (a simulated
// process still runs). Every case also checks that origin's refs are unchanged.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  branch, commit, finish, git, land, pr, projectFiles, rev, start, startLeftoverServer, startSession, worktree, write,
} from './fixtures.mjs';

const wt = (name) => `work/.worktrees/${name}`;
const feature = (file, text, subject) => [[{ [file]: text }, subject]];

export const scenarios = {
  // evals.json 1: a mixed sweep with no declared cleanup.
  'mixed-sweep': (ws) => {
    const work = start(ws, projectFiles(ws));
    const a = branch(work, 'feat/a', feature('src/search.js', 'export const search = (q) => q.trim();\n', 'feat(search): trim the query'));
    const b = branch(work, 'feat/b', feature('src/share.js', 'export const share = () => true;\n', 'feat(share): add sharing'));
    const c = branch(work, 'feat/c', feature('src/tags.js', 'export const tags = [];\n', 'feat(tags): add tags'));
    const prs = [
      pr({ number: 10, title: 'feat(search): trim the query', headRefName: 'feat/a', headRefOid: a, state: 'MERGED' }),
      pr({ number: 11, title: 'feat(share): add sharing', headRefName: 'feat/b', headRefOid: b, state: 'OPEN' }),
      pr({ number: 12, title: 'feat(tags): add tags', headRefName: 'feat/c', headRefOid: c, state: 'MERGED' }),
    ];
    worktree(work, 'feat-a', 'feat/a');
    worktree(work, 'feat-b', 'feat/b');
    worktree(work, 'feat-c', 'feat/c');
    writeFileSync(join(ws, wt('feat-c'), 'notes.txt'), 'call with design on Friday\n');
    prs[0].mergeCommit = land(ws, 'feat/a', { subject: 'feat(search): trim the query (#10)' });
    prs[2].mergeCommit = land(ws, 'feat/c', { subject: 'feat(tags): add tags (#12)' });
    worktree(work, 'scratch-in', 'origin/main', { detach: true });
    const out = worktree(work, 'scratch-out', 'origin/main', { detach: true });
    commit(out, { 'spike.md': '# spike\n' }, 'wip: try a new layout');
    mkdirSync(join(ws, wt('old-x'), 'supabase'), { recursive: true });
    worktree(work, null, 'origin/main', { detach: true, path: join(ws, 'codex/worktrees/ab12/notes') });
    finish(ws, { prs });
    return {
      cwd: 'work',
      check: [
        { kind: 'gone', path: wt('feat-a') }, { kind: 'branchGone', name: 'feat/a' },
        { kind: 'gone', path: wt('scratch-in') }, { kind: 'gone', path: wt('old-x') },
        { kind: 'present', path: wt('feat-b') }, { kind: 'branchKept', name: 'feat/b' },
        { kind: 'present', path: wt('feat-c'), file: 'notes.txt', contains: 'Friday' }, { kind: 'branchKept', name: 'feat/c' },
        { kind: 'present', path: wt('scratch-out') }, { kind: 'present', path: 'codex/worktrees/ab12/notes' },
      ],
    };
  },

  // evals.json 2: two closed PRs, one with local commits beyond its head.
  'closed-pr-branch-tip': (ws) => {
    const work = start(ws, projectFiles(ws));
    const x = branch(work, 'fix/x', feature('src/x.js', 'export const x = 1;\n', 'fix(x): guard empty notes'));
    const y = branch(work, 'fix/y', feature('src/y.js', 'export const y = 1;\n', 'fix(y): keep the cursor'));
    worktree(work, 'fix-x', 'fix/x');
    const fy = worktree(work, 'fix-y', 'fix/y');
    commit(fy, { 'src/y.js': 'export const y = 2;\n' }, 'fix(y): keep the cursor after paste');
    const yTip = commit(fy, { 'src/y.test.js': "import { test } from 'node:test';\ntest('y', () => {});\n" }, 'test(y): cover paste');
    finish(ws, {
      prs: [
        pr({ number: 20, title: 'fix(x): guard empty notes', headRefName: 'fix/x', headRefOid: x, state: 'CLOSED' }),
        pr({ number: 21, title: 'fix(y): keep the cursor', headRefName: 'fix/y', headRefOid: y, state: 'CLOSED' }),
      ],
    });
    return {
      cwd: 'work',
      check: [
        { kind: 'gone', path: wt('fix-x') }, { kind: 'branchGone', name: 'fix/x' },
        { kind: 'present', path: wt('fix-y') }, { kind: 'branchKept', name: 'fix/y', at: yTip },
      ],
    };
  },

  // evals.json 3: one merged worktree a live session uses, one holding only a left-over server.
  'attached-and-leftover': (ws) => {
    const work = start(ws, projectFiles(ws, { cleanup: ['npm run dev:remove', 'npm run db:remove'] }));
    const chat = branch(work, 'feat/chat', feature('src/chat.js', 'export const chat = [];\n', 'feat(chat): add chat'));
    const feed = branch(work, 'feat/feed', feature('src/feed.js', 'export const feed = [];\n', 'feat(feed): add the feed'));
    const prs = [
      pr({ number: 30, title: 'feat(chat): add chat', headRefName: 'feat/chat', headRefOid: chat, state: 'MERGED' }),
      pr({ number: 31, title: 'feat(feed): add the feed', headRefName: 'feat/feed', headRefOid: feed, state: 'MERGED' }),
    ];
    const chatDir = worktree(work, 'feat-chat', 'feat/chat');
    const feedDir = worktree(work, 'feat-feed', 'feat/feed');
    prs[0].mergeCommit = land(ws, 'feat/chat', { subject: 'feat(chat): add chat (#30)' });
    prs[1].mergeCommit = land(ws, 'feat/feed', { subject: 'feat(feed): add the feed (#31)' });
    finish(ws, { prs });
    startSession(ws, chatDir, 'session');
    startLeftoverServer(ws, feedDir, 'metro');
    return {
      cwd: 'work',
      check: [
        { kind: 'present', path: wt('feat-chat') }, { kind: 'branchKept', name: 'feat/chat' },
        { kind: 'noCleanup', path: wt('feat-chat') }, { kind: 'alive', name: 'session' },
        { kind: 'cleanup', path: wt('feat-feed'), cmds: ['dev:remove', 'db:remove'] },
        { kind: 'gone', path: wt('feat-feed') }, { kind: 'branchGone', name: 'feat/feed' },
      ],
    };
  },

  // evals.json 4: the session works inside the merged worktree.
  'session-inside-candidate': (ws) => {
    const work = start(ws, projectFiles(ws, { cleanup: ['npm run dev:remove'] }));
    const tip = branch(work, 'feat/notes-export', feature('src/export.js', 'export const toCsv = (n) => n.join(",");\n', 'feat(export): export notes as CSV'));
    const dir = worktree(work, 'notes-export', 'feat/notes-export');
    const merged = land(ws, 'feat/notes-export', { subject: 'feat(export): export notes as CSV (#40)' });
    finish(ws, { prs: [pr({ number: 40, title: 'feat(export): export notes as CSV', headRefName: 'feat/notes-export', headRefOid: tip, state: 'MERGED', mergeCommit: merged })] });
    startLeftoverServer(ws, dir, 'metro');
    return {
      cwd: wt('notes-export'),
      check: [
        { kind: 'cleanup', path: wt('notes-export'), cmds: ['dev:remove'] },
        { kind: 'present', path: wt('notes-export') }, { kind: 'detachedAt', path: wt('notes-export') },
        { kind: 'branchGone', name: 'feat/notes-export' },
      ],
    };
  },

  // evals.json 5: gh is not logged in; one branch worktree even looks merged by ancestry.
  'github-unavailable': (ws) => {
    const work = start(ws, projectFiles(ws));
    branch(work, 'feat/p', feature('src/p.js', 'export const p = 1;\n', 'feat(p): add pinning'));
    branch(work, 'feat/q', feature('src/q.js', 'export const q = 1;\n', 'feat(q): add quick notes'));
    branch(work, 'feat/r', feature('src/r.js', 'export const r = 1;\n', 'feat(r): add reminders'));
    worktree(work, 'feat-p', 'feat/p');
    worktree(work, 'feat-q', 'feat/q');
    worktree(work, 'feat-r', 'feat/r');
    land(ws, 'feat/p', { method: 'merge', subject: 'Merge pull request #44 from acme/feat/p' });
    land(ws, 'feat/q', { subject: 'feat(q): add quick notes (#45)' });
    git(work, ['fetch', '-q', 'origin']);
    worktree(work, 'scratch', 'origin/main', { detach: true });
    mkdirSync(join(ws, wt('leftover'), 'tmp'), { recursive: true });
    finish(ws, { authed: false });
    return {
      cwd: 'work',
      check: [
        { kind: 'present', path: wt('feat-p') }, { kind: 'branchKept', name: 'feat/p' },
        { kind: 'present', path: wt('feat-q') }, { kind: 'branchKept', name: 'feat/q' },
        { kind: 'present', path: wt('feat-r') }, { kind: 'branchKept', name: 'feat/r' },
        { kind: 'gone', path: wt('scratch') }, { kind: 'gone', path: wt('leftover') },
      ],
    };
  },

  // evals.json 6: the oldest worktree's branch predates the dev:remove script.
  'declared-command-fails': (ws) => {
    const work = start(ws, projectFiles(ws, { withScripts: false }));
    const old = branch(work, 'feat/onboarding', feature('src/onboarding.js', 'export const steps = 3;\n', 'feat(onboarding): add three steps'));
    git(work, ['checkout', '-q', 'main']);
    commit(work, projectFiles(ws, { cleanup: ['npm run dev:remove'] }), 'chore: declare worktree cleanup');
    git(work, ['push', '-q', 'origin', 'main']);
    const m2 = branch(work, 'feat/search', feature('src/search.js', 'export const search = 1;\n', 'feat(search): add search'));
    const m3 = branch(work, 'feat/theme', feature('src/theme.js', 'export const theme = "dark";\n', 'feat(theme): add dark theme'));
    worktree(work, 'onboarding', 'feat/onboarding');
    worktree(work, 'search', 'feat/search');
    worktree(work, 'theme', 'feat/theme');
    const prs = [
      pr({ number: 50, title: 'feat(onboarding): add three steps', headRefName: 'feat/onboarding', headRefOid: old, state: 'MERGED' }),
      pr({ number: 52, title: 'feat(search): add search', headRefName: 'feat/search', headRefOid: m2, state: 'MERGED' }),
      pr({ number: 53, title: 'feat(theme): add dark theme', headRefName: 'feat/theme', headRefOid: m3, state: 'MERGED' }),
    ];
    prs[0].mergeCommit = land(ws, 'feat/onboarding', { subject: 'feat(onboarding): add three steps (#50)' });
    prs[1].mergeCommit = land(ws, 'feat/search', { subject: 'feat(search): add search (#52)' });
    prs[2].mergeCommit = land(ws, 'feat/theme', { subject: 'feat(theme): add dark theme (#53)' });
    finish(ws, { prs });
    return {
      cwd: 'work',
      check: [
        { kind: 'present', path: wt('onboarding') }, { kind: 'branchKept', name: 'feat/onboarding' },
        { kind: 'cleanup', path: wt('search'), cmds: ['dev:remove'] }, { kind: 'gone', path: wt('search') }, { kind: 'branchGone', name: 'feat/search' },
        { kind: 'cleanup', path: wt('theme'), cmds: ['dev:remove'] }, { kind: 'gone', path: wt('theme') }, { kind: 'branchGone', name: 'feat/theme' },
      ],
    };
  },

  // evals.json 7: two folders lost their registration; one still carries .git and source.
  'unregistered-with-git': (ws) => {
    const work = start(ws, projectFiles(ws));
    const live = branch(work, 'feat/live', feature('src/live.js', 'export const live = 1;\n', 'feat(live): add live sync'));
    worktree(work, 'feat-live', 'feat/live');
    mkdirSync(join(ws, wt('lost-a'), 'supabase'), { recursive: true });
    const lostB = worktree(work, 'lost-b', 'origin/main', { detach: true });
    write(lostB, { 'src/app.js': "export const app = { name: 'notes', beta: true };\n" });
    rmSync(join(work, '.git/worktrees/lost-b'), { recursive: true, force: true });
    finish(ws, { prs: [pr({ number: 60, title: 'feat(live): add live sync', headRefName: 'feat/live', headRefOid: live, state: 'OPEN' })] });
    return {
      cwd: 'work',
      check: [
        { kind: 'gone', path: wt('lost-a') },
        { kind: 'present', path: wt('lost-b'), file: 'src/app.js', contains: 'beta' },
        { kind: 'present', path: wt('feat-live') }, { kind: 'branchKept', name: 'feat/live' },
      ],
    };
  },

  // evals.json 8: two branch worktrees without a PR; main already contains one of them.
  'no-pr-branch': (ws) => {
    const work = start(ws, projectFiles(ws));
    branch(work, 'experiment/z', feature('src/z.js', 'export const z = 1;\n', 'wip: try a canvas editor'));
    branch(work, 'chore/w', feature('README.md', '# notes\n\nA small notes app.\n', 'docs: describe the app'));
    land(ws, 'chore/w', { method: 'ff' });
    worktree(work, 'experiment-z', 'experiment/z');
    worktree(work, 'chore-w', 'chore/w');
    finish(ws, { prs: [] });
    return {
      cwd: 'work',
      check: [
        { kind: 'present', path: wt('experiment-z') }, { kind: 'branchKept', name: 'experiment/z' },
        { kind: 'present', path: wt('chore-w') }, { kind: 'branchKept', name: 'chore/w' },
      ],
    };
  },

  // evals.json 9: local branches only, judged by their pull requests.
  'branch-only-leftovers': (ws) => {
    const work = start(ws, projectFiles(ws));
    const a = branch(work, 'feat/a', feature('src/a.js', 'export const a = 1;\n', 'feat(a): add archive'));
    const b = branch(work, 'fix/b', feature('src/b.js', 'export const b = 1;\n', 'fix(b): fix the badge count'));
    branch(work, 'spike/c', feature('src/c.js', 'export const c = 1;\n', 'wip: spike a calendar'), { push: false });
    const merged = land(ws, 'feat/a', { subject: 'feat(a): add archive (#40)' });
    land(ws, 'fix/b', { method: 'merge', subject: 'Merge branch fix/b' });
    finish(ws, {
      prs: [
        pr({ number: 40, title: 'feat(a): add archive', headRefName: 'feat/a', headRefOid: a, state: 'MERGED', mergeCommit: merged }),
        pr({ number: 41, title: 'fix(b): fix the badge count', headRefName: 'fix/b', headRefOid: b, state: 'CLOSED' }),
      ],
    });
    return {
      cwd: 'work',
      check: [
        { kind: 'branchGone', name: 'feat/a' }, { kind: 'branchGone', name: 'fix/b' },
        { kind: 'branchKept', name: 'spike/c' }, { kind: 'branchKept', name: 'main' },
      ],
    };
  },

  // evals.json 10: merge hands over a branch checked out in the primary checkout.
  'merge-handoff-primary-checkout': (ws) => {
    const work = start(ws, projectFiles(ws));
    const d = branch(work, 'feat/d', feature('src/drafts.js', 'export const drafts = [];\n', 'feat(drafts): keep drafts'));
    const e = branch(work, 'feat/e', feature('src/emoji.js', 'export const emoji = true;\n', 'feat(emoji): add emoji'));
    worktree(work, 'feat-e', 'feat/e');
    const eMerged = land(ws, 'feat/e', { subject: 'feat(emoji): add emoji (#51)' });
    git(work, ['checkout', '-q', 'feat/d']);
    git(work, ['branch', '-q', '--set-upstream-to', 'origin/feat/d']);
    const dMerged = land(ws, 'feat/d', { subject: 'feat(drafts): keep drafts (#50)' });
    // merge fetched before it merged, so work/ still sees main without #50 until it fetches.
    finish(ws, {
      prs: [
        pr({ number: 51, title: 'feat(emoji): add emoji', headRefName: 'feat/e', headRefOid: e, state: 'MERGED', mergeCommit: eMerged }),
        pr({ number: 50, title: 'feat(drafts): keep drafts', headRefName: 'feat/d', headRefOid: d, state: 'MERGED', mergeCommit: dMerged }),
      ],
    });
    git(work, ['update-ref', 'refs/remotes/origin/main', eMerged]);
    return {
      cwd: 'work',
      vars: { head: d },
      check: [
        { kind: 'onMainAt', path: 'work' }, { kind: 'branchGone', name: 'feat/d' },
        { kind: 'present', path: wt('feat-e') }, { kind: 'branchKept', name: 'feat/e' },
      ],
    };
  },

  // Real merge handoffs: the session works inside the merged worktree and a dev server it started is left over.
  'merge-handoff-session-worktree': (ws) => {
    const work = start(ws, projectFiles(ws, { cleanup: ['npm run dev:remove'] }));
    const share = branch(work, 'claude/share-links', feature('src/share.js', 'export const link = (id) => `/n/${id}`;\n', 'feat(share): add share links'));
    const other = branch(work, 'claude/tag-colors', feature('src/tags.js', 'export const colors = ["red"];\n', 'feat(tags): color tags'));
    const dir = worktree(work, 'share-links', 'claude/share-links');
    worktree(work, 'tag-colors', 'claude/tag-colors');
    const otherMerged = land(ws, 'claude/tag-colors', { subject: 'feat(tags): color tags (#61)' });
    git(work, ['fetch', '-q', 'origin']);
    const merged = land(ws, 'claude/share-links', { subject: 'feat(share): add share links (#62)' });
    finish(ws, {
      prs: [
        pr({ number: 61, title: 'feat(tags): color tags', headRefName: 'claude/tag-colors', headRefOid: other, state: 'MERGED', mergeCommit: otherMerged }),
        pr({ number: 62, title: 'feat(share): add share links', headRefName: 'claude/share-links', headRefOid: share, state: 'MERGED', mergeCommit: merged }),
      ],
    });
    git(work, ['update-ref', 'refs/remotes/origin/main', otherMerged]);
    startLeftoverServer(ws, dir, 'metro');
    return {
      cwd: wt('share-links'),
      vars: { head: share, dir: join(ws, wt('share-links')) },
      check: [
        { kind: 'cleanup', path: wt('share-links'), cmds: ['dev:remove'] },
        { kind: 'present', path: wt('share-links') }, { kind: 'detachedAt', path: wt('share-links') },
        { kind: 'branchGone', name: 'claude/share-links' },
        { kind: 'present', path: wt('tag-colors') }, { kind: 'branchKept', name: 'claude/tag-colors' },
      ],
    };
  },

  // A branch with more than one pull request: an open one keeps it; otherwise the newest decides.
  'reopened-pr-history': (ws) => {
    const work = start(ws, projectFiles(ws));
    const first = branch(work, 'feat/retry', feature('src/retry.js', 'export const retries = 1;\n', 'feat(retry): retry once'));
    const limitsHead = branch(work, 'feat/limits', feature('src/limits.js', 'export const max = 100;\n', 'feat(limits): cap notes at 100'));
    const retryDir = worktree(work, 'retry', 'feat/retry');
    const retryTip = commit(retryDir, { 'src/retry.js': 'export const retries = 2;\n' }, 'feat(retry): retry twice');
    git(retryDir, ['push', '-q', 'origin', 'feat/retry']);
    const limitsDir = worktree(work, 'limits', 'feat/limits');
    const prs = [
      pr({ number: 70, title: 'feat(retry): retry once', headRefName: 'feat/retry', headRefOid: first, state: 'CLOSED' }),
      pr({ number: 71, title: 'feat(limits): cap notes at 100', headRefName: 'feat/limits', headRefOid: limitsHead, state: 'MERGED' }),
    ];
    prs[1].mergeCommit = land(ws, 'feat/limits', { subject: 'feat(limits): cap notes at 100 (#71)' });
    const limitsTip = commit(limitsDir, { 'src/limits.js': 'export const max = 200;\n' }, 'feat(limits): raise the cap to 200');
    git(limitsDir, ['push', '-q', 'origin', 'feat/limits']);
    prs.push(pr({ number: 72, title: 'feat(retry): retry twice', headRefName: 'feat/retry', headRefOid: retryTip, state: 'MERGED' }));
    prs[2].mergeCommit = land(ws, 'feat/retry', { subject: 'feat(retry): retry twice (#72)' });
    prs.push(pr({ number: 74, title: 'feat(limits): raise the cap to 200', headRefName: 'feat/limits', headRefOid: limitsTip, state: 'OPEN' }));
    finish(ws, { prs });
    return {
      cwd: 'work',
      check: [
        { kind: 'gone', path: wt('retry') }, { kind: 'branchGone', name: 'feat/retry' },
        { kind: 'present', path: wt('limits') }, { kind: 'branchKept', name: 'feat/limits', at: limitsTip },
      ],
    };
  },

  // Branch-only leftovers after squash merges: one carries a commit made after its PR.
  'squash-merged-branch-ahead': (ws) => {
    const work = start(ws, projectFiles(ws));
    const x = branch(work, 'feat/x', feature('src/x.js', 'export const x = 1;\n', 'feat(x): add export'));
    const y = branch(work, 'feat/y', feature('src/y.js', 'export const y = 1;\n', 'feat(y): add yearly view'));
    const xMerged = land(ws, 'feat/x', { subject: 'feat(x): add export (#80)' });
    const yMerged = land(ws, 'feat/y', { subject: 'feat(y): add yearly view (#81)' });
    const tmp = worktree(work, 'tmp-x', 'feat/x');
    const xTip = commit(tmp, { 'src/x.js': 'export const x = 2;\n// follow-up: export as PDF too\n' }, 'feat(x): start PDF export');
    git(work, ['worktree', 'remove', tmp]);
    finish(ws, {
      prs: [
        pr({ number: 80, title: 'feat(x): add export', headRefName: 'feat/x', headRefOid: x, state: 'MERGED', mergeCommit: xMerged }),
        pr({ number: 81, title: 'feat(y): add yearly view', headRefName: 'feat/y', headRefOid: y, state: 'MERGED', mergeCommit: yMerged }),
      ],
    });
    return {
      cwd: 'work',
      check: [
        { kind: 'branchKept', name: 'feat/x', at: xTip }, { kind: 'branchGone', name: 'feat/y' },
        { kind: 'branchKept', name: 'main' },
      ],
    };
  },

  // A merged worktree with a staged edit to a tracked file, beside a clean one.
  'merged-with-tracked-edit': (ws) => {
    const work = start(ws, projectFiles(ws));
    const z = branch(work, 'feat/z', feature('src/zoom.js', 'export const zoom = 1;\n', 'feat(zoom): add zoom'));
    const ok = branch(work, 'feat/ok', feature('src/ok.js', 'export const ok = true;\n', 'feat(ok): add ok button'));
    const zDir = worktree(work, 'feat-z', 'feat/z');
    worktree(work, 'feat-ok', 'feat/ok');
    write(zDir, { 'src/zoom.js': 'export const zoom = 1.5; // keep pinch zoom smooth\n' });
    git(zDir, ['add', 'src/zoom.js']);
    const prs = [
      pr({ number: 90, title: 'feat(zoom): add zoom', headRefName: 'feat/z', headRefOid: z, state: 'MERGED' }),
      pr({ number: 91, title: 'feat(ok): add ok button', headRefName: 'feat/ok', headRefOid: ok, state: 'MERGED' }),
    ];
    prs[0].mergeCommit = land(ws, 'feat/z', { subject: 'feat(zoom): add zoom (#90)' });
    prs[1].mergeCommit = land(ws, 'feat/ok', { subject: 'feat(ok): add ok button (#91)' });
    finish(ws, { prs });
    return {
      cwd: 'work',
      check: [
        { kind: 'present', path: wt('feat-z'), file: 'src/zoom.js', contains: 'pinch' }, { kind: 'branchKept', name: 'feat/z' },
        { kind: 'gone', path: wt('feat-ok') }, { kind: 'branchGone', name: 'feat/ok' },
      ],
    };
  },
};

// Fills a case's prompt placeholders, such as {head}, from the values its scenario returned.
export const fillPrompt = (prompt, vars = {}) => prompt.replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m);
export { rev };
