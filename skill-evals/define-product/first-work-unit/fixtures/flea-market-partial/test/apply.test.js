import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMarkets } from '../src/market.js';

test('sellers can apply to an open market once', () => {
  const markets = createMarkets();
  const id = markets.open({ name: 'Mangwon Sunday', date: '2026-12-06', booths: 30 });
  markets.apply(id, 'yuna', 'handmade candles');
  assert.throws(() => markets.apply(id, 'yuna', 'candles again'));
  assert.deepEqual(markets.applications(id), [{ seller: 'yuna', goods: 'handmade candles', status: 'applied' }]);
});
