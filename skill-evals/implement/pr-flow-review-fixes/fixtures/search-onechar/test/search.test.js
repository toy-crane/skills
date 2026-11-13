import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNote } from '../src/notes.js';
import { searchNotes } from '../src/search.js';

const notes = [
  createNote('1', 'Buy Milk'),
  createNote('2', 'Call mom', { status: 'done' }),
  createNote('3', '밥 약속'),
];
const ids = (list) => list.map((n) => n.id);

test('AC1 ignores case', () => {
  assert.deepEqual(ids(searchNotes(notes, 'MILK')), ['1']);
});
test('AC2 ignores surrounding spaces', () => {
  assert.deepEqual(ids(searchNotes(notes, '  milk  ')), ['1']);
});
test('AC3 applies the status filter too', () => {
  assert.deepEqual(ids(searchNotes(notes, 'mom', 'open')), []);
  assert.deepEqual(ids(searchNotes(notes, 'mom', 'done')), ['2']);
});
test('AC4 empty query returns the whole list', () => {
  assert.deepEqual(ids(searchNotes(notes, '')), ['1', '2', '3']);
  assert.deepEqual(ids(searchNotes(notes, '   ', 'done')), ['2']);
});
