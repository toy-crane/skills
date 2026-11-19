// Grader for acceptance criterion 3 of docs/specs/at-a-glance/: a rendered process shows every
// stage name before any input and never advances on its own.
// stepper (judge): the run rendered; the pre-input captures name every stage the render presents in
//   any state; and nothing advances stages without the user.
import { judge, widgetBlock } from '../judge.mjs';

export const goal = 'docs/specs/at-a-glance/ criterion 3: at least 19 of 20 held-out trials render a process whose first view names every stage and which never advances on its own, on Sonnet 5.5 and Opus 5.5';
export const metrics = [{ id: 'stepper', kind: 'float', label: 'Rendered, every stage named in the first view, no auto-advance' }];

const schema = {
  type: 'object',
  properties: {
    stages: { type: 'array', items: { type: 'string' }, description: 'Every stage or step the render presents in any state.' },
    hidden: { type: 'array', items: { type: 'string' }, description: 'Stages from that list whose names are not visible in the captures.' },
    complete: { type: 'boolean' },
    autoplay: { type: 'boolean' },
    evidence: { type: 'string' },
  },
  required: ['stages', 'hidden', 'complete', 'autoplay', 'evidence'],
};

export function judgePrompt({ prompt, reply, widgets }) {
  return `You grade one rendered explanation of a process an AI assistant gave. The user's message was:
${prompt}

Read each capture PNG with the Read tool before judging: each is the visual exactly as it first appears, before any click, hover, key, or Next. Read each source only to learn which stages exist behind controls and whether anything moves on its own.

${widgetBlock(widgets)}

The assistant's chat reply (text around the visuals):
${reply.slice(0, 20_000) || '(empty)'}

Decide two things.
1. complete: list every stage or step the render presents in any state: any panel, tab, hidden element, or later step. complete is true only when the name of each one is visible in the captures. Detail of a stage may stay behind a control; its name may not.
2. autoplay: true when anything changes which stage is shown or highlighted without user input, such as a setInterval, a setTimeout chain, requestAnimationFrame, or a CSS animation cycling through stages. A one-time entrance transition that ends on the first view is not autoplay.

Return the stages, the hidden ones, both verdicts, and one or two sentences of evidence quoting what you saw.`;
}

export async function gradeRun(c, { reply, widgets, pages }, judgeOpts) {
  const shown = [...widgets, ...pages];
  if (shown.length === 0) return { grade: { pass: 0, stepper: 0 }, notes: 'nothing rendered' };
  const judged = await judge(judgePrompt({ prompt: c.prompt, reply, widgets: shown }), schema, judgeOpts);
  if (judged.error) return { error: judged.error };
  const v = judged.verdict;
  const pass = v.complete && !v.autoplay ? 1 : 0;
  return {
    grade: { pass, stepper: pass },
    notes: `complete ${v.complete}, autoplay ${v.autoplay}; hidden: ${v.hidden.join(', ') || 'none'}; ${v.evidence}`,
    judge: { verdict: v, model: judged.model, usage: judged.usage, cost: judged.cost },
  };
}
