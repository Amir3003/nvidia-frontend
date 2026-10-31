# Launch posts, ready to copy

Link to use everywhere: `https://www.qadamhub.com/students`. Replace `[name]` with your name. No emojis, no long dashes.

## Read this before posting

- **Age and background come from your brief.** The posts say you are 17 and an AI student. Remove or change that if it is not exact. They do not combine the age with the "2022" story from the strategy notes.
- **Only what is live is claimed.** Live: the feed with deadlines quoted from the organizer page, 235 skill quizzes (10 random questions, pass at 7, Verified badge), the CV gap check, application prep checklist, Telegram and Discord alerts, teammates network, the Feedback button, free start with no school or invite, profile kept on the device.
- **Not built, so never stated as done:** certificate and GitHub verification and the portfolio. That idea is undecided (see `docs/PRODUCT_SCOPE.md`), so the posts present it as a question for readers, not a promise. Your brief asked for "verifies your GitHub and certificates" in the r/SideProject post; I turned it into an honest "I'm thinking about it", because a Reddit or Hacker News reader can open the app, find nothing, and the post is dead.
- **The feed is small today** (5 listings when I checked). The posts say it is small and that only confirmed listings are published. That is honest and reads better than hype.
- **Personal lines in the value posts** ("I've lost time on...", "things that helped me", "I've done a lot of reading") are written for you. Keep only the ones that are true for you.
- One place per day. Reread each community's rules the day you post. Never ask for upvotes on Product Hunt, Hacker News or Reddit. Answer every comment within a few hours, and answer bad news calmly.
- Before the first post: the Feedback form must save to the database (check a test report appears in Supabase), and the `/students` page must be indexed or at least open fast on a phone.

---

## Reddit

### r/SideProject

Title:

```
I'm 17 and kept missing hackathon deadlines, so I built a radar for them (free beta, feedback wanted)
```

Body:

```
Hi r/SideProject. I'm a 17 year old AI student. I used to find hackathons and scholarships through links in chats, and I kept missing deadlines because nothing showed me in one place what was still open.

So I built QADAM Hub. What works today:

- a feed of grants, hackathons and internships where every deadline is quoted from the organizer's own page, and expired listings disappear
- 235 skill quizzes (10 random questions, pass at 7) that put a Verified badge on your profile
- a CV gap check: what a listing asks for versus what you have
- deadline alerts in Telegram and Discord
- free, no school or invite needed, and your profile stays on your device

Built with React, TypeScript, Supabase and Vercel.

What it is not yet: the feed is small, because I only publish a listing when I can confirm its deadline on the source. I'm also thinking about a verified portfolio (checking GitHub projects and course certificates). I haven't decided to build it, so it is not in the app.

I'd like blunt feedback: what is confusing, what is missing, would you actually use it? There is a Feedback button inside the app and it goes straight to me.

https://www.qadamhub.com/students
```

First comment to add yourself (a few minutes later):

```
Happy to answer anything about how the deadline check works. A listing is only published if the page itself contains the deadline, and I store the quote. If the page changes or the date passes, it drops out.
```

### r/AlphaandBetausers

Title:

```
[Free beta] Looking for testers: a radar for hackathons, grants and scholarships
```

Body:

```
I'm [name], 17, and I'm looking for people to try QADAM Hub and tell me what breaks.

What it does: lists hackathons, grants and internships where each deadline is quoted from the organizer's own page, tests your skills with quizzes, and shows which skills a listing asks for that you don't have yet.

What I'd like you to try (10 minutes):
1. Open the link, press "Start free" and go through the two steps. Tell me if anything was unclear.
2. Open a listing and press "Analyze CV Gaps". Did the result make sense?
3. Take one skill quiz.
4. Press the Feedback button and send me the first thing that annoyed you. You can also just rate the app with stars.

Known limits: the feed is small and the profile lives on your device (no cross-device sync yet). Everything else, tell me.

I read and answer every report. Free during the beta.

https://www.qadamhub.com/students
```

### r/SaaS

Title:

```
Beta live: free for students, a school plan later. How would you validate the school side?
```

Body:

```
I'm [name], a 17 year old founder. I built QADAM Hub, a tool that shows students the hackathons, grants and scholarships they can still apply to (every deadline quoted from the organizer's page), plus skill quizzes and a CV gap check. It is a free beta for students. There are no paying customers and I don't want to pretend otherwise.

The plan is that schools pay later (I'm thinking around $149 a month per school group) for a dashboard that shows which students are preparing and who applied. That part is early, not sold.

Two questions for people who have sold to schools or education buyers:
1. Would you validate with a free pilot in one school before building more, or build the student side first so the pilot has something to show?
2. What made a school say yes to a pilot, and what made them say no?

If you want to try the student side and break it, the link is below. The Feedback button inside goes straight to me.

https://www.qadamhub.com/students
```

### r/ApplyingToCollege (value first, no link in the post)

Many of these subreddits remove self-promotion. Post the value, keep the product out of it, and mention it only if someone asks.

Title:

```
7 checks I use to tell whether a hackathon or scholarship is real and still open
```

Body:

```
I'm a 17 year old student. Before I spend time on a hackathon or scholarship I run through this checklist, because many listings are expired, unclear or quietly ask for money:

1. Find the organizer's own page, not a blog or an aggregator. Check the domain is theirs.
2. The deadline must be written on that page. If a site says "closes soon" with no date, treat it as unknown.
3. Check the year in the page text and the URL. Old pages often keep a date from a previous round.
4. Look for a contact email on the organizer's domain, not a free mail address.
5. Real scholarships and hackathons do not ask you to pay to be considered. A fee for "processing" or "priority" is a red flag.
6. Search the name with "reviews" or "scam" and check how past editions went: past winners, a previous year's page, press.
7. Note the eligibility line (country, age, level) before you spend time on the application. Many are not open to everyone.

Dates and requirements change by country and round, so always confirm on the official page. What checks do you add?
```

If someone asks what you use, reply:

```
I built a small free tool for this called QADAM Hub, it quotes the deadline from the organizer's page. Happy to share the link if the mods are fine with it.
```

### r/InternationalStudents (value first)

Title:

```
How to find scholarships like MEXT without getting buried in outdated pages
```

Body:

```
Some things that helped me while researching Japanese government scholarships (MEXT) and similar programs:

- The timeline is not the same everywhere. For MEXT, the exact dates and the application track depend on your country, so use the page of the Japanese embassy or consulate for your country as the source.
- Write down three dates per program: when applications open, the document deadline, and the interview or exam dates. They are often on different pages.
- Keep one spreadsheet with the program, the official link, the deadline and what you still need (transcripts, a recommendation, language scores).
- Check the year on every page. Old pages from last year's round are everywhere.
- Ask your school's counselor or past applicants from your country what the real timeline looked like.

I also started building a small tool that lists opportunities with deadlines quoted from the official pages. If it is useful to people here I can share it, I did not want to post a link without asking the mods first.

What programs are you looking at?
```

### r/csMajors (value first)

Title:

```
Where I look for hackathons and student programs, and how I decide which ones are worth the time
```

Body:

```
I'm a 17 year old AI student who has done a lot of reading about this. My current approach:

Where to look
- Season calendars from organizers of student hackathons and the big hackathon platforms
- Open source student programs (they have a published timeline, plan weeks ahead)
- Official pages of university research programs and fellowships
- Company student pages (they sometimes open once a year)

How I decide
- Is the deadline written on the official page, and is it still ahead?
- Does it ask for skills I already have, or ones I can learn before the deadline?
- Is it online, or do I need a visa and travel money?
- Does the prize or benefit match the time it costs?

I wrote a small free tool because I wanted these answers in one place (quoted deadlines, a skill gap check against each listing). I don't want to spam, so I will only drop it if someone asks. What would you add to this list?
```

---

## Product Hunt

- Name: QADAM Hub
- Tagline (60 characters or less): `Hackathons, grants and scholarships with real deadlines`
- 10-word pitch: `Free beta radar: hackathons, grants and scholarships with confirmed deadlines.`
- 60-word description:

```
QADAM Hub is a free beta radar for students. Every grant, hackathon and internship shows a deadline quoted from the organizer's own page, and expired listings disappear. Take skill quizzes, see which skills a listing asks for that you lack, get timely deadline alerts in Telegram or Discord, and start in two steps with no school or invite code needed.
```

- Topics to pick: Education, Artificial Intelligence, Productivity.
- Maker comment:

```
Hi, I'm [name], 17, and I made QADAM Hub because I kept missing hackathon deadlines that were buried in chat links.

Today it does four things: shows grants, hackathons and internships where each deadline is quoted from the organizer's page, runs 235 skill quizzes, shows the gap between a listing and your skills, and sends deadline alerts to Telegram and Discord. You can start in two steps, free, with no school or invite.

What it does not do yet: the feed is small. I'm weighing a verified portfolio (GitHub projects and course certificates) but haven't decided to build it.

I'd love to know what would make you trust a listing, and what you would want first. The Feedback button in the app goes straight to me.
```

## BetaList

- 10-word pitch: `Find hackathons, grants and scholarships you can still apply to.`
- 60-word description:

```
QADAM Hub helps students worldwide find hackathons, grants and scholarships they can still apply to. Each listing is published only when its deadline is confirmed on the organizer's own page. It adds 235 skill quizzes, a CV gap check against each listing, and deadline alerts in Telegram or Discord. Free during the beta, with no school, paywall or invite needed.
```

- Maker comment:

```
I'm [name], a 17 year old AI student. I built this after missing hackathon deadlines that only lived in chat links. It is early: the feed is small on purpose, because I only publish listings whose deadline I can confirm on the source. I'm looking for testers who will tell me what is confusing. Every report through the in-app Feedback button reaches me directly.
```

## Indie Hackers

- 10-word pitch: `Free radar for student hackathons, grants and scholarships, with sources.`
- 60-word description:

```
I built QADAM Hub because hackathon and scholarship deadlines kept slipping past me in chat links. It is a free beta radar where each listing shows a deadline quoted from the organizer's own page, plus 235 skill quizzes, a CV gap check, and Telegram or Discord alerts. A verified portfolio is only an idea. I want blunt feedback from students.
```

- Maker comment (post on the product page, and as a short milestone post):

```
Hi IH, I'm [name]. Honest state of things: it is a free beta, there are no paying customers, the feed is small, and everything I claim is live. Stack: React, TypeScript, Supabase, Vercel, and a daily job that reads organizer pages and keeps a listing only if the deadline is on the page.

The business idea is to stay free for students and charge schools later for a view of who is preparing and who applied (around $149 a month per school group is my current guess, untested).

Two things I'd like help with: how you got your first few schools or institutions to try something, and what you would cut from a beta like this. Thanks for reading.
```

## Hacker News

Title (use a plain hyphen, not a long dash):

```
Show HN: QADAM Hub - hackathons and grants with deadlines quoted from the organizer's page
```

Link: `https://www.qadamhub.com/students`

First comment, posted by you right away:

```
Hi HN, I'm [name], a 17 year old student. I built this because I kept missing hackathon and scholarship deadlines that only existed in chat links.

How it works: a daily job searches the web, reads each candidate page, and extracts the listing. It is published only if the page itself contains the deadline, and the quote is stored with it; undated, expired or aggregator pages are dropped. That keeps the feed small (about a handful of listings today) but each one links to the source.

On top of that: 235 skill quizzes with a pass mark, a CV gap check that compares a listing's required skills with yours, and Telegram and Discord alerts. The profile is kept in the browser, there is no account needed to start, and the stack is React, TypeScript, Supabase and Vercel.

Not built: a portfolio that verifies GitHub projects and course certificates. I'm still deciding whether it is worth building, so I won't imply it exists.

Things I'd value feedback on: whether the quoted-deadline approach is enough to trust a listing, and what you would check before trusting a certificate link. The Feedback button inside the app reaches me directly.
```

Notes for HN: do not ask for upvotes or share the link to get them; read the Show HN rules on trying the product (our start is two steps with no email, but check that it counts as easy to try); post on a weekday morning US time and stay online for the first hours to answer.

---

## After posting

Record every post in `docs/beta-launch-channels.md` (date, link, result). Move bug reports from the `feedback` table into issues, and answer people who left a rating of 3 or less first.
