#!/usr/bin/env node
// Local issue tracker for the post-release check run: issues live in .tracker/<n>.json.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = '.tracker';
mkdirSync(dir, { recursive: true });
const [cmd, ...rest] = process.argv.slice(2);
const flag = (name) => { const i = rest.indexOf(`--${name}`); return i >= 0 ? rest[i + 1] : undefined; };
const flags = (name) => rest.flatMap((v, i) => (rest[i - 1] === `--${name}` ? [v] : []));
const file = (n) => join(dir, `${n}.json`);
const ids = () => readdirSync(dir).filter((f) => /^\d+\.json$/.test(f)).map((f) => Number(f.slice(0, -5))).sort((a, b) => a - b);
const load = (n) => JSON.parse(readFileSync(file(n), 'utf8'));
const save = (issue) => writeFileSync(file(issue.id), `${JSON.stringify(issue, null, 2)}\n`);
const now = () => new Date().toISOString();
const isDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d ?? '');
const die = (msg) => { console.error(msg); process.exit(2); };

switch (cmd) {
  case 'create': {
    const title = flag('title'); const bodyFile = flag('body-file');
    if (!title || !bodyFile) die('create needs --title and --body-file');
    const due = flag('due');
    if (due && !isDate(due)) die('--due needs YYYY-MM-DD');
    const id = (ids().at(-1) ?? 0) + 1;
    save({ id, title, state: 'open', labels: flags('label'), due: due ?? null, createdAt: now(),
      body: readFileSync(bodyFile, 'utf8'), comments: [] });
    console.log(`local:${id}`);
    break;
  }
  case 'view': console.log(JSON.stringify(load(rest[0]), null, 2)); break;
  case 'list': {
    const state = flag('state') ?? 'open'; const label = flag('label');
    const out = ids().map(load).filter((i) => (state === 'all' || i.state === state) && (!label || i.labels.includes(label)))
      .map(({ comments, ...i }) => ({ ...i, commentCount: comments.length }));
    console.log(JSON.stringify(out, null, 2));
    break;
  }
  case 'body': {
    const issue = load(rest[0]); const bodyFile = flag('body-file');
    if (!bodyFile) die('body needs --body-file');
    issue.body = readFileSync(bodyFile, 'utf8'); save(issue); console.log(`local:${issue.id} body updated`);
    break;
  }
  case 'label': {
    const issue = load(rest[0]);
    for (const l of flags('add')) if (!issue.labels.includes(l)) issue.labels.push(l);
    issue.labels = issue.labels.filter((l) => !flags('remove').includes(l));
    save(issue); console.log(`local:${issue.id} labels ${issue.labels.join(',') || '(none)'}`);
    break;
  }
  case 'comment': {
    const issue = load(rest[0]); const bodyFile = flag('body-file');
    if (!bodyFile) die('comment needs --body-file');
    issue.comments.push({ at: now(), body: readFileSync(bodyFile, 'utf8') }); save(issue);
    console.log(`local:${issue.id} comment ${issue.comments.length}`);
    break;
  }
  case 'due': {
    const [n, date] = rest; if (!isDate(date) && date !== 'none') die('due needs YYYY-MM-DD or none');
    const issue = load(n); issue.due = date === 'none' ? null : date; save(issue); console.log(`local:${n} due ${issue.due}`);
    break;
  }
  case 'close': { const issue = load(rest[0]); issue.state = 'closed'; save(issue); console.log(`local:${issue.id} closed`); break; }
  default: die('usage: tracker.mjs create|view|list|body|label|comment|due|close');
}
