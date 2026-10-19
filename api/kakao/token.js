// Exchanges a Kakao authorization code for tokens and the user profile. When the user
// granted "talk_message" and asked to subscribe, the tokens are stored server-side so the
// QADAM bot can message them later. KAKAO_CLIENT_SECRET never reaches the browser.
import { clientId, exchangeCode, getProfile, readJsonBody, redirectUri, sendMemo } from '../_lib/kakao.js';
import { isStoreConfigured, saveSubscriber } from '../_lib/store.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }
  if (!clientId() || !redirectUri()) {
    return response.status(500).json({ error: 'Kakao integration is not configured' });
  }

  const body = readJsonBody(request);
  const code = typeof body.code === 'string' ? body.code : '';
  if (!code) return response.status(400).json({ error: 'Missing authorization code' });

  let tokens;
  let user;
  try {
    tokens = await exchangeCode(code);
    user = await getProfile(tokens.accessToken);
  } catch (error) {
    return response.status(401).json({ error: error.message || 'Kakao token exchange failed' });
  }
  if (!user) return response.status(502).json({ error: 'Kakao profile unavailable' });

  let subscribed = false;
  let subscribeError = '';
  if (body.subscribe === true) {
    if (!tokens.scope.split(' ').includes('talk_message')) {
      subscribeError = 'KakaoTalk message permission was not granted';
    } else if (!isStoreConfigured()) {
      subscribeError = 'Bot storage is not configured on the server';
    } else {
      try {
        await saveSubscriber({ id: user.id, nickname: user.nickname, ...tokens });
        await sendMemo(tokens.accessToken, {
          text: `${user.nickname || 'QADAM'}님, QADAM 알림이 연결되었습니다. Your QADAM alerts are on: new grants and hackathons will arrive here.`,
        });
        subscribed = true;
      } catch (error) {
        subscribeError = error.message || 'Subscription failed';
      }
    }
  }

  return response.status(200).json({
    accessToken: tokens.accessToken,
    expiresIn: Math.max(0, Math.round((tokens.expiresAt - Date.now()) / 1000)),
    scope: tokens.scope,
    subscribed,
    subscribeError,
    user,
  });
}
