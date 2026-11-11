#!/usr/bin/env node
// Minimal local issue tracker for evals: issues live in .tracker/<n>.json.
import { mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dir = '.tracker';
mkdirSync(dir, { recursive: true });
const [cmd, ...rest] = process.argv.slice(2);
const flag = (name) => { const i = rest.indexOf(`--${name}`); return i >= 0 ? rest[i + 1] : undefined; };
const file = (n) => join(dir, `${n}.json`);
const load = (n) => JSON.parse(readFileSync(file(n), 'utf8'));
const save = (issue) => writeFileSync(file(issue.id), `${JSON.stringify(issue, null, 2)}\n`);

if (cmd === 'create') {
  const title = flag('title');
  const bodyFile = flag('body-file');
  if (!title || !bodyFile) { console.error('create needs --title and --body-file'); process.exit(2); }
  const id = readdirSync(dir).filter((f) => f.endsWith('.json')).length + 1;
  const labels = rest.flatMap((v, i) => (rest[i - 1] === '--label' ? [v] : []));
  save({ id, title, body: readFileSync(bodyFile, 'utf8'), labels, due: flag('due') ?? null, state: 'open' });
  console.log(`local:${id}`);
} else if (cmd === 'due') {
  const [n, date] = rest;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? '')) { console.error('due needs YYYY-MM-DD'); process.exit(2); }
  const issue = load(n); issue.due = date; save(issue); console.log(`local:${n} due ${date}`);
} else if (cmd === 'find') {
  const folder = flag('spec-folder');
  const hits = readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')))
    .filter((i) => i.body.includes(`Spec-Folder: ${folder}`));
  console.log(JSON.stringify(hits.map(({ id, title, state, due, labels }) => ({ id: `local:${id}`, title, state, due, labels })), null, 2));
} else if (cmd === 'view') {
  console.log(JSON.stringify(load(rest[0]), null, 2));
} else if (cmd === 'close') {
  const issue = load(rest[0]); issue.state = 'closed'; save(issue); console.log(`local:${rest[0]} closed`);
} else {
  console.error('usage: tracker.mjs create|due|find|view|close'); process.exit(2);
}
