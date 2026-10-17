const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('TELEGRAM_BOT_TOKEN is missing.');
  process.exit(1);
}

const base = `https://api.telegram.org/bot${token}`;
const current = await fetch(`${base}/getWebhookInfo`, { signal: AbortSignal.timeout(10000) }).then(r => r.json());
if (!current.ok) throw new Error('Telegram rejected the bot token.');
if (!current.result?.url) {
  console.log('No Telegram webhook is configured; polling can start.');
} else {
  const response = await fetch(`${base}/deleteWebhook`, {
    method: 'POST',
    signal: AbortSignal.timeout(10000),
  }).then(r => r.json());
  if (!response.ok) throw new Error('Could not remove the Telegram webhook.');
  console.log('Telegram webhook removed; polling can start.');
}
