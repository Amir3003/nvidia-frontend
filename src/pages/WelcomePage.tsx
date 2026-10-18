import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronRightIcon,
  ShieldIcon,
  RadarIcon,
  CvIcon,
  BellIcon,
  CheckIcon,
  TelegramIcon,
  DiscordIcon,
  KakaoTalkIcon,
  PyTorchIcon,
  DockerIcon,
  LlmIcon,
  LinuxIcon,
} from '../components/Icons';

export const WelcomePage: React.FC = () => {
  const { setIsOnboardingOpen } = useApp();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeStage, setActiveStage] = useState<0 | 1 | 2>(0);

  // High-performance 60fps Scroll-Locked Stage Controller with RAF & re-render debounce
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (sectionRef.current) {
            const rect = sectionRef.current.getBoundingClientRect();
            const scrollableDistance = rect.height - window.innerHeight;
            if (scrollableDistance > 0) {
              const scrolled = -rect.top;
              const ratio = Math.max(0, Math.min(1, scrolled / scrollableDistance));

              let newStage: 0 | 1 | 2 = 0;
              if (ratio < 0.33) {
                newStage = 0;
              } else if (ratio < 0.66) {
                newStage = 1;
              } else {
                newStage = 2;
              }

              setActiveStage((prev) => (prev !== newStage ? newStage : prev));
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToStage = (stage: 0 | 1 | 2) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const currentScrollY = window.scrollY;
    const sectionTop = currentScrollY + rect.top;
    const scrollableDistance = rect.height - window.innerHeight;
    const targetY = sectionTop + (stage * 0.38 + 0.08) * scrollableDistance;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  const handleOpenAuth = () => {
    setIsOnboardingOpen(true);
  };

  // Buttery-Smooth GPU-accelerated 3D Flip Transform Styles (60fps)
  const get3DTransform = (stageIndex: number) => {
    if (stageIndex === activeStage) {
      return 'opacity-100 pointer-events-auto z-20 [transform:translate3d(0,0,0)_rotateX(0deg)_scale(1)]';
    } else if (stageIndex < activeStage) {
      return 'opacity-0 pointer-events-none z-10 [transform:translate3d(0,-48px,0)_rotateX(18deg)_scale(0.92)]';
    } else {
      return 'opacity-0 pointer-events-none z-10 [transform:translate3d(0,48px,0)_rotateX(-18deg)_scale(0.92)]';
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-100 selection:bg-teal-500/20 selection:text-white font-sans antialiased relative">
      {/* Top Daylight Glass Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 px-6 md:px-12 py-4 flex items-center justify-between bg-slate-900/60 backdrop-blur-md border-b border-teal-500/20 shadow-md">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="QADAM Logo" className="w-8 h-8 object-contain rounded-md drop-shadow-sm" />
          <span className="text-[19px] font-mono font-bold tracking-tight text-white">
            QADAM
          </span>
          <span className="text-mini font-mono px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30 font-medium">
            «Қадам»
          </span>
        </div>

        {/* Top-Right Button: ALWAYS Sign In */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenAuth}
            className="h-10 px-5 rounded-btn bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-mini font-mono font-semibold transition-all shadow-md shadow-emerald-900/30 cursor-pointer flex items-center gap-2"
          >
            <span>Sign In</span>
            <ChevronRightIcon size={13} />
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* SCREEN 1: ENLARGED HERO SECTION (Cosmic Pearl & Soft Ivory) */}
      {/* ========================================================= */}
      <section className="min-h-[100dvh] flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-24 pb-16 relative z-10 max-w-5xl mx-auto">
        <div className="space-y-6 sm:space-y-8 flex flex-col items-center">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-teal-500/10 border border-teal-400/30 text-teal-300 text-sm md:text-base font-semibold shadow-lg backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
            <span>AI Opportunity Hub</span>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] font-black tracking-tight text-white drop-shadow-[0_4px_28px_rgba(16,185,129,0.28)] font-sans leading-none break-words">
            QADAM
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-teal-100/90 font-normal leading-relaxed max-w-2xl mx-auto">
            QADAM («Қадам») means "step" in Kazakh. Your direct platform for global academic grants, internships, and AI opportunities.
          </p>

          <div className="pt-4 flex justify-center w-full">
            <button
              type="button"
              onClick={handleOpenAuth}
              className="min-h-[48px] text-base sm:text-lg md:text-xl px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl shadow-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold font-mono active:scale-[0.98] transition-all cursor-pointer shadow-emerald-500/25 flex items-center justify-center gap-3"
            >
              <span>Take Your First Step</span>
              <ChevronRightIcon size={18} />
            </button>
          </div>
        </div>

        {/* Scroll Hint (desktop only to prevent mobile overlap) */}
        <div className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-2 opacity-75 hover:opacity-100 transition-opacity">
          <span className="text-[12px] font-mono tracking-wider text-teal-300 uppercase font-medium">Explore 3 Pillars</span>
          <div className="w-1.5 h-6 rounded-full bg-teal-400/70 animate-bounce" />
        </div>
      </section>

      {/* ========================================================= */}
      {/* MOBILE SHOWCASE VIEW (< lg): Natural Document Flow (No Sticky Trap, No Collision) */}
      {/* ========================================================= */}
      <section className="lg:hidden relative z-10 px-4 py-8 flex flex-col gap-6 max-w-2xl mx-auto">
        <div className="rounded-2xl bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl border border-teal-300/40 shadow-xl p-5 sm:p-6 text-slate-900 flex flex-col gap-5">
          {/* Top Interactive Stage Selector Pills */}
          <div className="flex items-center justify-between border-b border-teal-200/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-mini font-mono font-bold text-teal-950 uppercase tracking-wider">
                Interactive Showcase
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setActiveStage(s as 0 | 1 | 2)}
                  className={`
                    h-8 px-3.5 rounded-xl text-[12px] font-mono font-bold transition-all cursor-pointer active:scale-95
                    ${
                      activeStage === s
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs'
                        : 'bg-white/80 text-teal-800 hover:bg-white border border-teal-200/60'
                    }
                  `}
                >
                  0{s + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Mobile Stage Content with h-auto and zero clipping */}
          {activeStage === 0 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="text-mini font-mono text-emerald-700 uppercase tracking-wider font-semibold">
                  Real-Time Academic Indexing
                </div>
                <h3 className="text-2xl font-mono font-bold text-indigo-950 tracking-tight">
                  01 / ELIGIBILITY RADAR
                </h3>
              </div>

              <div className="space-y-2.5">
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-100/80 border border-emerald-300/60 text-emerald-950 shadow-xs flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[13px] font-bold text-emerald-950 truncate">
                      Nebius x NVIDIA Global AI Hackathon
                    </div>
                    <div className="text-mini font-mono text-emerald-800 mt-0.5">
                      GPU Compute & Multimodal Agents Track · Virtual
                    </div>
                  </div>
                  <span className="text-mini font-mono font-bold text-white bg-emerald-600 px-2.5 py-1 rounded-full flex-shrink-0">
                    94% MATCH
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-gradient-to-br from-sky-50 to-cyan-100/80 border border-sky-300/60 text-sky-950 shadow-xs flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[13px] font-bold text-sky-950 truncate">
                      MEXT Scholarship: Graduate Research in AI
                    </div>
                    <div className="text-mini font-mono text-sky-800 mt-0.5">
                      Full Government Sponsorship · Ministry of Education Japan
                    </div>
                  </div>
                  <span className="text-mini font-mono font-bold text-white bg-sky-600 px-2.5 py-1 rounded-full flex-shrink-0">
                    88% MATCH
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-100/80 border border-amber-300/60 text-amber-950 shadow-xs flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[13px] font-bold text-amber-950 truncate">
                      Physical AI & Robotics Travel Grant
                    </div>
                    <div className="text-mini font-mono text-amber-800 mt-0.5">
                      NeurIPS 2026 Conference Travel · Verified Academic Track
                    </div>
                  </div>
                  <span className="text-mini font-mono font-bold text-white bg-amber-600 px-2.5 py-1 rounded-full flex-shrink-0">
                    91% MATCH
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeStage === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="text-mini font-mono text-indigo-700 uppercase tracking-wider font-semibold">
                  Linear ATS Resume & Benchmark Matrix
                </div>
                <h3 className="text-2xl font-mono font-bold text-indigo-950 tracking-tight">
                  02 / CV & SKILL BENCHMARK
                </h3>
              </div>

              <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-100/80 border border-indigo-300/60 text-indigo-950 shadow-xs flex items-center justify-between">
                <div>
                  <div className="text-mini font-mono text-indigo-700 uppercase font-semibold">CV Health Score</div>
                  <div className="text-2xl font-mono font-bold text-indigo-950 mt-0.5">
                    89 <span className="text-indigo-400 text-sm">/ 100</span>
                    <span className="text-emerald-700 text-mini font-medium font-sans ml-2 px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300">Top Quartile</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-mini font-mono text-indigo-700">Benchmark Fit</div>
                  <div className="text-mini font-mono font-bold text-indigo-900 mt-0.5">4 of 4 Verified</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-mini font-mono">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-100/80 border border-amber-300/60 text-amber-950 text-center flex flex-col items-center">
                  <PyTorchIcon size={20} className="text-amber-700" />
                  <div className="font-bold text-[11px] mt-1">PyTorch: 95%</div>
                </div>
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-50 to-cyan-100/80 border border-sky-300/60 text-sky-950 text-center flex flex-col items-center">
                  <DockerIcon size={20} className="text-sky-700" />
                  <div className="font-bold text-[11px] mt-1">Docker: 90%</div>
                </div>
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-100/80 border border-indigo-300/60 text-indigo-950 text-center flex flex-col items-center">
                  <LlmIcon size={20} className="text-indigo-700" />
                  <div className="font-bold text-[11px] mt-1">LLMs: 92%</div>
                </div>
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-100/80 border border-emerald-300/60 text-emerald-950 text-center flex flex-col items-center">
                  <LinuxIcon size={20} className="text-emerald-700" />
                  <div className="font-bold text-[11px] mt-1">Linux: 88%</div>
                </div>
              </div>
            </div>
          )}

          {activeStage === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="text-mini font-mono text-sky-700 uppercase tracking-wider font-semibold">
                  Multi-Channel Push Notification Bot
                </div>
                <h3 className="text-2xl font-mono font-bold text-indigo-950 tracking-tight">
                  03 / INSTANT MESSENGER BOTS
                </h3>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-gradient-to-br from-sky-50 to-cyan-100/80 border border-sky-300/60 text-sky-950 flex items-start gap-2.5 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center flex-shrink-0">
                    <TelegramIcon size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between text-mini font-mono">
                      <span className="font-bold text-sky-950">@QadamAgentBot</span>
                      <span className="text-sky-700">Just now</span>
                    </div>
                    <p className="text-[12px] text-sky-900 mt-0.5 leading-relaxed">
                      High-compatibility Hackathon detected (94% fit). Registration closes in 3 days. Proposal drafted in /workspace/qadam.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-100/80 border border-indigo-300/60 text-indigo-950 flex items-start gap-2.5 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                    <DiscordIcon size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between text-mini font-mono">
                      <span className="font-bold text-indigo-950">Discord Webhook</span>
                      <span className="text-indigo-700">2m ago</span>
                    </div>
                    <p className="text-[12px] text-indigo-900 mt-0.5 leading-relaxed">
                      New Travel Grant open for CVPR candidates with verified PyTorch credentials.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-100/80 border border-amber-300/60 text-amber-950 flex items-start gap-2.5 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-[#fee500] text-[#3c1e1e] flex items-center justify-center flex-shrink-0">
                    <KakaoTalkIcon size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between text-mini font-mono">
                      <span className="font-bold text-amber-950">KakaoTalk Channel</span>
                      <span className="text-amber-700">12m ago</span>
                    </div>
                    <p className="text-[12px] text-amber-900 mt-0.5 leading-relaxed">
                      Tokyo Institute of Tech Exchange deadline synchronized with your local calendar.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pillar summary description underneath */}
          <div className="pt-3 border-t border-teal-200/80">
            <h4 className="text-[15px] font-bold text-indigo-950">
              {activeStage === 0
                ? 'Verified Eligibility & Matching'
                : activeStage === 1
                ? 'CV Gap Analysis & Team Network'
                : 'Instant Messenger Alerts'}
            </h4>
            <p className="text-[13px] text-teal-950 mt-1 leading-relaxed">
              {activeStage === 0
                ? 'Real-time indexing of global hackathons, research grants, and internships matched against your stack and actual academic eligibility requirements.'
                : activeStage === 1
                ? 'Precision resume benchmarking against target roles, interactive skill verification, and peer discovery for hackathon squads.'
                : 'Direct real-time notifications delivered via Telegram, KakaoTalk, and Discord with client-side privacy filtering.'}
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* DESKTOP SHOWCASE VIEW (lg:block): 60fps 3D Flip Scrollytelling (300vh) */}
      {/* ========================================================= */}
      <section
        ref={sectionRef}
        className="hidden lg:block relative h-[300vh] w-full"
      >
        {/* Sticky Inner Viewport: Fixed height during scroll */}
        <div className="sticky top-0 h-screen w-full flex items-center justify-center z-20 px-6 md:px-12">
          <div className="w-full max-w-[1440px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
            
            {/* LEFT SIDE: 60% Width 3D Flip Container */}
            <div className="w-full lg:w-[60vw] max-w-[920px] [perspective:1400px] [transform-style:preserve-3d] relative h-[56vh] lg:h-[68vh] min-h-[480px]">
              
              {/* STAGE 01 CARD (Left) */}
              <div
                className={`
                  absolute inset-0 rounded-3xl bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl border border-teal-300/40 shadow-[0_20px_50px_-15px_rgba(6,182,212,0.22)] p-6 md:p-10 flex flex-col justify-between overflow-hidden will-change-[transform,opacity] [transform-style:preserve-3d] [backface-visibility:hidden] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
                  ${get3DTransform(0)}
                `}
              >
                {/* Top Interactive Stage Selector Pills */}
                <div className="flex items-center justify-between relative z-10 border-b border-teal-200/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-mini font-mono font-bold text-teal-950 uppercase tracking-wider">
                      Interactive Showcase
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => scrollToStage(s as 0 | 1 | 2)}
                        className={`
                          h-7 px-3.5 rounded-full text-[11px] font-mono font-bold transition-all cursor-pointer
                          ${
                            activeStage === s
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs'
                              : 'bg-white/80 text-teal-800 hover:bg-white border border-teal-200/60'
                          }
                        `}
                      >
                        0{s + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content: Stage 01 Full-Width Live Gradient Rows */}
                <div className="flex-1 flex flex-col justify-center relative z-10 py-4 space-y-4">
                  <div className="space-y-1">
                    <div className="text-mini font-mono text-emerald-700 uppercase tracking-wider font-semibold">
                      Real-Time Academic Indexing
                    </div>
                    <h3 className="text-2xl sm:text-4xl md:text-5xl font-mono font-bold text-indigo-950 tracking-tight">
                      01 / ELIGIBILITY RADAR
                    </h3>
                  </div>

                  <div className="space-y-2.5 max-w-xl">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100/80 border border-emerald-300/60 text-emerald-950 shadow-sm flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-[14px] font-bold text-emerald-950 truncate">
                          Nebius x NVIDIA Global AI Hackathon
                        </div>
                        <div className="text-mini font-mono text-emerald-800 mt-0.5">
                          GPU Compute & Multimodal Agents Track · Virtual
                        </div>
                      </div>
                      <span className="text-mini font-mono font-bold text-white bg-emerald-600 px-3 py-1 rounded-full flex-shrink-0 shadow-xs">
                        94% MATCH
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-cyan-100/80 border border-sky-300/60 text-sky-950 shadow-sm flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-[14px] font-bold text-sky-950 truncate">
                          MEXT Scholarship: Graduate Research in AI
                        </div>
                        <div className="text-mini font-mono text-sky-800 mt-0.5">
                          Full Government Sponsorship · Ministry of Education Japan
                        </div>
                      </div>
                      <span className="text-mini font-mono font-bold text-white bg-sky-600 px-3 py-1 rounded-full flex-shrink-0 shadow-xs">
                        88% MATCH
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100/80 border border-amber-300/60 text-amber-950 shadow-sm flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-[14px] font-bold text-amber-950 truncate">
                          Physical AI & Robotics Travel Grant
                        </div>
                        <div className="text-mini font-mono text-amber-800 mt-0.5">
                          NeurIPS 2026 Conference Travel · Verified Academic Track
                        </div>
                      </div>
                      <span className="text-mini font-mono font-bold text-white bg-amber-600 px-3 py-1 rounded-full flex-shrink-0 shadow-xs">
                        91% MATCH
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Stage Progress Dots */}
                <div className="flex items-center gap-2 pt-3 border-t border-teal-200/80 relative z-10">
                  {[0, 1, 2].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => scrollToStage(s as 0 | 1 | 2)}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        activeStage === s ? 'w-10 bg-emerald-600' : 'w-2 bg-teal-200 hover:bg-teal-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* STAGE 02 CARD (Left) */}
              <div
                className={`
                  absolute inset-0 rounded-3xl bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl border border-teal-300/40 shadow-[0_20px_50px_-15px_rgba(6,182,212,0.22)] p-6 md:p-10 flex flex-col justify-between overflow-hidden will-change-[transform,opacity] [transform-style:preserve-3d] [backface-visibility:hidden] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
                  ${get3DTransform(1)}
                `}
              >
                <div className="flex items-center justify-between relative z-10 border-b border-teal-200/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-mini font-mono font-bold text-teal-950 uppercase tracking-wider">
                      Interactive Showcase
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => scrollToStage(s as 0 | 1 | 2)}
                        className={`
                          h-7 px-3.5 rounded-full text-[11px] font-mono font-bold transition-all cursor-pointer
                          ${
                            activeStage === s
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs'
                              : 'bg-white/80 text-teal-800 hover:bg-white border border-teal-200/60'
                          }
                        `}
                      >
                        0{s + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content: Stage 02 Skill Lab with Vector Icons */}
                <div className="flex-1 flex flex-col justify-center relative z-10 py-4 space-y-4">
                  <div className="space-y-1">
                    <div className="text-mini font-mono text-indigo-700 uppercase tracking-wider font-semibold">
                      Linear ATS Resume & Benchmark Matrix
                    </div>
                    <h3 className="text-2xl sm:text-4xl md:text-5xl font-mono font-bold text-indigo-950 tracking-tight">
                      02 / CV & SKILL BENCHMARK
                    </h3>
                  </div>

                  <div className="space-y-4 max-w-xl">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-100/80 border border-indigo-300/60 text-indigo-950 shadow-sm flex items-center justify-between">
                      <div>
                        <div className="text-mini font-mono text-indigo-700 uppercase font-semibold">CV Health Score</div>
                        <div className="text-3xl font-mono font-bold text-indigo-950 mt-1">
                          89 <span className="text-indigo-400 text-lg">/ 100</span>
                          <span className="text-emerald-700 text-[13px] font-medium font-sans ml-3 px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300">Top Quartile</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-mini font-mono text-indigo-700">Benchmark Fit</div>
                        <div className="text-mini font-mono font-bold text-indigo-900 mt-1">4 of 4 Skills Verified</div>
                      </div>
                    </div>

                    {/* 4 Skill Cards with Vector Icons */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-mini font-mono">
                      <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-100/80 border border-amber-300/60 text-amber-950 text-center flex flex-col items-center gap-1 shadow-2xs">
                        <PyTorchIcon size={22} className="text-amber-700" />
                        <div className="font-bold text-[12px] mt-0.5">PyTorch</div>
                        <div className="text-amber-700 text-[11px]">Score: 95%</div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-gradient-to-br from-sky-50 to-cyan-100/80 border border-sky-300/60 text-sky-950 text-center flex flex-col items-center gap-1 shadow-2xs">
                        <DockerIcon size={22} className="text-sky-700" />
                        <div className="font-bold text-[12px] mt-0.5">Docker</div>
                        <div className="text-sky-700 text-[11px]">Score: 90%</div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-100/80 border border-indigo-300/60 text-indigo-950 text-center flex flex-col items-center gap-1 shadow-2xs">
                        <LlmIcon size={22} className="text-indigo-700" />
                        <div className="font-bold text-[12px] mt-0.5">LLMs</div>
                        <div className="text-indigo-700 text-[11px]">Score: 92%</div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-100/80 border border-emerald-300/60 text-emerald-950 text-center flex flex-col items-center gap-1 shadow-2xs">
                        <LinuxIcon size={22} className="text-emerald-700" />
                        <div className="font-bold text-[12px] mt-0.5">Linux</div>
                        <div className="text-emerald-700 text-[11px]">Score: 88%</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Stage Progress Dots */}
                <div className="flex items-center gap-2 pt-3 border-t border-teal-200/80 relative z-10">
                  {[0, 1, 2].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => scrollToStage(s as 0 | 1 | 2)}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        activeStage === s ? 'w-10 bg-emerald-600' : 'w-2 bg-teal-200 hover:bg-teal-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* STAGE 03 CARD (Left) */}
              <div
                className={`
                  absolute inset-0 rounded-3xl bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl border border-teal-300/40 shadow-[0_20px_50px_-15px_rgba(6,182,212,0.22)] p-6 md:p-10 flex flex-col justify-between overflow-hidden will-change-[transform,opacity] [transform-style:preserve-3d] [backface-visibility:hidden] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
                  ${get3DTransform(2)}
                `}
              >
                <div className="flex items-center justify-between relative z-10 border-b border-teal-200/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-mini font-mono font-bold text-teal-950 uppercase tracking-wider">
                      Interactive Showcase
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => scrollToStage(s as 0 | 1 | 2)}
                        className={`
                          h-7 px-3.5 rounded-full text-[11px] font-mono font-bold transition-all cursor-pointer
                          ${
                            activeStage === s
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs'
                              : 'bg-white/80 text-teal-800 hover:bg-white border border-teal-200/60'
                          }
                        `}
                      >
                        0{s + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content: Stage 03 Push Bot Messages with SVG Icons */}
                <div className="flex-1 flex flex-col justify-center relative z-10 py-4 space-y-4">
                  <div className="space-y-1">
                    <div className="text-mini font-mono text-sky-700 uppercase tracking-wider font-semibold">
                      Multi-Channel Push Notification Bot
                    </div>
                    <h3 className="text-2xl sm:text-4xl md:text-5xl font-mono font-bold text-indigo-950 tracking-tight">
                      03 / INSTANT MESSENGER BOTS
                    </h3>
                  </div>

                  <div className="space-y-3 max-w-xl">
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-50 to-cyan-100/80 border border-sky-300/60 text-sky-950 flex items-start gap-3 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        <TelegramIcon size={22} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center justify-between text-mini font-mono">
                          <span className="font-bold text-sky-950">@QadamAgentBot</span>
                          <span className="text-sky-700">Just now</span>
                        </div>
                        <p className="text-[13px] text-sky-900 mt-1 leading-relaxed">
                          High-compatibility Hackathon detected (94% fit). Registration closes in 3 days. Proposal drafted in /workspace/qadam.
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-100/80 border border-indigo-300/60 text-indigo-950 flex items-start gap-3 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        <DiscordIcon size={22} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center justify-between text-mini font-mono">
                          <span className="font-bold text-indigo-950">Discord Webhook · Squad Channel</span>
                          <span className="text-indigo-700">2m ago</span>
                        </div>
                        <p className="text-[13px] text-indigo-900 mt-1 leading-relaxed">
                          New Travel Grant open for CVPR candidates with verified PyTorch credentials.
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-100/80 border border-amber-300/60 text-amber-950 flex items-start gap-3 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-[#fee500] text-[#3c1e1e] flex items-center justify-center flex-shrink-0 shadow-sm">
                        <KakaoTalkIcon size={22} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center justify-between text-mini font-mono">
                          <span className="font-bold text-amber-950">KakaoTalk Channel · QADAM</span>
                          <span className="text-amber-700">12m ago</span>
                        </div>
                        <p className="text-[13px] text-amber-900 mt-1 leading-relaxed">
                          Tokyo Institute of Tech Exchange deadline synchronized with your local calendar.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Stage Progress Dots */}
                <div className="flex items-center gap-2 pt-3 border-t border-teal-200/80 relative z-10">
                  {[0, 1, 2].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => scrollToStage(s as 0 | 1 | 2)}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        activeStage === s ? 'w-10 bg-emerald-600' : 'w-2 bg-teal-200 hover:bg-teal-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT SIDE: 40% Width 3D Flip Container (No "Get Started" Footer Block) */}
            <div className="w-full lg:flex-1 [perspective:1400px] [transform-style:preserve-3d] relative h-[44vh] lg:h-[68vh] min-h-[380px]">
              
              {/* PILLAR 01 CARD (Right) */}
              <div
                className={`
                  absolute inset-0 rounded-3xl bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl p-8 md:p-12 border border-teal-300/40 shadow-[0_16px_40px_-12px_rgba(6,182,212,0.18)] flex flex-col justify-center will-change-[transform,opacity] [transform-style:preserve-3d] [backface-visibility:hidden] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
                  ${get3DTransform(0)}
                `}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-mini font-mono text-teal-800">
                    <span className="text-emerald-700 font-bold">PILLAR 01</span>
                    <span>/ 03</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-indigo-950 leading-tight font-sans">
                    Verified Eligibility & Matching
                  </h2>
                  <p className="text-[15px] md:text-[16px] text-teal-950 leading-relaxed">
                    Real-time indexing of global hackathons, research grants, and internships matched against your stack and actual academic eligibility requirements.
                  </p>
                  <ul className="space-y-2.5 pt-2 text-[13px] text-teal-900 font-mono">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>Zero scrapers: verified sponsors & funding</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>Automated academic deadline calculation</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* PILLAR 02 CARD (Right) */}
              <div
                className={`
                  absolute inset-0 rounded-3xl bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl p-8 md:p-12 border border-teal-300/40 shadow-[0_16px_40px_-12px_rgba(6,182,212,0.18)] flex flex-col justify-center will-change-[transform,opacity] [transform-style:preserve-3d] [backface-visibility:hidden] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
                  ${get3DTransform(1)}
                `}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-mini font-mono text-teal-800">
                    <span className="text-indigo-700 font-bold">PILLAR 02</span>
                    <span>/ 03</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-indigo-950 leading-tight font-sans">
                    CV Gap Analysis & Team Network
                  </h2>
                  <p className="text-[15px] md:text-[16px] text-teal-950 leading-relaxed">
                    Precision resume benchmarking against target roles, interactive skill verification, and peer discovery for hackathon squads.
                  </p>
                  <ul className="space-y-2.5 pt-2 text-[13px] text-teal-900 font-mono">
                    <li className="flex items-center gap-2">
                      <span className="text-indigo-600 font-bold">✓</span>
                      <span>ATS linear density compatibility checks</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-indigo-600 font-bold">✓</span>
                      <span>Interactive 5-question Skill Lab tests</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* PILLAR 03 CARD (Right) */}
              <div
                className={`
                  absolute inset-0 rounded-3xl bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl p-8 md:p-12 border border-teal-300/40 shadow-[0_16px_40px_-12px_rgba(6,182,212,0.18)] flex flex-col justify-center will-change-[transform,opacity] [transform-style:preserve-3d] [backface-visibility:hidden] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
                  ${get3DTransform(2)}
                `}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-mini font-mono text-teal-800">
                    <span className="text-sky-700 font-bold">PILLAR 03</span>
                    <span>/ 03</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-indigo-950 leading-tight font-sans">
                    Instant Messenger Alerts
                  </h2>
                  <p className="text-[15px] md:text-[16px] text-teal-950 leading-relaxed">
                    Direct real-time notifications delivered via Telegram, KakaoTalk, and Discord with server-side privacy filtering.
                  </p>
                  <ul className="space-y-2.5 pt-2 text-[13px] text-teal-900 font-mono">
                    <li className="flex items-center gap-2">
                      <span className="text-sky-600 font-bold">✓</span>
                      <span>Direct phone notifications for upcoming deadlines</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-sky-600 font-bold">✓</span>
                      <span>Zero PII leakage during webhook transmission</span>
                    </li>
                  </ul>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* MINIMAL COSMIC FOOTER */}
      {/* ========================================================= */}
      <footer className="border-t border-teal-500/20 py-8 px-6 md:px-12 bg-slate-950/60 backdrop-blur-md relative z-10 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-mini font-mono text-teal-200/80">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="QADAM Logo" className="w-5 h-5 object-contain" />
            <span className="text-white font-bold">QADAM («Қадам»)</span>
            <span className="hidden md:inline text-teal-300/60">. Your direct platform for global academic grants and AI opportunities.</span>
            <span>© 2026. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={handleOpenAuth}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Platform Access
            </button>
            <span className="text-teal-500/40">·</span>
            <span>Client Privacy Protection</span>
            <span className="text-teal-500/40">·</span>
            <span>Local OpenShell Confinement</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;
