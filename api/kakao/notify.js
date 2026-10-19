// Daily radar digest for every bot subscriber. Triggered by the Vercel cron in vercel.json
// (Authorization: Bearer CRON_SECRET) or manually with the same header. Pass ?force=1 to
// resend an unchanged digest. Requires the Event API (see isEventApiConfigured).
import { formatDigest, isEventApiConfigured, sendAlert } from '../_lib/kakao.js';
import { getValue, isStoreConfigured, listSubscribers, setValue } from '../_lib/store.js';
import { loadRadar } from '../../bot/radar-data.mjs';

const LAST_DIGEST_KEY = 'kakao:last-digest';
const BATCH_SIZE = 100;

export default async function handler(request, response) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.authorization !== `Bearer ${secret}`) {
    return response.status(401).json({ error: 'Unauthorized' });
  }
  if (!isStoreConfigured()) return response.status(503).json({ error: 'Bot storage is not configured' });
  if (!isEventApiConfigured()) return response.status(200).json({ skipped: 'Event API is not configured' });

  try {
    const items = await loadRadar(5);
    if (!items.length) return response.status(200).json({ skipped: 'empty radar' });

    const fingerprint = items.map((item) => item.url).join('|');
    const force = String(request.query?.force || '') === '1';
    if (!force && (await getValue(LAST_DIGEST_KEY)) === fingerprint) {
      return response.status(200).json({ skipped: 'digest unchanged' });
    }

    const subscribers = await listSubscribers();
    const text = formatDigest(items);
    let failedBatches = 0;
    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      try {
        await sendAlert(subscribers.slice(i, i + BATCH_SIZE), text);
      } catch (error) {
        failedBatches += 1;
        console.error('[Kakao notify]', error.message);
      }
    }
    await setValue(LAST_DIGEST_KEY, fingerprint);
    return response.status(200).json({ subscribers: subscribers.length, failedBatches });
  } catch (error) {
    console.error('[Kakao notify]', error.message);
    return response.status(500).json({ error: 'Digest failed' });
  }
}
