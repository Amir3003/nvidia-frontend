// Kakao REST API helpers shared by the /api/kakao/* functions.
const TOKEN_URL = 'https://kauth.kakao.com/oauth/token';
const PROFILE_URL = 'https://kapi.kakao.com/v2/user/me';
const TOKEN_INFO_URL = 'https://kapi.kakao.com/v1/user/access_token_info';
const MEMO_URL = 'https://kapi.kakao.com/v2/api/talk/memo/default/send';
const FALLBACK_WEB_APP_URL = 'https://nvidia-pathfinder.vercel.app';

export const clientId = () => process.env.KAKAO_REST_API_KEY || process.env.VITE_KAKAO_REST_API_KEY || '';
export const redirectUri = () => process.env.KAKAO_REDIRECT_URI || process.env.VITE_KAKAO_REDIRECT_URI || '';
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

async function requestToken(params) {
  params.set('client_id', clientId());
  if (process.env.KAKAO_CLIENT_SECRET) params.set('client_secret', process.env.KAKAO_CLIENT_SECRET);
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
    body: params,
    signal: AbortSignal.timeout(10000),
  });
  const token = await response.json();
  if (!response.ok || !token.access_token) {
    throw new Error(token.error_description || 'Kakao token request failed');
  }
  const now = Date.now();
  return {
    accessToken: token.access_token,
    expiresAt: now + Number(token.expires_in || 0) * 1000,
    refreshToken: token.refresh_token || '',
    refreshExpiresAt: token.refresh_token_expires_in ? now + Number(token.refresh_token_expires_in) * 1000 : 0,
    scope: String(token.scope || ''),
  };
}

export const exchangeCode = (code) =>
  requestToken(new URLSearchParams({ grant_type: 'authorization_code', redirect_uri: redirectUri(), code }));

export const refreshTokens = (refreshToken) =>
  requestToken(new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }));

export async function getProfile(accessToken) {
  const response = await fetch(PROFILE_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) return null;
  const user = await response.json();
  const account = user.kakao_account || {};
  return {
    id: String(user.id),
    nickname: account.profile?.nickname || user.properties?.nickname || '',
    email: account.email || '',
    avatarUrl: account.profile?.profile_image_url || user.properties?.profile_image || '',
  };
}

// Resolves the Kakao user id behind an access token, or null when the token is invalid.
export async function verifyAccessToken(accessToken) {
  if (!accessToken) return null;
  const response = await fetch(TOKEN_INFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) return null;
  const info = await response.json();
  return info.id ? String(info.id) : null;
}

// Sends a text message to the user's own KakaoTalk chat ("talk_message" consent required).
// Kakao limits the text template to 200 characters.
export async function sendMemo(accessToken, { text, path = '/notifications', buttonTitle = 'QADAM 열기' }) {
  const url = webAppUrl(path);
  const template = {
    object_type: 'text',
    text: text.length > 200 ? `${text.slice(0, 197)}...` : text,
    link: { web_url: url, mobile_web_url: url },
    button_title: buttonTitle,
  };
  const response = await fetch(MEMO_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    body: new URLSearchParams({ template_object: JSON.stringify(template) }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const failure = new Error(error.msg || `Kakao message HTTP ${response.status}`);
    failure.status = response.status;
    failure.code = error.code;
    throw failure;
  }
}

export function formatDigest(items) {
  if (!items.length) return 'QADAM 레이더: 오늘은 새로운 기회가 없습니다. No new opportunities today.';
  const lines = items.slice(0, 3).map((item, index) => {
    const deadline = item.deadline ? ` (~${item.deadline.slice(5)})` : '';
    return `${index + 1}. ${item.title.slice(0, 48)}${deadline}`;
  });
  return ['QADAM 레이더 / Radar', ...lines].join('\n');
}
