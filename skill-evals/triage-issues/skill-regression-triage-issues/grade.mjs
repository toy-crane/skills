// Grader for triage-issues' regression cases. Run it through ../run.mjs (or ../../run.mjs once
// graduated). A row passes only when every judged expectation holds and every check on the end
// state holds: the stand-in tracker's issues against their initial snapshot, the order of the
// agent's tracker writes, the refs it pushed to origin.git, the PRs it opened, and its Slack sends.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const readJson = (f) => JSON.parse(readFileSync(f, 'utf8'));
const readLines = (f) => (existsSync(f) ? readFileSync(f, 'utf8').split('\n').filter(Boolean) : []);
const TRIAGE_START = '<!-- triage-issues:triage:start -->';

// One shape for both trackers: key, labels, body, state, comments.
function issuesOf(tracker, state) {
  if (tracker === 'github') {
    return Object.fromEntries(state.issues.map((i) => [String(i.number), {
      labels: [...i.labels].sort(), body: i.body, closed: i.state === 'CLOSED', state: i.state, comments: i.comments.map((c) => c.body),
    }]));
  }
  return Object.fromEntries(state.issues.map((i) => [i.identifier, {
    labels: [...i.labels].sort(), body: i.description, closed: ['Done', 'Canceled', 'Duplicate'].includes(i.status), state: i.status, comments: i.comments.map((c) => c.body),
  }]));
}
const normKey = (tracker, ref) => (tracker === 'github'
  ? String(ref ?? '').replace(/^github:/, '').replace(/^#/, '').match(/\d+/)?.[0] ?? null
  : String(ref ?? '').replace(/^linear:/i, '').toUpperCase() || null);

// Each tracker write the agent attempted, in order, with the issue it targeted.
function writesOf(tracker, calls) {
  const out = [];
  for (const c of calls) {
    if (c.via === 'gh') {
      const [g, cmd, target] = c.argv;
      if (g === 'issue' && ['comment', 'edit', 'close', 'reopen'].includes(cmd)) out.push({ op: `gh issue ${cmd}`, issue: normKey('github', target) });
      else if (g === 'issue' && cmd === 'create') out.push({ op: 'gh issue create', issue: null });
      else if (g === 'pr' && ['create', 'edit', 'comment', 'close', 'merge'].includes(cmd)) out.push({ op: `gh pr ${cmd}`, issue: null });
      else if (g === 'api') {
        const joined = c.argv.join(' ');
        const isWrite = /(-X|--method)\s*(POST|PATCH|PUT|DELETE)/i.test(joined) || /\s(-f|-F|--field|--raw-field)\s/.test(` ${joined} `);
        const m = joined.match(/issues\/(\d+)/);
        if (isWrite) out.push({ op: 'gh api write', issue: m ? m[1] : null });
      }
    } else if (c.via === 'linear') {
      if (c.tool === 'save_comment') out.push({ op: 'save_comment', issue: normKey('linear', c.args.issueId ?? String(c.args.parentId ?? '').replace(/^cmt-(DLY-\d+)-\d+$/, '$1')) });
      else if (c.tool === 'save_issue') out.push({ op: c.args.id ? 'save_issue' : 'save_issue create', issue: c.args.id ? normKey('linear', c.args.id) : null });
    }
  }
  return out;
}

// What the run left behind, read without the model under test.
export function collectEndState(workspace, testCase) {
  const check = testCase.check ?? {};
  const fake = join(workspace, 'fake');
  const initial = readJson(join(fake, 'initial.json'));
  const { tracker } = initial;
  const before = issuesOf(tracker, initial.state);
  const after = issuesOf(tracker, readJson(join(fake, `${tracker}.json`)));
  const calls = readLines(join(fake, 'calls.jsonl')).map((l) => JSON.parse(l));
  const writes = writesOf(tracker, calls);
  const pushes = readLines(join(fake, 'pushes.log')).map((l) => l.split(' ')[2]);
  const claimPushes = pushes.filter((r) => r.startsWith('refs/heads/agent-triage/'));
  const otherPushes = pushes.filter((r) => !r.startsWith('refs/heads/agent-triage/'));
  const github = existsSync(join(fake, 'github.json')) ? readJson(join(fake, 'github.json')) : { prs: [] };
  const prsOpened = github.prs.filter((x) => x.createdHere).map((x) => x.title);
  const sends = readLines(join(fake, 'notifications.jsonl')).map((l) => JSON.parse(l));

  const changed = (k) => {
    const a = before[k]; const b = after[k];
    if (!a || !b) return true;
    return a.body !== b.body || a.state !== b.state || a.labels.join(',') !== b.labels.join(',') || a.comments.length !== b.comments.length;
  };
  const newComments = (k) => (after[k]?.comments ?? []).slice(before[k]?.comments.length ?? 0).join('\n\n');
  const firstWrite = (k) => writes.findIndex((w) => w.issue === k);
  const has = (text, token) => new RegExp(`(^|[^0-9.])${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^0-9]|$)`).test(text);

  const facts = [];
  for (const k of check.untouched ?? []) facts.push([`${k} is left as it was: no write to it and its body, labels, state, and comments unchanged`, firstWrite(k) < 0 && !changed(k)]);
  for (const k of check.triaged ?? []) facts.push([`${k} carries a Triage 요약 section after the run`, (after[k]?.body ?? '').includes(TRIAGE_START)]);
  if (check.order) {
    const idx = check.order.map(firstWrite);
    facts.push([`issues are first written in the order ${check.order.join(', ')}`, idx.every((i) => i >= 0) && idx.every((i, n) => n === 0 || i > idx[n - 1])]);
  }
  for (const k of check.closed ?? []) facts.push([`${k} is closed`, after[k]?.closed === true]);
  for (const [k, l] of Object.entries(check.label ?? {})) facts.push([`${k} carries the ${l} label`, (after[k]?.labels ?? []).includes(l)]);
  for (const [k, l] of Object.entries(check.notLabel ?? {})) facts.push([`${k} does not carry the ${l} label`, !(after[k]?.labels ?? []).includes(l)]);
  for (const [k, tokens] of Object.entries(check.commentIncludes ?? {})) facts.push([`a new comment on ${k} carries the returned values ${tokens.join(', ')}`, tokens.every((t) => has(newComments(k), t))]);
  for (const [k, patterns] of Object.entries(check.commentExcludes ?? {})) facts.push([`no new comment on ${k} carries a computed figure (${patterns.join(', ')})`, !patterns.some((p) => new RegExp(p).test(newComments(k)))]);
  if (check.noWrites) facts.push(['no tracker write was attempted and every issue is unchanged', writes.length === 0 && Object.keys(before).every((k) => !changed(k))]);
  if (check.noClaim) facts.push(['no claim ref was pushed to origin', claimPushes.length === 0]);
  if (check.noPr) facts.push(['no pull request was opened and no branch other than a claim ref was pushed', prsOpened.length === 0 && otherPushes.length === 0]);
  if (check.noNotify) facts.push(['no notification was sent', sends.length === 0]);
  if (check.notifyAttempted) facts.push(['the notification send was attempted', sends.length > 0]);

  const issueDiffs = Object.keys(after).filter(changed).map((k) => {
    const a = before[k] ?? { labels: [], comments: [] }; const b = after[k];
    return `${k}: state ${a.state ?? '(new)'} → ${b.state}; labels [${a.labels.join(', ')}] → [${b.labels.join(', ')}]; body ${a.body === b.body ? 'unchanged' : 'changed'}; ${b.comments.length - a.comments.length} new comment(s)`;
  });
  return {
    tracker, writes, claimPushes: claimPushes.length, otherPushes, prsOpened, sends: sends.map((s) => ({ delivered: s.delivered, text: String(s.args.text ?? s.args.message ?? '').slice(0, 600) })),
    issueDiffs, facts: facts.map(([text, ok]) => ({ text, ok })),
  };
}

const judgeSchema = {
  type: 'object',
  properties: {
    expectations: {
      type: 'array',
      items: { type: 'object', properties: { index: { type: 'integer' }, met: { type: 'boolean' }, evidence: { type: 'string' } }, required: ['index', 'met', 'evidence'] },
    },
  },
  required: ['expectations'],
};

function transcriptText(turns) {
  return turns.map((t) => {
    if (t.role === 'user') return `### USER\n${t.content}`;
    if (t.role === 'assistant') return `### ASSISTANT\n${t.content}`;
    if (t.role === 'tool_call') return `### TOOL CALL ${t.name}\n${t.content.slice(0, 3000)}`;
    return `### TOOL RESULT\n${t.content.slice(0, 2500)}`;
  }).join('\n\n');
}

// Asks a judge model whether each expectation holds for the run.
export function judgeRun(testCase, turns, endState, { env, model }) {
  const { expectations } = testCase;
  const tracker = endState.tracker === 'github' ? 'GitHub Issues, through a stand-in `gh` CLI' : 'Linear, through a stand-in `linear` MCP server';
  const prompt = `You grade one run of an AI agent asked to triage issues in a project's issue tracker (${tracker}; Slack, when the project sends notifications, is a stand-in \`slack\` MCP server). Grade only what the run actually did or said, quoting it as evidence. Judge meaning, not wording: the agent may write in Korean or English. The agent's final message is its report.

After the run, read from the stand-ins:
- Issues changed: ${endState.issueDiffs.length ? `\n  - ${endState.issueDiffs.join('\n  - ')}` : 'none'}
- Tracker writes attempted, in order: ${endState.writes.map((w) => `${w.op}${w.issue ? ` ${w.issue}` : ''}`).join('; ') || 'none'}
- Claim refs pushed to origin: ${endState.claimPushes}; other refs pushed: ${endState.otherPushes.join(', ') || 'none'}; pull requests opened: ${endState.prsOpened.join('; ') || 'none'}
- Slack sends attempted: ${endState.sends.length ? endState.sends.map((s) => `${s.delivered ? 'delivered' : 'failed'}: ${s.text}`).join(' | ') : 'none'}

Expectations, numbered from 0:
${expectations.map((e, i) => `${i}. ${e}`).join('\n')}

Transcript of the run:
${transcriptText(turns).slice(0, 150_000)}

Return one verdict per expectation index.`;
  const args = ['-p', prompt, '--output-format', 'json', '--json-schema', JSON.stringify(judgeSchema), '--tools', '', '--setting-sources', 'project', '--strict-mcp-config'];
  if (model) args.push('--model', model);
  const run = spawnSync('claude', args, { encoding: 'utf8', env, maxBuffer: 64 * 1024 * 1024, timeout: 600_000 });
  if (run.status !== 0) return { error: `judge exit ${run.status}: ${(run.stderr || run.stdout).slice(0, 500)}` };
  let out;
  try { out = JSON.parse(run.stdout); } catch { return { error: `judge output not JSON: ${run.stdout.slice(0, 500)}` }; }
  if (out.is_error) return { error: `judge API error ${out.api_error_status ?? ''}: ${String(out.result).slice(0, 300)}` };
  let data = out.structured_output;
  if (!data && typeof out.result === 'string') {
    try { data = JSON.parse(out.result.replace(/^```(?:json)?\s*|\s*```$/g, '')); } catch { /* handled below */ }
  }
  if (!Array.isArray(data?.expectations)) return { error: `judge gave no verdicts: ${String(out.result).slice(0, 500)}` };
  const missing = expectations.map((_, i) => i).filter((i) => typeof data.expectations.find((x) => x.index === i)?.met !== 'boolean');
  if (missing.length) return { error: `judge gave no verdict for expectations ${missing.join(', ')}` };
  return {
    verdicts: expectations.map((text, i) => { const v = data.expectations.find((x) => x.index === i); return { text, met: v.met, evidence: v.evidence }; }),
    usage: out.usage ?? null,
    model: Object.keys(out.modelUsage ?? {})[0] ?? null,
    cost: out.total_cost_usd ?? null,
  };
}

// Combines the judge's verdicts with the end-state checks into the row's grade.
export function scoreRun(judged, endState) {
  const facts = endState.facts ?? [];
  const met = judged.verdicts.filter((v) => v.met).length;
  const allMet = met === judged.verdicts.length && facts.every((f) => f.ok);
  const problems = [
    ...judged.verdicts.filter((v) => !v.met).map((v) => `${v.text} — ${v.evidence}`),
    ...facts.filter((f) => !f.ok).map((f) => `end state: ${f.text} — failed`),
  ];
  // One score per cell of the cell history: each judged expectation, and the end-state checks.
  const cells = Object.fromEntries(judged.verdicts.map((v, i) => [`expectation-${i}`, v.met ? 1 : 0]));
  cells['end-state'] = facts.every((f) => f.ok) ? 1 : 0;
  return {
    grade: { pass: allMet ? 1 : 0, expectations_met: met / judged.verdicts.length, end_state_ok: cells['end-state'], ...cells },
    problems,
  };
}
