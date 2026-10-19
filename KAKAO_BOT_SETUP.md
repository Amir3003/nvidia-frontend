# QADAM KakaoTalk bot

How it works:

- **Connect:** the KakaoTalk card on **Notifications & Bots** opens the 1:1 chat with the QADAM KakaoTalk Channel (`https://pf.kakao.com/<channel id>/chat`). No Kakao login is involved.
- **Commands:** the channel chatbot (Kakao i Open Builder) sends every message to `api/kakao/skill.js`: `레이더` / `radar`, `구독` / `subscribe`, `해지` / `stop`, `상태` / `status`, `사이트` / `site`, `도움말` / `help`. Replies are free.
- **Alerts:** `구독` stores the user's `botUserKey` in Upstash Redis. The daily cron `api/kakao/notify.js` (07:00 UTC) sends the radar digest through the Kakao Event API to the `qadam_alert` event block. The Event API is paid per message and needs a business-verified channel with a wallet linked to the bot; until `KAKAO_BOT_ID` is set, the cron skips sending and the bot still answers commands.

## 1. KakaoTalk Channel

1. At [business.kakao.com](https://business.kakao.com), open **내 비즈니스** and press **+ 새 채널 만들기**. Name `QADAM`, search ID `qadam`, category `교육`.
2. Turn on **채널 공개** and **검색 허용**, and note the channel id (`_xAbCdE` from `pf.kakao.com/_xAbCdE`).

## 2. Chatbot

At [chatbot.kakao.com](https://chatbot.kakao.com):

1. **+ 봇 만들기 > 카카오톡 챗봇**, name `QADAM`.
2. **설정 > 카카오톡 채널 연결**: choose the QADAM channel.
3. **스킬 > 생성**: URL `https://nvidia-pathfinder.vercel.app/api/kakao/skill`. If you set `KAKAO_SKILL_SECRET`, add the header `x-qadam-skill-key`.
4. **시나리오 > 폴백 블록**: response type "스킬데이터" with that skill. Every message goes through it.
5. Optional for alerts: create a block, add the event `qadam_alert` to it and answer with the same skill.
6. **배포**.

## 3. Vercel

1. **Storage > Upstash for Redis**: connect it to the project (sets `KV_REST_API_URL`, `KV_REST_API_TOKEN`).
2. Add `VITE_KAKAO_CHANNEL_ID`. For alerts also add `KAKAO_BOT_ID` (Open Builder bot settings) and `KAKAO_REST_API_KEY`. `CRON_SECRET` protects the cron.
3. Redeploy.

## 4. Check

1. **Notifications & Bots > Connect KakaoTalk**: the KakaoTalk chat with QADAM opens.
2. Send `도움말`, `레이더`, `구독`: the bot answers each.
3. With the Event API configured: `curl -H "Authorization: Bearer $CRON_SECRET" "https://nvidia-pathfinder.vercel.app/api/kakao/notify?force=1"`.
