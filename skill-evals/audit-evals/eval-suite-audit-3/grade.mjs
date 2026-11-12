// Grader for spec eval-suite-audit criterion 3: the four lists audit-evals reports
// (never failed, identical histories, flipping, always failing) must equal the
// reference lists in expected/, computed by reference.mjs from the trial records.
// Programmatic only; no judge model. Run it through ../run.mjs.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const here = new URL('.', import.meta.url).pathname;
export const LISTS = ['never_failed', 'identical_checks', 'flipping', 'always_failing'];
const HISTORY = 'evals/regression/cell-history.json';
const TITLES = {
  'never failed': 'never_failed',
  'insufficient history': 'insufficient_history',
  'identical histories': 'identical_checks',
  flipping: 'flipping',
  'always failing': 'always_failing',
};

export function expectedLists(caseId) {
  return JSON.parse(readFileSync(join(here, 'expected', `${caseId}.json`), 'utf8'));
}

function cellsOf(history) {
  const all = [];
  for (const [suite, body] of Object.entries(history.suites)) {
    for (const [c, row] of Object.entries(body.cells)) for (const k of Object.keys(row)) all.push([suite, c, k]);
  }
  return all;
}

// Expands the report's notation into cell ids: suite/case/check, suite/*/check, suite/case/*.
function expand(unit, all) {
  const [s, c, k] = unit.split('/');
  return all.filter(([s2, c2, k2]) => s2 === s && (c === '*' || c === c2) && (k === '*' || k === k2)).map((x) => x.join('/'));
}

// Reads the report file's sections into lists of cell ids (or check groups).
export function parseReport(text, history) {
  const all = cellsOf(history);
  const lists = {};
  let current = null;
  for (const line of text.split('\n')) {
    const heading = line.match(/^##\s+(.+?)\s*\(\d+\)\s*$/);
    if (heading) {
      current = TITLES[heading[1].toLowerCase()] ?? null;
      if (current) lists[current] = [];
      continue;
    }
    if (!current || !line.startsWith('- ')) continue;
    const body = line.slice(2).trim();
    if (body === 'none') continue;
    if (current === 'identical_checks') {
      lists[current].push(body.split(/\s*=\s*/).map((x) => x.trim()).sort());
    } else {
      const unit = body.split(/\s+/)[0];
      lists[current].push(...(unit.includes('*') ? expand(unit, all) : [unit]));
    }
  }
  for (const key of Object.keys(lists)) {
    if (key === 'identical_checks') lists[key].sort((x, y) => (x[0] < y[0] ? -1 : 1));
    else lists[key] = [...new Set(lists[key])].sort();
  }
  return lists;
}

function findReports(workspace) {
  const found = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      if (name === '.git' || name === '.claude') continue;
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (/^audit-report.*\.md$/.test(name)) found.push(path);
    }
  };
  walk(workspace);
  return found;
}

// What the run left behind, read without the model under test.
export function collectEndState(workspace) {
  const historyPath = join(workspace, HISTORY);
  const reports = findReports(workspace);
  const diff = spawnSync('git', ['-C', workspace, 'diff', '--stat', '--', HISTORY], { encoding: 'utf8' }).stdout ?? '';
  return {
    history: existsSync(historyPath) ? JSON.parse(readFileSync(historyPath, 'utf8')) : null,
    historyChanged: diff.trim() !== '',
    reportPath: reports[0] ? relative(workspace, reports[0]) : null,
    report: reports[0] ? readFileSync(reports[0], 'utf8') : null,
  };
}

const lastAssistantText = (turns) => [...turns].reverse().find((t) => t.role === 'assistant')?.content ?? '';

// Scores one run from its end state and final reply.
export function scoreRun(testCase, endState, turns) {
  const expected = expectedLists(testCase.id);
  const problems = [];
  let got = {};
  if (!endState.report) problems.push('no audit report file was written');
  else if (!endState.history) problems.push('the cell history is gone');
  else got = parseReport(endState.report, endState.history);
  const same = (key) => JSON.stringify(got[key] ?? null) === JSON.stringify(expected[key]);
  for (const key of LISTS) if (endState.report && !same(key)) problems.push(`${key}: expected ${expected[key].length}, got ${got[key]?.length ?? 'no section'}`);
  const listsExact = LISTS.every(same);
  if (endState.historyChanged) problems.push('the cell history changed without an approved demotion');
  // The user must see each list's size; numbers may carry thousands separators.
  const reply = lastAssistantText(turns).replace(/(\d),(?=\d{3}\b)/g, '$1');
  const missing = LISTS.filter((key) => !new RegExp(`(^|\\D)${expected[key].length}(\\D|$)`).test(reply));
  if (missing.length) problems.push(`reply lacks the size of ${missing.join(', ')}`);
  const pass = listsExact && !endState.historyChanged && missing.length === 0;
  return {
    grade: {
      pass: pass ? 1 : 0,
      lists_exact: listsExact ? 1 : 0,
      insufficient_exact: endState.report && same('insufficient_history') ? 1 : 0,
      history_unchanged: endState.historyChanged ? 0 : 1,
      counts_reported: missing.length === 0 ? 1 : 0,
    },
    problems,
  };
}
