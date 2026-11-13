import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listPage } from '../src/page.js';

test('lists every order', () => {
  assert.match(listPage([{ id: 1, customer: 'Kim', total: 1 }]), /<li>Kim: 1<\/li>/);
});
