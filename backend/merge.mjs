import { createHash } from 'node:crypto';
import { publishable } from './radar-quality.mjs';

const MAX_PUBLISHED = 30;

// Stable id from the full URL. The old id used the first 12 URL characters,
// so every "https://www." link got the same id.
export function opportunityId(url) {
  return `scan-${createHash('sha1').update(url).digest('hex').slice(0, 12)}`;
}
// Combine today's scan with the previous feed so one thin scan does not wipe it.
// Only dated, actionable listings are published.
export function mergeOpportunities(previous, fresh, today) {
  const byUrl = new Map();
  for (const item of Array.isArray(previous) ? previous : []) {
    if (!publishable(item, today) || !item.deadlineEvidence) continue;
    byUrl.set(item.url, { ...item, id: opportunityId(item.url), lastSeen: item.lastSeen || today });
  }
  for (const item of fresh) {
    if (!publishable(item, today) || !item.deadlineEvidence) continue;
    const old = byUrl.get(item.url);
    byUrl.set(item.url, {
      ...item,
      id: opportunityId(item.url),
      summary: item.summary || old?.summary || '',
      firstSeen: old?.firstSeen || today,
      lastSeen: today,
    });
  }
  return [...byUrl.values()]
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, MAX_PUBLISHED);
}
