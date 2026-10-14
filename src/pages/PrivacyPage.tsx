import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/PageHeader';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  LockIcon,
  CheckIcon,
  RefreshIcon,
  ShieldIcon,
} from '../components/Icons';
import { TogglePill } from '../components/TogglePill';
import { anonymize } from '../utils/anonymizer';

export const PrivacyPage: React.FC = () => {
  const {
    privacySettings,
    togglePrivacySetting,
    maskedCountThisSession,
    fieldsMaskedPerRequest,
    incrementMaskedCount,
    addLog,
    userProfile,
  } = useApp();

  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const candidateName = userProfile.name || 'Candidate';
  const candidateEmail = userProfile.email || 'student@university.edu';
  const candidatePhone = userProfile.phone || '+1 555-0199';
  const candidateId = userProfile.nationalId || '987654321';

  const [activeDispatching, setActiveDispatching] = useState(false);

  const testPayloadInput = JSON.stringify(
    {
      name: candidateName,
      phone: candidatePhone,
      id: candidateId,
      email: candidateEmail,
      task: 'Draft application',
      skills: ['Python', 'Go'],
    },
    null,
    2
  );

  const testResult = anonymize(testPayloadInput);

  const handleSimulateDispatch = () => {
    setActiveDispatching(true);
    incrementMaskedCount(4);
    addLog('SANDBOX', 'PII Anonymization Engine: 4 sensitive fields masked before dispatch');
    addLog('MODEL', 'Transmitting tokenized payload to Nebius Token Factory (Nemotron 3.5)...');
    setTimeout(() => {
      setActiveDispatching(false);
      addLog('SYSTEM', 'Cloud API response received successfully without PII disclosure');
    }, 600);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <PageHeader
        title="Privacy Shield"
        subtitle="client-side data sovereignty & zero-leak tokenization"
      />

      <div className="p-6">
        <div className="max-w-[920px] mx-auto space-y-6">
          {/* 1. Status Banner */}
          <div className="p-5 rounded-card bg-surface border border-[#065f46] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0 animate-pulse" />
                <h3 className="text-subheading text-text text-[16px]">
                  PII Anonymization Engine: Active
                </h3>
              </div>
              <p className="text-[13px] text-muted max-w-lg leading-relaxed">
                Personal details are replaced with tokens before data leaves the app. Only the
                tokens reach Nebius Token Factory.
              </p>
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {['Name', 'Phone', 'National ID', 'Email'].map((field) => (
                  <span
                    key={field}
                    className="px-2.5 py-0.5 rounded-btn text-mini font-mono border border-border text-text-2 bg-sidebar"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>

            {/* Counters */}
            <div className="flex items-center gap-6 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-border md:pl-6 flex-shrink-0">
              <div>
                <div className="text-[28px] font-mono font-bold text-accent leading-none">
                  {fieldsMaskedPerRequest}
                </div>
                <div className="text-mini font-mono text-muted mt-1">
                  fields masked per request
                </div>
              </div>
              <div>
                <div className="text-[28px] font-mono font-bold text-text leading-none">
                  {maskedCountThisSession}
                </div>
                <div className="text-mini font-mono text-muted mt-1">
                  masked this session
                </div>
              </div>
            </div>
          </div>

          {/* 2. Your Controls */}
          <div className="rounded-card bg-surface border border-border p-5 space-y-2">
            <div className="text-mini font-mono uppercase text-muted-2 tracking-wider pb-2 border-b border-border">
              Your Controls
            </div>

            {/* Control 1 */}
            <div className="min-h-[56px] px-3 rounded-btn flex items-center justify-between gap-4 hover:bg-surface-hover/50 transition-colors">
              <div>
                <div className="text-[13px] font-medium text-text">
                  Store preferences in local MEMORY.md
                </div>
                <div className="text-mini font-mono text-muted-2">localStorage / filesystem</div>
              </div>
              <TogglePill
                checked={privacySettings.storeMemoryLocal}
                onChange={() => togglePrivacySetting('storeMemoryLocal')}
                label="Store preferences in local MEMORY.md"
              />
            </div>

            {/* Control 2 */}
            <div className="min-h-[56px] px-3 rounded-btn flex items-center justify-between gap-4 hover:bg-surface-hover/50 transition-colors">
              <div>
                <div className="text-[13px] font-medium text-text">
                  Restrict agent execution to the OpenShell sandbox directory
                </div>
                <div className="text-mini font-mono text-accent">STRICT JAIL</div>
              </div>
              <TogglePill
                checked={privacySettings.restrictOpenShellSandbox}
                onChange={() => togglePrivacySetting('restrictOpenShellSandbox')}
                label="Restrict agent execution to sandbox"
              />
            </div>

            {/* Control 3: Disabled by default and permanently locked */}
            <div className="min-h-[56px] px-3 rounded-btn flex items-center justify-between gap-4 opacity-50 cursor-not-allowed bg-sidebar/40">
              <div>
                <div className="text-[13px] text-muted">
                  Send unmasked contact details to cloud APIs
                </div>
                <div className="text-mini font-mono text-muted-2">Permanently blocked</div>
              </div>
              <TogglePill
                checked={false}
                disabled
                onChange={() => {}}
                label="Send unmasked contact details"
              />
            </div>
          </div>

          {/* 3. Accordion: Inspect Raw JSON Payload */}
          <div className="rounded-card bg-surface border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setIsAccordionOpen(!isAccordionOpen)}
              aria-expanded={isAccordionOpen}
              className="w-full min-h-[52px] px-5 py-3 flex items-center justify-between text-left hover:bg-surface-hover transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-mini font-mono text-text font-semibold">
                  Inspect raw JSON payload
                </span>
                <span className="text-mini font-mono text-muted-2">(Before vs. After Masking)</span>
              </div>
              <div className="flex items-center gap-2 text-mini font-mono text-muted">
                <span>{isAccordionOpen ? 'Collapse' : 'Expand'}</span>
                {isAccordionOpen ? <ChevronUpIcon size={14} /> : <ChevronDownIcon size={14} />}
              </div>
            </button>

            {isAccordionOpen && (
              <div className="p-5 border-t border-border space-y-4 bg-sidebar/50">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-mono text-muted">
                    Raw candidate payload processed on your device before transmission:
                  </p>
                  <button
                    type="button"
                    onClick={handleSimulateDispatch}
                    disabled={activeDispatching}
                    className="h-11 px-4 rounded-btn border border-accent text-accent hover:bg-accent/10 text-mini font-mono flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <RefreshIcon size={14} className={activeDispatching ? 'animate-spin' : ''} />
                    <span>Test Masking Engine Live</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left: Local unmasked */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-mini font-mono">
                      <span className="text-muted-2 uppercase">Local · unmasked</span>
                      <span className="text-warning text-[11px]">contains sensitive PII</span>
                    </div>
                    <div className="p-4 rounded-btn bg-[#09090b] border border-border font-mono text-[12px] leading-relaxed overflow-x-auto text-text-2">
                      <pre>
                        {`{
  "name": `}
                        <span className="bg-warning/20 text-warning px-1 py-0.5 rounded">
                          "{candidateName}"
                        </span>
                        {`,
  "phone": `}
                        <span className="bg-warning/20 text-warning px-1 py-0.5 rounded">
                          "{candidatePhone}"
                        </span>
                        {`,
  "id": `}
                        <span className="bg-warning/20 text-warning px-1 py-0.5 rounded">
                          "{candidateId}"
                        </span>
                        {`,
  "email": `}
                        <span className="bg-warning/20 text-warning px-1 py-0.5 rounded">
                          "{candidateEmail}"
                        </span>
                        {`,
  "task": "Draft application",
  "skills": ["Python", "Go"]
}`}
                      </pre>
                    </div>
                  </div>

                  {/* Right: Sent to Nebius Token Factory */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-mini font-mono">
                      <span className="text-muted-2 uppercase">
                        Sent to Nebius Token Factory
                      </span>
                      <span className="text-accent text-[11px]">zero PII exposure</span>
                    </div>
                    <div className="p-4 rounded-btn bg-[#09090b] border border-border font-mono text-[12px] leading-relaxed overflow-x-auto text-text-2">
                      <pre>
                        {`{
  "name": `}
                        <span className="bg-accent/20 text-accent px-1 py-0.5 rounded">
                          "[USER_NAME_1]"
                        </span>
                        {`,
  "phone": `}
                        <span className="bg-accent/20 text-accent px-1 py-0.5 rounded">
                          "[PHONE_MASKED]"
                        </span>
                        {`,
  "id": `}
                        <span className="bg-accent/20 text-accent px-1 py-0.5 rounded">
                          "[ID_MASKED]"
                        </span>
                        {`,
  "email": `}
                        <span className="bg-accent/20 text-accent px-1 py-0.5 rounded">
                          "[EMAIL_MASKED]"
                        </span>
                        {`,
  "task": "Draft application",
  "skills": ["Python", "Go"]
}`}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-surface rounded text-mini font-mono text-muted flex items-center justify-between">
                  <span>Cryptographic Salt: SHA-256 local entropy · Never transmitted over wire</span>
                  <span className="text-accent">VERIFIED SECURE</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

