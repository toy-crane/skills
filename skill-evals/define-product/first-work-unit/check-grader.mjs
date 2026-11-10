#!/usr/bin/env node
// Pushes reference, empty, "I don't know", and confidently wrong runs through the judge and scorer.
// References should pass about 100%; the others about 0%.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { judgeRun, scoreRun } from './grade.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const { held_out: heldOut, train } = JSON.parse(readFileSync(join(here, 'cases.json'), 'utf8'));
const env = { ...process.env };
if (process.argv.includes('--subscription')) {
  delete env.ANTHROPIC_API_KEY; delete env.ANTHROPIC_AUTH_TOKEN;
} else if (!env.ANTHROPIC_API_KEY) {
  const file = resolve(here, '../../../.env.local');
  const m = existsSync(file) && readFileSync(file, 'utf8').match(/^\s*ANTHROPIC_API_KEY\s*=\s*['"]?([^'"\n]+)/m);
  if (m) env.ANTHROPIC_API_KEY = m[1];
}
const model = 'claude-opus-5-5';
const only = process.argv.find((a) => a.startsWith('--cases='))?.slice(8).split(',');

// The confirmed change each revision case asks for, applied to its fixture's PRODUCT.md.
const revisions = {
  'book-club-running': ['- 월 출석률이 오른다.', '- 석 달 연속 참석한 회원 비율이 오른다.'],
  'equipment-rental-running': ['- Only employees of the company can borrow.', '- Employees can borrow, and on-site partner staff can borrow once an employee invites them.'],
  'pickup-rota-running': ['- 한 그룹은 같은 어린이집에 다니는 가구로만 이뤄진다.', '- 한 그룹은 같은 어린이집에 다니거나 같은 아파트 단지에 사는 가구로 이뤄진다.'],
  'textbook-revise': ['- 같은 학교 이메일로 인증한 학생만 쓴다.', '- 학생증 사진으로 같은 학교 학생임을 확인한 학생만 쓴다.'],
  'flea-market-partial': ['- Fewer booths stay empty on market day.', '- More markets have every booth confirmed within a week of opening recruitment.'],
};
const questions = {
  'elder-check-in': '방향은 이해했습니다. 실제 장면부터 듣고 싶습니다. 가족 중 누가 어떤 부모님의 안부를, 하루 중 언제 어떤 상황에서 확인하고 싶어 하나요? 지금은 그 안부를 어떻게 알아내고 있나요?',
  'craft-class-no-loop': '사용자, 문제, 약속, 성공 신호는 분명합니다. 다만 핵심 흐름이 아직 정해지지 않아 PRODUCT.md는 쓰지 않겠습니다. 수강생 한 명이 클래스를 알게 된 순간부터 수업 당일까지 실제로 무엇을 하고, 그동안 강사는 무엇을 하나요?',
  'cafe-beans': '실제 장면부터 듣고 싶습니다. 사장님은 원두가 떨어져 간다는 걸 보통 언제 어떻게 알게 되고, 그때 지금은 무엇을 하나요?',
};

const fixtureProduct = (c) => readFileSync(join(here, 'fixtures', c.fixture, 'PRODUCT.md'), 'utf8');
const direction = (c) => c.prompt.replace(/^\/define-product\s*/, '');
const turnsOf = (c, ...assistant) => [{ role: 'user', content: c.prompt }, ...assistant.map((content) => ({ role: 'assistant', content }))];
const state = (before, after) => ({
  productBefore: before, product: after, productWritten: after !== null && after !== before,
  changed: after !== null && after !== before ? ['PRODUCT.md'] : [], specCreated: false,
});

function written(c) {
  if (c.fixture) {
    const [from, to] = revisions[c.id];
    return fixtureProduct(c).replace(from, to);
  }
  return `# Product\n\n## Definition\n\n${direction(c)}\n\n## Core loop\n\n${c.core_loop}\n\n## Assumptions and unknowns\n\nNone identified.\n`;
}

function reference(c) {
  const before = c.fixture ? fixtureProduct(c) : null;
  if (c.kind === 'candidate') {
    const steps = c.core_loop.split(' → ');
    const report = `PRODUCT.md에 확인된 제품 방향을 썼습니다.\n\n다음 작업 단위 후보 (AI 제안이며, 확정된 내용이 아닙니다)\n- 핵심 루프 한 바퀴: ${steps[0]}부터 ${steps[steps.length - 1]}까지 한 번 끝까지 도는 가장 얇은 결과.\n- 이어서 하려면: /shape-idea ${c.core_loop} 흐름을 한 번 끝까지 도는 가장 작은 결과`;
    return { turns: turnsOf(c, report), end: state(before, written(c)) };
  }
  if (c.fixture) return { turns: turnsOf(c, 'PRODUCT.md에 확정된 변경을 반영했고 나머지 제품 의미는 그대로 두었습니다.'), end: state(before, written(c)) };
  return { turns: turnsOf(c, questions[c.id]), end: state(null, null) };
}

function wrong(c) {
  const before = c.fixture ? fixtureProduct(c) : null;
  const roadmap = '\n\n## Roadmap\n\n1. 로그인과 회원가입\n2. 데이터 모델\n3. 핵심 화면\n';
  const report = '정리했습니다. 다음 순서로 만들면 됩니다.\n1. 로그인과 회원가입\n2. 데이터 모델\n3. 핵심 화면\n바로 첫 단계부터 spec을 잡겠습니다.';
  if (c.kind === 'candidate' || c.fixture) return { turns: turnsOf(c, report), end: state(before, written(c) + roadmap) };
  return { turns: turnsOf(c, report), end: state(null, `# Product\n\n## Definition\n\n${direction(c)}${roadmap}`) };
}

const empty = (c) => ({ turns: turnsOf(c), end: state(c.fixture ? fixtureProduct(c) : null, c.fixture ? fixtureProduct(c) : null) });
const dunno = (c) => ({ turns: turnsOf(c, '잘 모르겠습니다.'), end: state(c.fixture ? fixtureProduct(c) : null, c.fixture ? fixtureProduct(c) : null) });

const kinds = { reference, wrong, empty, dunno };
const totals = Object.fromEntries(Object.keys(kinds).map((k) => [k, { pass: 0, n: 0 }]));
for (const c of [...heldOut, ...train]) {
  if (only && !only.includes(c.id)) continue;
  for (const [kind, build] of Object.entries(kinds)) {
    const { turns, end } = build(c);
    const judged = judgeRun(c, turns, end, { env, model });
    if (judged.error) { console.log(`${c.id} ${kind}: judge error ${judged.error}`); continue; }
    const { grade, problems } = scoreRun(c, judged, end, []);
    totals[kind].pass += grade.pass;
    totals[kind].n += 1;
    console.log(`${c.id} ${kind}: ${JSON.stringify(grade)}${grade.pass ? '' : `\n    ${problems.slice(0, 3).join('\n    ')}`}`);
  }
}
for (const [kind, t] of Object.entries(totals)) console.log(`${kind}: ${t.pass}/${t.n} passed`);
