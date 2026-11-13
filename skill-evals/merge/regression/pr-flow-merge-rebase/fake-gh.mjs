#!/usr/bin/env node
// A stand-in for the GitHub CLI over a local bare repository, for merge's eval
// workspaces. State lives in $GH_FAKE_DIR/state.json and every call is logged to
// $GH_FAKE_DIR/calls.jsonl, so the grader reads what the agent asked GitHub to do.
// CI runs `node --test` on the PR head, so a check reports what the head does.
import { spawnSync } from 'node:child_process';
import { appendFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = process.env.GH_FAKE_DIR;
if (!dir) { console.error('fake gh: GH_FAKE_DIR is not set'); process.exit(1); }
const stateFile = join(dir, 'state.json');
const state = JSON.parse(readFileSync(stateFile, 'utf8'));
const argv = process.argv.slice(2);
appendFileSync(join(dir, 'calls.jsonl'), `${JSON.stringify({ at: new Date().toISOString(), argv })}\n`);
const save = () => writeFileSync(stateFile, `${JSON.stringify(state, null, 2)}\n`);

const git = (args, opts = {}) => spawnSync('git', args, { encoding: 'utf8', ...opts });
const bare = (args) => git(['--git-dir', state.origin, ...args]);
const refOid = (branch) => {
  const r = bare(['rev-parse', '--verify', '-q', `refs/heads/${branch}`]);
  return r.status === 0 ? r.stdout.trim() : null;
};
const url = (n) => `https://github.com/${state.repo}/pull/${n}`;
const die = (msg, code = 1) => { console.error(msg); process.exit(code); };

// CI: `node --test` on a commit, cached by commit id.
function ciFor(oid) {
  if (!oid) return [];
  state.ci ??= {};
  if (!state.ci[oid]) {
    const wt = mkdtempSync(join(tmpdir(), 'fake-ci-'));
    git(['--git-dir', state.origin, '--work-tree', wt, 'checkout', '-f', oid, '--', '.']);
    const run = spawnSync('node', ['--test'], { cwd: wt, encoding: 'utf8', timeout: 120_000 });
    rmSync(wt, { recursive: true, force: true });
    state.ci[oid] = run.status === 0 ? 'SUCCESS' : 'FAILURE';
    save();
  }
  const conclusion = state.ci[oid];
  return [{
    __typename: 'CheckRun', name: 'test', workflowName: 'CI', status: 'COMPLETED', conclusion,
    state: conclusion, bucket: conclusion === 'SUCCESS' ? 'pass' : 'fail', isRequired: true,
    detailsUrl: `https://github.com/${state.repo}/actions/runs/1`, link: `https://github.com/${state.repo}/actions/runs/1`,
  }];
}

function isAncestor(a, b) {
  return bare(['merge-base', '--is-ancestor', a, b]).status === 0;
}

function prObject(pr) {
  const headRefOid = refOid(pr.headRefName);
  const baseRefOid = refOid(pr.baseRefName);
  const behind = headRefOid && baseRefOid && !isAncestor(baseRefOid, headRefOid);
  const checks = pr.state === 'OPEN' ? ciFor(headRefOid) : [];
  const failing = checks.some((c) => c.conclusion !== 'SUCCESS');
  let mergeStateStatus = 'CLEAN';
  if (failing) mergeStateStatus = 'BLOCKED';
  else if (behind && state.requireUpToDate) mergeStateStatus = 'BEHIND';
  const commits = headRefOid && baseRefOid
    ? bare(['log', '--format=%H%x1f%s%x1f%B%x1e', `${baseRefOid}..${headRefOid}`]).stdout.split('\x1e').map((s) => s.trim()).filter(Boolean)
      .map((s) => { const [oid, headline, body] = s.split('\x1f'); return { oid, messageHeadline: headline, messageBody: body.split('\n').slice(1).join('\n').trim() }; })
    : [];
  const files = headRefOid && baseRefOid
    ? bare(['diff', '--name-only', `${baseRefOid}...${headRefOid}`]).stdout.split('\n').filter(Boolean).map((path) => ({ path }))
    : [];
  return {
    number: pr.number, title: pr.title, body: pr.body, url: url(pr.number), state: pr.state,
    isDraft: false, headRefName: pr.headRefName, baseRefName: pr.baseRefName, headRefOid,
    baseRefOid, headRepositoryOwner: { login: state.repo.split('/')[0] }, isCrossRepository: false,
    mergeable: pr.state === 'OPEN' ? 'MERGEABLE' : 'UNKNOWN', mergeStateStatus: pr.state === 'OPEN' ? mergeStateStatus : 'UNKNOWN',
    reviewDecision: pr.reviewDecision ?? 'APPROVED', statusCheckRollup: checks, autoMergeRequest: null,
    mergedAt: pr.mergedAt ?? null, mergeCommit: pr.mergeCommit ? { oid: pr.mergeCommit } : null,
    commits, files, author: { login: 'eval-bot' }, labels: [], closingIssuesReferences: [],
    reviewRequests: [], latestReviews: [], comments: [],
  };
}

function allPrs() { return [state.pr, ...(state.otherPrs ?? [])]; }
function findPr(sel) {
  if (!sel) {
    const branch = git(['branch', '--show-current']).stdout.trim();
    return allPrs().find((p) => p.headRefName === branch && p.state === 'OPEN') ?? die(`no pull requests found for branch "${branch}"`);
  }
  const n = Number(String(sel).replace(/^#/, '').replace(/.*\/pull\//, ''));
  return allPrs().find((p) => p.number === n || p.headRefName === sel) ?? die(`GraphQL: Could not resolve to a PullRequest with the number of ${sel}. (repository.pullRequest)`);
}

// Splits gh-style args into positionals and flags.
function parse(args) {
  const flags = {};
  const pos = [];
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split(/=(.*)/s);
      const takesValue = ['json', 'jq', 'q', 'template', 'head', 'base', 'state', 'search', 'title', 'body', 'body-file', 'subject', 'match-head-commit', 'repo', 'R', 'limit', 'L', 'method', 'X', 'field', 'f', 'raw-field', 'F', 'author', 'label', 'H', 'header'].includes(k);
      if (v !== undefined) flags[k] = v;
      else if (takesValue && i + 1 < args.length) { flags[k] = args[i + 1]; i += 1; } else flags[k] = true;
    } else if (/^-[a-zA-Z]$/.test(a)) {
      const k = a.slice(1);
      const takesValue = ['q', 't', 'b', 'R', 'L', 'X', 'f', 'F', 'H', 'B', 'H'].includes(k);
      if (takesValue && i + 1 < args.length) { flags[k] = args[i + 1]; i += 1; } else flags[k] = true;
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

// Merges a PR into its base inside a scratch clone, then pushes the base.
function merge(pr, method, flags) {
  const head = refOid(pr.headRefName);
  const base = refOid(pr.baseRefName);
  if (flags['match-head-commit'] && flags['match-head-commit'] !== head) die('GraphQL: Head branch was modified. Review and try the merge again. (mergePullRequest)');
  if (state.requireUpToDate && !isAncestor(base, head)) die(`X Pull request ${state.repo}#${pr.number} is not mergeable: the head branch is not up to date with the base branch.`);
  if (ciFor(head).some((c) => c.conclusion !== 'SUCCESS')) die(`X Pull request ${state.repo}#${pr.number} is not mergeable: the base branch policy prohibits the merge.`);
  const wt = mkdtempSync(join(tmpdir(), 'fake-merge-'));
  const env = { ...process.env, GIT_AUTHOR_NAME: 'GitHub', GIT_AUTHOR_EMAIL: 'noreply@github.com', GIT_COMMITTER_NAME: 'GitHub', GIT_COMMITTER_EMAIL: 'noreply@github.com' };
  const g = (args) => git(['-C', wt, ...args], { env });
  git(['clone', '-q', state.origin, wt]);
  g(['checkout', '-q', pr.baseRefName]);
  let ok;
  if (method === 'rebase') {
    ok = g(['checkout', '-q', '-B', 'tmp', `origin/${pr.headRefName}`]).status === 0 && g(['rebase', '-q', pr.baseRefName]).status === 0;
    ok = ok && g(['checkout', '-q', pr.baseRefName]).status === 0 && g(['merge', '-q', '--ff-only', 'tmp']).status === 0;
  } else if (method === 'squash') {
    ok = g(['merge', '-q', '--squash', `origin/${pr.headRefName}`]).status === 0;
    const subject = flags.subject ?? flags.t ?? `${pr.title} (#${pr.number})`;
    ok = ok && g(['commit', '-q', '-m', subject, '-m', flags.body ?? flags.b ?? '']).status === 0;
  } else {
    ok = g(['merge', '-q', '--no-ff', '-m', `Merge pull request #${pr.number} from ${pr.headRefName}`, `origin/${pr.headRefName}`]).status === 0;
  }
  if (!ok) { rmSync(wt, { recursive: true, force: true }); die(`X Pull request ${state.repo}#${pr.number} is not mergeable: the merge commit cannot be cleanly created.`); }
  g(['push', '-q', 'origin', pr.baseRefName]);
  const mergeCommit = g(['rev-parse', 'HEAD']).stdout.trim();
  rmSync(wt, { recursive: true, force: true });
  Object.assign(pr, { state: 'MERGED', mergedAt: new Date().toISOString(), mergeCommit, mergeMethod: method, mergedHead: head });
  if (flags['delete-branch'] || flags.d) bare(['update-ref', '-d', `refs/heads/${pr.headRefName}`]);
  save();
  console.log(`✓ ${method === 'squash' ? 'Squashed and merged' : method === 'rebase' ? 'Rebased and merged' : 'Merged'} pull request ${state.repo}#${pr.number} (${pr.title})`);
}

const [group, cmd, ...rest] = argv;
const { flags, pos } = parse(rest);

if (group === '--version' || group === 'version') { console.log('gh version 2.100.0 (2026-09-03)'); process.exit(0); }
if (group === 'auth') { console.log('github.com\n  ✓ Logged in to github.com account eval-bot (keyring)\n  - Active account: true\n  - Token scopes: \'repo\', \'workflow\''); process.exit(0); }
if (group === 'repo' && cmd === 'view') {
  emit({
    nameWithOwner: state.repo, name: state.repo.split('/')[1], owner: { login: state.repo.split('/')[0] }, url: `https://github.com/${state.repo}`,
    defaultBranchRef: { name: 'main' }, autoMergeAllowed: false, squashMergeAllowed: true, rebaseMergeAllowed: true, mergeCommitAllowed: true,
    deleteBranchOnMerge: false, viewerPermission: 'ADMIN',
  }, flags);
  process.exit(0);
}
if (group === 'pr') {
  if (cmd === 'view') {
    const pr = findPr(pos[0]);
    if (flags.json === undefined) {
      const o = prObject(pr);
      console.log(`${o.title} #${o.number}\n${o.state} • eval-bot wants to merge ${o.commits.length} commits into ${o.baseRefName} from ${o.headRefName}\n\n${o.body}\n\nView this pull request on GitHub: ${o.url}`);
    } else emit(prObject(pr), flags);
    process.exit(0);
  }
  if (cmd === 'list') {
    let prs = allPrs();
    const st = flags.state ?? flags.s ?? 'open';
    if (st !== 'all') prs = prs.filter((p) => p.state.toLowerCase() === st.toLowerCase());
    if (flags.head) prs = prs.filter((p) => p.headRefName === flags.head);
    if (flags.base) prs = prs.filter((p) => p.baseRefName === flags.base);
    if (flags.search) {
      const terms = String(flags.search).split(/\s+/).filter((t) => !t.includes(':'));
      prs = prs.filter((p) => terms.every((t) => `${p.title}\n${p.body}`.toLowerCase().includes(t.toLowerCase().replace(/"/g, ''))));
    }
    const objs = prs.map(prObject);
    if (flags.json === undefined) console.log(objs.map((o) => `${o.number}\t${o.title}\t${o.headRefName}\t${o.state}`).join('\n'));
    else emit(objs, flags);
    process.exit(0);
  }
  if (cmd === 'checks') {
    const pr = findPr(pos[0]);
    const checks = ciFor(refOid(pr.headRefName));
    if (flags.json !== undefined) emit(checks, flags);
    else console.log(checks.map((c) => `${c.name}\t${c.bucket}\t42s\t${c.link}`).join('\n'));
    process.exit(checks.every((c) => c.conclusion === 'SUCCESS') ? 0 : 1);
  }
  if (cmd === 'diff') {
    const pr = findPr(pos[0]);
    const args = flags['name-only'] ? ['diff', '--name-only'] : ['diff'];
    process.stdout.write(bare([...args, `${refOid(pr.baseRefName)}...${refOid(pr.headRefName)}`]).stdout);
    process.exit(0);
  }
  if (cmd === 'merge') {
    const pr = findPr(pos[0]);
    if (pr.state !== 'OPEN') die(`X Pull request ${state.repo}#${pr.number} (${pr.title}) was already merged`);
    if (flags.auto) die('GraphQL: Auto merge is not allowed for this repository (enablePullRequestAutoMerge)');
    if (flags['disable-auto']) { console.log('✓ Auto-merge disabled'); process.exit(0); }
    const method = flags.rebase || flags.r ? 'rebase' : flags.squash || flags.s ? 'squash' : flags.merge || flags.m ? 'merge' : null;
    if (!method) die('--merge, --rebase, or --squash required when not running interactively');
    merge(pr, method, flags);
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
  if (cmd === 'create') {
    const branch = flags.head ?? git(['branch', '--show-current']).stdout.trim();
    const existing = allPrs().find((p) => p.headRefName === branch && p.state === 'OPEN');
    if (existing) die(`a pull request for branch "${branch}" into branch "${existing.baseRefName}" already exists:\n${url(existing.number)}`);
    die('fake gh: creating a new pull request is not part of this scenario');
  }
  if (cmd === 'ready') { console.log(`✓ Pull request ${state.repo}#${findPr(pos[0]).number} is marked as "ready for review"`); process.exit(0); }
  if (cmd === 'comment') { console.log(`${url(findPr(pos[0]).number)}#issuecomment-1`); process.exit(0); }
}
if (group === 'api') {
  const path = String(cmd ?? '').replace(/^\//, '');
  if (path === 'graphql') { emit({ data: {} }, flags); process.exit(0); }
  if (/^repos\/[^/]+\/[^/]+$/.test(path)) {
    emit({ full_name: state.repo, default_branch: 'main', allow_auto_merge: false, allow_squash_merge: true, allow_rebase_merge: true, allow_merge_commit: true, delete_branch_on_merge: false }, flags);
    process.exit(0);
  }
  if (/branches\/[^/]+\/protection(\/required_status_checks)?$/.test(path)) {
    const checks = { strict: Boolean(state.requireUpToDate), contexts: ['test'] };
    emit(path.endsWith('required_status_checks') ? checks : { required_status_checks: checks, required_pull_request_reviews: null, enforce_admins: { enabled: false } }, flags);
    process.exit(0);
  }
  if (/rules\/branches\//.test(path)) { emit([], flags); process.exit(0); }
  const m = path.match(/pulls\/(\d+)$/);
  if (m) {
    const o = prObject(findPr(m[1]));
    emit({ number: o.number, title: o.title, body: o.body, state: o.state === 'OPEN' ? 'open' : 'closed', merged: o.state === 'MERGED', mergeable: true, mergeable_state: o.mergeStateStatus.toLowerCase(), head: { ref: o.headRefName, sha: o.headRefOid }, base: { ref: o.baseRefName, sha: o.baseRefOid }, html_url: o.url, auto_merge: null, merge_commit_sha: o.mergeCommit?.oid ?? null }, flags);
    process.exit(0);
  }
  die(`gh: Not Found (HTTP 404)`);
}
die(`fake gh: unsupported command: gh ${argv.join(' ')}`);
