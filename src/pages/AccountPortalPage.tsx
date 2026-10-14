import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  USER_ROLES,
  POPULAR_TECH_STACK,
  CAREER_OBJECTIVES,
} from '../db/userProfile';
import { anonymize } from '../utils/anonymizer';
import {
  UserIcon,
  SettingsIcon,
  HelpCircleIcon,
  LogOutIcon,
  ChevronRightIcon,
  CheckIcon,
  ShieldIcon,
  AlertTriangleIcon,
  TerminalIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  MessageSquareIcon,
  SendIcon,
} from '../components/Icons';

type AccountTab = 'profile' | 'settings' | 'support';

const TogglePill: React.FC<{
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  label?: string;
}> = ({ checked, onChange, disabled = false, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label || 'Toggle setting'}
    disabled={disabled}
    onClick={onChange}
    className={`
      relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out
      ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
      ${checked ? 'bg-emerald-600' : 'bg-slate-200 border border-slate-300'}
    `}
  >
    <span
      className={`
        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out mt-0.5 ml-0.5
        ${checked ? 'translate-x-5' : 'translate-x-0'}
      `}
    />
  </button>
);

export const AccountPortalPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    userProfile,
    updateUserProfile,
    resetToDefaultProfile,
    privacySettings,
    togglePrivacySetting,
    maskedCountThisSession,
    fieldsMaskedPerRequest,
    incrementMaskedCount,
    logs,
    addLog,
    triggerBlockedSandboxAction,
    runTavilySearch,
  } = useApp();

  const tabParam = searchParams.get('tab') as AccountTab;
  const [activeTab, setActiveTab] = useState<AccountTab>(
    ['profile', 'settings', 'support'].includes(tabParam) ? tabParam : 'profile'
  );

  useEffect(() => {
    if (tabParam && ['profile', 'settings', 'support'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleSelectTab = (tab: AccountTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // -------------------------------------------------------------
  // PROFILE FORM STATE
  // -------------------------------------------------------------
  const [name, setName] = useState(userProfile.name || '');
  const [surname, setSurname] = useState(userProfile.surname || '');
  const [email, setEmail] = useState(userProfile.email || '');
  const [phone, setPhone] = useState(userProfile.phone || '');
  const [nationalId, setNationalId] = useState(userProfile.nationalId || '');
  const [university, setUniversity] = useState(userProfile.university || '');
  const [major, setMajor] = useState(userProfile.major || '');
  const [degree, setDegree] = useState(userProfile.degree || '');
  const [years, setYears] = useState(userProfile.years || '');
  const [location, setLocation] = useState(userProfile.location || '');
  const [role, setRole] = useState(userProfile.role || USER_ROLES[0]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(userProfile.skills || []);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(userProfile.goals || []);
  const [cvText, setCvText] = useState(userProfile.cvText || '');
  const [avatarUrl, setAvatarUrl] = useState(userProfile.avatarUrl || '');
  const [password, setPassword] = useState(userProfile.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Sync state if userProfile changes
  useEffect(() => {
    setName(userProfile.name || '');
    setSurname(userProfile.surname || '');
    setEmail(userProfile.email || '');
    setPhone(userProfile.phone || '');
    setNationalId(userProfile.nationalId || '');
    setUniversity(userProfile.university || '');
    setMajor(userProfile.major || '');
    setDegree(userProfile.degree || '');
    setYears(userProfile.years || '');
    setLocation(userProfile.location || '');
    setRole(userProfile.role || USER_ROLES[0]);
    setSelectedSkills(userProfile.skills || []);
    setSelectedGoals(userProfile.goals || []);
    setCvText(userProfile.cvText || '');
    setAvatarUrl(userProfile.avatarUrl || '');
    setPassword(userProfile.password || '');
  }, [userProfile]);

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateUserProfile({
      name: name.trim(),
      surname: surname.trim(),
      email: email.trim(),
      phone: phone.trim(),
      nationalId: nationalId.trim(),
      university: university.trim(),
      major: major.trim(),
      degree: degree.trim(),
      years: years.trim(),
      location: location.trim(),
      role,
      skills: selectedSkills,
      goals: selectedGoals,
      cvText,
      avatarUrl,
      password,
    });
    setProfileSaved(true);
    addLog('SYSTEM', `Account Profile updated for ${name.trim()} (${university.trim()})`);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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

  // -------------------------------------------------------------
  // PRIVACY & TERMINAL STATE (SETTINGS TAB)
  // -------------------------------------------------------------
  const [activeDispatching, setActiveDispatching] = useState(false);
  const [activeLogFilter, setActiveLogFilter] = useState<'ALL' | 'SYSTEM' | 'SANDBOX' | 'MODEL' | 'WARNING'>('ALL');
  const [commandInput, setCommandInput] = useState('');
  const terminalBottomRef = useRef<HTMLDivElement>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const testPayload = JSON.stringify(
    {
      candidate: {
        name: name || 'Student Candidate',
        email: email || 'student@university.edu',
        phone: phone || '+1 555-0199',
        national_id: nationalId || 'ID-9928174',
        university: university || 'Technical University',
      },
      skills: selectedSkills.slice(0, 4),
      action: 'Fetch Opportunity Recommendations & ATS Verification',
    },
    null,
    2
  );

  const testResult = anonymize(testPayload);

  const handleSimulateDispatch = () => {
    setActiveDispatching(true);
    incrementMaskedCount(4);
    addLog('SANDBOX', 'PII Anonymization: Sensitive personal attributes masked before cloud routing');
    addLog('MODEL', 'Transmitting tokenized request to Nebius Model Factory (Nemotron 3.5)...');
    setTimeout(() => {
      setActiveDispatching(false);
      addLog('SYSTEM', 'Model response received without personal data exposure');
    }, 600);
  };

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
      addLog('SYSTEM', 'Reading local MEMORY.md: local preferences active');
    } else {
      addLog('SYSTEM', `Execution acknowledged: "${cmd}" within sandbox environment.`);
    }
    setCommandInput('');
  };

  const filteredLogs = logs.filter((log) => {
    if (activeLogFilter === 'ALL') return true;
    if (activeLogFilter === 'WARNING') return log.tag === 'SANDBOX WARNING' || log.isWarning;
    return log.tag === activeLogFilter;
  });

  // -------------------------------------------------------------
  // TECH SUPPORT & FAQ STATE
  // -------------------------------------------------------------
  const [supportCategory, setSupportCategory] = useState<'Bug Report' | 'Feature Request' | 'Account Help' | 'Question'>('Bug Report');
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSubmitted, setSupportSubmitted] = useState(false);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  const handleSendSupportTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportSubject.trim() || !supportMessage.trim()) return;
    setSupportSubmitted(true);
    addLog('SYSTEM', `Support ticket generated: [${supportCategory}] ${supportSubject.trim()}`);
    setTimeout(() => {
      setSupportSubmitted(false);
      setSupportSubject('');
      setSupportMessage('');
    }, 3000);
  };

  const faqs = [
    {
      q: 'How does QADAM protect my personal identity?',
      a: 'All sensitive identifiers (full name, phone number, academic student ID, personal email) are tokenized locally on your machine before external model calls are made. External inference endpoints only receive cryptographic aliases like [USER_NAME_1] and [EMAIL_MASKED].',
    },
    {
      q: 'How does the ATS CV Gap Analysis calculate compatibility?',
      a: 'The engine parses required competencies from live hackathons, research grants, and job postings. It compares them directly against your verified Skill Lab credentials, academic standing, and resume keywords, outputting a clear percentage match and actionable quiz recommendations.',
    },
    {
      q: 'Can I use QADAM without leaking data to third parties?',
      a: 'Yes. Agent directives, memory, CV text, and settings are preserved strictly inside your browser localStorage and the local OpenShell confinement workspace (/workspace/qadam). You can also completely purge this data at any time in Settings.',
    },
    {
      q: 'How do multi-channel messenger notifications work?',
      a: 'You can connect your Telegram handle, KakaoTalk channel, or Discord webhook in the Notifications & Bots section. When a new deadline or matching bounty arrives, QADAM pings you directly without tracking your browsing habits.',
    },
    {
      q: 'What is OpenShell sandbox confinement?',
      a: 'OpenShell enforces a directory jail restricting automated tooling and terminal operations to /workspace/qadam. Any attempt to traverse to system roots like /root or /etc is intercepted and blocked immediately.',
    },
  ];

  // -------------------------------------------------------------
  // LOGOUT ACTION
  // -------------------------------------------------------------
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleConfirmLogout = () => {
    resetToDefaultProfile();
    navigate('/welcome');
  };

  const initials = [name?.[0], surname?.[0]].filter(Boolean).join('').toUpperCase() || 'Q';

  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col antialiased selection:bg-accent/20 selection:text-white font-sans relative z-10">
      {/* Top Dedicated Portal Header */}
      <header className="px-6 md:px-12 py-4 border-b border-teal-500/20 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="h-9 px-3.5 rounded-btn bg-slate-800/80 hover:bg-slate-700/80 text-teal-100 hover:text-white text-mini font-mono flex items-center gap-2 transition-colors cursor-pointer border border-teal-500/30 shadow-xs"
          >
            <span>← Back to QADAM Workspace</span>
          </button>

          <div className="hidden sm:flex items-center gap-2.5 pl-4 border-l border-teal-500/30">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 rotate-45 inline-block" />
            <span className="text-[15px] font-bold tracking-tight text-white font-mono">QADAM</span>
            <span className="text-mini font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30 font-medium">
              Account Portal
            </span>
          </div>
        </div>

        {/* 4-Item Tab Switcher */}
        <nav className="flex items-center gap-1.5 p-1 rounded-btn bg-slate-800/80 border border-teal-500/30" aria-label="Portal Navigation">
          <button
            type="button"
            onClick={() => handleSelectTab('profile')}
            className={`
              h-8 px-3.5 rounded-btn text-mini font-mono font-medium transition-all flex items-center gap-1.5 cursor-pointer
              ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-xs'
                  : 'text-teal-200/80 hover:text-white hover:bg-slate-700/60'
              }
            `}
          >
            <UserIcon size={13} />
            <span>Profile</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('settings')}
            className={`
              h-8 px-3.5 rounded-btn text-mini font-mono font-medium transition-all flex items-center gap-1.5 cursor-pointer
              ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-xs'
                  : 'text-teal-200/80 hover:text-white hover:bg-slate-700/60'
              }
            `}
          >
            <SettingsIcon size={13} />
            <span>Settings</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('support')}
            className={`
              h-8 px-3.5 rounded-btn text-mini font-mono font-medium transition-all flex items-center gap-1.5 cursor-pointer
              ${
                activeTab === 'support'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-xs'
                  : 'text-teal-200/80 hover:text-white hover:bg-slate-700/60'
              }
            `}
          >
            <HelpCircleIcon size={13} />
            <span>Tech Support</span>
          </button>

          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            className="h-8 px-3 rounded-btn text-mini font-mono text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOutIcon size={13} />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </nav>
      </header>

      {/* Main Full-Page Content Area */}
      <main className="max-w-6xl w-full mx-auto px-6 md:px-12 py-8 flex-1 flex flex-col">
        {/* ========================================================= */}
        {/* TAB 1: PROFILE MANAGEMENT */}
        {/* ========================================================= */}
        {activeTab === 'profile' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header / Intro */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-teal-50">Candidate Identity & Profile</h2>
                <p className="text-[14px] text-teal-200/80 mt-1 leading-relaxed">
                  Manage your academic background, technical competencies, resume parameters, and account security.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {profileSaved && (
                  <span className="text-mini font-mono text-emerald-400 flex items-center gap-1.5 animate-pulse font-medium">
                    <CheckIcon size={14} />
                    <span>Saved to local storage</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="h-10 px-6 rounded-btn bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-mini font-mono transition-all shadow-md shadow-emerald-900/20 cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </div>

            {/* Profile Avatar & Identity Card */}
            <div className="p-6 md:p-8 rounded-card bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl border border-teal-300/40 shadow-[0_16px_40px_-12px_rgba(6,182,212,0.18)] text-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative group">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={name || 'Avatar'}
                      className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500 shadow-md"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-teal-50 border border-teal-200/70 flex items-center justify-center text-2xl font-mono font-bold text-accent">
                      {initials}
                    </div>
                  )}
                  <label
                    htmlFor="avatar-file-input"
                    className="absolute inset-0 rounded-full bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[11px] font-mono text-white cursor-pointer transition-opacity"
                  >
                    Change
                  </label>
                  <input
                    id="avatar-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {name ? `${name} ${surname}`.trim() : 'Candidate Profile'}
                  </h3>
                  <div className="text-mini font-mono text-emerald-600 font-semibold mt-0.5">{role}</div>
                  <div className="text-[13px] text-slate-500 mt-1">
                    {university ? `${university} · ${major || 'Computer Science'}` : 'Institution not configured'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="avatar-file-input-btn"
                  className="h-9 px-4 rounded-btn bg-slate-100 hover:bg-slate-200 text-slate-800 text-mini font-mono cursor-pointer transition-colors flex items-center border border-slate-200"
                >
                  Upload New Photo
                </label>
                <input
                  id="avatar-file-input-btn"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className="h-9 px-3 rounded-btn text-mini font-mono text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Personal & Academic Information Grid */}
            <div className="p-6 md:p-8 rounded-card bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl border border-teal-300/40 shadow-[0_16px_40px_-12px_rgba(6,182,212,0.18)] text-slate-900 space-y-6">
              <h3 className="text-subheading text-slate-900 font-semibold flex items-center gap-2">
                <span>Academic & Identity Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-mini font-mono uppercase text-slate-500 mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="First name"
                    className="w-full h-11 px-3.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-btn text-[13px] text-slate-900 placeholder:text-slate-400 outline-none font-sans transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-mini font-mono uppercase text-slate-500 mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    placeholder="Last name"
                    className="w-full h-11 px-3.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-btn text-[13px] text-slate-900 placeholder:text-slate-400 outline-none font-sans transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-mini font-mono uppercase text-slate-500 mb-1.5">
                    Academic Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@university.edu"
                    className="w-full h-11 px-3.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-btn text-[13px] text-slate-900 placeholder:text-slate-400 outline-none font-mono transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-mini font-mono uppercase text-slate-500 mb-1.5">
                    Institution / University
                  </label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="University name"
                    className="w-full h-11 px-3.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-btn text-[13px] text-slate-900 placeholder:text-slate-400 outline-none font-sans transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-mini font-mono uppercase text-slate-500 mb-1.5">
                    Major / Field of Study
                  </label>
                  <input
                    type="text"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="Computer Science"
                    className="w-full h-11 px-3.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-btn text-[13px] text-slate-900 placeholder:text-slate-400 outline-none font-sans transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-mini font-mono uppercase text-slate-500 mb-1.5">
                    Primary Track / Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full h-11 px-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-btn text-[13px] text-slate-900 outline-none font-mono cursor-pointer transition-colors"
                  >
                    {USER_ROLES.map((r) => (
                      <option key={r} value={r} className="bg-white text-slate-900">
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-mini font-mono uppercase text-slate-500 mb-1.5">
                    Degree Level
                  </label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="B.S. in Computer Science"
                    className="w-full h-11 px-3.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-btn text-[13px] text-slate-900 placeholder:text-slate-400 outline-none font-sans transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-mini font-mono uppercase text-slate-500 mb-1.5">
                    Graduation Year Span
                  </label>
                  <input
                    type="text"
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
                    placeholder="2023 - 2027"
                    className="w-full h-11 px-3.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-btn text-[13px] text-slate-900 placeholder:text-slate-400 outline-none font-mono transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-mini font-mono uppercase text-slate-500 mb-1.5">
                    Location / City
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Almaty, Kazakhstan"
                    className="w-full h-11 px-3.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-btn text-[13px] text-slate-900 placeholder:text-slate-400 outline-none font-sans transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Technical Stack Tags */}
            <div className="p-6 md:p-8 rounded-card bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl border border-teal-300/40 shadow-[0_16px_40px_-12px_rgba(6,182,212,0.18)] text-slate-900 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-subheading text-slate-900 font-semibold">Technical Stack Proficiency</h3>
                  <p className="text-[13px] text-slate-600 mt-0.5">
                    Select technologies you actively use. These shape your match scoring in Opportunity Radar.
                  </p>
                </div>
                <span className="text-mini font-mono text-emerald-600 font-semibold">
                  {selectedSkills.length} selected
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {POPULAR_TECH_STACK.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`
                        px-3.5 py-1.5 rounded-btn text-mini font-mono transition-colors flex items-center gap-1.5 cursor-pointer
                        ${
                          isSelected
                            ? 'bg-teal-50 text-teal-800 border border-teal-300 font-semibold shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200/80 border border-slate-200/60'
                        }
                      `}
                    >
                      {isSelected && <CheckIcon size={12} />}
                      <span>{skill}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Career Objectives & Tracks */}
            <div className="p-6 md:p-8 rounded-card bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl border border-teal-300/40 shadow-[0_16px_40px_-12px_rgba(6,182,212,0.18)] text-slate-900 space-y-4">
              <h3 className="text-subheading text-slate-900 font-semibold">Career Objectives & Target Tracks</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {CAREER_OBJECTIVES.map((goal) => {
                  const isSelected = selectedGoals.includes(goal);
                  return (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => toggleGoal(goal)}
                      className={`
                        p-3.5 rounded-card text-left text-[13px] transition-colors flex items-center justify-between cursor-pointer
                        ${
                          isSelected
                            ? 'bg-teal-50 text-teal-900 border border-teal-300 font-medium shadow-xs'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                        }
                      `}
                    >
                      <span>{goal}</span>
                      {isSelected && <CheckIcon size={14} className="text-emerald-600 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CV Text / Raw Resume */}
            <div className="p-6 md:p-8 rounded-card bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl border border-teal-300/40 shadow-[0_16px_40px_-12px_rgba(6,182,212,0.18)] text-slate-900 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-subheading text-slate-900 font-semibold">Resume Text / CV Markdown</h3>
                  <p className="text-[13px] text-slate-600 mt-0.5">
                    Plaintext representation used for ATS gap analysis and tailored proposals.
                  </p>
                </div>
                <span className="text-mini font-mono text-slate-400">
                  {cvText.length} characters
                </span>
              </div>
              <textarea
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder="Paste your CV text or markdown summary here..."
                rows={6}
                className="w-full p-4 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-btn text-[12px] font-mono text-slate-900 placeholder:text-slate-400 outline-none leading-relaxed transition-colors"
              />
            </div>

            {/* Confidential Security & Password Block */}
            <div className="p-6 md:p-8 rounded-card bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl border border-teal-300/40 shadow-[0_16px_40px_-12px_rgba(6,182,212,0.18)] text-slate-900 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-subheading text-slate-900 font-semibold">Confidential Security & Password</h3>
                  <p className="text-[13px] text-slate-600 mt-0.5">
                    Stored client-side to safeguard your local sandbox sessions.
                  </p>
                </div>
                <span className="text-mini font-mono text-emerald-600 font-semibold">PROTECTED</span>
              </div>

              <div className="max-w-md relative">
                <label className="block text-mini font-mono uppercase text-slate-500 mb-1.5">
                  Account Access Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-11 pl-3.5 pr-10 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-btn text-[13px] text-slate-900 placeholder:text-slate-400 outline-none font-mono transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: SYSTEM SETTINGS, PRIVACY SHIELD & TERMINAL */}
        {/* ========================================================= */}
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header / Intro */}
            <div className="pb-6 border-b border-teal-500/20">
              <h2 className="text-2xl font-bold tracking-tight text-teal-50">System Settings & Privacy Shield</h2>
              <p className="text-[14px] text-teal-200/80 mt-1 leading-relaxed">
                Control client-side data confinement, PII anonymization policies, and OpenShell sandbox logs.
              </p>
            </div>

            {/* Privacy Shield Status Banner */}
            <div className="p-6 md:p-8 rounded-card bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl border border-teal-300/40 shadow-[0_16px_40px_-12px_rgba(6,182,212,0.18)] text-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-subheading text-slate-900 font-semibold text-lg">
                    Client-Side PII Anonymization Active
                  </h3>
                </div>
                <p className="text-[13px] text-slate-600 max-w-xl leading-relaxed">
                  Personal identifiers are cryptographically masked before data leaves your browser. Only anonymous tokens reach external LLM endpoints.
                </p>
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {['Name', 'Email', 'Phone', 'National ID'].map((f) => (
                    <span key={f} className="px-2.5 py-0.5 rounded text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200/60 font-medium">
                      {f}: MASKED
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-slate-200 md:pl-6 flex-shrink-0">
                <div>
                  <div className="text-[28px] font-mono font-bold text-emerald-600 leading-none">
                    {fieldsMaskedPerRequest}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1">fields masked / req</div>
                </div>
                <div>
                  <div className="text-[28px] font-mono font-bold text-slate-900 leading-none">
                    {maskedCountThisSession}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1">masked this session</div>
                </div>
              </div>
            </div>

            {/* Privacy & Sandbox Policy Toggles */}
            <div className="p-6 md:p-8 rounded-card bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl border border-teal-300/40 shadow-[0_16px_40px_-12px_rgba(6,182,212,0.18)] text-slate-900 space-y-4">
              <h3 className="text-subheading text-slate-900 font-semibold">Confinement & Storage Policies</h3>

              <div className="space-y-3">
                <div className="p-4 rounded-card bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[14px] font-medium text-slate-900">Store preferences in local MEMORY.md</div>
                    <div className="text-mini font-mono text-slate-500 mt-0.5">Keeps directives exclusively in browser client storage</div>
                  </div>
                  <TogglePill
                    checked={privacySettings.storeMemoryLocal}
                    onChange={() => togglePrivacySetting('storeMemoryLocal')}
                    label="Store preferences in local MEMORY.md"
                  />
                </div>

                <div className="p-4 rounded-card bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[14px] font-medium text-slate-900">Restrict agent execution to OpenShell sandbox</div>
                    <div className="text-mini font-mono text-emerald-600 font-semibold mt-0.5">Strict Jail Confinement: /workspace/qadam</div>
                  </div>
                  <TogglePill
                    checked={privacySettings.restrictOpenShellSandbox}
                    onChange={() => togglePrivacySetting('restrictOpenShellSandbox')}
                    label="Restrict agent execution to sandbox"
                  />
                </div>

                <div className="p-4 rounded-card bg-slate-50 border border-slate-200/70 opacity-60 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[14px] font-medium text-slate-500">Send unmasked contact details to cloud APIs</div>
                    <div className="text-mini font-mono text-slate-400 mt-0.5">Permanently locked by client-side policy</div>
                  </div>
                  <TogglePill checked={false} disabled onChange={() => {}} label="Send unmasked contact details" />
                </div>
              </div>
            </div>

            {/* Interactive Live PII Sanitizer Simulator */}
            <div className="p-6 md:p-8 rounded-card bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl border border-teal-300/40 shadow-[0_16px_40px_-12px_rgba(6,182,212,0.18)] text-slate-900 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-subheading text-slate-900 font-semibold">Live PII Tokenizer Verification</h3>
                  <p className="text-[13px] text-slate-600 mt-0.5">
                    Preview raw candidate payload versus the sanitized payload dispatched to models.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSimulateDispatch}
                  disabled={activeDispatching}
                  className="h-9 px-4 rounded-btn bg-slate-100 hover:bg-slate-200 text-slate-800 text-mini font-mono transition-colors cursor-pointer flex items-center gap-2 border border-slate-200"
                >
                  <SendIcon size={12} className="text-emerald-600" />
                  <span>{activeDispatching ? 'Anonymizing...' : 'Test Anonymization'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-btn bg-slate-900 border border-slate-800 space-y-2">
                  <div className="text-mini font-mono text-slate-400 uppercase">Raw Local Payload (Protected)</div>
                  <pre className="text-[11px] font-mono text-slate-200 leading-relaxed overflow-x-auto max-h-48">
                    {testPayload}
                  </pre>
                </div>

                <div className="p-4 rounded-btn bg-slate-900 border border-slate-800 space-y-2">
                  <div className="text-mini font-mono text-emerald-400 uppercase font-semibold">Tokenized Dispatch (External LLM)</div>
                  <pre className="text-[11px] font-mono text-emerald-400 leading-relaxed overflow-x-auto max-h-48">
                    {testResult.maskedJsonString}
                  </pre>
                </div>
              </div>
            </div>

            {/* OpenShell Terminal & Event Stream */}
            <div className="p-6 md:p-8 rounded-card bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl border border-teal-300/40 shadow-[0_16px_40px_-12px_rgba(6,182,212,0.18)] text-slate-900 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-subheading text-slate-900 font-semibold">OpenShell Event Stream & Terminal</h3>
                  <p className="text-[13px] text-slate-600 mt-0.5">
                    Real-time AST interception log and local command execution environment.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {(['ALL', 'SYSTEM', 'SANDBOX', 'MODEL', 'WARNING'] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setActiveLogFilter(filter)}
                      className={`
                        h-7 px-2.5 rounded text-[11px] font-mono transition-colors cursor-pointer
                        ${
                          activeLogFilter === filter
                            ? 'bg-emerald-600 text-white font-semibold'
                            : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200/60'
                        }
                      `}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Terminal Screen */}
              <div className="rounded-card bg-slate-950 border border-slate-800 overflow-hidden shadow-inner">
                <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-mini font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live Confinement Session</span>
                  </div>
                  <span>/workspace/qadam (r/w)</span>
                </div>

                <div className="p-4 font-mono text-[12px] space-y-1.5 max-h-56 overflow-y-auto">
                  {filteredLogs.map((log) => {
                    const isWarning = log.tag === 'SANDBOX WARNING' || log.isWarning;
                    const isSandbox = log.tag === 'SANDBOX';
                    let tagColor = 'text-slate-400';
                    if (isSandbox) tagColor = 'text-emerald-400 font-semibold';
                    if (isWarning) tagColor = 'text-amber-400 font-semibold';

                    return (
                      <div key={log.id} className="flex items-baseline gap-2 leading-relaxed">
                        <span className="text-slate-500 text-[10px]">{log.time}</span>
                        <span className={`w-28 flex-shrink-0 ${tagColor}`}>[{log.tag}]</span>
                        <span className={isWarning ? 'text-amber-300' : 'text-slate-200'}>{log.message}</span>
                      </div>
                    );
                  })}
                  <div ref={terminalBottomRef} />
                </div>

                <form onSubmit={handleCommandSubmit} className="p-3 bg-slate-900 flex items-center gap-2 border-t border-slate-800">
                  <span className="text-emerald-400 font-mono text-[12px]">$</span>
                  <input
                    type="text"
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    placeholder="Enter sandbox command: 'help', 'status', 'access /root/system'..."
                    className="flex-1 bg-transparent border-0 text-[12px] font-mono text-slate-100 placeholder:text-slate-500 outline-none"
                  />
                  <button
                    type="submit"
                    className="h-8 px-3 rounded-btn bg-slate-800 text-slate-200 text-mini font-mono hover:bg-slate-700 cursor-pointer border border-slate-700 transition-colors"
                  >
                    Run
                  </button>
                </form>
              </div>
            </div>

            {/* Danger Zone: Local Profile Reset */}
            <div className="p-6 md:p-8 rounded-card bg-rose-50 border border-rose-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-subheading text-rose-800 font-semibold">Danger Zone: Reset Local Data</h3>
                  <p className="text-[13px] text-rose-600 mt-1 leading-relaxed max-w-xl">
                    Completely wipe all stored credentials, resume text, skill verifications, and agent memory from this browser session.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(true)}
                  className="h-10 px-4 rounded-btn bg-rose-600 hover:bg-rose-500 text-white font-mono text-mini transition-colors cursor-pointer shadow-xs flex-shrink-0"
                >
                  Wipe All Local Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: TECH SUPPORT & DOCUMENTATION */}
        {/* ========================================================= */}
        {activeTab === 'support' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header / Intro */}
            <div className="pb-6 border-b border-teal-500/20">
              <h2 className="text-2xl font-bold tracking-tight text-teal-50">Tech Support & Documentation Hub</h2>
              <p className="text-[14px] text-teal-200/80 mt-1 leading-relaxed">
                Explore architecture documentation, submit bug reports, contact maintainers, or browse frequently asked questions.
              </p>
            </div>

            {/* 4 Direct Contact Channels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <a
                href="https://discord.gg/"
                target="_blank"
                rel="noreferrer"
                className="p-5 rounded-card bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl hover:bg-white border border-teal-300/40 shadow-sm transition-all flex flex-col justify-between group text-slate-900"
              >
                <div>
                  <div className="w-10 h-10 rounded-btn bg-teal-50 border border-teal-100 flex items-center justify-center text-emerald-600">
                    <MessageSquareIcon size={18} />
                  </div>
                  <h4 className="text-[15px] font-semibold text-slate-900 mt-3">Discord Community</h4>
                  <p className="text-[12px] text-slate-600 mt-1">Join developer sprints and real-time support channels.</p>
                </div>
                <span className="text-mini font-mono text-emerald-600 font-semibold mt-4 group-hover:underline">
                  discord.gg/qadam →
                </span>
              </a>

              <a
                href="https://github.com/"
                target="_blank"
                rel="noreferrer"
                className="p-5 rounded-card bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl hover:bg-white border border-teal-300/40 shadow-sm transition-all flex flex-col justify-between group text-slate-900"
              >
                <div>
                  <div className="w-10 h-10 rounded-btn bg-teal-50 border border-teal-100 flex items-center justify-center text-emerald-600">
                    <TerminalIcon size={18} />
                  </div>
                  <h4 className="text-[15px] font-semibold text-slate-900 mt-3">GitHub Repository</h4>
                  <p className="text-[12px] text-slate-600 mt-1">Open source issues, pull requests, and benchmarks.</p>
                </div>
                <span className="text-mini font-mono text-emerald-600 font-semibold mt-4 group-hover:underline">
                  github.com/qadam →
                </span>
              </a>

              <a
                href="https://t.me/QadamAgentBot"
                target="_blank"
                rel="noreferrer"
                className="p-5 rounded-card bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl hover:bg-white border border-teal-300/40 shadow-sm transition-all flex flex-col justify-between group text-slate-900"
              >
                <div>
                  <div className="w-10 h-10 rounded-btn bg-teal-50 border border-teal-100 flex items-center justify-center text-emerald-600">
                    <SendIcon size={18} />
                  </div>
                  <h4 className="text-[15px] font-semibold text-slate-900 mt-3">Telegram Bot</h4>
                  <p className="text-[12px] text-slate-600 mt-1">Direct inquiries and live notification webhook testing.</p>
                </div>
                <span className="text-mini font-mono text-emerald-600 font-semibold mt-4 group-hover:underline">
                  @QadamAgentBot →
                </span>
              </a>

              <a
                href="mailto:support@qadam.local"
                className="p-5 rounded-card bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl hover:bg-white border border-teal-300/40 shadow-sm transition-all flex flex-col justify-between group text-slate-900"
              >
                <div>
                  <div className="w-10 h-10 rounded-btn bg-teal-50 border border-teal-100 flex items-center justify-center text-emerald-600">
                    <ShieldIcon size={18} />
                  </div>
                  <h4 className="text-[15px] font-semibold text-slate-900 mt-3">Email Support</h4>
                  <p className="text-[12px] text-slate-600 mt-1">Direct inquiries to the platform maintainers team.</p>
                </div>
                <span className="text-mini font-mono text-emerald-600 font-semibold mt-4 group-hover:underline">
                  support@qadam.local →
                </span>
              </a>
            </div>

            {/* Bug Reporting & Feedback Form */}
            <div className="p-6 md:p-8 rounded-card bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl border border-teal-300/40 shadow-[0_16px_40px_-12px_rgba(6,182,212,0.18)] text-slate-900 space-y-5">
              <div>
                <h3 className="text-subheading text-slate-900 font-semibold">Submit a Bug Report or Feature Request</h3>
                <p className="text-[13px] text-slate-600 mt-0.5">
                  Direct telemetry dispatch to QADAM engineering team.
                </p>
              </div>

              {supportSubmitted ? (
                <div className="p-6 rounded-btn bg-emerald-50 border border-emerald-200/60 text-emerald-800 flex items-center gap-3">
                  <CheckIcon size={20} className="text-emerald-600" />
                  <div>
                    <div className="font-semibold text-[14px]">Support Ticket Dispatched Successfully</div>
                    <div className="text-mini font-mono text-slate-600 mt-0.5">
                      Our engineering team will review the issue within 24 hours.
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSendSupportTicket} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-mini font-mono uppercase text-slate-500 mb-1.5">
                        Ticket Category
                      </label>
                      <select
                        value={supportCategory}
                        onChange={(e) => setSupportCategory(e.target.value as any)}
                        className="w-full h-11 px-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-btn text-[13px] text-slate-900 font-mono outline-none cursor-pointer transition-colors"
                      >
                        <option value="Bug Report" className="bg-white text-slate-900">Bug Report</option>
                        <option value="Feature Request" className="bg-white text-slate-900">Feature Request</option>
                        <option value="Account Help" className="bg-white text-slate-900">Account Help</option>
                        <option value="Question" className="bg-white text-slate-900">General Question</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-mini font-mono uppercase text-slate-500 mb-1.5">
                        Subject / Brief Summary
                      </label>
                      <input
                        type="text"
                        required
                        value={supportSubject}
                        onChange={(e) => setSupportSubject(e.target.value)}
                        placeholder="e.g. ATS health score discrepancy on grant application"
                        className="w-full h-11 px-3.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-btn text-[13px] text-slate-900 placeholder:text-slate-400 outline-none font-sans transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-mini font-mono uppercase text-slate-500 mb-1.5">
                      Detailed Description & Reproduction Steps
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      placeholder="Please describe the steps to reproduce or what feature you'd like to see..."
                      className="w-full p-3.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-btn text-[13px] text-slate-900 placeholder:text-slate-400 outline-none font-sans leading-relaxed transition-colors"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-mini font-mono text-slate-400">
                      Client environment metadata automatically attached
                    </span>
                    <button
                      type="submit"
                      className="h-10 px-6 rounded-btn bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-mini font-mono transition-colors shadow-sm cursor-pointer"
                    >
                      Dispatch Support Ticket
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Frequently Asked Questions (Accordion) */}
            <div className="p-6 md:p-8 rounded-card bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl border border-teal-300/40 shadow-[0_16px_40px_-12px_rgba(6,182,212,0.18)] text-slate-900 space-y-4">
              <h3 className="text-subheading text-slate-900 font-semibold">Frequently Asked Questions</h3>

              <div className="space-y-2 pt-1">
                {faqs.map((faq, idx) => {
                  const isOpen = expandedFaqIndex === idx;
                  return (
                    <div
                      key={faq.q}
                      className="rounded-btn bg-slate-50 border border-slate-200/80 overflow-hidden transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedFaqIndex(isOpen ? null : idx)}
                        className="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-100/70 transition-colors"
                      >
                        <span className="font-medium text-[14px] text-slate-900">{faq.q}</span>
                        <ChevronRightIcon
                          size={14}
                          className={`text-slate-400 transition-transform duration-200 ${
                            isOpen ? 'rotate-90 text-emerald-600' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 text-[13px] text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Modal: Reset Local Data */}
      {isResetConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"
        >
          <div className="w-full max-w-md bg-white p-6 rounded-card space-y-4 shadow-2xl border border-rose-200">
            <h3 className="text-lg font-bold text-rose-800">Wipe Local Storage Data?</h3>
            <p className="text-[13px] text-slate-600 leading-relaxed">
              This action will permanently delete your local candidate profile, agent memory, verified quiz credentials, and reset the platform to an initial state.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="h-10 px-4 rounded-btn bg-slate-100 hover:bg-slate-200 text-slate-700 text-mini font-mono cursor-pointer border border-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsResetConfirmOpen(false);
                  resetToDefaultProfile();
                  navigate('/welcome');
                }}
                className="h-10 px-5 rounded-btn bg-rose-600 hover:bg-rose-500 text-white font-mono text-mini font-semibold cursor-pointer shadow-sm"
              >
                Confirm & Wipe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Log Out */}
      {isLogoutModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"
        >
          <div className="w-full max-w-md bg-white p-6 rounded-card space-y-4 shadow-2xl border border-slate-200/80">
            <h3 className="text-lg font-bold text-slate-900">Log Out of QADAM?</h3>
            <p className="text-[13px] text-slate-600 leading-relaxed">
              Your active workspace session will be closed and you will be redirected to the Welcome page. Your local profile settings will remain saved for your next session.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="h-10 px-4 rounded-btn bg-slate-100 hover:bg-slate-200 text-slate-700 text-mini font-mono cursor-pointer border border-slate-200 transition-colors"
              >
                Stay in Workspace
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="h-10 px-5 rounded-btn bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-mini font-semibold cursor-pointer shadow-sm"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPortalPage;
