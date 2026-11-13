// Grader for pull's cases. Run it through ../../run.mjs.
// A row passes only when every judged expectation holds and every check on the
// end state the run left in work/ holds.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { lockFor } from './fixtures.mjs';

const gitIn = (work, args) => spawnSync('git', ['-C', work, ...args], { encoding: 'utf8', env: { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1' } });
const out = (work, args) => gitIn(work, args).stdout.trim();
const show = (work, rev, file) => {
  const r = gitIn(work, ['show', `${rev}:${file}`]);
  return r.status === 0 ? r.stdout : null;
};
const refOf = (work, ref) => out(work, ['rev-parse', '--verify', '-q', ref]) || null;
const isAncestor = (work, a, b) => gitIn(work, ['merge-base', '--is-ancestor', a, b]).status === 0;

// Imports `file` as it stands at HEAD and prints `expr` over its module `m`.
function probe(work, { file, expr }) {
  const text = show(work, 'HEAD', file);
  if (text === null) return null;
  const dir = mkdtempSync(join(tmpdir(), 'pull-probe-'));
  writeFileSync(join(dir, 'm.mjs'), text);
  const r = spawnSync('node', ['--input-type=module', '-e', `const m = await import(${JSON.stringify(join(dir, 'm.mjs'))}); console.log(${expr});`], { encoding: 'utf8', timeout: 30_000 });
  rmSync(dir, { recursive: true, force: true });
  return r.stdout.trim();
}

// What the run left behind, read without the model under test. `setup` is what the builder returned.
export function collectEndState(workspace, check, setup) {
  const work = join(workspace, 'work');
  const gitDir = join(work, '.git');
  const head = refOf(work, 'HEAD');
  const branch = out(work, ['symbolic-ref', '-q', '--short', 'HEAD']) || null;
  const rebasing = existsSync(join(gitDir, 'rebase-merge')) || existsSync(join(gitDir, 'rebase-apply'));
  const merging = existsSync(join(gitDir, 'MERGE_HEAD'));
  const status = out(work, ['status', '--porcelain']);
  const stashes = out(work, ['stash', 'list']);
  const end = {
    head, branch, rebasing, merging, status, stashes,
    remoteBase: refOf(work, `refs/remotes/origin/${setup.base}`),
    graph: out(work, ['log', '--graph', '--oneline', '-n', '10', 'HEAD']),
  };
  const facts = [];
  const settled = () => facts.push(['no rebase or merge is left in progress', !rebasing && !merging]);
  const onTip = () => {
    facts.push(['HEAD contains the fetched remote base tip', head !== null && isAncestor(work, setup.baseTip, head)]);
    facts.push(['the history from the base to HEAD has no merge commit', out(work, ['rev-list', '--merges', `${setup.baseTip}..HEAD`]) === '']);
  };
  const keeps = (keep = []) => {
    for (const [file, needle] of keep) facts.push([`HEAD keeps the local change in ${file} (${needle})`, (show(work, 'HEAD', file) ?? '').includes(needle)]);
  };
  const tracked = status.split('\n').filter((l) => l && !l.startsWith('??'));
  if (check.kind === 'rebased' || check.kind === 'lockfile') {
    settled();
    onTip();
    keeps(check.keep);
    if (setup.branch) facts.push([`HEAD is still on ${setup.branch}`, branch === setup.branch]);
    facts.push(['no tracked file is left modified', tracked.length === 0]);
    facts.push(['no file holds conflict markers', gitIn(work, ['grep', '-q', '-E', '^(<<<<<<<|>>>>>>>) ', 'HEAD']).status !== 0]);
    if (check.absent) facts.push([`HEAD does not carry ${check.absent} from a branch other than the base`, show(work, 'HEAD', check.absent) === null]);
    if (check.probe) facts.push([`${check.probe.file} gives ${check.probe.expr} = ${check.probe.expect}`, probe(work, check.probe) === check.probe.expect]);
  }
  if (check.kind === 'lockfile') {
    const pkgText = show(work, 'HEAD', 'package.json') ?? '{}';
    let deps = {};
    try { deps = JSON.parse(pkgText).dependencies ?? {}; } catch { /* stays empty */ }
    facts.push(['package.json keeps both the base and the local dependency', Boolean(deps.chalk && deps.yaml)]);
    facts.push(['deps.lock is what the lock script makes from package.json', show(work, 'HEAD', 'deps.lock') === lockFor(pkgText)]);
  }
  if (check.kind === 'dirty-kept') {
    for (const [file, text] of Object.entries(setup.dirtyFiles)) {
      const p = join(work, file);
      facts.push([`the uncommitted ${file} is left as it was`, existsSync(p) && readFileSync(p, 'utf8') === text]);
    }
    facts.push(['no stash entry is left behind', stashes === '']);
    for (const marker of check.markers) {
      facts.push([`no commit records the uncommitted work (${marker})`, out(work, ['log', '--all', '--format=%H', '-S', marker]) === '']);
    }
    settled();
  }
  if (check.kind === 'unchanged') {
    facts.push(['the branch head is unchanged', refOf(work, `refs/heads/${setup.branch}`) === setup.initialHead]);
    facts.push(['the branch was not rewritten in place', out(work, ['reflog', 'show', '--format=%H', `refs/heads/${setup.branch}`]).split('\n').filter(Boolean).length === setup.branchReflog]);
    facts.push(['the remote was fetched', existsSync(join(gitDir, 'FETCH_HEAD'))]);
    settled();
  }
  if (check.kind === 'held') {
    facts.push(['the remote was fetched', end.remoteBase === setup.baseTip]);
    facts.push([`${setup.branch} still points at the original work`, refOf(work, `refs/heads/${setup.branch}`) === setup.initialHead]);
    facts.push(['no resolution was committed', head === setup.initialHead || head === setup.baseTip]);
  }
  end.facts = facts.map(([text, ok]) => ({ text, ok }));
  return end;
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
  const expectations = testCase.expectations;
  const prompt = `You grade one run of an AI agent asked to bring a local Git checkout up to date with a remote base branch. The run happened in a local repository whose "origin" remote is a local bare repository standing in for GitHub; it had one turn, so a question it asks the user ends the run. Grade only what the run actually did or said, quoting it as evidence. Judge meaning, not wording: the agent may write in Korean or English.

State of the checkout after the run:
- branch: ${endState.branch ?? '(detached HEAD)'}; HEAD ${endState.head}
- rebase in progress: ${endState.rebasing}; merge in progress: ${endState.merging}
- git status --porcelain:
${endState.status || '(clean)'}
- git stash list:
${endState.stashes || '(empty)'}
- git log --graph --oneline -n 10 HEAD:
${endState.graph}

Expectations, numbered from 0:
${expectations.map((e, i) => `${i}. ${e}`).join('\n')}

Transcript of the run:
${transcriptText(turns).slice(0, 150_000)}

Return one verdict per expectation index.`;
  const args = ['-p', prompt, '--output-format', 'json', '--json-schema', JSON.stringify(judgeSchema), '--tools', '', '--setting-sources', 'project'];
  if (model) args.push('--model', model);
  const run = spawnSync('claude', args, { encoding: 'utf8', env, maxBuffer: 64 * 1024 * 1024, timeout: 600_000 });
  if (run.status !== 0) return { error: `judge exit ${run.status}: ${(run.stderr || run.stdout).slice(0, 500)}` };
  let res;
  try { res = JSON.parse(run.stdout); } catch { return { error: `judge output not JSON: ${run.stdout.slice(0, 500)}` }; }
  if (res.is_error) return { error: `judge API error ${res.api_error_status ?? ''}: ${String(res.result).slice(0, 300)}` };
  let data = res.structured_output;
  if (!data && typeof res.result === 'string') {
    try { data = JSON.parse(res.result.replace(/^```(?:json)?\s*|\s*```$/g, '')); } catch { /* handled below */ }
  }
  if (!Array.isArray(data?.expectations)) return { error: `judge gave no verdicts: ${String(res.result).slice(0, 500)}` };
  const missing = expectations.map((_, i) => i).filter((i) => typeof data.expectations.find((x) => x.index === i)?.met !== 'boolean');
  if (missing.length) return { error: `judge gave no verdict for expectations ${missing.join(', ')}` };
  return {
    verdicts: expectations.map((text, i) => { const v = data.expectations.find((x) => x.index === i); return { text, met: v.met, evidence: v.evidence }; }),
    usage: res.usage ?? null,
    model: Object.keys(res.modelUsage ?? {})[0] ?? null,
    cost: res.total_cost_usd ?? null,
  };
}

// Combines the judge's verdicts with the end-state checks into the row's grade.
// One score per cell of the cell history: each judged expectation, and the end-state checks.
// `checks_met` is the spec's metric: the share of this row's checks that hold.
export function scoreRun(judged, endState) {
  const facts = endState.facts ?? [];
  const cells = Object.fromEntries(judged.verdicts.map((v, i) => [`expectation-${i}`, v.met ? 1 : 0]));
  cells['end-state'] = facts.every((f) => f.ok) ? 1 : 0;
  const values = Object.values(cells);
  const problems = [
    ...judged.verdicts.filter((v) => !v.met).map((v) => `${v.text} — ${v.evidence}`),
    ...facts.filter((f) => !f.ok).map((f) => `end state: ${f.text} — failed`),
  ];
  return {
    grade: {
      checks_met: values.reduce((a, b) => a + b, 0) / values.length,
      pass: values.every((v) => v === 1) ? 1 : 0,
      end_state_ok: cells['end-state'],
      ...cells,
    },
    problems,
  };
}
