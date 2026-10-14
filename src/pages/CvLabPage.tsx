import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/PageHeader';
import { OPPORTUNITIES_DATABASE, Opportunity } from '../db/opportunities';
import {
  ExternalLinkIcon,
  CheckIcon,
  FlaskIcon,
  FileTextIcon,
  UserIcon,
  CompanyBadgeIcon,
  ChevronDownIcon,
  ShieldIcon,
  TechIcon,
} from '../components/Icons';

export const CvLabPage: React.FC = () => {
  const { skills, openSkillQuiz, userProfile, setIsOnboardingOpen } = useApp();

  // Benchmark target selection state
  const [targetOppId, setTargetOppId] = useState<string>('nebius-nvidia-hackathon');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOpp = OPPORTUNITIES_DATABASE.find((o) => o.id === targetOppId) || OPPORTUNITIES_DATABASE[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if user has initialized their profile
  const isProfileReady =
    userProfile.isOnboarded &&
    (Boolean(userProfile.name?.trim()) || (userProfile.skills && userProfile.skills.length > 0));

  const verifiedCount = skills.filter((s) => s.status === 'VERIFIED').length;
  const userSkills = userProfile.skills || [];

  // Required skills based on selected benchmark opportunity or default set
  const requiredTargetSkills = selectedOpp
    ? selectedOpp.skills
    : ['Python', 'Docker', 'PyTorch', 'Vector DBs'];

  // Categorize candidate skills against required target skills
  const matchedTargetSkills = requiredTargetSkills.filter((req) =>
    userSkills.some((us) => us.toLowerCase() === req.toLowerCase())
  );

  const missingTargetSkills = requiredTargetSkills.filter(
    (req) => !userSkills.some((us) => us.toLowerCase() === req.toLowerCase())
  );

  // Dynamic target match percentage
  const targetMatchRatio =
    requiredTargetSkills.length > 0
      ? matchedTargetSkills.length / requiredTargetSkills.length
      : 1;

  // Genuine dynamic sub-metrics calculation based on user data and reactive target alignment
  const hasName = Boolean(userProfile.name?.trim());
  const hasEdu = Boolean(userProfile.university?.trim());
  const hasContact = Boolean(userProfile.email?.trim() || userProfile.phone?.trim());
  const structureScore = isProfileReady
    ? Math.round((hasName ? 35 : 0) + (hasEdu ? 35 : 0) + (hasContact ? 30 : 0))
    : 0;

  const hasGoals = (userProfile.goals?.length || 0) > 0;
  const hasProjects = Boolean(userProfile.cvText?.trim());

  const verifiedTargetCount = matchedTargetSkills.filter((req) =>
    skills.some((s) => s.name.toLowerCase() === req.toLowerCase() && s.status === 'VERIFIED')
  ).length;

  const impactScore = isProfileReady
    ? Math.min(
        100,
        Math.round(
          (hasGoals ? 25 : 10) +
            (hasProjects ? 35 : 15) +
            verifiedCount * 8 +
            verifiedTargetCount * 15
        )
      )
    : 0;

  // Keywords ATS Match Score reactively calculated against selected target opportunity
  const targetKeywordsPercentage = Math.round(targetMatchRatio * 65);
  const baselineKeywordsBonus = Math.min(35, userSkills.length * 5 + verifiedCount * 8);
  const keywordsScore = isProfileReady
    ? Math.min(100, targetKeywordsPercentage + baselineKeywordsBonus)
    : 0;

  // Final Composite ATS Health Score: Weighted combination of Structure (25%), Impact (35%), and Target Alignment (40%)
  const currentHealthScore = isProfileReady
    ? Math.min(100, Math.round(structureScore * 0.25 + impactScore * 0.35 + keywordsScore * 0.4))
    : 0;

  const fullName = userProfile.name
    ? `${userProfile.name} ${userProfile.surname || ''}`.trim()
    : 'Anonymous Candidate';

  const sanitizedNameForFile = userProfile.name
    ? `${userProfile.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_resume.pdf`
    : 'candidate_resume.pdf';

  const pdfFilename = userProfile.resumeFileName || sanitizedNameForFile;

  // Prioritize skills matching the selected benchmark opportunity
  const prioritizedSkills = [...skills].sort((a, b) => {
    const aIsTarget = requiredTargetSkills.some((req) => req.toLowerCase() === a.name.toLowerCase());
    const bIsTarget = requiredTargetSkills.some((req) => req.toLowerCase() === b.name.toLowerCase());
    if (aIsTarget && !bIsTarget) return -1;
    if (!aIsTarget && bIsTarget) return 1;

    const aIsMissing = missingTargetSkills.some((m) => m.toLowerCase() === a.name.toLowerCase());
    const bIsMissing = missingTargetSkills.some((m) => m.toLowerCase() === b.name.toLowerCase());
    if (aIsMissing && !bIsMissing) return -1;
    if (!aIsMissing && bIsMissing) return 1;

    return 0;
  });

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-transparent relative z-10 text-slate-100">
      {/* Page Header with Custom Sleek Target Selector */}
      <PageHeader
        title="CV & Skill Lab"
        subtitle={
          isProfileReady
            ? `benchmark target: ${selectedOpp ? selectedOpp.title : 'General Profile Readiness'} · candidate: ${fullName}`
            : 'gap analysis uninitialized · complete candidate profile in Settings'
        }
        actions={
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="h-10 px-3.5 bg-slate-900/80 hover:bg-slate-800/80 border border-teal-500/30 hover:border-teal-400 rounded-btn text-mini font-mono text-teal-100 flex items-center gap-2.5 transition-colors cursor-pointer shadow-sm"
            >
              <CompanyBadgeIcon orgKey={selectedOpp.orgKey} size={15} />
              <div className="flex flex-col text-left max-w-[200px] sm:max-w-xs truncate">
                <span className="text-[10px] text-teal-300 uppercase tracking-wider leading-none">
                  Target Benchmark
                </span>
                <span className="text-[12px] font-semibold text-white truncate mt-0.5">
                  {selectedOpp.title}
                </span>
              </div>
              <ChevronDownIcon size={14} className={`text-teal-300 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Custom Sleek Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-card bg-gradient-to-br from-[#EDF7F6] via-[#F3F6FF] to-[#E8F4F8] border border-teal-300 shadow-2xl py-1 z-40 max-h-80 overflow-y-auto text-slate-900">
                <div className="px-3 py-2 border-b border-teal-200/60 text-[11px] font-mono uppercase text-teal-800 font-semibold">
                  Select Benchmark Target Opportunity
                </div>
                {OPPORTUNITIES_DATABASE.map((opp) => {
                  const isSelected = opp.id === targetOppId;
                  return (
                    <button
                      key={opp.id}
                      type="button"
                      onClick={() => {
                        setTargetOppId(opp.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-100/70 text-indigo-950 font-bold'
                          : 'hover:bg-white/80 text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CompanyBadgeIcon orgKey={opp.orgKey} size={16} className="flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[13px] font-semibold truncate">{opp.title}</div>
                          <div className="text-mini font-mono text-teal-800 truncate">{opp.organization} · {opp.type}</div>
                        </div>
                      </div>
                      {isSelected && <CheckIcon size={14} className="text-emerald-600 flex-shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {/* ROW 1 (100% Full Width): CV Health Score Card */}
        <div className="p-6 rounded-card bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl border border-teal-300/40 shadow-[0_16px_40px_-12px_rgba(6,182,212,0.18)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-mini font-mono uppercase tracking-wider text-teal-800 font-semibold">
                ATS CV Health Score & Target Benchmark Alignment
              </div>
              <div className="flex items-baseline gap-3 mt-1">
                <div className="text-[32px] font-mono font-bold text-indigo-950 leading-none">
                  {isProfileReady ? `${currentHealthScore}/100` : '0 / 100'}
                </div>
                <span className="text-[13px] text-teal-900 font-mono">
                  Target: <strong className="text-indigo-950 font-bold">{selectedOpp.title}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-mini font-mono px-3 py-1 rounded-btn bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                {Math.round(targetMatchRatio * 100)}% BENCHMARK FIT
              </span>
              {isProfileReady ? (
                <span className="text-mini font-mono px-3 py-1 rounded-btn bg-white/90 text-teal-900 border border-teal-200 font-semibold">
                  ATS OPTIMIZED
                </span>
              ) : (
                <span className="text-mini font-mono px-3 py-1 rounded-btn bg-white/60 text-slate-400 border border-teal-200 font-medium">
                  PENDING PROFILE
                </span>
              )}
            </div>
          </div>

          {/* Full-Width Progress Bar */}
          <div className="w-full h-2.5 bg-white/80 rounded-full overflow-hidden border border-teal-200/80">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 rounded-full"
              style={{ width: `${currentHealthScore}%` }}
            />
          </div>

          {/* Sub-Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-teal-200/60 text-mini font-mono">
            <div>
              <span className="text-teal-800">Structure Completeness</span>
              <div className="text-[16px] text-indigo-950 font-bold mt-0.5">
                {isProfileReady ? `${structureScore}%` : '0%'}
              </div>
              <div className="text-[11px] text-teal-700 mt-0.5">Identity, Edu & Contact</div>
            </div>

            <div>
              <span className="text-teal-800">Domain Impact</span>
              <div className="text-[16px] text-indigo-950 font-bold mt-0.5">
                {isProfileReady ? `${impactScore}%` : '0%'}
              </div>
              <div className="text-[11px] text-teal-700 mt-0.5">Highlights & Verified Tests</div>
            </div>

            <div>
              <span className="text-teal-800">Target Keywords Fit</span>
              <div className="text-[16px] text-indigo-950 font-bold mt-0.5">
                {isProfileReady ? `${keywordsScore}%` : '0%'}
              </div>
              <div className="text-[11px] text-teal-700 mt-0.5">{matchedTargetSkills.length}/{requiredTargetSkills.length} required keywords</div>
            </div>

            <div>
              <span className="text-teal-800">Verified Competencies</span>
              <div className="text-[16px] text-emerald-700 font-bold mt-0.5">
                {isProfileReady ? `${verifiedCount} Skills Verified` : '0'}
              </div>
              <div className="text-[11px] text-teal-700 mt-0.5">&gt;70% quiz scores</div>
            </div>
          </div>
        </div>

        {/* ROW 2 (Symmetrical 2-Column Split: grid-cols-1 lg:grid-cols-2 gap-6) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* LEFT COLUMN: CV Document Preview */}
          <div className="rounded-card bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl border border-teal-300/40 shadow-[0_16px_40px_-12px_rgba(6,182,212,0.18)] overflow-hidden flex flex-col justify-between">
            {/* Header pill */}
            <div className="px-5 py-3 border-b border-teal-200/80 bg-white/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileTextIcon size={14} className="text-emerald-600" />
                <span className="text-mini font-mono text-indigo-950 font-bold">
                  {pdfFilename}
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white border border-teal-200 text-teal-800 font-semibold">
                Candidate ATS Document
              </span>
            </div>

            {/* Rendered CV Body */}
            {!isProfileReady ? (
              <div className="p-10 text-center space-y-4 flex-1 flex flex-col justify-center items-center text-teal-900">
                <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-300 mx-auto flex items-center justify-center text-emerald-700">
                  <FileTextIcon size={20} />
                </div>
                <div className="text-subheading text-indigo-950 font-bold">No Resume Registered</div>
                <p className="text-[13px] text-teal-950 max-w-sm leading-relaxed">
                  Complete your profile and technical stack in Settings to generate ATS resume analysis and skill recommendations.
                </p>
                <div className="pt-2 flex items-center justify-center gap-2.5">
                  <Link
                    to="/account?tab=profile"
                    className="h-9 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-btn text-mini font-mono flex items-center gap-1.5 transition-colors shadow-xs font-semibold"
                  >
                    <UserIcon size={13} />
                    <span>Configure Profile</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsOnboardingOpen(true)}
                    className="h-9 px-4 bg-white hover:bg-slate-50 border border-teal-200 text-teal-950 rounded-btn text-mini font-mono transition-colors cursor-pointer font-semibold"
                  >
                    Setup Account
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-5 flex-1 flex flex-col justify-between bg-white/70">
                {/* Header */}
                <div className="border-b border-teal-200/60 pb-4">
                  <h3 className="text-[22px] font-bold text-indigo-950 tracking-tight font-sans">
                    {fullName}
                  </h3>
                  <div className="text-mini font-mono text-teal-900 mt-1 leading-relaxed">
                    {userProfile.location || 'Local'} · {userProfile.email || 'student@university.edu'}{' '}
                    {userProfile.phone ? `· ${userProfile.phone}` : ''}
                  </div>
                  {(userProfile.github || userProfile.linkedin) && (
                    <div className="text-mini font-mono text-teal-700 mt-0.5">
                      {userProfile.github ? `${userProfile.github} ` : ''}
                      {userProfile.linkedin ? `· ${userProfile.linkedin}` : ''}
                    </div>
                  )}
                </div>

                {/* Section: Skills */}
                <div className="space-y-2">
                  <div className="text-mini font-mono uppercase text-teal-800 font-semibold tracking-wider border-b border-teal-200/60 pb-1">
                    Skills & Tooling
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {userSkills.length > 0 ? (
                      userSkills.map((skill) => {
                        const isVerified = skills.some(
                          (s) => s.name.toLowerCase() === skill.toLowerCase() && s.status === 'VERIFIED'
                        );
                        return (
                          <span
                            key={skill}
                            className={`px-2 py-0.5 rounded text-mini font-mono border ${
                              isVerified
                                ? 'bg-emerald-100 text-emerald-800 font-bold border-emerald-300'
                                : 'bg-white text-teal-950 border-teal-200'
                            }`}
                          >
                            {skill} {isVerified ? '✓' : ''}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-teal-700 italic text-[12px]">No skills added yet</span>
                    )}
                  </div>
                </div>

                {/* Section: Highlights */}
                <div className="space-y-2">
                  <div className="text-mini font-mono uppercase text-teal-800 font-semibold tracking-wider border-b border-teal-200/60 pb-1">
                    Resume Highlights & Projects
                  </div>
                  <div className="text-[12px] text-teal-950 font-mono leading-relaxed max-h-36 overflow-y-auto">
                    {userProfile.cvText ? (
                      <p className="whitespace-pre-line text-indigo-950 font-medium">{userProfile.cvText}</p>
                    ) : userProfile.goals && userProfile.goals.length > 0 ? (
                      <ul className="space-y-1">
                        {userProfile.goals.map((g) => (
                          <li key={g} className="flex items-center gap-1.5">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span className="text-teal-950">Target Focus: {g}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="italic text-teal-700">No project bullets registered. Configure in Profile Settings.</p>
                    )}
                  </div>
                </div>

                {/* Section: Education */}
                <div className="space-y-1.5 pt-2 border-t border-teal-200/60">
                  <div className="text-mini font-mono uppercase text-teal-800 font-semibold tracking-wider">
                    Education & Track
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <div>
                      <div className="font-bold text-indigo-950">
                        {userProfile.university || 'University not specified'}
                      </div>
                      <div className="text-teal-800 text-[12px]">
                        {userProfile.degree || userProfile.major || userProfile.role}
                      </div>
                    </div>
                    <div className="text-mini font-mono text-teal-700 font-medium">
                      {userProfile.years || '2023 - 2027'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Stacked Symmetrical Cards (Strengths, Benchmark Gaps, ATS Readiness) */}
          <div className="space-y-4 flex flex-col justify-between">
            {/* 1. Strengths Card (Mint-Emerald Tint) */}
            <div className="p-5 rounded-card bg-gradient-to-br from-emerald-50 to-teal-100/80 border border-emerald-300/60 text-emerald-950 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shadow-2xs" />
                  <span className="text-subheading text-emerald-950 text-[15px] font-bold">Target Strengths</span>
                </div>
                <span className="text-mini font-mono text-emerald-800 font-bold">
                  {matchedTargetSkills.length} matches
                </span>
              </div>
              <ul className="space-y-1.5 text-[13px] text-emerald-950">
                {isProfileReady ? (
                  <>
                    {matchedTargetSkills.length > 0 && (
                      <li className="flex items-center gap-2">
                        <span className="text-emerald-700 font-mono text-[11px]">•</span>
                        <span>Matches target prerequisites: <strong className="text-indigo-950">{matchedTargetSkills.join(', ')}</strong></span>
                      </li>
                    )}
                    {userProfile.university && (
                      <li className="flex items-center gap-2">
                        <span className="text-emerald-700 font-mono text-[11px]">•</span>
                        <span>Academic standing: <strong className="text-indigo-950">{userProfile.university}</strong></span>
                      </li>
                    )}
                    {verifiedCount > 0 && (
                      <li className="flex items-center gap-2 text-emerald-800 font-bold">
                        <span className="font-mono text-[11px]">✓</span>
                        <span>{verifiedCount} skill(s) verified via interactive quiz</span>
                      </li>
                    )}
                  </>
                ) : (
                  <li className="text-mini font-mono text-emerald-800 italic">
                    Configure profile to generate verified strengths.
                  </li>
                )}
              </ul>
            </div>

            {/* 2. Benchmark Gaps Card (Warm Amber-Peach Tint) */}
            <div className="p-5 rounded-card bg-gradient-to-br from-amber-50 to-orange-100/80 border border-amber-300/60 text-amber-950 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600 shadow-2xs" />
                  <span className="text-subheading text-amber-950 text-[15px] font-bold">Benchmark Gaps</span>
                </div>
                <span className="text-mini font-mono text-amber-800 font-bold">
                  {missingTargetSkills.length} missing
                </span>
              </div>
              <ul className="space-y-1.5 text-[13px] text-amber-950">
                {isProfileReady ? (
                  <>
                    {missingTargetSkills.length > 0 ? (
                      missingTargetSkills.map((gap) => (
                        <li key={gap} className="flex items-center gap-2">
                          <span className="text-amber-700 font-mono text-[11px]">•</span>
                          <span>Missing competency: <strong className="text-amber-950">{gap}</strong> (Prerequisite for {selectedOpp.title})</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-mini font-mono text-emerald-800 font-bold italic">
                        All target benchmark skills satisfied! Full stack ready.
                      </li>
                    )}
                  </>
                ) : (
                  <li className="text-mini font-mono text-amber-800 italic">
                    Awaiting candidate profile setup.
                  </li>
                )}
              </ul>
            </div>

            {/* 3. Eligibility & ATS Readiness Summary Card (Sky-Cyan Tint) */}
            <div className="p-5 rounded-card bg-gradient-to-br from-sky-50 to-cyan-100/80 border border-sky-300/60 text-sky-950 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldIcon size={16} className="text-sky-700" />
                  <span className="text-subheading text-sky-950 text-[15px] font-bold">Eligibility & ATS Readiness</span>
                </div>
                <span className="text-mini font-mono px-2 py-0.5 rounded bg-sky-200/80 border border-sky-300 text-sky-950 font-bold">
                  Ready to Submit
                </span>
              </div>
              <div className="space-y-2 text-[12px] text-sky-950">
                <div className="flex items-center justify-between font-mono">
                  <span>ATS Format:</span>
                  <span className="text-indigo-950 font-bold">Linear High-Density Standard</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span>Confinement Sandbox:</span>
                  <span className="text-emerald-700 font-bold">/workspace/qadam (LOCKED)</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span>Recommendation:</span>
                  <span className="text-sky-950 font-medium">
                    {missingTargetSkills.length > 0
                      ? `Take quiz for ${missingTargetSkills[0]} below to boost score.`
                      : 'Stack fully matches. Proceed to Application Studio.'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 3 (Vertical Portrait Skill Cards Grid): RECOMMENDED SKILLS TO LEARN */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-teal-200/60 gap-2">
            <div>
              <h3 className="text-mini font-mono uppercase tracking-wider text-teal-800 font-semibold">
                Recommended Skills & Benchmark Curriculum
              </h3>
              <div className="text-[14px] text-indigo-950 font-bold mt-0.5">
                Target Requirements for {selectedOpp.title} ({selectedOpp.organization})
              </div>
            </div>
            <span className="text-mini font-mono px-2.5 py-1 rounded bg-white/80 border border-teal-200 text-teal-900 font-semibold">
              {prioritizedSkills.length} Available Curriculum Tracks
            </span>
          </div>

          {/* Grid of Vertical Portrait Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {prioritizedSkills.map((skill) => {
              const isVerified = skill.status === 'VERIFIED';
              const isMissingTarget = missingTargetSkills.some(
                (m) => m.toLowerCase() === skill.name.toLowerCase()
              );
              const isMatchedTarget = matchedTargetSkills.some(
                (m) => m.toLowerCase() === skill.name.toLowerCase()
              );

              return (
                <div
                  key={skill.id}
                  className={`min-h-[410px] p-5 rounded-card bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl border transition-all flex flex-col justify-between shadow-card hover:shadow-elevated ${
                    isMissingTarget
                      ? 'border-amber-300/90 bg-amber-50/30'
                      : 'border-teal-300/40 hover:border-teal-400'
                  }`}
                >
                  {/* Top: Vector Tech Icon + Title + Badge */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-btn bg-white border border-teal-200 flex items-center justify-center flex-shrink-0 shadow-xs">
                        <TechIcon name={skill.name} size={22} />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
                            isVerified
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : isMissingTarget
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-white text-teal-900 border-teal-200'
                          }`}
                        >
                          {skill.status} {skill.score ? `(${skill.score}%)` : ''}
                        </span>
                        {isMissingTarget && (
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900 font-bold">
                            GAP FOR TARGET
                          </span>
                        )}
                        {isMatchedTarget && (
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-200/80 text-emerald-900 font-bold">
                            BENCHMARK MATCH
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[16px] font-bold text-indigo-950 break-words">
                        {skill.name}
                      </h4>
                    </div>

                    {/* Middle: Clear explanation of target event & sub-topics */}
                    <p className="text-[12px] text-teal-950 leading-relaxed">
                      {isMissingTarget
                        ? `Requested by ${selectedOpp.title} (${selectedOpp.organization}): Requires practical mastery in ${skill.name} internals and benchmark evaluation.`
                        : skill.reason}
                    </p>
                  </div>

                  {/* Bottom: Resource link & Full-width quiz button */}
                  <div className="pt-4 border-t border-teal-200/60 space-y-3">
                    <a
                      href={skill.resourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-mini font-mono text-teal-800 hover:text-indigo-950 flex items-center justify-between group font-medium"
                    >
                      <span className="truncate group-hover:underline">{skill.resourceTitle}</span>
                      <ExternalLinkIcon size={12} className="flex-shrink-0 ml-1.5" />
                    </a>

                    {!isVerified ? (
                      <button
                        type="button"
                        onClick={() => openSkillQuiz(skill)}
                        className="w-full h-11 px-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-btn text-mini font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <FlaskIcon size={14} className="text-white" />
                        <span>Take Skill Quiz (&gt;70%)</span>
                      </button>
                    ) : (
                      <div className="w-full h-11 px-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-btn text-mini font-mono font-bold flex items-center justify-center gap-1.5">
                        <CheckIcon size={14} />
                        <span>Verified in Profile</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CvLabPage;
