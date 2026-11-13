#!/usr/bin/env node
// Run by origin.git's post-receive hook: lands gh/inject.json's commit on main.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { injectNow } from './fixtures.mjs';

const ws = process.argv[2];
injectNow(ws, JSON.parse(readFileSync(join(ws, 'gh/inject.json'), 'utf8')));
