// Builds one scenario's workspace: origin.git (a local bare repository standing in for GitHub),
// work/ (the coordinator checkout), a stand-in gh CLI in bin/, and, for a worker case, the
// worktree the dispatcher prepared for it. Setup uses the dispatcher script from the working
// tree, the same seam a coordinator would use, so attempt state is real.
import { spawnSync } from 'node:child_process';
import { chmodSync, cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ident = ['-c', 'user.name=eval', '-c', 'user.email=eval@example.com'];

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(' ')} failed: ${r.stderr || r.stdout}`);
  return r.stdout.trim();
}
const git = (dir, ...args) => run('git', ['-C', dir, ...args]);
function writeFiles(dir, files) {
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), text);
  }
}
function commit(dir, message) {
  git(dir, 'add', '-A');
  run('git', ['-C', dir, ...ident, 'commit', '-q', '-m', message]);
}

// Returns the fixture facts the prompt and the grader need; also writes them to fixture.json.
export function build(ws, scenario, { script }) {
  const origin = join(ws, 'origin.git');
  const work = join(ws, 'work');
  run('git', ['init', '-q', '--bare', '-b', 'main', origin]);
  mkdirSync(work);
  git(work, 'init', '-q', '-b', 'main');
  git(work, 'config', 'user.name', 'eval');
  git(work, 'config', 'user.email', 'eval@example.com');
  git(work, 'remote', 'add', 'origin', origin);
  writeFileSync(join(work, '.git/info/exclude'), '.claude/\n');
  writeFiles(work, scenario.files);
  commit(work, 'feat: initial app with recorded follow-ups');
  writeFileSync(join(work, 'README.md'), `${scenario.files['README.md']}\nSee docs/follow-ups/ for recorded defects.\n`);
  commit(work, 'docs: point the README at follow-ups');
  git(work, 'push', '-q', '-u', 'origin', 'main');

  const gh = join(ws, 'gh');
  mkdirSync(gh, { recursive: true });
  const ghState = { origin, repo: 'acme/app', prs: [], nextNumber: 45 };
  writeFileSync(join(gh, 'calls.jsonl'), '');
  mkdirSync(join(ws, 'bin'), { recursive: true });
  writeFileSync(join(ws, 'bin/gh'), `#!/bin/sh\nexec node "${join(here, 'fake-gh.mjs')}" "$@"\n`);
  chmodSync(join(ws, 'bin/gh'), 0o755);

  const dispatch = (...args) => run('bash', [script, ...args], { cwd: work }).split('\t');
  const setup = scenario.setup ?? {};
  const facts = { mode: scenario.mode, selected: scenario.selected, origin, work };

  if (setup.openPr) {
    // An earlier sweep already resolved this item: its branch is on origin, PR #44 is open,
    // the attempt is marked pull-request, and its worktree was cleaned up.
    const wt = join(ws, 'earlier-worker');
    const branch = `fix/${scenario.selected.replace(/^docs\/follow-ups\/|\.md$/g, '')}-a1`;
    const [kind, , , base, , owner] = dispatch('prepare', '--repo', work, '--follow-up', scenario.selected, '--worktree', wt, '--branch', branch);
    if (kind !== 'prepared') throw new Error(`prepare gave ${kind}`);
    writeFiles(wt, setup.openPr.files);
    rmSync(join(wt, scenario.selected));
    commit(wt, setup.openPr.title);
    git(wt, 'push', '-q', 'origin', branch);
    ghState.prs.push({ number: 44, title: setup.openPr.title, body: `Resolves ${scenario.selected}.`, headRefName: branch, baseRefName: 'main', state: 'OPEN', isDraft: false });
    const url = 'https://github.com/acme/app/pull/44';
    dispatch('mark', '--repo', work, '--follow-up', scenario.selected, '--base-sha', base, '--owner', owner, '--outcome', 'pull-request', '--detail', url);
    const attemptKey = dispatch('identity', '--repo', work, '--follow-up', scenario.selected)[3];
    dispatch('cleanup', '--repo', work, '--worktree', wt, '--attempt-key', attemptKey, '--owner', owner);
    Object.assign(facts, { prBranch: branch, prUrl: url, attemptKey });
  }
  if (setup.advanceMain) {
    // An unrelated change lands on main after the PR was recorded.
    const other = mkdtempSync(join(tmpdir(), 'rfu-advance-'));
    run('git', ['clone', '-q', origin, other]);
    writeFileSync(join(other, 'CHANGELOG.md'), '# Changelog\n\n- Docs: README points at follow-ups.\n');
    commit(other, 'docs: start a changelog');
    git(other, 'push', '-q', 'origin', 'main');
    rmSync(other, { recursive: true, force: true });
  }

  let cwd = work;
  if (scenario.mode === 'worker') {
    const slug = scenario.selected.replace(/^docs\/follow-ups\/|\.md$/g, '');
    const wt = join(ws, `worker-${slug}`);
    const branch = `fix/${slug}-b7`;
    const [kind, worktree, , base, attemptKey, owner] = dispatch('prepare', '--repo', work, '--follow-up', scenario.selected, '--worktree', wt, '--branch', branch);
    if (kind !== 'prepared') throw new Error(`prepare gave ${kind}`);
    Object.assign(facts, { base, attemptKey, owner, branch, worktree });
    if (setup.staleHead) git(worktree, 'reset', '-q', '--hard', 'HEAD~1');
    if (setup.aheadCommit) {
      writeFileSync(join(worktree, 'notes.txt'), 'local experiment, not for review\n');
      commit(worktree, 'wip: local experiment');
    }
    cwd = worktree;
  }
  if (setup.breakRemote) git(work, 'remote', 'set-url', 'origin', join(ws, 'missing-origin.git'));

  writeFileSync(join(gh, 'state.json'), `${JSON.stringify(ghState, null, 2)}\n`);
  facts.cwd = cwd;
  facts.cwdHead = git(cwd, 'rev-parse', 'HEAD');
  facts.initialMain = run('git', ['--git-dir', origin, 'rev-parse', 'refs/heads/main']);
  facts.originRefs = run('git', ['--git-dir', origin, 'for-each-ref', '--format=%(refname) %(objectname)', 'refs/heads']);
  facts.worktrees = git(work, 'worktree', 'list', '--porcelain').split('\n').filter((l) => l.startsWith('worktree ')).length;
  writeFileSync(join(ws, 'fixture.json'), `${JSON.stringify(facts, null, 2)}\n`);
  return facts;
}

// Fills a prompt template's {{name}} slots from the fixture facts.
export function fillPrompt(template, facts) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    if (facts[k] === undefined) throw new Error(`prompt needs ${k}, which the fixture does not provide`);
    return facts[k];
  });
}

// Copies skill folders into a checkout's .claude/skills, leaving out agents/ metadata.
export function installSkills(checkout, folders) {
  for (const [name, source] of folders) {
    const target = join(checkout, '.claude/skills', name);
    cpSync(source, target, { recursive: true, filter: (src) => !/^\/agents(\/|$)/.test(src.slice(source.length)) });
  }
}
