// Grader for the first-view rule in docs/decisions/explain-visually.md.
// first-view (judge): the pre-interaction captures alone show every stage the render presents in any
//   state, and make their order or direction readable. A judge reads the captures (PNG) and each
//   widget's source, the source only to learn which stages exist behind controls.
// rendered (code): the run showed at least one widget or wrote an HTML/SVG page.
// restrained (code): the run showed no widget, wrote no page, and its reply holds no drawn diagram
//   (a fenced block with box or arrow art) and no markdown table.
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';

const judgeSchema = {
  type: 'object',
  properties: {
    stages: { type: 'array', items: { type: 'string' }, description: 'Every stage, step, or part the render presents in any state, as found in the source and captures.' },
    hidden: { type: 'array', items: { type: 'string' }, description: 'Stages from that list that are not visible in the captures.' },
    complete: { type: 'boolean' },
    direction: { type: 'boolean' },
    evidence: { type: 'string' },
  },
  required: ['stages', 'hidden', 'complete', 'direction', 'evidence'],
};

function runJudge(args, env) {
  return new Promise((settle) => {
    const child = spawn('claude', args, { env, stdio: ['ignore', 'pipe', 'pipe'] });
    const out = [];
    const err = [];
    child.stdout.on('data', (c) => out.push(c));
    child.stderr.on('data', (c) => err.push(c));
    const timer = setTimeout(() => child.kill('SIGKILL'), 600_000);
    child.on('close', (status) => { clearTimeout(timer); settle({ status, stdout: Buffer.concat(out).toString('utf8'), stderr: Buffer.concat(err).toString('utf8') }); });
  });
}

export function judgePrompt({ prompt, reply, widgets }) {
  const parts = widgets.map((w, i) => `Widget ${i + 1}: capture ${w.png}\nSource (to learn what exists behind controls; do not judge it as visible):\n${w.source.slice(0, 30_000)}`).join('\n\n');
  return `You grade one explanation an AI assistant gave. The user asked:
${prompt}

The rule under test: the explanation's first view, meaning what the user sees before touching any control (no click, hover, scroll inside a widget, key press, or Next), must on its own show the whole structure and the direction of progress. Interaction may add detail; it must not be the only way to see a stage or the order of stages.

${widgets.length ? `The assistant rendered ${widgets.length} widget(s) inline. Read each capture PNG with the Read tool before judging: each capture is that widget exactly as it first appears, before any input, and the widgets appear in this order in the chat.` : 'The assistant rendered no widget, so its first view is its chat reply below.'}

${parts}

The assistant's chat reply (text around the widgets):
${reply.slice(0, 20_000) || '(empty)'}

Decide two things from the first view only.
1. complete: list every stage, step, or part the explanation presents anywhere: in any widget state, panel, tab, hidden element, or in the reply. complete is true only when each of them is visible (named or drawn) in the captures, or in the reply when there is no widget. A stage seen only after pressing Next, clicking a tab or node, hovering, or expanding fails. A collapsed group passes when the group itself is named and its own children are mere detail. An empty answer, a refusal, or an answer that presents no stages at all is false.
2. direction: true when, from the captures alone (or the reply when there is no widget), a reader can tell the order of the stages or which way things flow: arrows, numbering, a connected sequence, a timeline, a labelled loop-back for a cycle. A set of disconnected boxes with no order, or an order only a control reveals, is false.

Return the stage list, the hidden stages, both verdicts, and one or two sentences of evidence quoting what you saw.`;
}

export async function judgeFirstView(input, { env, model }) {
  const args = ['-p', judgePrompt(input), '--output-format', 'json', '--json-schema', JSON.stringify(judgeSchema),
    '--tools', 'Read', '--allowedTools', 'Read', '--setting-sources', 'project', '--strict-mcp-config'];
  if (model) args.push('--model', model);
  const run = await runJudge(args, env);
  if (run.status !== 0) return { error: `judge exit ${run.status}: ${(run.stderr || run.stdout).slice(0, 500)}` };
  let out;
  try { out = JSON.parse(run.stdout); } catch { return { error: `judge output not JSON: ${run.stdout.slice(0, 500)}` }; }
  if (out.is_error) return { error: `judge API error ${out.api_error_status ?? ''}: ${String(out.result).slice(0, 300)}` };
  const data = out.structured_output;
  if (typeof data?.complete !== 'boolean' || typeof data?.direction !== 'boolean') return { error: `judge gave no verdict: ${String(out.result).slice(0, 500)}` };
  return { verdict: data, usage: out.usage ?? null, model: Object.keys(out.modelUsage ?? {})[0] ?? null, cost: out.total_cost_usd ?? null };
}

const drawnDiagram = /```[^\n]*\n[\s\S]*?(?:[─│┌┐└┘├┤┬┴┼═║→←↓↑▶▼]|-->|==>|->|\+--)[\s\S]*?```/;
const markdownTable = /^\s*\|.*\|\s*\n\s*\|\s*:?-{3,}/m;

// Grades one run. `widgets` are [{file, png, source}], `pages` are HTML/SVG files the run wrote.
export async function gradeRun(c, { reply, widgets, pages }, judgeOpts) {
  const shown = widgets.length + pages.length;
  if (c.check === 'rendered') return { grade: { pass: shown > 0 ? 1 : 0, rendered: shown > 0 ? 1 : 0 }, notes: `${widgets.length} widget(s), ${pages.length} page(s)` };
  if (c.check === 'restrained') {
    const drew = drawnDiagram.test(reply) || markdownTable.test(reply);
    const ok = shown === 0 && !drew;
    return { grade: { pass: ok ? 1 : 0, restrained: ok ? 1 : 0 }, notes: `${shown} render(s); text diagram or table: ${drew}` };
  }
  const judged = await judgeFirstView({ prompt: c.prompt, reply, widgets: [...widgets, ...pages] }, judgeOpts);
  if (judged.error) return { error: judged.error };
  const v = judged.verdict;
  const pass = v.complete && v.direction ? 1 : 0;
  return {
    grade: { pass, 'first-view': pass, complete: v.complete ? 1 : 0, direction: v.direction ? 1 : 0, rendered: shown > 0 ? 1 : 0 },
    notes: `hidden: ${v.hidden.join(', ') || 'none'}; ${v.evidence}`,
    judge: { verdict: v, model: judged.model, usage: judged.usage, cost: judged.cost },
  };
}

export const readSource = (file) => readFileSync(file, 'utf8');
