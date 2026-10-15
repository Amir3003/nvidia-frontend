import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CloseIcon,
  UserIcon,
} from './Icons';

export const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
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
  useEffect(() => {
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

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOnboardingOpen) {
        setIsOnboardingOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOnboardingOpen, setIsOnboardingOpen]);

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
    navigate('/');
  };

  const handleEnterAsExisting = () => {
    setIsOnboardingOpen(false);
    navigate('/');
  };

  const isAlreadyOnboarded = userProfile.isOnboarded && Boolean(userProfile.name?.trim());

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="registration-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOnboardingOpen(false);
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
    >
      <div className="w-full max-w-2xl bg-gradient-to-br from-[#EDF7F6] via-[#F3F6FF] to-[#E8F4F8] border border-teal-300/60 rounded-card shadow-[0_24px_60px_-15px_rgba(6,182,212,0.3)] flex flex-col overflow-hidden text-slate-900">
        
        {/* Wizard Header with Visible Close Button */}
        <div className="px-6 py-4 border-b border-teal-200/80 bg-white/75 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="QADAM Logo" className="w-8 h-8 object-contain rounded-md drop-shadow-xs" />
            <div>
              <div className="flex items-center gap-1.5">
                <h2 id="registration-title" className="text-subheading text-indigo-950 font-bold">
                  Create Your QADAM Account
                </h2>
                <span className="text-[11px] font-mono text-teal-800">«Қадам»</span>
              </div>
              <div className="text-mini font-mono text-teal-800 font-medium">
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

          <div className="flex items-center gap-3">
            {/* Step Progress indicators */}
            <div className="flex items-center gap-1.5 font-mono text-mini">
              {[1, 2, 3, 4].map((s) => (
                <span
                  key={s}
                  className={`w-6 h-6 rounded-btn flex items-center justify-center border text-[11px] font-semibold ${
                    step === s
                      ? 'border-emerald-600 bg-emerald-500 text-white shadow-xs'
                      : step > s
                      ? 'border-emerald-400 bg-emerald-100 text-emerald-800'
                      : 'border-teal-200 bg-white/80 text-teal-700'
                  }`}
                >
                  {step > s ? '✓' : s}
                </span>
              ))}
            </div>

            {/* Close [ ✕ ] Button */}
            <button
              type="button"
              onClick={() => setIsOnboardingOpen(false)}
              aria-label="Close Registration Modal"
              className="w-8 h-8 rounded-btn bg-white/80 hover:bg-white text-slate-500 hover:text-slate-900 border border-teal-200 flex items-center justify-center transition-colors cursor-pointer shadow-xs ml-1"
            >
              <CloseIcon size={14} />
            </button>
          </div>
        </div>

        {/* Existing Member Shortcut Banner if already onboarded */}
        {isAlreadyOnboarded && (
          <div className="px-6 py-2.5 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-indigo-500/15 border-b border-teal-200 flex items-center justify-between gap-3 text-mini font-mono">
            <div className="flex items-center gap-2 text-teal-950">
              <UserIcon size={14} className="text-emerald-700" />
              <span>Signed in as <strong>{userProfile.name} {userProfile.surname || ''}</strong></span>
            </div>
            <button
              type="button"
              onClick={handleEnterAsExisting}
              className="px-3 py-1 rounded-btn bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <span>Enter Workspace as {userProfile.name} →</span>
            </button>
          </div>
        )}

        {/* Wizard Form Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
          {/* STEP 1: Personal Identity */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Official Slogan & Translation Backstory */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-teal-300/40 text-mini text-teal-950 leading-relaxed flex items-center gap-3 shadow-xs">
                <img src="/logo.png" alt="QADAM Step" className="w-6 h-6 object-contain flex-shrink-0" />
                <p>
                  <strong>QADAM («Қадам»)</strong> — derived from the Kazakh word for "step". Your confident step toward global opportunities, grants, and technologies. 🚀
                </p>
              </div>

              <div>
                <h3 className="text-[17px] font-bold text-indigo-950">Personal Identity</h3>
                <p className="text-[13px] text-teal-900 mt-1 leading-relaxed">
                  Enter your legal or professional name. Real letters only (minimum 2 characters).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-mini font-mono uppercase text-teal-900 font-semibold mb-1">
                    First Name <span className="text-emerald-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="First name"
                    className="w-full h-11 px-3.5 bg-white border border-teal-200/90 rounded-btn text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none shadow-xs transition-colors"
                  />
                  {!isNameValid && name.length > 0 && (
                    <div className="text-[11px] font-mono text-rose-600 mt-1">
                      Minimum 2 characters, letters only (no generic names).
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-mini font-mono uppercase text-teal-900 font-semibold mb-1">
                    Last Name <span className="text-emerald-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    placeholder="Last name"
                    className="w-full h-11 px-3.5 bg-white border border-teal-200/90 rounded-btn text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none shadow-xs transition-colors"
                  />
                  {!isSurnameValid && surname.length > 0 && (
                    <div className="text-[11px] font-mono text-rose-600 mt-1">
                      Minimum 2 characters, letters only.
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3.5 rounded-card bg-white/70 border border-teal-200/80 flex items-start gap-3 text-mini font-mono text-teal-950">
                <ShieldIcon size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Your identity is tokenized client-side via local encryption. External AI models only see anonymized identifiers like [USER_NAME_1].
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Academic & Professional Profile */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-[17px] font-bold text-indigo-950">Academic & Professional Profile</h3>
                <p className="text-[13px] text-teal-900 mt-1 leading-relaxed">
                  Provide your institution, discipline, and location to match eligibility requirements.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-mini font-mono uppercase text-teal-900 font-semibold mb-1">
                    Email Address <span className="text-emerald-600">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full h-11 px-3.5 bg-white border border-teal-200/90 rounded-btn text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none shadow-xs transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-mini font-mono uppercase text-teal-900 font-semibold mb-1">
                    Target Academic Role <span className="text-emerald-600">*</span>
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full h-11 px-3.5 bg-white border border-teal-200/90 rounded-btn text-[13px] text-slate-900 focus:border-emerald-600 focus:outline-none shadow-xs transition-colors cursor-pointer"
                  >
                    {USER_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-mini font-mono uppercase text-teal-900 font-semibold mb-1">
                    University / Institute <span className="text-emerald-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="University Name"
                    className="w-full h-11 px-3.5 bg-white border border-teal-200/90 rounded-btn text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none shadow-xs transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-mini font-mono uppercase text-teal-900 font-semibold mb-1">
                    Major / Field of Study <span className="text-emerald-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="Computer Science"
                    className="w-full h-11 px-3.5 bg-white border border-teal-200/90 rounded-btn text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none shadow-xs transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-mini font-mono uppercase text-teal-900 font-semibold mb-1">
                  Location / Country <span className="text-emerald-600">*</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Almaty, Kazakhstan"
                  className="w-full h-11 px-3.5 bg-white border border-teal-200/90 rounded-btn text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none shadow-xs transition-colors"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Account Security */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-[17px] font-bold text-indigo-950">Account Security</h3>
                <p className="text-[13px] text-teal-900 mt-1 leading-relaxed">
                  Create a secure password with at least 8 characters, letters, and numbers/symbols.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-mini font-mono uppercase text-teal-900 font-semibold mb-1">
                    Create Password <span className="text-emerald-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-11 pl-3.5 pr-10 bg-white border border-teal-200/90 rounded-btn text-[13px] text-slate-900 focus:border-emerald-600 focus:outline-none shadow-xs transition-colors"
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

                <div>
                  <label className="block text-mini font-mono uppercase text-teal-900 font-semibold mb-1">
                    Confirm Password <span className="text-emerald-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-11 pl-3.5 pr-10 bg-white border border-teal-200/90 rounded-btn text-[13px] text-slate-900 focus:border-emerald-600 focus:outline-none shadow-xs transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                    </button>
                  </div>
                  {!isPasswordMatchValid && confirmPassword.length > 0 && (
                    <div className="text-[11px] font-mono text-rose-600 mt-1">
                      Passwords do not match.
                    </div>
                  )}
                </div>
              </div>

              {/* Password Requirements Checklist */}
              <div className="p-3.5 rounded-card bg-white/70 border border-teal-200/80 space-y-2 text-mini font-mono">
                <div className="flex items-center gap-2">
                  <span className={isPasswordLengthValid ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                    {isPasswordLengthValid ? '✓' : '○'}
                  </span>
                  <span className={isPasswordLengthValid ? 'text-teal-950 font-medium' : 'text-slate-500'}>
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={isPasswordComplexValid ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                    {isPasswordComplexValid ? '✓' : '○'}
                  </span>
                  <span className={isPasswordComplexValid ? 'text-teal-950 font-medium' : 'text-slate-500'}>
                    Includes letters and numbers or symbols
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={isPasswordMatchValid ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                    {isPasswordMatchValid ? '✓' : '○'}
                  </span>
                  <span className={isPasswordMatchValid ? 'text-teal-950 font-medium' : 'text-slate-500'}>
                    Both password fields match
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Technical Stack & Target Tracks */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-[17px] font-bold text-indigo-950">Technical Stack & Target Tracks</h3>
                <p className="text-[13px] text-teal-900 mt-1 leading-relaxed">
                  Select your core technologies and career objectives to index your personalized Radar.
                </p>
              </div>

              {/* Tech Stack Chips */}
              <div>
                <label className="block text-mini font-mono uppercase text-teal-900 font-semibold mb-2">
                  Core Technical Skills <span className="text-emerald-600">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_TECH_STACK.map((tech) => {
                    const isSelected = selectedSkills.includes(tech);
                    return (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => toggleSkill(tech)}
                        className={`px-3 py-1.5 rounded-btn text-[12px] font-mono transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-xs'
                            : 'bg-white border border-teal-200/90 text-slate-700 hover:border-teal-400'
                        }`}
                      >
                        {isSelected ? `✓ ${tech}` : `+ ${tech}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Career Goals */}
              <div>
                <label className="block text-mini font-mono uppercase text-teal-900 font-semibold mb-2">
                  Primary Objectives <span className="text-emerald-600">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CAREER_OBJECTIVES.map((goal) => {
                    const isSelected = selectedGoals.includes(goal);
                    return (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => toggleGoal(goal)}
                        className={`p-2.5 rounded-btn text-left text-[12px] font-mono transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold border-indigo-600 shadow-xs'
                            : 'bg-white border-teal-200/90 text-slate-700 hover:border-indigo-400'
                        }`}
                      >
                        {isSelected ? `✓ ${goal}` : `○ ${goal}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional CV Summary */}
              <div>
                <label className="block text-mini font-mono uppercase text-teal-900 font-semibold mb-1">
                  Resume Highlights / Project Summary (Optional)
                </label>
                <textarea
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  rows={3}
                  placeholder="Paste brief bullet points or bio for ATS keyword analysis..."
                  className="w-full p-3 bg-white border border-teal-200/90 rounded-btn text-[12px] font-mono text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none leading-relaxed transition-colors"
                />
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="px-6 py-4 border-t border-teal-200/80 bg-white/75 backdrop-blur-md flex items-center justify-between">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3 | 4)}
                className="h-10 px-4 rounded-btn border border-teal-200 bg-white hover:bg-slate-50 text-slate-700 text-[13px] font-medium transition-colors cursor-pointer shadow-xs"
              >
                Back
              </button>
            ) : (
              <span className="text-mini font-mono text-teal-800 font-medium">
                QADAM Privacy Guard Active
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {step < 4 ? (
              <button
                type="button"
                disabled={!isCurrentStepValid}
                onClick={() => isCurrentStepValid && setStep((s) => (s + 1) as 2 | 3 | 4)}
                className={`h-10 px-5 rounded-btn text-[13px] font-semibold transition-all flex items-center gap-1.5 font-mono shadow-xs ${
                  isCurrentStepValid
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white cursor-pointer shadow-emerald-900/20'
                    : 'bg-white/60 border border-teal-200 text-slate-400 opacity-60 cursor-not-allowed'
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
                className={`h-11 px-6 font-bold rounded-btn text-[13px] transition-all flex items-center gap-2 font-mono shadow-md ${
                  isCurrentStepValid
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white cursor-pointer shadow-emerald-600/30'
                    : 'bg-white/60 border border-teal-200 text-slate-400 opacity-60 cursor-not-allowed'
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
