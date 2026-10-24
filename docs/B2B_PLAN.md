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

The owner rejected a light ivory and navy version. The public site keeps the original QADAM look:

- Live ambient background (`AmbientBackground`) on the dark ground `#0B101E`.
- Light glass cards: `rounded-3xl`, gradient `#EDF7F6` to `#F3F6FF` to `#E8F4F8`, `border-teal-300/40`, text in `indigo-950` and `teal-950`.
- Primary buttons: emerald to teal gradient, labels in JetBrains Mono. Secondary buttons: dark glass with a teal border.
- How it works: the original scroll-locked 3D flip showcase (sticky section, one stage per screen height on desktop, stage pills on mobile).
- Sections below it are "stops": huge uppercase titles that alternate left and right, with text and a glass card on opposite sides, revealed on scroll. Reduced motion shows everything without animation.
- No emojis, no em dashes, no neon glows beyond the existing soft teal text shadow.

## 3. Public site map

| Path | Content |
|---|---|
| `/welcome` (and every logged-out path) | B2B landing (section 4) |
| `/welcome?pilot=1` | Landing with the pilot request form open (for links in emails and decks) |
| `/privacy` | Privacy page, updated with the pilot form and, later, staff visibility |
| Student login button | Opens the existing sign-in wizard for learners in a pilot cohort |

## 4. Landing page, section by section

1. **Header** (fixed, dark glass): QADAM Hub logo, anchor links (How it works, Pilot, Team, FAQ), "Student login", "Request a pilot". Mobile menu panel.
2. **Hero** (full screen, centered): pill "For training centers in Kazakhstan", huge "QADAM Hub", one-line promise, "Request a free pilot" and "See how it works", audience tags.
3. **How it works** (3D showcase): 01 Discover (available now), 02 Prepare (early version), 03 Track (coming in pilot), 04 Alerts (available now). Left card shows the product with sample data, right card explains it.
4. **Stop 1, The gap** (title left): the problem for learners and for staff.
5. **Stop 2, Your cohort** (title right): staff workspace preview, coming in pilot.
6. **Stop 3, Pilot first** (title left): free pilot and the 149 USD subscription.
7. **Stop 4, Honest status** (title right): live today versus coming in pilot, no signed partners yet.
8. **Stop 5, The crew** (title left): the four team members.
9. **FAQ**, **final call to action**, **footer**.

## 5. Pilot request form

- Modal over the landing, `z-50`, bounded height with scroll, closes on backdrop click and Escape, focus moves to the first field.
- Fields: institution (required), your name (required), role (director, program lead, career staff, other), work email (required, validated), phone or Telegram (optional), city (free text with suggestions for Kazakhstan and Central Asia), learners per cohort (under 30, 30 to 50, 50 to 100, over 100), message (optional, 1000 characters).
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
