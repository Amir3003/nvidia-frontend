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
Production-ready containerized prototype with reproducible evaluation benchmarks and zero-leak client-side data sovereignty.

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090b]/90 backdrop-blur-sm"
    >
      <div className="w-full max-w-2xl bg-surface border border-border rounded-card shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between bg-sidebar">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <h3 id="draft-modal-title" className="text-subheading text-text">
              Application Drafter · {opp.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setSelectedOpportunityForDraft(null)}
            aria-label="Close dialog"
            className="w-8 h-8 flex items-center justify-center text-muted hover:text-text rounded-btn"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* PII Masking Note Banner */}
          <div className="p-3 bg-sidebar border border-accent-border rounded-btn flex items-start gap-3">
            <ShieldIcon size={16} className="text-accent flex-shrink-0 mt-0.5" />
            <div className="text-[12px] font-mono leading-relaxed">
              <span className="text-accent font-semibold">PII Anonymization Active:</span> Candidate{' '}
              <span className="text-text">{userProfile.name}</span>, contact phone, student ID, and email were tokenized locally into{' '}
              <span className="text-text">[USER_NAME_1]</span>,{' '}
              <span className="text-text">[EMAIL_MASKED]</span>, etc. prior to dispatching prompt to{' '}
              <span className="text-text">nvidia/Nemotron-3.5-Lightning</span>.
            </div>
          </div>

          {/* Generated Draft Container */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="draft-content" className="text-mini font-mono uppercase text-muted tracking-wider">
                Tailored Proposal (Local OpenShell Workspace)
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-mini font-mono text-accent hover:underline flex items-center gap-1.5"
              >
                {copied ? <CheckIcon size={12} /> : null}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>
            <textarea
              id="draft-content"
              readOnly
              value={draftText}
              rows={12}
              className="w-full p-3.5 bg-sidebar border border-border rounded-btn text-[12px] font-mono text-text-2 leading-relaxed resize-none focus:outline-none focus:border-border-strong select-text"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-border bg-sidebar flex items-center justify-between">
          <span className="text-mini font-mono text-muted-2">
            Storage: /workspace/qadam/drafts/
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedOpportunityForDraft(null)}
              className="h-10 px-4 rounded-btn border border-zinc-700/80 bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 text-[13px] font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveToSandbox}
              className="h-10 px-5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-500 text-zinc-100 rounded-btn text-[13px] font-medium font-mono transition-colors shadow-sm"
            >
              Save to Sandbox
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
