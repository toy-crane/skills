#!/usr/bin/env node
// Copies a report to the team channel. In this fixture the channel is .notifications/.
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
const i = process.argv.indexOf('--file');
if (i < 0) { console.error('usage: notify.mjs --file <report.md>'); process.exit(2); }
if (existsSync('.notify-broken')) { console.error('notify: 403 channel_not_permitted'); process.exit(1); }
mkdirSync('.notifications', { recursive: true });
const out = `.notifications/${Date.now()}.md`;
writeFileSync(out, readFileSync(process.argv[i + 1], 'utf8'));
console.log(`sent ${out}`);
