# Product scope, decided 31 October 2026

QADAM Hub is an international product: free for students worldwide, a paid plan for schools and universities later. English first. The records below keep the team from rebuilding things the owner already cut.

## Cut (do not build, do not promise)

- **KakaoTalk bot.** The channel was never created and is removed from the code, the Notifications page, the docs and the env example. Delete `KAKAO_REST_API_KEY` in Vercel if it is still there.
- **School ranking.** A national or public ranking of schools does not belong to this product.
- **Employer cases.** Companies publishing R&D cases and hiring through portfolios does not belong to this product.
- **One-click apply.** Applications are submitted on the organizer's own site, so we cannot do it. The card links to the official page and the Prepare checklist helps before that.
- **Personal roadmap.** Not built and not planned.

## Undecided (50-50)

- **Verified student profile and portfolio** (certificate and GitHub checks). Possible, not committed. Do not show it as "coming soon" on the public pages. The design notes are in `docs/COMPETITOR_HACKATHON_KZ.md`, section 2. It needs server accounts first.

## Optional, later, never up front

- **Essay helper.** A student presses a button inside Application Prep, enters the topic, and gets a draft that uses their own skills and goals from the profile. Rules: it is never on the landing pages or in the first steps; it starts only when the student asks; the result is labelled a draft to rewrite in their own words; some programs forbid AI-written essays, so the screen says to check the program rules; it needs a server endpoint with a rate limit and a per-user cost cap, and its provider goes into `docs/IP_REGISTER.md` and the Privacy page before it ships.

## Live today

Radar with deadlines quoted from the organizer page, 236 skill quizzes, the CV gap check, application prep checklists, Telegram and Discord alerts, the teammates network, the Feedback and rating button, a free student profile with no invite, and the schools workspace (cohorts, invite links, roster, CSV).
