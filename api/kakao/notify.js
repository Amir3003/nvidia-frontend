// Daily radar digest for every KakaoTalk subscriber. Triggered by the Vercel cron in
// vercel.json (Authorization: Bearer CRON_SECRET) or manually with the same header.
// Pass ?force=1 to resend an unchanged digest.
import { formatDigest } from '../_lib/kakao.js';
import { deliverToSubscriber } from '../_lib/delivery.js';
import { getValue, isStoreConfigured, listSubscriberIds, setValue } from '../_lib/store.js';
import { loadRadar } from '../../bot/radar-data.mjs';

const LAST_DIGEST_KEY = 'kakao:last-digest';

export default async function handler(request, response) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.authorization !== `Bearer ${secret}`) {
    return response.status(401).json({ error: 'Unauthorized' });
  }
  if (!isStoreConfigured()) return response.status(503).json({ error: 'Bot storage is not configured' });

  try {
    const items = await loadRadar(3);
    if (!items.length) return response.status(200).json({ skipped: 'empty radar' });

    const fingerprint = items.map((item) => item.url).join('|');
    const force = String(request.query?.force || '') === '1';
    if (!force && (await getValue(LAST_DIGEST_KEY)) === fingerprint) {
      return response.status(200).json({ skipped: 'digest unchanged' });
    }

    const message = { text: formatDigest(items), path: '/' };
    const totals = { sent: 0, removed: 0, failed: 0 };
    for (const id of await listSubscriberIds()) {
      totals[await deliverToSubscriber(id, message)] += 1;
    }
    await setValue(LAST_DIGEST_KEY, fingerprint);
    return response.status(200).json(totals);
  } catch (error) {
    console.error('[Kakao notify]', error.message);
    return response.status(500).json({ error: 'Digest failed' });
  }
}
