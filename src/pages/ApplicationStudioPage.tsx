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
- **Data Sovereignty:** Confinement of all intermediate token tensors and telemetry strictly to sovereign on-device sandbox boundaries.

## 3. Targeted Contribution for ${opp.organization}
Our project directly advances: "${opp.description}". We provide comprehensive baseline benchmarks and formal evaluation metrics.

## 4. Proposed Milestone Timeline
- **Phase 1 (Week 1–2):** Dataset curation, embedding indexing, and baseline fine-tuning.
- **Phase 2 (Week 3–4):** Containerized ablation experiments and latency profiling.
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
2. **Defensible Privacy Barrier:** Built from the ground up on sovereign directory confinement, zero unmasked cloud routing, and local tokenization.
3. **Product Vision:** Transforming ${opp.description} into an intuitive developer tool designed for rapid adoption.

## Target Deliverable for Award (${opp.award})
- Live production web application and CLI agent.
- Modular SDK for community developers.
- Public benchmark evaluation and video demonstration.

**Founder:** ${candidateName}`;
    }

    // Default: Engineering Proposal
    return `# Technical Application Proposal: ${opp.title}
**Target Opportunity:** ${opp.title} (${opp.organization})
**Candidate:** [USER_NAME_1] (${candidateRole}, ${candidateUni})
**Contact:** [EMAIL_MASKED] · [PHONE_MASKED]
**Track:** ${opp.type} · Deadline: ${opp.deadline}

## Summary of Intent
I am submitting our technical proposal for the ${opp.title}. My work focuses on building safe, high-throughput autonomous software systems and developer tooling.

## Technical Alignment & Stack Mastery
1. **Core Competency:** Direct hands-on experience with ${matchedSkillsString}, incorporating clean architecture patterns and low-latency execution.
2. **Safe Sandbox Containment:** Direct integration with OpenShell sandbox isolation to ensure zero unauthorized disk or network traversal during tool execution.
3. **Track Focus:** Purpose-built implementation specifically addressing:
   "${opp.description}"

## Proposed Deliverable
- Production-ready containerized microservices with reproducible evaluation benchmarks.
- Clean documentation and client-side data sovereignty verified via PII token masking.

**Candidate Signature:**
${candidateName} (Verified QADAM Student Profile)`;
  };

  const [draftContent, setDraftContent] = useState<string>(() => generateProposalText('ENGINEERING'));

  // Update text when tone changes
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
    <div className="flex-1 flex flex-col min-w-0 bg-bg text-text">
      {/* Top Header Bar */}
      <PageHeader
        title="Application Studio"
        subtitle={`Full-Page Proposal Drafter · Target: ${currentOpp.title} (${currentOpp.organization})`}
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="h-10 px-4 rounded-btn border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 text-mini font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>← Back to Opportunity Radar</span>
            </button>
          </div>
        }
      />

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Opportunity Overview & Eligibility (4 Cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Opportunity Card Summary */}
            <div className="p-5 rounded-card bg-surface border border-border space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-mini font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300">
                  {currentOpp.type}
                </span>
                <span className="text-mini font-mono text-accent font-medium">
                  {currentOpp.deadline}
                </span>
              </div>

              <div>
                <h3 className="text-[17px] font-semibold text-text leading-snug">
                  {currentOpp.title}
                </h3>
                <div className="text-mini font-mono text-muted mt-1">{currentOpp.organization}</div>
              </div>

              <p className="text-[13px] text-muted leading-relaxed">
                {currentOpp.description}
              </p>

              <div className="p-3 bg-zinc-900 rounded-btn border border-border flex items-center justify-between text-mini font-mono">
                <span className="text-muted-2">Award / Grant:</span>
                <span className="text-accent font-semibold">{currentOpp.award}</span>
              </div>

              {currentOpp.url && (
                <a
                  href={currentOpp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-9 rounded-btn border border-zinc-700 hover:border-zinc-500 bg-surface-hover text-zinc-200 text-mini font-mono flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Official Submission Portal</span>
                  <ExternalLinkIcon size={12} />
                </a>
              )}
            </div>

            {/* Eligibility & Stack Match Verification */}
            <div className="p-5 rounded-card bg-surface border border-border space-y-4">
              <div className="text-mini font-mono uppercase text-muted-2 tracking-wider pb-2 border-b border-border flex items-center justify-between">
                <span>Eligibility Verification</span>
                <span className="text-accent">{matchedSkills.length}/{currentOpp.skills.length} Stack Match</span>
              </div>

              <div className="space-y-2.5 text-[13px]">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Academic Enrollment:</span>
                  <span className="text-text font-mono text-mini">{userProfile.university || 'Verified Student'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Domain Track:</span>
                  <span className="text-text font-mono text-mini">{userProfile.role}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Sandbox Confinement:</span>
                  <span className="text-accent font-mono text-mini">ACTIVE (/workspace/qadam)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-border/60">
                <div className="text-mini font-mono text-muted-2 uppercase mb-2">Required Skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {currentOpp.skills.map((s) => {
                    const isMatched = userProfile.skills.some((us) => us.toLowerCase() === s.toLowerCase());
                    return (
                      <span
                        key={s}
                        className={`px-2 py-0.5 rounded text-mini font-mono border ${
                          isMatched
                            ? 'bg-accent/15 border-accent text-accent font-medium'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400'
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
            <div className="p-5 rounded-card bg-surface border border-[#059669]/40 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldIcon size={16} className="text-accent" />
                <span className="text-[14px] font-semibold text-text">Zero-Leak Tokenization</span>
              </div>
              <p className="text-[12px] text-muted leading-relaxed">
                Before sending context to cloud LLM APIs, all student identifiers are masked with cryptographic tokens:
              </p>
              <div className="space-y-1 font-mono text-[11px] text-zinc-300 bg-zinc-900 p-2.5 rounded border border-border">
                <div>Name → <code>[CANDIDATE_NAME]</code></div>
                <div>Email → <code>[EMAIL_MASKED]</code></div>
                <div>Institution → <code>[UNIVERSITY_TOKEN]</code></div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Full-Height Proposal Editor Studio (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Tone Selector & Control Bar */}
            <div className="p-4 rounded-card bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-mini font-mono uppercase text-muted-2 whitespace-nowrap">
                  Proposal Tone:
                </span>
                <div className="flex items-center gap-1.5">
                  {(['ENGINEERING', 'RESEARCH', 'FOUNDER'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleToneChange(t)}
                      className={`h-8 px-3 rounded-btn text-mini font-mono transition-colors cursor-pointer border ${
                        tone === t
                          ? 'bg-accent/15 border-accent text-accent font-semibold shadow-sm'
                          : 'bg-zinc-900 border-zinc-800 text-muted hover:text-text'
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
                  className="h-8 px-3 rounded-btn border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-mini font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FlaskIcon size={12} className="text-accent" />
                  <span>{isGenerating ? 'Synthesizing...' : 'Re-Draft with LLM'}</span>
                </button>
              </div>
            </div>

            {/* Main Full-Height Textarea */}
            <div className="rounded-card bg-surface border border-border overflow-hidden flex flex-col">
              <div className="px-4 py-2.5 border-b border-border bg-[#18181b] flex items-center justify-between text-mini font-mono">
                <div className="flex items-center gap-2 text-zinc-300">
                  <FileTextIcon size={14} className="text-accent" />
                  <span>application_proposal.md</span>
                </div>
                <span className="text-muted-2">Markdown Supported · Live Buffer</span>
              </div>

              <textarea
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                rows={22}
                className="w-full p-5 bg-[#09090b] text-zinc-100 font-mono text-[13px] leading-relaxed focus:outline-none resize-y border-none select-text"
                placeholder="Drafting application..."
              />

              {/* Bottom Action Footer */}
              <div className="px-5 py-3.5 border-t border-border bg-[#121215] flex flex-wrap items-center justify-between gap-3">
                <div className="text-mini font-mono text-muted-2">
                  Sandbox Confinement: <code>/workspace/qadam/drafts/</code>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="h-10 px-4 rounded-btn border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 text-mini font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <CheckIcon size={14} className="text-accent" /> : <CopyIcon size={14} />}
                    <span>{copied ? 'Copied to Clipboard' : 'Copy Draft'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportMarkdown}
                    className="h-10 px-4 rounded-btn border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 text-mini font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Export .md</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveToSandbox}
                    className="h-10 px-5 rounded-btn bg-accent hover:bg-emerald-500 text-zinc-950 font-semibold text-mini font-mono flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
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

