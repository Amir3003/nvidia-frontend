import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CloseIcon, ShieldIcon, CheckIcon, CopyIcon } from './Icons';
import { anonymize } from '../utils/anonymizer';

export const DraftApplicationModal: React.FC = () => {
  const {
    selectedOpportunityForDraft,
    setSelectedOpportunityForDraft,
    userProfile,
    addLog,
    incrementMaskedCount,
  } = useApp();
  const [copied, setCopied] = useState(false);

  if (!selectedOpportunityForDraft) return null;

  const opp = selectedOpportunityForDraft;

  const samplePayload = {
    student: {
      name: userProfile.name,
      email: userProfile.email,
      phone: userProfile.phone || '+1 555-0199',
      id: userProfile.nationalId || '987654321',
      university: userProfile.university,
      role: userProfile.role,
    },
    target_opportunity: opp.title,
    skills: opp.skills,
    task: 'Generate track-aligned motivation statement and architecture proposal',
  };

  const anonymized = anonymize(samplePayload);

  const matchedSkillsString = opp.skills
    .filter((s) => userProfile.skills.some((us) => us.toLowerCase() === s.toLowerCase()))
    .join(', ') || opp.skills[0];

  const draftText = `Application Proposal: ${opp.title}
Candidate: [USER_NAME_1] (${userProfile.role}, ${userProfile.university})
Contact: [EMAIL_MASKED] · [PHONE_MASKED]
Target Track: ${opp.type} · Deadline: ${opp.deadline}

Summary of Intent:
I am submitting our proposal for the ${opp.title}. As an active student researcher specializing in ${userProfile.role.toLowerCase()} at ${userProfile.university}, my work focuses on building safe, high-throughput autonomous workflows.

Technical Alignment:
1. Core Stack Mastery: Hands-on experience with ${matchedSkillsString}, incorporating clean architecture patterns and low-latency execution.
2. Safe Agent Containment: Direct integration with OpenShell sandbox isolation to ensure zero unauthorized disk or network traversal during tool execution.
3. Track Relevance: Direct application of our research toward ${opp.description}

Proposed Deliverable:
Production-ready containerized prototype with reproducible evaluation benchmarks and zero-leak client-side privacy protection.

Candidate Signature:
[USER_NAME_1] (Verified Student Profile)`;

  const handleCopy = () => {
    navigator.clipboard.writeText(draftText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToSandbox = () => {
    addLog('SANDBOX', `Draft saved to /workspace/qadam/drafts/${opp.id}.txt`);
    incrementMaskedCount(4);
    setSelectedOpportunityForDraft(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="draft-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"
    >
      <div className="w-full max-w-2xl bg-gradient-to-br from-[#EDF7F6] via-[#F3F6FF] to-[#E8F4F8] border border-teal-300/60 rounded-card shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-900">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-teal-200/60 flex items-center justify-between bg-teal-50/70">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 id="draft-modal-title" className="text-subheading text-indigo-950 font-bold">
              Application Drafter · {opp.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setSelectedOpportunityForDraft(null)}
            aria-label="Close dialog"
            className="w-8 h-8 flex items-center justify-center text-teal-800 hover:text-indigo-950 hover:bg-teal-100/60 rounded-btn cursor-pointer transition-colors"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* PII Masking Note Banner */}
          <div className="p-3.5 bg-gradient-to-br from-emerald-50 to-teal-100/80 border border-emerald-300/60 rounded-btn flex items-start gap-3 shadow-2xs">
            <ShieldIcon size={16} className="text-emerald-700 flex-shrink-0 mt-0.5" />
            <div className="text-[12px] font-mono leading-relaxed text-teal-950">
              <span className="text-emerald-900 font-bold">PII Anonymization Active:</span> Candidate{' '}
              <span className="text-indigo-950 font-bold">{userProfile.name}</span>, contact phone, student ID, and email were tokenized locally into{' '}
              <span className="text-indigo-950 font-bold">[USER_NAME_1]</span>,{' '}
              <span className="text-indigo-950 font-bold">[EMAIL_MASKED]</span>, etc. prior to dispatching prompt to{' '}
              <span className="text-indigo-950 font-bold">nvidia/Nemotron-3.5-Lightning</span>.
            </div>
          </div>

          {/* Generated Draft Container */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="draft-content" className="text-mini font-mono uppercase text-teal-900 font-bold tracking-wider">
                Tailored Proposal (Local OpenShell Workspace)
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-mini font-mono text-teal-800 hover:text-indigo-950 hover:underline flex items-center gap-1.5 cursor-pointer font-bold"
              >
                {copied ? <CheckIcon size={12} className="text-emerald-600" /> : null}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>
            <textarea
              id="draft-content"
              readOnly
              value={draftText}
              rows={12}
              className="w-full p-3.5 bg-white/95 border border-teal-200/80 rounded-btn text-[12px] font-mono text-slate-900 leading-relaxed resize-none focus:outline-none focus:border-teal-500 select-text transition-colors shadow-2xs"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-teal-200/60 bg-teal-50/70 flex items-center justify-between">
          <span className="text-mini font-mono text-slate-600 font-medium">
            Storage: /workspace/qadam/drafts/
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedOpportunityForDraft(null)}
              className="h-10 px-4 rounded-btn border border-teal-300/80 bg-white/90 hover:bg-white text-teal-900 text-[13px] font-semibold transition-colors shadow-2xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveToSandbox}
              className="h-10 px-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-btn text-[13px] font-bold font-mono transition-all shadow-xs cursor-pointer"
            >
              Save to Sandbox
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
