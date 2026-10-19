// Kakao i Open Builder skill server for the QADAM KakaoTalk Channel chatbot.
// Point the bot's fallback block (and any command blocks) at this URL. If KAKAO_SKILL_SECRET
// is set, add the header "x-qadam-skill-key: <secret>" in the Open Builder skill settings.
import { readJsonBody, webAppUrl } from '../_lib/kakao.js';
import { getSubscriber, isStoreConfigured, removeSubscriber } from '../_lib/store.js';
import { loadRadar } from '../../bot/radar-data.mjs';

const QUICK_REPLIES = [
  { label: '레이더 Radar', action: 'message', messageText: '레이더' },
  { label: '알림 연결 Link', action: 'message', messageText: '연결' },
  { label: '도움말 Help', action: 'message', messageText: '도움말' },
];

const COMMANDS = {
  radar: ['레이더', 'radar', '/radar', '기회', '공고'],
  link: ['연결', 'link', '/link', '구독', 'subscribe', '/subscribe', '상태', 'status'],
  stop: ['해지', '구독해지', 'stop', '/stop', 'unsubscribe', '/unsubscribe'],
  help: ['도움말', 'help', '/help', '/start', '시작', '안녕', 'hi', 'hello'],
};

const reply = (outputs) => ({ version: '2.0', template: { outputs, quickReplies: QUICK_REPLIES } });
const text = (value) => ({ simpleText: { text: value } });
const linkCard = (title, description, label, path) => ({
  textCard: {
    title,
    description,
    buttons: [{ label, action: 'webLink', webLinkUrl: webAppUrl(path) }],
  },
});

function detectCommand(utterance) {
  const normalized = utterance.trim().toLowerCase();
  for (const [command, words] of Object.entries(COMMANDS)) {
    if (words.some((word) => normalized === word || normalized.startsWith(`${word} `))) return command;
  }
  return 'unknown';
}

async function radarReply() {
  const items = await loadRadar(5).catch(() => []);
  if (!items.length) return reply([text('지금은 표시할 기회가 없습니다. No open opportunities right now.')]);
  return reply([
    {
      listCard: {
        header: { title: 'QADAM 레이더' },
        items: items.map((item) => ({
          title: item.title.slice(0, 50),
          description: [item.organization, item.type, item.deadline ? `~${item.deadline}` : '']
            .filter(Boolean)
            .join(' · ')
            .slice(0, 60),
          link: { web: item.url },
        })),
        buttons: [{ label: '전체 보기', action: 'webLink', webLinkUrl: webAppUrl('/') }],
      },
    },
  ]);
}

async function linkReply(appUserId) {
  if (appUserId && isStoreConfigured() && (await getSubscriber(appUserId))) {
    return reply([text('알림이 연결되어 있습니다. Your QADAM alerts are active. "해지" stops them.')]);
  }
  return reply([
    linkCard(
      'QADAM 알림 연결 / Link alerts',
      'QADAM 웹사이트에서 Notifications & Bots로 이동해 KakaoTalk 카드의 버튼을 누르세요. Open Notifications & Bots on the site and press the KakaoTalk button.',
      '연결하기 Connect',
      '/notifications'
    ),
  ]);
}

async function stopReply(appUserId) {
  if (appUserId && isStoreConfigured() && (await getSubscriber(appUserId))) {
    await removeSubscriber(appUserId);
    return reply([text('알림이 해지되었습니다. Alerts are off. Send "연결" to turn them back on.')]);
  }
  return reply([text('연결된 알림이 없습니다. There are no active alerts for this account.')]);
}

const helpReply = () =>
  reply([
    text(
      [
        'QADAM («Қадам») AI Opportunity Hub',
        '',
        '레이더 / radar: 최신 장학금, 해커톤, 인턴십',
        '연결 / link: 웹사이트 계정과 알림 연결',
        '해지 / stop: 알림 해지',
        '도움말 / help: 명령어 보기',
      ].join('\n')
    ),
  ]);

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }
  const secret = process.env.KAKAO_SKILL_SECRET;
  if (secret && request.headers['x-qadam-skill-key'] !== secret) {
    return response.status(401).json({ error: 'Unauthorized' });
  }

  const body = readJsonBody(request);
  const utterance = String(body.userRequest?.utterance || '');
  // appUserId is present when the KakaoTalk Channel is linked to the Kakao Login app.
  const appUserId = body.userRequest?.user?.properties?.appUserId
    ? String(body.userRequest.user.properties.appUserId)
    : '';

  try {
    switch (detectCommand(utterance)) {
      case 'radar':
        return response.status(200).json(await radarReply());
      case 'link':
        return response.status(200).json(await linkReply(appUserId));
      case 'stop':
        return response.status(200).json(await stopReply(appUserId));
      case 'help':
        return response.status(200).json(helpReply());
      default:
        return response
          .status(200)
          .json(reply([text('명령어를 이해하지 못했습니다. Unknown command. Try "레이더" or "도움말".')]));
    }
  } catch (error) {
    console.error('[Kakao skill]', error.message);
    return response.status(200).json(reply([text('잠시 후 다시 시도해 주세요. Please try again shortly.')]));
  }
}
