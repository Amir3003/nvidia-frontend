import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { isProfileValid } from '../db/userProfile';
import { ShieldIcon, CheckIcon, AlertTriangleIcon } from '../components/Icons';

// Keep this page in sync with what the app actually does. Update it whenever
// a feature starts sending user data anywhere.
const STORED_LOCALLY = [
  ['Profile', 'Name, email, university, major, city, role, skills and goals you enter.'],
  ['CV text', 'The resume text you paste in Profile or during registration.'],
  ['Password', 'Saved in this browser only. It is not a server account and is not encrypted, so do not reuse a password from other services.'],
  ['Agent Memory', 'The directives you write, saved as MEMORY.md.'],
  ['Teammates and teams', 'People you add manually, teams you create and chat messages. They are not shared with anyone.'],
  ['Progress', 'Verified skills, quiz scores and application checklists.'],
  ['Notification settings', 'Your Telegram, KakaoTalk handle or Discord webhook, if you add them.'],
];

const SENT = [
  ['Loading opportunities', 'The app downloads the public opportunity list. This request contains none of your data.'],
  ['Test notification', 'Only if a QADAM server is configured: the channel name and your first name are sent so the bot can message you.'],
  ['Support ticket', 'Opens your own email app with a prepared message. Nothing is sent until you press Send there.'],
  ['Error reports', 'If the app crashes, a technical error report (error message, page address, browser type) is sent to Sentry so we can fix it. It does not include your name, email, IP address, CV or profile fields.'],
  ['Pilot request form', 'If an institution requests a pilot, the details typed into the form (institution, name, email, phone, city, cohort size, message) are stored so we can reply. They are used for nothing else.'],
  ['Official site links', 'Opening an organizer site is a normal visit to that site. Its own privacy policy applies.'],
];

export const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useApp();
  const signedIn = isProfileValid(userProfile);

  const card =
    'p-6 rounded-card bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl border border-teal-300/40 shadow-[0_16px_40px_-12px_rgba(6,182,212,0.18)] text-slate-900';

  return (
    <div className="relative z-10 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 pb-28 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(signedIn ? '/' : '/welcome')}
          className="h-9 px-3 rounded-btn bg-slate-800/80 hover:bg-slate-700/80 text-teal-100 hover:text-white text-mini font-mono flex items-center gap-1.5 transition-colors cursor-pointer border border-teal-500/30"
        >
          ← Back
        </button>
        <span className="text-mini font-mono text-teal-300/80">Last updated: October 2026</span>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Privacy & Your Data</h1>
        <p className="text-[14px] text-teal-100/80 mt-2 leading-relaxed">
          What QADAM saves, what leaves your device, and how to delete everything. In short: your data stays in this
          browser.
        </p>
      </div>

      <div className={`${card} flex items-start gap-3`}>
        <ShieldIcon size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
        <p className="text-[14px] leading-relaxed text-slate-800">
          QADAM has no user accounts on a server. Everything you enter is stored in your browser's local storage on
          this device. Your CV and profile are <strong>not</strong> sent to AI models. The AI scan that finds
          opportunities reads public web pages only.
        </p>
      </div>

      <section className={`${card} space-y-3`}>
        <h2 className="text-[17px] font-bold text-indigo-950">Saved on this device</h2>
        <ul className="space-y-2.5">
          {STORED_LOCALLY.map(([title, text]) => (
            <li key={title} className="flex items-start gap-2.5">
              <CheckIcon size={15} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="text-[13px] leading-relaxed">
                <strong className="text-slate-900">{title}.</strong> <span className="text-slate-600">{text}</span>
              </div>
            </li>
          ))}
        </ul>
        <p className="text-[12px] text-slate-500 leading-relaxed pt-1">
          Anyone who uses this browser profile can see this data. On a shared computer, log out when you finish.
        </p>
      </section>

      <section className={`${card} space-y-3`}>
        <h2 className="text-[17px] font-bold text-indigo-950">What leaves your device</h2>
        <ul className="space-y-2.5">
          {SENT.map(([title, text]) => (
            <li key={title} className="text-[13px] leading-relaxed">
              <strong className="text-slate-900">{title}.</strong> <span className="text-slate-600">{text}</span>
            </li>
          ))}
        </ul>
        <p className="text-[13px] text-slate-700 leading-relaxed pt-1">
          QADAM does not use analytics or advertising trackers and does not sell or share your data.
        </p>
      </section>

      <section className={`${card} space-y-3`}>
        <h2 className="text-[17px] font-bold text-indigo-950">How to delete your data</h2>
        <ol className="space-y-2 text-[13px] text-slate-700 leading-relaxed list-decimal pl-5">
          <li>
            <strong>Settings → Reset Local Data</strong> erases your profile, CV, memory, teammates and chats.
          </li>
          <li>
            <strong>Log Out</strong> does the same and returns you to the start page.
          </li>
          <li>Clearing this site's data in your browser settings also removes everything.</li>
        </ol>
        <p className="text-[12px] text-slate-500">Deleted data cannot be recovered, because no copy exists anywhere else.</p>
      </section>

      <section className={`${card} flex items-start gap-3`}>
        <AlertTriangleIcon size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-[13px] text-slate-700 leading-relaxed">
          <strong className="text-slate-900">Questions or a privacy concern?</strong> Write to{' '}
          <a href="mailto:a.nagiyev.dev@gmail.com" className="text-emerald-700 font-semibold hover:underline">
            a.nagiyev.dev@gmail.com
          </a>
          . If QADAM starts storing data on a server in the future, this page will be updated before that change
          goes live.
        </div>
      </section>
    </div>
  );
};

export default PrivacyPage;
