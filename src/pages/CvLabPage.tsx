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

  const currentHealthScore = isProfileReady
    ? Math.min(100, Math.round(structureScore * 0.3 + impactScore * 0.35 + keywordsScore * 0.35))
    : 0;

  const fullName = userProfile.name?.trim()
    ? `${userProfile.name.trim()}${userProfile.surname?.trim() ? ` ${userProfile.surname.trim()}` : ''}`
    : 'Candidate';

  const pdfFilename = `${fullName.replace(/\s+/g, '_')}_CV.pdf`;

  // Sorted skills for Row 3
  const prioritizedSkills = [...skills].sort((a, b) => {
    const aIsMissingTarget = missingTargetSkills.some(
      (m) => m.toLowerCase() === a.name.toLowerCase()
    );
    const bIsMissingTarget = missingTargetSkills.some(
      (m) => m.toLowerCase() === b.name.toLowerCase()
    );
    if (aIsMissingTarget && !bIsMissingTarget) return -1;
    if (!aIsMissingTarget && bIsMissingTarget) return 1;

    const aIsTarget = requiredTargetSkills.some(
      (t) => t.toLowerCase() === a.name.toLowerCase()
    );
    const bIsTarget = requiredTargetSkills.some(
      (t) => t.toLowerCase() === b.name.toLowerCase()
    );
    if (aIsTarget && !bIsTarget) return -1;
    if (!aIsTarget && bIsTarget) return 1;

    return 0;
  });

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-bg text-text">
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
              className="h-10 px-3.5 bg-surface hover:bg-surface-hover border border-border hover:border-zinc-700 rounded-btn text-mini font-mono text-zinc-100 flex items-center gap-2.5 transition-colors cursor-pointer shadow-sm"
            >
              <CompanyBadgeIcon orgKey={selectedOpp.orgKey} size={15} />
              <div className="flex flex-col text-left max-w-[200px] sm:max-w-xs truncate">
                <span className="text-[10px] text-muted-2 uppercase tracking-wider leading-none">
                  Target Benchmark
                </span>
                <span className="text-[12px] font-medium text-zinc-100 truncate mt-0.5">
                  {selectedOpp.title}
                </span>
              </div>
              <ChevronDownIcon size={14} className={`text-muted transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Custom Sleek Dark Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-card bg-[#121215] border border-zinc-700 shadow-2xl py-1 z-40 max-h-80 overflow-y-auto">
                <div className="px-3 py-2 border-b border-border/80 text-[11px] font-mono uppercase text-muted-2">
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
                          ? 'bg-zinc-800/80 text-text font-medium'
                          : 'hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CompanyBadgeIcon orgKey={opp.orgKey} size={16} className="flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[13px] font-medium truncate">{opp.title}</div>
                          <div className="text-mini font-mono text-muted-2 truncate">{opp.organization} · {opp.type}</div>
                        </div>
                      </div>
                      {isSelected && <CheckIcon size={14} className="text-accent flex-shrink-0 ml-2" />}
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
        <div className="p-6 rounded-card bg-surface border border-border space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-mini font-mono uppercase tracking-wider text-muted-2">
                ATS CV Health Score & Target Benchmark Alignment
              </div>
              <div className="flex items-baseline gap-3 mt-1">
                <div className="text-[32px] font-mono font-bold text-text leading-none">
                  {isProfileReady ? `${currentHealthScore}/100` : '— / 100'}
                </div>
                <span className="text-[13px] text-muted font-mono">
                  Target: <strong className="text-zinc-200">{selectedOpp.title}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-mini font-mono px-3 py-1 rounded-btn bg-accent/15 text-accent border border-accent-border font-semibold">
                {Math.round(targetMatchRatio * 100)}% BENCHMARK FIT
              </span>
              {isProfileReady ? (
                <span className="text-mini font-mono px-3 py-1 rounded-btn bg-zinc-900 text-zinc-300 border border-zinc-700">
                  ATS OPTIMIZED
                </span>
              ) : (
                <span className="text-mini font-mono px-3 py-1 rounded-btn bg-zinc-900 text-zinc-500 border border-zinc-800">
                  PENDING PROFILE
                </span>
              )}
            </div>
          </div>

          {/* Full-Width Progress Bar */}
          <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="h-full bg-accent transition-all duration-500 rounded-full"
              style={{ width: `${currentHealthScore}%` }}
            />
          </div>

          {/* Sub-Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-border/60 text-mini font-mono">
            <div>
              <span className="text-muted-2">Structure Completeness</span>
              <div className="text-[15px] text-text font-semibold mt-0.5">
                {isProfileReady ? `${structureScore}%` : '—'}
              </div>
              <div className="text-[11px] text-muted-2 mt-0.5">Identity, Edu & Contact</div>
            </div>

            <div>
              <span className="text-muted-2">Domain Impact</span>
              <div className="text-[15px] text-text font-semibold mt-0.5">
                {isProfileReady ? `${impactScore}%` : '—'}
              </div>
              <div className="text-[11px] text-muted-2 mt-0.5">Highlights & Verified Tests</div>
            </div>

            <div>
              <span className="text-muted-2">Target Keywords Fit</span>
              <div className="text-[15px] text-text font-semibold mt-0.5">
                {isProfileReady ? `${keywordsScore}%` : '—'}
              </div>
              <div className="text-[11px] text-muted-2 mt-0.5">{matchedTargetSkills.length}/{requiredTargetSkills.length} required keywords</div>
            </div>

            <div>
              <span className="text-muted-2">Verified Competencies</span>
              <div className="text-[15px] text-accent font-semibold mt-0.5">
                {isProfileReady ? `${verifiedCount} Skills Verified` : '0'}
              </div>
              <div className="text-[11px] text-muted-2 mt-0.5">&gt;70% quiz scores</div>
            </div>
          </div>
        </div>

        {/* ROW 2 (Symmetrical 2-Column Split: grid-cols-1 lg:grid-cols-2 gap-6) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* LEFT COLUMN: CV Document Preview */}
          <div className="rounded-card bg-surface border border-border overflow-hidden flex flex-col justify-between">
            {/* Header pill */}
            <div className="px-5 py-3 border-b border-border bg-[#18181b] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileTextIcon size={14} className="text-accent" />
                <span className="text-mini font-mono text-text font-semibold">
                  {pdfFilename}
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-400">
                Candidate ATS Document
              </span>
            </div>

            {/* Rendered CV Body */}
            {!isProfileReady ? (
              <div className="p-10 text-center space-y-4 flex-1 flex flex-col justify-center items-center text-muted">
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-700 mx-auto flex items-center justify-center text-zinc-400">
                  <FileTextIcon size={20} />
                </div>
                <div className="text-subheading text-text font-medium">No Resume Registered</div>
                <p className="text-[13px] text-muted max-w-sm leading-relaxed">
                  Complete your profile and technical stack in Settings to generate ATS resume analysis and skill recommendations.
                </p>
                <div className="pt-2 flex items-center justify-center gap-2.5">
                  <Link
                    to="/profile"
                    className="h-9 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-btn text-mini font-mono flex items-center gap-1.5 transition-colors"
                  >
                    <UserIcon size={13} />
                    <span>Configure Profile</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsOnboardingOpen(true)}
                    className="h-9 px-4 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-btn text-mini font-mono transition-colors"
                  >
                    Setup Account
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-5 flex-1 flex flex-col justify-between bg-[#121215]">
                {/* Header */}
                <div className="border-b border-border pb-4">
                  <h3 className="text-[22px] font-semibold text-text tracking-tight font-sans">
                    {fullName}
                  </h3>
                  <div className="text-mini font-mono text-muted mt-1 leading-relaxed">
                    {userProfile.location || 'Local'} · {userProfile.email || 'student@university.edu'}{' '}
                    {userProfile.phone ? `· ${userProfile.phone}` : ''}
                  </div>
                  {(userProfile.github || userProfile.linkedin) && (
                    <div className="text-mini font-mono text-muted-2 mt-0.5">
                      {userProfile.github ? `${userProfile.github} ` : ''}
                      {userProfile.linkedin ? `· ${userProfile.linkedin}` : ''}
                    </div>
                  )}
                </div>

                {/* Section: Skills */}
                <div className="space-y-2">
                  <div className="text-mini font-mono uppercase text-muted-2 tracking-wider border-b border-border/80 pb-1">
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
                                ? 'bg-accent/20 text-accent font-medium border-accent/40'
                                : 'bg-zinc-800/80 text-text border-zinc-700'
                            }`}
                          >
                            {skill} {isVerified ? '✓' : ''}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-muted italic text-[12px]">No skills added yet</span>
                    )}
                  </div>
                </div>

                {/* Section: Highlights */}
                <div className="space-y-2">
                  <div className="text-mini font-mono uppercase text-muted-2 tracking-wider border-b border-border/80 pb-1">
                    Resume Highlights & Projects
                  </div>
                  <div className="text-[12px] text-muted font-mono leading-relaxed max-h-36 overflow-y-auto">
                    {userProfile.cvText ? (
                      <p className="whitespace-pre-line text-zinc-300">{userProfile.cvText}</p>
                    ) : userProfile.goals && userProfile.goals.length > 0 ? (
                      <ul className="space-y-1">
                        {userProfile.goals.map((g) => (
                          <li key={g} className="flex items-center gap-1.5">
                            <span className="text-accent">•</span>
                            <span>Target Focus: {g}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="italic text-zinc-500">No project bullets registered. Configure in Profile Settings.</p>
                    )}
                  </div>
                </div>

                {/* Section: Education */}
                <div className="space-y-1.5 pt-2 border-t border-border/80">
                  <div className="text-mini font-mono uppercase text-muted-2 tracking-wider">
                    Education & Track
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <div>
                      <div className="font-semibold text-text">
                        {userProfile.university || 'University not specified'}
                      </div>
                      <div className="text-muted text-[12px]">
                        {userProfile.degree || userProfile.major || userProfile.role}
                      </div>
                    </div>
                    <div className="text-mini font-mono text-muted-2">
                      {userProfile.years || '2023 — 2027'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Stacked Symmetrical Cards (Strengths, Benchmark Gaps, ATS Readiness) */}
          <div className="space-y-4 flex flex-col justify-between">
            {/* 1. Strengths Card */}
            <div className="p-5 rounded-card bg-surface border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-subheading text-text text-[15px]">Target Strengths</span>
                </div>
                <span className="text-mini font-mono text-accent">
                  {matchedTargetSkills.length} matches
                </span>
              </div>
              <ul className="space-y-1.5 text-[13px] text-muted">
                {isProfileReady ? (
                  <>
                    {matchedTargetSkills.length > 0 && (
                      <li className="flex items-center gap-2">
                        <span className="text-accent font-mono text-[11px]">•</span>
                        <span>Matches target prerequisites: <strong className="text-zinc-200">{matchedTargetSkills.join(', ')}</strong></span>
                      </li>
                    )}
                    {userProfile.university && (
                      <li className="flex items-center gap-2">
                        <span className="text-accent font-mono text-[11px]">•</span>
                        <span>Academic standing: <strong className="text-zinc-200">{userProfile.university}</strong></span>
                      </li>
                    )}
                    {verifiedCount > 0 && (
                      <li className="flex items-center gap-2 text-accent">
                        <span className="font-mono text-[11px]">✓</span>
                        <span>{verifiedCount} skill(s) verified via interactive quiz</span>
                      </li>
                    )}
                  </>
                ) : (
                  <li className="text-mini font-mono text-muted-2 italic">
                    Configure profile to generate verified strengths.
                  </li>
                )}
              </ul>
            </div>

            {/* 2. Benchmark Gaps Card */}
            <div className="p-5 rounded-card bg-surface border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-warning" />
                  <span className="text-subheading text-text text-[15px]">Benchmark Gaps</span>
                </div>
                <span className="text-mini font-mono text-warning">
                  {missingTargetSkills.length} missing
                </span>
              </div>
              <ul className="space-y-1.5 text-[13px] text-muted">
                {isProfileReady ? (
                  <>
                    {missingTargetSkills.length > 0 ? (
                      missingTargetSkills.map((gap) => (
                        <li key={gap} className="flex items-center gap-2">
                          <span className="text-warning font-mono text-[11px]">•</span>
                          <span>Missing competency: <strong className="text-zinc-200">{gap}</strong> (Prerequisite for {selectedOpp.title})</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-mini font-mono text-accent italic">
                        All target benchmark skills satisfied! Full stack ready.
                      </li>
                    )}
                  </>
                ) : (
                  <li className="text-mini font-mono text-muted-2 italic">
                    Awaiting candidate profile setup.
                  </li>
                )}
              </ul>
            </div>

            {/* 3. Eligibility & ATS Readiness Summary Card (Perfect Visual Symmetry) */}
            <div className="p-5 rounded-card bg-surface border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldIcon size={16} className="text-accent" />
                  <span className="text-subheading text-text text-[15px]">Eligibility & ATS Readiness</span>
                </div>
                <span className="text-mini font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300">
                  Ready to Submit
                </span>
              </div>
              <div className="space-y-2 text-[12px] text-muted">
                <div className="flex items-center justify-between font-mono">
                  <span>ATS Format:</span>
                  <span className="text-zinc-200">Linear High-Density Standard</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span>Sovereignty Sandbox:</span>
                  <span className="text-accent">/workspace/qadam (LOCKED)</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span>Recommendation:</span>
                  <span className="text-zinc-200">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-border gap-2">
            <div>
              <h3 className="text-mini font-mono uppercase tracking-wider text-muted-2">
                Recommended Skills & Benchmark Curriculum
              </h3>
              <div className="text-[13px] text-text font-medium mt-0.5">
                Target Requirements for {selectedOpp.title} ({selectedOpp.organization})
              </div>
            </div>
            <span className="text-mini font-mono px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
              {prioritizedSkills.length} Available Curriculum Tracks
            </span>
          </div>

          {/* Grid of Vertical Portrait Cards (grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5) */}
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
                  className={`min-h-[410px] p-5 rounded-card bg-surface border transition-all flex flex-col justify-between hover:border-zinc-700 shadow-sm ${
                    isMissingTarget
                      ? 'border-warning/50 bg-[#16130d]/40'
                      : 'border-border'
                  }`}
                >
                  {/* Top: Vector Tech Icon + Title + Badge */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-btn bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                        <TechIcon name={skill.name} size={22} />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-medium ${
                            isVerified
                              ? 'bg-accent/15 text-accent border-accent-border'
                              : isMissingTarget
                              ? 'bg-warning/15 text-warning-text border-warning/40'
                              : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                          }`}
                        >
                          {skill.status} {skill.score ? `(${skill.score}%)` : ''}
                        </span>
                        {isMissingTarget && (
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-warning/20 text-warning font-semibold">
                            GAP FOR TARGET
                          </span>
                        )}
                        {isMatchedTarget && (
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-accent/20 text-accent font-semibold">
                            BENCHMARK MATCH
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[16px] font-semibold text-text break-words">
                        {skill.name}
                      </h4>
                    </div>

                    {/* Middle: Clear explanation of target event & sub-topics */}
                    <p className="text-[12px] text-muted leading-relaxed">
                      {isMissingTarget
                        ? `Requested by ${selectedOpp.title} (${selectedOpp.organization}): Requires practical mastery in ${skill.name} internals and benchmark evaluation.`
                        : skill.reason}
                    </p>
                  </div>

                  {/* Bottom: Resource link & Full-width quiz button */}
                  <div className="pt-4 border-t border-border/60 space-y-3">
                    <a
                      href={skill.resourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-mini font-mono text-muted hover:text-text flex items-center justify-between group"
                    >
                      <span className="truncate group-hover:underline">{skill.resourceTitle}</span>
                      <ExternalLinkIcon size={12} className="flex-shrink-0 ml-1.5" />
                    </a>

                    {!isVerified ? (
                      <button
                        type="button"
                        onClick={() => openSkillQuiz(skill)}
                        className="w-full h-11 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-zinc-100 rounded-btn text-mini font-mono font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      >
                        <FlaskIcon size={14} className="text-accent" />
                        <span>Take Skill Quiz (&gt;70%)</span>
                      </button>
                    ) : (
                      <div className="w-full h-11 px-3 bg-accent/10 border border-accent/30 text-accent rounded-btn text-mini font-mono font-medium flex items-center justify-center gap-1.5">
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
