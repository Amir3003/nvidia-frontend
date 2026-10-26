import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { isProfileValid } from '../../db/userProfile';
import { legal } from '../../lib/legal';
import { CookieSettingsButton } from './Consent';

export const legalCard =
  'p-6 rounded-card bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl border border-teal-300/40 shadow-[0_16px_40px_-12px_rgba(6,182,212,0.18)] text-slate-900';

// One titled card of a legal page. Body text uses the same sizes on every page.
export const LegalSection: React.FC<{ id?: string; title: string; children: React.ReactNode }> = ({ id, title, children }) => (
  <section id={id} className={`${legalCard} space-y-3 scroll-mt-6 text-[13px] leading-relaxed text-slate-700`}>
    <h2 className="text-[17px] font-bold text-indigo-950">{title}</h2>
    {children}
  </section>
);

const footerLink = 'h-10 inline-flex items-center hover:text-white transition-colors';

export const LegalLinks: React.FC = () => (
  <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-5 gap-y-1 text-mini font-mono text-teal-200/80">
    <Link to="/privacy" className={footerLink}>Privacy</Link>
    <Link to="/terms" className={footerLink}>Terms</Link>
    <Link to="/refund" className={footerLink}>Refunds</Link>
    <Link to="/privacy#data-request" className={footerLink}>Data request</Link>
    <CookieSettingsButton className={footerLink} />
  </nav>
);

export const OperatorBlock: React.FC = () => (
  <div className={`${legalCard} text-[13px] leading-relaxed text-slate-700`}>
    <p className="text-mini font-mono uppercase tracking-wider text-teal-700 mb-1">Operator</p>
    <p className="font-semibold text-slate-900">{legal.operator}</p>
    {legal.address ? <p>{legal.address}</p> : null}
    {legal.registrationId ? <p>Registration number: {legal.registrationId}</p> : null}
    <p>
      Contact:{' '}
      <a href={`mailto:${legal.contactEmail}`} className="text-emerald-700 font-semibold hover:underline">
        {legal.contactEmail}
      </a>
    </p>
  </div>
);

export const LegalShell: React.FC<{ title: string; intro?: string; children: React.ReactNode }> = ({ title, intro, children }) => {
  const navigate = useNavigate();
  const { userProfile } = useApp();
  const signedIn = isProfileValid(userProfile);

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
        <span className="text-mini font-mono text-teal-300/80">Last updated: {legal.lastUpdated}</span>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{title}</h1>
        {intro ? <p className="text-[14px] text-teal-100/80 mt-2 leading-relaxed">{intro}</p> : null}
      </div>

      {children}

      <footer className="pt-2 border-t border-teal-500/20">
        <LegalLinks />
        <p className="text-mini font-mono text-teal-300/60 mt-1">
          © 2026 {legal.operator}
          {legal.address ? `, ${legal.address}` : ''}
        </p>
      </footer>
    </div>
  );
};
