#!/usr/bin/env node
// A stand-in for the GitHub CLI over GitHub Issues and pull requests, for triage-issues' eval
// workspaces. Nothing reaches GitHub. State lives in $TRIAGE_FAKE_DIR/github.json and every call
// is logged to $TRIAGE_FAKE_DIR/calls.jsonl, so the grader reads what the agent asked GitHub to do.
// Response fields follow a real `gh issue view --json` read recorded in shapes.md.
import { spawnSync } from 'node:child_process';
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.env.TRIAGE_FAKE_DIR;
if (!dir) { console.error('fake gh: TRIAGE_FAKE_DIR is not set'); process.exit(1); }
const stateFile = join(dir, 'github.json');
const state = JSON.parse(readFileSync(stateFile, 'utf8'));
const argv = process.argv.slice(2);
appendFileSync(join(dir, 'calls.jsonl'), `${JSON.stringify({ at: new Date().toISOString(), via: 'gh', argv })}\n`);
const save = () => writeFileSync(stateFile, `${JSON.stringify(state, null, 2)}\n`);
const die = (msg, code = 1) => { console.error(msg); process.exit(code); };
const now = () => new Date().toISOString().replace(/\.\d+Z$/, 'Z');
const repoUrl = `https://github.com/${state.repo}`;

// Option parsing that keeps repeated flags and positional arguments apart.
const BOOL = new Set(['--comments', '--web', '--draft', '--fill', '--paginate', '--silent', '--include', '-i']);
function parse(args) {
  const pos = [];
  const flags = {};
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (a.startsWith('-') && a !== '-') {
      let [k, v] = a.includes('=') && a.startsWith('--') ? [a.slice(0, a.indexOf('=')), a.slice(a.indexOf('=') + 1)] : [a, undefined];
      if (v === undefined && !BOOL.has(k)) { v = args[i + 1]; i += 1; }
      (flags[k] ??= []).push(v ?? true);
    } else pos.push(a);
  }
  const one = (...names) => { for (const n of names) if (flags[n]) return flags[n].at(-1); return undefined; };
  const many = (...names) => names.flatMap((n) => flags[n] ?? []).flatMap((v) => String(v).split(',')).map((s) => s.trim()).filter(Boolean);
  return { pos, flags, one, many };
}
const readBody = (p) => {
  const file = p.one('--body-file', '-F');
  if (file !== undefined) return file === '-' ? readFileSync(0, 'utf8') : readFileSync(file, 'utf8');
  const body = p.one('--body', '-b');
  return body === undefined ? undefined : String(body);
};

function output(data, p) {
  const fields = p.one('--json');
  const jq = p.one('--jq', '-q');
  let out = data;
  if (fields && fields !== true) {
    const keys = String(fields).split(',').map((s) => s.trim());
    const pick = (o) => Object.fromEntries(keys.filter((k) => k in o).map((k) => [k, o[k]]));
    out = Array.isArray(out) ? out.map(pick) : pick(out);
  }
  const text = JSON.stringify(out, null, 2);
  if (jq) {
    const r = spawnSync('jq', ['-r', jq], { input: text, encoding: 'utf8' });
    if (r.status !== 0) die(r.stderr.trim() || 'jq failed');
    process.stdout.write(r.stdout);
  } else process.stdout.write(`${text}\n`);
}

const labelObj = (name) => ({ id: `LA_${Buffer.from(name).toString('hex').slice(0, 16)}`, name, description: (state.labels.find((l) => l.name === name) ?? {}).description ?? '', color: 'ededed' });
const issueNo = (ref) => {
  const m = String(ref ?? '').match(/(\d+)\s*$/);
  if (!m) die(`fake gh: expected an issue number, got ${ref}`);
  return Number(m[1]);
};
function findIssue(n) {
  const issue = state.issues.find((i) => i.number === n);
  if (!issue) die(`GraphQL: Could not resolve to an issue or pull request with the number of ${n}. (repository.issue)`);
  return issue;
}
function issueJson(i) {
  return {
    number: i.number, title: i.title, state: i.state, stateReason: i.stateReason ?? null, body: i.body,
    labels: i.labels.map(labelObj), assignees: [], author: { login: i.author ?? 'reporter' },
    createdAt: i.createdAt, updatedAt: i.updatedAt ?? i.createdAt, closedAt: i.closedAt ?? null,
    url: `${repoUrl}/issues/${i.number}`, id: `I_${i.number}`, milestone: null,
    comments: i.comments.map((c, k) => ({
      id: `IC_${i.number}_${k}`, author: { login: c.author }, authorAssociation: c.author === 'triage-bot' ? 'NONE' : 'OWNER', body: c.body,
      createdAt: c.createdAt, includesCreatedEdit: false, isMinimized: false, minimizedReason: '', reactionGroups: [],
      url: `${repoUrl}/issues/${i.number}#issuecomment-${1000 + k}`, viewerDidAuthor: c.author === 'triage-bot',
    })),
  };
}
function prJson(pr) {
  return {
    number: pr.number, title: pr.title, body: pr.body, state: pr.state, url: `${repoUrl}/pull/${pr.number}`,
    headRefName: pr.headRefName, baseRefName: pr.baseRefName ?? 'main', isDraft: false, mergedAt: pr.mergedAt ?? null,
    mergeCommit: pr.mergeCommit ? { oid: pr.mergeCommit } : null, createdAt: pr.createdAt, closedAt: pr.closedAt ?? null,
    author: { login: pr.author ?? 'toy-dev' }, labels: [], closingIssuesReferences: (pr.closes ?? []).map((n) => ({ number: n, url: `${repoUrl}/issues/${n}` })),
    files: (pr.files ?? []).map((path) => ({ path, additions: 1, deletions: 1 })),
  };
}
const touch = (i) => { i.updatedAt = now(); };
const addComment = (i, body) => { i.comments.push({ author: 'triage-bot', body, createdAt: now() }); touch(i); };
function editLabels(i, add, remove) {
  for (const l of add) {
    if (!state.labels.some((x) => x.name === l)) die(`could not add label: '${l}' not found`);
    if (!i.labels.includes(l)) i.labels.push(l);
  }
  i.labels = i.labels.filter((l) => !remove.includes(l));
  touch(i);
}
const matches = (i, q) => !q || q.split(/\s+/).filter((w) => w && !w.includes(':')).every((w) => `${i.title}\n${i.body}`.toLowerCase().includes(w.toLowerCase().replace(/^"|"$/g, '')));

const [group, cmd, ...rest] = argv;
const p = parse(rest);

if (group === 'auth') { console.log('github.com\n  ✓ Logged in to github.com account triage-bot (keyring)'); process.exit(0); }
if (group === 'repo' && cmd === 'view') {
  output({ name: state.repo.split('/')[1], nameWithOwner: state.repo, url: repoUrl, defaultBranchRef: { name: 'main' }, owner: { login: state.repo.split('/')[0] } }, p);
  process.exit(0);
}
if (group === 'label' && cmd === 'list') { output(state.labels.map((l) => ({ name: l.name, description: l.description ?? '', color: 'ededed' })), p); process.exit(0); }

if (group === 'issue') {
  if (cmd === 'list') {
    const st = String(p.one('--state', '-s') ?? 'open').toLowerCase();
    const labels = p.many('--label', '-l');
    const limit = Number(p.one('--limit', '-L') ?? 30);
    const list = state.issues
      .filter((i) => st === 'all' || i.state.toLowerCase() === st)
      .filter((i) => labels.every((l) => i.labels.includes(l)))
      .filter((i) => matches(i, p.one('--search', '-S')))
      .sort((a, b) => b.number - a.number).slice(0, limit).map(issueJson);
    if (p.one('--json') || p.one('--jq', '-q')) output(list, p);
    else for (const i of list) console.log(`${i.number}\t${i.state}\t${i.title}\t${i.labels.map((l) => l.name).join(', ')}\t${i.createdAt}`);
    process.exit(0);
  }
  if (cmd === 'view') {
    const i = issueJson(findIssue(issueNo(p.pos[0])));
    if (p.one('--json') || p.one('--jq', '-q')) { output(i, p); process.exit(0); }
    console.log(`title:\t${i.title}\nstate:\t${i.state}\nauthor:\t${i.author.login}\nlabels:\t${i.labels.map((l) => l.name).join(', ')}\ncomments:\t${i.comments.length}\nassignees:\t\nprojects:\t\nmilestone:\t\nnumber:\t${i.number}\n--\n${i.body}`);
    if (p.flags['--comments']) for (const c of i.comments) console.log(`--\nauthor:\t${c.author.login}\nassociation:\t${c.authorAssociation.toLowerCase()}\nedited:\tfalse\nstatus:\tnone\n--\n${c.body}`);
    process.exit(0);
  }
  if (cmd === 'comment') {
    const i = findIssue(issueNo(p.pos[0]));
    const body = readBody(p);
    if (!body) die('fake gh: comment needs --body or --body-file');
    addComment(i, body); save();
    console.log(`${repoUrl}/issues/${i.number}#issuecomment-${1000 + i.comments.length - 1}`);
    process.exit(0);
  }
  if (cmd === 'edit') {
    const i = findIssue(issueNo(p.pos[0]));
    const body = readBody(p);
    if (body !== undefined) { i.body = body; touch(i); }
    const title = p.one('--title', '-t');
    if (title) { i.title = String(title); touch(i); }
    editLabels(i, p.many('--add-label'), p.many('--remove-label'));
    save(); console.log(`${repoUrl}/issues/${i.number}`);
    process.exit(0);
  }
  if (cmd === 'close' || cmd === 'reopen') {
    const i = findIssue(issueNo(p.pos[0]));
    const c = p.one('--comment', '-c');
    if (c) addComment(i, String(c));
    if (cmd === 'close') {
      i.state = 'CLOSED'; i.closedAt = now();
      const reason = String(p.one('--reason', '-r') ?? 'completed').toLowerCase();
      i.stateReason = reason.startsWith('not') ? 'NOT_PLANNED' : reason.startsWith('dup') ? 'DUPLICATE' : 'COMPLETED';
      const dup = p.one('--duplicate-of');
      if (dup) { i.stateReason = 'DUPLICATE'; i.duplicateOf = issueNo(dup); }
    } else { i.state = 'OPEN'; i.closedAt = null; i.stateReason = 'REOPENED'; }
    touch(i); save();
    console.log(`✓ ${cmd === 'close' ? 'Closed' : 'Reopened'} issue ${state.repo}#${i.number} (${i.title})`);
    process.exit(0);
  }
  if (cmd === 'create') {
    const number = Math.max(...state.issues.map((i) => i.number), ...state.prs.map((x) => x.number)) + 1;
    state.issues.push({ number, title: String(p.one('--title', '-t') ?? ''), body: readBody(p) ?? '', state: 'OPEN', labels: p.many('--label', '-l'), comments: [], createdAt: now(), author: 'triage-bot' });
    save(); console.log(`${repoUrl}/issues/${number}`);
    process.exit(0);
  }
}

if (group === 'pr') {
  if (cmd === 'list') {
    const st = String(p.one('--state', '-s') ?? 'open').toLowerCase();
    const q = p.one('--search', '-S');
    const list = state.prs
      .filter((x) => st === 'all' || x.state.toLowerCase() === st || (st === 'closed' && x.state === 'MERGED'))
      .filter((x) => matches({ title: x.title, body: x.body }, q))
      .filter((x) => !p.one('--head', '-H') || x.headRefName === p.one('--head', '-H'))
      .map(prJson);
    if (p.one('--json') || p.one('--jq', '-q')) output(list, p);
    else for (const x of list) console.log(`${x.number}\t${x.title}\t${x.headRefName}\t${x.state}`);
    process.exit(0);
  }
  if (cmd === 'view') {
    const n = issueNo(p.pos[0]);
    const pr = state.prs.find((x) => x.number === n);
    if (!pr) die(`GraphQL: Could not resolve to a PullRequest with the number of ${n}. (repository.pullRequest)`);
    if (p.one('--json') || p.one('--jq', '-q')) output(prJson(pr), p);
    else console.log(`title:\t${pr.title}\nstate:\t${pr.state}\nnumber:\t${pr.number}\nurl:\t${repoUrl}/pull/${pr.number}\n--\n${pr.body}`);
    process.exit(0);
  }
  if (cmd === 'create') {
    const number = Math.max(...state.issues.map((i) => i.number), ...state.prs.map((x) => x.number)) + 1;
    state.prs.push({ number, title: String(p.one('--title', '-t') ?? ''), body: readBody(p) ?? '', state: 'OPEN', headRefName: String(p.one('--head', '-H') ?? ''), baseRefName: String(p.one('--base', '-B') ?? 'main'), createdAt: now(), author: 'triage-bot', createdHere: true });
    save(); console.log(`${repoUrl}/pull/${number}`);
    process.exit(0);
  }
}

if (group === 'api') {
  // Only the issue endpoints a triage run may reach for; everything else answers as unsupported.
  const p2 = parse(argv.slice(1));
  const path = String(p2.pos[0] ?? '').replace(/^\//, '').replace(/^repos\/\{owner\}\/\{repo\}/, `repos/${state.repo}`);
  const method = String(p2.one('--method', '-X') ?? (p2.flags['-f'] || p2.flags['-F'] || p2.flags['--field'] || p2.flags['--raw-field'] ? 'POST' : 'GET')).toUpperCase();
  const fields = Object.fromEntries([...(p2.flags['-f'] ?? []), ...(p2.flags['-F'] ?? []), ...(p2.flags['--field'] ?? []), ...(p2.flags['--raw-field'] ?? [])]
    .map((kv) => [String(kv).slice(0, String(kv).indexOf('=')), String(kv).slice(String(kv).indexOf('=') + 1)]));
  const m = path.match(new RegExp(`^repos/${state.repo}/issues/(\\d+)(/comments|/labels)?$`));
  if (m) {
    const i = findIssue(Number(m[1]));
    if (method === 'GET') {
      const j = issueJson(i);
      output(m[2] === '/comments' ? j.comments.map((c) => ({ id: c.id, body: c.body, user: { login: c.author.login }, created_at: c.createdAt, html_url: c.url }))
        : m[2] === '/labels' ? j.labels : { number: j.number, title: j.title, state: j.state.toLowerCase(), body: j.body, labels: j.labels, created_at: j.createdAt, html_url: j.url }, p2);
      process.exit(0);
    }
    if (method === 'POST' && m[2] === '/comments' && fields.body) { addComment(i, fields.body); save(); output({ id: 1000 + i.comments.length, body: fields.body }, p2); process.exit(0); }
    if (method === 'POST' && m[2] === '/labels') { editLabels(i, Object.values(fields), []); save(); output(i.labels.map(labelObj), p2); process.exit(0); }
    if (method === 'PATCH' && !m[2]) {
      if (fields.body !== undefined) i.body = fields.body;
      if (fields.state) { i.state = fields.state.toUpperCase(); if (i.state === 'CLOSED') i.closedAt = now(); }
      touch(i); save(); output(issueJson(i), p2); process.exit(0);
    }
  }
  die(`fake gh: this stand-in does not serve gh api ${method} ${path}; use gh issue or gh pr subcommands`);
}

die(`fake gh: unsupported command: gh ${argv.join(' ')}`);
