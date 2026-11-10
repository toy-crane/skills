import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLending } from '../src/loans.js';

const catalog = [{ id: 'cam-1', name: 'Sony A7 camera' }, { id: 'proj-1', name: 'Epson projector' }];

test('an employee borrows a camera from search to confirmed return', () => {
  const lending = createLending(catalog);
  const range = { from: '2026-11-12', to: '2026-11-14' };
  assert.equal(lending.search('camera', range)[0].available, true);
  const loanId = lending.request('jisoo', 'cam-1', range);
  lending.approve(loanId);
  assert.equal(lending.holder('cam-1'), 'jisoo');
  assert.equal(lending.search('camera', range)[0].available, false);
  lending.confirmReturn(loanId, '2026-11-15');
  assert.equal(lending.holder('cam-1'), null);
  assert.equal(lending.loan(loanId).overdueDays, 1);
});

test('an item already lent cannot be requested for overlapping dates', () => {
  const lending = createLending(catalog);
  lending.approve(lending.request('jisoo', 'cam-1', { from: '2026-11-12', to: '2026-11-14' }));
  assert.throws(() => lending.request('minho', 'cam-1', { from: '2026-11-13', to: '2026-11-13' }));
});
