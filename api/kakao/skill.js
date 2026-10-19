// Kakao i Open Builder skill server for the QADAM KakaoTalk Channel chatbot.
// Point the bot's fallback block at this URL. The bot only answers messages, which is free;
// it never messages first (that needs the paid Event API). If KAKAO_SKILL_SECRET is set, add
// the header "x-qadam-skill-key: <secret>" in the skill settings.
import { readJsonBody, webAppUrl } from '../_lib/kakao.js';
import { loadRadar } from '../../bot/radar-data.mjs';

const QUICK_REPLIES = [
  { label: '레이더 Radar', action: 'message', messageText: '레이더' },
  { label: '마감 Deadlines', action: 'message', messageText: '마감' },
  { label: '도움말 Help', action: 'message', messageText: '도움말' },
];

const COMMANDS = {
  radar: ['레이더', 'radar', '/radar', '기회', '공고'],
  deadlines: ['마감', 'deadline', 'deadlines', '/deadlines', '마감임박'],
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

async function deadlinesReply() {
  const items = (await loadRadar(50).catch(() => []))
    .filter((item) => item.deadline)
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, 5);
  if (!items.length) return reply([text('마감일이 정해진 기회가 없습니다. No upcoming deadlines right now.')]);
  const lines = items.map((item, index) => `${index + 1}. ${item.deadline} · ${item.title}\n${item.url}`);
  return reply([text(['마감 임박 / Closing soon', '', ...lines].join('\n'))]);
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
        '마감 / deadlines: 마감이 가까운 기회',
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
  const utterance = String(body.userRequest?.utterance || '');

  try {
    switch (detectCommand(utterance)) {
      case 'radar':
        return response.status(200).json(await radarReply());
      case 'deadlines':
        return response.status(200).json(await deadlinesReply());
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
