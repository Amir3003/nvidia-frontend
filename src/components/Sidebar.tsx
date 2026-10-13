import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  RadarIcon,
  MemoryIcon,
  CvIcon,
  ShieldIcon,
  TerminalIcon,
  SettingsIcon,
  CloseIcon,
  LockIcon,
  EditIcon,
  RefreshIcon,
  UsersIcon,
  UserIcon,
} from './Icons';
import { useApp } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const {
    userProfile,
    setIsOnboardingOpen,
    privacySettings,
    triggerBlockedSandboxAction,
    resetToDefaultProfile,
    openShellStatus,
    nebiusApiStatus,
    toggleOpenShellStatus,
    toggleNebiusApiStatus,
  } = useApp();
  const location = useLocation();

  const navItems = [
    { to: '/', label: 'Opportunity Radar', icon: RadarIcon },
    { to: '/memory', label: 'Agent Memory', icon: MemoryIcon },
    { to: '/cv', label: 'CV & Skill Lab', icon: CvIcon },
    { to: '/network', label: 'Teammates & Network', icon: UsersIcon },
    { to: '/privacy', label: 'Privacy Shield', icon: ShieldIcon },
    { to: '/logs', label: 'Logs & Terminal', icon: TerminalIcon },
    { to: '/profile', label: 'Profile & Settings', icon: UserIcon },
  ];

  // Derive initials from name
  const initials = [userProfile.name?.[0], userProfile.surname?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase() || 'U';

  const displayName = userProfile.name
    ? `${userProfile.name} ${userProfile.surname || ''}`.trim()
    : 'New Candidate';

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-sidebar border-b border-border sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-text tracking-tight text-[15px]">Pathfinder</span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-accent/10 text-accent border border-accent-border">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            SANDBOX
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          className="h-11 w-11 flex items-center justify-center rounded-btn border border-border-strong text-text-2 hover:bg-surface-hover"
        >
          {isMobileMenuOpen ? <CloseIcon size={16} /> : <TerminalIcon size={16} />}
        </button>
      </div>

      {/* Main Sidebar */}
      <aside
        className={`
          ${isMobileMenuOpen ? 'block' : 'hidden'}
          lg:flex flex-col w-full lg:w-[248px] lg:min-w-[248px] bg-sidebar border-r border-border min-h-screen lg:sticky lg:top-0 lg:h-screen z-20 select-none
        `}
      >
        {/* Top Brand Header (VERSION TAG & STATUS PILLS REMOVED) */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-text rotate-45 inline-block" />
            <h1 className="text-[15px] font-semibold text-text tracking-tight">Pathfinder</h1>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-3 h-11 rounded-btn text-[13px] font-medium transition-colors
                  ${
                    isActive
                      ? 'bg-surface-hover text-text border border-border-strong font-semibold'
                      : 'text-muted hover:text-text hover:bg-surface/60'
                  }
                `}
              >
                <Icon size={16} className={isActive ? 'text-text' : 'text-muted-2'} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile & Settings Footer */}
        <div className="p-3 border-t border-border flex items-center justify-between bg-surface/30">
          <NavLink
            to="/profile"
            title="Manage candidate profile"
            className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-85 transition-opacity"
          >
            {userProfile.avatarUrl ? (
              <img
                src={userProfile.avatarUrl}
                alt={displayName}
                className="w-7 h-7 rounded-full object-cover border border-border-strong flex-shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-[11px] font-mono font-medium text-zinc-200 flex-shrink-0">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <div className="text-[13px] font-medium text-text truncate">{displayName}</div>
              <div className="text-[11px] font-mono text-muted-2 truncate">
                {userProfile.university || 'Profile Settings'}
              </div>
            </div>
          </NavLink>

          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Settings"
            className="w-11 h-11 flex items-center justify-center rounded-btn border border-transparent hover:border-border text-muted hover:text-text transition-colors"
          >
            <SettingsIcon size={16} />
          </button>
        </div>
      </aside>

      {/* Settings Modal Drawer */}
      {isSettingsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg/85 backdrop-blur-sm p-4"
        >
          <div className="w-full max-w-md bg-surface border border-border rounded-card shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <LockIcon size={16} className="text-accent" />
                <h3 id="settings-modal-title" className="text-subheading text-text">Agent & Module Controls</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                aria-label="Close settings"
                className="w-8 h-8 flex items-center justify-center text-muted hover:text-text rounded-btn"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <div className="space-y-3 text-[13px]">
              <div className="p-3 rounded bg-sidebar border border-border flex items-center justify-between">
                <div>
                  <div className="font-medium text-text">{displayName}</div>
                  <div className="text-mini font-mono text-muted">{userProfile.role}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingsOpen(false);
                    setIsOnboardingOpen(true);
                  }}
                  className="h-9 px-3 rounded-btn border border-border-strong hover:bg-surface-hover text-mini font-mono text-text flex items-center gap-1.5"
                >
                  <EditIcon size={12} />
                  <span>Setup Wizard</span>
                </button>
              </div>

              <div className="p-3 rounded bg-sidebar border border-border flex items-center justify-between">
                <div>
                  <div className="font-medium text-text">OpenShell Confinement</div>
                  <div className="text-mini font-mono text-muted">Path: /workspace/pathfinder</div>
                </div>
                <span className="text-mini font-mono px-2 py-0.5 rounded bg-accent/10 text-accent border border-accent-border">
                  LOCKED
                </span>
              </div>

              <div className="p-3 rounded bg-sidebar border border-border flex items-center justify-between">
                <div>
                  <div className="font-medium text-text">Inference Model</div>
                  <div className="text-mini font-mono text-muted">nvidia/Nemotron-3.5-Lightning</div>
                </div>
                <span className="text-mini font-mono px-2 py-0.5 rounded bg-surface-hover text-text-2 border border-border">
                  FP8
                </span>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerBlockedSandboxAction();
                    setIsSettingsOpen(false);
                  }}
                  className="w-full h-11 rounded-btn border border-warning/40 text-warning hover:bg-warning/10 text-body font-mono font-medium flex items-center justify-center gap-2"
                >
                  Simulate Unauthorized Access Test
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetToDefaultProfile();
                    setIsSettingsOpen(false);
                  }}
                  className="w-full h-11 rounded-btn border border-border text-muted hover:text-text hover:bg-surface-hover text-body font-mono font-medium flex items-center justify-center gap-2"
                >
                  <RefreshIcon size={14} />
                  <span>Reset / Restart Setup Wizard</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="h-11 px-4 bg-text text-bg font-medium text-[13px] rounded-btn hover:opacity-90"
              >
                Close Controls
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
