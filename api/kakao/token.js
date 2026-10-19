// Vercel serverless function: exchanges a Kakao authorization code for tokens and the
// user profile. Runs server-side so KAKAO_CLIENT_SECRET never reaches the browser.
const TOKEN_URL = 'https://kauth.kakao.com/oauth/token';
const PROFILE_URL = 'https://kapi.kakao.com/v2/user/me';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const clientId = process.env.KAKAO_REST_API_KEY || process.env.VITE_KAKAO_REST_API_KEY;
  const redirectUri = process.env.KAKAO_REDIRECT_URI || process.env.VITE_KAKAO_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return response.status(500).json({ error: 'Kakao integration is not configured' });
  }

  const body = typeof request.body === 'string' ? JSON.parse(request.body || '{}') : request.body || {};
  const code = typeof body.code === 'string' ? body.code : '';
  if (!code) return response.status(400).json({ error: 'Missing authorization code' });

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    redirect_uri: redirectUri,
    code,
  });
  if (process.env.KAKAO_CLIENT_SECRET) params.set('client_secret', process.env.KAKAO_CLIENT_SECRET);

  try {
    const tokenResponse = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: params,
    });
    const token = await tokenResponse.json();
    if (!tokenResponse.ok || !token.access_token) {
      return response.status(401).json({ error: token.error_description || 'Kakao token exchange failed' });
    }

    const profileResponse = await fetch(PROFILE_URL, {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const user = profileResponse.ok ? await profileResponse.json() : null;
    const account = user?.kakao_account || {};

    return response.status(200).json({
      accessToken: token.access_token,
      expiresIn: token.expires_in,
      refreshToken: token.refresh_token,
      scope: token.scope,
      user: {
        id: user?.id ? String(user.id) : '',
        nickname: account.profile?.nickname || user?.properties?.nickname || '',
        email: account.email || '',
        avatarUrl: account.profile?.profile_image_url || user?.properties?.profile_image || '',
      },
    });
  } catch {
    return response.status(502).json({ error: 'Kakao service unavailable' });
  }
}
