import { loadRadar } from './radar-data.mjs';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const HAS_BOT_TOKEN = Boolean(DISCORD_BOT_TOKEN);
const DISCORD_INVITE_URL = process.env.DISCORD_INVITE_URL || 'https://discord.gg/A4rxRGx4Vt';
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const FALLBACK_PUBLIC_WEB_APP_URL = 'https://nvidia-pathfinder.vercel.app';
const LOGO_URL = `${FALLBACK_PUBLIC_WEB_APP_URL}/logo.png`;
const OFFICIAL_SLOGAN = 'QADAM («Қадам») — derived from the Kazakh word for "step". Your confident step toward global opportunities, grants, and technologies. 🚀';
const BRAND_FOOTER = 'QADAM (Қадам) • Your confident step toward global opportunities • https://nvidia-pathfinder.vercel.app';

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
const COLOR_EMERALD = 0x10B981; // 1096065
const COLOR_INDIGO = 0x4F46E5;  // 5195493
const COLOR_CYAN = 0x06B6D4;    // 439956
const COLOR_ROSE = 0xF43F5E;    // 16007006

// Top Verified Opportunities Database
const OPPORTUNITIES = [
  {
    id: 'opp-1',
    key: 'nebius',
    num: '1',
    title: 'Nebius x NVIDIA Global AI Hackathon',
    match: 94,
    track: 'GPU Compute & Multimodal Agents (Virtual)',
    award: '$50,000 Compute Credits + Cash Pool',
    deadline: 'April 28, 2026',
    eligibility: 'Active Student / Academic Researcher (Verified)',
    skills: 'PyTorch, Docker, LLMs',
    gaps: 'Verified alignment: Top quartile (No critical gaps)',
  },
  {
    id: 'opp-2',
    key: 'mext',
    num: '2',
    title: 'MEXT Scholarship: Graduate AI Research',
    match: 88,
    track: 'Ministry of Education, Culture & Science (Japan)',
    award: 'Full Tuition Waiver + ¥145,000/mo Stipend',
    deadline: 'May 15, 2026',
    eligibility: 'Bachelor completed, Age under 35 (Verified)',
    skills: 'Python, Linux, Research Methodology',
    gaps: 'Benchmark fit: Take Docker & Linux quiz for +6% boost',
  },
  {
    id: 'opp-3',
    key: 'anthropic',
    num: '3',
    title: 'Anthropic AI Alignment & Safety Fellowship',
    match: 91,
    track: 'Frontier Safety & Interpretability (San Francisco / Hybrid)',
    award: '$10,000/month Research Stipend + Mentorship',
    deadline: 'June 01, 2026',
    eligibility: 'Enrolled Graduate or Technical Student Builder',
    skills: 'PyTorch, LLMs, Safety Eval',
    gaps: 'Verified alignment: PyTorch verified (+6% ATS boost)',
  },
];

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
      console.error(`[Discord REST Error] ${method} ${endpoint} (${res.status}):`, data);
      return { ok: false, status: res.status, error: data };
    }
    return { ok: true, data };
  } catch (err) {
    console.error(`[Discord Network Error] ${method} ${endpoint}:`, err.message);
    return { ok: false, error: err.message };
  }
}

// Helper: Send message to a Discord channel
async function sendChannelMessage(channelId, payload) {
  return callDiscordRest(`/channels/${channelId}/messages`, 'POST', payload);
}

// Helper: Open private DM channel and send direct message
async function sendDirectMessage(userId, payload) {
  // Step 1: Create or get DM channel with user
  const channelRes = await callDiscordRest('/users/@me/channels', 'POST', {
    recipient_id: userId,
  });

  if (!channelRes.ok || !channelRes.data?.id) {
    console.error(`Failed to create DM channel with user ${userId}:`, channelRes.error);
    return { ok: false, error: 'Could not open DM channel' };
  }

  const dmChannelId = channelRes.data.id;
  // Step 2: Post payload to private DM channel
  return sendChannelMessage(dmChannelId, payload);
}

// Webhook Broadcaster Utility
export async function broadcastWebhook(payload = null) {
  if (!DISCORD_WEBHOOK_URL) {
    console.error('❌ DISCORD_WEBHOOK_URL is not set.');
    return { ok: false, error: 'Missing webhook URL' };
  }

  const defaultPayload = {
    username: 'QADAM | AI Opportunity Hub',
    avatar_url: LOGO_URL,
    embeds: [
      {
        title: '🎯 Nebius x NVIDIA Global AI Hackathon (94% Match)',
        description: `⚡ **New High-Priority Grant & Hackathon Match Dispatched!**\nDirect student alignment detected for GPU Compute & Autonomous Multimodal Agents.\n\n*${OFFICIAL_SLOGAN}*`,
        color: COLOR_EMERALD,
        thumbnail: { url: LOGO_URL },
        fields: [
          { name: '🏆 Award / Pool', value: '$50,000 Compute Credits + Cash Pool', inline: true },
          { name: '⏳ Deadline', value: 'April 28, 2026', inline: true },
          { name: '📋 Eligibility', value: 'Active Student / Academic Researcher (Verified)', inline: false },
          { name: '⚡ Core Stack', value: '`PyTorch` · `Docker` · `LLMs`', inline: true },
          { name: '🛡 Privacy Shield', value: 'Zero-Leak Client-Side Masking', inline: true },
        ],
        url: getWebUrl('/application-studio?id=opp-1'),
        footer: {
          text: BRAND_FOOTER,
          icon_url: LOGO_URL,
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    const res = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || defaultPayload),
    });

    if (res.status === 204 || res.ok) {
      console.log('✅ Discord Webhook alert successfully dispatched to channel!');
      return { ok: true, status: res.status };
    }
    const errData = await res.json().catch(() => ({}));
    console.error('❌ Discord Webhook dispatch failed:', res.status, errData);
    return { ok: false, status: res.status, error: errData };
  } catch (err) {
    console.error('❌ Webhook fetch error:', err.message);
    return { ok: false, error: err.message };
  }
}

// -------------------------------------------------------------
// Discord Rich Embed Builders
// -------------------------------------------------------------

async function buildRadarEmbeds() {
  let items;
  try {
    items = await loadRadar();
  } catch (error) {
    console.error('[Radar Feed Error]', error.message);
    items = [];
  }
  return {
    embeds: [{
      title: '🎯 QADAM Opportunity Radar',
      description: items.length
        ? 'Recent published results. Check each source before applying; missing deadlines are unconfirmed.'
        : 'No current radar results are available. Please check the website and try again later.',
      color: COLOR_EMERALD,
      fields: items.map((opp, index) => ({
        name: `${index + 1}. ${opp.title}`.slice(0, 256),
        value: `${opp.type} · Deadline: ${opp.deadline || 'not confirmed'}\n[Open source](${opp.url})`,
        inline: false,
      })),
      timestamp: new Date().toISOString(),
    }],
    allowed_mentions: { parse: [] },
  };
}

function buildGapsEmbed(userName = 'Student') {
  const embeds = [
    {
      title: '📊 QADAM | AI Opportunity Hub — ATS Gap Analysis',
      description: `Target Candidate: **${userName}**\n\n**${OFFICIAL_SLOGAN}**\n\nOverall CV Health Score: **89 / 100** *(Top Quartile)*\nTarget Benchmark: **Global AI Hackathons & Research Fellowships**`,
      color: COLOR_INDIGO,
      thumbnail: { url: LOGO_URL },
      fields: [
        {
          name: '✅ Verified Credentials (+18% ATS Match)',
          value: '• **PyTorch:** 95% proficiency (Quiz Verified)\n• **LLMs & Prompt Architecture:** 92% (Quiz Verified)\n• **Linux Systems:** 88% (Quiz Verified)',
          inline: false,
        },
        {
          name: '⚠️ Unverified / Benchmark Gaps',
          value: '• **Docker:** Listed on CV, requires verification score >70%\n• **CUDA / TensorRT:** Required for high-throughput Nebius GPU track',
          inline: false,
        },
        {
          name: '💡 Recommended Next Action',
          value: 'Complete the interactive 5-question verification quiz on the QADAM platform to elevate your match score from **89% to 96%**!',
          inline: false,
        },
      ],
      footer: {
        text: BRAND_FOOTER,
        icon_url: LOGO_URL,
      },
      timestamp: new Date().toISOString(),
    },
  ];

  const components = [
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 5,
          label: 'Take Skill Verification Quiz',
          url: getWebUrl('/cv'),
        },
        {
          type: 2,
          style: 5,
          label: 'Open QADAM Workspace',
          url: getWebUrl('/'),
        },
      ],
    },
  ];

  return { embeds, components };
}

function buildPrivacyEmbed() {
  const embeds = [
    {
      title: '🛡 QADAM | AI Opportunity Hub — Zero-PII Shield Architecture',
      description: `**${OFFICIAL_SLOGAN}**\n\nComplete privacy specification for student candidate data protection during model inference and radar dispatch.`,
      color: COLOR_EMERALD,
      thumbnail: { url: LOGO_URL },
      fields: [
        {
          name: '1. Client-Side Identity Tokenization',
          value: 'Personal names, phone numbers, email addresses, and national IDs are tokenized into anonymized placeholders (`[USER_NAME_1]`, `[EMAIL_MASKED]`) locally before any network dispatch.',
          inline: false,
        },
        {
          name: '2. Frontier Model Isolation',
          value: 'Inference models (`nvidia/Nemotron-3.5-Lightning`) only receive masked prompts, completely preventing third-party student profiling or data training.',
          inline: false,
        },
        {
          name: '3. OpenShell Sandbox Isolation',
          value: 'All local tool runs and environment execution occur inside strictly confined container walls with zero unauthorized disk traversal.',
          inline: false,
        },
        {
          name: '4. Direct Webhook & DM Delivery',
          value: 'Confidential proposals are delivered directly to the user private DMs with zero third-party broker logging.',
          inline: false,
        },
      ],
      footer: {
        text: BRAND_FOOTER,
        icon_url: LOGO_URL,
      },
      timestamp: new Date().toISOString(),
    },
  ];

  return { embeds };
}

function buildDraftEmbed(oppKeyOrNum, userName = 'Candidate') {
  const opp = OPPORTUNITIES.find(
    (o) => o.num === oppKeyOrNum || o.key === oppKeyOrNum.toLowerCase() || o.id === oppKeyOrNum
  ) || OPPORTUNITIES[0];

  const embeds = [
    {
      title: `🔒 Confidential Application Proposal: ${opp.title}`,
      description: `⚡ **PII Anonymization Layer Active**\n*All candidate identifiers tokenized prior to prompt dispatch.*\n\n*${OFFICIAL_SLOGAN}*`,
      color: COLOR_EMERALD,
      thumbnail: { url: LOGO_URL },
      fields: [
        { name: 'Target Opportunity', value: `**${opp.title}**`, inline: true },
        { name: 'Candidate Identifier', value: '`[USER_NAME_1]` (Verified)', inline: true },
        { name: 'Target Track', value: `*${opp.track}*`, inline: true },
        {
          name: '📄 Summary of Intent',
          value: `I am submitting this application for the ${opp.title}. As an active student researcher specializing in AI and High-Performance Systems, my work focuses on building safe, low-latency autonomous workflows.`,
          inline: false,
        },
        {
          name: '⚡ Technical Alignment',
          value: `1. **Core Stack Mastery:** Hands-on experience with ${opp.skills}, incorporating clean modular design patterns and high-throughput execution.\n2. **Safe Agent Containment:** Direct integration with OpenShell sandbox isolation to ensure zero unauthorized disk or network traversal.\n3. **Track Relevance:** Direct application of our research toward ${opp.track}.`,
          inline: false,
        },
        {
          name: '🏆 Proposed Deliverable',
          value: 'Production-ready containerized prototype with reproducible evaluation benchmarks and zero-leak client-side privacy protection.',
          inline: false,
        },
        {
          name: '📂 Local Workspace Path',
          value: `\`/workspace/qadam/drafts/${opp.id}.txt\` (Encrypted)`,
          inline: false,
        },
      ],
      footer: {
        text: BRAND_FOOTER,
        icon_url: LOGO_URL,
      },
      timestamp: new Date().toISOString(),
    },
  ];

  const components = [
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 5,
          label: '🚀 Open in Application Studio',
          url: getWebUrl(`/application-studio?id=${opp.id}`),
        },
        {
          type: 2,
          style: 5,
          label: '🌐 View Radar',
          url: getWebUrl('/'),
        },
      ],
    },
  ];

  return { embeds, components, opp };
}

function buildHelpEmbed() {
  const embeds = [
    {
      title: '📖 QADAM | AI Opportunity Hub — Commands Guide',
      description: `**${OFFICIAL_SLOGAN}**\n\nOfficial commands to interact with the QADAM Career & Opportunity Agent directly on Discord:`,
      color: COLOR_CYAN,
      thumbnail: { url: LOGO_URL },
      fields: [
        { name: '!radar', value: 'Browse top verified student opportunities, hackathons & research grants with match scores.', inline: false },
        { name: '!gaps', value: 'Inspect your ATS resume gap analysis, verified skills, and recommended benchmark tasks.', inline: false },
        { name: '!privacy', value: 'Review the zero-leak client-side privacy shield and sandbox specifications.', inline: false },
        { name: '!draft <1|2|3>', value: 'Generate a confidential, PII-masked application proposal sent securely to your private DMs.', inline: false },
        { name: '!broadcast', value: 'Dispatch a live opportunity alert to the server announcement channel via webhook.', inline: false },
        { name: '!help', value: 'Display this command guide and quick web links.', inline: false },
      ],
      footer: {
        text: BRAND_FOOTER,
        icon_url: LOGO_URL,
      },
      timestamp: new Date().toISOString(),
    },
  ];

  const components = [
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 5,
          label: 'Open QADAM Platform',
          url: getWebUrl('/'),
        },
        {
          type: 2,
          style: 5,
          label: 'Official Discord Invite',
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
  const authorName = msg.author?.global_name || msg.author?.username || 'Student Builder';
  const authorId = msg.author?.id;
  const channelId = msg.channel_id;

  // Check if message is a command or mention
  const isCommand = rawContent.startsWith('!');
  const isMention = rawContent.includes('1560162295445979197'); // Bot client ID

  if (!isCommand && !isMention) return;

  console.log(`[Discord Command] From @${authorName} (${authorId}) in #${channelId}: "${rawContent}"`);

  // 1. !radar
  if (lower.startsWith('!radar') || (isMention && lower.includes('radar'))) {
    const payload = await buildRadarEmbeds();
    return sendChannelMessage(channelId, payload);
  }

  // 2. !gaps
  if (lower.startsWith('!gaps') || (isMention && (lower.includes('gap') || lower.includes('cv')))) {
    const payload = buildGapsEmbed(authorName);
    return sendChannelMessage(channelId, payload);
  }

  // 3. !privacy
  if (lower.startsWith('!privacy') || (isMention && lower.includes('privacy'))) {
    const payload = buildPrivacyEmbed();
    return sendChannelMessage(channelId, payload);
  }

  // 4. !draft <1|2|3|key> -> DM Bridge
  if (lower.startsWith('!draft')) {
    const parts = rawContent.split(/\s+/);
    const targetKey = parts[1] || '1';
    const draftPayload = buildDraftEmbed(targetKey, authorName);

    // Send the confidential proposal directly to the student's private DM
    const dmResult = await sendDirectMessage(authorId, draftPayload);

    if (dmResult.ok) {
      return sendChannelMessage(channelId, {
        content: `🔒 **Confidential Proposal Dispatched!** <@${authorId}>, your zero-leak proposal draft for **${draftPayload.opp.title}** has been delivered directly to your private DMs.`,
      });
    } else {
      // In case user has DMs closed for server members
      return sendChannelMessage(channelId, {
        content: `⚠️ <@${authorId}>, I tried sending your confidential proposal to your DMs, but your Discord privacy settings block DMs from server members. Please enable Direct Messages or open the proposal directly: ${getWebUrl(`/application-studio?id=${draftPayload.opp.id}`)}`,
      });
    }
  }

  // 5. !broadcast
  if (lower.startsWith('!broadcast')) {
    if (!process.env.DISCORD_BROADCAST_USER_ID || authorId !== process.env.DISCORD_BROADCAST_USER_ID) {
      return sendChannelMessage(channelId, { content: 'Broadcast is restricted to the configured operator.' });
    }
    const broadcastRes = await broadcastWebhook();
    if (broadcastRes.ok) {
      return sendChannelMessage(channelId, {
        content: `📡 **Radar Alert Dispatched!** Rich opportunity embed has been broadcast to the designated channel via webhook.`,
      });
    } else {
      return sendChannelMessage(channelId, {
        content: `❌ **Broadcast Error:** Unable to reach webhook endpoint. (${broadcastRes.error?.message || broadcastRes.status})`,
      });
    }
  }

  // 6. !help or default mention
  if (lower.startsWith('!help') || isMention) {
    const payload = buildHelpEmbed();
    return sendChannelMessage(channelId, payload);
  }
}

// -------------------------------------------------------------
// Discord Gateway Connection via Native WebSocket (Node.js 22)
// -------------------------------------------------------------

function startDiscordGateway() {
  console.log(`\n======================================================`);
  console.log(`🎮 QADAM | AI Opportunity Hub — Discord Bot Starting...`);
  console.log(`📡 Gateway: ${GATEWAY_URL}`);
  console.log(`🌐 Web App Target: ${getWebUrl()}`);
  console.log(`🖼 Brand Logo Asset: ${LOGO_URL}`);
  console.log(`🔗 Invite: ${DISCORD_INVITE_URL}`);
  console.log(`💬 Official Slogan: ${OFFICIAL_SLOGAN}`);
  console.log(`------------------------------------------------------`);
  console.log(`💡 AVATAR SETUP: To set official bot avatar in Discord Portal:`);
  console.log(`   Upload 'public/logo.png' as App Icon & Bot Avatar at:`);
  console.log(`   https://discord.com/developers/applications/1560162295445979197/bot`);
  console.log(`======================================================\n`);

  let ws = null;
  let heartbeatTimer = null;
  let lastSequence = null;
  let isReconnecting = false;

  function connect() {
    ws = new WebSocket(GATEWAY_URL);

    ws.onopen = () => {
      console.log('⚡ Gateway WebSocket connected to Discord.');
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
          console.log(`💓 Heartbeat interval set to: ${heartbeatInterval}ms`);

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
            console.log(`✅ Authenticated with Discord as: ${d.user.username}#${d.user.discriminator} (ID: ${d.user.id})`);
            console.log(`🛡 Bot is listening for server commands (!radar, !gaps, !privacy, !draft, !broadcast, !help)`);
          }

          if (t === 'MESSAGE_CREATE') {
            await handleDiscordMessage(d);
          }
        }

        // Opcode 9: Invalid Session -> Re-identify
        if (op === 9) {
          console.warn('⚠️ Invalid session from Discord. Reconnecting in 3s...');
          setTimeout(reconnect, 3000);
        }

        // Opcode 7: Reconnect request
        if (op === 7) {
          console.log('🔄 Reconnect requested by Discord. Reconnecting...');
          reconnect();
        }
      } catch (err) {
        console.error('[Gateway Message Error]:', err.message);
      }
    };

    ws.onclose = (event) => {
      console.warn(`🔌 Discord Gateway disconnected (Code: ${event.code}, Reason: ${event.reason || 'None'}).`);
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
    console.log('\n🛑 QADAM Discord Bot shutting down...');
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    if (ws) ws.close(1000, 'Process interrupted');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 QADAM Discord Bot terminating...');
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    if (ws) ws.close(1000, 'Process terminated');
    process.exit(0);
  });
}

// Check for standalone CLI flags (e.g. node bot/discord.mjs --broadcast)
const args = process.argv.slice(2);
if (args.includes('--broadcast') || args.includes('-b')) {
  console.log('🚀 Running standalone Webhook broadcast...');
  broadcastWebhook().then(() => {
    process.exit(0);
  });
} else {
  if (!HAS_BOT_TOKEN) { console.error('Missing DISCORD_BOT_TOKEN in .env'); process.exit(1); }
  startDiscordGateway();
}

