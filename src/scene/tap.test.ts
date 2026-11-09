import test from 'node:test';
import assert from 'node:assert/strict';
import { TAP_MAX_MS, TAP_SLOP, isTap } from './tap.ts';

const down = { id: 1, x: 100, y: 100, time: 0 };
test('a short, still press is a tap; drags, long presses, other pointers and pinches are not', () => {
  assert.equal(isTap(down, { id: 1, x: 103, y: 104, time: 120 }, false), true);
  assert.equal(isTap(down, { id: 1, x: 100 + TAP_SLOP + 1, y: 100, time: 120 }, false), false);
  assert.equal(isTap(down, { id: 1, x: 100, y: 100, time: TAP_MAX_MS + 1 }, false), false);
  assert.equal(isTap(down, { id: 2, x: 100, y: 100, time: 50 }, false), false);
  assert.equal(isTap(down, { id: 1, x: 100, y: 100, time: 50 }, true), false);
  assert.equal(isTap(null, { id: 1, x: 100, y: 100, time: 50 }, false), false);
});
