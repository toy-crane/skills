// Grader for define-product's first-work-unit regression suite. Run it through ../../run.mjs.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// The expectations every case of a kind carries, from spec.md's acceptance criterion 1.
export const CANDIDATE_EXPECTATIONS = [
  'It writes the root PRODUCT.md for this confirmed direction instead of only proposing content or asking another interview question.',
  'Its completion report proposes exactly one next work unit, not a feature list, a set of options, or an ordered sequence of work.',
  'That one candidate covers the confirmed core loop once from its first step to its last step, rather than only a foundation such as authentication or a data layer, or only part of the loop.',
  'The candidate adds no user, feature, screen, or step that the confirmed product direction does not contain.',
  'The report marks the candidate as an AI proposal that is not part of the confirmed product meaning.',
  'The report gives a request sentence the user can hand to shape-idea, such as one beginning with /shape-idea, to start shaping that candidate.',
  'PRODUCT.md contains no candidate, roadmap, feature order, or next-step section.',
];
export const NO_CANDIDATE_EXPECTATIONS = [
  'The response proposes no next work-unit candidate and gives no request sentence for shape-idea.',
];

export function expectationsFor(testCase) {
  if (testCase.kind === 'regression') return testCase.expectations;
  const base = testCase.kind === 'candidate' ? CANDIDATE_EXPECTATIONS : NO_CANDIDATE_EXPECTATIONS;
  return [...(testCase.expectations ?? []), ...base];
}

// What the run left behind, read without the model under test.
export function collectEndState(workspace) {
  // core.quotePath=false keeps non-ASCII paths, such as a Korean spec slug, unquoted for the checks below.
  const git = (args) => spawnSync('git', ['-C', workspace, '-c', 'core.quotePath=false', ...args], { encoding: 'utf8' }).stdout ?? '';
  const status = git(['status', '--porcelain', '--untracked-files=all']).split('\n').filter(Boolean);
  const productPath = join(workspace, 'PRODUCT.md');
  const product = existsSync(productPath) ? readFileSync(productPath, 'utf8') : null;
  const productBefore = git(['show', 'HEAD:PRODUCT.md']) || null;
  const changed = status.map((line) => line.slice(3));
  return {
    changed,
    product,
    productBefore,
    productWritten: product !== null && product !== productBefore,
    specCreated: changed.some((p) => /(^|\/)docs\/specs\//.test(p) || /(^|\/)spec\.md$/.test(p)),
  };
}

// Skills the agent invoked, read from its tool calls.
export function invokedSkills(turns) {
  return turns
    .filter((t) => t.role === 'tool_call' && t.name === 'Skill')
    .map((t) => { try { return JSON.parse(t.content).skill; } catch { return null; } })
    .filter(Boolean);
}

const judgeSchema = {
  type: 'object',
  properties: {
    expectations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          index: { type: 'integer' },
          met: { type: 'boolean' },
          evidence: { type: 'string' },
        },
        required: ['index', 'met', 'evidence'],
      },
    },
    candidates_proposed: { type: 'integer', description: 'How many distinct next work units the response proposes to build or shape next.' },
    feature_order_listed: { type: 'boolean', description: 'Whether the response or PRODUCT.md lays out an order or sequence of several features or work units to build.' },
    candidate_in_product_md: { type: 'boolean', description: 'Whether PRODUCT.md (after the run) contains a next work unit, roadmap, feature order, or next-step item.' },
  },
  required: ['expectations', 'candidates_proposed', 'feature_order_listed', 'candidate_in_product_md'],
};

function transcriptText(turns) {
  return turns.map((t) => {
    if (t.role === 'user') return `### USER\n${t.content}`;
    if (t.role === 'assistant') return `### ASSISTANT\n${t.content}`;
    if (t.role === 'tool_call') return `### TOOL CALL ${t.name}\n${t.content.slice(0, 3000)}`;
    return `### TOOL RESULT\n${t.content.slice(0, 1500)}`;
  }).join('\n\n');
}

// Asks a judge model whether each expectation holds for the run.
export function judgeRun(testCase, turns, endState, { env, model }) {
  const expectations = expectationsFor(testCase);
  const loop = testCase.core_loop ? `\nThe confirmed core loop for this case is: ${testCase.core_loop}\n` : '';
  const prompt = `You grade one run of an AI agent that follows a product-definition skill. The skill interviews the user and writes the app's product definition to the repository root PRODUCT.md. Grade only what the run actually did, quoting it as evidence. Judge meaning, not wording: the agent may write in Korean or English.
${loop}
A "next work-unit candidate" is a concrete suggestion of what to build or shape next, such as a first slice of the app. Restating the confirmed core loop as part of the product definition is not a candidate. An offer to keep refining the product definition itself is not a candidate.

Expectations, numbered from 0:
${expectations.map((e, i) => `${i}. ${e}`).join('\n')}

Files the run created or changed: ${endState.changed.join(', ') || '(none)'}

PRODUCT.md before the run:
${endState.productBefore ?? '(did not exist)'}

PRODUCT.md after the run:
${endState.product ?? '(does not exist)'}

Transcript of the run:
${transcriptText(turns).slice(0, 120_000)}

Return one verdict per expectation index, plus the three counts about next work-unit candidates.`;
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
  // A judge that skips an expectation failed before a scorable output; never score that as unmet.
  const missing = expectations.map((_, i) => i).filter((i) => typeof data.expectations.find((x) => x.index === i)?.met !== 'boolean');
  if (missing.length) return { error: `judge gave no verdict for expectations ${missing.join(', ')}` };
  const verdicts = expectations.map((text, i) => {
    const v = data.expectations.find((x) => x.index === i);
    return { text, met: v.met, evidence: v.evidence };
  });
  return {
    verdicts,
    candidates: data.candidates_proposed,
    featureOrder: data.feature_order_listed,
    candidateInProduct: data.candidate_in_product_md,
    usage: out.usage ?? null,
    model: Object.keys(out.modelUsage ?? {})[0] ?? null,
    cost: out.total_cost_usd ?? null,
  };
}

// Combines the judge's verdicts with the programmatic checks into the row's grade.
export function scoreRun(testCase, judged, endState, skills) {
  const shapingStarted = skills.includes('shape-idea');
  const multiCandidate = judged.candidates >= 2 || judged.featureOrder === true;
  const overreach = judged.candidateInProduct === true || endState.specCreated || shapingStarted;
  const allMet = judged.verdicts.every((v) => v.met);
  const problems = judged.verdicts.filter((v) => !v.met).map((v) => `${v.text} — ${v.evidence}`);
  if (endState.specCreated) problems.push('a spec file was created');
  if (shapingStarted) problems.push('shape-idea was invoked');
  if (testCase.kind === 'regression') {
    return { grade: { pass: allMet ? 1 : 0, multi_candidate: multiCandidate ? 1 : 0, overreach: overreach ? 1 : 0 }, problems };
  }
  return {
    grade: {
      pass: allMet && !multiCandidate && !overreach ? 1 : 0,
      multi_candidate: multiCandidate ? 1 : 0,
      overreach: overreach ? 1 : 0,
      candidate_present: judged.candidates >= 1 ? 1 : 0,
    },
    problems,
  };
}
