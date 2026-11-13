#!/usr/bin/env node
// A stand-in for the GitHub CLI over a local bare repository, for resolve-follow-ups' eval
// workspaces. State lives in $GH_FAKE_DIR/state.json and every call is logged to
// $GH_FAKE_DIR/calls.jsonl, so the grader reads what the agent asked GitHub to do.
// Nothing here reaches the network: a pull request is a record in state.json.
import { spawnSync } from 'node:child_process';
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.env.GH_FAKE_DIR;
if (!dir) { console.error('fake gh: GH_FAKE_DIR is not set'); process.exit(1); }
const stateFile = join(dir, 'state.json');
const state = JSON.parse(readFileSync(stateFile, 'utf8'));
const argv = process.argv.slice(2);
appendFileSync(join(dir, 'calls.jsonl'), `${JSON.stringify({ at: new Date().toISOString(), cwd: process.cwd(), argv })}\n`);
const save = () => writeFileSync(stateFile, `${JSON.stringify(state, null, 2)}\n`);

const git = (args, opts = {}) => spawnSync('git', args, { encoding: 'utf8', ...opts });
const bare = (args) => git(['--git-dir', state.origin, ...args]);
const refOid = (branch) => {
  const r = bare(['rev-parse', '--verify', '-q', `refs/heads/${branch}`]);
  return r.status === 0 ? r.stdout.trim() : null;
};
const url = (n) => `https://github.com/${state.repo}/pull/${n}`;
const die = (msg, code = 1) => { console.error(msg); process.exit(code); };

function prObject(pr) {
  const headRefOid = refOid(pr.headRefName);
  const baseRefOid = refOid(pr.baseRefName);
  const files = headRefOid && baseRefOid
    ? bare(['diff', '--name-only', `${baseRefOid}...${headRefOid}`]).stdout.split('\n').filter(Boolean).map((path) => ({ path }))
    : [];
  return {
    number: pr.number, title: pr.title, body: pr.body, url: url(pr.number), state: pr.state,
    isDraft: Boolean(pr.isDraft), headRefName: pr.headRefName, baseRefName: pr.baseRefName, headRefOid, baseRefOid,
    mergeable: pr.state === 'OPEN' ? 'MERGEABLE' : 'UNKNOWN', mergedAt: pr.mergedAt ?? null, closedAt: pr.closedAt ?? null,
    statusCheckRollup: [], reviewDecision: '', author: { login: 'eval-bot' }, labels: [], files, comments: [],
    createdAt: pr.createdAt ?? '2026-11-13T09:00:00Z',
  };
}

function findPr(sel) {
  if (!sel) {
    const branch = git(['branch', '--show-current']).stdout.trim();
    return state.prs.find((p) => p.headRefName === branch && p.state === 'OPEN') ?? die(`no pull requests found for branch "${branch}"`);
  }
  const n = Number(String(sel).replace(/^#/, '').replace(/.*\/pull\//, ''));
  return state.prs.find((p) => p.number === n || p.headRefName === sel)
    ?? die(`GraphQL: Could not resolve to a PullRequest with the number of ${sel}. (repository.pullRequest)`);
}

// Splits gh-style args into positionals and flags.
const valued = new Set(['json', 'jq', 'q', 'template', 'head', 'H', 'base', 'B', 'state', 's', 'search', 'S', 'title', 't', 'body', 'b',
  'body-file', 'F', 'repo', 'R', 'limit', 'L', 'method', 'X', 'field', 'f', 'raw-field', 'author', 'A', 'label', 'l', 'assignee', 'a',
  'reviewer', 'r', 'milestone', 'm', 'subject', 'comment', 'c', 'match-head-commit']);
function parse(args) {
  const flags = {};
  const pos = [];
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split(/=(.*)/s);
      if (v !== undefined) flags[k] = v;
      else if (valued.has(k) && i + 1 < args.length) { flags[k] = args[i + 1]; i += 1; } else flags[k] = true;
    } else if (/^-[a-zA-Z]$/.test(a)) {
      const k = a.slice(1);
      if (valued.has(k) && i + 1 < args.length) { flags[k] = args[i + 1]; i += 1; } else flags[k] = true;
    } else pos.push(a);
  }
  return { flags, pos };
}

function emit(value, flags) {
  let out = value;
  if (typeof flags.json === 'string' && flags.json) {
    const keys = flags.json.split(',').map((s) => s.trim());
    const pick = (o) => Object.fromEntries(keys.filter((k) => k in o).map((k) => [k, o[k]]));
    out = Array.isArray(value) ? value.map(pick) : pick(value);
  }
  const jq = flags.jq ?? flags.q;
  const text = JSON.stringify(out);
  if (jq) {
    const r = spawnSync('jq', ['-r', jq], { input: text, encoding: 'utf8' });
    if (r.status !== 0) die(r.stderr);
    process.stdout.write(r.stdout);
  } else process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
}

const [group, cmd, ...rest] = argv;
const { flags, pos } = parse(rest);

if (group === '--version' || group === 'version') { console.log('gh version 2.100.0 (2026-09-03)'); process.exit(0); }
if (group === 'auth') { console.log('github.com\n  ✓ Logged in to github.com account eval-bot (keyring)\n  - Active account: true\n  - Token scopes: \'repo\', \'workflow\''); process.exit(0); }
if (group === 'repo' && cmd === 'view') {
  emit({
    nameWithOwner: state.repo, name: state.repo.split('/')[1], owner: { login: state.repo.split('/')[0] }, url: `https://github.com/${state.repo}`,
    defaultBranchRef: { name: 'main' }, viewerPermission: 'ADMIN',
  }, flags);
  process.exit(0);
}
if (group === 'pr') {
  if (cmd === 'view') {
    const pr = findPr(pos[0]);
    if (flags.json === undefined) {
      const o = prObject(pr);
      console.log(`${o.title} #${o.number}\n${o.state} • eval-bot wants to merge into ${o.baseRefName} from ${o.headRefName}\n\n${o.body}\n\nView this pull request on GitHub: ${o.url}`);
    } else emit(prObject(pr), flags);
    process.exit(0);
  }
  if (cmd === 'list') {
    let prs = state.prs;
    const st = flags.state ?? flags.s ?? 'open';
    if (st !== 'all') prs = prs.filter((p) => p.state.toLowerCase() === String(st).toLowerCase());
    const head = flags.head ?? flags.H;
    if (head) prs = prs.filter((p) => p.headRefName === head);
    const base = flags.base ?? flags.B;
    if (base) prs = prs.filter((p) => p.baseRefName === base);
    const search = flags.search ?? flags.S;
    if (search) {
      const terms = String(search).split(/\s+/).filter((t) => t && !t.includes(':'));
      prs = prs.filter((p) => terms.every((t) => `${p.title}\n${p.body}\n${p.headRefName}`.toLowerCase().includes(t.toLowerCase().replace(/"/g, ''))));
    }
    const objs = prs.map(prObject);
    if (flags.json === undefined) console.log(objs.map((o) => `${o.number}\t${o.title}\t${o.headRefName}\t${o.state}`).join('\n'));
    else emit(objs, flags);
    process.exit(0);
  }
  if (cmd === 'create') {
    const branch = flags.head ?? flags.H ?? git(['branch', '--show-current']).stdout.trim();
    if (!branch) die('could not determine the current branch');
    const base = flags.base ?? flags.B ?? 'main';
    if (!refOid(branch)) die(`pull request create failed: GraphQL: Head sha can't be blank, Base sha can't be blank, No commits between ${base} and ${branch}, Head ref must be a branch (createPullRequest)\n\nyou must first push the current branch to a remote, or use the --head flag`);
    const existing = state.prs.find((p) => p.headRefName === branch && p.state === 'OPEN');
    if (existing) die(`a pull request for branch "${branch}" into branch "${existing.baseRefName}" already exists:\n${url(existing.number)}`);
    let body = flags.body ?? flags.b ?? '';
    const bodyFile = flags['body-file'] ?? flags.F;
    if (bodyFile) body = readFileSync(bodyFile === '-' ? 0 : bodyFile, 'utf8');
    const number = Math.max(state.nextNumber ?? 1, ...state.prs.map((p) => p.number + 1));
    const pr = {
      number, title: flags.title ?? flags.t ?? branch, body, headRefName: branch, baseRefName: base, state: 'OPEN',
      isDraft: Boolean(flags.draft || flags.d), createdHead: refOid(branch), created: true, createdAt: new Date().toISOString(),
    };
    state.prs.push(pr);
    state.nextNumber = number + 1;
    save();
    console.log(url(number));
    process.exit(0);
  }
  if (cmd === 'ready') {
    const pr = findPr(pos[0]);
    pr.isDraft = Boolean(flags.undo);
    save();
    console.log(`✓ Pull request ${state.repo}#${pr.number} is ${pr.isDraft ? 'converted to draft' : 'marked as "ready for review"'}`);
    process.exit(0);
  }
  if (cmd === 'edit') {
    const pr = findPr(pos[0]);
    if (flags.title ?? flags.t) pr.title = flags.title ?? flags.t;
    if (flags['body-file']) pr.body = readFileSync(flags['body-file'] === '-' ? 0 : flags['body-file'], 'utf8');
    else if (flags.body ?? flags.b) pr.body = flags.body ?? flags.b;
    save();
    console.log(url(pr.number));
    process.exit(0);
  }
  if (cmd === 'merge') {
    const pr = findPr(pos[0]);
    if (pr.state !== 'OPEN') die(`X Pull request ${state.repo}#${pr.number} (${pr.title}) is not open`);
    Object.assign(pr, { state: 'MERGED', mergedAt: new Date().toISOString() });
    save();
    console.log(`✓ Merged pull request ${state.repo}#${pr.number} (${pr.title})`);
    process.exit(0);
  }
  if (cmd === 'close') {
    const pr = findPr(pos[0]);
    Object.assign(pr, { state: 'CLOSED', closedAt: new Date().toISOString() });
    save();
    console.log(`✓ Closed pull request ${state.repo}#${pr.number} (${pr.title})`);
    process.exit(0);
  }
  if (cmd === 'checks') { console.log('no checks reported on the branch'); process.exit(0); }
  if (cmd === 'diff') {
    const pr = findPr(pos[0]);
    const args = flags['name-only'] ? ['diff', '--name-only'] : ['diff'];
    process.stdout.write(bare([...args, `${refOid(pr.baseRefName)}...${refOid(pr.headRefName)}`]).stdout);
    process.exit(0);
  }
  if (cmd === 'comment') { console.log(`${url(findPr(pos[0]).number)}#issuecomment-1`); process.exit(0); }
}
if (group === 'api') {
  const path = String(cmd ?? '').replace(/^\//, '');
  if (/^repos\/[^/]+\/[^/]+$/.test(path)) { emit({ full_name: state.repo, default_branch: 'main' }, flags); process.exit(0); }
  const m = path.match(/pulls\/(\d+)$/);
  if (m) {
    const o = prObject(findPr(m[1]));
    emit({ number: o.number, title: o.title, body: o.body, state: o.state === 'OPEN' ? 'open' : 'closed', merged: o.state === 'MERGED', draft: o.isDraft, head: { ref: o.headRefName, sha: o.headRefOid }, base: { ref: o.baseRefName, sha: o.baseRefOid }, html_url: o.url }, flags);
    process.exit(0);
  }
  die('gh: Not Found (HTTP 404)');
}
if (group === 'issue') { console.log(''); process.exit(0); }
die(`fake gh: unsupported command: gh ${argv.join(' ')}`);
