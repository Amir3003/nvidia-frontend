// Kakao i Open Builder skill server for the QADAM KakaoTalk Channel chatbot.
// Point the bot's fallback block and the qadam_alert event block at this URL. If
// KAKAO_SKILL_SECRET is set, add the header "x-qadam-skill-key: <secret>" in the skill settings.
import { isEventApiConfigured, readJsonBody, webAppUrl } from '../_lib/kakao.js';
import { addSubscriber, isStoreConfigured, isSubscriber, removeSubscriber } from '../_lib/store.js';
import { loadRadar } from '../../bot/radar-data.mjs';

const QUICK_REPLIES = [
  { label: '레이더 Radar', action: 'message', messageText: '레이더' },
  { label: '구독 Subscribe', action: 'message', messageText: '구독' },
  { label: '도움말 Help', action: 'message', messageText: '도움말' },
];

const COMMANDS = {
  radar: ['레이더', 'radar', '/radar', '기회', '공고'],
  subscribe: ['구독', 'subscribe', '/subscribe', '알림'],
  stop: ['해지', '구독해지', 'stop', '/stop', 'unsubscribe', '/unsubscribe'],
  status: ['상태', 'status', '/status'],
  site: ['사이트', 'site', 'web', '/site'],
  help: ['도움말', 'help', '/help', '/start', '시작', '안녕', '안녕하세요', 'hi', 'hello'],
};

const reply = (outputs) => ({ version: '2.0', template: { outputs, quickReplies: QUICK_REPLIES } });
const text = (value) => ({ simpleText: { text: value.length > 1000 ? `${value.slice(0, 997)}...` : value } });

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

async function subscribeReply(botUserKey) {
  if (!botUserKey || !isStoreConfigured()) {
    return reply([text('알림 기능을 준비 중입니다. Alerts are not available yet, try "레이더" anytime.')]);
  }
  await addSubscriber(botUserKey);
  const note = isEventApiConfigured()
    ? '새로운 장학금과 해커톤 소식을 이 채팅으로 보내드릴게요. New opportunities will arrive in this chat.'
    : '구독이 저장되었습니다. 알림 발송이 시작되면 이 채팅으로 보내드릴게요. Saved: alerts will arrive here once sending is enabled.';
  return reply([text(`QADAM 알림 구독 완료. ${note}\n\n"해지" stops alerts.`)]);
}

async function stopReply(botUserKey) {
  if (botUserKey && isStoreConfigured()) await removeSubscriber(botUserKey);
  return reply([text('알림이 해지되었습니다. Alerts are off. Send "구독" to turn them back on.')]);
}

async function statusReply(botUserKey) {
  const subscribed = Boolean(botUserKey && isStoreConfigured() && (await isSubscriber(botUserKey)));
  return reply([
    text(
      subscribed
        ? '알림 구독 중입니다. You are subscribed to QADAM alerts.'
        : '구독하지 않았습니다. Send "구독" to subscribe.'
    ),
  ]);
}

const siteReply = () =>
  reply([
    {
      textCard: {
        title: 'QADAM AI Opportunity Hub',
        description: '장학금, 해커톤, 인턴십을 한곳에서. Grants, hackathons and internships in one place.',
        buttons: [{ label: '사이트 열기', action: 'webLink', webLinkUrl: webAppUrl('/') }],
      },
    },
  ]);

const helpReply = () =>
  reply([
    text(
      [
        'QADAM («Қадам») AI Opportunity Hub',
        '',
        '레이더 / radar: 최신 장학금, 해커톤, 인턴십',
        '구독 / subscribe: 새 기회 알림 받기',
        '해지 / stop: 알림 해지',
        '상태 / status: 구독 상태 확인',
        '사이트 / site: QADAM 웹사이트',
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
  // Event API deliveries (qadam_alert block) carry the message in the event params.
  const alertText = body.action?.params?.qadam_text;
  if (typeof alertText === 'string' && alertText) {
    return response.status(200).json(reply([text(alertText)]));
  }

  const utterance = String(body.userRequest?.utterance || '');
  // userRequest.user.id is the botUserKey: stable per user and channel, used for Event API.
  const botUserKey = body.userRequest?.user?.id ? String(body.userRequest.user.id) : '';

  try {
    switch (detectCommand(utterance)) {
      case 'radar':
        return response.status(200).json(await radarReply());
      case 'subscribe':
        return response.status(200).json(await subscribeReply(botUserKey));
      case 'stop':
        return response.status(200).json(await stopReply(botUserKey));
      case 'status':
        return response.status(200).json(await statusReply(botUserKey));
      case 'site':
        return response.status(200).json(siteReply());
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
