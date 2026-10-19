// Kakao OAuth 2.0 (REST API) authorization code flow.
// 1. startKakaoLogin() redirects to kauth.kakao.com with a random state.
// 2. Kakao redirects back to VITE_KAKAO_REDIRECT_URI (/welcome) with ?code&state.
// 3. completeKakaoLogin() verifies state and exchanges the code via /api/kakao/token.
// With subscribe, the "talk_message" scope is requested and the server stores the tokens
// so the QADAM KakaoTalk bot can deliver alerts (see api/kakao).

const AUTHORIZE_URL = 'https://kauth.kakao.com/oauth/authorize';
const STATE_KEY = 'qadam_kakao_oauth_state';
const INTENT_KEY = 'qadam_kakao_oauth_intent';
const SESSION_KEY = 'qadam_kakao_session';

export const KAKAO_APP_ID = import.meta.env.VITE_KAKAO_APP_ID || '1613530';
const REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY || '';
const REDIRECT_URI =
  import.meta.env.VITE_KAKAO_REDIRECT_URI || 'https://nvidia-pathfinder.vercel.app/welcome';
const TOKEN_ENDPOINT = import.meta.env.VITE_KAKAO_TOKEN_ENDPOINT || '/api/kakao/token';
const MESSAGE_ENDPOINT = '/api/kakao/message';
// Public KakaoTalk Channel id (e.g. _xAbCdE) used for the "add channel" and chat links.
export const KAKAO_CHANNEL_ID = import.meta.env.VITE_KAKAO_CHANNEL_ID || '';

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

export interface KakaoLoginResult {
  session: KakaoSession;
  subscribed: boolean;
  subscribeError: string;
  returnTo: string;
}

interface KakaoLoginIntent {
  subscribe: boolean;
  returnTo: string;
}

export const isKakaoConfigured = (): boolean => Boolean(REST_API_KEY);

export const kakaoChannelUrl = (path: '' | '/chat' = ''): string =>
  KAKAO_CHANNEL_ID ? `https://pf.kakao.com/${KAKAO_CHANNEL_ID}${path}` : '';

export function startKakaoLogin(options: Partial<KakaoLoginIntent> = {}): void {
  if (!REST_API_KEY) throw new Error('Kakao login is not configured (VITE_KAKAO_REST_API_KEY)');
  const intent: KakaoLoginIntent = { subscribe: Boolean(options.subscribe), returnTo: options.returnTo || '/' };
  const state = crypto.randomUUID();
  sessionStorage.setItem(STATE_KEY, state);
  sessionStorage.setItem(INTENT_KEY, JSON.stringify(intent));
  const params = new URLSearchParams({
    client_id: REST_API_KEY,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    state,
  });
  if (intent.subscribe) params.set('scope', 'talk_message');
  window.location.assign(`${AUTHORIZE_URL}?${params.toString()}`);
}

export function hasKakaoCallback(search: string): boolean {
  const params = new URLSearchParams(search);
  return params.has('state') && (params.has('code') || params.has('error'));
}

function readIntent(): KakaoLoginIntent {
  try {
    const intent = JSON.parse(sessionStorage.getItem(INTENT_KEY) || '{}');
    const returnTo = typeof intent.returnTo === 'string' && intent.returnTo.startsWith('/') ? intent.returnTo : '/';
    return { subscribe: intent.subscribe === true, returnTo };
  } catch {
    return { subscribe: false, returnTo: '/' };
  }
}

export async function completeKakaoLogin(search: string): Promise<KakaoLoginResult> {
  const params = new URLSearchParams(search);
  const expectedState = sessionStorage.getItem(STATE_KEY);
  const intent = readIntent();
  sessionStorage.removeItem(STATE_KEY);
  sessionStorage.removeItem(INTENT_KEY);

  const error = params.get('error');
  if (error) throw new Error(params.get('error_description') || error);
  if (!expectedState || params.get('state') !== expectedState) {
    throw new Error('Kakao login state mismatch, please try again');
  }

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: params.get('code'), subscribe: intent.subscribe }),
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
  return {
    session,
    subscribed: data.subscribed === true,
    subscribeError: typeof data.subscribeError === 'string' ? data.subscribeError : '',
    returnTo: intent.returnTo,
  };
}

// Bot subscription actions, authorized by the user's own Kakao access token.
export async function kakaoBotAction(action: 'status' | 'test' | 'unsubscribe'): Promise<{ subscribed?: boolean }> {
  const session = loadKakaoSession();
  if (!session) throw new Error('Kakao session expired, please reconnect');
  const response = await fetch(MESSAGE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, accessToken: session.accessToken }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Kakao request failed');
  return data;
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
