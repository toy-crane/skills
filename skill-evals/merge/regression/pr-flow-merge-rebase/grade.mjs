// Grader for merge's rebase-verification cases. Run it through ../../run.mjs.
// A row passes only when every judged expectation holds and every check on the
// end state the run left in origin.git holds.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const gitIn = (origin, args) => spawnSync('git', ['--git-dir', origin, ...args], { encoding: 'utf8' });
const show = (origin, rev, file) => {
  const r = gitIn(origin, ['show', `${rev}:${file}`]);
  return r.status === 0 ? r.stdout : null;
};
function runIn(origin, rev, cmd, args) {
  const wt = mkdtempSync(join(tmpdir(), 'merge-grade-'));
  gitIn(origin, ['--work-tree', wt, 'checkout', '-f', rev, '--', '.']);
  const r = spawnSync(cmd, args, { cwd: wt, encoding: 'utf8', timeout: 120_000 });
  rmSync(wt, { recursive: true, force: true });
  return r;
}
const count = (text, needle) => (text ?? '').split(needle).length - 1;

// What the run left behind, read without the model under test.
export function collectEndState(workspace, testCase) {
  const check = testCase.check ?? {};
  const origin = join(workspace, 'origin.git');
  const ghDir = join(workspace, 'gh');
  if (!existsSync(join(ghDir, 'state.json'))) return { scenario: false };
  const state = JSON.parse(readFileSync(join(ghDir, 'state.json'), 'utf8'));
  const calls = readFileSync(join(ghDir, 'calls.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l).argv.join(' '));
  const branchHead = gitIn(origin, ['rev-parse', '--verify', '-q', `refs/heads/${check.branch}`]).stdout.trim() || null;
  const merged = state.pr.state === 'MERGED';
  const end = {
    scenario: true, merged, mergeMethod: state.pr.mergeMethod ?? null, calls,
    branchPushed: branchHead !== null && branchHead !== state.initialHead,
    injected: existsSync(join(ghDir, 'injected')),
    mainTestsPass: merged ? runIn(origin, 'refs/heads/main', 'node', ['--test']).status === 0 : null,
  };
  const facts = [];
  const pushedFile = end.branchPushed ? show(origin, branchHead, check.file) : null;
  const mainFile = show(origin, 'refs/heads/main', check.file);
  if (check.kind === 'dropped') {
    if (end.branchPushed) facts.push(['the pushed PR branch keeps the dropped change', (pushedFile ?? '').includes(check.mustContain)]);
    if (merged) facts.push(['main keeps the dropped change after the merge', (mainFile ?? '').includes(check.mustContain)]);
  }
  if (check.kind === 'duplicate') {
    if (end.branchPushed) facts.push(['the pushed PR branch holds the entry once', count(pushedFile, check.needle) === 1]);
    if (merged) facts.push(['main holds the entry once after the merge', count(mainFile, check.needle) === 1]);
  }
  if (check.kind === 'semantic' && merged) {
    const probe = runIn(origin, 'refs/heads/main', 'node', ['-e', check.probe]);
    facts.push([`main keeps the PR's stated behavior (${check.expect}) after the merge`, probe.stdout.trim() === check.expect]);
  }
  if (check.kind === 'clean') {
    facts.push(['the PR is merged', merged]);
    if (merged) facts.push(['main carries the PR change', (mainFile ?? '').includes(check.mustContain)]);
  }
  if (check.kind === 'blocked') facts.push(['the blocked PR stays unmerged', !merged]);
  if (merged) facts.push(['main passes its tests after the merge', end.mainTestsPass]);
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
  const scenario = endState.scenario
    ? `The run happened in a local Git repository whose "origin" remote is a local bare repository standing in for GitHub, with a stand-in GitHub CLI. After the run: PR merged = ${endState.merged}${endState.merged ? ` (method ${endState.mergeMethod})` : ''}; PR branch pushed to origin = ${endState.branchPushed}.
GitHub CLI calls the agent made:
${endState.calls.map((c) => `- gh ${c}`).join('\n') || '(none)'}
`
    : 'The run happened in a scratch repository with no real pull request: judge what the agent did and said it would do for the situation the user described.';
  const prompt = `You grade one run of an AI agent that follows a "merge" skill: it carries a GitHub pull request through synchronization with its base branch, verification, the merge, and cleanup. Grade only what the run actually did or said, quoting it as evidence. Judge meaning, not wording: the agent may write in Korean or English.

${scenario}
Expectations, numbered from 0:
${expectations.map((e, i) => `${i}. ${e}`).join('\n')}

Transcript of the run:
${transcriptText(turns).slice(0, 150_000)}

Return one verdict per expectation index.`;
  const args = ['-p', prompt, '--output-format', 'json', '--json-schema', JSON.stringify(judgeSchema), '--tools', '', '--setting-sources', 'project'];
  if (model) args.push('--model', model);
  const run = spawnSync('claude', args, { encoding: 'utf8', env, maxBuffer: 64 * 1024 * 1024, timeout: 600_000 });
  if (run.status !== 0) return { error: `judge exit ${run.status}: ${(run.stderr || run.stdout).slice(0, 500)}` };
  let out;
  try { out = JSON.parse(run.stdout); } catch { return { error: `judge output not JSON: ${run.stdout.slice(0, 500)}` }; }
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
  return {
    grade: { pass: allMet ? 1 : 0, expectations_met: met / judged.verdicts.length, end_state_ok: facts.every((f) => f.ok) ? 1 : 0 },
    problems,
  };
}
