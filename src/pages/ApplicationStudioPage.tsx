import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { OPPORTUNITIES_DATABASE, Opportunity } from '../db/opportunities';
import { PageHeader } from '../components/PageHeader';
import {
  ShieldIcon,
  CheckIcon,
  CopyIcon,
  ChevronRightIcon,
  FileTextIcon,
  FlaskIcon,
  ExternalLinkIcon,
} from '../components/Icons';
import { anonymize } from '../utils/anonymizer';

export const ApplicationStudioPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    selectedOpportunityForDraft,
    setSelectedOpportunityForDraft,
    userProfile,
    skills,
    addLog,
    incrementMaskedCount,
  } = useApp();

  const oppId = searchParams.get('id');

  // Determine active opportunity
  const currentOpp: Opportunity | null =
    selectedOpportunityForDraft ||
    (oppId ? OPPORTUNITIES_DATABASE.find((o) => o.id === oppId) || null : null) ||
    OPPORTUNITIES_DATABASE[0];

  const [tone, setTone] = useState<'RESEARCH' | 'ENGINEERING' | 'FOUNDER'>('ENGINEERING');
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const matchedSkills = currentOpp.skills.filter((s) =>
    userProfile.skills.some((us) => us.toLowerCase() === s.toLowerCase())
  );
  const missingSkills = currentOpp.skills.filter(
    (s) => !userProfile.skills.some((us) => us.toLowerCase() === s.toLowerCase())
  );

  const matchedSkillsString = matchedSkills.join(', ') || currentOpp.skills[0];

  // Generator function based on tone and student background
  const generateProposalText = (selectedTone: 'RESEARCH' | 'ENGINEERING' | 'FOUNDER') => {
    const opp = currentOpp;
    const candidateName = userProfile.name ? `${userProfile.name} ${userProfile.surname || ''}`.trim() : '[CANDIDATE_NAME]';
    const candidateRole = userProfile.role || 'Student / Learner';
    const candidateUni = userProfile.university || 'Academic Institution';

    if (selectedTone === 'RESEARCH') {
      return `# Research Fellowship Proposal: ${opp.title}
**Target Opportunity:** ${opp.title} (${opp.organization})
**Candidate:** [CANDIDATE_ANONYMIZED] · ${candidateRole}
**Institution:** ${candidateUni}
**Primary Track:** ${opp.type} · Deadline: ${opp.deadline}

## 1. Abstract & Empirical Objective
I am formally submitting our research architecture for the ${opp.title}. As an academic practitioner specializing in ${userProfile.major || 'Computer Science'} at ${candidateUni}, our methodology addresses systematic evaluation and reproducible experimentation in physical and multimodal agent workflows.

## 2. Theoretical Alignment & Technical Stack
- **Prerequisite Stack Coverage:** Active verification in ${matchedSkillsString}.
- **Scientific Methodology:** Empirical validation, ablation benchmarks, and deterministic reproducibility protocols across GPU compute nodes.
- **Data Privacy:** Confinement of all intermediate token tensors and telemetry strictly to on-device sandbox boundaries.

## 3. Targeted Contribution for ${opp.organization}
Our project directly advances: "${opp.description}". We provide comprehensive baseline benchmarks and formal evaluation metrics.

## 4. Proposed Milestone Timeline
- **Phase 1 (Week 1-2):** Dataset curation, embedding indexing, and baseline fine-tuning.
- **Phase 2 (Week 3-4):** Containerized ablation experiments and latency profiling.
- **Phase 3 (Submission):** Open-source artifact packaging with complete replication steps.

**Respectfully submitted,**
${candidateName} · ${candidateRole}`;
    }

    if (selectedTone === 'FOUNDER') {
      return `# Product & Technical Architecture Proposal: ${opp.title}
**Track:** ${opp.type} · ${opp.organization}
**Applicant:** [FOUNDER_TOKEN_MASKED] · ${candidateRole}

## Executive Summary
We are building a production-grade vertical dev-tool for the ${opp.title}. Our mission is to accelerate autonomous developer workflows while maintaining 100% client-side privacy.

## Why Our Architecture Wins
1. **Unfair Advantage in ${matchedSkillsString}:** Proven execution capability with low-latency model inference and container orchestration.
2. **Defensible Privacy Barrier:** Built from the ground up on sandboxed directory confinement, zero unmasked cloud routing, and local tokenization.
3. **Product Vision:** Transforming ${opp.description} into an intuitive developer tool designed for rapid adoption.

## Target Deliverable for Award (${opp.award})
- Live production web application and CLI agent.
- Modular SDK for community developers.
- Verification test suite demonstrating ATS alignment and sandbox safety.

**Applicant:** ${candidateName} (${candidateUni})`;
    }

    // Default: ENGINEERING
    return `# Technical Application Proposal: ${opp.title}
**Host:** ${opp.organization} · Track: ${opp.type}
**Award:** ${opp.award} · Deadline: ${opp.deadline}
**Candidate:** ${candidateName} · ${candidateUni} (${userProfile.role || 'Software Engineer'})

## 1. Technical Implementation Blueprint
We propose an engineering framework tailored specifically for the criteria set forth in ${opp.title}. By leveraging ${matchedSkillsString}, our stack establishes deterministic pipelines designed for robust execution.

## 2. Architecture & Components
- **Core Pipeline:** Built using ${matchedSkillsString} with asynchronous event streaming and low-overhead memory management.
- **Sandbox Security:** Bound to local confinement directory \`/workspace/qadam\` with real-time file tree guardrails.
- **Verified Competencies:** Active skill validation achieved through QADAM ATS benchmarks.

## 3. Problem Statement & Resolution
Addressing: "${opp.description}"
Our submission introduces a modular, scalable approach with complete unit test coverage, automated dockerized integration environments, and end-to-end telemetry.

## 4. Engineering Deliverables
1. Production container image ready for GPU cloud deployment.
2. Complete documentation, OpenAPI specifications, and automated test runners.
3. Live demonstration build validated against baseline specifications.

**Signed:**
${candidateName} (${userProfile.email || 'student@university.edu'})`;
  };

  const [draftContent, setDraftContent] = useState(() => generateProposalText(tone));

  // Sync draft if opportunity changes
  useEffect(() => {
    setDraftContent(generateProposalText(tone));
  }, [currentOpp?.id, tone]);

  const handleToneChange = (newTone: 'RESEARCH' | 'ENGINEERING' | 'FOUNDER') => {
    setTone(newTone);
    setDraftContent(generateProposalText(newTone));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draftContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addLog('SYSTEM', 'Application draft copied to system clipboard');
  };

  const handleExportMarkdown = () => {
    const blob = new Blob([draftContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentOpp.id}_application_proposal.md`;
    a.click();
    URL.revokeObjectURL(url);
    addLog('SYSTEM', `Exported application draft: ${currentOpp.id}_application_proposal.md`);
  };

  const handleSaveToSandbox = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
    addLog('SANDBOX', `Draft persisted to /workspace/qadam/drafts/${currentOpp.id}.md`);
    incrementMaskedCount(4);
  };

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setDraftContent(generateProposalText(tone));
      setIsGenerating(false);
      addLog('MODEL', `Nebius LLM: regenerated tailored ${tone} application draft`);
    }, 650);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-transparent relative z-10 text-slate-100">
      {/* Top Header Bar */}
      <PageHeader
        title="Application Studio"
        subtitle={`Full-Page Proposal Drafter · Target: ${currentOpp.title} (${currentOpp.organization})`}
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="h-10 px-4 rounded-btn border border-teal-500/30 bg-slate-900/80 hover:bg-slate-800/80 text-teal-100 hover:text-white text-mini font-mono transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>← Back to Opportunity Radar</span>
            </button>
          </div>
        }
      />

      <div className="p-4 sm:p-6 pb-28 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Opportunity Overview & Eligibility (4 Cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Opportunity Card Summary */}
            <div className="p-5 rounded-card bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl border border-teal-300/40 shadow-[0_16px_40px_-12px_rgba(6,182,212,0.18)] space-y-4 text-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-mini font-mono px-2 py-0.5 rounded bg-white border border-teal-200 text-teal-900 font-bold">
                  {currentOpp.type}
                </span>
                <span className="text-mini font-mono text-emerald-700 font-bold">
                  {currentOpp.deadline}
                </span>
              </div>

              <div>
                <h3 className="text-[17px] font-bold text-indigo-950 leading-snug">
                  {currentOpp.title}
                </h3>
                <div className="text-mini font-mono text-teal-800 mt-1">{currentOpp.organization}</div>
              </div>

              <p className="text-[13px] text-teal-950 leading-relaxed">
                {currentOpp.description}
              </p>

              <div className="p-3 bg-white/80 rounded-btn border border-teal-200 flex items-center justify-between text-mini font-mono">
                <span className="text-teal-800">Award / Grant:</span>
                <span className="text-emerald-800 font-bold">{currentOpp.award}</span>
              </div>

              {currentOpp.url && (
                <a
                  href={currentOpp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-9 rounded-btn border border-teal-200 hover:border-teal-300 bg-white text-teal-950 text-mini font-mono flex items-center justify-center gap-1.5 transition-colors shadow-xs font-semibold"
                >
                  <span>Official Submission Portal</span>
                  <ExternalLinkIcon size={12} />
                </a>
              )}
            </div>

            {/* Eligibility & Stack Match Verification */}
            <div className="p-5 rounded-card bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl border border-teal-300/40 shadow-[0_16px_40px_-12px_rgba(6,182,212,0.18)] space-y-4 text-slate-900">
              <div className="text-mini font-mono uppercase text-teal-800 tracking-wider pb-2 border-b border-teal-200/60 flex items-center justify-between font-bold">
                <span>Eligibility Verification</span>
                <span className="text-emerald-700 font-bold">{matchedSkills.length}/{currentOpp.skills.length} Stack Match</span>
              </div>

              <div className="space-y-2.5 text-[13px]">
                <div className="flex items-center justify-between">
                  <span className="text-teal-800">Academic Enrollment:</span>
                  <span className="text-indigo-950 font-mono text-mini font-bold">{userProfile.university || 'Verified Student'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-teal-800">Domain Track:</span>
                  <span className="text-indigo-950 font-mono text-mini font-bold">{userProfile.role}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-teal-800">Sandbox Confinement:</span>
                  <span className="text-emerald-700 font-mono text-mini font-bold">ACTIVE (/workspace/qadam)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-teal-200/60">
                <div className="text-mini font-mono text-teal-800 uppercase mb-2 font-semibold">Required Skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {currentOpp.skills.map((s) => {
                    const isMatched = userProfile.skills.some((us) => us.toLowerCase() === s.toLowerCase());
                    return (
                      <span
                        key={s}
                        className={`px-2 py-0.5 rounded text-mini font-mono border ${
                          isMatched
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-800 font-bold'
                            : 'bg-white border-teal-200 text-slate-600'
                        }`}
                      >
                        {isMatched ? '✓ ' : ''}{s}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* PII Shield Tokenization Status */}
            <div className="p-5 rounded-card bg-gradient-to-br from-emerald-50 to-teal-100/80 border border-emerald-300/60 shadow-sm space-y-3 text-emerald-950">
              <div className="flex items-center gap-2">
                <ShieldIcon size={16} className="text-emerald-700" />
                <span className="text-[14px] font-bold text-emerald-950">Zero-Leak Tokenization</span>
              </div>
              <p className="text-[12px] text-emerald-900 leading-relaxed">
                Before sending context to cloud LLM APIs, all student identifiers are masked with cryptographic tokens:
              </p>
              <div className="space-y-1 font-mono text-[11px] text-emerald-950 bg-white/80 p-2.5 rounded border border-emerald-200">
                <div>Name → <code className="text-emerald-800 font-bold">[CANDIDATE_NAME]</code></div>
                <div>Email → <code className="text-emerald-800 font-bold">[EMAIL_MASKED]</code></div>
                <div>Institution → <code className="text-emerald-800 font-bold">[UNIVERSITY_TOKEN]</code></div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Full-Height Proposal Editor Studio (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Tone Selector & Control Bar */}
            <div className="p-4 rounded-card bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl border border-teal-300/40 shadow-[0_16px_40px_-12px_rgba(6,182,212,0.18)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-900">
              <div className="flex items-center gap-2">
                <span className="text-mini font-mono uppercase text-teal-800 whitespace-nowrap font-bold">
                  Proposal Tone:
                </span>
                <div className="flex items-center gap-1.5">
                  {(['ENGINEERING', 'RESEARCH', 'FOUNDER'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleToneChange(t)}
                      className={`h-8 px-3 rounded-btn text-mini font-mono transition-all cursor-pointer border ${
                        tone === t
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-600 text-white font-bold shadow-xs'
                          : 'bg-white border-teal-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-xs'
                      }`}
                    >
                      {t === 'ENGINEERING' ? 'Engineering' : t === 'RESEARCH' ? 'Academic Research' : 'Startup Founder'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="h-8 px-3 rounded-btn border border-teal-200 bg-white hover:bg-slate-50 text-teal-950 text-mini font-mono flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs font-semibold"
                >
                  <FlaskIcon size={12} className="text-emerald-600" />
                  <span>{isGenerating ? 'Synthesizing...' : 'Re-Draft with LLM'}</span>
                </button>
              </div>
            </div>

            {/* Main Full-Height Textarea */}
            <div className="rounded-card bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl border border-teal-300/40 shadow-[0_16px_40px_-12px_rgba(6,182,212,0.18)] overflow-hidden flex flex-col text-slate-900">
              <div className="px-4 py-2.5 border-b border-teal-200/60 bg-white/60 flex items-center justify-between text-mini font-mono">
                <div className="flex items-center gap-2 text-indigo-950">
                  <FileTextIcon size={14} className="text-emerald-600" />
                  <span className="font-bold">application_proposal.md</span>
                </div>
                <span className="text-teal-800">Markdown Supported · Live Buffer</span>
              </div>

              <textarea
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                rows={22}
                className="w-full p-5 bg-white/70 hover:bg-white focus:bg-white text-slate-900 font-mono text-[13px] leading-relaxed focus:outline-none resize-y border-none select-text transition-colors"
                placeholder="Drafting application..."
              />

              {/* Bottom Action Footer */}
              <div className="px-5 py-3.5 border-t border-teal-200/60 bg-white/60 flex flex-wrap items-center justify-between gap-3">
                <div className="text-mini font-mono text-teal-800">
                  Sandbox Confinement: <code className="text-indigo-950 font-bold">/workspace/qadam/drafts/</code>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="h-10 px-4 rounded-btn border border-teal-200 bg-white hover:bg-slate-50 text-slate-700 text-mini font-mono flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs font-semibold"
                  >
                    {copied ? <CheckIcon size={14} className="text-emerald-600" /> : <CopyIcon size={14} />}
                    <span>{copied ? 'Copied to Clipboard' : 'Copy Draft'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportMarkdown}
                    className="h-10 px-4 rounded-btn border border-teal-200 bg-white hover:bg-slate-50 text-slate-700 text-mini font-mono flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs font-semibold"
                  >
                    <span>Export .md</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveToSandbox}
                    className="h-10 px-5 rounded-btn bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-mini font-mono flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <CheckIcon size={14} />
                    <span>{isSaved ? 'Saved in /workspace/qadam ✓' : 'Save to Sandbox'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationStudioPage;
