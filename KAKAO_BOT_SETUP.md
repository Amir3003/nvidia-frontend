# KakaoTalk login and QADAM bot

How it works:

- **Login:** the yellow Kakao button on `/welcome` and the KakaoTalk card on `/notifications` start the Kakao OAuth flow. Kakao redirects back to `/welcome`, and `api/kakao/token.js` exchanges the code on the server.
- **Alerts:** the KakaoTalk card asks for the extra `talk_message` consent. The server stores the user's tokens encrypted in Upstash Redis and sends a welcome message. Every day `api/kakao/notify.js` (Vercel cron, 07:00 UTC) sends the radar digest. Messages arrive in the user's own KakaoTalk chat ("나와의 채팅") through the Kakao Talk Message API.
- **Commands:** `api/kakao/skill.js` is the skill server for a Kakao i Open Builder chatbot on the QADAM KakaoTalk Channel. Commands: `레이더` / `radar`, `연결` / `link`, `해지` / `stop`, `도움말` / `help`.

## 1. Kakao Developers (app 1613530)

At [developers.kakao.com](https://developers.kakao.com), open the app:

1. **App Keys:** copy the **REST API key**. The numeric app ID is not used for OAuth.
2. **Platform > Web:** add `https://nvidia-pathfinder.vercel.app`.
3. **Kakao Login:** turn it on and register the redirect URI `https://nvidia-pathfinder.vercel.app/welcome`.
4. **Kakao Login > Security:** optionally enable a client secret and copy it.
5. **Kakao Login > Consent items:** set nickname and profile image to required or optional consent. Set **KakaoTalk message (talk_message)** to optional consent. Email is optional and may need business verification.

## 2. KakaoTalk Channel and chatbot

1. Create a public channel at [center-pf.kakao.com](https://center-pf.kakao.com) and note its id (`_xAbCdE` from `pf.kakao.com/_xAbCdE`).
2. In Kakao Developers, open **Kakao Login > Advanced > KakaoTalk Channel** (or **App > KakaoTalk Channel**) and link the channel to the app. The skill server then receives `appUserId`, which matches the user id from Kakao login, so `연결` and `해지` know who is writing.
3. At [chatbot.kakao.com](https://chatbot.kakao.com), create a bot (Open Builder access may require an application) and connect it to the channel.
4. **Skill > Create:** URL `https://nvidia-pathfinder.vercel.app/api/kakao/skill`. If you set `KAKAO_SKILL_SECRET`, add the header `x-qadam-skill-key` with the same value.
5. In **Scenario > Fallback block**, choose "Use skill data" with that skill. All commands go through it. Deploy the bot.

## 3. Vercel

1. **Storage > Marketplace > Upstash for Redis:** create a free database and connect it to the project. This sets `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
2. **Settings > Environment Variables:** add

   ```dotenv
   VITE_KAKAO_REST_API_KEY=REST_API_KEY
   VITE_KAKAO_REDIRECT_URI=https://nvidia-pathfinder.vercel.app/welcome
   VITE_KAKAO_CHANNEL_ID=_xAbCdE
   KAKAO_REST_API_KEY=REST_API_KEY
   KAKAO_REDIRECT_URI=https://nvidia-pathfinder.vercel.app/welcome
   KAKAO_CLIENT_SECRET=CLIENT_SECRET_IF_ENABLED
   KAKAO_TOKEN_SECRET=LONG_RANDOM_STRING
   KAKAO_SKILL_SECRET=LONG_RANDOM_STRING
   CRON_SECRET=LONG_RANDOM_STRING
   ```

   Generate random strings with `openssl rand -hex 32`. Do not change `KAKAO_TOKEN_SECRET` later, or stored subscriptions become unreadable.
3. Redeploy so the `VITE_` values are built into the site.

## 4. Check

1. Sign in on the site, open **Notifications & Bots**, press **Connect KakaoTalk** on the Kakao card and accept the message permission. A welcome message arrives in KakaoTalk and the card shows CONNECTED.
2. Press **Send Test Opportunity Ping**: the top radar items arrive in KakaoTalk.
3. Write `레이더` to the channel: the bot answers with a list card.
4. Run the digest manually: `curl -H "Authorization: Bearer $CRON_SECRET" "https://nvidia-pathfinder.vercel.app/api/kakao/notify?force=1"`.

Users who revoke the app in Kakao are removed from the list on the next delivery.
