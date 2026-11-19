// Grader for docs/specs/at-a-glance-korean-register/ criterion 1: a reply states its answer
// without a lead-in label announcing it.
// lead-in (judge): the chat reply fails when, anywhere, a label or phrase stands before an answer
//   or summary to announce it instead of stating it: "한 줄로:", "한 줄 요약:", "핵심:", "결론:",
//   "요약:", "결론부터 말씀드리면", "요약하면", "TL;DR:", including such a label used as a heading.
//   Section headings that name a topic ("## 만든 구조") are not lead-ins.
// Rendered widgets are not graded; the criterion is the reply's prose.
import { judge } from '../../judge.mjs';

export const goal = 'docs/specs/at-a-glance-korean-register/ criterion 1: with at-a-glance on and a renderer connected, at most 1 of 20 held-out Korean replies puts a lead-in label before its answer, on Sonnet 5.5';
export const metrics = [{ id: 'lead-in', kind: 'float', label: 'Reply states its answer without a lead-in label' }];

const schema = {
  type: 'object',
  properties: {
    lead_ins: {
      type: 'array',
      items: { type: 'object', properties: { quote: { type: 'string' } }, required: ['quote'] },
    },
  },
  required: ['lead_ins'],
};

export function judgePrompt(prompt, reply) {
  return `You check one habit in an AI assistant's reply. Do not use any tool.

The user's message was:
${prompt}

The assistant's reply:
<reply>
${reply.slice(0, 20_000) || '(empty)'}
</reply>

Find every lead-in: a label or phrase placed before an answer, conclusion, or summary to announce it instead of simply stating it. Examples: "한 줄로:", "한 줄 요약:", "한 줄로 줄이면,", "핵심:", "결론:", "요약:", "요약하면,", "정리하면,", "결론부터 말씀드리면", "짧게 말하면", "TL;DR:", "Bottom line:", and the same labels used as a heading (for example "## 한 줄 요약") or in bold. A heading or table header that names a topic, such as "## 만든 구조" or "## 다음", is not a lead-in. An ordinary sentence whose subject happens to be such a word, such as "핵심은 X입니다", or a sentence pointing to what follows, such as "아래는 주제별 정리입니다", is not a lead-in; only a label followed by a colon, a label set apart in bold or as a heading, or one of the stock announcing phrases above counts. A phrase that is part of the content, such as "필수 스킬 목록을 한 줄로 적는다", is not a lead-in. Quote each lead-in exactly; return an empty list when there is none.`;
}

export async function gradeRun(c, { reply }, judgeOpts) {
  if (!reply.trim()) return { grade: { pass: 0, 'lead-in': 0 }, notes: 'empty reply', judge: null };
  const judged = await judge(judgePrompt(c.prompt, reply), schema, judgeOpts);
  if (judged.error) return { error: judged.error };
  const found = judged.verdict.lead_ins.map((x) => x.quote);
  const pass = found.length === 0 ? 1 : 0;
  return {
    grade: { pass, 'lead-in': pass },
    notes: pass ? 'no lead-in' : `lead-in: ${found.map((q) => `"${q}"`).join(', ')}`.slice(0, 500),
    judge: { verdict: judged.verdict, model: judged.model, usage: judged.usage, cost: judged.cost },
  };
}
