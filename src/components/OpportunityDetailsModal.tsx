import React from 'react';
import { useApp } from '../context/AppContext';
import { CloseIcon, ExternalLinkIcon, CheckIcon } from './Icons';

export const OpportunityDetailsModal: React.FC = () => {
  const {
    selectedOpportunityForDetails,
    setSelectedOpportunityForDetails,
    setSelectedOpportunityForDraft,
  } = useApp();

  if (!selectedOpportunityForDetails) return null;

  const opp = selectedOpportunityForDetails;
  const isHighMatch = opp.match >= 80;

  const handleOpenDraft = () => {
    const target = opp;
    setSelectedOpportunityForDetails(null);
    setSelectedOpportunityForDraft(target);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="details-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070d1f]/90 backdrop-blur-sm"
    >
      <div className="w-full max-w-xl bg-surface border border-border rounded-card shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-mini font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-sidebar border border-border text-text">
              {opp.type}
            </span>
            <span className="text-mini font-mono px-2 py-0.5 rounded border border-border text-muted">
              {opp.deadline}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedOpportunityForDetails(null)}
            aria-label="Close modal"
            className="w-8 h-8 flex items-center justify-center text-muted hover:text-text rounded-btn"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div>
            <h3 id="details-modal-title" className="text-[17px] font-semibold text-text leading-snug">
              {opp.title}
            </h3>
            <p className="text-[13px] text-muted mt-2 leading-relaxed">{opp.description}</p>
          </div>

          <div className="p-3 bg-sidebar rounded-btn border border-border space-y-2">
            <div className="flex items-center justify-between text-mini font-mono">
              <span className="text-muted-2">MATCH COMPATIBILITY</span>
              <span className={isHighMatch ? 'text-accent font-semibold' : 'text-muted'}>
                {opp.match}% match
              </span>
            </div>
            <div className="w-full h-[4px] bg-surface rounded-full overflow-hidden">
              <div
                className={`h-full ${isHighMatch ? 'bg-accent' : 'bg-muted-2'}`}
                style={{ width: `${opp.match}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-mini font-mono">
            <div className="p-2.5 bg-sidebar rounded border border-border">
              <div className="text-muted-2 uppercase">Location / Mode</div>
              <div className="text-text mt-0.5 font-medium">{opp.location}</div>
            </div>
            <div className="p-2.5 bg-sidebar rounded border border-border">
              <div className="text-muted-2 uppercase">Prize / Stipend</div>
              <div className="text-text mt-0.5 font-medium">{opp.award}</div>
            </div>
          </div>

          <div>
            <div className="text-mini font-mono uppercase text-muted-2 mb-2">Required Tech Stack</div>
            <div className="flex flex-wrap gap-1.5">
              {opp.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-btn text-mini font-mono border border-border text-text-2 bg-sidebar"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-border flex items-center justify-between bg-sidebar/30">
          {opp.url ? (
            <a
              href={opp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-mini font-mono text-accent hover:underline flex items-center gap-1.5"
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
              className="h-10 px-4 rounded-btn border border-zinc-700/80 bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 text-[13px] font-medium transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleOpenDraft}
              className="h-10 px-5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-500 text-zinc-100 rounded-btn text-[13px] font-medium transition-colors shadow-sm"
            >
              Draft Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

