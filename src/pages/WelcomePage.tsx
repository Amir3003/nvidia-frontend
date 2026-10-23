import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PilotRequestModal } from '../components/PilotRequestModal';
import { CONTACT_EMAIL } from '../lib/pilotRequests';
import {
  BarChartIcon,
  BellIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CloseIcon,
  ExternalLinkIcon,
  FileTextIcon,
  MailIcon,
  MenuIcon,
  RadarIcon,
  ShieldIcon,
  UserIcon,
  UsersIcon,
} from '../components/Icons';

// Public B2B landing for training centers. Plan and copy rules: docs/B2B_PLAN.md.
// Every claim here must be true today or carry a status chip.

type Status = 'live' | 'early' | 'pilot';

const STATUS_LABEL: Record<Status, string> = {
  live: 'Available now',
  early: 'Early version',
  pilot: 'Coming in pilot',
};

const STATUS_CLASS: Record<Status, string> = {
  live: 'bg-[#E6F2EF] text-[#0F766E]',
  early: 'bg-[#EEF0F6] text-[#3B4A78]',
  pilot: 'bg-[#FBF1DE] text-[#8A5A12]',
};

const NAV_LINKS = [
  { id: 'how-it-works', label: 'How it works' },
  { id: 'workspace', label: 'Workspace' },
  { id: 'pilot', label: 'Pilot' },
  { id: 'team', label: 'Team' },
  { id: 'faq', label: 'FAQ' },
];

const STEPS: { number: string; title: string; text: string; status: Status; icon: React.ReactNode }[] = [
  {
    number: '01',
    title: 'Profile',
    text: 'Learners add skills, goals and projects. This gives every recommendation its context.',
    status: 'live',
    icon: <UserIcon size={20} />,
  },
  {
    number: '02',
    title: 'Discover',
    text: 'Internships, hackathons and grants that fit the profile, each with a link to the official source.',
    status: 'live',
    icon: <RadarIcon size={20} />,
  },
  {
    number: '03',
    title: 'Prepare',
    text: 'CV gap checks and a checklist for each application, so learners know what to fix before the deadline.',
    status: 'early',
    icon: <FileTextIcon size={20} />,
  },
  {
    number: '04',
    title: 'Track',
    text: 'Staff see who saved, prepared and applied, across the whole cohort, in one place.',
    status: 'pilot',
    icon: <BarChartIcon size={20} />,
  },
];

type LearnerState = 'Applied' | 'Preparing' | 'Saved' | 'Not started';

const LEARNER_STATE_CLASS: Record<LearnerState, string> = {
  Applied: 'bg-[#E6F2EF] text-[#0F766E]',
  Preparing: 'bg-[#EEF0F6] text-[#3B4A78]',
  Saved: 'bg-[#FBF1DE] text-[#8A5A12]',
  'Not started': 'bg-[#F1EEE7] text-[#6B7385]',
};

const SAMPLE_LEARNERS: {
  name: string;
  track: string;
  profile: number;
  saved: number;
  applied: number;
  deadline: string;
  state: LearnerState;
}[] = [
  { name: 'Aruzhan S.', track: 'Data Analytics', profile: 100, saved: 6, applied: 2, deadline: 'Nov 14', state: 'Applied' },
  { name: 'Daniyar K.', track: 'Web Development', profile: 90, saved: 4, applied: 1, deadline: 'Nov 20', state: 'Applied' },
  { name: 'Madina T.', track: 'ML Engineering', profile: 80, saved: 5, applied: 0, deadline: 'Nov 9', state: 'Preparing' },
  { name: 'Timur A.', track: 'Data Analytics', profile: 60, saved: 2, applied: 0, deadline: 'Dec 1', state: 'Saved' },
  { name: 'Alina B.', track: 'Web Development', profile: 30, saved: 0, applied: 0, deadline: 'None', state: 'Not started' },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Who pays for QADAM Hub?',
    a: 'The institution. Learners in a cohort use it at no cost. The pilot is free; after it, the proposed price is 149 USD per month for up to 100 active learners.',
  },
  {
    q: 'What do learners need to start?',
    a: 'A browser and an email address. They join with an invite link from your staff and fill in a short profile. There is nothing to install.',
  },
  {
    q: 'Where do the opportunities come from?',
    a: 'A daily search across public sources. A listing is published only if its deadline is in the future and is confirmed by a quote on the official page. Expired, undated and directory pages are removed.',
  },
  {
    q: 'What can staff see about a learner?',
    a: 'Name, track, how complete the profile is, and which opportunities the learner saved, is preparing or applied to. Staff do not see CV text or private messages.',
  },
  {
    q: 'How long does setup take?',
    a: 'About one working day. We create the cohort with your staff lead, send one invite link to learners and agree on a weekly check-in.',
  },
  {
    q: 'What happens after the pilot?',
    a: 'You get a summary of what learners did during the pilot. If it was useful, we agree on a paid subscription. If not, the cohort simply stops, with no obligation.',
  },
  {
    q: 'Which languages and regions do you support?',
    a: 'The interface is in English. The first pilots are with training centers in Kazakhstan; listings cover opportunities open to learners from Kazakhstan, local and international.',
  },
];

const TEAM = [
  { initials: 'AN', name: 'Amir Nagiyev', role: 'Frontend development' },
  { initials: 'AA', name: 'Aiym Agatayeva', role: 'Backend development and AI' },
  { initials: 'NJ', name: 'Nityam Jain', role: 'AI and analytics' },
  { initials: 'NS', name: 'Nishchay Shergill', role: 'Video production, presentations and editing' },
];

const container = 'max-w-6xl mx-auto px-4 sm:px-6';
const eyebrow = 'font-mono text-[12px] uppercase tracking-[0.14em] text-[#8A6A2F]';
const h2Class = 'text-[30px] sm:text-[40px] leading-[1.12] font-semibold tracking-tight text-[#1B2440]';
const lead = 'text-[17px] sm:text-[18px] leading-relaxed text-[#4A5468]';
const primaryButton =
  'inline-flex items-center justify-center gap-2 h-12 px-6 rounded-[10px] bg-[#1B2440] hover:bg-[#28345A] text-[#F7F4EE] text-[15px] font-medium transition-colors cursor-pointer';
const secondaryButton =
  'inline-flex items-center justify-center gap-2 h-12 px-6 rounded-[10px] border border-[#CFC7B6] hover:border-[#1B2440] text-[#1B2440] text-[15px] font-medium bg-white/60 hover:bg-white transition-colors cursor-pointer';

const StatusChip: React.FC<{ status: Status }> = ({ status }) => (
  <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-[12px] font-medium ${STATUS_CLASS[status]}`}>
    {STATUS_LABEL[status]}
  </span>
);

const SampleBadge: React.FC = () => (
  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#6B7385] border border-[#E4DED2] rounded-full px-2 py-0.5">
    Sample data
  </span>
);

const Logo: React.FC = () => (
  <span className="flex items-center gap-2.5">
    <img src="/brand/qadam-mark.svg" alt="" width={28} height={28} className="w-7 h-7" />
    <span className="text-[17px] font-semibold tracking-tight text-[#1B2440]">
      QADAM <span className="text-[#8A6A2F]">Hub</span>
    </span>
  </span>
);

const CohortOverview: React.FC = () => (
  <div className="bg-white rounded-[16px] border border-[#E4DED2] shadow-[0_24px_60px_-28px_rgba(27,36,64,0.35)] overflow-hidden">
    <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#EFEAE0]">
      <div className="min-w-0">
        <p className="text-[12px] text-[#6B7385]">Cohort</p>
        <p className="text-[15px] font-semibold text-[#1B2440] truncate">Data Analytics, Fall 2026</p>
      </div>
      <SampleBadge />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-[#EFEAE0]">
      {[
        { label: 'Learners', value: '42' },
        { label: 'Profiles complete', value: '31' },
        { label: 'Applications started', value: '18' },
        { label: 'Submitted', value: '6' },
      ].map((stat, index) => (
        <div
          key={stat.label}
          className={`px-5 py-4 ${index % 2 === 1 ? 'border-l' : ''} ${index >= 2 ? 'border-t sm:border-t-0' : ''} ${index === 2 ? 'sm:border-l' : ''} border-[#EFEAE0]`}
        >
          <p className="font-mono text-[22px] font-medium text-[#1B2440]">{stat.value}</p>
          <p className="text-[12px] text-[#6B7385] mt-0.5">{stat.label}</p>
        </div>
      ))}
    </div>
    <ul className="divide-y divide-[#EFEAE0]">
      {SAMPLE_LEARNERS.slice(0, 4).map((learner) => (
        <li key={learner.name} className="flex items-center justify-between gap-3 px-5 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-8 h-8 shrink-0 rounded-full bg-[#F1EEE7] text-[#1B2440] text-[12px] font-semibold flex items-center justify-center">
              {learner.name.split(' ').map((part) => part[0]).join('')}
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-medium text-[#1B2440] truncate">{learner.name}</p>
              <p className="text-[12px] text-[#6B7385] truncate">{learner.track}</p>
            </div>
          </div>
          <span className={`shrink-0 inline-flex items-center h-6 px-2.5 rounded-full text-[12px] font-medium ${LEARNER_STATE_CLASS[learner.state]}`}>
            {learner.state}
          </span>
        </li>
      ))}
    </ul>
  </div>
);

const CohortTable: React.FC = () => (
  <div className="bg-white rounded-[16px] border border-[#E4DED2] shadow-[0_24px_60px_-28px_rgba(27,36,64,0.3)] overflow-hidden">
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-[#EFEAE0]">
      <div className="flex items-center gap-2">
        {['All learners', 'Applied', 'Needs attention'].map((tab, index) => (
          <span
            key={tab}
            className={`h-8 px-3 inline-flex items-center rounded-full text-[13px] ${index === 0 ? 'bg-[#1B2440] text-[#F7F4EE]' : 'text-[#4A5468] bg-[#F7F4EE]'}`}
          >
            {tab}
          </span>
        ))}
      </div>
      <SampleBadge />
    </div>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left">
        <thead>
          <tr className="text-[12px] text-[#6B7385]">
            <th className="font-medium px-5 py-3">Learner</th>
            <th className="font-medium px-3 py-3">Profile</th>
            <th className="font-medium px-3 py-3">Saved</th>
            <th className="font-medium px-3 py-3">Applied</th>
            <th className="font-medium px-3 py-3">Next deadline</th>
            <th className="font-medium px-5 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EFEAE0] border-t border-[#EFEAE0]">
          {SAMPLE_LEARNERS.map((learner) => (
            <tr key={learner.name} className="text-[14px] text-[#1B2440]">
              <td className="px-5 py-3">
                <p className="font-medium">{learner.name}</p>
                <p className="text-[12px] text-[#6B7385]">{learner.track}</p>
              </td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-2">
                  <span className="w-16 h-1.5 rounded-full bg-[#EFEAE0] overflow-hidden">
                    <span className="block h-full bg-[#1B2440]" style={{ width: `${learner.profile}%` }} />
                  </span>
                  <span className="font-mono text-[12px] text-[#4A5468]">{learner.profile}%</span>
                </div>
              </td>
              <td className="px-3 py-3 font-mono text-[13px]">{learner.saved}</td>
              <td className="px-3 py-3 font-mono text-[13px]">{learner.applied}</td>
              <td className="px-3 py-3 text-[13px] text-[#4A5468]">{learner.deadline}</td>
              <td className="px-5 py-3">
                <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-[12px] font-medium whitespace-nowrap ${LEARNER_STATE_CLASS[learner.state]}`}>
                  {learner.state}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const WelcomePage: React.FC = () => {
  const { setIsOnboardingOpen } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const pilotOpen = searchParams.get('pilot') === '1';

  const openPilot = () => {
    setMenuOpen(false);
    setSearchParams({ pilot: '1' }, { replace: true });
  };
  const closePilot = useCallback(() => setSearchParams({}, { replace: true }), [setSearchParams]);
  const openStudentLogin = () => {
    setMenuOpen(false);
    setIsOnboardingOpen(true);
  };
  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <div className="relative z-10 min-h-[100dvh] bg-[#F7F4EE] text-[#1B2440] selection:bg-[#C9A25E]/30 selection:text-[#1B2440]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#F7F4EE]/90 backdrop-blur-md border-b border-[#E4DED2]">
        <div className={`${container} h-16 flex items-center justify-between gap-4`}>
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="cursor-pointer" aria-label="QADAM Hub, back to top">
            <Logo />
          </button>
          <nav className="hidden lg:flex items-center gap-1" aria-label="Sections">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollTo(link.id)}
                className="h-10 px-3 rounded-[8px] text-[14px] text-[#4A5468] hover:text-[#1B2440] hover:bg-[#EDE7DA] transition-colors cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openStudentLogin}
              className="hidden sm:inline-flex h-10 px-3 items-center rounded-[8px] text-[14px] font-medium text-[#1B2440] hover:bg-[#EDE7DA] transition-colors cursor-pointer"
            >
              Student login
            </button>
            <button
              type="button"
              onClick={openPilot}
              className="inline-flex items-center h-10 px-4 rounded-[10px] bg-[#1B2440] hover:bg-[#28345A] text-[#F7F4EE] text-[14px] font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              Request a pilot
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className="lg:hidden w-11 h-11 -mr-2 flex items-center justify-center rounded-[10px] text-[#1B2440] hover:bg-[#EDE7DA] transition-colors cursor-pointer"
            >
              {menuOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <>
            <div className="lg:hidden fixed inset-0 top-16 z-40 bg-[#1B2440]/20" onClick={() => setMenuOpen(false)} />
            <div className="lg:hidden absolute left-0 right-0 top-16 z-50 bg-[#F7F4EE] border-b border-[#E4DED2] shadow-[0_16px_32px_-20px_rgba(27,36,64,0.4)] max-h-[calc(100dvh-4rem)] overflow-y-auto">
              <nav className={`${container} py-3 flex flex-col`} aria-label="Sections">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => scrollTo(link.id)}
                    className="h-12 text-left text-[16px] text-[#1B2440] border-b border-[#EFEAE0] cursor-pointer"
                  >
                    {link.label}
                  </button>
                ))}
                <button type="button" onClick={openStudentLogin} className="h-12 text-left text-[16px] font-medium text-[#1B2440] cursor-pointer">
                  Student login
                </button>
              </nav>
            </div>
          </>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="pt-14 sm:pt-20 pb-20 sm:pb-28">
          <div className={`${container} grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-14 items-center`}>
            <div>
              <p className={eyebrow}>For training centers in Kazakhstan</p>
              <h1 className="mt-4 text-[38px] sm:text-[56px] lg:text-[60px] leading-[1.04] font-semibold tracking-[-0.02em] text-[#1B2440]">
                Opportunity and career support for your cohort
              </h1>
              <p className={`${lead} mt-6 max-w-xl`}>
                Your learners find internships, hackathons and grants that fit their skills. Your staff see who is
                applying, without chasing links in chats.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button type="button" onClick={openPilot} className={primaryButton}>
                  Request a pilot
                  <ChevronRightIcon size={18} />
                </button>
                <button type="button" onClick={() => scrollTo('how-it-works')} className={secondaryButton}>
                  See how it works
                </button>
              </div>
              <dl className="mt-10 grid grid-cols-3 gap-4 max-w-lg border-t border-[#E4DED2] pt-6">
                {[
                  { value: '4 to 6', label: 'week pilot' },
                  { value: '30 to 50', label: 'learners' },
                  { value: '0 USD', label: 'during the pilot' },
                ].map((fact) => (
                  <div key={fact.label}>
                    <dt className="font-mono text-[18px] sm:text-[20px] font-medium text-[#1B2440]">{fact.value}</dt>
                    <dd className="text-[13px] text-[#6B7385] mt-1">{fact.label}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <CohortOverview />
          </div>
        </section>

        {/* Problem */}
        <section className="py-20 sm:py-28 bg-[#FBFAF7] border-y border-[#E4DED2]">
          <div className={container}>
            <div className="max-w-2xl">
              <p className={eyebrow}>The problem</p>
              <h2 className={`${h2Class} mt-3`}>The gap after the classroom</h2>
              <p className={`${lead} mt-5`}>
                Learners build skills. Finding the right next opportunity still takes work, for them and for your staff.
              </p>
            </div>
            <div className="mt-12 grid md:grid-cols-2 gap-5">
              {[
                {
                  icon: <UsersIcon size={20} />,
                  title: 'For learners',
                  text: 'Opportunities sit across websites and chats. Learners check requirements and deadlines on their own, and often find out too late.',
                },
                {
                  icon: <BarChartIcon size={20} />,
                  title: 'For staff',
                  text: 'Staff share links by hand and have no clear view of which learners apply, prepare or need a push.',
                },
              ].map((card) => (
                <div key={card.title} className="bg-white rounded-[16px] border border-[#E4DED2] p-6 sm:p-8">
                  <span className="w-10 h-10 rounded-[10px] bg-[#F7F4EE] border border-[#E4DED2] text-[#1B2440] flex items-center justify-center">
                    {card.icon}
                  </span>
                  <h3 className="mt-5 text-[20px] font-semibold text-[#1B2440]">{card.title}</h3>
                  <p className="mt-2 text-[16px] leading-relaxed text-[#4A5468]">{card.text}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-[15px] text-[#4A5468]">
              <span className="inline-block w-6 h-px bg-[#C9A25E] align-middle mr-3" />
              The pilot answers one question: how much staff time does this cost per cohort, and how much of it can we
              save?
            </p>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-20 sm:py-28 scroll-mt-16">
          <div className={container}>
            <div className="max-w-2xl">
              <p className={eyebrow}>How it works</p>
              <h2 className={`${h2Class} mt-3`}>A guided path to relevant opportunities</h2>
              <p className={`${lead} mt-5`}>Four steps for learners, with staff oversight at every step.</p>
            </div>
            <ol className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {STEPS.map((step) => (
                <li key={step.number} className="bg-white rounded-[16px] border border-[#E4DED2] p-6 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[13px] text-[#8A6A2F]">{step.number}</span>
                    <span className="text-[#1B2440]">{step.icon}</span>
                  </div>
                  <h3 className="mt-6 text-[20px] font-semibold text-[#1B2440]">{step.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[#4A5468] flex-1">{step.text}</p>
                  <div className="mt-5">
                    <StatusChip status={step.status} />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Workspace */}
        <section id="workspace" className="py-20 sm:py-28 bg-[#FBFAF7] border-y border-[#E4DED2] scroll-mt-16">
          <div className={`${container} grid lg:grid-cols-[0.8fr_1.2fr] gap-12 items-start`}>
            <div>
              <p className={eyebrow}>Staff workspace</p>
              <h2 className={`${h2Class} mt-3`}>One view of your cohort</h2>
              <p className={`${lead} mt-5`}>
                See who has a complete profile, who is preparing and who already applied. Follow up with the learners who
                need it, not with everyone.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  'Invite a whole cohort with one link',
                  'Profile completion for every learner',
                  'Saved and submitted applications',
                  'Summary report at the end of the pilot',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-[#1B2440] text-[#F7F4EE] flex items-center justify-center">
                      <CheckIcon size={12} />
                    </span>
                    <span className="text-[16px] text-[#1B2440]">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <StatusChip status="pilot" />
              </div>
            </div>
            <CohortTable />
          </div>
        </section>

        {/* Listing quality */}
        <section className="py-20 sm:py-28">
          <div className={container}>
            <div className="max-w-2xl">
              <p className={eyebrow}>Listing quality</p>
              <h2 className={`${h2Class} mt-3`}>Listings your staff can trust</h2>
            </div>
            <div className="mt-12 grid md:grid-cols-3 gap-5">
              {[
                {
                  icon: <ExternalLinkIcon size={20} />,
                  title: 'Every listing has a source',
                  text: 'Each internship, hackathon or grant links to the official page, so learners apply where the organizer expects them.',
                },
                {
                  icon: <ShieldIcon size={20} />,
                  title: 'Deadlines are checked',
                  text: 'A listing is published only when its deadline is in the future and confirmed on the source page. Expired ones are removed daily.',
                },
                {
                  icon: <BellIcon size={20} />,
                  title: 'Alerts where learners are',
                  text: 'Learners can get new matches and deadline reminders in Telegram and Discord, not only on the site.',
                },
              ].map((card) => (
                <div key={card.title} className="rounded-[16px] border border-[#E4DED2] bg-white p-6 sm:p-7">
                  <span className="text-[#1B2440]">{card.icon}</span>
                  <h3 className="mt-5 text-[18px] font-semibold text-[#1B2440]">{card.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[#4A5468]">{card.text}</p>
                  <div className="mt-5">
                    <StatusChip status="live" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who it is for */}
        <section className="py-20 sm:py-28 bg-[#FBFAF7] border-y border-[#E4DED2]">
          <div className={container}>
            <div className="max-w-2xl">
              <p className={eyebrow}>Who it is for</p>
              <h2 className={`${h2Class} mt-3`}>Built for technology training cohorts</h2>
            </div>
            <div className="mt-12 grid md:grid-cols-3 gap-5">
              {[
                { title: 'Coding schools', text: 'Full-stack, frontend and backend programs that want graduates in internships, not only certificates.' },
                { title: 'AI training centers', text: 'Data and machine learning programs whose learners are ready for hackathons, research grants and labs.' },
                { title: 'Career bootcamps', text: 'Short intensive programs where every week counts and staff need to know who is falling behind.' },
              ].map((card) => (
                <div key={card.title} className="bg-white rounded-[16px] border border-[#E4DED2] p-6 sm:p-7">
                  <h3 className="text-[19px] font-semibold text-[#1B2440]">{card.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[#4A5468]">{card.text}</p>
                </div>
              ))}
            </div>
            <dl className="mt-10 grid sm:grid-cols-3 gap-px bg-[#E4DED2] rounded-[16px] overflow-hidden border border-[#E4DED2]">
              {[
                { term: 'Who buys', desc: 'Directors and program leads' },
                { term: 'Who tracks', desc: 'Career and program staff' },
                { term: 'Who uses', desc: 'Learners in the cohort' },
              ].map((row) => (
                <div key={row.term} className="bg-white px-6 py-5">
                  <dt className="font-mono text-[12px] uppercase tracking-[0.12em] text-[#6B7385]">{row.term}</dt>
                  <dd className="mt-1.5 text-[16px] font-medium text-[#1B2440]">{row.desc}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Pilot and pricing */}
        <section id="pilot" className="py-20 sm:py-28 scroll-mt-16">
          <div className={container}>
            <div className="max-w-2xl">
              <p className={eyebrow}>Pilot and pricing</p>
              <h2 className={`${h2Class} mt-3`}>Pilot first. Pay only if it helps.</h2>
              <p className={`${lead} mt-5`}>
                The institution pays, the cohort gets access. We start with a free pilot and agree on a subscription only
                after you have seen the results.
              </p>
            </div>
            <div className="mt-12 grid lg:grid-cols-2 gap-5">
              <div className="rounded-[20px] bg-[#1B2440] text-[#F7F4EE] p-7 sm:p-9 flex flex-col">
                <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-[#C9A25E]">Step 1</p>
                <h3 className="mt-3 text-[26px] font-semibold tracking-tight">Pilot</h3>
                <p className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-[40px] font-semibold tracking-tight">Free</span>
                  <span className="text-[15px] text-[#C8CCD8]">for 4 to 6 weeks</span>
                </p>
                <ul className="mt-6 space-y-3 flex-1">
                  {[
                    'One cohort of 30 to 50 learners',
                    'One staff lead from your side',
                    'Setup in about one working day',
                    'Weekly check-in with our team',
                    'Summary of learner activity at the end',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[15px] text-[#E7E9F0]">
                      <CheckIcon size={18} className="mt-0.5 shrink-0 text-[#C9A25E]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={openPilot}
                  className="mt-8 h-12 px-6 rounded-[10px] bg-[#F7F4EE] hover:bg-white text-[#1B2440] text-[15px] font-medium transition-colors cursor-pointer"
                >
                  Request a pilot
                </button>
              </div>
              <div className="rounded-[20px] bg-white border border-[#E4DED2] p-7 sm:p-9 flex flex-col">
                <p className={eyebrow}>Step 2</p>
                <h3 className="mt-3 text-[26px] font-semibold tracking-tight text-[#1B2440]">Subscription</h3>
                <p className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-[40px] font-semibold tracking-tight text-[#1B2440] whitespace-nowrap">149 USD</span>
                  <span className="text-[15px] text-[#6B7385]">per month, per institution</span>
                </p>
                <ul className="mt-6 space-y-3 flex-1">
                  {[
                    'Up to 100 active learners',
                    'Staff accounts for your team',
                    'Cohort tools and invite links',
                    'Opportunity recommendations for every learner',
                    'Basic reporting on learner activity',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[15px] text-[#1B2440]">
                      <CheckIcon size={18} className="mt-0.5 shrink-0 text-[#0F766E]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-8 text-[13px] leading-relaxed text-[#6B7385]">
                  Proposed price. We confirm it with each pilot partner before any payment. Monthly invoice, no card
                  needed on the site.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Where we are */}
        <section className="py-20 sm:py-28 bg-[#FBFAF7] border-y border-[#E4DED2]">
          <div className={container}>
            <div className="max-w-2xl">
              <p className={eyebrow}>Where we are</p>
              <h2 className={`${h2Class} mt-3`}>Prototype today. Staff workspace next.</h2>
              <p className={`${lead} mt-5`}>
                We would rather tell you exactly what works now than promise everything at once.
              </p>
            </div>
            <div className="mt-12 grid md:grid-cols-2 gap-5">
              <div className="bg-white rounded-[16px] border border-[#E4DED2] p-6 sm:p-8">
                <StatusChip status="live" />
                <ul className="mt-5 space-y-3">
                  {['Opportunity discovery matched to a learner profile', 'Structured listings with sources and checked deadlines', 'Telegram and Discord bots for alerts'].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[16px] text-[#1B2440]">
                      <CheckIcon size={18} className="mt-0.5 shrink-0 text-[#0F766E]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-[16px] border border-[#E4DED2] p-6 sm:p-8">
                <StatusChip status="pilot" />
                <ul className="mt-5 space-y-3">
                  {['Institution accounts and staff permissions', 'Cohort management and reporting', 'CV matching and application support'].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[16px] text-[#1B2440]">
                      <span className="mt-2 w-2 h-2 shrink-0 rounded-full bg-[#C9A25E]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-8 text-[15px] text-[#4A5468]">
              <span className="inline-block w-6 h-px bg-[#C9A25E] align-middle mr-3" />
              We do not have signed institutional partners yet. The pilot is how we plan to earn them.
            </p>
          </div>
        </section>

        {/* Comparison */}
        <section className="py-20 sm:py-28">
          <div className={container}>
            <div className="max-w-2xl">
              <p className={eyebrow}>Compared with today</p>
              <h2 className={`${h2Class} mt-3`}>Instead of chats and spreadsheets</h2>
            </div>
            <div className="mt-12 rounded-[16px] border border-[#E4DED2] bg-white overflow-hidden">
              <div className="hidden sm:grid grid-cols-[1fr_1.2fr_1.2fr] bg-[#F7F4EE] border-b border-[#E4DED2] text-[13px] font-medium text-[#6B7385]">
                <span className="px-6 py-3">Task</span>
                <span className="px-6 py-3">Chats and spreadsheets</span>
                <span className="px-6 py-3 text-[#1B2440]">QADAM Hub</span>
              </div>
              {[
                ['Finding opportunities', 'Staff collect and repost links by hand', 'Matched to each learner profile daily'],
                ['Checking deadlines', 'Each learner checks on their own', 'Confirmed on the source page, expired ones removed'],
                ['Knowing who applied', 'Asking in chats, one by one', 'Saved and applied status per learner'],
                ['End-of-cohort reporting', 'Built by hand, if at all', 'Summary of learner activity for the cohort'],
              ].map(([task, before, after]) => (
                <div key={task} className="grid sm:grid-cols-[1fr_1.2fr_1.2fr] border-b last:border-b-0 border-[#EFEAE0]">
                  <span className="px-6 pt-4 sm:py-4 text-[15px] font-semibold text-[#1B2440]">{task}</span>
                  <span className="px-6 pt-1 sm:py-4 text-[15px] text-[#6B7385]">
                    <span className="sm:hidden text-[12px] uppercase tracking-wide font-mono mr-2">Today</span>
                    {before}
                  </span>
                  <span className="px-6 pt-1 pb-4 sm:py-4 text-[15px] text-[#1B2440]">
                    <span className="sm:hidden text-[12px] uppercase tracking-wide font-mono mr-2 text-[#8A6A2F]">Hub</span>
                    {after}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section id="team" className="py-20 sm:py-28 bg-[#FBFAF7] border-y border-[#E4DED2] scroll-mt-16">
          <div className={container}>
            <div className="max-w-2xl">
              <p className={eyebrow}>Team</p>
              <h2 className={`${h2Class} mt-3`}>The team behind QADAM Hub</h2>
              <p className={`${lead} mt-5`}>
                A student team at Qazaq AI Research University, with hands-on experience building opportunity discovery
                and messaging bot prototypes.
              </p>
            </div>
            <ul className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {TEAM.map((person) => (
                <li key={person.name} className="bg-white rounded-[16px] border border-[#E4DED2] p-6">
                  <span className="w-12 h-12 rounded-full bg-[#1B2440] text-[#F7F4EE] text-[15px] font-semibold flex items-center justify-center">
                    {person.initials}
                  </span>
                  <p className="mt-5 text-[17px] font-semibold text-[#1B2440]">{person.name}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-[#6B7385]">{person.role}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20 sm:py-28 scroll-mt-16">
          <div className={`${container} grid lg:grid-cols-[0.8fr_1.2fr] gap-10`}>
            <div>
              <p className={eyebrow}>FAQ</p>
              <h2 className={`${h2Class} mt-3`}>Questions from program leads</h2>
              <p className={`${lead} mt-5`}>
                Something else? Write to{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#1B2440] underline decoration-[#C9A25E] underline-offset-4">
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            </div>
            <div className="border-t border-[#E4DED2]">
              {FAQ.map((item, index) => {
                const open = openFaq === index;
                return (
                  <div key={item.q} className="border-b border-[#E4DED2]">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : index)}
                      aria-expanded={open}
                      className="w-full min-h-[60px] py-4 flex items-center justify-between gap-4 text-left cursor-pointer"
                    >
                      <span className="text-[17px] font-medium text-[#1B2440]">{item.q}</span>
                      <ChevronDownIcon size={20} className={`shrink-0 text-[#6B7385] transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`} />
                    </button>
                    {open && <p className="pb-5 pr-8 text-[16px] leading-relaxed text-[#4A5468]">{item.a}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Final call to action */}
        <section className="pb-20 sm:pb-28">
          <div className={container}>
            <div className="rounded-[24px] bg-[#1B2440] px-6 py-12 sm:px-12 sm:py-16 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="max-w-xl">
                <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-[#C9A25E]">One pilot partner</p>
                <h2 className="mt-3 text-[30px] sm:text-[40px] leading-[1.12] font-semibold tracking-tight text-[#F7F4EE]">
                  Run a pilot with one cohort
                </h2>
                <p className="mt-4 text-[17px] leading-relaxed text-[#C8CCD8]">
                  4 to 6 weeks, 30 to 50 learners, one staff lead. Free, with no obligation after it ends.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <button
                  type="button"
                  onClick={openPilot}
                  className="h-12 px-6 rounded-[10px] bg-[#F7F4EE] hover:bg-white text-[#1B2440] text-[15px] font-medium transition-colors cursor-pointer"
                >
                  Request a pilot
                </button>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="h-12 px-6 inline-flex items-center justify-center gap-2 rounded-[10px] border border-[#46507A] hover:border-[#C8CCD8] text-[#F7F4EE] text-[15px] font-medium transition-colors"
                >
                  <MailIcon size={18} />
                  Email us
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E4DED2] bg-[#FBFAF7]">
        <div className={`${container} py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6`}>
          <div>
            <Logo />
            <p className="mt-3 text-[14px] text-[#6B7385]">Opportunity and career support for training centers.</p>
          </div>
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px]" aria-label="Footer">
            <button type="button" onClick={() => navigate('/privacy')} className="h-10 text-[#4A5468] hover:text-[#1B2440] cursor-pointer">
              Privacy
            </button>
            <button type="button" onClick={openStudentLogin} className="h-10 text-[#4A5468] hover:text-[#1B2440] cursor-pointer">
              Student login
            </button>
            <a href={`mailto:${CONTACT_EMAIL}`} className="h-10 inline-flex items-center text-[#4A5468] hover:text-[#1B2440]">
              {CONTACT_EMAIL}
            </a>
          </nav>
        </div>
        <div className={`${container} pb-8 text-[13px] text-[#8A90A0]`}>© 2026 QADAM Hub</div>
      </footer>

      <PilotRequestModal open={pilotOpen} onClose={closePilot} />
    </div>
  );
};
