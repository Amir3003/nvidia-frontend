# QADAM Hub: IP register

What the product is built from, who owns each part and under which terms. Keep it current: a buyer or investor will ask for exactly this during due diligence. Last reviewed: 26 October 2026. This is an inventory, not legal advice.

## 1. Own code and content

| Asset | Where | Authors | Status |
|---|---|---|---|
| Web app (React, TypeScript) | `src/`, `index.html`, `public/` | Amir Nagiyev, Aiym Agatayeva, with AI coding assistants | Copyright notice names four founders personally (see section 6) |
| Serverless functions | `api/` | same | same |
| Telegram and Discord bots | `bot/` | same; deployed on an Oracle VM by a team member | same |
| Radar pipeline | `backend/`, `.github/workflows/publish-radar.yml` | same | same |
| Database schema and policies | `supabase/migrations/` | same | same |
| Skill quizzes (236 topics) | `src/db/quizBase.json`, `src/db/quizzes/` | written with AI assistants, reviewed by the team | same |
| Brand: name "QADAM Hub", Q logo | `public/brand/qadam-mark*.svg` and generated PNGs | team, AI-assisted | Trademark not registered yet |
| Marketing sources | `marketing/` | team, AI-assisted | same as code |
| Project skills | `.claude/skills/claude-mem`, `superpowers`, `frontend-design`, `handoff` | written for this repo | Original content (names borrowed from public projects, text is ours) |

AI assistance: a large share of commits were produced with Claude (Anthropic) and Codex (OpenAI). Both providers' terms assign the output to the user. Whether purely AI-generated code is protected by copyright is unsettled in many countries, so the defensible value sits in the product, the data pipeline, customer contracts and the brand, not only in the code. Commits keep a `Co-Authored-By` line naming the assistant.

## 2. Third-party models and APIs

| Service | Used for | Terms to keep on file | Notes |
|---|---|---|---|
| NVIDIA Nemotron via Nebius (`NEBIUS_MODEL`, default `nvidia/Nemotron-3_5-Lightning`) | extracting listings from public pages in the radar scan | NVIDIA Nemotron Open Model License; Nebius terms | Commercial use allowed; NVIDIA claims no ownership of outputs. No user data is sent |
| Tavily | web search and page extraction for the radar | Tavily terms of service | Check limits on storing results |
| Supabase | database, email sign-in | Supabase terms, DPA | User data |
| Vercel | hosting, functions, optional analytics | Vercel terms, DPA | User data |
| Sentry | crash reports | Sentry terms, DPA | No PII by configuration |
| Google | Gmail SMTP for sign-in codes, Google Fonts | Google terms | |
| Oracle Cloud | bot server | Oracle terms | |
| Telegram, Discord, Kakao | bot messaging | platform developer terms | |

We train no model of our own and hold no training dataset.

## 3. Data

| Data | Source | Rights position |
|---|---|---|
| Opportunity listings (`public/data/opportunities.json`) | public organizer pages found by the radar scan | We publish facts (title, organizer, deadline), a short summary in our words, a short deadline quote and a link. Facts are not protected by copyright; keep quotes short and respect site terms |
| User data | users and institutions | Covered by the Privacy Policy (`/privacy`) |

## 4. Open source dependencies

Runtime packages (`react`, `react-dom`, `react-router-dom`, `@supabase/supabase-js`, `@sentry/react`) are MIT. The full installed tree is MIT, Apache-2.0, ISC and BSD, with a few MPL-2.0 and one CC-BY-4.0 package in build tooling. No GPL or AGPL. Recheck with a license scanner before any deal.

Fonts: Geist, JetBrains Mono, Manrope, all SIL Open Font License.

Vendored assistant skills in `.claude/skills/` (development tooling, not shipped to users): Strix skills (Apache-2.0), ECC skills (MIT), Genjutsu skills including `bunshin` and `paint` (MIT, Adrien Thevon) and other MIT packs; each folder carries its license file.

## 5. Media

| Asset | Source | Status |
|---|---|---|
| Video voiceover | Piper TTS, voice `en_US-ljspeech-medium` (LJ Speech dataset, public domain) | Commercial use allowed; confirm the voice model card before each release |
| Earlier voice `en_US-hfc_female-medium` | Hi-Fi-CAPTAIN dataset, CC BY-NC-SA 4.0 | Non-commercial only: do not publish videos voiced with it; replace any already posted |
| Screenshots in decks | our own product with test data | Ours |

## 6. Open items before fundraising or a sale

1. Choose the code license. The repository is MIT and was public, so anyone may reuse versions published so far. Decide whether future code stays open.
2. Make the repository private if the code should stay confidential (see `ORACLE_BOTS_SETUP.md` for what the bot server needs afterwards).
3. Once a company exists, every person who wrote code, content or design (the four founders and any contributor, including the team member who runs the bot server) signs an IP assignment to the company. Template: `docs/IP_ASSIGNMENT_TEMPLATE.md`, to be checked by a lawyer.
4. File a trademark application for "QADAM Hub" and the logo in Kazakhstan (and other target markets).
5. Rename the repository and the Vercel project so they no longer carry the third-party name "nvidia", and redirect the old `nvidia-pathfinder.vercel.app` address to `www.qadamhub.com`.
6. Save dated copies of the terms listed in section 2.
7. Confirm with a lawyer how Kazakhstan's personal data localization rules apply to Supabase and Vercel hosting.
