import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createComparison } from '../src/compare.js';

function fakeStage(heights) {
  return {
    scrollTop: 0,
    scrollHeight: 0,
    shown: null,
    render(alt) { this.shown = alt; this.scrollHeight = heights[alt]; },
  };
}

test('show renders the chosen alternative', () => {
  const stage = fakeStage({ a: 900, b: 900 });
  const c = createComparison(['a', 'b'], stage);
  assert.equal(c.show(1), 1);
  assert.equal(stage.shown, 'b');
});

test('an index outside the alternatives keeps the current one', () => {
  const stage = fakeStage({ a: 900, b: 900 });
  const c = createComparison(['a', 'b'], stage);
  assert.equal(c.show(2), 0);
  assert.equal(c.show(-1), 0);
});

test('switching keeps the scroll offset', () => {
  const stage = fakeStage({ a: 900, b: 900 });
  const c = createComparison(['a', 'b'], stage);
  stage.scrollTop = 400;
  c.show(1);
  assert.equal(stage.scrollTop, 400);
});
