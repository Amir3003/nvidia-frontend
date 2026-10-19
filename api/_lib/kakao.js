// Kakao i Open Builder helpers shared by the /api/kakao/* functions.
const EVENT_API_URL = 'https://bot-api.kakao.com/v2/bots';
const FALLBACK_WEB_APP_URL = 'https://nvidia-pathfinder.vercel.app';
// Event block name configured in Open Builder; it answers with the skill below.
export const ALERT_EVENT_NAME = 'qadam_alert';

export const webAppUrl = (subpath = '') =>
  `${(process.env.WEB_APP_URL || FALLBACK_WEB_APP_URL).replace(/\/+$/, '')}${subpath}`;

export function readJsonBody(request) {
  if (typeof request.body === 'string') {
    try {
      return JSON.parse(request.body || '{}');
    } catch {
      return {};
    }
  }
  return request.body || {};
}

// Proactive messages need the Event API: a business-verified channel and a wallet linked
// to the bot (paid per message). Without KAKAO_BOT_ID the bot only answers commands.
export const isEventApiConfigured = () => Boolean(process.env.KAKAO_BOT_ID && process.env.KAKAO_REST_API_KEY);

// Sends `text` to up to 100 botUserKeys through the qadam_alert event block.
export async function sendAlert(botUserKeys, text) {
  const response = await fetch(`${EVENT_API_URL}/${process.env.KAKAO_BOT_ID}/talk`, {
    method: 'POST',
    headers: {
      Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      event: { name: ALERT_EVENT_NAME },
      user: botUserKeys.map((id) => ({ type: 'botUserKey', id })),
      params: { qadam_text: text },
    }),
    signal: AbortSignal.timeout(10000),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || (data.status && data.status !== 'SUCCESS')) {
    throw new Error(data.message || `Kakao Event API HTTP ${response.status}`);
  }
  return data;
}

export function formatDigest(items) {
  if (!items.length) return 'QADAM 레이더: 오늘은 새로운 기회가 없습니다. No new opportunities today.';
  const lines = items.slice(0, 5).map((item, index) => {
    const deadline = item.deadline ? ` (~${item.deadline})` : '';
    return `${index + 1}. ${item.title}${deadline}\n${item.url}`;
  });
  return ['QADAM 레이더 / Radar', '', ...lines].join('\n');
}
