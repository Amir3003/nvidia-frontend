import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CloseIcon, ExternalLinkIcon } from './Icons';
import { ActivityStatus, loadLocalStatuses, loadMembership, setOpportunityStatus } from '../lib/cohorts';

const STATUS_OPTIONS: { value: ActivityStatus; label: string }[] = [
  { value: 'saved', label: 'Saved' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'applied', label: 'Applied' },
];

export const OpportunityDetailsModal: React.FC = () => {
  const navigate = useNavigate();
  const {
    selectedOpportunityForDetails,
    setSelectedOpportunityForDetails,
    userProfile,
  } = useApp();
  const [status, setStatus] = useState<ActivityStatus | null>(null);
  const [statusError, setStatusError] = useState('');
  const membership = loadMembership();
  const oppId = selectedOpportunityForDetails?.id;

  useEffect(() => {
    setStatusError('');
    setStatus(oppId ? loadLocalStatuses()[oppId] || null : null);
  }, [oppId]);

  if (!selectedOpportunityForDetails) return null;

  const opp = selectedOpportunityForDetails;
  const hasProfileSkills = Boolean(userProfile.skills?.length);
  const isHighMatch = opp.match >= 80;

  // Learners in a cohort mark where they are; their staff see the counts.
  const changeStatus = async (next: ActivityStatus) => {
    if (!membership) return;
    const value = status === next ? null : next;
    const previous = status;
    setStatus(value);
    setStatusError('');
    try {
      await setOpportunityStatus(membership.userId, opp, value);
    } catch {
      setStatus(previous);
      setStatusError('Could not save. Check your connection and try again.');
    }
  };

  const handleOpenDraft = () => {
    const targetId = opp.id;
    setSelectedOpportunityForDetails(null);
    navigate(`/application-studio?id=${targetId}`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="details-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md overflow-y-auto"
    >
      <div className="w-full max-w-xl max-h-[85vh] my-auto bg-gradient-to-br from-[#EDF7F6] via-[#F3F6FF] to-[#E8F4F8] border border-teal-300/60 rounded-card shadow-2xl flex flex-col overflow-hidden text-slate-900">
        {/* Header */}
        <div className="px-5 py-4 border-b border-teal-200/60 flex items-center justify-between bg-teal-50/70 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-mini font-mono uppercase tracking-wider px-2.5 py-0.5 rounded bg-teal-500/10 border border-teal-300 text-teal-950 font-bold shadow-2xs">
              {opp.type}
            </span>
            <span className="text-mini font-mono px-2 py-0.5 rounded border border-teal-200/80 bg-white/80 text-teal-900 font-medium">
              {opp.deadline}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedOpportunityForDetails(null)}
            aria-label="Close modal"
            className="w-8 h-8 flex items-center justify-center text-teal-800 hover:text-indigo-950 hover:bg-teal-100/60 rounded-btn cursor-pointer transition-colors"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          <div>
            <h3 id="details-modal-title" className="text-[18px] font-bold text-indigo-950 leading-snug">
              {opp.title}
            </h3>
            <p className="text-[13px] text-slate-700 mt-2 leading-relaxed font-medium">{opp.description}</p>
          </div>

          {opp.skills.length > 0 && hasProfileSkills && (
            <div className="p-3.5 bg-white/90 rounded-btn border border-teal-200/80 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-mini font-mono">
                <span className="text-teal-900 font-bold uppercase">MATCH COMPATIBILITY</span>
                <span className={isHighMatch ? 'text-emerald-800 font-bold' : 'text-slate-700 font-medium'}>
                  {opp.match}% match
                </span>
              </div>
              <div className="w-full h-[5px] bg-teal-100/80 rounded-full overflow-hidden">
                <div
                  className={`h-full ${isHighMatch ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-slate-400'}`}
                  style={{ width: `${opp.match}%` }}
                />
              </div>
            </div>
          )}

          {(opp.location || opp.award) && (
            <div className={`grid ${opp.location && opp.award ? 'grid-cols-2' : 'grid-cols-1'} gap-3 text-mini font-mono`}>
              {opp.location && (
                <div className="p-3 bg-white/90 rounded border border-teal-200/80 shadow-2xs">
                  <div className="text-teal-900 uppercase font-bold">Location / Mode</div>
                  <div className="text-indigo-950 mt-0.5 font-bold">{opp.location}</div>
                </div>
              )}
              {opp.award && (
                <div className="p-3 bg-white/90 rounded border border-teal-200/80 shadow-2xs">
                  <div className="text-teal-900 uppercase font-bold">Prize / Stipend</div>
                  <div className="text-indigo-950 mt-0.5 font-bold">{opp.award}</div>
                </div>
              )}
            </div>
          )}

          {opp.skills.length > 0 && (
          <div>
            <div className="text-mini font-mono uppercase text-teal-900 font-bold mb-2">Required Tech Stack</div>
            <div className="flex flex-wrap gap-1.5">
              {opp.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-btn text-mini font-mono border border-sky-300/60 text-sky-950 bg-sky-50 font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          )}
        </div>

        {membership && (
          <div className="px-5 py-3 border-t border-teal-200/60 bg-white/60">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-mini font-mono uppercase tracking-wider text-teal-900 font-bold mr-1">My status</span>
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => changeStatus(option.value)}
                  aria-pressed={status === option.value}
                  className={`h-9 px-3.5 rounded-full text-[12px] font-semibold transition-colors cursor-pointer ${
                    status === option.value
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                      : 'bg-white border border-teal-200 text-teal-900 hover:bg-teal-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {statusError ? (
              <p role="alert" className="mt-1.5 text-[12px] text-rose-700">{statusError}</p>
            ) : (
              <p className="mt-1.5 text-[11px] text-teal-800">Your program staff at {membership.institutionName || 'your institution'} can see this status.</p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-teal-200/60 flex items-center justify-between bg-teal-50/70">
          {opp.url ? (
            <a
              href={opp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-mini font-mono text-teal-800 hover:text-indigo-950 hover:underline flex items-center gap-1.5 font-bold"
            >
              <span>Official Link</span>
              <ExternalLinkIcon size={12} />
            </a>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedOpportunityForDetails(null)}
              className="h-10 px-4 rounded-btn border border-teal-300/80 bg-white/90 hover:bg-white text-teal-900 text-[13px] font-semibold transition-colors shadow-2xs cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleOpenDraft}
              className="h-10 px-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-btn text-[13px] font-bold transition-all shadow-xs cursor-pointer"
            >
              Prepare &amp; Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

