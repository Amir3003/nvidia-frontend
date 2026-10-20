// One-off server setup: posts (or updates) the pinned intro message in each channel.
// Dry run by default. Usage:
//   node --env-file=.env bot/discord-setup.mjs          # preview what would change
//   node --env-file=.env bot/discord-setup.mjs --apply  # post, edit and pin
// Re-running is safe: an existing bot message with the same title is edited, not duplicated.

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const API = 'https://discord.com/api/v10';
const SITE = 'https://nvidia-pathfinder.vercel.app';
const LOGO_URL = `${SITE}/brand/qadam-avatar.png`;
const FOOTER = { text: 'QADAM (Қадам) · nvidia-pathfinder.vercel.app', icon_url: LOGO_URL };
const EMERALD = 0x10b981;
const INDIGO = 0x4f46e5;
const CYAN = 0x06b6d4;
const APPLY = process.argv.includes('--apply');

// {#name} becomes a clickable channel mention when that channel exists.
const MESSAGES = [
  {
    channel: 'welcome',
    color: EMERALD,
    title: 'Welcome to QADAM',
    description:
      'QADAM («Қадам») means "step" in Kazakh. This is where students find hackathons, grants and internships, build teams, and get honest feedback on what they are building.',
    fields: [
      {
        name: 'Start in three steps',
        value: '1. Read {#rules}.\n2. Say hi in {#introductions}: who you are and what you are working on.\n3. Type `!radar` in {#bot-commands} to see current opportunities.',
      },
      {
        name: 'Where things are',
        value: [
          '{#announcements}: official news and events',
          '{#opportunity-radar}: new opportunities from the QADAM radar',
          '{#find-teammates}: post or join a team',
          '{#hack-hunters}: share opportunities you found',
          '{#ideas-feedback}: get feedback on your project',
          '{#general-chat}: everything else',
        ].join('\n'),
      },
      {
        name: 'Change your interests',
        value: 'Open **Channels & Roles** at the top of the channel list. Your answers there decide which channels and pings you get, and you can change them at any time.',
      },
      {
        name: 'QADAM website',
        value: `Opportunity Radar, CV & Skill Lab, Application Studio and Teammates & Network: ${SITE}`,
      },
    ],
  },
  {
    channel: 'rules',
    color: INDIGO,
    title: 'Server rules',
    description: 'Short version: be kind, stay on topic, protect privacy. Moderators may remove anything that breaks these rules.',
    fields: [
      { name: '1. Respect everyone', value: 'No harassment, hate speech, slurs or personal attacks. Critique ideas, not people.' },
      { name: '2. Right channel, right topic', value: 'Keep each channel to its purpose. Casual talk goes to {#general-chat}.' },
      { name: '3. No spam or unsolicited ads', value: 'No mass mentions, no DM advertising, no invite links to other servers without permission. Project links belong in {#ideas-feedback}.' },
      { name: '4. Share real opportunities only', value: 'Always include the official source link. No paid programs that charge participants, referral farming or "guaranteed admission" offers.' },
      { name: '5. Protect privacy', value: 'Never post phone numbers, ID or passport data, home addresses or private documents, yours or anyone else\'s. QADAM staff will never ask for passwords or login codes.' },
      { name: '6. Academic integrity', value: 'Help each other learn. Do not sell or request finished assignments, exam answers or ghost-written applications.' },
      { name: '7. English in shared channels', value: 'So everyone can follow. Other languages are welcome in {#international-chat}.' },
      { name: '8. Discord rules apply', value: 'Follow the Discord Terms of Service and Community Guidelines.' },
      { name: 'If something is wrong', value: 'Mention @Moderator or message a moderator directly. Breaking the rules leads to a warning, then a timeout, then a ban.' },
    ],
  },
  {
    channel: 'announcements',
    color: EMERALD,
    title: 'About this channel',
    description: 'Official QADAM news: product updates, community events and selected opportunities. Only the team posts here.\n\nRunning your own server? Press **Follow** to get these posts there too.',
  },
  {
    channel: 'opportunity-radar',
    color: CYAN,
    title: 'How the radar works',
    description: 'QADAM scans public sources every day and posts hackathons, grants and internships here. Every post links to the official source.',
    fields: [
      { name: 'About deadlines', value: 'A deadline is shown only when the source states it. If a post says "see official page", check the date there before planning.' },
      { name: 'Before you apply', value: 'Confirm eligibility, location and dates on the official page. The radar helps you find opportunities; the organizer has the final word.' },
      { name: 'Ask the bot', value: 'Type `!radar` in {#bot-commands} for the current list, or `!draft 1` to get an application draft in your DMs.' },
      { name: 'Found something?', value: 'Share it in {#hack-hunters}.' },
    ],
  },
  {
    channel: 'bot-commands',
    color: CYAN,
    title: 'QADAM bot commands',
    description: 'Type a command in this channel. Drafts arrive in your DMs, so allow DMs from server members.',
    fields: [
      { name: '`!radar`', value: 'Current hackathons, grants and internships from the QADAM radar.' },
      { name: '`!draft <number>`', value: 'Application draft for a radar opportunity, sent to your DMs. Example: `!draft 2`.' },
      { name: '`!gaps`', value: 'How CV gap analysis works on the website.' },
      { name: '`!privacy`', value: 'How QADAM handles your data.' },
      { name: '`!help`', value: 'Show this list.' },
    ],
  },
  {
    channel: 'introductions',
    color: EMERALD,
    title: 'Introduce yourself',
    description: [
      'Copy this, fill it in, and post it here. It helps the right people find you.',
      '```',
      'Name:',
      'Studying or working at:',
      'Skills:',
      'Looking for: team / mentor / feedback / opportunities',
      'Links: GitHub, LinkedIn or portfolio',
      '```',
      'Do not post phone numbers or personal documents. Use Discord DMs to connect.',
    ].join('\n'),
  },
  {
    channel: 'find-teammates',
    color: EMERALD,
    title: 'How to find a team',
    description: [
      'One post per search. Edit it when your team is full, so nobody writes to a closed team.',
      '```',
      '[LOOKING FOR A TEAM] or [TEAM LOOKING FOR MEMBERS]',
      'Event or project: name and official link',
      'Deadline:',
      'My skills / roles we need:',
      'Time zone and language:',
      'Contact: reply in a thread or send a DM',
      '```',
      'Reply in a thread under the post to keep the channel readable.',
    ].join('\n'),
  },
  {
    channel: 'hack-hunters',
    color: CYAN,
    title: 'Share an opportunity',
    description: [
      'Found a hackathon, grant, scholarship or internship? Post it in this format:',
      '```',
      'Title:',
      'Official link:',
      'Deadline: exactly as the source states it',
      'Who can apply:',
      '```',
      'Official sources only. No paid programs that charge participants and no referral links.',
    ].join('\n'),
  },
  {
    channel: 'ai-arch',
    color: INDIGO,
    title: 'AI and architecture',
    description: 'Agents, LLMs, RAG, backend and system design, code review.',
    fields: [
      { name: 'Asking for help', value: 'Say what you are building, what you tried, the exact error and your stack. Share code as a code block or a GitHub link, not a screenshot.' },
      { name: 'Never share secrets', value: 'Remove API keys, tokens and passwords from code before posting. If you leak one, revoke it right away.' },
    ],
  },
  {
    channel: 'ideas-feedback',
    color: EMERALD,
    title: 'Get feedback on your project',
    description: [
      'Post your project in this format:',
      '```',
      'What it is: one sentence',
      'Who it is for:',
      'Link or screenshots:',
      'What feedback I want: design / idea / code / pitch',
      '```',
      'When giving feedback: be kind, be specific, and suggest one concrete next step.',
    ].join('\n'),
  },
  {
    channel: 'international-chat',
    color: CYAN,
    title: 'Language exchange',
    description: 'Practice English, Kazakh, Russian, Korean or any other language. Start your message with a tag such as `[EN]` or `[KZ]`. Correct others only when they ask for it.',
  },
];

async function api(path, method = 'GET', body) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: { Authorization: `Bot ${TOKEN}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${method} ${path} returned ${response.status}: ${data.message || 'error'}`);
  return data;
}

// Names with an emoji prefix ("<emoji>・welcome") match plain "welcome".
const normalize = (name) => name.toLowerCase().replace(/^[^a-z0-9]+/, '');

async function findGuildId() {
  if (process.env.DISCORD_GUILD_ID) return process.env.DISCORD_GUILD_ID;
  const guilds = await api('/users/@me/guilds');
  if (guilds.length !== 1) {
    throw new Error(`The bot is in ${guilds.length} servers. Set DISCORD_GUILD_ID in .env to pick one.`);
  }
  return guilds[0].id;
}

function render(text, channels) {
  return text.replace(/\{#([a-z0-9-]+)\}/g, (_, name) => {
    const channel = channels.get(name);
    return channel ? `<#${channel.id}>` : `#${name}`;
  });
}

function buildEmbed(message, channels) {
  return {
    title: message.title,
    description: render(message.description, channels),
    color: message.color,
    thumbnail: { url: LOGO_URL },
    fields: (message.fields || []).map((field) => ({ name: field.name, value: render(field.value, channels), inline: false })),
    footer: FOOTER,
  };
}

async function main() {
  if (!TOKEN) throw new Error('Missing DISCORD_BOT_TOKEN in .env');
  const me = await api('/users/@me');
  const guildId = await findGuildId();
  const all = await api(`/guilds/${guildId}/channels`);
  // 0 = text, 5 = announcement
  const channels = new Map(all.filter((c) => c.type === 0 || c.type === 5).map((c) => [normalize(c.name), c]));
  console.log(`${APPLY ? 'Applying' : 'Dry run'} as ${me.username} in server ${guildId}\n`);

  const missing = [];
  for (const message of MESSAGES) {
    const channel = channels.get(message.channel);
    if (!channel) {
      missing.push(message.channel);
      continue;
    }
    const embed = buildEmbed(message, channels);
    const recent = await api(`/channels/${channel.id}/messages?limit=50`);
    const existing = recent.find((m) => m.author?.id === me.id && m.embeds?.[0]?.title === message.title);
    const action = existing ? 'edit' : 'post';
    console.log(`#${message.channel}: ${action} "${message.title}"`);
    if (!APPLY) continue;

    const payload = { embeds: [embed], allowed_mentions: { parse: [] } };
    const saved = existing
      ? await api(`/channels/${channel.id}/messages/${existing.id}`, 'PATCH', payload)
      : await api(`/channels/${channel.id}/messages`, 'POST', payload);
    if (!saved.pinned) {
      try {
        await api(`/channels/${channel.id}/pins/${saved.id}`, 'PUT');
      } catch (error) {
        console.warn(`  could not pin (give the bot "Pin Messages"): ${error.message}`);
      }
    }
  }

  if (missing.length) console.log(`\nSkipped, channel not found: ${missing.map((n) => `#${n}`).join(', ')}`);
  if (!APPLY) console.log('\nNothing was posted. Run again with --apply to post.');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
