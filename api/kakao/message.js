// Account actions from the Notifications page. The caller proves who they are with their
// own Kakao access token; the server resolves the Kakao user id from it.
import { formatDigest, readJsonBody, verifyAccessToken } from '../_lib/kakao.js';
import { deliverToSubscriber } from '../_lib/delivery.js';
import { getSubscriber, isStoreConfigured, removeSubscriber } from '../_lib/store.js';
import { loadRadar } from '../../bot/radar-data.mjs';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }
  if (!isStoreConfigured()) return response.status(503).json({ error: 'Bot storage is not configured' });

  const body = readJsonBody(request);
  const id = await verifyAccessToken(typeof body.accessToken === 'string' ? body.accessToken : '');
  if (!id) return response.status(401).json({ error: 'Kakao session expired, please reconnect' });

  try {
    if (body.action === 'status') {
      return response.status(200).json({ subscribed: Boolean(await getSubscriber(id)) });
    }
    if (body.action === 'unsubscribe') {
      await removeSubscriber(id);
      return response.status(200).json({ subscribed: false });
    }
    if (body.action === 'test') {
      const items = await loadRadar(3).catch(() => []);
      const result = await deliverToSubscriber(id, { text: formatDigest(items), path: '/' });
      if (result !== 'sent') {
        return response.status(result === 'removed' ? 410 : 502).json({
          error: result === 'removed' ? 'Subscription not found, please reconnect' : 'KakaoTalk delivery failed',
        });
      }
      return response.status(200).json({ sent: true });
    }
    return response.status(400).json({ error: 'Unknown action' });
  } catch (error) {
    console.error('[Kakao message]', error.message);
    return response.status(500).json({ error: 'Kakao request failed' });
  }
}
