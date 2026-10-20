import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeOpportunities } from '../backend/merge.mjs';

const item = (url, deadline = null, extra = {}) => ({ url, title: url, type: 'HACKATHON', deadline, ...extra });

test('keeps earlier items with future deadlines when a new scan is thin', () => {
  const merged = mergeOpportunities([item('a', '2026-12-01'), item('b', '2026-11-01')], [item('c')], '2026-10-20');
  assert.deepEqual(merged.map((x) => x.url), ['b', 'a', 'c']);
});

test('drops expired deadlines and stale undated items', () => {
  const previous = [item('old', '2026-10-01'), item('stale', null, { lastSeen: '2026-09-01' }), item('recent', null, { lastSeen: '2026-10-15' })];
  const merged = mergeOpportunities(previous, [item('new')], '2026-10-20');
  assert.deepEqual(merged.map((x) => x.url).sort(), ['new', 'recent']);
});

test('legacy items without lastSeen get stamped so they can expire later', () => {
  const merged = mergeOpportunities([item('legacy')], [item('n')], '2026-10-20').find((x) => x.url === 'legacy');
  assert.equal(merged.lastSeen, '2026-10-20');
  const later = mergeOpportunities([merged], [item('n')], '2026-11-20');
  assert.equal(later.some((x) => x.url === 'legacy'), false);
});

test('a rescan without evidence does not erase a confirmed deadline', () => {
  const previous = [item('a', '2026-12-01', { deadlineEvidence: 'Apply by Dec 1', firstSeen: '2026-10-01' })];
  const [merged] = mergeOpportunities(previous, [item('a')], '2026-10-20');
  assert.equal(merged.deadline, '2026-12-01');
  assert.equal(merged.deadlineEvidence, 'Apply by Dec 1');
  assert.equal(merged.firstSeen, '2026-10-01');
  assert.equal(merged.lastSeen, '2026-10-20');
});

test('confirmed deadlines sort first, soonest first', () => {
  const merged = mergeOpportunities([], [item('x'), item('late', '2027-03-01'), item('soon', '2026-11-05')], '2026-10-20');
  assert.deepEqual(merged.map((x) => x.url), ['soon', 'late', 'x']);
});
