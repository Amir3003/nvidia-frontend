// Subscriber store backed by Upstash Redis over REST (Vercel Marketplace: Upstash for Redis).
// Kakao tokens are encrypted with AES-256-GCM before they leave the function.
import crypto from 'node:crypto';

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const SUBSCRIBERS_KEY = 'kakao:subscribers';
const userKey = (id) => `kakao:user:${id}`;

export const isStoreConfigured = () => Boolean(REDIS_URL && REDIS_TOKEN && process.env.KAKAO_TOKEN_SECRET);

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

const encryptionKey = () => crypto.createHash('sha256').update(String(process.env.KAKAO_TOKEN_SECRET)).digest();

function encrypt(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const data = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((part) => part.toString('base64url')).join('.');
}

function decrypt(value) {
  const [iv, tag, data] = String(value).split('.').map((part) => Buffer.from(part, 'base64url'));
  const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}

export async function saveSubscriber({ id, nickname, accessToken, refreshToken, expiresAt, refreshExpiresAt }) {
  const record = {
    id,
    nickname,
    accessToken: encrypt(accessToken),
    refreshToken: encrypt(refreshToken),
    expiresAt,
    refreshExpiresAt,
    subscribedAt: new Date().toISOString(),
  };
  await redis('SET', userKey(id), JSON.stringify(record));
  await redis('SADD', SUBSCRIBERS_KEY, id);
}

export async function getSubscriber(id) {
  const raw = await redis('GET', userKey(id));
  if (!raw) return null;
  const record = JSON.parse(raw);
  return { ...record, accessToken: decrypt(record.accessToken), refreshToken: decrypt(record.refreshToken) };
}

export async function updateSubscriberTokens(id, tokens) {
  const raw = await redis('GET', userKey(id));
  if (!raw) return;
  const record = JSON.parse(raw);
  record.accessToken = encrypt(tokens.accessToken);
  record.expiresAt = tokens.expiresAt;
  if (tokens.refreshToken) {
    record.refreshToken = encrypt(tokens.refreshToken);
    record.refreshExpiresAt = tokens.refreshExpiresAt;
  }
  await redis('SET', userKey(id), JSON.stringify(record));
}

export async function removeSubscriber(id) {
  await redis('DEL', userKey(id));
  await redis('SREM', SUBSCRIBERS_KEY, id);
}

export const listSubscriberIds = async () => (await redis('SMEMBERS', SUBSCRIBERS_KEY)) || [];

export async function getValue(key) {
  return redis('GET', key);
}

export async function setValue(key, value) {
  return redis('SET', key, value);
}
