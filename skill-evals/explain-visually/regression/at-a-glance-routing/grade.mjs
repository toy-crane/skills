// Grader for acceptance criterion 1 of docs/specs/at-a-glance/: the form an explanation takes
// matches the kind of content it carries.
// form (code + judge): a run with no widget and no page is prose, or a static diagram when its reply
//   writes a table, a drawn diagram, or an arrow flow. A run that rendered is classified by a judge
//   reading the captures and sources. The run passes when that form is the one its case's kind needs:
//   fact → prose, structure → static diagram, process → stepper, mechanism → manipulable.
import { inlineStructure, judge, widgetBlock } from '../../judge.mjs';

export const goal = 'docs/specs/at-a-glance/ criterion 1: with the style on and a renderer connected, the form matches the content kind in 36 of 40 held-out trials, on Sonnet 5.5 and Opus 5.5';
export const metrics = [{ id: 'form', kind: 'float', label: 'Form matches the content kind' }];

const expected = { fact: 'prose', structure: 'static-diagram', process: 'stepper', mechanism: 'manipulable' };

const schema = {
  type: 'object',
  properties: {
    form: { type: 'string', enum: ['prose', 'static-diagram', 'stepper', 'manipulable', 'other'] },
    evidence: { type: 'string' },
  },
  required: ['form', 'evidence'],
};

export function judgePrompt({ prompt, reply, widgets }) {
  return `You classify the form of one explanation an AI assistant gave. The user's message was:
${prompt}

The assistant rendered ${widgets.length} visual(s). Read each capture PNG with the Read tool: it is the visual as it first appears, before any input. Read each source to learn what its controls do.

${widgetBlock(widgets)}

The assistant's chat reply (text around the visuals):
${reply.slice(0, 20_000) || '(empty)'}

Classify the main form of the explanation, the one carrying its substance:
- prose: the visuals add nothing structural; the explanation is the text.
- static-diagram: a drawing, table, or chart that shows its whole content at once. Hover detail or a highlight on click does not make it something else.
- stepper: stages are presented in order and the user moves between them with controls such as Next, Prev, or clickable stage pills; the panel content changes as the user steps.
- manipulable: the user changes a value or a condition (a slider, toggle, select, input, or choice of scenario) and a result updates from it.
- other: anything else, such as an animation that plays on its own with no user control.
When several visuals differ, classify the one that carries the explanation's substance. Give one or two sentences of evidence quoting what you saw.`;
}

export async function gradeRun(c, { reply, widgets, pages }, judgeOpts) {
  const want = expected[c.kind];
  const shown = [...widgets, ...pages];
  let form;
  let notes;
  let judged = null;
  if (shown.length === 0) {
    const inline = inlineStructure(reply);
    form = inline ? 'static-diagram' : 'prose';
    notes = `no render; ${inline ? `reply writes a ${inline}` : 'prose reply'}`;
  } else {
    judged = await judge(judgePrompt({ prompt: c.prompt, reply, widgets: shown }), schema, judgeOpts);
    if (judged.error) return { error: judged.error };
    form = judged.verdict.form;
    notes = `${shown.length} render(s): ${judged.verdict.evidence}`;
  }
  const pass = form === want ? 1 : 0;
  return {
    grade: { pass, form: pass },
    notes: `${c.kind} wants ${want}, got ${form}; ${notes}`,
    judge: judged && { verdict: judged.verdict, model: judged.model, usage: judged.usage, cost: judged.cost },
  };
}
