import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export type Audience = 'students' | 'schools';

const OPTIONS: { audience: Audience; label: string; to: string }[] = [
  { audience: 'students', label: 'For Students', to: '/students' },
  { audience: 'schools', label: 'For Schools', to: '/welcome' },
];

const SLIDE_MS = 220;

// Segmented switch between the two public landings. The thumb slides first, then the route
// changes, so the move reads as one gesture. Modified clicks (new tab) and reduced motion
// navigate at once.
export const AudienceSwitch: React.FC<{ active: Audience; className?: string }> = ({ active, className = '' }) => {
  const navigate = useNavigate();
  const [shown, setShown] = useState<Audience>(active);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    setShown(active);
  }, [active]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onClick = (event: React.MouseEvent, option: (typeof OPTIONS)[number]) => {
    if (option.audience === active) {
      event.preventDefault();
      return;
    }
    const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
    if (modified) return;
    event.preventDefault();
    setShown(option.audience);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    timer.current = window.setTimeout(() => navigate(option.to), reduce ? 0 : SLIDE_MS);
  };

  return (
    <nav
      aria-label="Choose your audience"
      className={`relative inline-grid grid-cols-2 p-0.5 rounded-full bg-[#0B101E]/80 border border-white/10 ${className}`}
    >
      <span
        aria-hidden="true"
        className={`absolute top-0.5 bottom-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-gradient-to-r from-emerald-500/25 to-teal-500/25 border border-teal-400/40 transition-transform duration-[220ms] ease-ios ${
          shown === 'schools' ? 'translate-x-full' : 'translate-x-0'
        }`}
      />
      {OPTIONS.map((option) => (
        <Link
          key={option.audience}
          to={option.to}
          onClick={(event) => onClick(event, option)}
          aria-current={option.audience === active ? 'page' : undefined}
          className={`relative z-10 min-h-[36px] px-3.5 sm:px-4 inline-flex items-center justify-center whitespace-nowrap rounded-full text-[13px] font-semibold transition-colors duration-200 ${
            option.audience === shown ? 'text-white' : 'text-teal-100/70 hover:text-white'
          }`}
        >
          {option.label}
        </Link>
      ))}
    </nav>
  );
};
