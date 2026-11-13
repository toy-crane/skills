import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNote } from '../src/notes.js';
import { filterByTag } from '../src/tags.js';

const notes = [
  createNote('1', 'Groceries', { tags: ['home'] }),
  createNote('2', 'Report', { tags: ['work'] }),
  createNote('3', 'Plumber', { tags: ['home', 'urgent'] }),
];
const ids = (list) => list.map((n) => n.id);

test('AC1 keeps notes with the chosen tag', () => {
  assert.deepEqual(ids(filterByTag(notes, 'home')), ['1', '3']);
});
test('AC2 keeps the original order', () => {
  assert.deepEqual(ids(filterByTag(notes, 'work')), ['2']);
});
test('AC3 does not change the input', () => {
  const copy = JSON.parse(JSON.stringify(notes));
  filterByTag(notes, 'home');
  assert.deepEqual(notes, copy);
});
