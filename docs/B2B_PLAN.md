# QADAM Hub: B2B rebuild plan

Source of truth for the B2B direction: the deck "QADAM Hub, 149 USD, Team, Updated" (October 2026).
QADAM Hub sells an institutional subscription to technology training centers in Kazakhstan.
The institution pays, the cohort gets access, staff see progress.

## 1. Positioning

| Item | Decision |
|---|---|
| Buyer | Director or program lead of a coding school, AI training center or career bootcamp (Tech Orda schools first, about 75 to 80 accredited) |
| Users | Learners in the cohort, and career or program staff |
| Promise | Learners find internships, hackathons and grants that fit their skills. Staff see who is applying without chasing links in chats |
| Offer | Free pilot, 4 to 6 weeks, one cohort of 30 to 50 learners, one staff lead. Then 149 USD per month per institution, up to 100 active learners |
| Tone | Calm, specific, honest about what is live and what is planned. No hype words, no unverifiable claims |
| Not on the site | Financial model, break-even, payback (deck slides 6 to 9). These are for investors and juries |
| Third-party brands | No QAIRU logo without written permission. A plain text mention of the team's university is fine |

## 2. Visual system for the public site

The app inside keeps its current dark style for now. The public site moves to the light brand palette from `CLAUDE.md`.

| Token | Value | Use |
|---|---|---|
| Ground | ivory `#F7F4EE` | page background |
| Surface | white `#FFFFFF` | cards, form, product previews |
| Surface alt | `#FBFAF7` | alternating sections |
| Ink | navy `#1B2440` | headings, primary buttons, dark CTA band |
| Body text | `#4A5468` | paragraphs |
| Muted | `#6B7385` | captions, table headers |
| Line | `#E4DED2` | borders, dividers |
| Gold | `#C9A25E` | small accents only (rules, dots, numbers) |
| Gold text | `#8A6A2F` | eyebrow labels (passes contrast on ivory) |
| Live green | `#0F766E` on `#E6F2EF` | "Available now" chips |
| Planned amber | `#8A5A12` on `#FBF1DE` | "Coming in pilot" chips |

- Type: Geist for everything, JetBrains Mono only for eyebrows and numbers. H1 36 px mobile, 56 to 64 px desktop, tight tracking. Body 16 to 18 px, line height 1.6.
- Layout: max width 1152 px, side gutter 16 px mobile and 24 px desktop, sections 80 to 112 px apart.
- Corners: 16 px cards, 10 px buttons, full pill for chips.
- Shadows: one soft shadow for product previews only. Flat borders everywhere else.
- Motion: none beyond hover color changes and the FAQ open state. Respect reduced motion.
- No glows, no gradients on text, no emojis, no em dashes.

## 3. Public site map

| Path | Content |
|---|---|
| `/welcome` (and every logged-out path) | B2B landing (section 4) |
| `/welcome?pilot=1` | Landing with the pilot request form open (for links in emails and decks) |
| `/privacy` | Privacy page, updated with the pilot form and, later, staff visibility |
| Student login button | Opens the existing sign-in wizard for learners in a pilot cohort |

## 4. Landing page, section by section

1. **Header (sticky, white with bottom border).** Logo mark and "QADAM Hub". Anchor links: How it works, Workspace, Pilot, Team, FAQ. Right side: "Student login" (text button) and "Request a pilot" (navy button). Mobile: logo, "Request a pilot", menu button that opens a panel with the links.
2. **Hero.** Eyebrow "For training centers in Kazakhstan". H1 "Opportunity and career support for your cohort". Subline about learners finding fitting opportunities and staff seeing who applies. Buttons: "Request a pilot", "See how it works". Facts row: 4 to 6 week pilot, 30 to 50 learners, no cost during the pilot. Right column: cohort overview preview with sample data (stats and four learners with status chips), labelled "Sample data".
3. **Problem.** Title "The gap after the classroom". Two cards: For learners (opportunities sit across websites and chats, they check requirements and deadlines alone) and For staff (links shared by hand, no view of who applies). Closing line: the question the pilot answers, how much staff time this costs per cohort.
4. **How it works.** Four numbered steps with a status chip each: 01 Profile (available now), 02 Discover (available now), 03 Prepare (early version), 04 Track (coming in pilot).
5. **Staff workspace.** Title "One view of your cohort". Larger preview of the cohort table (learner, track, profile, saved, applied, next deadline) with sample data. Feature list beside it: invite with one link, profile completion, saved and submitted applications, monthly summary (coming in pilot).
6. **Listing quality.** Three facts that are true today: every listing links to its source, deadlines are confirmed by a quote on the source page and expired ones are removed, alerts go to Telegram and Discord.
7. **Who it is for.** Three cards: coding schools, AI training centers, career bootcamps. Row underneath: who buys (directors, program leads), who tracks (career staff), who uses (learners).
8. **Pilot and pricing.** Two cards. Pilot: free, 4 to 6 weeks, one cohort, one staff lead, weekly check-in, end-of-pilot summary. Subscription: 149 USD per month, up to 100 active learners, staff accounts, cohort tools, recommendations, basic reporting. Note that pricing is proposed and confirmed with pilot partners.
9. **Where we are.** Live today: opportunity discovery, structured listings, Telegram and Discord bots. Next: institution accounts and permissions, cohort management and reporting, CV matching and application support. One line: no signed institutional partners yet, the pilot is how we earn them.
10. **Compared with chats and spreadsheets.** Four rows: finding opportunities, checking deadlines, knowing who applied, end-of-cohort reporting.
11. **Team.** Four people with initials, name and role. Line about the team's university.
12. **FAQ.** Who pays, what learners need, where listings come from, what staff can see, setup time, what happens after the pilot, languages and regions.
13. **Final call to action.** Navy band: "Run a pilot with one cohort", button "Request a pilot", email link.
14. **Footer.** Logo, privacy, student login, contact email, copyright.

## 5. Pilot request form

- Modal over the landing, `z-50`, bounded height with scroll, closes on backdrop click and Escape, focus moves to the first field.
- Fields: institution (required), your name (required), role (director, program lead, career staff, other), work email (required, validated), phone or Telegram (optional), city (Almaty, Astana, Shymkent, other), learners per cohort (under 30, 30 to 50, 50 to 100, over 100), message (optional, 1000 characters).
- Hidden honeypot field to stop simple bots.
- Submit stores the request in Supabase table `pilot_requests` (insert-only for the public, read only from the Supabase dashboard). Migration: `supabase/migrations/202610230001_pilot_requests.sql`.
- If Supabase is not configured or the insert fails, the form opens a prepared email instead, so no request is lost.
- Success state: thank-you message, what happens next, close button.

## 6. Phase plan

### Phase 1: public B2B site (this PR)
- New landing replaces the student landing on `/welcome`.
- Pilot request form with Supabase storage and email fallback.
- Meta tags, Open Graph and structured data rewritten for QADAM Hub and institutions.
- Privacy page lists the pilot form.
- Verification: `npm run build`, `npm run check:quizzes`, Semgrep, screenshots at 390 px and 1440 px.

### Phase 2: pilot workspace (next)
Data model in Supabase, all with row level security:

| Table | Columns | Access |
|---|---|---|
| `institutions` | id, name, city, plan, created_at | members read, owner updates |
| `institution_members` | institution_id, user_id, role (`owner`, `staff`) | members read own institution |
| `cohorts` | id, institution_id, name, starts_on, ends_on, invite_code | staff of the institution |
| `cohort_learners` | cohort_id, user_id, joined_at | learner reads own row, staff read their cohorts |
| `learner_activity` | user_id, opportunity_id, status (`saved`, `preparing`, `applied`), updated_at | learner writes own, staff read for their cohorts |

Screens:
- `/staff` dashboard: cohort switcher, stats (learners, profiles complete, saved, applied), learner table with filters and CSV export.
- `/staff/cohorts/new`: name, dates, generates an invite link.
- `/join/<invite_code>`: learner signs in with email code (already used by the network), joins the cohort.
- Learner app: opportunity cards get "Save" and "Mark as applied", which write `learner_activity`.
- Navigation renamed to the four steps: Discover (Radar), Prepare (CV Lab and Application Studio), Track (my applications). Memory leaves the learner menu.
- Privacy page: what staff can see (name, profile completion, saved and applied opportunities) and what they cannot (CV text, messages).

### Phase 3: after the pilot
- Staff roles and permissions, more than one cohort per staff member.
- Monthly summary report (PDF), cohort comparison.
- CV matching against listings and application drafts per opportunity.
- Invoicing for institutions (monthly invoice, no card payments on the site).

## 7. Copy rules

- English on the site. Short sentences, concrete nouns, numbers written as digits.
- Every claim must be true today or labelled "coming in pilot" or "early version".
- Never use: revolutionary, seamless, cutting-edge, unlock, empower, zero, real-time, guaranteed.
