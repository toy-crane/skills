import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toCsv } from '../src/csv.js';

test('header and one row per order', () => {
  assert.equal(toCsv([{ id: 1, customer: 'Kim', total: 1 }]), 'id,customer,total\n1,Kim,1\n');
});

test('commas and quotes are quoted with quotes doubled', () => {
  assert.equal(toCsv([{ id: 2, customer: 'A, "B"', total: 3 }]), 'id,customer,total\n2,"A, ""B""",3\n');
});
