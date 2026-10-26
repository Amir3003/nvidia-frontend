// POST /api/data-request: access, deletion or correction request from the Privacy page.
// The request is validated and forwarded to DATA_REQUEST_WEBHOOK_URL (server-only, https, for
// example a Discord channel webhook). Nothing is stored. Without a webhook the endpoint answers
// 503 so nobody is told a request arrived when it did not; the form then offers email.
import { cleanText, clientIp, isSameOrigin, rateLimit, readJsonObject, sendJson } from './_lib/security.js';

const MAX_BODY_BYTES = 4 * 1024;
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
const KINDS = ['access', 'deletion', 'correction'];
const UNAVAILABLE = 'Online requests are not available right now.';

function webhookUrl() {
  try {
    const url = new URL(process.env.DATA_REQUEST_WEBHOOK_URL || '');
    return url.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}

export default async function handler(request, response) {
  if (request.method !== 'POST') return sendJson(response, 405, { status: 'error', message: 'Method not allowed.' }, { Allow: 'POST' });
  if (!isSameOrigin(request)) return sendJson(response, 403, { status: 'error', message: 'Cross-origin requests are not allowed.' });

  const limit = rateLimit(`data-request:${clientIp(request)}`, 3, 60 * 60_000);
  if (!limit.ok) {
    return sendJson(response, 429, { status: 'error', message: 'Too many requests. Please try again later.' }, { 'Retry-After': String(limit.retryAfter) });
  }

  const body = readJsonObject(request, MAX_BODY_BYTES);
  if (!body) return sendJson(response, 422, { status: 'error', message: 'Invalid request.' });

  // Honeypot: people never fill this hidden field, so pretend success for bots.
  if (typeof body.website === 'string' && body.website.length > 0) return sendJson(response, 200, { status: 'ok' });

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (email.length > 254 || !EMAIL.test(email)) return sendJson(response, 422, { status: 'error', message: 'Enter a valid email address.' });
  if (!KINDS.includes(body.kind)) return sendJson(response, 422, { status: 'error', message: 'Choose a request type.' });
  if (body.consent !== true) return sendJson(response, 422, { status: 'error', message: 'Please confirm the consent statement.' });
  if (body.ageConfirmed !== true) return sendJson(response, 422, { status: 'error', message: 'Please confirm the age statement.' });
  const details = typeof body.details === 'string' ? cleanText(body.details, 1000) : '';

  const url = webhookUrl();
  if (!url) return sendJson(response, 503, { status: 'error', message: UNAVAILABLE });

  const text = `Data request (${body.kind}) from ${email}${details ? `: ${details}` : ''}`;
  const isDiscord = /(^|\.)discord(app)?\.com$/.test(url.hostname);
  const payload = isDiscord
    ? { content: text.slice(0, 1900), allowed_mentions: { parse: [] } }
    : { text, kind: body.kind, email, details, receivedAt: new Date().toISOString() };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return sendJson(response, 502, { status: 'error', message: UNAVAILABLE });
  } catch {
    return sendJson(response, 502, { status: 'error', message: UNAVAILABLE });
  }

  return sendJson(response, 200, { status: 'ok' });
}
