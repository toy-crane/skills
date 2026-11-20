#!/usr/bin/env node
// Touch one key line in a dotenv file without ever printing its value.
//   node env-key.mjs add   <file> <NAME>   ensure a `NAME=` line exists; create the file if missing
//   node env-key.mjs check <file> <NAME>   print `set` when NAME has a value, `empty` otherwise
// `add` keeps an existing NAME line as it is and leaves every other line unchanged.
// `check` prints only `set` or `empty`: never the value, part of it, or its length.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const [command, file, name] = process.argv.slice(2);
if (!['add', 'check'].includes(command) || !file || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(name ?? '')) {
  console.error('usage: env-key.mjs add|check <file> <NAME>  (NAME: letters, digits, underscore)');
  process.exit(2);
}

const text = existsSync(file) ? readFileSync(file, 'utf8') : '';
const keyLine = new RegExp(`^\\s*(?:export\\s+)?${name}\\s*=(.*)$`);
const line = text.split(/\r?\n/).find((l) => keyLine.test(l));

if (command === 'add') {
  if (line === undefined) {
    const eol = text.includes('\r\n') ? '\r\n' : '\n';
    const sep = text === '' || text.endsWith('\n') ? '' : eol;
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, `${text}${sep}${name}=${eol}`);
  }
  process.exit(0);
}

console.log(line !== undefined && hasValue(line.match(keyLine)[1]) ? 'set' : 'empty');

function hasValue(raw) {
  const v = raw.trim();
  const quoted = v.match(/^(["'`])(.*)\1/);
  if (quoted) return quoted[2].trim() !== '';
  return v.replace(/(^|\s)#.*$/, '').trim() !== '';
}
