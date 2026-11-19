// Grader for acceptance criterion 4 of docs/specs/at-a-glance/: a rendered mechanism asks for a
// prediction before it shows the result.
// predict-first (judge): the run rendered, and before any input the user is asked to predict the
//   result while that result stays hidden until they commit a prediction.
import { judge, widgetBlock } from '../judge.mjs';

export const goal = 'docs/specs/at-a-glance/ criterion 4: at least 18 of 20 held-out trials render a mechanism that asks for a prediction before showing the result, on Sonnet 5.5 and Opus 5.5';
export const metrics = [{ id: 'predict-first', kind: 'float', label: 'Rendered and asks for a prediction before the result' }];

const schema = {
  type: 'object',
  properties: {
    asks: { type: 'boolean', description: 'The first view asks the user to predict an outcome.' },
    hidden_until_predicted: { type: 'boolean', description: 'That outcome is not shown until the user commits a prediction.' },
    evidence: { type: 'string' },
  },
  required: ['asks', 'hidden_until_predicted', 'evidence'],
};

export function judgePrompt({ prompt, reply, widgets }) {
  return `You grade one rendered explanation of a mechanism an AI assistant gave. The user's message was:
${prompt}

Read each capture PNG with the Read tool before judging: each is the visual exactly as it first appears, before any input. Read each source to learn what happens after input.

${widgetBlock(widgets)}

The assistant's chat reply (text around the visuals):
${reply.slice(0, 20_000) || '(empty)'}

Decide two things from the captures, the sources, and the reply.
1. asks: before any input, the user is asked to predict an outcome of the mechanism, as a question with choices or a guess to enter, in the visual or in the reply.
2. hidden_until_predicted: the outcome that question asks about is not visible in the first view or in the reply, and appears only after the user commits a prediction (picks a choice, enters a guess, or presses a reveal that follows the question). An answer already shown in the first view, a table in the reply that gives it away, or a result that updates live before any prediction fails this.

Return both verdicts and one or two sentences of evidence quoting what you saw.`;
}

export async function gradeRun(c, { reply, widgets, pages }, judgeOpts) {
  const shown = [...widgets, ...pages];
  if (shown.length === 0) return { grade: { pass: 0, 'predict-first': 0 }, notes: 'nothing rendered' };
  const judged = await judge(judgePrompt({ prompt: c.prompt, reply, widgets: shown }), schema, judgeOpts);
  if (judged.error) return { error: judged.error };
  const v = judged.verdict;
  const pass = v.asks && v.hidden_until_predicted ? 1 : 0;
  return {
    grade: { pass, 'predict-first': pass },
    notes: `asks ${v.asks}, hidden until predicted ${v.hidden_until_predicted}; ${v.evidence}`,
    judge: { verdict: v, model: judged.model, usage: judged.usage, cost: judged.cost },
  };
}
