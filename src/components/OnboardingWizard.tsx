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

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [name, setName] = useState(userProfile.name || '');
  const [surname, setSurname] = useState(userProfile.surname || '');
  const [email, setEmail] = useState(userProfile.email || '');
  const [password, setPassword] = useState(userProfile.password || '');
  const [confirmPassword, setConfirmPassword] = useState(userProfile.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      setConfirmPassword(userProfile.password || '');
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

  // --- Strict Validation Rules ---
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  const passwordHasCharAndSpecial = /(?=.*[a-zA-Z])(?=.*[0-9!@#$%^&*()_+=\-[\]{};':"\\|,.<>/?])/;

  // Step 1 Validation: Personal Identity (letters only, min 2 chars)
  const isNameValid = name.trim().length >= 2 && nameRegex.test(name.trim()) && name.trim().toLowerCase() !== 'candidate';
  const isSurnameValid = surname.trim().length >= 2 && nameRegex.test(surname.trim());
  const isStep1Valid = isNameValid && isSurnameValid;

  // Step 2 Validation: Academic & Professional Profile
  const isEmailValid = emailRegex.test(email.trim());
  const isUniversityValid = university.trim().length >= 3;
  const isMajorValid = major.trim().length >= 2;
  const isLocationValid = location.trim().length >= 2;
  const isStep2Valid = isEmailValid && isUniversityValid && isMajorValid && isLocationValid;

  // Step 3 Validation: Account Security (Double Password Entry)
  const isPasswordLengthValid = password.length >= 8;
  const isPasswordComplexValid = passwordHasCharAndSpecial.test(password);
  const isPasswordMatchValid = password.length > 0 && password === confirmPassword;
  const isStep3Valid = isPasswordLengthValid && isPasswordComplexValid && isPasswordMatchValid;

  // Step 4 Validation: Technical Stack & Target Tracks
  const isStep4Valid = selectedSkills.length > 0 && selectedGoals.length > 0;

  const isCurrentStepValid =
    step === 1 ? isStep1Valid : step === 2 ? isStep2Valid : step === 3 ? isStep3Valid : isStep4Valid;

  const handleFinish = () => {
    if (!isStep1Valid || !isStep2Valid || !isStep3Valid || !isStep4Valid) {
      return;
    }

    const finalName = name.trim();
    const finalSurname = surname.trim();
    const finalFullName = `${finalName} ${finalSurname}`;

    updateUserProfile({
      name: finalName,
      surname: finalSurname,
      email: email.trim(),
      password,
      university: university.trim(),
      major: major.trim(),
      location: location.trim(),
      role,
      skills: selectedSkills,
      goals: selectedGoals,
      cvText,
      isOnboarded: true,
    });

    addLog(
      'SYSTEM',
      `Account created: QADAM profile registered for ${finalFullName} (${role}, ${university.trim()})`
    );
    addLog('SANDBOX', 'User credentials secured locally · Directory sandbox confinement confirmed to /workspace/qadam');
    setIsOnboardingOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="registration-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090b]/95 backdrop-blur-md"
    >
      <div className="w-full max-w-2xl bg-surface border border-border-strong rounded-card shadow-2xl flex flex-col overflow-hidden">
        {/* Wizard Header */}
        <div className="px-6 py-4 border-b border-border bg-[#121215] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-sm bg-accent rotate-45 inline-block" />
            <div>
              <h2 id="registration-title" className="text-subheading text-text font-semibold">
                Create Your QADAM Account
              </h2>
              <div className="text-mini font-mono text-muted-2">
                Step {step} of 4:{' '}
                {step === 1
                  ? 'Personal Identity'
                  : step === 2
                  ? 'Academic & Professional Profile'
                  : step === 3
                  ? 'Account Security'
                  : 'Technical Stack & Target Tracks'}
              </div>
            </div>
          </div>

          {/* Step Progress indicators */}
          <div className="flex items-center gap-1.5 font-mono text-mini">
            {[1, 2, 3, 4].map((s) => (
              <span
                key={s}
                className={`w-6 h-6 rounded-btn flex items-center justify-center border text-[11px] font-semibold ${
                  step === s
                    ? 'border-accent bg-accent/15 text-accent shadow-sm'
                    : step > s
                    ? 'border-accent/40 bg-accent/5 text-accent'
                    : 'border-border bg-sidebar text-muted-2'
                }`}
              >
                {step > s ? '✓' : s}
              </span>
            ))}
          </div>
        </div>

        {/* Wizard Form Content */}
        <div className="p-6 overflow-y-auto max-h-[72vh] space-y-4">
          {/* STEP 1: Personal Identity */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-[17px] font-semibold text-text">Personal Identity</h3>
                <p className="text-[13px] text-muted mt-1 leading-relaxed">
                  Enter your legal or professional name. Real letters only (minimum 2 characters).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                    First Name <span className="text-accent">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="First name"
                    autoFocus
                    className={`w-full h-11 px-3.5 bg-sidebar border rounded-btn text-[13px] text-text placeholder:text-muted-2/60 focus:outline-none transition-colors ${
                      name && !isNameValid
                        ? 'border-red-500/80 focus:border-red-500'
                        : 'border-border focus:border-accent'
                    }`}
                  />
                  {name && !isNameValid && (
                    <span className="text-[11px] font-mono text-red-400 mt-1 block">
                      Must be at least 2 letters (no numbers or special characters).
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                    Last Name <span className="text-accent">*</span>
                  </label>
                  <input
                    type="text"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    placeholder="Last name"
                    className={`w-full h-11 px-3.5 bg-sidebar border rounded-btn text-[13px] text-text placeholder:text-muted-2/60 focus:outline-none transition-colors ${
                      surname && !isSurnameValid
                        ? 'border-red-500/80 focus:border-red-500'
                        : 'border-border focus:border-accent'
                    }`}
                  />
                  {surname && !isSurnameValid && (
                    <span className="text-[11px] font-mono text-red-400 mt-1 block">
                      Must be at least 2 letters (no numbers or special characters).
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3.5 bg-surface border border-border rounded-btn flex items-center gap-3 text-mini font-mono text-muted">
                <ShieldIcon size={16} className="text-accent flex-shrink-0" />
                <span>
                  QADAM uses client-side PII masking. Your real name is never sent unmasked to external LLM APIs.
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: Academic & Professional Profile */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-[17px] font-semibold text-text">Academic & Professional Profile</h3>
                <p className="text-[13px] text-muted mt-1 leading-relaxed">
                  Provide your institution and domain background for opportunity eligibility verification.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                    Academic / Professional Email <span className="text-accent">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@university.edu or student@institution.org"
                    className={`w-full h-11 px-3.5 bg-sidebar border rounded-btn text-[13px] text-text placeholder:text-muted-2/60 focus:outline-none transition-colors ${
                      email && !isEmailValid
                        ? 'border-red-500/80 focus:border-red-500'
                        : 'border-border focus:border-accent'
                    }`}
                  />
                  {email && !isEmailValid && (
                    <span className="text-[11px] font-mono text-red-400 mt-1 block">
                      Please enter a valid academic/professional email address.
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                    University / Institution <span className="text-accent">*</span>
                  </label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="e.g. Stanford University, MIT, Nazarbayev University"
                    className={`w-full h-11 px-3.5 bg-sidebar border rounded-btn text-[13px] text-text placeholder:text-muted-2/60 focus:outline-none transition-colors ${
                      university && !isUniversityValid
                        ? 'border-red-500/80 focus:border-red-500'
                        : 'border-border focus:border-accent'
                    }`}
                  />
                  {university && !isUniversityValid && (
                    <span className="text-[11px] font-mono text-red-400 mt-1 block">
                      Minimum 3 characters required.
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                    Department / Major <span className="text-accent">*</span>
                  </label>
                  <input
                    type="text"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="e.g. Computer Science, Robotics, Data Science"
                    className={`w-full h-11 px-3.5 bg-sidebar border rounded-btn text-[13px] text-text placeholder:text-muted-2/60 focus:outline-none transition-colors ${
                      major && !isMajorValid
                        ? 'border-red-500/80 focus:border-red-500'
                        : 'border-border focus:border-accent'
                    }`}
                  />
                  {major && !isMajorValid && (
                    <span className="text-[11px] font-mono text-red-400 mt-1 block">
                      Minimum 2 characters required.
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                    Current Location / City <span className="text-accent">*</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Almaty, Tokyo, San Francisco"
                    className={`w-full h-11 px-3.5 bg-sidebar border rounded-btn text-[13px] text-text placeholder:text-muted-2/60 focus:outline-none transition-colors ${
                      location && !isLocationValid
                        ? 'border-red-500/80 focus:border-red-500'
                        : 'border-border focus:border-accent'
                    }`}
                  />
                  {location && !isLocationValid && (
                    <span className="text-[11px] font-mono text-red-400 mt-1 block">
                      Minimum 2 characters required.
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                    Primary Academic / Tech Role <span className="text-accent">*</span>
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
              </div>
            </div>
          )}

          {/* STEP 3: Account Security (Double Password Entry) */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-[17px] font-semibold text-text">Account Security</h3>
                <p className="text-[13px] text-muted mt-1 leading-relaxed">
                  Establish sovereign password protection for your local browser sandbox.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                    Create Password <span className="text-accent">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full h-11 pl-3.5 pr-10 bg-sidebar border border-border rounded-btn text-[13px] text-text placeholder:text-muted-2/60 focus:border-accent focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text cursor-pointer"
                    >
                      {showPassword ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                    Confirm Password <span className="text-accent">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full h-11 pl-3.5 pr-10 bg-sidebar border border-border rounded-btn text-[13px] text-text placeholder:text-muted-2/60 focus:border-accent focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Real-time Password Validation Feedback */}
              <div className="p-3.5 bg-sidebar rounded-btn border border-border space-y-2">
                <div className="text-mini font-mono uppercase text-muted-2">Security Criteria</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-mini font-mono">
                  <div
                    className={`flex items-center gap-1.5 ${
                      isPasswordLengthValid ? 'text-accent' : 'text-zinc-500'
                    }`}
                  >
                    <span>{isPasswordLengthValid ? '✓' : '○'}</span>
                    <span>8+ characters</span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 ${
                      isPasswordComplexValid ? 'text-accent' : 'text-zinc-500'
                    }`}
                  >
                    <span>{isPasswordComplexValid ? '✓' : '○'}</span>
                    <span>Letters & numbers/symbols</span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 ${
                      isPasswordMatchValid ? 'text-accent' : 'text-zinc-500'
                    }`}
                  >
                    <span>{isPasswordMatchValid ? '✓' : '○'}</span>
                    <span>Passwords match</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Technical Stack & Target Tracks */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-[17px] font-semibold text-text">Technical Stack & Target Tracks</h3>
                <p className="text-[13px] text-muted mt-1 leading-relaxed">
                  Select your core competencies and focus tracks. QADAM calculates real-time opportunity fit from these inputs.
                </p>
              </div>

              {/* Skills */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-mini font-mono uppercase text-muted-2">
                    Active Tech Stack ({selectedSkills.length} selected) <span className="text-accent">*</span>
                  </label>
                  {selectedSkills.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedSkills([])}
                      className="text-mini font-mono text-muted hover:text-text underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
                  {POPULAR_TECH_STACK.map((skill) => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`h-9 px-3 rounded-btn text-mini font-mono border transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-accent/15 border-accent text-zinc-100 font-semibold shadow-sm'
                            : 'bg-sidebar border-border text-muted hover:border-zinc-700 hover:text-text'
                        }`}
                      >
                        {isSelected && <CheckIcon size={12} className="text-accent" />}
                        <span>{skill}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Objectives */}
              <div>
                <label className="block text-mini font-mono uppercase text-muted-2 mb-2">
                  Target Opportunity Tracks ({selectedGoals.length} selected) <span className="text-accent">*</span>
                </label>
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
                            ? 'bg-accent/15 border-accent text-zinc-100 font-semibold shadow-sm'
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

              {/* Optional Highlights */}
              <div>
                <label className="block text-mini font-mono uppercase text-muted-2 mb-1.5">
                  Resume Highlights / Project Summary (Optional)
                </label>
                <textarea
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  rows={3}
                  placeholder="Paste brief bullet points or bio for ATS keyword analysis..."
                  className="w-full p-3 bg-sidebar border border-border rounded-btn text-[12px] font-mono text-text placeholder:text-muted-2/60 focus:border-accent focus:outline-none leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="px-6 py-4 border-t border-border bg-[#121215] flex items-center justify-between">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3 | 4)}
                className="h-10 px-4 rounded-btn border border-zinc-700/80 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 text-[13px] font-medium transition-colors cursor-pointer"
              >
                Back
              </button>
            ) : (
              <span className="text-mini font-mono text-muted-2">
                QADAM Sovereign Client-Side Shield
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {step < 4 ? (
              <button
                type="button"
                disabled={!isCurrentStepValid}
                onClick={() => isCurrentStepValid && setStep((s) => (s + 1) as 2 | 3 | 4)}
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
                disabled={!isCurrentStepValid}
                onClick={handleFinish}
                className={`h-10 px-5 font-semibold rounded-btn text-[13px] transition-colors flex items-center gap-2 font-mono shadow-sm ${
                  isCurrentStepValid
                    ? 'bg-accent hover:bg-emerald-500 text-zinc-950 cursor-pointer'
                    : 'bg-zinc-900/40 border border-zinc-800 text-zinc-500 opacity-50 cursor-not-allowed'
                }`}
              >
                <RadarIcon size={16} />
                <span>Launch QADAM Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
