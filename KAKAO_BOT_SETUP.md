# QADAM KakaoTalk bot

How it works:

- **Connect:** the KakaoTalk card on **Notifications & Bots** opens the 1:1 chat with the QADAM KakaoTalk Channel (`https://pf.kakao.com/<channel id>/chat`). No Kakao login is involved.
- **Commands:** the channel chatbot (Kakao i Open Builder) sends every message to `api/kakao/skill.js`: `레이더` / `radar`, `마감` / `deadlines`, `사이트` / `site`, `도움말` / `help`.
- **Free only:** the bot answers messages, which costs nothing. It never messages first: that needs the paid Kakao Event API and a business-verified channel.

## 1. KakaoTalk Channel

1. At [business.kakao.com](https://business.kakao.com), open **내 비즈니스** and press **+ 새 채널 만들기**. Name `QADAM`, search ID `qadam`, category `교육`.
2. Turn on **채널 공개** and **검색 허용**, and note the channel id (`_xAbCdE` from `pf.kakao.com/_xAbCdE`).

## 2. Chatbot

At [chatbot.kakao.com](https://chatbot.kakao.com):

1. **+ 봇 만들기 > 카카오톡 챗봇**, name `QADAM`.
2. **설정 > 카카오톡 채널 연결**: choose the QADAM channel.
3. **스킬 > 생성**: URL `https://nvidia-pathfinder.vercel.app/api/kakao/skill`. If you set `KAKAO_SKILL_SECRET`, add the header `x-qadam-skill-key`.
4. **시나리오 > 폴백 블록**: response type "스킬데이터" with that skill. Every message goes through it.
5. **배포**.

## 3. Vercel

Add `VITE_KAKAO_CHANNEL_ID` (and optionally `KAKAO_SKILL_SECRET`), then redeploy.

## 4. Check

1. **Notifications & Bots > Connect KakaoTalk**: the KakaoTalk chat with QADAM opens.
2. Send `도움말`, `레이더`, `마감`: the bot answers each.
