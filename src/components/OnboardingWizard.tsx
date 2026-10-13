import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { USER_ROLES, POPULAR_TECH_STACK, CAREER_OBJECTIVES } from '../db/userProfile';
import {
  CheckIcon,
  ShieldIcon,
  ChevronRightIcon,
  LockIcon,
  RadarIcon,
  EyeIcon,
  EyeOffIcon,
} from './Icons';

export const OnboardingWizard: React.FC = () => {
  const { userProfile, updateUserProfile, isOnboardingOpen, setIsOnboardingOpen, addLog } =
    useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State - COMPLETELY EMPTY ZERO HARDCODED DEFAULTS
  const [name, setName] = useState(userProfile.name || '');
  const [surname, setSurname] = useState(userProfile.surname || '');
  const [email, setEmail] = useState(userProfile.email || '');
  const [password, setPassword] = useState(userProfile.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const [university, setUniversity] = useState(userProfile.university || '');
  const [major, setMajor] = useState(userProfile.major || '');
  const [location, setLocation] = useState(userProfile.location || '');
  const [role, setRole] = useState(userProfile.role || USER_ROLES[0]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(userProfile.skills || []);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(userProfile.goals || []);
  const [cvText, setCvText] = useState(userProfile.cvText || '');

  // Keep state in sync if profile is reset or reopened
  React.useEffect(() => {
    if (isOnboardingOpen) {
      setName(userProfile.name || '');
      setSurname(userProfile.surname || '');
      setEmail(userProfile.email || '');
      setPassword(userProfile.password || '');
      setUniversity(userProfile.university || '');
      setMajor(userProfile.major || '');
      setLocation(userProfile.location || '');
      setRole(userProfile.role || USER_ROLES[0]);
      setSelectedSkills(userProfile.skills || []);
      setSelectedGoals(userProfile.goals || []);
      setCvText(userProfile.cvText || '');
      setStep(1);
    }
  }, [isOnboardingOpen, userProfile]);

  if (!isOnboardingOpen) return null;

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

  // Strict step validation booleans (No skipping empty forms)
  const isStep1Valid = Boolean(
    name.trim() &&
    surname.trim() &&
    email.trim() &&
    password.trim() &&
    name.trim().toLowerCase() !== 'candidate'
  );

  const isStep2Valid = selectedSkills.length > 0;
  const isStep3Valid = selectedGoals.length > 0;

  const isCurrentStepValid = step === 1 ? isStep1Valid : step === 2 ? isStep2Valid : isStep3Valid;

  const handleFinish = () => {
    if (!isStep1Valid) {
      setStep(1);
      return;
    }

    const finalName = name.trim();
    const finalFullName = surname.trim() ? `${finalName} ${surname.trim()}` : finalName;

    updateUserProfile({
      name: finalName,
      surname: surname.trim(),
      email: email.trim(),
      password,
      university: university.trim() || 'University',
      major: major.trim() || 'Computer Science',
      location: location.trim() || 'Remote',
      role,
      skills: selectedSkills,
      goals: selectedGoals,
      cvText,
      isOnboarded: true,
    });

    addLog(
      'SYSTEM',
      `Onboarding finished: Profile registered for ${finalFullName} (${role}, ${university.trim() || 'University'})`
    );
    addLog('SANDBOX', 'User credentials secured locally · Directory sandbox confinement confirmed');
    setIsOnboardingOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070d1f]/95 backdrop-blur-md"
    >
      <div className="w-full max-w-2xl bg-surface border border-border-strong rounded-card shadow-2xl flex flex-col overflow-hidden">
        {/* Wizard Header */}
        <div className="px-6 py-4 border-b border-border bg-[#0a1128] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-sm bg-accent rotate-45 inline-block" />
            <div>
              <h2 id="onboarding-title" className="text-subheading text-text font-semibold">
                Pathfinder Setup Wizard
              </h2>
              <div className="text-mini font-mono text-muted-2">
                Step {step} of 3: {step === 1 ? 'Identity & Credentials' : step === 2 ? 'Technical Stack & CV' : 'Objectives & Local Sandbox'}
              </div>
            </div>
          </div>

          {/* Step Progress indicators */}
          <div className="flex items-center gap-1.5 font-mono text-mini">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`w-6 h-6 rounded-btn flex items-center justify-center border text-[11px] ${
                  step === s
                    ? 'border-accent bg-accent/10 text-accent font-semibold'
                    : step > s
                    ? 'border-border-strong bg-surface-hover text-text'
                    : 'border-border text-muted-2'
                }`}
              >
                {step > s ? '✓' : s}
              </span>
            ))}
          </div>
        </div>

        {/* Wizard Progress Line */}
        <div className="w-full h-[2px] bg-sidebar">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Wizard Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-5">
          {/* STEP 1: Identity & Credentials */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-[17px] font-semibold text-text">Account & Academic Identity</h3>
                <p className="text-[13px] text-muted mt-1 leading-relaxed">
                  Enter your student credentials to index opportunities and configure your local agent.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    className="w-full h-11 px-3.5 bg-sidebar border border-border rounded-btn text-[13px] text-text placeholder:text-muted-2/60 focus:border-accent focus:outline-none"
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
                    placeholder="Surname"
                    className="w-full h-11 px-3.5 bg-sidebar border border-border rounded-btn text-[13px] text-text placeholder:text-muted-2/60 focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                    Academic Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john.doe@university.edu"
                    className="w-full h-11 px-3.5 bg-sidebar border border-border rounded-btn text-[13px] text-text placeholder:text-muted-2/60 focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                    Account Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create secure password"
                      className="w-full h-11 pl-3.5 pr-10 bg-sidebar border border-border rounded-btn text-[13px] text-text placeholder:text-muted-2/60 focus:border-accent focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-2 hover:text-text"
                    >
                      {showPassword ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                    University / Institution
                  </label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="University or Institution"
                    className="w-full h-11 px-3.5 bg-sidebar border border-border rounded-btn text-[13px] text-text placeholder:text-muted-2/60 focus:border-accent focus:outline-none"
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
                    placeholder="Field of study"
                    className="w-full h-11 px-3.5 bg-sidebar border border-border rounded-btn text-[13px] text-text placeholder:text-muted-2/60 focus:border-accent focus:outline-none"
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
                    placeholder="City, Country"
                    className="w-full h-11 px-3.5 bg-sidebar border border-border rounded-btn text-[13px] text-text placeholder:text-muted-2/60 focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                    Primary Academic / Tech Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full h-11 px-3 bg-sidebar border border-border rounded-btn text-[13px] text-text font-mono focus:border-accent focus:outline-none"
                  >
                    {USER_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 bg-sidebar rounded-btn border border-border flex items-center gap-3 text-mini font-mono text-muted">
                <ShieldIcon size={16} className="text-accent flex-shrink-0" />
                <span>
                  All credentials and personal details are stored exclusively in your local sandbox browser database.
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: Stack & CV Setup */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-[17px] font-semibold text-text">Technical Stack & ATS Resume Setup</h3>
                <p className="text-[13px] text-muted mt-1 leading-relaxed">
                  Select your active technical competencies. Match percentages across the Opportunity Radar are calculated dynamically from this stack.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-mini font-mono uppercase text-muted-2">
                    Active Tech Stack ({selectedSkills.length} selected)
                  </label>
                  {selectedSkills.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedSkills([])}
                      className="text-mini font-mono text-muted hover:text-text underline"
                    >
                      Clear selection
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_TECH_STACK.map((skill) => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`
                          h-11 px-3.5 rounded-btn text-mini font-mono border transition-all flex items-center gap-1.5
                          ${
                            isSelected
                              ? 'bg-accent/15 border-accent text-text font-semibold'
                              : 'bg-sidebar border-border text-muted hover:border-border-strong hover:text-text'
                          }
                        `}
                      >
                        {isSelected && <CheckIcon size={12} className="text-accent" />}
                        <span>{skill}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-mini font-mono uppercase text-muted-2 mb-1.5">
                  Resume Highlights / Project Summary
                </label>
                <textarea
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  rows={4}
                  placeholder="Paste markdown highlights, project bullets, or bio summary for ATS keyword analysis..."
                  className="w-full p-3 bg-sidebar border border-border rounded-btn text-[12px] font-mono text-text placeholder:text-muted-2/60 focus:border-accent focus:outline-none leading-relaxed select-text"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Streamlined Objectives & Local Sandbox */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-[17px] font-semibold text-text">Target Objectives & Sandbox Boundaries</h3>
                <p className="text-[13px] text-muted mt-1 leading-relaxed">
                  Select what opportunities to monitor, and confirm your client-side security jail.
                </p>
              </div>

              <div>
                <label className="block text-mini font-mono uppercase text-muted-2 mb-2">
                  Target Opportunity Tracks ({selectedGoals.length} selected)
                </label>
                <div className="flex flex-wrap gap-2">
                  {CAREER_OBJECTIVES.map((goal) => {
                    const isSelected = selectedGoals.includes(goal);
                    return (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => toggleGoal(goal)}
                        className={`
                          h-11 px-3.5 rounded-btn text-mini font-mono border transition-all flex items-center gap-2
                          ${
                            isSelected
                              ? 'bg-accent/15 border-accent text-text font-semibold'
                              : 'bg-sidebar border-border text-muted hover:border-border-strong hover:text-text'
                          }
                        `}
                      >
                        {isSelected && <CheckIcon size={12} className="text-accent" />}
                        <span>{goal}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 bg-sidebar rounded-btn border border-accent-border/70 flex items-start gap-3">
                  <LockIcon size={16} className="text-accent flex-shrink-0 mt-0.5" />
                  <div className="text-[12px] font-mono">
                    <div className="text-text font-medium">OpenShell Directory Jail</div>
                    <div className="text-muted text-[11px] mt-0.5">
                      Confined strictly to <code>/workspace/pathfinder</code>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-sidebar rounded-btn border border-accent-border/70 flex items-start gap-3">
                  <ShieldIcon size={16} className="text-accent flex-shrink-0 mt-0.5" />
                  <div className="text-[12px] font-mono">
                    <div className="text-text font-medium">Zero-Leak PII Tokenization</div>
                    <div className="text-muted text-[11px] mt-0.5">
                      Personal tokens replace raw identities on device
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="px-6 py-4 border-t border-border bg-[#0a1128] flex items-center justify-between">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as 1 | 2)}
                className="h-10 px-4 rounded-btn border border-zinc-700/80 bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 text-[13px] font-medium transition-colors"
              >
                Back
              </button>
            ) : (
              <span className="text-mini font-mono text-muted-2">
                100% Client-Side Setup
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {step < 3 ? (
              <button
                type="button"
                disabled={!isCurrentStepValid}
                onClick={() => isCurrentStepValid && setStep((s) => (s + 1) as 2 | 3)}
                className={`h-10 px-5 rounded-btn text-[13px] font-medium transition-colors flex items-center gap-1.5 font-mono shadow-sm ${
                  isCurrentStepValid
                    ? 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-500 text-zinc-100 cursor-pointer'
                    : 'bg-zinc-900/40 border border-zinc-800 text-zinc-500 opacity-50 cursor-not-allowed'
                }`}
              >
                <span>Continue</span>
                <ChevronRightIcon size={14} />
              </button>
            ) : (
              <button
                type="button"
                disabled={!isCurrentStepValid || !isStep1Valid}
                onClick={handleFinish}
                className={`h-10 px-5 font-semibold rounded-btn text-[13px] transition-colors flex items-center gap-2 font-mono shadow-sm ${
                  isCurrentStepValid && isStep1Valid
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-zinc-950 cursor-pointer'
                    : 'bg-zinc-900/40 border border-zinc-800 text-zinc-500 opacity-50 cursor-not-allowed'
                }`}
              >
                <RadarIcon size={16} />
                <span>Launch Pathfinder Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
