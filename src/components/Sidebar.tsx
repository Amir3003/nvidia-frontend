import React, { useState } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import {
  RadarIcon,
  MemoryIcon,
  CvIcon,
  SettingsIcon,
  CloseIcon,
  UsersIcon,
  UserIcon,
  BellIcon,
} from './Icons';
import { useApp } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { userProfile } = useApp();
  const location = useLocation();

  const navItems = [
    { to: '/', label: 'Opportunity Radar', icon: RadarIcon },
    { to: '/cv', label: 'CV & Skill Lab', icon: CvIcon },
    { to: '/memory', label: 'Agent Memory', icon: MemoryIcon },
    { to: '/network', label: 'Teammates & Network', icon: UsersIcon },
    { to: '/notifications', label: 'Notifications & Bots', icon: BellIcon },
    { to: '/profile', label: 'Settings & Profile', icon: UserIcon },
  ];

  // Derive initials from name
  const initials = [userProfile.name?.[0], userProfile.surname?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase() || 'Q';

  const displayName = userProfile.name
    ? `${userProfile.name} ${userProfile.surname || ''}`.trim()
    : 'New Candidate';

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-bg border-b border-border sticky top-0 z-30">
        <Link to="/welcome" className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-accent rotate-45 inline-block" />
          <span className="font-semibold text-text tracking-tight text-[15px]">QADAM</span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-accent/10 text-accent border border-accent-border">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            SOVEREIGN
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          className="h-10 w-10 flex items-center justify-center rounded-btn border border-border text-muted hover:text-text hover:bg-surface-hover cursor-pointer"
        >
          {isMobileMenuOpen ? <CloseIcon size={16} /> : <span className="text-sm font-mono">☰</span>}
        </button>
      </div>

      {/* Main Left Sidebar */}
      <aside
        className={`
          ${isMobileMenuOpen ? 'block' : 'hidden'}
          lg:flex flex-col w-full lg:w-[248px] lg:min-w-[248px] bg-bg border-r border-border min-h-screen lg:sticky lg:top-0 lg:h-screen z-20 select-none
        `}
      >
        {/* Top Brand Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <Link
            to="/welcome"
            title="QADAM — Return to Welcome Page"
            className="flex items-center gap-2.5 hover:opacity-85 transition-opacity"
          >
            <span className="w-2.5 h-2.5 rounded-sm bg-accent rotate-45 inline-block" />
            <div className="flex items-baseline gap-1.5">
              <h1 className="text-[16px] font-bold text-text tracking-tight font-sans">QADAM</h1>
              <span className="text-[11px] font-mono text-muted-2">«Қадам»</span>
            </div>
          </Link>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-border text-zinc-400">
            SOVEREIGN
          </span>
        </div>

        {/* Clean, Focused 6 Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.to === '/'
                ? location.pathname === '/' || location.pathname === '/application-studio'
                : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-3 h-10 rounded-btn text-[13px] font-medium transition-colors
                  ${
                    isActive
                      ? 'bg-surface text-text border border-zinc-700 font-semibold shadow-sm'
                      : 'text-muted hover:text-text hover:bg-surface/60'
                  }
                `}
              >
                <Icon size={16} className={isActive ? 'text-accent' : 'text-muted-2'} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile & Settings Footer -> Navigates directly to /profile */}
        <div className="p-3 border-t border-border flex items-center justify-between bg-surface/20">
          <NavLink
            to="/profile"
            title="Settings & Profile"
            className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-85 transition-opacity flex-1"
          >
            {userProfile.avatarUrl ? (
              <img
                src={userProfile.avatarUrl}
                alt={displayName}
                className="w-7 h-7 rounded-full object-cover border border-zinc-700 flex-shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-[11px] font-mono font-medium text-zinc-200 flex-shrink-0">
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium text-text truncate">{displayName}</div>
              <div className="text-[11px] font-mono text-muted-2 truncate">
                {userProfile.university || 'Settings & Profile'}
              </div>
            </div>
          </NavLink>

          <NavLink
            to="/profile"
            aria-label="Settings"
            className="w-8 h-8 flex items-center justify-center rounded-btn border border-transparent hover:border-border text-muted hover:text-text transition-colors"
          >
            <SettingsIcon size={15} />
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
