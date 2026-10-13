import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/PageHeader';
import { OPPORTUNITIES_DATABASE } from '../db/opportunities';
import { ExternalLinkIcon, CheckIcon, FlaskIcon, FileTextIcon, UserIcon } from '../components/Icons';

export const CvLabPage: React.FC = () => {
  const { skills, openSkillQuiz, userProfile, setIsOnboardingOpen } = useApp();

  // Benchmark target selection state: allows picking any opportunity from DB or General Readiness
  const [targetOppId, setTargetOppId] = useState<string>('nebius-nvidia-hackathon');

  const selectedOpp = OPPORTUNITIES_DATABASE.find((o) => o.id === targetOppId) || null;

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

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <PageHeader
        title="CV & Skill Lab"
        subtitle={
          isProfileReady
            ? `benchmark target: ${selectedOpp ? selectedOpp.title : 'General Profile Readiness'} · candidate: ${fullName}`
            : 'gap analysis uninitialized · complete candidate profile in Settings'
        }
        actions={
          <div className="flex items-center gap-2.5">
            <label
              htmlFor="benchmark-target-dropdown"
              className="text-mini font-mono uppercase text-muted-2 whitespace-nowrap hidden sm:inline"
            >
              Target Benchmark:
            </label>
            <select
              id="benchmark-target-dropdown"
              value={targetOppId}
              onChange={(e) => setTargetOppId(e.target.value)}
              className="h-10 px-3 bg-zinc-900 border border-zinc-700/80 hover:border-zinc-500 rounded-btn text-mini font-mono text-zinc-100 focus:border-accent focus:outline-none max-w-[280px] sm:max-w-xs transition-colors cursor-pointer"
            >
              {OPPORTUNITIES_DATABASE.map((opp) => (
                <option key={opp.id} value={opp.id} className="bg-zinc-950 text-zinc-100">
                  {opp.title} ({opp.organization})
                </option>
              ))}
            </select>
          </div>
        }
      />

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* LEFT COLUMN: CV Inspector & Scores */}
          <div className="space-y-6 min-w-0">
            {/* CV Health Score Box */}
            <div className="p-5 rounded-card bg-surface border border-border space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-mini font-mono uppercase tracking-wider text-muted-2">
                    CV Health Score
                  </div>
                  <div className="text-[22px] font-mono font-bold text-text mt-0.5">
                    {isProfileReady ? `${currentHealthScore}/100` : '— / 100'}
                  </div>
                </div>
                {isProfileReady ? (
                  <span className="text-mini font-mono px-2.5 py-1 rounded bg-accent/10 text-accent border border-accent-border">
                    ATS OPTIMIZED
                  </span>
                ) : (
                  <span className="text-mini font-mono px-2.5 py-1 rounded bg-zinc-900 text-zinc-400 border border-zinc-700/80">
                    PENDING PROFILE
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div className="w-full h-1 bg-sidebar rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-500"
                  style={{ width: `${currentHealthScore}%` }}
                />
              </div>

              {/* Sub-metrics */}
              <div className="grid grid-cols-3 gap-3 pt-1 border-t border-border/60 text-mini font-mono">
                <div>
                  <span className="text-muted-2">structure</span>
                  <div className="text-text font-medium mt-0.5">
                    {isProfileReady ? structureScore : '—'}
                  </div>
                </div>
                <div>
                  <span className="text-muted-2">impact</span>
                  <div className="text-text font-medium mt-0.5">
                    {isProfileReady ? impactScore : '—'}
                  </div>
                </div>
                <div>
                  <span className="text-muted-2">keywords</span>
                  <div className="text-text font-medium mt-0.5">
                    {isProfileReady ? keywordsScore : '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* CV Preview Document: Candidate_CV.pdf */}
            <div className="rounded-card bg-surface border border-border overflow-hidden">
              {/* Header preview pill */}
              <div className="px-5 py-3 border-b border-border bg-sidebar flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-mini font-mono text-text font-semibold">
                    {pdfFilename}
                  </span>
                </div>
                <span className="text-mini font-mono uppercase px-2 py-0.5 rounded bg-surface border border-border text-muted">
                  preview
                </span>
              </div>

              {/* Rendered CV Body */}
              {!isProfileReady ? (
                <div className="p-8 text-center space-y-3 bg-[#0a1128]/70 text-muted">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700/80 mx-auto flex items-center justify-center text-zinc-400">
                    <FileTextIcon size={18} />
                  </div>
                  <div className="text-subheading text-text font-medium">No Resume Registered</div>
                  <p className="text-[13px] text-muted max-w-sm mx-auto leading-relaxed">
                    Complete your profile and technical stack in Settings to generate ATS resume analysis and skill recommendations.
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-2.5">
                    <Link
                      to="/profile"
                      className="h-9 px-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-500 text-zinc-100 rounded-btn text-mini font-mono flex items-center gap-1.5 transition-colors"
                    >
                      <UserIcon size={13} />
                      <span>Configure Profile</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setIsOnboardingOpen(true)}
                      className="h-9 px-3.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-500 text-zinc-200 rounded-btn text-mini font-mono transition-colors"
                    >
                      Setup Wizard
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-5 bg-[#0a1128]/70 text-text">
                  {/* Header */}
                  <div className="border-b border-border pb-3">
                    <h3 className="text-[20px] font-semibold text-text tracking-tight">
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
                    <div className="text-mini font-mono uppercase text-muted-2 tracking-wider border-b border-border pb-1">
                      Skills & Tooling
                    </div>
                    <div className="text-[13px] leading-relaxed space-y-1.5 text-text-2">
                      <p>
                        <strong className="text-text font-medium">Candidate Tech Stack:</strong>{' '}
                        {userSkills.length > 0 ? (
                          userSkills.map((skill, idx) => {
                            const isVerified = skills.some(
                              (s) => s.name.toLowerCase() === skill.toLowerCase() && s.status === 'VERIFIED'
                            );
                            return (
                              <React.Fragment key={skill}>
                                {idx > 0 && ', '}
                                <span
                                  className={`px-1.5 py-0.5 rounded ${
                                    isVerified
                                      ? 'bg-accent/20 text-accent font-medium border border-accent/40'
                                      : 'bg-zinc-800/80 text-text font-medium'
                                  }`}
                                >
                                  {skill} {isVerified ? '✓' : ''}
                                </span>
                              </React.Fragment>
                            );
                          })
                        ) : (
                          <span className="text-muted italic">No skills added yet</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Section: Projects / Highlights */}
                  <div className="space-y-2">
                    <div className="text-mini font-mono uppercase text-muted-2 tracking-wider border-b border-border pb-1">
                      Resume Highlights & Projects
                    </div>
                    <div className="space-y-2 text-[13px]">
                      {userProfile.cvText ? (
                        <p className="text-muted text-[12px] leading-relaxed whitespace-pre-line font-mono">
                          {userProfile.cvText}
                        </p>
                      ) : userProfile.goals && userProfile.goals.length > 0 ? (
                        <ul className="space-y-1 text-muted text-[12px]">
                          {userProfile.goals.map((g) => (
                            <li key={g} className="flex items-center gap-1.5">
                              <span className="text-accent">•</span>
                              <span>Target Focus: {g}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted text-[12px] italic">
                          No project bullets registered. Add highlights in Profile Settings.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Section: Education */}
                  <div className="space-y-2">
                    <div className="text-mini font-mono uppercase text-muted-2 tracking-wider border-b border-border pb-1">
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

            {/* Strengths & Gaps Side-by-side Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="p-4 rounded-card bg-surface border border-border space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-subheading text-text text-[14px]">Strengths</span>
                </div>
                <ul className="space-y-1.5 text-[13px] text-muted">
                  {isProfileReady ? (
                    <>
                      {matchedTargetSkills.length > 0 && (
                        <li className="flex items-center gap-2">
                          <span className="text-accent font-mono text-[11px]">•</span>
                          <span>Matches target requirements: {matchedTargetSkills.join(', ')}</span>
                        </li>
                      )}
                      {userProfile.university && (
                        <li className="flex items-center gap-2">
                          <span className="text-accent font-mono text-[11px]">•</span>
                          <span>Academic enrollment: {userProfile.university}</span>
                        </li>
                      )}
                      {verifiedCount > 0 && (
                        <li className="flex items-center gap-2 text-accent">
                          <span className="font-mono text-[11px]">✓</span>
                          <span>{verifiedCount} skill(s) verified via quiz</span>
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

              {/* Gaps */}
              <div className="p-4 rounded-card bg-surface border border-border space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-warning" />
                  <span className="text-subheading text-text text-[14px]">Benchmark Gaps</span>
                </div>
                <ul className="space-y-1.5 text-[13px] text-muted">
                  {isProfileReady ? (
                    <>
                      {missingTargetSkills.length > 0 ? (
                        missingTargetSkills.map((gap) => (
                          <li key={gap} className="flex items-center gap-2">
                            <span className="text-warning font-mono text-[11px]">•</span>
                            <span>Missing target competency: {gap}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-mini font-mono text-accent italic">
                          All target benchmark skills satisfied!
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
            </div>
          </div>

          {/* RIGHT COLUMN: Recommended Skills to Learn */}
          <div className="space-y-4 min-w-0">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div>
                <h3 className="text-mini font-mono uppercase tracking-wider text-muted-2">
                  Recommended Skills to Learn
                </h3>
                <div className="text-[12px] text-muted mt-0.5">
                  Dynamic benchmark curriculum for {selectedOpp ? selectedOpp.organization : 'General Profile'}
                </div>
              </div>
              <span className="text-mini font-mono px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700/80 text-zinc-300">
                {selectedOpp ? selectedOpp.organization : 'General Profile'}
              </span>
            </div>

            <div className="space-y-3.5">
              {[...skills]
                .sort((a, b) => {
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
                })
                .map((skill) => {
                  const isVerified = skill.status === 'VERIFIED';
                  const isUnverified = skill.status === 'UNVERIFIED';
                  const isMissingTarget = missingTargetSkills.some(
                    (m) => m.toLowerCase() === skill.name.toLowerCase()
                  );
                  const isMatchedTarget = matchedTargetSkills.some(
                    (m) => m.toLowerCase() === skill.name.toLowerCase()
                  );

                  let badgeColor = 'bg-zinc-900 text-zinc-400 border-zinc-700/80';
                  if (isVerified) badgeColor = 'bg-accent/10 text-accent border-accent-border';
                  if (isUnverified) badgeColor = 'bg-warning/10 text-warning-text border-warning/40';

                  return (
                    <div
                      key={skill.id}
                      className={`p-4 rounded-card bg-surface border transition-colors flex flex-col justify-between gap-3.5 ${
                        isMissingTarget
                          ? 'border-warning/50 bg-[#0d162e]/50'
                          : 'border-border hover:border-border-strong'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5 gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-subheading text-text font-semibold break-words">
                              {skill.name}
                            </h4>
                            {isMissingTarget && (
                              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                BENCHMARK GAP
                              </span>
                            )}
                            {isMatchedTarget && (
                              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-accent/15 text-accent border border-accent-border">
                                TARGET REQUIREMENT
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-mini font-mono px-2 py-0.5 rounded border flex-shrink-0 ${badgeColor}`}
                          >
                            {skill.status} {skill.score ? `(${skill.score}%)` : ''}
                          </span>
                        </div>
                        <p className="text-[13px] text-muted leading-relaxed whitespace-normal break-words">
                          {isMissingTarget && selectedOpp
                            ? `Direct prerequisite for ${selectedOpp.title}. Verify this competency to close ATS gap analysis.`
                            : skill.reason}
                        </p>
                      </div>

                      {/* Responsive, non-clipping text wrapping for long titles */}
                      <div className="pt-2.5 border-t border-border/60 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                        <a
                          href={skill.resourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-w-0 flex-1 text-mini font-mono text-muted hover:text-text flex items-start gap-1.5 group whitespace-normal break-words"
                        >
                          <span className="whitespace-normal break-words leading-relaxed group-hover:underline">
                            {skill.resourceTitle}
                          </span>
                          <ExternalLinkIcon size={12} className="flex-shrink-0 mt-0.5" />
                        </a>

                        {!isVerified ? (
                          <button
                            type="button"
                            onClick={() => openSkillQuiz(skill)}
                            className="h-10 px-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-700/80 hover:border-zinc-500 rounded-btn text-[12px] font-mono font-medium transition-colors flex items-center justify-center gap-2 flex-shrink-0 whitespace-nowrap shadow-sm"
                          >
                            <FlaskIcon size={14} className="text-accent" />
                            <span>Take Skill Quiz (&gt;70% to verify)</span>
                          </button>
                        ) : (
                          <span className="h-10 px-3 inline-flex items-center text-mini font-mono text-accent bg-accent/10 border border-accent/30 rounded-btn flex-shrink-0 whitespace-nowrap">
                            <CheckIcon size={14} className="mr-1.5" />
                            Verified in Profile
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
