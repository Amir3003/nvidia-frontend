import React from 'react';
import { useApp } from '../context/AppContext';
import { CloseIcon, CheckIcon, AlertTriangleIcon, FlaskIcon } from './Icons';

export const CvGapsModal: React.FC = () => {
  const {
    selectedOpportunityForGaps,
    setSelectedOpportunityForGaps,
    userProfile,
    skills,
    openSkillQuiz,
  } = useApp();

  if (!selectedOpportunityForGaps) return null;

  const opp = selectedOpportunityForGaps;

  // Classify skills for this opportunity
  const matchedSkills: string[] = [];
  const unverifiedSkills: { name: string; skillItem?: (typeof skills)[0] }[] = [];
  const missingSkills: { name: string; skillItem?: (typeof skills)[0] }[] = [];

  opp.skills.forEach((reqSkill) => {
    const knownSkillItem = skills.find(
      (s) => s.name.toLowerCase() === reqSkill.toLowerCase()
    );

    if (knownSkillItem?.status === 'VERIFIED') {
      matchedSkills.push(reqSkill);
    } else if (
      knownSkillItem?.status === 'UNVERIFIED' ||
      userProfile.skills.some((us) => us.toLowerCase() === reqSkill.toLowerCase())
    ) {
      unverifiedSkills.push({ name: reqSkill, skillItem: knownSkillItem });
    } else {
      missingSkills.push({ name: reqSkill, skillItem: knownSkillItem });
    }
  });

  const handleLaunchQuiz = (skillName: string, knownItem?: (typeof skills)[0]) => {
    if (knownItem) {
      setSelectedOpportunityForGaps(null);
      openSkillQuiz(knownItem);
    } else {
      // Find generic or closest match in skills, or create temporary skill
      const fallback = skills.find((s) => s.id === 'docker') || skills[0];
      setSelectedOpportunityForGaps(null);
      openSkillQuiz(fallback);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gaps-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070d1f]/90 backdrop-blur-sm"
    >
      <div className="w-full max-w-xl bg-surface border border-border rounded-card shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-sidebar">
          <div>
            <div className="text-mini font-mono uppercase text-muted-2 tracking-wider">
              ATS Gap Analysis & Verification
            </div>
            <h3 id="gaps-modal-title" className="text-subheading text-text font-semibold mt-0.5">
              {opp.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setSelectedOpportunityForGaps(null)}
            aria-label="Close dialog"
            className="w-8 h-8 flex items-center justify-center text-muted hover:text-text rounded-btn"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Compatibility Banner */}
          <div className="p-4 bg-sidebar rounded-card border border-border flex items-center justify-between">
            <div>
              <div className="text-mini font-mono text-muted uppercase">Match Alignment</div>
              <div className="text-[20px] font-mono font-bold text-accent mt-0.5">
                {opp.match}% match
              </div>
            </div>
            <div className="text-right text-mini font-mono text-muted">
              <div>Candidate: <strong className="text-text">{userProfile.name}</strong></div>
              <div>ATS Benchmark: {opp.type}</div>
            </div>
          </div>

          {/* 1. Verified Matched Skills */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <h4 className="text-mini font-mono uppercase text-accent font-semibold tracking-wider">
                Verified Tech Stack ({matchedSkills.length})
              </h4>
            </div>
            {matchedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {matchedSkills.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-btn text-mini font-mono border border-accent/40 bg-accent/10 text-text flex items-center gap-1.5"
                  >
                    <CheckIcon size={12} className="text-accent" />
                    <span>{s} (Verified)</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[12px] font-mono text-muted">No verified skills matching this role yet.</p>
            )}
          </div>

          {/* 2. Unverified Skills in Profile */}
          {unverifiedSkills.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-warning" />
                <h4 className="text-mini font-mono uppercase text-warning-text font-semibold tracking-wider">
                  Unverified Skills in Profile ({unverifiedSkills.length})
                </h4>
              </div>
              <div className="space-y-2">
                {unverifiedSkills.map(({ name: sName, skillItem }) => (
                  <div
                    key={sName}
                    className="p-3 rounded-btn bg-sidebar border border-warning/30 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-[13px] font-medium text-text">{sName}</div>
                      <div className="text-mini font-mono text-muted">
                        Present on resume, needs benchmark score &gt;70%
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLaunchQuiz(sName, skillItem)}
                      className="h-9 px-3 bg-surface-hover hover:bg-border-strong border border-border-strong text-text rounded-btn text-mini font-mono font-medium flex items-center gap-1.5 flex-shrink-0 transition-colors"
                    >
                      <FlaskIcon size={13} className="text-accent" />
                      <span>Take Quiz</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Missing Skills */}
          {missingSkills.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-muted-2" />
                <h4 className="text-mini font-mono uppercase text-muted-2 font-semibold tracking-wider">
                  Missing Requirements ({missingSkills.length})
                </h4>
              </div>
              <div className="space-y-2">
                {missingSkills.map(({ name: sName, skillItem }) => (
                  <div
                    key={sName}
                    className="p-3 rounded-btn bg-sidebar border border-border flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-[13px] font-medium text-text-2">{sName}</div>
                      <div className="text-mini font-mono text-muted-2">
                        Required for top quartile ATS ranking
                      </div>
                    </div>
                    {skillItem ? (
                      <button
                        type="button"
                        onClick={() => handleLaunchQuiz(sName, skillItem)}
                        className="h-9 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-500 text-zinc-100 text-mini font-mono font-medium rounded-btn flex items-center gap-1.5 flex-shrink-0 transition-colors"
                      >
                        <FlaskIcon size={13} className="text-accent" />
                        <span>Verify & Add</span>
                      </button>
                    ) : (
                      <span className="text-mini font-mono text-muted px-2 py-1 bg-surface rounded border border-border">
                        Required Skill
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-border bg-sidebar flex items-center justify-between">
          <span className="text-mini font-mono text-muted-2">
            Verification directly upgrades radar match %
          </span>
          <button
            type="button"
            onClick={() => setSelectedOpportunityForGaps(null)}
            className="h-10 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-500 text-zinc-100 rounded-btn text-[13px] font-medium transition-colors"
          >
            Close Gap Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

