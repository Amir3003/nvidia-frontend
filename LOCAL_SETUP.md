# QADAM on a Windows laptop

Use PowerShell in `C:\Users\Matebook\nvidia-frontend`. Node.js 24 is already installed. A VPS and VS Code are not required for a local run.

1. Ask Amir to **revoke and regenerate** the Telegram bot token and Discord webhook that appeared in the public repository. Deleting them from the current source does not erase Git history. A Discord bot token and an incoming webhook URL serve different purposes; the bot token is needed for `npm run bot:discord`, the webhook URL is optional for broadcasts. The Discord invite and web app URL are public addresses, not API keys.
2. Open the existing local file from PowerShell: `notepad .env`. Keep the working `NEBIUS_API_KEY` and `TAVILY_API_KEY` lines. Add the following names, filling values only for credentials Amir freshly issued:

   ```dotenv
   NEBIUS_MODEL=nvidia/Nemotron-3_5-Lightning
   VITE_QADAM_API_URL=http://127.0.0.1:8787
   TELEGRAM_BOT_TOKEN=PASTE_NEW_TELEGRAM_TOKEN_HERE
   BOT_USERNAME=QadamAgentBot
   DISCORD_BOT_TOKEN=PASTE_NEW_DISCORD_BOT_TOKEN_HERE
   DISCORD_WEBHOOK_URL=PASTE_NEW_DISCORD_WEBHOOK_HERE
   WEB_APP_URL=https://nvidia-pathfinder.vercel.app
   ```

   Omit a line if you do not have its new value. `BOT_USERNAME` has no `@`. Never paste credentials into chat, GitHub, `VITE_` variables, or the browser console. `.env` is ignored by Git.

3. In PowerShell run `npm ci` once if dependencies are not installed. Then run `npm run scan` to perform one Tavily search, extract source pages, and summarize them through Nebius. This is an explicit paid API action. The results are stored locally in `backend/data/opportunities.json`, which is ignored by Git.
4. In one PowerShell window run `npm run api`; in another run `npm run dev` and open the local Vite URL it prints (usually `http://localhost:5173`). The Radar loads only cached sourced results when `VITE_QADAM_API_URL` is set. Its refresh button rereads the cache; it does not spend API credits. Scan again with `npm run scan` when you want fresh results.
5. Optionally, start Telegram with `npm run bot` or Discord with `npm run bot:discord` in separate windows. Run only **one** Telegram poller for a given bot token; coordinate with Amir if he is running the same bot. To allow `!broadcast`, set `DISCORD_BROADCAST_USER_ID` to the operator's Discord user ID. The bots' existing opportunity examples and CV scores are static; they do not read the new radar cache yet. They only run while their process is open.

The browser uses the local read-only API; Nebius and Tavily credentials stay inside the Node process. The hosted Vercel site does not connect to a laptop-bound API. For scheduled public radar updates without a VM, follow [GITHUB_RADAR_SETUP.md](GITHUB_RADAR_SETUP.md).

If `npm run scan` says HTTP 401, check which key was entered under which name in `.env`; do not print the keys. If Nebius responds with a model error, set `NEBIUS_MODEL` to an available model in your account. If `npm run api` shows an occupied port, stop any older instance of the local API first.
