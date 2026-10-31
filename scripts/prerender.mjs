// After `vite build`: writes a static HTML copy of the public landings to dist/prerender/, with the
// page's own title, description, canonical URL and readable text already in the HTML. Crawlers that
// do not run JavaScript (or run it late) then see real content; in a browser React replaces the
// text on load. vercel.json rewrites /welcome, / and /students to these files.
// The copy below must stay true to the pages in src/pages (see docs/STRATEGY.md for what is live).
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const SITE = 'https://www.qadamhub.com';

const PAGES = [
  {
    file: 'welcome',
    path: '/welcome',
    title: 'Career support for training centers in Kazakhstan | QADAM Hub',
    description:
      'QADAM Hub helps coding schools, AI training centers and bootcamps in Kazakhstan guide learners to internships, hackathons and grants, and shows staff who is applying. Free 4 to 6 week pilot.',
    h1: 'Opportunity and career support for your cohort',
    intro:
      'Learners find internships, hackathons and grants that fit their skills. Your staff see who is applying, without chasing links in chats. Built for coding schools, AI training centers and career bootcamps in Kazakhstan.',
    sections: [
      {
        h2: 'How it works',
        items: [
          ['Discover: relevant opportunities, with sources', "Internships, hackathons and grants that fit each learner's skills and goals. Every listing links to the official page, and its deadline is confirmed on the source page."],
          ['Prepare: ready before the deadline', 'Learners see which skills a listing asks for, what their CV is missing and what to do before they apply. Skill quizzes cover 236 topics.'],
          ['Track: one view of your cohort', 'Staff see who has a complete profile, who is preparing and who already applied. Invite a cohort with one link and export the roster as CSV.'],
          ['Alerts: reminders where learners already are', 'New matches and deadline reminders arrive in Telegram and Discord.'],
        ],
      },
      {
        h2: 'Run a pilot with one cohort',
        items: [['Free for 4 to 6 weeks', '30 to 50 learners and one staff lead, with no obligation after the pilot ends.']],
      },
    ],
    links: [
      ['/students', 'QADAM Hub for students'],
      ['/privacy', 'Privacy'],
      ['/terms', 'Terms'],
      ['/refund', 'Refunds'],
    ],
  },
  {
    file: 'students',
    path: '/students',
    title: 'Grants, scholarships and hackathons for students | QADAM Hub',
    description:
      'Find grants, hackathons and scholarships that fit you. Set a goal such as a MEXT scholarship or university admission, check your skills with quizzes and see which real opportunities you can apply to now. Free during the beta.',
    h1: 'Find grants, hackathons and scholarships that fit you',
    intro:
      'Set a goal, check your skills with quizzes and see which real opportunities you can apply to now. No school or invite needed. QADAM Hub for students is free during the beta.',
    sections: [
      {
        h2: 'What you get',
        items: [
          ['Opportunity Radar', 'Grants, internships and hackathons. Every listing has a deadline confirmed on the organizer page.'],
          ['CV and Skill Lab', '236 skill quizzes and a CV gap check against each opportunity, so you know what to learn first.'],
          ['Application prep', 'A checklist before you apply on the organizer site, with the gaps in your profile called out.'],
          ['Alerts in Telegram and Discord', 'New listings that match your goals, in the messenger you already use.'],
          ['Teammates and Network', 'Find people for a hackathon team and message them. Joining is your choice.'],
          ['Portfolio and roadmap (coming soon)', 'A portfolio of verified achievements and a step-by-step plan toward your goal.'],
        ],
      },
    ],
    links: [
      ['/welcome', 'QADAM Hub for schools and training centers'],
      ['/privacy', 'Privacy'],
      ['/terms', 'Terms'],
    ],
  },
];

const esc = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Replaces the text between `before` and `after`. `before` must occur exactly once in the HTML, so a
// change in index.html fails the build instead of silently shipping a page without its meta tags.
// Plain string search on purpose: no patterns built from variables.
function replaceBetween(html, before, after, replacement, label) {
  const start = html.indexOf(before);
  if (start === -1 || html.indexOf(before, start + 1) !== -1) throw new Error(`prerender: expected exactly one ${label} in dist/index.html`);
  const valueStart = start + before.length;
  const end = html.indexOf(after, valueStart);
  if (end === -1) throw new Error(`prerender: ${label} is not closed in dist/index.html`);
  return html.slice(0, valueStart) + replacement + html.slice(end);
}

const meta = (html, attr, key, value) => replaceBetween(html, `<meta ${attr}="${key}" content="`, '"', esc(value), `meta ${key}`);

function shell(page) {
  const sections = page.sections
    .map(
      (section) =>
        `<section><h2 style="color:#fff;font-size:1.4rem;margin:2.5rem 0 .75rem">${esc(section.h2)}</h2>` +
        section.items.map(([title, text]) => `<h3 style="color:#E2E8F0;font-size:1.05rem;margin:1.25rem 0 .25rem">${esc(title)}</h3><p style="margin:0">${esc(text)}</p>`).join('') +
        '</section>',
    )
    .join('');
  const links = page.links.map(([href, label]) => `<a href="${href}" style="color:#5EEAD4;margin-right:1.25rem">${esc(label)}</a>`).join('');
  return (
    `<main id="seo-shell" style="max-width:48rem;margin:0 auto;padding:6rem 1.5rem 4rem;color:#CBD5E1;font-family:Geist,Inter,-apple-system,sans-serif;line-height:1.6">` +
    `<p style="color:#5EEAD4;font-family:monospace;font-size:.85rem;margin:0 0 1rem">QADAM Hub</p>` +
    `<h1 style="color:#fff;font-size:2.25rem;line-height:1.15;margin:0 0 1rem">${esc(page.h1)}</h1>` +
    `<p style="font-size:1.1rem;margin:0">${esc(page.intro)}</p>${sections}` +
    `<nav aria-label="More" style="margin-top:2.5rem">${links}</nav></main>`
  );
}

const base = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
await mkdir(new URL('../dist/prerender/', import.meta.url), { recursive: true });

for (const page of PAGES) {
  const url = `${SITE}${page.path}`;
  let html = base;
  html = replaceBetween(html, '<title>', '</title>', esc(page.title), 'title');
  html = meta(html, 'name', 'title', page.title);
  html = meta(html, 'name', 'description', page.description);
  html = replaceBetween(html, '<link rel="canonical" href="', '"', url, 'canonical');
  html = meta(html, 'property', 'og:url', url);
  html = meta(html, 'property', 'og:title', page.title);
  html = meta(html, 'property', 'og:description', page.description);
  html = meta(html, 'name', 'twitter:url', url);
  html = meta(html, 'name', 'twitter:title', page.title);
  html = meta(html, 'name', 'twitter:description', page.description);
  // The root element is empty in dist/index.html; its content is the static copy.
  html = replaceBetween(html, '<div id="root" class="min-h-[100dvh] flex flex-col">', '</div>', shell(page), 'root element');
  await writeFile(new URL(`../dist/prerender/${page.file}.html`, import.meta.url), html);
  console.log(`prerender: dist/prerender/${page.file}.html`);
}
