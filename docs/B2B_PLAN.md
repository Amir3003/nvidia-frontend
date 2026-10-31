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
- All fields except phone and message are required. Validation (`src/lib/pilotValidation.ts`): real names (letters, no keyboard mashing), proper email, phone with 10 to 15 digits or a Telegram @username, any city in letters, a role and cohort size from the lists, message of at least one short sentence if given. The same rules are enforced in the database by `202610240001_pilot_requests_validation.sql`.
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

### Phase 2: pilot workspace (built, early version)
Migration `supabase/migrations/202610240002_cohorts.sql`, all tables under row level security:

| Table | What it holds | Who can read |
|---|---|---|
| `institutions` | name, city | its staff, learners of its cohorts |
| `institution_members` | staff user, role `owner` or `staff` | staff of that institution |
| `cohorts` | name, dates, `invite_code` (10 characters, closes after `ends_on`) | its staff, its learners |
| `cohort_learners` | who joined which cohort | the learner, staff of the cohort |
| `learner_progress` | name, track, profile completion % | the learner, staff of the learner's cohort |
| `learner_activity` | opportunity id, title, deadline, status `saved` / `preparing` / `applied` | the learner, staff of the learner's cohort |

RPCs: `cohort_invite_info(code)` (public, shows cohort and institution name), `join_cohort(code)` (signed-in learner), `cohort_roster(cohort)` (staff, includes learner email and counts). Admin only, in the SQL editor: `create_institution(name, city, staff_email)` and `add_institution_staff(institution_id, email)`.

Screens:
- `/student`: email code sign-in, then the invite code (prefilled from `/student?code=...`), then the profile wizard. Since 31 October 2026 a free student profile created at `/start` (no invite code) also opens the app; institution data stays protected by the database, not by this gate. Without any profile every app route redirects to the landing.
- `/staff`: email code sign-in, cohort list, new cohort form, invite code and link, stats, roster with filters, CSV export, remove learner.
- Opportunity details: "My status" (saved, preparing, applied) for learners in a cohort.
- `LearnerSync` revokes access if staff removed the learner and keeps the progress summary current.

How to onboard a new institution:
1. The staff member opens `/staff` and signs in once with their email (it says "No institution linked yet").
2. In the Supabase SQL editor run `select create_institution('TUMA', 'Astana', 'staff@example.kz');` (more staff: `select add_institution_staff('<institution id>', 'second@example.kz');`).
3. The staff member reloads `/staff`, creates a cohort and sends the invite link to learners.

Not yet: staff roles beyond owner and staff, renaming the four steps in the learner navigation.

### Phase 3: after the pilot
- Staff roles and permissions, more than one cohort per staff member.
- Monthly summary report (PDF), cohort comparison.
- CV matching against listings and application drafts per opportunity.
- Invoicing for institutions (monthly invoice, no card payments on the site).

## 7. Copy rules

- English on the site. Short sentences, concrete nouns, numbers written as digits.
- Every claim must be true today or labelled "coming in pilot" or "early version".
- Never use: revolutionary, seamless, cutting-edge, unlock, empower, zero, real-time, guaranteed.
