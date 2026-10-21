# QADAM Project Instructions & Hard Rules

## Tech Stack
- Frontend: React 19, TypeScript, Vite, Tailwind CSS, React Router v7.
- State: React Context + localStorage.

## Strict Engineering Rules (Never Break)
1. **NO README MODIFICATIONS:** Never modify, rewrite, or touch `README.md` under any circumstances unless explicitly requested.
2. **NO AI CLICHÉS / FORMATTING ERRORS:** 
   - Never use em dashes (`—`).
   - Never use emojis (`🚀`, `✨`, etc.) in UI code or documentation.
   - Keep design clean, modern, and professional (no toxic neon glows, no pure black `#000` backgrounds).
3. **BUILD INTEGRITY:** Every code change must compile cleanly. Always verify with `npm run build` (`tsc && vite build`) to ensure 0 TypeScript errors.

## Core UI/UX Requirements
- **Global Page Scrolling:** Ensure natural browser-level scrolling (`html, body, #root { overflow-y: auto; height: auto; }`). Never trap viewports in fixed `h-screen overflow-hidden` containers that break scrolling.
- **Modals & Dropdowns:** Target benchmark selectors and modals must use proper positioning (`z-50`, bounded height with `overflow-y-auto`, and backdrop click-to-close handlers) so they never get obstructed or cut off.
- **Mobile Layout:** Maintain proper bottom padding (`pb-28`) on all main views so content is never obscured by the fixed mobile navigation bar.

## Working With the Owner
- Reply in Russian. Lead with the outcome, keep it short, then list only the steps the owner must do in a browser.
- The owner is a former frontend developer and designer: UI must look polished, not "good enough".
- Before claiming something works, say what was actually verified (build, tests, screenshots) and what was not.
- Every video made for the owner ships with the voiceover mixed into the MP4, never silent. Pipeline: `marketing/tiktok-video` (`video.html` scenes, `render.mjs`, local Piper TTS). In TTS text write QADAM as "Kadam" so it is pronounced right.

## Project State (update this section when it changes)
- Hosting: Vercel project `nvidia` (team `amir3003`), production domain `nvidia-pathfinder.vercel.app`, deploys from `main`. Work on a feature branch, then PR and merge to `main`.
- Shared network (Teammates & Network): Supabase project `eiasrrisqpotiscifjpj`, email OTP with Gmail SMTP. Migrations in `supabase/migrations/` are run by hand in the Supabase SQL editor, in file order. Env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. Tests: `npm run test:network`, `npm run test:network-ui`.
- KakaoTalk: free channel chatbot only (commands, no proactive messages, no Kakao login). Skill server `api/kakao/skill.js`; the site links to the channel through `VITE_KAKAO_CHANNEL_ID`. Blocked on creating the KakaoTalk Channel: Kakao Business cannot verify the owner's +7 number, a teammate with a Korean number may create it. Setup: `KAKAO_BOT_SETUP.md`.
- Brand: logo is a Q whose ring rises into an upward arrow. Vector masters in `public/brand/qadam-mark*.svg`; every PNG in `public/brand` and `public/logo.png` is generated from it. Colors: navy `#1B2440`, ivory `#F7F4EE`, gold `#C9A25E`.
- Telegram and Discord bots run on an Oracle VM (`ORACLE_BOTS_SETUP.md`), managed by a teammate: after bot code changes they must `git pull` and restart both bots.
- Brand name going public: "QADAM Hub" (qadam.com belongs to an unrelated Central Asia media outlet). Domain `qadamhub.com` is free but not bought yet. Socials: Instagram `@joinqadamhub`, TikTok `@qadamhub`. Use the site's light palette and navy logo in marketing, never the media outlet's royal blue.
- Radar feed: daily GitHub Action runs 4 searches, extracts in batches and merges with the previous feed (`backend/merge.mjs`); undated items expire after 21 days. Missing deadlines read "see official page".
- Discord server: channel intros are pinned by `npm run discord:setup` (dry run; `-- --apply` posts or edits). Onboarding Q4 gives roles Builder, Radar Alerts, Hackathon Squad.
- Marketing sources: `marketing/instagram-launch` (carousels, `render.mjs`) and `marketing/tiktok-video` (animated video with Piper voiceover). Rendered PNG/MP4 are gitignored.
- Skill quizzes: 236 topics. The original 11 are in `src/db/quizBase.json`, 225 more in `src/db/quizzes/<group>.json` (20 questions each, lazy-loaded; catalog in `src/db/quizCatalog.data.ts`). Each attempt draws 10 random questions, pass at 7. Answer options must be similar in length so the longest is never a giveaway: run `npm run check:quizzes` after any quiz edit.
