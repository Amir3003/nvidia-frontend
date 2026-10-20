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

## Project State (update this section when it changes)
- Hosting: Vercel project `nvidia` (team `amir3003`), production domain `nvidia-pathfinder.vercel.app`, deploys from `main`. Work on a feature branch, then PR and merge to `main`.
- Shared network (Teammates & Network): Supabase project `eiasrrisqpotiscifjpj`, email OTP with Gmail SMTP. Migrations in `supabase/migrations/` are run by hand in the Supabase SQL editor, in file order. Env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. Tests: `npm run test:network`, `npm run test:network-ui`.
- KakaoTalk: free channel chatbot only (commands, no proactive messages, no Kakao login). Skill server `api/kakao/skill.js`; the site links to the channel through `VITE_KAKAO_CHANNEL_ID`. Blocked on creating the KakaoTalk Channel: Kakao Business cannot verify the owner's +7 number, a teammate with a Korean number may create it. Setup: `KAKAO_BOT_SETUP.md`.
- Brand: logo is a Q whose ring rises into an upward arrow. Vector masters in `public/brand/qadam-mark*.svg`; every PNG in `public/brand` and `public/logo.png` is generated from it. Colors: navy `#1B2440`, ivory `#F7F4EE`, gold `#C9A25E`.
- Telegram and Discord bots run on an Oracle VM (`ORACLE_BOTS_SETUP.md`).
