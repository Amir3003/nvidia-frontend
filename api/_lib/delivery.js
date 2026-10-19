import { refreshTokens, sendMemo } from './kakao.js';
import { getSubscriber, removeSubscriber, updateSubscriberTokens } from './store.js';

// Kakao error codes meaning the user revoked consent or unlinked the app.
const REVOKED_CODES = new Set([-401, -402]);

async function freshAccessToken(subscriber) {
  if (subscriber.expiresAt - 60_000 > Date.now()) return subscriber.accessToken;
  const tokens = await refreshTokens(subscriber.refreshToken);
  await updateSubscriberTokens(subscriber.id, tokens);
  return tokens.accessToken;
}

// Delivers one message to a stored subscriber. Returns 'sent', 'removed' or 'failed'.
export async function deliverToSubscriber(id, message) {
  const subscriber = await getSubscriber(id);
  if (!subscriber) {
    await removeSubscriber(id);
    return 'removed';
  }
  try {
    await sendMemo(await freshAccessToken(subscriber), message);
    return 'sent';
  } catch (error) {
    if (REVOKED_CODES.has(error.code) || /invalid_grant|expired/i.test(error.message)) {
      await removeSubscriber(id);
      return 'removed';
    }
    console.error(`[Kakao delivery] ${id}:`, error.message);
    return 'failed';
  }
}
