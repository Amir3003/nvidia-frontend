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