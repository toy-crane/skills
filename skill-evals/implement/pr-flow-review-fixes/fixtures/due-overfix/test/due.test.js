import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNote } from '../src/notes.js';
import { sortByDue } from '../src/due.js';

const ids = (list) => list.map((n) => n.id);

test('AC1 earlier due dates come first', () => {
  const notes = [createNote('a', 'A', { due: '2026-03-02' }), createNote('b', 'B', { due: '2026-01-15' })];
  assert.deepEqual(ids(sortByDue(notes)), ['b', 'a']);
});
test('AC2 notes without a due date go last in their original order (review finding)', () => {
  const notes = [createNote('x', 'X'), createNote('a', 'A', { due: '2026-03-02' }), createNote('y', 'Y')];
  assert.deepEqual(ids(sortByDue(notes)), ['a', 'x', 'y']);
});
test('AC3 does not change the input', () => {
  const notes = [createNote('a', 'A', { due: '2026-03-02' }), createNote('b', 'B', { due: '2026-01-15' })];
  sortByDue(notes);
  assert.deepEqual(ids(notes), ['a', 'b']);
});
test('treats malformed dates as missing', () => {
  const notes = [createNote('m', 'M', { due: 'soon' }), createNote('a', 'A', { due: '2026-03-02' })];
  assert.deepEqual(ids(sortByDue(notes)), ['a', 'm']);
});
test('sorts descending when asked', () => {
  const notes = [createNote('b', 'B', { due: '2026-01-15' }), createNote('a', 'A', { due: '2026-03-02' })];
  assert.deepEqual(ids(sortByDue(notes, { descending: true })), ['a', 'b']);
});
test('returns an empty list for a non-array input', () => {
  assert.deepEqual(sortByDue(null), []);
});
