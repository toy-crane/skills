#!/usr/bin/env node
// Stand-in MCP servers over stdio for triage-issues' eval workspaces: `linear` serves the Linear
// tools a triage run uses, and `slack` serves one send tool. Nothing reaches Linear or Slack. State
// lives in $TRIAGE_FAKE_DIR/linear.json and every tool call is logged to $TRIAGE_FAKE_DIR/calls.jsonl.
// Tool names, arguments, and response fields follow real Linear MCP reads recorded in shapes.md.
// usage: fake-mcp.mjs linear|slack
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline';

const server = process.argv[2];
const dir = process.env.TRIAGE_FAKE_DIR;
if (!dir || !['linear', 'slack'].includes(server)) { console.error('usage: TRIAGE_FAKE_DIR=<dir> fake-mcp.mjs linear|slack'); process.exit(2); }
const stateFile = join(dir, 'linear.json');
const load = () => JSON.parse(readFileSync(stateFile, 'utf8'));
const save = (s) => writeFileSync(stateFile, `${JSON.stringify(s, null, 2)}\n`);
const now = () => new Date().toISOString();
const str = { type: 'string' };
const arr = { type: 'array', items: { type: 'string' } };

const linearTools = {
  get_issue: { description: 'Retrieve detailed information about an issue by ID, including attachments, git branch name, and relations.', props: { id: str, includeRelations: { type: 'boolean' }, fields: arr }, required: ['id'] },
  list_issues: { description: "List issues in the user's Linear workspace. Results are paginated.", props: { team: str, state: str, label: str, assignee: str, query: str, limit: { type: 'number' }, orderBy: str, cursor: str, fields: arr, includeArchived: { type: 'boolean' } } },
  list_comments: { description: 'List comments on a Linear issue.', props: { issueId: str, limit: { type: 'number' }, cursor: str, orderBy: str } },
  save_comment: { description: 'Create or update a comment on a Linear issue. Pass body and issueId to start a thread, or parentId to reply.', props: { body: str, issueId: str, parentId: str, id: str }, required: ['body'] },
  save_issue: {
    description: 'Create or update a Linear issue. If id is provided, updates the existing issue. labels replaces the full label set; addLabels/removeLabels change it incrementally. patch applies partial edits to the description: ops replace {old_string,new_string}, insert_before/insert_after {anchor,text}, prepend/append {text}.',
    props: { id: str, title: str, team: str, description: str, state: str, labels: arr, addLabels: arr, removeLabels: arr, dueDate: { type: ['string', 'null'] }, duplicateOf: { type: ['string', 'null'] }, assignee: { type: ['string', 'null'] }, links: { type: 'array', items: { type: 'object' } }, patch: { type: 'array', items: { type: 'object' } }, relatedTo: arr, blockedBy: arr },
  },
  list_issue_labels: { description: 'List available issue labels in a Linear team.', props: { team: str, name: str, limit: { type: 'number' } } },
  list_issue_statuses: { description: 'List available issue statuses in a Linear team.', props: { team: str }, required: ['team'] },
  get_team: { description: 'Retrieve details of a specific Linear team.', props: { query: str }, required: ['query'] },
  list_teams: { description: 'List teams in the Linear workspace.', props: { query: str } },
};
const slackTools = {
  slack_send_message: { description: 'Send a message to a Slack channel.', props: { channel_id: str, channel: str, text: str, message: str } },
};
const tools = server === 'linear' ? linearTools : slackTools;

class ToolError extends Error {}
function findIssue(s, ref) {
  const id = String(ref ?? '').replace(/^linear:/i, '').toUpperCase();
  const issue = s.issues.find((i) => i.identifier === id || i.uuid === ref);
  if (!issue) throw new ToolError(`Entity not found: Issue - Could not find referenced Issue: ${ref}`);
  return issue;
}
const statusType = (s, name) => s.statuses.find((x) => x.name === name)?.type ?? 'backlog';
function issueView(s, i, { truncate }) {
  const desc = truncate && i.description.length > 500 ? `${i.description.slice(0, 500)}… (truncated, use \`get_issue\` for full description)` : i.description;
  return {
    id: i.identifier, uuid: i.uuid, title: i.title, description: desc, priority: { value: 0, name: 'No priority' },
    url: `https://linear.app/acme/issue/${i.identifier}`, gitBranchName: `feature/${i.identifier.toLowerCase()}`,
    createdAt: i.createdAt, updatedAt: i.updatedAt ?? i.createdAt, archivedAt: null, completedAt: i.completedAt ?? null,
    startedAt: null, canceledAt: i.canceledAt ?? null, dueDate: i.dueDate ?? null, status: i.status, statusType: statusType(s, i.status),
    labels: [...i.labels], createdBy: i.createdBy ?? 'Reporter', team: s.team.name, teamId: s.team.id,
    ...(i.duplicateOf ? { duplicateOf: i.duplicateOf } : {}),
  };
}
// A nonempty fields selection returns only those keys, plus id, as the real server does.
function pick(v, fields, keep = []) {
  if (!Array.isArray(fields) || !fields.length) return v;
  return Object.fromEntries(Object.entries(v).filter(([k]) => k === 'id' || fields.includes(k) || keep.includes(k)));
}
function applyPatch(text, ops) {
  let out = text;
  const once = (needle) => {
    const n = out.split(needle).length - 1;
    if (n !== 1) throw new ToolError(`patch anchor must match exactly once, matched ${n} times: ${String(needle).slice(0, 80)}`);
  };
  for (const op of ops) {
    if (op.op === 'replace') {
      if (op.replace_all) out = out.split(op.old_string).join(op.new_string);
      else { once(op.old_string); out = out.replace(op.old_string, () => op.new_string); }
    } else if (op.op === 'insert_before') { once(op.anchor); out = out.replace(op.anchor, () => `${op.text}${op.anchor}`); }
    else if (op.op === 'insert_after') { once(op.anchor); out = out.replace(op.anchor, () => `${op.anchor}${op.text}`); }
    else if (op.op === 'prepend') out = `${op.text}${out}`;
    else if (op.op === 'append') out = `${out}${op.text}`;
    else if (op.op === 'replace_range') {
      once(op.from);
      const a = out.indexOf(op.from); const b = out.indexOf(op.to, a + op.from.length);
      if (b < 0) throw new ToolError('patch replace_range: `to` not found after `from`');
      out = `${out.slice(0, a)}${op.new_string}${out.slice(b)}`;
    } else throw new ToolError(`unknown patch op: ${op.op}`);
  }
  return out;
}
function checkLabels(s, names) {
  for (const n of names) if (!s.labels.includes(n)) throw new ToolError(`Label not found: ${n}`);
}

function callLinear(name, a) {
  const s = load();
  switch (name) {
    case 'get_issue': {
      const i = findIssue(s, a.id);
      const v = issueView(s, i, { truncate: false });
      v.attachments = []; v.documents = [];
      if (a.includeRelations) v.relations = { blocks: [], blockedBy: [], relatedTo: [], duplicateOf: i.duplicateOf ?? null };
      return pick(v, a.fields, a.includeRelations ? ['relations'] : []);
    }
    case 'list_issues': {
      let list = s.issues;
      if (a.state) {
        const st = String(a.state).toLowerCase();
        list = list.filter((i) => i.status.toLowerCase() === st || statusType(s, i.status) === st);
      }
      if (a.label) list = list.filter((i) => i.labels.includes(a.label));
      if (a.query) list = list.filter((i) => `${i.title}\n${i.description}`.toLowerCase().includes(String(a.query).toLowerCase()));
      if (!a.includeArchived) list = list.filter((i) => !['completed', 'canceled'].includes(statusType(s, i.status)) || a.state);
      const key = a.orderBy === 'createdAt' ? 'createdAt' : 'updatedAt';
      list = [...list].sort((x, y) => String(y[key] ?? y.createdAt).localeCompare(String(x[key] ?? x.createdAt)));
      return { issues: list.slice(0, a.limit ?? 50).map((i) => pick(issueView(s, i, { truncate: true }), a.fields)), hasNextPage: false };
    }
    case 'list_comments': {
      const i = findIssue(s, a.issueId);
      return { comments: i.comments.map((c) => ({ id: c.id, body: c.body, attachments: [], createdAt: c.createdAt, updatedAt: c.createdAt, parentId: c.parentId ?? null, resolvedAt: null, quotedText: null, author: { id: `user-${c.author}`, name: c.author }, onBehalfOf: null })), hasNextPage: false };
    }
    case 'save_comment': {
      if (a.id) throw new ToolError('this workspace does not allow editing existing comments');
      let i;
      if (a.parentId) i = s.issues.find((x) => x.comments.some((c) => c.id === a.parentId));
      else i = findIssue(s, a.issueId);
      if (!i) throw new ToolError(`Entity not found: Comment - ${a.parentId}`);
      const c = { id: `cmt-${i.identifier}-${i.comments.length + 1}`, body: a.body, createdAt: now(), author: 'Robo', parentId: a.parentId ?? null };
      i.comments.push(c); i.updatedAt = now(); save(s);
      return { id: c.id, body: c.body, attachments: [], createdAt: c.createdAt, updatedAt: c.createdAt, parentId: c.parentId, resolvedAt: null, quotedText: null, author: { id: 'user-Robo', name: 'Robo' }, onBehalfOf: null };
    }
    case 'save_issue': {
      if (!a.id) {
        if (!a.title || !a.team) throw new ToolError('creating an issue needs title and team');
        const n = Math.max(...s.issues.map((i) => Number(i.identifier.split('-')[1]))) + 1;
        const i = { identifier: `${s.team.key}-${n}`, uuid: `uuid-${n}`, title: a.title, description: a.description ?? '', status: a.state ?? 'Triage', labels: a.labels ?? [], dueDate: a.dueDate ?? null, createdAt: now(), comments: [], createdBy: 'Robo', createdHere: true };
        checkLabels(s, i.labels); s.issues.push(i); save(s);
        return issueView(s, i, { truncate: false });
      }
      const i = findIssue(s, a.id);
      if (a.labels && (a.addLabels || a.removeLabels)) throw new ToolError('labels cannot be combined with addLabels/removeLabels');
      if (a.description !== undefined && a.patch) throw new ToolError('patch is used in place of description');
      if (a.patch) i.description = applyPatch(i.description, a.patch);
      if (a.description !== undefined) i.description = a.description;
      if (a.title) i.title = a.title;
      if (a.labels) { checkLabels(s, a.labels); i.labels = [...a.labels]; }
      if (a.addLabels) { checkLabels(s, a.addLabels); for (const l of a.addLabels) if (!i.labels.includes(l)) i.labels.push(l); }
      if (a.removeLabels) i.labels = i.labels.filter((l) => !a.removeLabels.includes(l));
      if (a.state) {
        const st = s.statuses.find((x) => x.name.toLowerCase() === String(a.state).toLowerCase() || x.type === String(a.state).toLowerCase());
        if (!st) throw new ToolError(`Status not found: ${a.state}`);
        i.status = st.name;
        if (st.type === 'completed') i.completedAt = now();
        if (st.type === 'canceled') i.canceledAt = now();
      }
      if (a.duplicateOf !== undefined) { i.duplicateOf = a.duplicateOf; if (a.duplicateOf) i.status = 'Duplicate'; }
      if (a.dueDate !== undefined) i.dueDate = a.dueDate;
      i.updatedAt = now(); save(s);
      return issueView(s, i, { truncate: false });
    }
    case 'list_issue_labels': return { labels: s.labels.filter((n) => !a.name || n === a.name).map((n) => ({ id: `label-${n}`, name: n, color: '#bec2c8', description: null, archivedAt: null })), hasNextPage: false };
    case 'list_issue_statuses': return s.statuses.map((x) => ({ id: `status-${x.name}`, name: x.name, type: x.type }));
    case 'get_team': case 'list_teams': {
      const t = { id: s.team.id, name: s.team.name, key: s.team.key };
      return name === 'get_team' ? t : { teams: [t], hasNextPage: false };
    }
    default: throw new ToolError(`unknown tool ${name}`);
  }
}

function callSlack(name, a) {
  const failing = existsSync(join(dir, 'slack-fails'));
  appendFileSync(join(dir, 'notifications.jsonl'), `${JSON.stringify({ at: now(), args: a, delivered: !failing })}\n`);
  if (failing) throw new ToolError('Slack API error: not_in_channel (403). The app is not allowed to post in this channel.');
  return { ok: true, channel: a.channel_id ?? a.channel, ts: `${Date.now() / 1000}` };
}

function send(msg) { process.stdout.write(`${JSON.stringify(msg)}\n`); }
const rl = createInterface({ input: process.stdin });
rl.on('line', (line) => {
  let msg;
  try { msg = JSON.parse(line); } catch { return; }
  const { id, method, params } = msg;
  if (method === 'initialize') {
    send({ jsonrpc: '2.0', id, result: { protocolVersion: params?.protocolVersion ?? '2025-06-18', capabilities: { tools: {} }, serverInfo: { name: server, version: '0.0.0-eval' } } });
  } else if (method === 'tools/list') {
    send({ jsonrpc: '2.0', id, result: { tools: Object.entries(tools).map(([n, t]) => ({ name: n, description: t.description, inputSchema: { type: 'object', properties: t.props, ...(t.required ? { required: t.required } : {}) } })) } });
  } else if (method === 'tools/call') {
    const name = params?.name; const args = params?.arguments ?? {};
    appendFileSync(join(dir, 'calls.jsonl'), `${JSON.stringify({ at: now(), via: server, tool: name, args })}\n`);
    try {
      const result = server === 'linear' ? callLinear(name, args) : callSlack(name, args);
      send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify(result) }] } });
    } catch (e) {
      if (!(e instanceof ToolError)) appendFileSync(join(dir, 'mcp-errors.log'), `${e?.stack ?? e}\n`);
      send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: String(e.message ?? e) }], isError: true } });
    }
  } else if (method === 'ping') send({ jsonrpc: '2.0', id, result: {} });
  else if (id !== undefined) send({ jsonrpc: '2.0', id, error: { code: -32601, message: `method not found: ${method}` } });
});
