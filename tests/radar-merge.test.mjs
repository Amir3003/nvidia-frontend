import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeOpportunities } from '../backend/merge.mjs';
import { confirmedDeadline } from '../backend/radar-quality.mjs';
import { validate } from '../backend/server.mjs';
import { loadRadar } from '../bot/radar-data.mjs';

const item = (url, deadline = '2026-12-01', extra = {}) => ({
  url, title: 'AI Challenge', type: 'HACKATHON', organization: 'Organizer',
  deadline, deadlineEvidence: deadline ? 'Apply by December 1, 2026' : null, ...extra,
});

test('removes expired and undated listings, including old undated records', () => {
  const old = [item('https://example.org/old', '2026-10-01'),
    item('https://example.org/undated', null), item('https://example.org/live')];
  const merged = mergeOpportunities(old, [item('https://example.org/new')], '2026-10-21');
  assert.deepEqual(merged.map((x) => x.url), ['https://example.org/live', 'https://example.org/new']);
});

test('rejects unknown organization and directory pages', () => {
  const merged = mergeOpportunities([], [item('https://devpost.com/c/artificial-intelligence'),
    item('https://example.org/hackathon', '2026-12-01', { organization: 'Unknown' }),
    item('https://example.org/real-hackathon')], '2026-10-21');
  assert.deepEqual(merged.map((x) => x.url), ['https://example.org/real-hackathon']);
});

test('requires a real deadline explicitly supported by a quote on the same page', () => {
  const page = 'Registration closes on October 30, 2026 for AI Challenge.';
  assert.equal(confirmedDeadline('2026-10-30', 'Registration closes on October 30, 2026', page, '2026-10-21'), true);
  assert.equal(confirmedDeadline('2026-10-29', 'Registration closes on October 30, 2026', page, '2026-10-21'), false);
  assert.equal(confirmedDeadline('2026-10-30', 'Registration closes on October 30, 2026', page, '2026-10-31'), false);
  assert.equal(confirmedDeadline('2026-02-30', 'Registration closes on February 30, 2026', page, '2026-01-01'), false);
});

test('scanner refuses undated, unknown, and non-event sources', () => {
  const source = 'AI Challenge. Registration closes on October 30, 2026.';
  const candidates = [
    item('https://example.org/challenge', '2026-10-30'),
    item('https://example.org/challenge', '2026-10-30', { organization: 'Unknown' }),
    item('https://example.org/challenge', null),
    item('https://example.org/challenge', '2026-10-29'),
    item('https://devpost.com/c/artificial-intelligence', '2026-10-30'),
  ].map((entry) => ({ ...entry, deadline_quote: 'Registration closes on October 30, 2026' }));
  const sources = new Map([['https://example.org/challenge', source], ['https://devpost.com/c/artificial-intelligence', source]]);
  const accepted = validate(candidates, sources, '2026-10-21');
  assert.equal(accepted.length, 1);
  assert.equal(accepted[0].deadline, '2026-10-30');
});

test('stable distinct ids and soonest deadline first', () => {
  const merged = mergeOpportunities([], [item('https://www.a.org/x'),
    item('https://www.b.org/y', '2026-11-05', { deadlineEvidence: 'Apply by November 5, 2026' })], '2026-10-21');
  assert.deepEqual(merged.map((x) => x.url), ['https://www.b.org/y', 'https://www.a.org/x']);
  assert.equal(new Set(merged.map((x) => x.id)).size, 2);
});

test('bot does not show incomplete or expired feed records', async (t) => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: true, json: async () => [
    item('https://example.org/past', '2020-01-01'),
    item('https://example.org/undated', null),
    item('https://example.org/unknown', '2099-12-01', { organization: 'Unknown' }),
    item('https://example.org/current', '2099-12-01', { deadlineEvidence: 'Apply by December 1, 2099' }),
  ] });
  t.after(() => { globalThis.fetch = originalFetch; });
  assert.deepEqual((await loadRadar()).map((entry) => entry.url), ['https://example.org/current']);
});
