// Bot subscriber store backed by Upstash Redis over REST (Vercel Marketplace: Upstash for Redis).
// Only Kakao botUserKeys are stored: no names, phone numbers or tokens.
const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const SUBSCRIBERS_KEY = 'kakao:bot:subscribers';

export const isStoreConfigured = () => Boolean(REDIS_URL && REDIS_TOKEN);

async function redis(...command) {
  if (!isStoreConfigured()) throw new Error('Subscriber store is not configured');
  const response = await fetch(REDIS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(8000),
  });
  const data = await response.json();
  if (!response.ok || data.error) throw new Error(data.error || `Redis HTTP ${response.status}`);
  return data.result;
}

export const addSubscriber = (botUserKey) => redis('SADD', SUBSCRIBERS_KEY, botUserKey);
export const removeSubscriber = (botUserKey) => redis('SREM', SUBSCRIBERS_KEY, botUserKey);
export const isSubscriber = async (botUserKey) => (await redis('SISMEMBER', SUBSCRIBERS_KEY, botUserKey)) === 1;
export const listSubscribers = async () => (await redis('SMEMBERS', SUBSCRIBERS_KEY)) || [];
export const getValue = (key) => redis('GET', key);
export const setValue = (key, value) => redis('SET', key, value);
