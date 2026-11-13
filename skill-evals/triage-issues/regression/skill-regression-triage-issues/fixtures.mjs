// Builds one triage-issues eval workspace from a scenario in scenarios.mjs:
//   <ws>/work         the project checkout the agent runs in, with an `## Issue tracker` convention
//   <ws>/origin.git   its "origin", where the claim helper pushes; a hook logs every pushed ref
//   <ws>/bin/gh       the GitHub CLI stand-in (fake-gh.mjs); the real gh is never reached
//   <ws>/mcp.json     the only MCP servers the agent gets: stand-in linear and slack (fake-mcp.mjs)
//   <ws>/fake/        tracker state, the call log, and the initial snapshot the grader compares to
// Dates are relative to the day the workspace is built (UTC), so due-date cases stay due.
import { spawnSync } from 'node:child_process';
import { chmodSync, cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const git = (cwd, args) => {
  const r = spawnSync('git', ['-c', 'user.name=dev', '-c', 'user.email=dev@example.com', ...args], { cwd, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
};
const write = (file, text) => { mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, text); };
export const day = (offset, base = new Date()) => new Date(base.getTime() + offset * 86_400_000).toISOString().slice(0, 10);
const stamp = (daysAgo) => new Date(Date.now() - daysAgo * 86_400_000).toISOString().replace(/\.\d+Z$/, 'Z');

const NOTIFY = {
  missing: '',
  none: '\nNotifications: None.\n',
  slack: '\nNotifications: send the run report to Slack `#reply-ops` (channel ID `C0OPS`) with the `slack` MCP server\'s `slack_send_message` tool.\n',
};

function githubConvention(s) {
  return `# Issue tracker convention

Tracker: GitHub Issues on \`acme/reply-app\`, through the \`gh\` CLI. Issue ID form:
\`github:#<n>\`, written as \`Issue: github:#<n>\` in \`spec.md\` and in PR bodies.
Find every issue by its number, never by title.

- Find: \`gh issue view <n> --json number,title,state,labels,body,comments,createdAt\`.
- Labels: \`gh issue edit <n> --add-label <label> --remove-label <label>\`.
- Comment: \`gh issue comment <n> --body-file <path>\`.
- Body update: \`gh issue edit <n> --body-file <path>\`. Updates are not conditional: re-read
  with \`view\` right before writing and again after, and confirm the human text is unchanged.
- Close as completed: \`gh issue close <n> --reason completed\`. Close as duplicate:
  \`gh issue close <n> --duplicate-of <m>\` after a comment linking the earlier delivery.
- Review signal: the \`in-review\` label. Active work: the \`in-progress\` label.
- Implementation PRs carry \`Closes #<n>\`; spec PRs carry only the \`Issue:\` line.

Managed body sections: \`<!-- triage-issues:triage:start -->\`/\`<!-- triage-issues:triage:end -->\`
for \`Triage 요약\`, and \`<!-- triage-issues:spec:start -->\`/\`<!-- triage-issues:spec:end -->\`.

General-issue triage is enabled. Scope: every open issue. \`needs-info\` and
\`needs-decision\` are labels. Not-yet-judged query:
\`gh issue list --state open --limit 100 --json number,title,labels,body,createdAt\`; keep issues
whose body has neither managed section and which carry none of \`needs-info\`,
\`needs-decision\`, \`in-review\`, or \`in-progress\`. Stale-review query: open issues with \`in-review\` and no open linked PR
(\`gh pr list --state open --search "<n>"\`).

Due date: a \`Due: YYYY-MM-DD\` line in the issue body. Time zone: UTC. An issue
without that line has no due date.

Check issue: created by \`merge\` with the \`post-release-check\` label; its whole body is
the bounded check section. Measurements named in it run as \`AGENTS.md\` says.
${NOTIFY[s.notifications] ?? ''}`;
}

function linearConvention(s) {
  return `# Issue tracker convention

Tracker: Linear team \`Reply\` (key \`DLY\`) through the \`linear\` MCP server. Issue ID form:
\`linear:DLY-<n>\`, written as \`Issue: linear:DLY-<n>\` in \`spec.md\` and in PR bodies.
Find every issue by its identifier, never by title. Agents write to Linear as Robo.

Statuses: \`Triage\` (new), \`Backlog\` (open general issues and waiting issues), \`Todo\`,
\`In Progress\` (active work), \`In Review\` (review signal), \`Done\`, \`Canceled\`, \`Duplicate\`.

- Find: \`get_issue\` with relations, then every page of \`list_comments\`.
- Comment: \`save_comment\` with \`issueId\`.
- Labels: \`save_issue\` with \`addLabels\` / \`removeLabels\`.
- Body update: read the latest body with \`get_issue\`, then \`save_issue\` with \`patch\`:
  \`replace\` the whole existing managed section by its exact \`old_string\`, or \`append\` it
  when absent. Never rewrite the whole \`description\`. Re-read after writing.
- Duplicate: comment with the original, then \`save_issue\` with \`duplicateOf\`.
- Already implemented: comment with the evidence, then move to \`Done\`.

Managed body sections: \`<!-- triage-issues:triage:start -->\`/\`<!-- triage-issues:triage:end -->\`
for \`Triage 요약\`, and \`<!-- triage-issues:spec:start -->\`/\`<!-- triage-issues:spec:end -->\`.

General-issue triage is enabled. Scope: open issues in \`Triage\` and \`Backlog\`.
\`needs-info\` and \`needs-decision\` are labels, and an issue carrying one stays in \`Backlog\`.
Not-yet-judged query: \`list_issues\` for team \`Reply\` in \`Triage\` and in \`Backlog\`, every
page; keep issues whose description has neither managed section and which carry neither
waiting label. Stale-review query: \`In Review\` issues with no open linked PR.

Due date: the Linear \`dueDate\` field, read from \`list_issues\`/\`get_issue\`. Time zone: UTC.

Check issue: created by \`merge\` in \`Backlog\` with the \`post-release-check\` label; its
whole description is the bounded check section. Measurements named in it run as
\`AGENTS.md\` says.
${NOTIFY[s.notifications] ?? ''}`;
}

function agentsFile(s) {
  const measure = s.measurement === 'warehouse'
    ? 'Operational measurements are BigQuery SQL files run against the production analytics warehouse with `bq query --use_legacy_sql=false < <file>`.'
    : 'Operational measurements run with `sqlite3 -header -column data/ops.db < <file>`.';
  return `# Reply app

Chat assistant that suggests replies. Source lives in \`app/\`; tests run with \`node --test\`.

${measure}

## Issue tracker

- Spec state and general-issue triage live in ${s.tracker === 'github' ? 'GitHub Issues' : 'Linear'}.
- Resume an issue already in progress only when the user explicitly requests it.
- Each spec folder names its one issue with an \`Issue:\` line in \`spec.md\`; find issues by that ID, never by title.

For issue work, read [the tracker convention](docs/issue-tracker.md).
`;
}

const triageSection = (text) => `<!-- triage-issues:triage:start -->\n## Triage 요약\n\n${text}\n<!-- triage-issues:triage:end -->\n`;

// Fills {due:<n>}, {today}, {merge}, and {triage:...} placeholders in a scenario's issue text.
function fill(text, ctx) {
  return text
    .replace(/\{due:(-?\d+)\}/g, (_, n) => day(Number(n)))
    .replace(/\{today\}/g, day(0))
    .replace(/\{merge\}/g, ctx.merge ?? '')
    .replace(/\{triage:([^}]*)\}/g, (_, t) => triageSection(t));
}

function buildRepo(ws, s, work) {
  write(join(work, 'AGENTS.md'), agentsFile(s));
  write(join(work, 'CLAUDE.md'), '@AGENTS.md\n');
  write(join(work, 'docs/issue-tracker.md'), s.tracker === 'github' ? githubConvention(s) : linearConvention(s));
  write(join(work, 'README.md'), '# Reply app\n');
  write(join(work, 'app/reply.js'), "export const replyCard = (text) => /보낼 말|words to send/.test(text) && !/\\?$/.test(text);\n");
  write(join(work, 'app/settings.js'), "export const labels = { notificationsOff: '알림 끄기', sortDefault: 'popular' };\n");
  write(join(work, 'app/reply.test.js'), "import test from 'node:test';\nimport assert from 'node:assert';\nimport { replyCard } from './reply.js';\ntest('reply card', () => assert.ok(replyCard('보낼 말 써 줘')));\n");
  write(join(work, 'package.json'), '{ "name": "reply-app", "type": "module", "private": true }\n');
  write(join(work, '.gitignore'), 'data/*.db\n.claude/\n');
  git(work, ['init', '-q', '-b', 'main']);
  git(work, ['add', '-A']);
  git(work, ['commit', '-q', '-m', 'chore: reply app']);
  const ctx = {};
  // Commits already on main, such as a merged PR that an issue duplicates.
  for (const c of s.commits ?? []) {
    for (const [file, text] of Object.entries(c.files)) write(join(work, file), text);
    git(work, ['add', '-A']);
    git(work, ['commit', '-q', '-m', c.message]);
  }
  for (const spec of s.specs ?? []) {
    // A merged spec with a post-release check; a retired one is removed again after the merge.
    git(work, ['checkout', '-q', '-b', `feat/${spec.slug}`]);
    write(join(work, `docs/specs/${spec.slug}/spec.md`), spec.spec);
    write(join(work, `docs/specs/${spec.slug}/check.sql`), spec.sql);
    git(work, ['add', '-A']);
    git(work, ['commit', '-q', '-m', `feat(${spec.slug}): ship it`, '-m', `Spec-Folder: docs/specs/${spec.slug}/`]);
    git(work, ['checkout', '-q', 'main']);
    git(work, ['merge', '-q', '--no-ff', `feat/${spec.slug}`, '-m', `Merge pull request #${spec.pr} from acme/feat/${spec.slug}`]);
    git(work, ['branch', '-q', '-D', `feat/${spec.slug}`]);
    ctx.merge = git(work, ['rev-parse', 'HEAD']);
    if (spec.retired) {
      git(work, ['rm', '-q', '-r', `docs/specs/${spec.slug}`]);
      git(work, ['commit', '-q', '-m', `docs(specs): retire shipped ${spec.slug}`]);
    }
  }
  if (s.seed) {
    mkdirSync(join(work, 'data'), { recursive: true });
    const r = spawnSync('sqlite3', [join(work, 'data/ops.db')], { input: s.seed, encoding: 'utf8' });
    if (r.status !== 0) throw new Error(`sqlite seed: ${r.stderr}`);
  }
  // origin.git stands in for GitHub's Git side; its hook records every ref a push touched.
  const origin = join(ws, 'origin.git');
  spawnSync('git', ['init', '-q', '--bare', '-b', 'main', origin]);
  write(join(origin, 'hooks/pre-receive'), `#!/bin/sh\nwhile read old new ref; do printf '%s %s %s\\n' "$old" "$new" "$ref" >> "${join(ws, 'fake/pushes.log')}"; done\n`);
  chmodSync(join(origin, 'hooks/pre-receive'), 0o755);
  git(work, ['remote', 'add', 'origin', origin]);
  spawnSync('git', ['-C', work, 'push', '-q', 'origin', 'main'], { encoding: 'utf8' });
  rmSync(join(ws, 'fake/pushes.log'), { force: true });
  git(work, ['fetch', '-q', 'origin']);
  git(work, ['branch', '-q', '--set-upstream-to', 'origin/main']);
  return ctx;
}

function githubState(s, ctx) {
  return {
    repo: 'acme/reply-app',
    labels: ['needs-info', 'needs-decision', 'in-review', 'in-progress', 'post-release-check', 'bug', 'enhancement'].map((name) => ({ name })),
    issues: s.issues.map((i) => ({
      number: i.n, title: i.title, body: fill(i.body, ctx), state: i.state ?? 'OPEN', labels: i.labels ?? [], author: i.author ?? 'reporter',
      createdAt: stamp(i.age ?? 1), comments: (i.comments ?? []).map((c) => ({ author: c.author, body: fill(c.body, ctx), createdAt: stamp(c.age ?? 0.5) })),
    })),
    prs: (s.prs ?? []).map((x) => ({ ...x, mergeCommit: x.mergeCommit === '{merge}' ? ctx.merge : x.mergeCommit, createdAt: stamp(x.age ?? 10), mergedAt: x.state === 'MERGED' ? stamp((x.age ?? 10) - 1) : null })),
  };
}

function linearState(s, ctx) {
  return {
    team: { id: 'team-reply', name: 'Reply', key: 'DLY' },
    labels: ['needs-info', 'needs-decision', 'post-release-check', 'Bug', 'Feature'],
    statuses: [['Triage', 'triage'], ['Backlog', 'backlog'], ['Todo', 'unstarted'], ['In Progress', 'started'], ['In Review', 'started'], ['Done', 'completed'], ['Canceled', 'canceled'], ['Duplicate', 'canceled']].map(([name, type]) => ({ name, type })),
    issues: s.issues.map((i) => ({
      identifier: `DLY-${i.n}`, uuid: `uuid-${i.n}`, title: i.title, description: fill(i.body, ctx), status: i.status ?? 'Triage', labels: i.labels ?? [],
      dueDate: i.due === undefined || i.due === null ? null : day(i.due), createdAt: stamp(i.age ?? 1), createdBy: i.author ?? 'Reporter',
      comments: (i.comments ?? []).map((c, k) => ({ id: `cmt-DLY-${i.n}-${k + 1}`, author: c.author, body: fill(c.body, ctx), createdAt: stamp(c.age ?? 0.5) })),
    })),
  };
}

// Builds the workspace and returns { work } for the runner.
export function buildWorkspace(ws, s) {
  const work = join(ws, 'work');
  const fake = join(ws, 'fake');
  mkdirSync(fake, { recursive: true });
  const ctx = buildRepo(ws, s, work);
  const state = s.tracker === 'github' ? githubState(s, ctx) : linearState(s, ctx);
  write(join(fake, `${s.tracker}.json`), `${JSON.stringify(state, null, 2)}\n`);
  write(join(fake, 'initial.json'), `${JSON.stringify({ tracker: s.tracker, state, merge: ctx.merge ?? null, head: git(work, ['rev-parse', 'HEAD']) }, null, 2)}\n`);
  write(join(fake, 'calls.jsonl'), '');
  if (s.notifications === 'slack' && s.slackFails) write(join(fake, 'slack-fails'), '');
  // The GitHub CLI stand-in answers even in Linear workspaces, with no PRs, so PR lookups work.
  if (s.tracker === 'linear') write(join(fake, 'github.json'), `${JSON.stringify({ repo: 'acme/reply-app', labels: [], issues: [], prs: s.prs ?? [] }, null, 2)}\n`);
  write(join(ws, 'bin/gh'), `#!/bin/sh\nexec node "${join(here, 'fake-gh.mjs')}" "$@"\n`);
  chmodSync(join(ws, 'bin/gh'), 0o755);
  const servers = {};
  if (s.tracker === 'linear') servers.linear = { command: 'node', args: [join(here, 'fake-mcp.mjs'), 'linear'], env: { TRIAGE_FAKE_DIR: fake } };
  if (s.notifications === 'slack') servers.slack = { command: 'node', args: [join(here, 'fake-mcp.mjs'), 'slack'], env: { TRIAGE_FAKE_DIR: fake } };
  write(join(ws, 'mcp.json'), `${JSON.stringify({ mcpServers: servers }, null, 2)}\n`);
  return { work, mcpServers: Object.keys(servers) };
}

// Copies skill folders into the workspace's .claude/skills/.
export function installSkills(work, skills) {
  for (const { name, dir } of skills) cpSync(dir, join(work, '.claude/skills', name), { recursive: true });
}
