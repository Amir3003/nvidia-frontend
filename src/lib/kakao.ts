// Kakao OAuth 2.0 (REST API) authorization code flow.
// 1. startKakaoLogin() redirects to kauth.kakao.com with a random state.
// 2. Kakao redirects back to VITE_KAKAO_REDIRECT_URI (/welcome) with ?code&state.
// 3. completeKakaoLogin() verifies state and exchanges the code via /api/kakao/token.

const AUTHORIZE_URL = 'https://kauth.kakao.com/oauth/authorize';
const STATE_KEY = 'qadam_kakao_oauth_state';
const SESSION_KEY = 'qadam_kakao_session';

export const KAKAO_APP_ID = import.meta.env.VITE_KAKAO_APP_ID || '1613530';
const REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY || '';
const REDIRECT_URI =
  import.meta.env.VITE_KAKAO_REDIRECT_URI || 'https://nvidia-pathfinder.vercel.app/welcome';
const TOKEN_ENDPOINT = import.meta.env.VITE_KAKAO_TOKEN_ENDPOINT || '/api/kakao/token';

export interface KakaoUser {
  id: string;
  nickname: string;
  email: string;
  avatarUrl: string;
}

export interface KakaoSession {
  accessToken: string;
  expiresAt: number;
  user: KakaoUser;
}

export const isKakaoConfigured = (): boolean => Boolean(REST_API_KEY);

export function startKakaoLogin(): void {
  if (!REST_API_KEY) throw new Error('Kakao login is not configured (VITE_KAKAO_REST_API_KEY)');
  const state = crypto.randomUUID();
  sessionStorage.setItem(STATE_KEY, state);
  const params = new URLSearchParams({
    client_id: REST_API_KEY,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    state,
  });
  window.location.assign(`${AUTHORIZE_URL}?${params.toString()}`);
}

export function hasKakaoCallback(search: string): boolean {
  const params = new URLSearchParams(search);
  return params.has('state') && (params.has('code') || params.has('error'));
}

export async function completeKakaoLogin(search: string): Promise<KakaoSession> {
  const params = new URLSearchParams(search);
  const expectedState = sessionStorage.getItem(STATE_KEY);
  sessionStorage.removeItem(STATE_KEY);

  const error = params.get('error');
  if (error) throw new Error(params.get('error_description') || error);
  if (!expectedState || params.get('state') !== expectedState) {
    throw new Error('Kakao login state mismatch, please try again');
  }

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: params.get('code') }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.accessToken) {
    throw new Error(data.error || 'Kakao token exchange failed');
  }

  const session: KakaoSession = {
    accessToken: data.accessToken,
    expiresAt: Date.now() + Number(data.expiresIn || 0) * 1000,
    user: data.user,
  };
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Storage unavailable: session stays in memory for this visit only
  }
  return session;
}

export function loadKakaoSession(): KakaoSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as KakaoSession;
    return session.expiresAt > Date.now() ? session : null;
  } catch {
    return null;
  }
}

export function clearKakaoSession(): void {
  localStorage.removeItem(SESSION_KEY);
}
