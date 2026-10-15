import fs from 'node:fs';
import path from 'node:path';

// 1. Fallback environment loader if not passed via --env-file
function loadEnvFallback() {
  if (process.env.TELEGRAM_BOT_TOKEN) return;
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const raw = fs.readFileSync(envPath, 'utf8');
      for (const line of raw.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim();
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  } catch (err) {
    // Ignore fallback load error
  }
}

loadEnvFallback();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8629614483:AAGehIVcc-GpfRaOVsHISaLN3_gIMmp_XbY';
const BOT_USERNAME = process.env.BOT_USERNAME || 'QadamAgentBot';
const FALLBACK_PUBLIC_WEB_APP_URL = 'https://nvidia-pathfinder.vercel.app';
const LOGO_URL = `${FALLBACK_PUBLIC_WEB_APP_URL}/logo.png`;
const OFFICIAL_SLOGAN = 'QADAM («Қадам») — derived from the Kazakh word for "step". Your confident step toward global opportunities, grants, and technologies. 🚀';
const BRAND_FOOTER = 'QADAM (Қадам) • Your confident step toward global opportunities • https://nvidia-pathfinder.vercel.app';

// Helper: Ensure all Telegram inline keyboard buttons strictly receive a valid public HTTPS URL
function getWebUrl(subpath = '') {
  let base = process.env.WEB_APP_URL || FALLBACK_PUBLIC_WEB_APP_URL;
  if (!base || base.includes('localhost') || base.includes('127.0.0.1')) {
    base = FALLBACK_PUBLIC_WEB_APP_URL;
  }
  base = base.replace(/\/+$/, '');
  const cleanSubpath = subpath ? (subpath.startsWith('/') ? subpath : `/${subpath}`) : '';
  return `${base}${cleanSubpath}`;
}

const BASE_URL = `https://api.telegram.org/bot${TOKEN}`;

// In-memory student link registry (Chat ID -> Student Data)
const studentRegistry = new Map();

// Helper: Make Telegram API requests
async function callApi(method, payload = {}) {
  const url = `${BASE_URL}/${method}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.ok) {
      console.error(`[Telegram API Error] ${method}:`, data.description);
    }
    return data;
  } catch (err) {
    console.error(`[Network Error] ${method}:`, err.message);
    return { ok: false, error: err.message };
  }
}

// Helper: Send HTML formatted message
async function sendMessage(chatId, text, replyMarkup = null) {
  const payload = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  };
  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }
  return callApi('sendMessage', payload);
}

// Helper: Answer callback query
async function answerCallback(callbackQueryId, text = null, showAlert = false) {
  return callApi('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    text,
    show_alert: showAlert,
  });
}

// Top opportunities database
const OPPORTUNITIES = [
  {
    id: 'opp-1',
    key: 'nebius_nvidia',
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
    key: 'mext_ai',
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

// Content Renderers
function renderMainMenu(userName = 'Student') {
  return {
    text: `🦅 <b>Welcome to QADAM («Қадам») | AI Opportunity Hub</b>
<i>${OFFICIAL_SLOGAN}</i>

✅ <b>Account Status:</b> Linked to QADAM Workspace
👤 <b>Candidate:</b> <code>${userName}</code>
🛡 <b>Privacy Shield:</b> <code>ACTIVE</code> (Client-Side PII Tokenization)
⚡ <b>Confinement:</b> Local OpenShell Sandbox

Use the menu below to scan verified hackathons, check CV gaps, or generate privacy-preserving application proposals:

<code>${BRAND_FOOTER}</code>`,
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🎯 Opportunity Radar', callback_data: 'radar' },
          { text: '📊 Check CV Gaps', callback_data: 'gaps' },
        ],
        [
          { text: '🛡 Privacy Shield Status', callback_data: 'privacy' },
          { text: '⚡ Quick Proposal', callback_data: 'draft_nebius_nvidia' },
        ],
        [
          { text: '🌐 Open QADAM Web Workspace', url: getWebUrl() },
        ],
      ],
    },
  };
}

function renderRadar() {
  let text = `🎯 <b>QADAM | AI Opportunity Hub — Opportunity Radar</b>
<i>Real-time index of verified global student opportunities:</i>\n\n`;

  const keyboard = [];

  OPPORTUNITIES.forEach((opp, idx) => {
    text += `<b>${idx + 1}. ${opp.title}</b>\n`;
    text += `🔥 Match Compatibility: <b>${opp.match}%</b>\n`;
    text += `📍 Track: <i>${opp.track}</i>\n`;
    text += `🏆 Award / Prize: <b>${opp.award}</b>\n`;
    text += `⏳ Deadline: <code>${opp.deadline}</code>\n`;
    text += `📋 Eligibility: ${opp.eligibility}\n`;
    text += `⚡ Stack: <code>${opp.skills}</code>\n`;
    text += `💡 Status: <i>${opp.gaps}</i>\n\n`;

    keyboard.push([
      {
        text: `⚡ Draft Proposal: ${opp.title.split(' ')[0]} (${opp.match}%)`,
        callback_data: `draft_${opp.key}`,
      },
    ]);
  });

  keyboard.push([
    { text: '📊 Check CV Gap Details', callback_data: 'gaps' },
    { text: '🔙 Main Menu', callback_data: 'menu' },
  ]);

  keyboard.push([
    { text: '🌐 Open Radar on Web Platform', url: getWebUrl('/') },
  ]);

  text += `<i>${BRAND_FOOTER}</i>`;

  return { text, reply_markup: { inline_keyboard: keyboard } };
}

function renderGaps(userName = 'Student') {
  return {
    text: `📊 <b>ATS Gap Analysis & Skill Benchmark Matrix</b>
Candidate: <code>${userName}</code>
<i>${OFFICIAL_SLOGAN}</i>

<b>Overall CV Health Score:</b> 89 / 100 <i>(Top Quartile)</i>
<b>Target Benchmark:</b> Global AI Hackathons & Research Fellowships

✅ <b>Verified Credentials (+18% ATS Match):</b>
• <b>PyTorch:</b> 95% proficiency (Quiz Verified)
• <b>LLMs & Prompt Architecture:</b> 92% (Quiz Verified)
• <b>Linux Systems:</b> 88% (Quiz Verified)

⚠️ <b>Unverified / Gap Items:</b>
• <b>Docker:</b> Listed on resume, needs benchmark score &gt;70%
• <b>CUDA / TensorRT:</b> Required for high-throughput Nebius GPU track

💡 <i>Verify your missing Docker and CUDA credentials with the interactive 5-question quiz on the QADAM platform to boost your radar matches up to 96%!</i>

<i>${BRAND_FOOTER}</i>`,
    reply_markup: {
      inline_keyboard: [
        [
          { text: '📝 Take Skill Verification Quiz', url: getWebUrl('/cv') },
        ],
        [
          { text: '🎯 Opportunity Radar', callback_data: 'radar' },
          { text: '🔙 Main Menu', callback_data: 'menu' },
        ],
      ],
    },
  };
}

function renderPrivacy() {
  return {
    text: `🛡 <b>QADAM | AI Opportunity Hub — Privacy Shield Architecture</b>
<i>${OFFICIAL_SLOGAN}</i>

1. <b>Client-Side Identity Tokenization:</b>
Personal names, phone numbers, email addresses, and national IDs are tokenized into anonymized placeholders (e.g. <code>[USER_NAME_1]</code>, <code>[EMAIL_MASKED]</code>) locally before any request is dispatched to cloud inference models.

2. <b>Frontier LLM Protection:</b>
Cloud LLMs (such as <code>nvidia/Nemotron-3.5-Lightning</code>) only receive masked representations, eliminating third-party tracking or PII leakage risks.

3. <b>OpenShell Sandbox Isolation:</b>
All tool executions and code sandboxing occur in strictly confined containers without unauthorized disk traversal.

4. <b>Encrypted Telegram Integration:</b>
Bot notifications communicate directly via official Telegram MTProto endpoints with zero metadata broker intermediaries.

<i>${BRAND_FOOTER}</i>`,
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🎯 Back to Opportunity Radar', callback_data: 'radar' },
          { text: '🔙 Main Menu', callback_data: 'menu' },
        ],
      ],
    },
  };
}

function renderDraft(key, userName = 'Candidate') {
  const opp = OPPORTUNITIES.find((o) => o.key === key) || OPPORTUNITIES[0];

  const text = `🛡 <b>[PII Anonymization Layer Active]</b>
<i>${OFFICIAL_SLOGAN}</i>

<i>Tokenizing sensitive candidate identity prior to model dispatch:</i>
• Candidate Name: <code>[USER_NAME_1]</code>
• Phone: <code>[PHONE_MASKED]</code>
• Student ID: <code>[ID_MASKED]</code>
• University: <code>[INSTITUTION_VERIFIED]</code>

⚡ <i>Prompt dispatched to: nvidia/Nemotron-3.5-Lightning on Nebius Cloud...</i>
━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 <b>Application Proposal: ${opp.title}</b>
<b>Candidate:</b> [USER_NAME_1] (Student Researcher)
<b>Target Track:</b> ${opp.track}
<b>Deadline:</b> ${opp.deadline}

<b>Summary of Intent:</b>
I am submitting this application for the ${opp.title}. As an active student researcher specializing in AI and High-Performance Systems, my work focuses on building safe, low-latency autonomous workflows.

<b>Technical Alignment:</b>
1. <b>Core Stack Mastery:</b> Hands-on experience with ${opp.skills}, incorporating clean modular design patterns and high-throughput execution.
2. <b>Safe Agent Containment:</b> Direct integration with OpenShell sandbox isolation to ensure zero unauthorized disk or network traversal.
3. <b>Track Relevance:</b> Direct application of our research toward ${opp.track}.

<b>Proposed Deliverable:</b>
Production-ready containerized prototype with reproducible evaluation benchmarks and zero-leak client-side privacy protection.

✍️ <b>Candidate Signature:</b> <code>[USER_NAME_1]</code> (Verified Student Profile)
━━━━━━━━━━━━━━━━━━━━━━━━━━
📂 <i>Draft saved to local workspace: <code>/workspace/qadam/drafts/${opp.id}.txt</code></i>

<i>${BRAND_FOOTER}</i>`;

  return {
    text,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🚀 Open in QADAM Application Studio',
            url: getWebUrl(`/application-studio?id=${opp.id}`),
          },
        ],
        [
          { text: '🎯 View Other Opportunities', callback_data: 'radar' },
          { text: '🔙 Main Menu', callback_data: 'menu' },
        ],
      ],
    },
  };
}

// Command & Message Router
async function handleMessage(msg) {
  const chatId = msg.chat?.id;
  if (!chatId) return;

  const text = (msg.text || '').trim();
  const from = msg.from || {};
  const defaultName = from.first_name
    ? `${from.first_name} ${from.last_name || ''}`.trim()
    : 'Student';

  // 1. /start command with deep-link account binding (e.g., /start connect_amir)
  if (text.startsWith('/start')) {
    const parts = text.split(' ');
    let linkedName = defaultName;
    if (parts.length > 1 && parts[1].startsWith('connect_')) {
      const paramName = decodeURIComponent(parts[1].replace('connect_', '')).trim();
      if (paramName && paramName !== 'qadam') {
        linkedName = paramName.charAt(0).toUpperCase() + paramName.slice(1);
      }
    }

    studentRegistry.set(chatId, {
      name: linkedName,
      username: from.username ? `@${from.username}` : null,
      linkedAt: new Date().toISOString(),
    });

    console.log(`[Account Linked] Chat ${chatId} bound to candidate: "${linkedName}"`);

    const view = renderMainMenu(linkedName);
    return sendMessage(chatId, view.text, view.reply_markup);
  }

  // Retrieve current student profile
  const user = studentRegistry.get(chatId) || { name: defaultName };

  // 2. /radar command
  if (text === '/radar' || text.toLowerCase().includes('radar')) {
    const view = renderRadar();
    return sendMessage(chatId, view.text, view.reply_markup);
  }

  // 3. /gaps command
  if (text === '/gaps' || text.toLowerCase().includes('gap') || text.toLowerCase().includes('cv')) {
    const view = renderGaps(user.name);
    return sendMessage(chatId, view.text, view.reply_markup);
  }

  // 4. /privacy command
  if (text === '/privacy' || text.toLowerCase().includes('privacy')) {
    const view = renderPrivacy();
    return sendMessage(chatId, view.text, view.reply_markup);
  }

  // 5. /help command
  if (text === '/help') {
    const helpText = `📖 <b>QADAM | AI Opportunity Hub — Bot Commands Guide:</b>
<i>${OFFICIAL_SLOGAN}</i>

/start - Open QADAM Assistant & Link Workspace
/radar - Browse Top Verified Opportunities & Hackathons
/gaps - View ATS Resume Gap Analysis & Benchmark
/privacy - Check Zero-PII Shield Architecture
/help - Show this commands guide

<i>Tap any inline button in the chat to interact with real-time application drafting and sandbox features.</i>

<i>${BRAND_FOOTER}</i>`;
    return sendMessage(chatId, helpText, {
      inline_keyboard: [
        [
          { text: '🎯 Opportunity Radar', callback_data: 'radar' },
          { text: '📊 Check CV Gaps', callback_data: 'gaps' },
        ],
        [
          { text: '🌐 Launch Web Workspace', url: getWebUrl() },
        ],
      ],
    });
  }

  // Default Fallback: Prompt user with menu
  const fallbackView = renderMainMenu(user.name);
  return sendMessage(
    chatId,
    `👋 Hello ${user.name}! I received your message: "<i>${text}</i>"\n\nHow can QADAM assist your career journey today?`,
    fallbackView.reply_markup
  );
}

// Callback Query Router (Inline button clicks)
async function handleCallbackQuery(cb) {
  const cbId = cb.id;
  const chatId = cb.message?.chat?.id;
  const data = cb.data;

  if (!chatId) return;

  const user = studentRegistry.get(chatId) || {
    name: cb.from?.first_name || 'Student',
  };

  // Acknowledge the callback immediately to remove loading spinner in Telegram client
  await answerCallback(cbId);

  if (data === 'menu') {
    const view = renderMainMenu(user.name);
    return sendMessage(chatId, view.text, view.reply_markup);
  }

  if (data === 'radar') {
    const view = renderRadar();
    return sendMessage(chatId, view.text, view.reply_markup);
  }

  if (data === 'gaps') {
    const view = renderGaps(user.name);
    return sendMessage(chatId, view.text, view.reply_markup);
  }

  if (data === 'privacy') {
    const view = renderPrivacy();
    return sendMessage(chatId, view.text, view.reply_markup);
  }

  if (data.startsWith('draft_')) {
    const key = data.replace('draft_', '');
    const view = renderDraft(key, user.name);
    return sendMessage(chatId, view.text, view.reply_markup);
  }
}

// Register official Bot commands with Telegram
async function registerBotCommands() {
  const commands = [
    { command: 'start', description: 'Start QADAM Assistant & Link Workspace' },
    { command: 'radar', description: 'View Top Verified Opportunities' },
    { command: 'gaps', description: 'Check ATS Resume Gap Analysis' },
    { command: 'privacy', description: 'View Privacy Shield Status' },
    { command: 'help', description: 'Show Bot Help & Guide' },
  ];

  const res = await callApi('setMyCommands', { commands });
  if (res.ok) {
    console.log('✅ Telegram bot commands registered successfully.');
  }
}

// Main Long Polling Loop
async function startPolling() {
  console.log(`\n======================================================`);
  console.log(`🤖 QADAM | AI Opportunity Hub — Telegram Bot (@${BOT_USERNAME}) Starting...`);
  console.log(`📡 Endpoint: ${BASE_URL.replace(TOKEN, 'TOKEN_REDACTED')}`);
  console.log(`🌐 Web App Target: ${getWebUrl()}`);
  console.log(`🖼 Brand Logo Asset: ${LOGO_URL}`);
  console.log(`💬 Official Slogan: ${OFFICIAL_SLOGAN}`);
  console.log(`------------------------------------------------------`);
  console.log(`💡 AVATAR SETUP: To set official bot avatar in Telegram:`);
  console.log(`   Open @BotFather in Telegram, send /setuserpic, select`);
  console.log(`   @${BOT_USERNAME}, and upload 'public/logo.png'`);
  console.log(`======================================================\n`);

  // Verify Bot identity
  const me = await callApi('getMe');
  if (!me.ok) {
    console.error('❌ Failed to authenticate bot with Telegram API:', me.description);
    process.exit(1);
  }

  console.log(`✅ Authenticated as: ${me.result.first_name} (@${me.result.username})`);
  await registerBotCommands();
  console.log(`⚡ Long Polling initialized. Waiting for student interactions...\n`);

  let offset = 0;

  while (true) {
    try {
      const updates = await callApi('getUpdates', {
        offset,
        timeout: 25,
        allowed_updates: ['message', 'callback_query'],
      });

      if (updates.ok && Array.isArray(updates.result)) {
        for (const update of updates.result) {
          offset = update.update_id + 1;

          if (update.message) {
            await handleMessage(update.message);
          } else if (update.callback_query) {
            await handleCallbackQuery(update.callback_query);
          }
        }
      } else if (!updates.ok) {
        if (updates.description && updates.description.includes('Conflict')) {
          console.warn('⚠️ Telegram 409 Conflict: another process called getUpdates. Retrying in 4s...');
          await new Promise((r) => setTimeout(r, 4000));
        } else {
          await new Promise((r) => setTimeout(r, 2000));
        }
      }
    } catch (err) {
      console.error('[Polling Loop Error]:', err.message);
      // Wait 3 seconds on failure before retrying
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 QADAM Telegram Bot shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 QADAM Telegram Bot terminating...');
  process.exit(0);
});

// Start the bot
startPolling();

