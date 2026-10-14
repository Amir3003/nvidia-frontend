import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { isProfileValid } from '../db/userProfile';
import {
  ChevronRightIcon,
  ShieldIcon,
  RadarIcon,
  FileTextIcon,
  BellIcon,
} from '../components/Icons';

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, setIsOnboardingOpen } = useApp();
  const hasValidProfile = isProfileValid(userProfile);

  const handleTakeStep = () => {
    if (hasValidProfile) {
      navigate('/');
    } else {
      setIsOnboardingOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col justify-between selection:bg-accent/20 selection:text-text font-sans">
      {/* Minimal Top Brand Bar */}
      <header className="px-6 md:px-12 py-6 flex items-center justify-between border-b border-border/60">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-sm bg-accent rotate-45 inline-block" />
          <span className="text-[17px] font-mono font-bold tracking-tight text-text">
            QADAM
          </span>
          <span className="text-mini font-mono px-2 py-0.5 rounded border border-border text-muted-2">
            «Қадам»
          </span>
        </div>

        <div className="flex items-center gap-3">
          {hasValidProfile ? (
            <button
              type="button"
              onClick={() => navigate('/')}
              className="h-9 px-4 rounded-btn border border-border bg-surface hover:bg-surface-hover text-text text-mini font-mono transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Go to Dashboard</span>
              <ChevronRightIcon size={12} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleTakeStep}
              className="h-9 px-4 rounded-btn bg-accent hover:bg-emerald-500 text-zinc-950 font-semibold text-mini font-mono transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>Register</span>
              <ChevronRightIcon size={12} />
            </button>
          )}
        </div>
      </header>

      {/* Main Hero & Pillars */}
      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24 flex-1 flex flex-col justify-center">
        {/* Typographic Hero */}
        <div className="space-y-5 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-mini font-mono text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span>Sovereign AI Career & Opportunity Agent</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-50 font-sans">
            QADAM
          </h1>

          <p className="text-[17px] md:text-[19px] text-zinc-400 font-normal leading-relaxed max-w-2xl">
            From Kazakh: <span className="text-zinc-200 font-medium">«Қадам» (Step)</span> — Your decisive step toward global hackathons, research grants, and engineering careers.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3.5">
            <button
              type="button"
              onClick={handleTakeStep}
              className="w-full sm:w-auto h-12 px-7 rounded-btn bg-accent hover:bg-emerald-500 text-zinc-950 font-semibold text-[14px] font-mono transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-emerald-950/40"
            >
              <span>Take Your First Step</span>
              <ChevronRightIcon size={16} />
            </button>

            {hasValidProfile && (
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full sm:w-auto h-12 px-6 rounded-btn border border-border bg-surface hover:bg-surface-hover text-zinc-200 text-[13px] font-mono transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RadarIcon size={16} />
                <span>Enter Opportunity Radar</span>
              </button>
            )}
          </div>
        </div>

        {/* Ultra-concise 3-Pillar Summary */}
        <div className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Pillar 1 */}
          <div className="p-6 rounded-card bg-surface border border-border flex flex-col justify-between hover:border-border-strong transition-colors">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-btn bg-zinc-900 border border-border flex items-center justify-center text-accent">
                <RadarIcon size={16} />
              </div>
              <h3 className="text-[15px] font-semibold text-zinc-100">
                Verified Eligibility & Matching
              </h3>
              <p className="text-[13px] text-muted leading-relaxed">
                Real-time indexing of global opportunities matched against your actual stack and academic prerequisites.
              </p>
            </div>
            <div className="pt-4 text-mini font-mono text-zinc-500 uppercase tracking-wider">
              Zero Fake Leads
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-card bg-surface border border-border flex flex-col justify-between hover:border-border-strong transition-colors">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-btn bg-zinc-900 border border-border flex items-center justify-center text-accent">
                <FileTextIcon size={16} />
              </div>
              <h3 className="text-[15px] font-semibold text-zinc-100">
                CV Gap Analysis & Team Network
              </h3>
              <p className="text-[13px] text-muted leading-relaxed">
                Precision resume benchmarking and peer discovery for high-impact collaborative squads.
              </p>
            </div>
            <div className="pt-4 text-mini font-mono text-zinc-500 uppercase tracking-wider">
              ATS Optimized
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-card bg-surface border border-border flex flex-col justify-between hover:border-border-strong transition-colors">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-btn bg-zinc-900 border border-border flex items-center justify-center text-accent">
                <BellIcon size={16} />
              </div>
              <h3 className="text-[15px] font-semibold text-zinc-100">
                Instant Messenger Alerts
              </h3>
              <p className="text-[13px] text-muted leading-relaxed">
                Direct notifications via Telegram, KakaoTalk, and Discord with strict client-side data privacy.
              </p>
            </div>
            <div className="pt-4 text-mini font-mono text-zinc-500 uppercase tracking-wider">
              Multi-Channel Pings
            </div>
          </div>
        </div>
      </main>

      {/* Sovereign Guarantee Footer */}
      <footer className="px-6 md:px-12 py-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-mini font-mono text-muted-2">
        <div className="flex items-center gap-2">
          <ShieldIcon size={13} className="text-accent" />
          <span>Sovereign Local Sandbox Execution · Zero PII Leakage</span>
        </div>
        <div>
          <span>QADAM © 2026 · Built for Nebius & NVIDIA Hackathon</span>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;

