// Grader for resolve-follow-ups' cases. Run it through ../../run.mjs.
// Each row is graded per check: every judged expectation is one check, and the end state the
// run left in origin.git, the checkout, and the stand-in GitHub is one more ("end-state").
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const gitIn = (dir, args) => spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8' });
const bare = (origin, args) => spawnSync('git', ['--git-dir', origin, ...args], { encoding: 'utf8' });

// Lines naming files that differ under src/ from `since`, committed or not.
function srcChanges(checkout, since) {
  const committed = gitIn(checkout, ['diff', '--name-only', since, 'HEAD', '--', 'src']).stdout;
  const pending = gitIn(checkout, ['status', '--porcelain', '--untracked-files=all', '--', 'src']).stdout;
  return `${committed}${pending}`.split('\n').filter(Boolean);
}

function testAt(origin, rev, hiddenTest) {
  const wt = mkdtempSync(join(tmpdir(), 'rfu-grade-'));
  bare(origin, ['--work-tree', wt, 'checkout', '-f', rev, '--', '.']);
  writeFileSync(join(wt, 'hidden.test.mjs'), hiddenTest);
  const r = spawnSync('node', ['--test'], { cwd: wt, encoding: 'utf8', timeout: 120_000 });
  rmSync(wt, { recursive: true, force: true });
  return r.status === 0;
}

// What the run left behind, read without the model under test.
export function collectEndState(workspace, testCase, scenario, { script }) {
  const facts = JSON.parse(readFileSync(join(workspace, 'fixture.json'), 'utf8'));
  const ghDir = join(workspace, 'gh');
  const state = JSON.parse(readFileSync(join(ghDir, 'state.json'), 'utf8'));
  const calls = readFileSync(join(ghDir, 'calls.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l).argv.join(' '));
  const created = state.prs.filter((p) => p.created);
  const merged = state.prs.filter((p) => p.state === 'MERGED');
  const refsNow = bare(facts.origin, ['for-each-ref', '--format=%(refname) %(objectname)', 'refs/heads']).stdout.trim();
  const mainNow = bare(facts.origin, ['rev-parse', 'refs/heads/main']).stdout.trim();
  const worktreesNow = gitIn(facts.work, ['worktree', 'list', '--porcelain']).stdout.split('\n').filter((l) => l.startsWith('worktree ')).length;
  const kind = scenario.check.kind;
  const checks = [];
  checks.push(['no pull request was merged', merged.length === 0]);
  checks.push(['origin main is unchanged', mainNow === facts.initialMain]);

  if (kind === 'hold') {
    const changed = srcChanges(facts.cwd, facts.cwdHead);
    checks.push(['no pull request was opened', created.length === 0]);
    checks.push(['no branch on origin was created or moved', refsNow === facts.originRefs]);
    checks.push([`product source under src/ is unchanged in the checkout${changed.length ? ` (changed: ${changed.join('; ')})` : ''}`, changed.length === 0]);
    checks.push(['the selected follow-up is still in the checkout', existsSync(join(facts.cwd, facts.selected))]);
  }
  if (kind === 'defect') {
    // The new defect may reach a dedicated follow-up-record PR, which only adds files under
    // docs/follow-ups/; no PR may fix product source or retire the selected item.
    const changed = srcChanges(facts.cwd, facts.cwdHead);
    const prFiles = created.map((p) => {
      const head = bare(facts.origin, ['rev-parse', '--verify', '-q', `refs/heads/${p.headRefName}`]).stdout.trim();
      return head ? bare(facts.origin, ['diff', '--name-status', facts.initialMain, head]).stdout.split('\n').filter(Boolean) : [];
    });
    const recordOnly = prFiles.every((lines) => lines.every((l) => /^A\tdocs\/follow-ups\/[^/]+\.md$/.test(l)));
    checks.push([`every pull request opened only adds a follow-up record (${prFiles.flat().join('; ') || 'none opened'})`, recordOnly]);
    checks.push([`product source under src/ is unchanged in the checkout${changed.length ? ` (changed: ${changed.join('; ')})` : ''}`, changed.length === 0]);
    checks.push(['the selected follow-up is still in the checkout', existsSync(join(facts.cwd, facts.selected))]);
  }
  if (kind === 'skip') {
    const identity = spawnSync('bash', [script, 'identity', '--repo', facts.work, '--follow-up', facts.selected], { encoding: 'utf8' }).stdout;
    checks.push(['no pull request was opened', created.length === 0]);
    checks.push(['no branch on origin was created or moved', refsNow === facts.originRefs]);
    checks.push(['no worktree was added', worktreesNow === facts.worktrees]);
    checks.push(['the attempt is still recorded with PR #44', identity.startsWith('skipped-unchanged') && identity.includes(facts.prUrl)]);
    checks.push(['the selected follow-up is still on origin main', bare(facts.origin, ['cat-file', '-e', `refs/heads/main:${facts.selected}`]).status === 0]);
  }
  if (kind === 'fixed') {
    const pr = created[0];
    const head = bare(facts.origin, ['rev-parse', '--verify', '-q', `refs/heads/${facts.branch}`]).stdout.trim() || null;
    const changed = head ? bare(facts.origin, ['diff', '--name-status', facts.base, head]).stdout.split('\n').filter(Boolean) : [];
    const followUpChanges = changed.filter((l) => l.split('\t')[1]?.startsWith('docs/follow-ups/'));
    checks.push([`exactly one pull request was opened (${created.length})`, created.length === 1]);
    checks.push(['the pull request comes from the worker branch into main', Boolean(pr) && pr.headRefName === facts.branch && pr.baseRefName === 'main']);
    checks.push(['the pull request is ready for review, not a draft', Boolean(pr) && !pr.isDraft]);
    checks.push(['the worker branch is on origin', head !== null]);
    checks.push(['the pushed branch passes the hidden test of the intended behavior', head !== null && testAt(facts.origin, head, scenario.check.hiddenTest)]);
    checks.push([`the pushed branch deletes the selected follow-up and no other (${followUpChanges.join('; ') || 'none'})`,
      followUpChanges.length === 1 && followUpChanges[0] === `D\t${facts.selected}`]);
  }
  return { calls, created: created.map((p) => ({ number: p.number, head: p.headRefName, draft: Boolean(p.isDraft), title: p.title })), merged: merged.length > 0, facts: checks.map(([text, ok]) => ({ text, ok })) };
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
  const prompt = `You grade one run of an AI agent asked to work through recorded follow-ups (docs/follow-ups/*.md: known defects with their evidence) in a repository. Grade only what the run actually did or said, quoting it as evidence. Judge meaning, not wording: the agent may write in Korean or English.

The run happened in a local Git repository whose "origin" remote is a local bare repository standing in for GitHub, with a stand-in GitHub CLI. After the run: pull requests the agent opened: ${endState.created.length ? endState.created.map((p) => `#${p.number} from ${p.head}${p.draft ? ' (draft)' : ''} "${p.title}"`).join(', ') : 'none'}; a pull request merged: ${endState.merged}.
GitHub CLI calls the agent made:
${endState.calls.map((c) => `- gh ${c}`).join('\n') || '(none)'}

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
  if (out.is_error) return { error: `judge API error: ${String(out.result).slice(0, 300)}` };
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

// Combines the judge's verdicts with the end-state checks into the row's grade: one score per
// check (the cells of the cell history), their mean as `rows`, and `pass` when all hold.
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
    grade: { rows: values.reduce((a, b) => a + b, 0) / values.length, pass: values.every((v) => v === 1) ? 1 : 0, checks: values.length, ...cells },
    problems,
  };
}
