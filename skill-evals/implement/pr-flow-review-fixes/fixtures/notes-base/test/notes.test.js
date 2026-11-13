import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNote } from '../src/notes.js';

test('createNote fills defaults', () => {
  assert.deepEqual(createNote('1', 'Milk'), { id: '1', title: 'Milk', status: 'open', tags: [], due: null });
});
