// QADAM KakaoTalk Channel. The chatbot lives in the channel (Kakao i Open Builder,
// see api/kakao/skill.js); the site only links students to its chat.
// Public channel id from pf.kakao.com/_xxxx, e.g. _xAbCdE.
export const KAKAO_CHANNEL_ID = import.meta.env.VITE_KAKAO_CHANNEL_ID || '';

export const isKakaoChannelConfigured = (): boolean => Boolean(KAKAO_CHANNEL_ID);

// '/chat' opens the 1:1 chat with the bot; '' opens the channel home with the add button.
export const kakaoChannelUrl = (path: '' | '/chat' = '/chat'): string =>
  KAKAO_CHANNEL_ID ? `https://pf.kakao.com/${KAKAO_CHANNEL_ID}${path}` : '';
