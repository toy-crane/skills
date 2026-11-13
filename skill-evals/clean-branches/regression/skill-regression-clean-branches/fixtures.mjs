// Builds the temporary repositories clean-branches' cases run in. Each workspace holds
// origin.git (a bare repository standing in for GitHub), work/ (the default checkout, with
// linked worktrees under work/.worktrees/), gh/ (the fake GitHub CLI's state), codex/ (the
// Codex worktree root the agent sees as CODEX_HOME), and sim/ (stand-ins for a live session
// and a left-over dev server). Everything the agent may delete sits inside the workspace,
// which lives in the OS temporary folder, never inside a real repository.
import { spawn, spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
let clock = Date.parse('2026-11-02T09:00:00Z') / 1000;
const iso = () => new Date(clock * 1000).toISOString().replace('.000', '');

export function git(cwd, args, { allowFail = false } = {}) {
  clock += 60;
  const env = {
    ...process.env, GIT_AUTHOR_NAME: 'Mina Park', GIT_AUTHOR_EMAIL: 'mina@example.com', GIT_COMMITTER_NAME: 'Mina Park',
    GIT_COMMITTER_EMAIL: 'mina@example.com', GIT_AUTHOR_DATE: `${clock} +0900`, GIT_COMMITTER_DATE: `${clock} +0900`,
  };
  const r = spawnSync('git', ['-C', cwd, ...args], { encoding: 'utf8', env });
  if (r.status !== 0 && !allowFail) throw new Error(`git ${args.join(' ')} in ${cwd}: ${r.stderr}`);
  return r;
}
export function write(cwd, files) {
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(cwd, path)), { recursive: true });
    writeFileSync(join(cwd, path), text);
  }
}
export function commit(cwd, files, message) {
  write(cwd, files);
  git(cwd, ['add', '-A']);
  git(cwd, ['commit', '-q', '-m', message]);
  return git(cwd, ['rev-parse', 'HEAD']).stdout.trim();
}
export const rev = (cwd, ref) => git(cwd, ['rev-parse', ref]).stdout.trim();

// The project files every case starts from. `cleanup` is the command list of AGENTS.md's
// `## Worktree cleanup` section, or null for none; `withScripts` adds the npm scripts it calls.
export function projectFiles(ws, { cleanup = null, withScripts = true } = {}) {
  const log = JSON.stringify(join(ws, 'cleanup.log'));
  const scripts = withScripts ? { 'dev:remove': 'node scripts/dev-remove.mjs', 'db:remove': 'node scripts/db-remove.mjs' } : {};
  const files = {
    'package.json': `${JSON.stringify({ name: 'app', private: true, type: 'module', scripts: { test: 'node --test', ...scripts } }, null, 2)}\n`,
    '.gitignore': 'node_modules/\n.dev/\n',
    'src/app.js': 'export const app = { name: \'notes\' };\n',
    'README.md': '# notes\n',
    'AGENTS.md': `# Agent notes\n\n- Run \`npm test\` before publishing a branch.\n${cleanup ? `\n## Worktree cleanup\n\nRun these inside a worktree before removing it. They stop its dev server and drop its local database.\n\n\`\`\`sh\n${cleanup.join('\n')}\n\`\`\`\n` : ''}`,
  };
  if (withScripts) {
    files['scripts/dev-remove.mjs'] = `// Stops this worktree's dev server, if one is running, and logs the call.
import { appendFileSync, existsSync, readFileSync, rmSync } from 'node:fs';
const pidFile = '.dev/metro.pid';
if (existsSync(pidFile)) {
  const pid = Number(readFileSync(pidFile, 'utf8'));
  try { process.kill(pid); } catch {}
  for (let i = 0; i < 100; i += 1) {
    try { process.kill(pid, 0); } catch { break; }
    await new Promise((r) => setTimeout(r, 50));
  }
  rmSync(pidFile);
  console.log(\`stopped dev server \${pid}\`);
} else console.log('no dev server running');
appendFileSync(${log}, \`\${process.cwd()}\\tdev:remove\\n\`);
`;
    files['scripts/db-remove.mjs'] = `// Drops this worktree's local database and logs the call.
import { appendFileSync } from 'node:fs';
console.log('local database removed');
appendFileSync(${log}, \`\${process.cwd()}\\tdb:remove\\n\`);
`;
  }
  return files;
}

// Creates origin.git seeded with `files` on main, and work/ cloned from it on main.
export function start(ws, files) {
  const seedDir = join(ws, 'seed');
  mkdirSync(seedDir, { recursive: true });
  git(seedDir, ['init', '-q', '-b', 'main']);
  commit(seedDir, files, 'chore: initial app');
  spawnSync('git', ['clone', '-q', '--bare', seedDir, join(ws, 'origin.git')]);
  rmSync(seedDir, { recursive: true, force: true });
  spawnSync('git', ['clone', '-q', join(ws, 'origin.git'), join(ws, 'work')]);
  const work = join(ws, 'work');
  git(work, ['config', 'user.name', 'Mina Park']);
  git(work, ['config', 'user.email', 'mina@example.com']);
  // Skills sit in .claude/ and worktrees in .worktrees/, both kept out of Git like an agent host does.
  writeFileSync(join(work, '.git/info/exclude'), '.claude/\n.worktrees/\n');
  mkdirSync(join(work, '.worktrees'), { recursive: true });
  return work;
}

// A branch from `from` with one commit per entry, pushed to origin. Returns its tip.
export function branch(work, name, commits, { from = 'origin/main', push = true } = {}) {
  git(work, ['branch', '-q', name, from]);
  const tmp = join(dirname(work), `tmp-${name.replace(/\W/g, '-')}`);
  git(work, ['worktree', 'add', '-q', tmp, name]);
  let tip = null;
  for (const [files, message] of commits) tip = commit(tmp, files, message);
  if (push) git(tmp, ['push', '-q', 'origin', name]);
  git(work, ['worktree', 'remove', '--force', tmp]);
  return tip ?? rev(work, name);
}

// Lands a pull request on origin main from a scratch clone: squash, merge commit, or fast-forward.
export function land(ws, branchName, { method = 'squash', subject }) {
  const other = join(ws, 'other');
  spawnSync('git', ['clone', '-q', join(ws, 'origin.git'), other]);
  if (method === 'squash') {
    git(other, ['merge', '-q', '--squash', `origin/${branchName}`]);
    git(other, ['commit', '-q', '-m', subject]);
  } else if (method === 'merge') {
    git(other, ['merge', '-q', '--no-ff', '-m', subject, `origin/${branchName}`]);
  } else {
    git(other, ['merge', '-q', '--ff-only', `origin/${branchName}`]);
  }
  git(other, ['push', '-q', 'origin', 'main']);
  const oid = rev(other, 'HEAD');
  rmSync(other, { recursive: true, force: true });
  return oid;
}

// Adds a linked worktree under work/.worktrees/<dir>. `ref` is a branch name, or a commit for detached.
export function worktree(work, dir, ref, { detach = false, path = null } = {}) {
  const target = path ?? join(work, '.worktrees', dir);
  git(work, ['worktree', 'add', '-q', ...(detach ? ['--detach'] : []), target, ref]);
  return target;
}

export function pr(fields) {
  const createdAt = fields.createdAt ?? iso();
  clock += 600;
  const out = { baseRefName: 'main', body: '', ...fields, createdAt };
  if (out.state === 'MERGED' && !out.mergedAt) out.mergedAt = iso();
  if (out.state === 'CLOSED' && !out.closedAt) out.closedAt = iso();
  return out;
}

// Writes the fake gh's state and its launcher, fetches work/, and snapshots origin's refs.
export function finish(ws, { prs = [], authed = true } = {}) {
  const work = join(ws, 'work');
  git(work, ['fetch', '-q', 'origin'], { allowFail: true });
  const ghDir = join(ws, 'gh');
  mkdirSync(ghDir, { recursive: true });
  writeFileSync(join(ghDir, 'state.json'), `${JSON.stringify({ repo: 'acme/notes', authed, prs }, null, 2)}\n`);
  writeFileSync(join(ghDir, 'calls.jsonl'), '');
  mkdirSync(join(ws, 'bin'), { recursive: true });
  writeFileSync(join(ws, 'bin/gh'), `#!/bin/sh\nexec node ${JSON.stringify(join(here, 'fake-gh.mjs'))} "$@"\n`);
  chmodSync(join(ws, 'bin/gh'), 0o755);
  writeFileSync(join(ws, 'origin-refs.txt'), originRefs(ws));
  if (!existsSync(join(ws, 'cleanup.log'))) writeFileSync(join(ws, 'cleanup.log'), '');
}
export const originRefs = (ws) => spawnSync('git', ['--git-dir', join(ws, 'origin.git'), 'for-each-ref', '--format=%(refname) %(objectname)'], { encoding: 'utf8' }).stdout;

// --- Processes -------------------------------------------------------------------------------

const waitFor = (file) => {
  for (let i = 0; i < 200 && !(existsSync(file) && readFileSync(file, 'utf8').trim()); i += 1) spawnSync('sleep', ['0.05']);
  return Number(readFileSync(file, 'utf8').trim());
};
function simScript(ws, name, body) {
  mkdirSync(join(ws, 'sim'), { recursive: true });
  const file = join(ws, 'sim', name);
  writeFileSync(file, body);
  return file;
}
function recordPid(ws, entry) {
  const file = join(ws, 'sim-pids.json');
  const all = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : [];
  all.push(entry);
  writeFileSync(file, `${JSON.stringify(all, null, 2)}\n`);
}

// A Claude Code session still open in `dir`: launched from outside the folder by a launcher
// that stays alive, so it counts as attached.
export function startSession(ws, dir, name = 'session') {
  const script = simScript(ws, 'claude-code-session.mjs', 'setInterval(() => {}, 1 << 30);\n');
  const pidFile = join(ws, 'sim', `${name}.pid`);
  const launcher = spawn('bash', ['-c', 'cd /; (cd "$1" && exec node "$2") & echo $! > "$3"; wait', '_', dir, script, pidFile], { detached: true, stdio: 'ignore' });
  launcher.unref();
  const pid = waitFor(pidFile);
  recordPid(ws, { name, kind: 'attached', pid, launcher: launcher.pid, dir });
  return pid;
}

// A dev server whose launching session has ended: reparented to PID 1, so it counts as left
// over. It writes .dev/metro.pid in `dir`, which the project's dev:remove reads to stop it.
export function startLeftoverServer(ws, dir, name = 'metro') {
  const script = simScript(ws, 'metro-dev-server.mjs', "import { mkdirSync, writeFileSync } from 'node:fs';\nmkdirSync('.dev', { recursive: true });\nwriteFileSync('.dev/metro.pid', String(process.pid));\nsetInterval(() => {}, 1 << 30);\n");
  spawnSync('bash', ['-c', '(cd "$1" && exec node "$2" >/dev/null 2>&1 &)', '_', dir, script]);
  const pid = waitFor(join(dir, '.dev/metro.pid'));
  const ppid = spawnSync('ps', ['-o', 'ppid=', '-p', String(pid)], { encoding: 'utf8' }).stdout.trim();
  if (ppid !== '1') throw new Error(`left-over server ${pid} has parent ${ppid}, not PID 1; this host cannot build the case`);
  recordPid(ws, { name, kind: 'leftover', pid, dir });
  return pid;
}

export function readPids(ws) {
  const file = join(ws, 'sim-pids.json');
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : [];
}
// True while `pid` is still this workspace's simulated process. A PID freed when dev:remove
// stopped the server can be reused by an unrelated process, so the command line must name ws/sim/.
export const alive = (ws, pid) => spawnSync('ps', ['-o', 'command=', '-p', String(pid)], { encoding: 'utf8' }).stdout.includes(join(ws, 'sim'));

// Stops every simulated process a case started that still runs. The runner calls it after
// reading the end state, and again when the case ends.
export function stopProcesses(ws) {
  for (const p of readPids(ws)) {
    for (const pid of [p.pid, p.launcher].filter(Boolean)) {
      if (alive(ws, pid)) { try { process.kill(pid, 'SIGKILL'); } catch { /* gone */ } }
    }
  }
}
