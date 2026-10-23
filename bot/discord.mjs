import { loadRadar } from './radar-data.mjs';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const HAS_BOT_TOKEN = Boolean(DISCORD_BOT_TOKEN);
const DISCORD_INVITE_URL = process.env.DISCORD_INVITE_URL || 'https://discord.gg/A4rxRGx4Vt';
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const DISCORD_APP_ID = process.env.DISCORD_APP_ID || '1560162295445979197';
const FALLBACK_PUBLIC_WEB_APP_URL = 'https://nvidia-pathfinder.vercel.app';
const LOGO_URL = `${FALLBACK_PUBLIC_WEB_APP_URL}/brand/qadam-avatar.png`;
const AVATAR_FILE = 'public/brand/qadam-avatar.png';
const OFFICIAL_SLOGAN = 'QADAM («Қадам») means "step" in Kazakh. Your next step toward global opportunities, grants, and technologies.';
const BRAND_FOOTER = 'QADAM (Қадам) · nvidia-pathfinder.vercel.app';

// Helper: Ensure all Discord URLs point to a valid public HTTPS target
function getWebUrl(subpath = '') {
  let base = process.env.WEB_APP_URL || FALLBACK_PUBLIC_WEB_APP_URL;
  if (!base || base.includes('localhost') || base.includes('127.0.0.1')) {
    base = FALLBACK_PUBLIC_WEB_APP_URL;
  }
  base = base.replace(/\/+$/, '');
  const cleanSubpath = subpath ? (subpath.startsWith('/') ? subpath : `/${subpath}`) : '';
  return `${base}${cleanSubpath}`;
}

const REST_API_BASE = 'https://discord.com/api/v10';
const GATEWAY_URL = 'wss://gateway.discord.gg/?v=10&encoding=json';

// Embed Color Constants
const COLOR_EMERALD = 0x10B981;
const COLOR_INDIGO = 0x4F46E5;
const COLOR_CYAN = 0x06B6D4;

const NO_MENTIONS = { parse: [] };

async function loadRadarSafe() {
  try {
    return await loadRadar();
  } catch (error) {
    console.error('[Radar Feed Error]', error.message);
    return [];
  }
}

function describeOpportunity(opp) {
  return `${opp.type}${opp.organization ? ` · ${opp.organization}` : ''} · Deadline: ${opp.deadline || 'see official page'}`;
}

// Helper: Make authenticated Discord REST API calls
async function callDiscordRest(endpoint, method = 'GET', body = null) {
  try {
    const res = await fetch(`${REST_API_BASE}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 204) return { ok: true, status: 204 };
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('[Discord REST Error] %s %s (%d):', method, endpoint, res.status, data);
      return { ok: false, status: res.status, error: data };
    }
    return { ok: true, data };
  } catch (err) {
    console.error('[Discord Network Error] %s %s:', method, endpoint, err.message);
    return { ok: false, error: err.message };
  }
}

// Helper: Send message to a Discord channel
async function sendChannelMessage(channelId, payload) {
  return callDiscordRest(`/channels/${channelId}/messages`, 'POST', { allowed_mentions: NO_MENTIONS, ...payload });
}

// Helper: Open private DM channel and send direct message
async function sendDirectMessage(userId, payload) {
  // Step 1: Create or get DM channel with user
  const channelRes = await callDiscordRest('/users/@me/channels', 'POST', {
    recipient_id: userId,
  });

  if (!channelRes.ok || !channelRes.data?.id) {
    console.error('Failed to create DM channel with user %s:', userId, channelRes.error);
    return { ok: false, error: 'Could not open DM channel' };
  }

  const dmChannelId = channelRes.data.id;
  // Step 2: Post payload to private DM channel
  return sendChannelMessage(dmChannelId, payload);
}

// Webhook Broadcaster Utility: posts the top live radar opportunity
export async function broadcastWebhook(payload = null) {
  if (!DISCORD_WEBHOOK_URL) {
    console.error('DISCORD_WEBHOOK_URL is not set.');
    return { ok: false, error: 'Missing webhook URL' };
  }

  let body = payload;
  if (!body) {
    const [opp] = await loadRadarSafe();
    if (!opp) {
      console.error('Broadcast skipped: the radar feed has no current opportunities.');
      return { ok: false, error: 'No current radar opportunities' };
    }
    body = {
      username: 'QADAM | AI Opportunity Hub',
      avatar_url: LOGO_URL,
      allowed_mentions: NO_MENTIONS,
      embeds: [
        {
          title: opp.title.slice(0, 256),
          url: opp.url,
          description: `New on the QADAM radar.\n${describeOpportunity(opp)}\n\nCheck eligibility and requirements in the source before applying.`,
          color: COLOR_EMERALD,
          thumbnail: { url: LOGO_URL },
          fields: [
            { name: 'Source', value: `[Open source](${opp.url})`, inline: true },
            { name: 'Full radar', value: `[QADAM website](${getWebUrl('/')})`, inline: true },
          ],
          footer: {
            text: BRAND_FOOTER,
            icon_url: LOGO_URL,
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }

  try {
    const res = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.status === 204 || res.ok) {
      console.log('Discord webhook alert dispatched.');
      return { ok: true, status: res.status };
    }
    const errData = await res.json().catch(() => ({}));
    console.error('Discord webhook dispatch failed:', res.status, errData);
    return { ok: false, status: res.status, error: errData };
  } catch (err) {
    console.error('Webhook fetch error:', err.message);
    return { ok: false, error: err.message };
  }
}

// -------------------------------------------------------------
// Discord Rich Embed Builders
// -------------------------------------------------------------

async function buildRadarEmbeds() {
  const items = await loadRadarSafe();
  return {
    embeds: [{
      title: 'QADAM Opportunity Radar',
      description: items.length
        ? 'Recent published results. Check each source before applying; missing deadlines are unconfirmed.\nUse `!draft <number>` for an application draft.'
        : 'No current radar results are available. Please check the website and try again later.',
      color: COLOR_EMERALD,
      fields: items.map((opp, index) => ({
        name: `${index + 1}. ${opp.title}`.slice(0, 256),
        value: `${describeOpportunity(opp)}\n[Open source](${opp.url})`,
        inline: false,
      })),
      timestamp: new Date().toISOString(),
    }],
  };
}

function buildGapsEmbed() {
  const embeds = [
    {
      title: 'CV Gap Analysis',
      description: 'The bot does not store your CV, so it cannot score it here. On the QADAM website, CV & Skill Lab compares your skills with a target opportunity you pick.',
      color: COLOR_INDIGO,
      thumbnail: { url: LOGO_URL },
      fields: [
        {
          name: 'What you get',
          value: '• An ATS health score for your profile\n• Required skills you already have\n• Missing or unverified skills\n• Short quizzes to verify a skill',
          inline: false,
        },
      ],
      footer: {
        text: BRAND_FOOTER,
        icon_url: LOGO_URL,
      },
    },
  ];

  const components = [
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 5,
          label: 'Open CV & Skill Lab',
          url: getWebUrl('/cv'),
        },
      ],
    },
  ];

  return { embeds, components };
}

function buildPrivacyEmbed() {
  const embeds = [
    {
      title: 'How QADAM handles your data',
      color: COLOR_EMERALD,
      thumbnail: { url: LOGO_URL },
      fields: [
        {
          name: '1. Profile stays in your browser',
          value: "Your profile and CV on the website are saved in your browser's local storage.",
          inline: false,
        },
        {
          name: '2. Masking before AI requests',
          value: 'Before text is sent to an AI model, names, email addresses, and phone numbers are replaced with placeholders such as `[USER_NAME_1]` and `[EMAIL_MASKED]`.',
          inline: false,
        },
        {
          name: '3. What this bot keeps',
          value: 'Nothing. Drafts are generated from the public radar and sent to your DMs; the bot never asks for your CV.',
          inline: false,
        },
      ],
      footer: {
        text: BRAND_FOOTER,
        icon_url: LOGO_URL,
      },
    },
  ];

  return { embeds };
}

async function buildDraftEmbed(index) {
  const items = await loadRadarSafe();
  const opp = items[index - 1] || items[0];
  if (!opp) return null;

  const embeds = [
    {
      title: `Application Draft: ${opp.title}`.slice(0, 256),
      url: opp.url,
      description: `${describeOpportunity(opp)}\n\n*Template with placeholders. Replace the [brackets] with your own details, or open Application Studio on the website to fill it from your profile.*`,
      color: COLOR_EMERALD,
      thumbnail: { url: LOGO_URL },
      fields: [
        {
          name: 'Summary of Intent',
          value: `I am applying for ${opp.title}. I am a [year] student in [major] at [university], and my work focuses on [your focus area].`.slice(0, 1024),
          inline: false,
        },
        {
          name: 'Relevant Experience',
          value: '1. [Project or role]: [what you built and the measurable result].\n2. [Skills]: [tools and methods that match the requirements in the source].\n3. [Why this opportunity]: [how it fits your goals].',
          inline: false,
        },
        {
          name: 'Proposed Contribution',
          value: '[What you plan to deliver or learn, in two or three sentences.]',
          inline: false,
        },
      ],
      footer: {
        text: BRAND_FOOTER,
        icon_url: LOGO_URL,
      },
    },
  ];

  const components = [
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 5,
          label: 'Open Source',
          url: opp.url,
        },
        {
          type: 2,
          style: 5,
          label: 'Application Studio',
          url: getWebUrl('/application-studio'),
        },
      ],
    },
  ];

  return { embeds, components, opp };
}

function buildHelpEmbed() {
  const embeds = [
    {
      title: 'QADAM Bot Commands',
      description: OFFICIAL_SLOGAN,
      color: COLOR_CYAN,
      thumbnail: { url: LOGO_URL },
      fields: [
        { name: '!radar', value: 'Current hackathons, grants, and internships from the QADAM radar.', inline: false },
        { name: '!draft <number>', value: 'Application draft for a radar opportunity, sent to your DMs.', inline: false },
        { name: '!gaps', value: 'How CV gap analysis works on the website.', inline: false },
        { name: '!privacy', value: 'How QADAM handles your data.', inline: false },
        { name: '!broadcast', value: 'Post the top radar opportunity to the announcement channel (operator only).', inline: false },
        { name: '!help', value: 'Show this list.', inline: false },
      ],
      footer: {
        text: BRAND_FOOTER,
        icon_url: LOGO_URL,
      },
    },
  ];

  const components = [
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 5,
          label: 'Open QADAM Website',
          url: getWebUrl('/'),
        },
        {
          type: 2,
          style: 5,
          label: 'Discord Invite',
          url: DISCORD_INVITE_URL,
        },
      ],
    },
  ];

  return { embeds, components };
}

// -------------------------------------------------------------
// Message Router for Guild Channels & Direct Messages
// -------------------------------------------------------------

async function handleDiscordMessage(msg) {
  // Ignore messages from other bots or itself
  if (msg.author?.bot) return;

  const rawContent = (msg.content || '').trim();
  const lower = rawContent.toLowerCase();
  const authorName = msg.author?.global_name || msg.author?.username || 'Student';
  const authorId = msg.author?.id;
  const channelId = msg.channel_id;

  // Check if message is a command or a mention of this bot
  const isCommand = rawContent.startsWith('!');
  const isMention = Array.isArray(msg.mentions) && msg.mentions.some((m) => m.id === DISCORD_APP_ID);

  if (!isCommand && !isMention) return;

  console.log(`[Discord Command] From @${authorName} (${authorId}) in #${channelId}: "${rawContent}"`);

  // 1. !radar
  if (lower.startsWith('!radar') || (isMention && lower.includes('radar'))) {
    return sendChannelMessage(channelId, await buildRadarEmbeds());
  }

  // 2. !gaps
  if (lower.startsWith('!gaps') || (isMention && (lower.includes('gap') || lower.includes('cv')))) {
    return sendChannelMessage(channelId, buildGapsEmbed());
  }

  // 3. !privacy
  if (lower.startsWith('!privacy') || (isMention && lower.includes('privacy'))) {
    return sendChannelMessage(channelId, buildPrivacyEmbed());
  }

  // 4. !draft <number> -> DM Bridge
  if (lower.startsWith('!draft')) {
    const index = Number(rawContent.split(/\s+/)[1]) || 1;
    const draftPayload = await buildDraftEmbed(index);

    if (!draftPayload) {
      return sendChannelMessage(channelId, {
        content: 'No radar opportunities are available right now, so there is nothing to draft. Please try again later.',
      });
    }

    const { opp, ...dmPayload } = draftPayload;
    const dmResult = await sendDirectMessage(authorId, dmPayload);

    if (dmResult.ok) {
      return sendChannelMessage(channelId, {
        content: `<@${authorId}>, your application draft for **${opp.title}** is in your DMs.`,
        allowed_mentions: { users: [authorId] },
      });
    }
    // In case user has DMs closed for server members
    return sendChannelMessage(channelId, {
      content: `<@${authorId}>, I could not send you a DM. Your Discord privacy settings block DMs from server members. Enable Direct Messages, or open Application Studio: ${getWebUrl('/application-studio')}`,
      allowed_mentions: { users: [authorId] },
    });
  }

  // 5. !broadcast
  if (lower.startsWith('!broadcast')) {
    if (!process.env.DISCORD_BROADCAST_USER_ID || authorId !== process.env.DISCORD_BROADCAST_USER_ID) {
      return sendChannelMessage(channelId, { content: 'Broadcast is restricted to the configured operator.' });
    }
    const broadcastRes = await broadcastWebhook();
    if (broadcastRes.ok) {
      return sendChannelMessage(channelId, {
        content: '**Radar alert sent.** The top radar opportunity was posted to the announcement channel.',
      });
    }
    return sendChannelMessage(channelId, {
      content: `**Broadcast failed:** ${broadcastRes.error?.message || broadcastRes.error || broadcastRes.status}`,
    });
  }

  // 6. !help or default mention
  if (lower.startsWith('!help') || isMention) {
    return sendChannelMessage(channelId, buildHelpEmbed());
  }
}

// -------------------------------------------------------------
// Discord Gateway Connection via Native WebSocket (Node.js 22)
// -------------------------------------------------------------

function startDiscordGateway() {
  console.log(`\n======================================================`);
  console.log(`QADAM | AI Opportunity Hub: Discord Bot starting`);
  console.log(`Gateway: ${GATEWAY_URL}`);
  console.log(`Web App Target: ${getWebUrl()}`);
  console.log(`Invite: ${DISCORD_INVITE_URL}`);
  console.log(`------------------------------------------------------`);
  console.log(`AVATAR SETUP: upload '${AVATAR_FILE}' as App Icon & Bot Avatar at:`);
  console.log(`https://discord.com/developers/applications/${DISCORD_APP_ID}/bot`);
  console.log(`======================================================\n`);

  let ws = null;
  let heartbeatTimer = null;
  let lastSequence = null;
  let isReconnecting = false;

  function connect() {
    ws = new WebSocket(GATEWAY_URL);

    ws.onopen = () => {
      console.log('Gateway WebSocket connected to Discord.');
    };

    ws.onmessage = async (event) => {
      try {
        const payload = JSON.parse(event.data);
        const { op, d, s, t } = payload;

        if (s !== null && s !== undefined) {
          lastSequence = s;
        }

        // Opcode 10: HELLO -> Start Heartbeat & Identify
        if (op === 10) {
          const heartbeatInterval = d.heartbeat_interval;
          console.log(`Heartbeat interval set to: ${heartbeatInterval}ms`);

          if (heartbeatTimer) clearInterval(heartbeatTimer);
          heartbeatTimer = setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ op: 1, d: lastSequence }));
            }
          }, heartbeatInterval);

          // Identify Bot
          const identifyPayload = {
            op: 2,
            d: {
              token: DISCORD_BOT_TOKEN,
              intents: 1 | 512 | 4096 | 32768, // GUILDS, GUILD_MESSAGES, DIRECT_MESSAGES, MESSAGE_CONTENT
              properties: {
                os: process.platform,
                browser: 'qadam-agent-bot',
                device: 'qadam-agent-bot',
              },
            },
          };
          ws.send(JSON.stringify(identifyPayload));
        }

        // Opcode 11: HEARTBEAT ACK
        if (op === 11) {
          // Heartbeat acknowledged
        }

        // Opcode 0: DISPATCH EVENT
        if (op === 0) {
          if (t === 'READY') {
            console.log(`Authenticated with Discord as: ${d.user.username} (ID: ${d.user.id})`);
            console.log(`Listening for server commands (!radar, !gaps, !privacy, !draft, !broadcast, !help)`);
          }

          if (t === 'MESSAGE_CREATE') {
            await handleDiscordMessage(d);
          }
        }

        // Opcode 9: Invalid Session -> Re-identify
        if (op === 9) {
          console.warn('Invalid session from Discord. Reconnecting in 3s...');
          setTimeout(reconnect, 3000);
        }

        // Opcode 7: Reconnect request
        if (op === 7) {
          console.log('Reconnect requested by Discord. Reconnecting...');
          reconnect();
        }
      } catch (err) {
        console.error('[Gateway Message Error]:', err.message);
      }
    };

    ws.onclose = (event) => {
      console.warn(`Discord Gateway disconnected (Code: ${event.code}, Reason: ${event.reason || 'None'}).`);
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      // Automatically reconnect unless process is terminating
      if (!isReconnecting) {
        isReconnecting = true;
        setTimeout(() => {
          isReconnecting = false;
          connect();
        }, 5000);
      }
    };

    ws.onerror = (err) => {
      console.error('[Gateway Error]:', err.message || err);
    };
  }

  function reconnect() {
    if (ws) {
      try {
        ws.close();
      } catch (e) {
        // Ignore
      }
    }
  }

  connect();

  process.on('SIGINT', () => {
    console.log('\nQADAM Discord Bot shutting down...');
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    if (ws) ws.close(1000, 'Process interrupted');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\nQADAM Discord Bot terminating...');
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    if (ws) ws.close(1000, 'Process terminated');
    process.exit(0);
  });
}

// Check for standalone CLI flags (e.g. node bot/discord.mjs --broadcast)
const args = process.argv.slice(2);
if (args.includes('--broadcast') || args.includes('-b')) {
  console.log('Running standalone Webhook broadcast...');
  broadcastWebhook().then(() => {
    process.exit(0);
  });
} else {
  if (!HAS_BOT_TOKEN) { console.error('Missing DISCORD_BOT_TOKEN in .env'); process.exit(1); }
  startDiscordGateway();
}

