// Kakao i Open Builder helpers shared by the /api/kakao/* functions.
const FALLBACK_WEB_APP_URL = 'https://www.qadamhub.com';

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
