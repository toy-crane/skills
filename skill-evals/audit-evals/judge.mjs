// Expectation judge for audit-evals' evals.json: a separate model reads the run's
// transcript and the files it changed, and rules on each expectation with evidence.
import { spawnSync } from 'node:child_process';

const schema = {
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

// What the run changed in the workspace, read without the model under test.
export function collectChanges(workspace) {
  const git = (args) => spawnSync('git', ['-C', workspace, '-c', 'core.quotePath=false', ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).stdout ?? '';
  const status = git(['status', '--porcelain', '--untracked-files=all']).split('\n').filter(Boolean);
  return { changed: status.map((l) => l.slice(3)), diff: git(['diff']).slice(0, 40_000) };
}

function transcriptText(turns) {
  return turns.map((t) => {
    if (t.role === 'user') return `### USER\n${t.content}`;
    if (t.role === 'assistant') return `### ASSISTANT\n${t.content}`;
    if (t.role === 'tool_call') return `### TOOL CALL ${t.name}\n${t.content.slice(0, 3000)}`;
    return `### TOOL RESULT\n${t.content.slice(0, 3000)}`;
  }).join('\n\n');
}

export function judgeRun(testCase, turns, changes, { env, model, about }) {
  const expectations = testCase.expectations;
  const prompt = `You grade one run of an AI agent that follows ${about}. Grade only what the run actually did, quoting the transcript or the diff as evidence. Judge meaning, not wording: the agent may write in Korean or English. An expectation about a file holds only if the diff or the file list shows it.

Expectations, numbered from 0:
${expectations.map((e, i) => `${i}. ${e}`).join('\n')}

Files the run created or changed: ${changes.changed.join(', ') || '(none)'}

Diff of tracked files after the run:
${changes.diff || '(no change)'}

Transcript of the run:
${transcriptText(turns).slice(0, 150_000)}

Return one verdict per expectation index.`;
  const args = ['-p', prompt, '--output-format', 'json', '--json-schema', JSON.stringify(schema), '--tools', '', '--setting-sources', 'project'];
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
  // A judge that skips an expectation failed before a scorable output; never score that as unmet.
  const missing = expectations.map((_, i) => i).filter((i) => typeof data.expectations.find((x) => x.index === i)?.met !== 'boolean');
  if (missing.length) return { error: `judge gave no verdict for expectations ${missing.join(', ')}` };
  const verdicts = expectations.map((text, i) => {
    const v = data.expectations.find((x) => x.index === i);
    return { text, met: v.met, evidence: v.evidence };
  });
  return {
    verdicts,
    usage: out.usage ?? null,
    model: Object.keys(out.modelUsage ?? {})[0] ?? null,
    cost: out.total_cost_usd ?? null,
  };
}

// One row's grade: the share of expectations met, and pass only when all are.
export function scoreJudged(judged) {
  const met = judged.verdicts.filter((v) => v.met).length;
  return {
    grade: { pass: met === judged.verdicts.length ? 1 : 0, expectations_met: met / judged.verdicts.length },
    problems: judged.verdicts.filter((v) => !v.met).map((v) => `${v.text} — ${v.evidence}`),
  };
}
