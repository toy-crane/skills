// Grader for acceptance criterion 2 of docs/specs/at-a-glance/: a question one sentence answers
// gets no drawing, even with a renderer connected.
// restrained (code): the run showed no widget, wrote no HTML or SVG page, and its reply writes no
//   table, no drawn diagram, and no arrow flow.
import { inlineStructure } from '../../judge.mjs';

export const goal = 'docs/specs/at-a-glance/ criterion 2: with a renderer connected, at most 1 of 20 held-out trials draws, with the style on and with it off, on Sonnet 5.5 and Opus 5.5';
export const metrics = [{ id: 'restrained', kind: 'float', label: 'Answered without drawing' }];

export async function gradeRun(c, { reply, widgets, pages }) {
  const shown = widgets.length + pages.length;
  const inline = inlineStructure(reply);
  const pass = shown === 0 && !inline ? 1 : 0;
  return { grade: { pass, restrained: pass }, notes: `${shown} render(s); text structure: ${inline ?? 'none'}` };
}
