import React, { useState, useRef } from 'react';
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
} from '../components/Icons';
import { TogglePill } from '../components/TogglePill';

export const ProfilePage: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    setIsOnboardingOpen,
    resetToDefaultProfile,
    skills,
    addLog,
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

  // Avatar upload state (color presets removed per clean slate directive)
  const [avatarUrl, setAvatarUrl] = useState<string>(userProfile.avatarUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedSkills, setSelectedSkills] = useState<string[]>(userProfile.skills || []);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(userProfile.goals || []);

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
        addLog('SYSTEM', `Uploaded new custom user avatar (${(file.size / 1024).toFixed(1)} KB)`);
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
    addLog('SYSTEM', 'Local user profile saved to storage: user_profile');
  };

  const initials = [name?.[0], surname?.[0]].filter(Boolean).join('').toUpperCase() || 'U';

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <PageHeader
        title="Profile & Settings"
        subtitle={`sovereign client data · storage: user_profile · ${university || 'Local Environment'}`}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsOnboardingOpen(true)}
              className="h-10 px-3.5 rounded-btn border border-zinc-700/80 bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 text-mini font-mono flex items-center gap-2 transition-colors"
            >
              <RefreshIcon size={14} />
              <span>Rerun Setup Wizard</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="h-10 px-5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-500 text-zinc-100 rounded-btn text-[13px] font-medium flex items-center gap-1.5 transition-colors shadow-sm"
            >
              {saveSuccess && <CheckIcon size={14} className="text-accent" />}
              <span>{saveSuccess ? 'Saved' : 'Save Changes'}</span>
            </button>
          </div>
        }
      />

      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Card: Avatar Preview & Quick Summary */}
          <div className="p-5 rounded-card bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`${name} ${surname}`}
                  className="w-14 h-14 rounded-full object-cover border-2 border-border-strong flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-[18px] font-mono font-semibold text-zinc-200 flex-shrink-0">
                  {initials}
                </div>
              )}
              <div>
                <h3 className="text-[17px] font-semibold text-text">
                  {name || surname ? `${name} ${surname}`.trim() : 'Candidate Profile'}
                </h3>
                <div className="text-[12px] font-mono text-muted mt-0.5">
                  {role} · {university || 'University unassigned'}
                </div>
                <div className="text-mini font-mono text-muted-2 mt-0.5">
                  {location || 'Location unassigned'} · {email || 'Email unassigned'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-mini font-mono px-2.5 py-1 rounded bg-accent/10 text-accent border border-accent-border">
                SANDBOX ENCRYPTED
              </span>
            </div>
          </div>

          {/* Section: Custom Avatar Upload */}
          <div className="p-5 rounded-card bg-surface border border-border space-y-3">
            <div className="text-mini font-mono uppercase text-muted-2 tracking-wider pb-2 border-b border-border flex items-center justify-between">
              <span>Avatar & Visual Identity</span>
              <span className="text-muted text-[11px]">Upload custom photo</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-[13px] font-medium text-text">Custom Profile Photo</div>
                <p className="text-mini font-mono text-muted leading-relaxed mt-0.5">
                  Stored as Base64 in your local browser sandbox. No third-party avatar services or external tracking.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="avatar-file-input"
                />
                <label
                  htmlFor="avatar-file-input"
                  className="h-10 px-4 rounded-btn border border-zinc-700/80 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 text-mini font-mono flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <UploadIcon size={14} />
                  <span>{avatarUrl ? 'Replace Photo' : 'Upload Photo'}</span>
                </label>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={clearUploadedAvatar}
                    className="h-10 px-3 rounded-btn border border-zinc-700/80 bg-zinc-900/60 hover:bg-zinc-800 text-rose-400 text-mini font-mono flex items-center gap-1.5 transition-colors"
                  >
                    <TrashIcon size={14} />
                    <span>Remove</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section 1: Personal Identity */}
          <div className="p-5 rounded-card bg-surface border border-border space-y-4">
            <div className="text-mini font-mono uppercase text-muted-2 tracking-wider pb-2 border-b border-border flex items-center gap-2">
              <UserIcon size={14} className="text-text" />
              <span>Personal Identity & Academic Role</span>
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

              <div>
                <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                  Academic Email
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
                  Location / City
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, Country"
                  className="w-full h-11 px-3.5 bg-sidebar border border-border rounded-btn text-[13px] text-text focus:border-accent focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                  Primary Academic / Professional Role
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
          </div>

          {/* Section 2: Dedicated Confidential & Security Card */}
          <div className="p-5 rounded-card bg-surface border border-border space-y-4">
            <div className="text-mini font-mono uppercase text-muted-2 tracking-wider pb-2 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LockIcon size={14} className="text-accent" />
                <span className="text-text font-semibold">Confidential & Security</span>
              </div>
              <span className="text-mini font-mono text-muted">Client-Side Password Encryption</span>
            </div>

            <div className="max-w-md space-y-2">
              <label className="block text-mini font-mono uppercase text-muted-2">
                Account Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Confidential password"
                  className="w-full h-11 pl-3.5 pr-11 bg-sidebar border border-border rounded-btn text-[13px] text-text font-mono focus:border-accent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted hover:text-text transition-colors"
                >
                  {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                </button>
              </div>
              <p className="text-[11px] font-mono text-muted-2">
                Masked by default behind asterisks. Stored locally inside the OpenShell sandbox barrier.
              </p>
            </div>
          </div>

          {/* Section 3: Academic Affiliation */}
          <div className="p-5 rounded-card bg-surface border border-border space-y-4">
            <div className="text-mini font-mono uppercase text-muted-2 tracking-wider pb-2 border-b border-border">
              Academic Affiliation & Degree
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                  University / Institution
                </label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="University or Institution"
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
                  placeholder="Department or Major"
                  className="w-full h-11 px-3.5 bg-sidebar border border-border rounded-btn text-[13px] text-text focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                  Degree Program
                </label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="Degree Program"
                  className="w-full h-11 px-3.5 bg-sidebar border border-border rounded-btn text-[13px] text-text focus:border-accent focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Technical Competencies (Click-to-Toggle Modern Pills) */}
          <div className="p-5 rounded-card bg-surface border border-border space-y-4">
            <div className="text-mini font-mono uppercase text-muted-2 tracking-wider pb-2 border-b border-border flex items-center justify-between">
              <span>Technical Competencies ({selectedSkills.length} selected)</span>
              <span className="text-mini text-muted font-mono">Real-time Radar Match & ATS Sync</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {POPULAR_TECH_STACK.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                const isVerified = skills.find((s) => s.name === skill)?.status === 'VERIFIED';
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`
                      h-10 px-3.5 rounded-btn text-mini font-mono border transition-all flex items-center gap-1.5 cursor-pointer
                      ${
                        isSelected
                          ? 'bg-accent/15 border-accent text-text font-semibold shadow-sm'
                          : 'bg-sidebar border-border text-muted hover:border-border-strong hover:text-text'
                      }
                    `}
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
              <span>Target Objectives & Tracks ({selectedGoals.length} selected)</span>
              <span className="text-mini text-muted font-mono">Focus Areas</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {CAREER_OBJECTIVES.map((goal) => {
                const isSelected = selectedGoals.includes(goal);
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => toggleGoal(goal)}
                    className={`
                      h-10 px-3.5 rounded-btn text-mini font-mono border transition-all flex items-center gap-2 cursor-pointer
                      ${
                        isSelected
                          ? 'bg-accent/15 border-accent text-text font-semibold shadow-sm'
                          : 'bg-sidebar border-border text-muted hover:border-border-strong hover:text-text'
                      }
                    `}
                  >
                    {isSelected ? (
                      <CheckIcon size={12} className="text-accent" />
                    ) : (
                      <span className="text-muted-2 text-mini">+</span>
                    )}
                    <span>{goal}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 6: Resume Markdown & Highlights */}
          <div className="p-5 rounded-card bg-surface border border-border space-y-3">
            <div className="text-mini font-mono uppercase text-muted-2 tracking-wider pb-2 border-b border-border">
              Resume Text / Project Summary (for ATS Analysis)
            </div>
            <textarea
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              rows={4}
              placeholder="Paste CV summary, publications, or project bullet points for ATS gap analysis..."
              className="w-full p-3.5 bg-sidebar border border-border rounded-btn text-[12px] font-mono text-text focus:border-accent focus:outline-none leading-relaxed select-text"
            />
          </div>

          {/* Section 7: Sovereignty & Team Boundaries */}
          <div className="p-5 rounded-card bg-surface border border-border space-y-3">
            <div className="text-mini font-mono uppercase text-muted-2 tracking-wider pb-2 border-b border-border">
              Privacy & Discovery Controls
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
                className="h-11 px-4 rounded-btn border border-warning/40 text-warning hover:bg-warning/10 text-mini font-mono transition-colors"
              >
                Reset Local Profile Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
