import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/PageHeader';
import { USER_ROLES, POPULAR_TECH_STACK, CAREER_OBJECTIVES } from '../db/userProfile';
import {
  CheckIcon,
  ShieldIcon,
  LockIcon,
  RefreshIcon,
  EyeIcon,
  EyeOffIcon,
  UserIcon,
  UploadIcon,
  TrashIcon,
  TerminalIcon,
  AlertTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '../components/Icons';
import { TogglePill } from '../components/TogglePill';
import { anonymize } from '../utils/anonymizer';

export const ProfilePage: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    setIsOnboardingOpen,
    resetToDefaultProfile,
    skills,
    addLog,
    privacySettings,
    togglePrivacySetting,
    maskedCountThisSession,
    fieldsMaskedPerRequest,
    incrementMaskedCount,
    logs,
    triggerBlockedSandboxAction,
    runTavilySearch,
  } = useApp();

  const [name, setName] = useState(userProfile.name || '');
  const [surname, setSurname] = useState(userProfile.surname || '');
  const [email, setEmail] = useState(userProfile.email || '');
  const [password, setPassword] = useState(userProfile.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const [university, setUniversity] = useState(userProfile.university || '');
  const [major, setMajor] = useState(userProfile.major || '');
  const [degree, setDegree] = useState(userProfile.degree || '');
  const [location, setLocation] = useState(userProfile.location || '');
  const [role, setRole] = useState(userProfile.role || USER_ROLES[0]);
  const [cvText, setCvText] = useState(userProfile.cvText || '');
  const [isPublic, setIsPublic] = useState(userProfile.isPublic);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Avatar upload state
  const [avatarUrl, setAvatarUrl] = useState<string>(userProfile.avatarUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedSkills, setSelectedSkills] = useState<string[]>(userProfile.skills || []);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(userProfile.goals || []);

  // Bottom Embedded Section Tabs
  const [bottomTab, setBottomTab] = useState<'PRIVACY' | 'LOGS'>('PRIVACY');

  // Privacy Shield state
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [activeDispatching, setActiveDispatching] = useState(false);

  // Logs Terminal state
  const [activeLogFilter, setActiveLogFilter] = useState<'ALL' | 'SYSTEM' | 'SANDBOX' | 'MODEL' | 'WARNING'>('ALL');
  const [commandInput, setCommandInput] = useState('');
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Please upload an image smaller than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setAvatarUrl(result);
        addLog('SYSTEM', `Uploaded custom user avatar (${(file.size / 1024).toFixed(1)} KB)`);
      }
    };
    reader.readAsDataURL(file);
  };

  const clearUploadedAvatar = () => {
    setAvatarUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    updateUserProfile({
      name: name.trim(),
      surname: surname.trim(),
      email: email.trim(),
      password,
      university: university.trim(),
      major: major.trim(),
      degree: degree.trim(),
      location: location.trim(),
      role,
      skills: selectedSkills,
      goals: selectedGoals,
      cvText,
      avatarUrl,
      isPublic,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    addLog('SYSTEM', 'Local user profile saved to sovereign storage: qadam_user');
  };

  const initials = [name?.[0], surname?.[0]].filter(Boolean).join('').toUpperCase() || 'Q';

  // Privacy payload testing
  const candidateName = name || 'Candidate';
  const candidateEmail = email || 'student@university.edu';
  const candidatePhone = userProfile.phone || '+1 555-0199';
  const candidateId = userProfile.nationalId || '987654321';

  const testPayloadInput = JSON.stringify(
    {
      name: candidateName,
      phone: candidatePhone,
      id: candidateId,
      email: candidateEmail,
      task: 'Draft application',
      skills: selectedSkills.slice(0, 3),
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

  // Terminal commands
  const filteredLogs = logs.filter((log) => {
    if (activeLogFilter === 'ALL') return true;
    if (activeLogFilter === 'WARNING') return log.tag === 'SANDBOX WARNING' || log.isWarning;
    return log.tag === activeLogFilter;
  });

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim();
    if (!cmd) return;

    addLog('SYSTEM', `$ /workspace/qadam > ${cmd}`);

    const lower = cmd.toLowerCase();
    if (lower === 'help') {
      addLog('SYSTEM', 'Available commands: openshell status, cat MEMORY.md, tavily search, access /root/system, clear');
    } else if (lower.includes('access /root') || lower.includes('/root/system')) {
      triggerBlockedSandboxAction();
    } else if (lower.includes('status')) {
      addLog('SANDBOX', 'OpenShell Status: ACTIVE · Directory Jail: /workspace/qadam · Confinement: 100%');
    } else if (lower.includes('tavily')) {
      runTavilySearch();
    } else if (lower.includes('memory') || lower.includes('cat')) {
      addLog('SYSTEM', 'Reading local MEMORY.md: profile directives active');
    } else {
      addLog('SYSTEM', `Execution acknowledged: "${cmd}" within sandbox environment.`);
    }

    setCommandInput('');
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-bg text-text">
      <PageHeader
        title="Settings & Profile"
        subtitle={`Sovereign Profile Management · Candidate: ${name || 'Candidate'} · Local Sandbox Confinement`}
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsOnboardingOpen(true)}
              className="h-10 px-3.5 rounded-btn border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 text-mini font-mono transition-colors cursor-pointer"
            >
              Restart Registration
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="h-10 px-5 bg-accent hover:bg-emerald-500 text-zinc-950 font-semibold rounded-btn text-mini font-mono transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <CheckIcon size={14} />
              <span>{saveSuccess ? 'Changes Saved ✓' : 'Save Profile Changes'}</span>
            </button>
          </div>
        }
      />

      <div className="p-6">
        <div className="max-w-[1020px] mx-auto space-y-6">
          {/* Section 1: Avatar & Identity Header */}
          <div className="p-5 rounded-card bg-surface border border-border space-y-4">
            <div className="text-mini font-mono uppercase text-muted-2 tracking-wider pb-2 border-b border-border flex items-center justify-between">
              <span>Candidate Identity & Avatar</span>
              <span className="text-mini font-mono text-accent">Client-Side Stored</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="relative group flex-shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={name || 'User avatar'}
                    className="w-20 h-20 rounded-full object-cover border-2 border-zinc-700"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center text-xl font-mono font-bold text-zinc-200">
                    {initials}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload profile picture"
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-zinc-800 border border-zinc-600 text-zinc-200 hover:text-text shadow-sm cursor-pointer"
                >
                  <UploadIcon size={12} />
                </button>
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-9 px-3.5 rounded-btn bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-mini font-mono transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <UploadIcon size={13} />
                    <span>Upload Custom Photo</span>
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={clearUploadedAvatar}
                      className="h-9 px-3 rounded-btn border border-red-500/30 text-red-400 hover:bg-red-500/10 text-mini font-mono transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <TrashIcon size={12} />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
                <p className="text-[12px] text-muted-2">
                  Supports PNG, JPG, or SVG under 2MB. Your photo is converted locally and never exposed in external search results.
                </p>
              </div>
            </div>

            {/* Name inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="First name"
                  className="w-full h-11 px-3.5 bg-sidebar border border-border rounded-btn text-[13px] text-text focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  placeholder="Last name"
                  className="w-full h-11 px-3.5 bg-sidebar border border-border rounded-btn text-[13px] text-text focus:border-accent focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Academic & Professional Profile */}
          <div className="p-5 rounded-card bg-surface border border-border space-y-4">
            <div className="text-mini font-mono uppercase text-muted-2 tracking-wider pb-2 border-b border-border">
              Academic & Professional Standing
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                  Academic / Professional Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full h-11 px-3.5 bg-sidebar border border-border rounded-btn text-[13px] text-text focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                  Primary Role / Track
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full h-11 px-3 bg-sidebar border border-border rounded-btn text-[13px] text-text font-mono focus:border-accent focus:outline-none cursor-pointer"
                >
                  {USER_ROLES.map((r) => (
                    <option key={r} value={r} className="bg-zinc-950 text-text">
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                  University / Institution
                </label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="e.g. Stanford University, MIT"
                  className="w-full h-11 px-3.5 bg-sidebar border border-border rounded-btn text-[13px] text-text focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                  Department / Major
                </label>
                <input
                  type="text"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="e.g. Computer Science, Robotics"
                  className="w-full h-11 px-3.5 bg-sidebar border border-border rounded-btn text-[13px] text-text focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                  Academic Degree (Optional)
                </label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="e.g. B.S., M.S., Ph.D. Candidate"
                  className="w-full h-11 px-3.5 bg-sidebar border border-border rounded-btn text-[13px] text-text focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                  Current Location / City
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Almaty, Tokyo, San Francisco"
                  className="w-full h-11 px-3.5 bg-sidebar border border-border rounded-btn text-[13px] text-text focus:border-accent focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Confidential & Security */}
          <div className="p-5 rounded-card bg-surface border border-border space-y-4">
            <div className="text-mini font-mono uppercase text-muted-2 tracking-wider pb-2 border-b border-border flex items-center justify-between">
              <span>Confidential & Security</span>
              <span className="text-mini font-mono text-muted flex items-center gap-1.5">
                <LockIcon size={12} className="text-accent" />
                <span>Encrypted on Device</span>
              </span>
            </div>

            <div>
              <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                Account Password
              </label>
              <div className="relative max-w-md">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-3.5 pr-10 bg-sidebar border border-border rounded-btn text-[13px] text-text font-mono focus:border-accent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text cursor-pointer"
                >
                  {showPassword ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
                </button>
              </div>
              <p className="text-[12px] text-muted-2 mt-1.5 font-mono">
                Stored strictly in your local encrypted browser storage. Never transmitted unencrypted.
              </p>
            </div>
          </div>

          {/* Section 4: Active Technical Stack */}
          <div className="p-5 rounded-card bg-surface border border-border space-y-4">
            <div className="text-mini font-mono uppercase text-muted-2 tracking-wider pb-2 border-b border-border flex items-center justify-between">
              <span>Active Technical Stack ({selectedSkills.length} selected)</span>
              <span className="text-mini text-accent font-mono">Radar Match Driver</span>
            </div>

            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
              {POPULAR_TECH_STACK.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                const isVerified = skills.find((s) => s.name === skill)?.status === 'VERIFIED';
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`h-9 px-3 rounded-btn text-mini font-mono border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-accent/15 border-accent text-text font-semibold shadow-sm'
                        : 'bg-sidebar border-border text-muted hover:border-zinc-700 hover:text-text'
                    }`}
                  >
                    {isVerified ? (
                      <span className="text-accent text-mini">✓</span>
                    ) : isSelected ? (
                      <CheckIcon size={12} className="text-accent" />
                    ) : (
                      <span className="text-muted-2 text-mini">+</span>
                    )}
                    <span>{skill}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Target Objectives */}
          <div className="p-5 rounded-card bg-surface border border-border space-y-4">
            <div className="text-mini font-mono uppercase text-muted-2 tracking-wider pb-2 border-b border-border flex items-center justify-between">
              <span>Target Opportunity Tracks ({selectedGoals.length} selected)</span>
              <span className="text-mini text-muted font-mono">Notification Priorities</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {CAREER_OBJECTIVES.map((goal) => {
                const isSelected = selectedGoals.includes(goal);
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => toggleGoal(goal)}
                    className={`h-9 px-3 rounded-btn text-mini font-mono border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-accent/15 border-accent text-text font-semibold shadow-sm'
                        : 'bg-sidebar border-border text-muted hover:border-zinc-700 hover:text-text'
                    }`}
                  >
                    {isSelected && <CheckIcon size={12} className="text-accent" />}
                    <span>{goal}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 6: Resume Highlights */}
          <div className="p-5 rounded-card bg-surface border border-border space-y-3">
            <div className="text-mini font-mono uppercase text-muted-2 tracking-wider pb-2 border-b border-border">
              Resume Text / Project Summary (for ATS Gap Analysis)
            </div>
            <textarea
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              rows={4}
              placeholder="Paste CV summary, publications, or project bullet points for ATS gap analysis..."
              className="w-full p-3.5 bg-sidebar border border-border rounded-btn text-[12px] font-mono text-text focus:border-accent focus:outline-none leading-relaxed select-text"
            />
          </div>

          {/* Section 7: Discovery & Reset Controls */}
          <div className="p-5 rounded-card bg-surface border border-border space-y-4">
            <div className="text-mini font-mono uppercase text-muted-2 tracking-wider pb-2 border-b border-border">
              Candidate Pool Discovery
            </div>

            <div className="min-h-[52px] px-3 rounded-btn flex items-center justify-between gap-4 hover:bg-surface-hover/50 transition-colors">
              <div>
                <div className="text-[13px] font-medium text-text">
                  Make profile discoverable in Hackathon Candidate Pool
                </div>
                <div className="text-mini font-mono text-muted">
                  Allows teams searching for {role} to view anonymized qualifications in Teammates & Network
                </div>
              </div>
              <TogglePill
                checked={isPublic}
                onChange={(checked) => setIsPublic(checked)}
                label="Make profile discoverable"
              />
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between">
              <span className="text-mini font-mono text-muted-2">
                Erase local profile and restart onboarding from scratch
              </span>
              <button
                type="button"
                onClick={resetToDefaultProfile}
                className="h-10 px-4 rounded-btn border border-warning/40 text-warning hover:bg-warning/10 text-mini font-mono transition-colors cursor-pointer"
              >
                Reset Local Profile Data
              </button>
            </div>
          </div>

          {/* SECTION 8: EMBEDDED SYSTEM BOUNDARIES, PRIVACY SHIELD & SANDBOX LOGS */}
          <div className="rounded-card bg-surface border border-border overflow-hidden">
            {/* Tab Header Bar */}
            <div className="px-5 py-3 border-b border-border bg-[#18181b] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldIcon size={16} className="text-accent" />
                <span className="text-[14px] font-semibold text-text">System Boundaries & Security Architecture</span>
              </div>

              {/* Architectural Tab Switcher */}
              <div className="flex items-center gap-1.5 p-1 bg-zinc-950 rounded-btn border border-border">
                <button
                  type="button"
                  onClick={() => setBottomTab('PRIVACY')}
                  className={`h-8 px-3 rounded-btn text-mini font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
                    bottomTab === 'PRIVACY'
                      ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-sm'
                      : 'text-muted hover:text-text'
                  }`}
                >
                  <ShieldIcon size={12} className={bottomTab === 'PRIVACY' ? 'text-accent' : ''} />
                  <span>Privacy Shield & PII Engine</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBottomTab('LOGS')}
                  className={`h-8 px-3 rounded-btn text-mini font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
                    bottomTab === 'LOGS'
                      ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-sm'
                      : 'text-muted hover:text-text'
                  }`}
                >
                  <TerminalIcon size={12} className={bottomTab === 'LOGS' ? 'text-accent' : ''} />
                  <span>Sandbox Logs & Terminal</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT 1: PRIVACY SHIELD */}
            {bottomTab === 'PRIVACY' && (
              <div className="p-6 space-y-6 bg-surface">
                {/* Status banner */}
                <div className="p-5 rounded-card bg-[#121215] border border-[#059669]/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                      <h4 className="text-[15px] font-semibold text-text">
                        Client-Side PII Anonymization Engine: Active
                      </h4>
                    </div>
                    <p className="text-[13px] text-muted max-w-lg leading-relaxed">
                      Personal identifiers are cryptographically masked with sovereign tokens before data leaves your browser. Only anonymous tokens reach external LLM endpoints.
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {['Name', 'Email', 'Phone', 'National ID'].map((f) => (
                        <span key={f} className="px-2 py-0.5 rounded text-[11px] font-mono border border-border text-zinc-300 bg-zinc-900">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-border md:pl-6 flex-shrink-0">
                    <div>
                      <div className="text-[26px] font-mono font-bold text-accent leading-none">
                        {fieldsMaskedPerRequest}
                      </div>
                      <div className="text-[11px] font-mono text-muted mt-1">fields masked / req</div>
                    </div>
                    <div>
                      <div className="text-[26px] font-mono font-bold text-text leading-none">
                        {maskedCountThisSession}
                      </div>
                      <div className="text-[11px] font-mono text-muted mt-1">masked this session</div>
                    </div>
                  </div>
                </div>

                {/* Privacy Settings Toggles */}
                <div className="rounded-card bg-[#121215] border border-border p-4 space-y-2">
                  <div className="text-mini font-mono uppercase text-muted-2 tracking-wider pb-2 border-b border-border">
                    Sovereignty Toggles
                  </div>

                  <div className="min-h-[50px] px-3 rounded-btn flex items-center justify-between gap-4 hover:bg-zinc-900/60 transition-colors">
                    <div>
                      <div className="text-[13px] font-medium text-text">Store preferences in local MEMORY.md</div>
                      <div className="text-mini font-mono text-muted-2">localStorage / local client storage</div>
                    </div>
                    <TogglePill
                      checked={privacySettings.storeMemoryLocal}
                      onChange={() => togglePrivacySetting('storeMemoryLocal')}
                      label="Store preferences in local MEMORY.md"
                    />
                  </div>

                  <div className="min-h-[50px] px-3 rounded-btn flex items-center justify-between gap-4 hover:bg-zinc-900/60 transition-colors">
                    <div>
                      <div className="text-[13px] font-medium text-text">Restrict agent execution to OpenShell sandbox</div>
                      <div className="text-mini font-mono text-accent">STRICT JAIL (/workspace/qadam)</div>
                    </div>
                    <TogglePill
                      checked={privacySettings.restrictOpenShellSandbox}
                      onChange={() => togglePrivacySetting('restrictOpenShellSandbox')}
                      label="Restrict agent execution to sandbox"
                    />
                  </div>

                  <div className="min-h-[50px] px-3 rounded-btn flex items-center justify-between gap-4 opacity-50 cursor-not-allowed bg-zinc-900/30">
                    <div>
                      <div className="text-[13px] text-muted">Send unmasked contact details to cloud APIs</div>
                      <div className="text-mini font-mono text-muted-2">Permanently blocked by sovereign policy</div>
                    </div>
                    <TogglePill checked={false} disabled onChange={() => {}} label="Send unmasked contact details" />
                  </div>
                </div>

                {/* Payload Inspector Accordion */}
                <div className="rounded-card bg-[#121215] border border-border overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                    className="w-full min-h-[48px] px-4 py-2.5 flex items-center justify-between text-left hover:bg-zinc-900 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-mini font-mono text-text font-semibold">Inspect Raw JSON Payload</span>
                      <span className="text-mini font-mono text-muted-2">(Before vs. After Token Masking)</span>
                    </div>
                    <div className="flex items-center gap-2 text-mini font-mono text-muted">
                      <span>{isAccordionOpen ? 'Collapse' : 'Expand'}</span>
                      {isAccordionOpen ? <ChevronUpIcon size={14} /> : <ChevronDownIcon size={14} />}
                    </div>
                  </button>

                  {isAccordionOpen && (
                    <div className="p-4 border-t border-border space-y-4 bg-zinc-950/60">
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] font-mono text-muted">
                          Raw candidate payload processed on your machine before transmission:
                        </p>
                        <button
                          type="button"
                          onClick={handleSimulateDispatch}
                          disabled={activeDispatching}
                          className="h-9 px-3 rounded-btn border border-accent text-accent hover:bg-accent/10 text-mini font-mono flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <RefreshIcon size={13} className={activeDispatching ? 'animate-spin' : ''} />
                          <span>Test Masking Engine Live</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <div className="text-mini font-mono text-muted-2 uppercase">Local · Unmasked (Device Only)</div>
                          <pre className="p-3.5 rounded-btn bg-zinc-950 border border-border font-mono text-[11px] text-zinc-300 overflow-x-auto leading-relaxed">
                            {testPayloadInput}
                          </pre>
                        </div>

                        <div className="space-y-1.5">
                          <div className="text-mini font-mono text-accent uppercase">Transmitted to Cloud API (Tokenized)</div>
                          <pre className="p-3.5 rounded-btn bg-zinc-950 border border-border font-mono text-[11px] text-accent overflow-x-auto leading-relaxed">
                            {JSON.stringify(testResult, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: SANDBOX LOGS & TERMINAL */}
            {bottomTab === 'LOGS' && (
              <div className="p-6 space-y-5 bg-surface">
                {/* Mini cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-card bg-[#121215] border border-border flex items-center justify-between">
                    <div>
                      <div className="text-mini font-mono text-muted uppercase">Sandbox State</div>
                      <div className="text-[13px] font-mono font-semibold text-text mt-0.5 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                        <span>OpenShell: ACTIVE</span>
                      </div>
                    </div>
                    <span className="text-mini font-mono px-2 py-0.5 rounded bg-accent/10 text-accent border border-accent-border">
                      JAIL ON
                    </span>
                  </div>

                  <div className="p-3.5 rounded-card bg-[#121215] border border-border flex items-center justify-between">
                    <div>
                      <div className="text-mini font-mono text-muted uppercase">Allowed Confinement</div>
                      <div className="text-[12px] font-mono text-zinc-300 mt-0.5">/workspace/qadam</div>
                    </div>
                    <span className="text-mini font-mono text-muted-2">r/w</span>
                  </div>

                  <div className="p-3.5 rounded-card bg-[#121215] border border-border flex items-center justify-between">
                    <div>
                      <div className="text-mini font-mono text-muted uppercase">Security Jail Test</div>
                      <button
                        type="button"
                        onClick={triggerBlockedSandboxAction}
                        className="mt-1 text-mini font-mono text-warning hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <AlertTriangleIcon size={12} />
                        <span>Test Violation Block</span>
                      </button>
                    </div>
                    <span className="text-mini font-mono text-accent">403 SECURE</span>
                  </div>
                </div>

                {/* Filter tags */}
                <div className="flex items-center gap-1.5">
                  {(['ALL', 'SYSTEM', 'SANDBOX', 'MODEL', 'WARNING'] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setActiveLogFilter(filter)}
                      className={`h-7 px-2.5 rounded-btn text-mini font-mono transition-colors cursor-pointer ${
                        activeLogFilter === filter
                          ? 'bg-zinc-800 text-zinc-100 font-semibold border border-zinc-600'
                          : 'bg-zinc-950 text-muted hover:text-text border border-border'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* Terminal Stream */}
                <div className="rounded-card bg-zinc-950 border border-border overflow-hidden flex flex-col h-[380px]">
                  <div className="px-3.5 py-2 border-b border-border bg-[#18181b] flex items-center justify-between text-mini font-mono">
                    <span className="text-zinc-300">Live Execution Event Stream</span>
                    <span className="text-muted-2">buffer: 2048KB · session 0x4f2a</span>
                  </div>

                  <div className="p-3.5 flex-1 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1 bg-[#09090b]">
                    {filteredLogs.map((log) => {
                      const isWarning = log.tag === 'SANDBOX WARNING' || log.isWarning;
                      const isSandbox = log.tag === 'SANDBOX';
                      let tagColor = 'text-muted';
                      if (isSandbox) tagColor = 'text-accent font-semibold';
                      if (isWarning) tagColor = 'text-warning font-semibold';

                      return (
                        <div key={log.id} className="flex items-center px-1.5 py-0.5 rounded hover:bg-zinc-900/60">
                          <span className="text-muted-2 mr-2.5 select-none">{log.time}</span>
                          <span className={`inline-block w-[120px] flex-shrink-0 ${tagColor}`}>[{log.tag}]</span>
                          <span className={isWarning ? 'text-warning font-medium' : 'text-zinc-200'}>{log.message}</span>
                        </div>
                      );
                    })}
                    <div className="flex items-center px-1.5 pt-1 text-text font-mono">
                      <span className="text-accent mr-1.5">$</span>
                      <span className="text-muted mr-1">/workspace/qadam</span>
                      <span className="w-1.5 h-3.5 bg-text inline-block animate-cursor-blink ml-1" />
                    </div>
                    <div ref={terminalBottomRef} />
                  </div>

                  <form onSubmit={handleCommandSubmit} className="p-2.5 border-t border-border bg-[#121215] flex items-center gap-2">
                    <span className="text-accent font-mono text-[12px]">$</span>
                    <input
                      type="text"
                      value={commandInput}
                      onChange={(e) => setCommandInput(e.target.value)}
                      placeholder="Type command ('help', 'status', 'cat MEMORY.md', 'access /root/system')..."
                      className="flex-1 bg-transparent border-none text-[12px] font-mono text-zinc-100 placeholder:text-muted-2/50 focus:outline-none"
                    />
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
