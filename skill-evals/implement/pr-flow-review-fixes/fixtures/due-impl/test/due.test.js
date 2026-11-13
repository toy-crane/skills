import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNote } from '../src/notes.js';
import { sortByDue } from '../src/due.js';

const ids = (list) => list.map((n) => n.id);

test('AC1 earlier due dates come first', () => {
  const notes = [createNote('a', 'A', { due: '2026-03-02' }), createNote('b', 'B', { due: '2026-01-15' })];
  assert.deepEqual(ids(sortByDue(notes)), ['b', 'a']);
});
test('AC3 does not change the input', () => {
  const notes = [createNote('a', 'A', { due: '2026-03-02' }), createNote('b', 'B', { due: '2026-01-15' })];
  sortByDue(notes);
  assert.deepEqual(ids(notes), ['a', 'b']);
});
