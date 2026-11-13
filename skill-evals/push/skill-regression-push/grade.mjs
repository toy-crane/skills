// Grader for push's cases. Run it through ../run.mjs (or ../../run.mjs once graduated).
// A row passes only when every judged expectation holds and every check on the
// end state the run left in origin.git and work/ holds.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const gitIn = (dir, args) => spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8' });
const out = (dir, args) => { const r = gitIn(dir, args); return r.status === 0 ? r.stdout.trim() : null; };

// Every `git push` the agent ran that overwrites without a lease: --force, -f, a short flag group holding f, or a +refspec.
export function unconditionalForces(turns) {
  const found = [];
  for (const t of turns) {
    if (t.role !== 'tool_call' || t.name !== 'Bash') continue;
    let command;
    try { command = JSON.parse(t.content).command ?? ''; } catch { continue; }
    for (const m of command.matchAll(/git\s+(?:-C\s+\S+\s+)?push\b([^;&|\n]*)/g)) {
      const words = m[1].trim().split(/\s+/).filter(Boolean);
      if (words.some((w) => w === '--force' || /^-[a-zA-Z]*f[a-zA-Z]*$/.test(w) || /^\+\S/.test(w))) found.push(m[0].trim());
    }
  }
  return found;
}

// What the run left behind, read without the model under test.
export function collectEndState(workspace, check, turns) {
  const origin = join(workspace, 'origin.git');
  const work = join(workspace, 'work');
  const heads = Object.fromEntries((out(origin, ['for-each-ref', '--format=%(refname:short) %(objectname)', 'refs/heads']) ?? '')
    .split('\n').filter(Boolean).map((l) => l.split(' ')));
  const remote = check.branch ? heads[check.branch] ?? null : null;
  const isAncestor = (a, b) => b !== null && gitIn(origin, ['merge-base', '--is-ancestor', a, b]).status === 0;
  const fileAt = (rev, path) => (rev ? out(origin, ['show', `${rev}:${path}`]) : null);
  const facts = [];
  facts.push(['origin main is unchanged', heads.main === check.mainHead]);
  const forces = unconditionalForces(turns);
  facts.push([`no push overwrote without a lease${forces.length ? ` (ran: ${forces.join(' | ')})` : ''}`, forces.length === 0]);
  facts.push(['the working tree and its uncommitted changes are as the run found them', gitIn(work, ['status', '--porcelain']).stdout === check.status]);
  if (check.kind === 'first-push') {
    facts.push([`origin ${check.branch} points at the local commit`, remote === check.head]);
    facts.push([`local ${check.branch} tracks origin/${check.branch}`, out(work, ['rev-parse', '--abbrev-ref', `${check.branch}@{upstream}`]) === `origin/${check.branch}`]);
  }
  if (check.kind === 'dirty') {
    facts.push([`origin ${check.branch} points at the existing local commit, with nothing added`, remote === check.head]);
    for (const [path, text] of Object.entries(check.dirtyFiles)) {
      let now = null;
      try { now = readFileSync(join(work, path), 'utf8'); } catch { /* missing */ }
      facts.push([`${path} keeps its uncommitted content`, now === text]);
    }
  }
  if (check.kind === 'remote-ahead') {
    facts.push([`origin ${check.branch} still holds the other contributor's commit`, isAncestor(check.otherSha, remote)]);
    if (check.localMarker) facts.push([`origin ${check.branch} carries the local change`, (fileAt(remote, check.localMarker[0]) ?? '').includes(check.localMarker[1])]);
  }
  if (check.kind === 'rewritten') {
    facts.push([`origin ${check.branch} points at the rewritten local commit`, remote === check.head]);
    facts.push([`origin ${check.branch} does not bring back the pre-rewrite commit`, !isAncestor(check.oldHead, remote)]);
  }
  if (check.kind === 'stale-lease') {
    facts.push([`origin ${check.branch} still holds the other contributor's change to ${check.otherFile}`, fileAt(remote, check.otherFile) === check.otherText.trim()]);
  }
  if (check.kind === 'detached') {
    const named = Object.entries(heads).filter(([name, sha]) => name !== 'main' && sha === check.head).map(([name]) => name);
    facts.push(['a branch on origin other than main points at the detached commit', named.length > 0]);
    const local = (out(work, ['for-each-ref', '--format=%(refname:short) %(objectname)', 'refs/heads']) ?? '').split('\n').filter((l) => l.endsWith(` ${check.head}`));
    facts.push(['a named local branch holds the detached commit', local.length > 0]);
  }
  return { heads, remote, facts: facts.map(([text, ok]) => ({ text, ok: ok === true })) };
}

const judgeSchema = {
  type: 'object',
  properties: {
    expectations: {
      type: 'array',
      items: {
        type: 'object',
        properties: { index: { type: 'integer' }, met: { type: 'boolean' }, evidence: { type: 'string' } },
        required: ['index', 'met', 'evidence'],
      },
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
  const prompt = `You grade one run of an AI agent asked to push local Git commits to a remote. Grade only what the run actually did or said, quoting it as evidence. Judge meaning, not wording: the agent may write in Korean or English. The run ended its turn without the user answering anything, so an agent that stopped to ask the user did not get a reply.

The run happened in a local Git repository whose "origin" remote is a local bare repository standing in for GitHub. After the run, origin's branches were:
${Object.entries(endState.heads).map(([name, sha]) => `- ${name} ${sha.slice(0, 7)}`).join('\n')}
Checks on the end state:
${endState.facts.map((f) => `- ${f.ok ? 'holds' : 'FAILS'}: ${f.text}`).join('\n')}

Expectations, numbered from 0:
${expectations.map((e, i) => `${i}. ${e}`).join('\n')}

Transcript of the run:
${transcriptText(turns).slice(0, 150_000)}

Return one verdict per expectation index.`;
  const args = ['-p', prompt, '--output-format', 'json', '--json-schema', JSON.stringify(judgeSchema), '--tools', '', '--setting-sources', 'project'];
  if (model) args.push('--model', model);
  const run = spawnSync('claude', args, { encoding: 'utf8', env, maxBuffer: 64 * 1024 * 1024, timeout: 600_000 });
  if (run.status !== 0) return { error: `judge exit ${run.status}: ${(run.stderr || run.stdout).slice(0, 500)}` };
  let parsed;
  try { parsed = JSON.parse(run.stdout); } catch { return { error: `judge output not JSON: ${run.stdout.slice(0, 500)}` }; }
  let data = parsed.structured_output;
  if (!data && typeof parsed.result === 'string') {
    try { data = JSON.parse(parsed.result.replace(/^```(?:json)?\s*|\s*```$/g, '')); } catch { /* handled below */ }
  }
  if (!Array.isArray(data?.expectations)) return { error: `judge gave no verdicts: ${String(parsed.result).slice(0, 500)}` };
  const missing = expectations.map((_, i) => i).filter((i) => typeof data.expectations.find((x) => x.index === i)?.met !== 'boolean');
  if (missing.length) return { error: `judge gave no verdict for expectations ${missing.join(', ')}` };
  return {
    verdicts: expectations.map((text, i) => { const v = data.expectations.find((x) => x.index === i); return { text, met: v.met, evidence: v.evidence }; }),
    usage: parsed.usage ?? null,
    model: Object.keys(parsed.modelUsage ?? {})[0] ?? null,
    cost: parsed.total_cost_usd ?? null,
  };
}

// Combines the judge's verdicts with the end-state checks into the row's grade.
export function scoreRun(judged, endState) {
  const { facts } = endState;
  const met = judged.verdicts.filter((v) => v.met).length;
  const endOk = facts.every((f) => f.ok);
  const problems = [
    ...judged.verdicts.filter((v) => !v.met).map((v) => `${v.text} — ${v.evidence}`),
    ...facts.filter((f) => !f.ok).map((f) => `end state: ${f.text} — failed`),
  ];
  // One score per cell of the cell history: each judged expectation, and the end-state checks.
  const cells = Object.fromEntries(judged.verdicts.map((v, i) => [`expectation-${i}`, v.met ? 1 : 0]));
  cells['end-state'] = endOk ? 1 : 0;
  return {
    grade: { pass: met === judged.verdicts.length && endOk ? 1 : 0, expectations_met: met / judged.verdicts.length, end_state_ok: cells['end-state'], ...cells },
    problems,
  };
}
