const MAX_PUBLISHED = 30;
const UNDATED_TTL_DAYS = 21;

function addDays(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// Combine today's scan with the previous feed so one thin scan does not wipe it.
// Dated items stay until their deadline passes; undated ones expire after
// UNDATED_TTL_DAYS without being seen again. Confirmed deadlines sort first.
export function mergeOpportunities(previous, fresh, today) {
  const undatedCutoff = addDays(today, -UNDATED_TTL_DAYS);
  const byUrl = new Map();
  for (const item of Array.isArray(previous) ? previous : []) {
    if (!item?.url) continue;
    if (item.deadline && item.deadline < today) continue;
    if (!item.deadline && (item.lastSeen || today) < undatedCutoff) continue;
    // Items published before lastSeen existed start aging from today.
    byUrl.set(item.url, item.lastSeen ? item : { ...item, lastSeen: today });
  }
  for (const item of fresh) {
    const old = byUrl.get(item.url);
    // A fresh scan without deadline evidence must not erase an earlier confirmed date.
    const keepOldDeadline = old?.deadline && !item.deadline;
    byUrl.set(item.url, {
      ...item,
      deadline: keepOldDeadline ? old.deadline : item.deadline,
      deadlineEvidence: keepOldDeadline ? old.deadlineEvidence : item.deadlineEvidence,
      firstSeen: old?.firstSeen || today,
      lastSeen: today,
    });
  }
  return [...byUrl.values()]
    .sort((a, b) => {
      if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline);
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      return (b.lastSeen || '').localeCompare(a.lastSeen || '');
    })
    .slice(0, MAX_PUBLISHED);
}
