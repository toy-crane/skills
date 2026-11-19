// Shared pieces for the at-a-glance graders: one headless judge call with structured output, and
// the code checks that read a chat reply for a drawing written in text.
import { spawn } from 'node:child_process';

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

// Returns { verdict, usage, model, cost } or { error }. `required` names fields the verdict must hold.
export async function judge(prompt, schema, { env, model }) {
  const args = ['-p', prompt, '--output-format', 'json', '--json-schema', JSON.stringify(schema),
    '--tools', 'Read', '--allowedTools', 'Read', '--setting-sources', 'project', '--strict-mcp-config'];
  if (model) args.push('--model', model);
  const run = await runJudge(args, env);
  if (run.status !== 0) return { error: `judge exit ${run.status}: ${(run.stderr || run.stdout).slice(0, 500)}` };
  let out;
  try { out = JSON.parse(run.stdout); } catch { return { error: `judge output not JSON: ${run.stdout.slice(0, 500)}` }; }
  if (out.is_error) return { error: `judge API error ${out.api_error_status ?? ''}: ${String(out.result).slice(0, 300)}` };
  const data = out.structured_output;
  if (!data || schema.required.some((k) => data[k] === undefined)) return { error: `judge gave no verdict: ${String(out.result).slice(0, 500)}` };
  return { verdict: data, usage: out.usage ?? null, model: Object.keys(out.modelUsage ?? {})[0] ?? null, cost: out.total_cost_usd ?? null };
}

// The widgets as the judge sees them: each capture to read, and its source only to learn what
// exists behind controls.
export function widgetBlock(widgets) {
  return widgets.map((w, i) => `Widget ${i + 1}: capture ${w.png}\nSource:\n${w.source.slice(0, 30_000)}`).join('\n\n');
}

const drawnDiagram = /```[^\n]*\n[\s\S]*?(?:[─│┌┐└┘├┤┬┴┼═║→←↓↑▶▼]|-->|==>|->|\+--)[\s\S]*?```/;
const markdownTable = /^\s*\|.*\|\s*\n\s*\|\s*:?-{3,}/m;
// An arrow flow: one line with two or more arrows, such as `A → B → C`.
const arrowFlow = /^.*(?:→|->|⇒|=>).*(?:→|->|⇒|=>).*$/m;

// Which structure the reply writes in text, or null when it writes none.
export function inlineStructure(reply) {
  if (markdownTable.test(reply)) return 'table';
  if (drawnDiagram.test(reply)) return 'drawn diagram';
  if (arrowFlow.test(reply)) return 'arrow flow';
  return null;
}
