# Competitor teardown: hackathon.kz, and what QADAM Hub builds in response

Written 31 October 2026. Scope update the same day: the owner cut KakaoTalk, school ranking, employer cases, one-click apply and the personal roadmap, and rated the verified portfolio as undecided (50-50); see `docs/PRODUCT_SCOPE.md`. Read section 2 as a plan we may or may not build. Everything in section 1 comes from the public pages and the public client script of `https://hackathon.kz` read on that day. Where I could not see a thing, it says so. Section 2 onward is our plan; nothing in it is built yet unless it says "exists".

## 1. What hackathon.kz actually is

| Area | What I saw |
|---|---|
| Stack | Static HTML pages (`events.html`, `internships.html`, `startups.html`, `people.html`, `submit.html`, `github.html`, `about.html`), one 195 KB script (`common.js`), their own API at `api.hackathon.kz`, behind Cloudflare. Not a single-page app, so every page has text in its HTML. |
| Languages | Russian, Kazakh and English strings in the script. |
| Sections | Events, internships, startups, people (profiles and friends), organizers (free event submission, "0 KZT to list"), a GitHub guide for hackathon teams, About. No scholarship or grant section in the navigation. |
| Event card and page | Dates, registration deadline with a day counter, format, prize fund, organizer, "who can take part", place, "similar events". The apply button leads to the organizer's site ("the application is submitted on the organizer's site"), so it is a link, not a one-click application. States: last day, registration closed, event finished, no deadline given. |
| Map | OpenStreetMap map of Kazakhstan cities with dots for cities that have open events. Filters by theme, city, format (online), "for students", "first hackathon", archive. |
| Telegram | A channel with announcements the day registration opens, and a bot that confirms the phone number for registration. Sign-in uses a one-time code (`request-code`, `verify-code`). |
| Portfolio | Three tabs: certificates, GitHub projects, hackathons. See 1.1. |

### 1.1 Their portfolio, exactly

- **Certificates:** the user pastes the link to the official verification page of the issuer. A certificate is marked verified "when the platform confirms the certificate and the recipient name matches your profile name", otherwise it goes to a human moderator. Providers named in the script: Coursera, Credly (covers Google, AWS, IBM, Cisco badges), Microsoft Learn, Stepik, freeCodeCamp, HackerRank. They state that Udemy, DataCamp, Kaggle and LinkedIn Learning are not accepted because they cannot be verified automatically.
- **Hackathon results:** the user marks "I am going", and after the event can attach a certificate or diploma for a win or finalist place. A moderator approves it before it shows on the public profile.
- **GitHub projects:** the user enters a GitHub username in the profile and public repositories are listed. I did not see an OAuth step in the script, so ownership looks like it is claimed by typing a name, not proven. Treat that as likely, not confirmed.

### 1.2 Where they are weak (our openings)

1. **Local by design.** The map, the city filters and the copy are built around Kazakhstan.
2. **Events only.** No scholarships or grants in the navigation, nothing like MEXT, fellowships or research programs.
3. **Verification stops at a link plus a name match.** Everything else is a human moderator, which does not scale. Six providers.
4. **No skill evidence.** Nothing that tests what a person can do, and nothing that shows what is missing for a given opportunity.
5. **GitHub by username** (see above).

What they do well and we should respect: free listing for organizers (supply), a day counter on every card, Telegram as the main channel, three languages, and a portfolio that already exists and works.

## 2. What to take and how to beat it: the Verified Portfolio (undecided)

"10x faster" is not a number we can promise. Define targets we can measure instead:

- A supported certificate link shows a result card in under 3 seconds at the median and under 10 seconds at the 95th percentile.
- 15 or more providers at launch, against their 6 (candidates: Coursera, Credly, Microsoft Learn, Stepik, freeCodeCamp, HackerRank as they have, plus edX, Google Cloud Skills Boost, NVIDIA Deep Learning Institute badges where they are issued through Credly, GitHub). I have not tested any provider's verification page or endpoint; each adapter starts with a check of the real page and its terms.
- GitHub ownership proven by OAuth, not by typing a username.
- A trust level on every item, so a school can see how strong the evidence is.

### 2.1 Trust levels

| Level | Meaning | How it is reached |
|---|---|---|
| 0 Claimed | Typed in by the user | Nothing checked |
| 1 Link checked | Official verification page loaded, issuer and title parsed | Automatic |
| 2 Name matched | Recipient name on the page matches the profile name | Automatic, fuzzy match across scripts and transliteration |
| 3 Account proven | The user proved they own the account | GitHub OAuth for repositories and contributions |
| 4 Curator verified | A teacher or program lead of a school confirmed it | The existing `/staff` workspace; this is the part competitors cannot copy without institutions |
| 5 Cryptographic | A signed credential (Open Badges 3.0 or a verifiable credential) | Only where the issuer supports it |

Show the level as a small badge next to each item and let the owner filter a public profile by minimum level.

### 2.2 The prerequisite nobody should skip: server accounts

Today the student profile lives only in the browser (`qadam_user` in localStorage). A portfolio that employers or schools can trust must live on the server and survive a lost phone. So the first step is an optional "save my profile" upgrade: email code sign-in (Supabase Auth already exists for the Network) that claims the local profile. Without this, nothing below can be verified or shared.

### 2.3 Data model (sketch for a new migration)

```sql
create table public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('certificate','repository','hackathon','academic','activity')),
  provider text,                      -- 'coursera', 'credly', 'github', ...
  title text not null,
  issuer text,
  issued_on date,
  evidence_url text,                  -- the official verification page
  evidence_hash text,                 -- hash of the parsed fields at check time
  trust_level smallint not null default 0 check (trust_level between 0 and 5),
  checked_at timestamptz,
  verified_by uuid references auth.users(id),  -- curator, for level 4
  created_at timestamptz not null default now(),
  unique (provider, evidence_url)     -- one piece of evidence belongs to one person
);
```

Row level security: the owner reads and edits their own rows, curators read rows of learners in their cohort (same pattern as `learner_progress`), a profile is public only when the owner switches it on.

### 2.4 Verification service

`POST /api/portfolio/verify` with `{ url }`:

1. Detect the provider from the hostname. Allowlist of hosts only, which also blocks server-side request forgery. Reject everything else with a clear message.
2. Fetch the page with a short timeout, a size cap, no JavaScript execution and an honest user agent. Use only pages that issuers publish for third-party checking, one request per user action, cached, with a per-user rate limit. No bulk crawling.
3. A provider adapter turns the page into `{ issuer, title, recipientName, issuedOn, valid }`. Prefer structured data (Open Badges JSON, schema.org markup) over scraping text.
4. Compare `recipientName` with the profile name: lowercase, strip accents, transliterate Cyrillic and Kazakh letters to Latin, compare as sets of tokens so the order and a middle name do not matter, accept above a threshold. A weak match goes to the review queue instead of failing.
5. Save the item with its trust level and a hash of the parsed fields. Re-check weekly in the background; if the page disappears or changes, lower the level and tell the owner.
6. Duplicate evidence (same URL on two accounts) is blocked and flagged.

Legal: read each provider's terms before writing its adapter, say in the Privacy page what we fetch and store (title, issuer, date, hash, not the full page), and let people delete items.

### 2.5 Build order and rough size

These are estimates, not commitments.

1. Server accounts and the `portfolio_items` table (2 to 3 days).
2. Link paste with Credly and Coursera adapters, name match, result card (3 to 4 days).
3. GitHub OAuth, repository and contribution summary (2 days).
4. Curator verification in `/staff` (2 days, reuses cohort tables).
5. More adapters, weekly re-check, public profile page (ongoing).

## 3. Event card: deadline, prize and one action above the fold

### 3.1 What exists

`src/pages/RadarPage.tsx` shows a light glass card with the organizer and type, a "Due" date badge, title, match bar, a short description, skill chips and three buttons (Prepare and Apply, Analyze CV Gaps, View Details). Missing: a day countdown, the prize or award (the field `award` exists on the type but the feed never fills it, because the extraction in `backend/server.mjs` does not ask for it), and a single clear primary action.

### 3.2 Target card

```
+-----------------------------------------------------------+
| HACKATHON   NVIDIA                         12 days left   |
|                                                           |
| Global AI Hackathon                                       |
| Remote  ·  Open worldwide                                 |
|                                                           |
| $60,000 prize pool    Python  PyTorch  +2      Match 82%  |
|                                                           |
| [ Apply on official site ->]        Prepare    Details    |
+-----------------------------------------------------------+
```

Everything in the box is inside the first 360 px of the card on a phone.

| Element | Rule |
|---|---|
| Deadline pill | Text always ("12 days left", "Last day", "Closed"), never color alone. 15 or more days: neutral. 4 to 14: amber. 3 or fewer: rose. Use `<time datetime>`. Deadlines are dates without a time zone, so show the date too and treat "last day" as the whole day. |
| Prize or funding | One pill with the amount and currency, quoted from the source. Hidden when the source gives none; never guess. |
| Primary action | "Apply on official site", opens the organizer page in a new tab. This is honest: we cannot submit an application for the user. One-click apply is out of scope: applications are submitted on the organizer's site. Secondary: Prepare (the checklist) and Details. |
| Where | "Remote", "Onsite", or "Hybrid", plus the place or "Open worldwide". |
| Skills | Up to three chips and a "+N". |

Visual tokens (the dark system already used by the Feedback dialog): surface `#0E1320`, 1 px border `rgba(255,255,255,0.10)`, hover border `0.20` with a 2 px lift (transform only), text slate-100 and slate-400, numbers and dates in the mono font, 16 px radius, 4 px spacing grid, one gradient only (the emerald to teal primary button), no glows, no decorative imagery. Skeleton cards while loading.

Decision for the owner: this changes the Radar cards from the current light glass look to dark surfaces. The landing pages keep their own look either way.

### 3.3 Data the card needs

Add to the radar extraction (`backend/server.mjs`, validated in `backend/radar-quality.mjs`): `award` and `awardCurrency` with an exact source quote like the deadline has, `format` (remote, onsite, hybrid), and normalized `countries`. Rule stays the same as today: no quote, no field.

## 4. Global filters instead of a map

A map suits a small country; a global product needs filters people can combine and share.

| Filter | Values |
|---|---|
| Type | Hackathon, Scholarship or grant, Internship, Fellowship or accelerator |
| Where | Remote or worldwide, then regions (US and Canada, Europe, UK, Japan, Korea, China, Southeast Asia, India, Middle East, Africa, Latin America, Central Asia) and a country search |
| Programs | MEXT, Google Summer of Code, MLH, university research programs, accelerators (YC and others), plus a free text search |
| Deadline | Closing in 7 days, 30 days, any |
| Funding | Funded, stipend, tuition covered |
| Eligibility | High school, undergraduate, graduate, any |
| Open from my country | Exists already (`availableIn` in `src/db/location.ts`) |

Design: type chips on top, one "Where" control with presets, a "More filters" panel, a saved view and the whole state in the URL so a filtered list can be shared. Program tags come from deterministic rules on the organizer domain and title, not from the model.

Before any of this matters there is a supply problem: the live feed has 5 listings and the pipeline publishes at most 30 (`MAX_PUBLISHED` in `backend/merge.mjs`). Filters on 5 items look empty. Grow the sources first: more search queries, plus direct reads of official feeds and calendars (MLH season pages, GSoC timeline, embassy pages for MEXT). Every new source keeps the same rule: a deadline quoted from the organizer page.

## 5. Recommended order

1. Feed supply and the `award` and `format` fields (without data the rest is empty).
2. New event card.
3. Global filters with URL state.
4. Server accounts, then link-based certificate verification, then GitHub OAuth.
5. Curator verification through schools: the part with a real moat.

## 6. Where "Kazakhstan" is still hard-coded (for the international pass)

Not changed in this document. For the next step: `src/pages/WelcomePage.tsx` and `scripts/prerender.mjs` (schools landing copy), `index.html` and `src/lib/seo.ts` (default title and description), the city list `VALID_CITIES` in `src/components/OnboardingWizard.tsx`, the city suggestions in `src/components/PilotRequestModal.tsx`, sample cards in `src/data.ts` and `src/db/opportunities.ts` ("Astana / Hybrid"), and the Privacy and Terms pages. `docs/B2B_PLAN.md` and `docs/STRATEGY.md` (still on the branch of PR #28, not on `main`) describe the Kazakhstan-first plan and the investor requirements from the local meetings; decide whether those stay as history or are rewritten.
