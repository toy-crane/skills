#!/usr/bin/env node
// A stand-in for the GitHub CLI over a local bare repository, for clean-branches' eval
// workspaces. Pull requests live in $GH_FAKE_DIR/state.json; every call is logged to
// $GH_FAKE_DIR/calls.jsonl. With `authed: false` every command fails the way an
// unauthenticated gh does, so a case can take GitHub away.
import { spawnSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.env.GH_FAKE_DIR;
if (!dir) { console.error('fake gh: GH_FAKE_DIR is not set'); process.exit(1); }
const state = JSON.parse(readFileSync(join(dir, 'state.json'), 'utf8'));
const argv = process.argv.slice(2);
appendFileSync(join(dir, 'calls.jsonl'), `${JSON.stringify({ at: new Date().toISOString(), argv })}\n`);
const die = (msg, code = 1) => { console.error(msg); process.exit(code); };
const url = (n) => `https://github.com/${state.repo}/pull/${n}`;

if (argv[0] === '--version' || argv[0] === 'version') { console.log('gh version 2.100.0 (2026-09-03)'); process.exit(0); }
if (!state.authed) {
  if (argv[0] === 'auth') die('You are not logged into any GitHub hosts. To log in, run: gh auth login', 1);
  die('To get started with GitHub CLI, please run:  gh auth login\nAlternatively, populate the GH_TOKEN environment variable with a GitHub API authentication token.', 4);
}

function prObject(pr) {
  return {
    number: pr.number, title: pr.title, body: pr.body ?? '', url: url(pr.number), state: pr.state, isDraft: false,
    headRefName: pr.headRefName, headRefOid: pr.headRefOid, baseRefName: pr.baseRefName ?? 'main',
    createdAt: pr.createdAt, updatedAt: pr.closedAt ?? pr.mergedAt ?? pr.createdAt, mergedAt: pr.mergedAt ?? null,
    closedAt: pr.closedAt ?? pr.mergedAt ?? null, closed: pr.state !== 'OPEN',
    mergeCommit: pr.mergeCommit ? { oid: pr.mergeCommit } : null, author: { login: 'mina-park' },
    headRepositoryOwner: { login: state.repo.split('/')[0] }, isCrossRepository: false,
  };
}
// Newest first, as gh lists them.
const allPrs = () => [...state.prs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

function parse(args) {
  const flags = {};
  const pos = [];
  const valued = ['json', 'jq', 'q', 'template', 't', 'head', 'H', 'base', 'B', 'state', 's', 'search', 'S', 'repo', 'R', 'limit', 'L', 'method', 'X', 'field', 'f', 'raw-field', 'F', 'author', 'A', 'label', 'header'];
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    const m = a.match(/^--?([\w-]+)(?:=(.*))?$/s);
    if (!m || a === '-') { pos.push(a); continue; }
    const [, k, v] = m;
    if (v !== undefined) flags[k] = v;
    else if (valued.includes(k) && i + 1 < args.length) { flags[k] = args[i + 1]; i += 1; } else flags[k] = true;
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
  } else if (flags.json !== undefined) process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
  else return false;
  return true;
}

const table = (prs) => prs.map((p) => `#${p.number}\t${p.title}\t${p.headRefName}\t${p.state}`).join('\n');

function listPrs(flags) {
  let prs = allPrs();
  const st = String(flags.state ?? flags.s ?? 'open').toLowerCase();
  if (st !== 'all') prs = prs.filter((p) => p.state.toLowerCase() === st);
  const head = flags.head ?? flags.H;
  if (head) prs = prs.filter((p) => p.headRefName === head);
  const base = flags.base ?? flags.B;
  if (base) prs = prs.filter((p) => (p.baseRefName ?? 'main') === base);
  const search = flags.search ?? flags.S;
  if (search) {
    for (const term of String(search).split(/\s+/).filter(Boolean)) {
      const [k, v] = term.split(':');
      if (k === 'head') prs = prs.filter((p) => p.headRefName === v);
      else if (k === 'is' && ['merged', 'closed', 'open'].includes(v)) prs = prs.filter((p) => (v === 'closed' ? p.state !== 'OPEN' : p.state.toLowerCase() === v));
      else if (k === 'is' && v === 'unmerged') prs = prs.filter((p) => p.state !== 'MERGED');
    }
  }
  return prs.slice(0, Number(flags.limit ?? flags.L ?? 30));
}

function findPr(sel) {
  if (sel === undefined) {
    const branch = spawnSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).stdout.trim();
    return allPrs().find((p) => p.headRefName === branch && p.state === 'OPEN')
      ?? allPrs().find((p) => p.headRefName === branch)
      ?? die(`no pull requests found for branch "${branch}"`);
  }
  const n = Number(String(sel).replace(/^#/, '').replace(/.*\/pull\//, ''));
  if (Number.isInteger(n) && n > 0) return state.prs.find((p) => p.number === n) ?? die(`GraphQL: Could not resolve to a PullRequest with the number of ${n}. (repository.pullRequest)`);
  return allPrs().find((p) => p.headRefName === sel && p.state === 'OPEN')
    ?? allPrs().find((p) => p.headRefName === sel)
    ?? die(`no pull requests found for branch "${sel}"`);
}

const [group, cmd, ...rest] = argv;
const { flags, pos } = parse(rest);

if (group === 'auth') {
  console.log('github.com\n  ✓ Logged in to github.com account mina-park (keyring)\n  - Active account: true\n  - Git operations protocol: https\n  - Token scopes: \'repo\', \'workflow\'');
  process.exit(0);
}
if (group === 'repo' && cmd === 'view') {
  const repo = { nameWithOwner: state.repo, name: state.repo.split('/')[1], owner: { login: state.repo.split('/')[0] }, url: `https://github.com/${state.repo}`, defaultBranchRef: { name: 'main' }, deleteBranchOnMerge: false };
  if (!emit(repo, flags)) console.log(`${state.repo}\n`);
  process.exit(0);
}
if (group === 'pr' && cmd === 'list') {
  const prs = listPrs(flags).map(prObject);
  if (!emit(prs, flags)) console.log(prs.length ? table(prs) : 'no pull requests match your search');
  process.exit(0);
}
if (group === 'pr' && cmd === 'view') {
  const pr = prObject(findPr(pos[0]));
  if (!emit(pr, flags)) console.log(`${pr.title} #${pr.number}\n${pr.state} • mina-park wants to merge into ${pr.baseRefName} from ${pr.headRefName}\n\nView this pull request on GitHub: ${pr.url}`);
  process.exit(0);
}
if (group === 'pr' && cmd === 'status') {
  console.log(table(allPrs().filter((p) => p.state === 'OPEN')) || 'no open pull requests');
  process.exit(0);
}
if (group === 'api') {
  const [path, query = ''] = String(cmd ?? '').replace(/^\//, '').split('?');
  const params = new URLSearchParams(query);
  for (const f of [flags.f, flags.F, flags.field, flags['raw-field']].filter((x) => typeof x === 'string')) {
    const [k, v] = f.split('=');
    params.set(k, v);
  }
  if (/^repos\/[^/]+\/[^/]+$/.test(path)) {
    emit({ full_name: state.repo, default_branch: 'main', delete_branch_on_merge: false }, flags.jq ? flags : { jq: '.' });
    process.exit(0);
  }
  if (/^repos\/[^/]+\/[^/]+\/pulls$/.test(path)) {
    let prs = allPrs();
    const st = params.get('state') ?? 'open';
    if (st !== 'all') prs = prs.filter((p) => (st === 'open' ? p.state === 'OPEN' : p.state !== 'OPEN'));
    const head = params.get('head');
    if (head) prs = prs.filter((p) => p.headRefName === head.split(':').pop());
    const rows = prs.map((p) => ({
      number: p.number, title: p.title, state: p.state === 'OPEN' ? 'open' : 'closed', merged_at: p.mergedAt ?? null,
      closed_at: p.closedAt ?? p.mergedAt ?? null, created_at: p.createdAt, html_url: url(p.number),
      head: { ref: p.headRefName, sha: p.headRefOid }, base: { ref: p.baseRefName ?? 'main' }, merge_commit_sha: p.mergeCommit ?? null,
    }));
    emit(rows, flags.jq ? flags : { jq: '.' });
    process.exit(0);
  }
  const m = path.match(/^repos\/[^/]+\/[^/]+\/pulls\/(\d+)$/);
  if (m) {
    const p = findPr(m[1]);
    emit({ number: p.number, title: p.title, state: p.state === 'OPEN' ? 'open' : 'closed', merged: p.state === 'MERGED', merged_at: p.mergedAt ?? null, created_at: p.createdAt, head: { ref: p.headRefName, sha: p.headRefOid }, base: { ref: 'main' }, merge_commit_sha: p.mergeCommit ?? null }, flags.jq ? flags : { jq: '.' });
    process.exit(0);
  }
  die('gh: Not Found (HTTP 404)');
}
die(`fake gh: unsupported command: gh ${argv.join(' ')}`);
