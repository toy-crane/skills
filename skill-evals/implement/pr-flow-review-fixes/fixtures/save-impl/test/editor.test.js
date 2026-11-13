import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNote } from '../src/notes.js';
import { createEditor } from '../src/editor.js';

function memoryStore() {
  const puts = [];
  return { puts, put: (note) => new Promise((done) => setTimeout(() => { puts.push(note); done(); }, 10)) };
}

test('AC1 saves through store.put and ends saved', async () => {
  const store = memoryStore();
  const editor = createEditor(store);
  await editor.save(createNote('1', 'Milk'));
  assert.equal(store.puts.length, 1);
  assert.equal(editor.status, 'saved');
});
test('AC2 is saving while the put is in flight', async () => {
  const editor = createEditor(memoryStore());
  const pending = editor.save(createNote('1', 'Milk'));
  assert.equal(editor.status, 'saving');
  await pending;
});
