import { useEffect, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { getConsent, setConsent, subscribeConsent } from '../../lib/consent';

const ANALYTICS_SRC = '/_vercel/insights/script.js';

export const useConsent = () => useSyncExternalStore(subscribeConsent, getConsent, () => 'unset' as const);

// Loads Vercel Web Analytics only after an explicit Accept, and only in production builds.
// The script counts page views (including client-side route changes) and sets no cookies.
export function AnalyticsGate() {
  const consent = useConsent();

  useEffect(() => {
    if (!import.meta.env.PROD) return;
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${ANALYTICS_SRC}"]`);
    if (consent === 'granted' && !existing) {
      const w = window as typeof window & { va?: (...args: unknown[]) => void; vaq?: unknown[] };
      w.va = w.va || ((...args: unknown[]) => { (w.vaq = w.vaq || []).push(args); });
      const script = document.createElement('script');
      script.src = ANALYTICS_SRC;
      script.defer = true;
      document.head.appendChild(script);
    } else if (consent !== 'granted' && existing) {
      // Withdrawn: a loaded script cannot be unloaded, so reload without it.
      window.location.reload();
    }
  }, [consent]);

  return null;
}

// Equal-weight Decline and Accept. Until a choice is made, analytics stays off.
export function ConsentBanner() {
  const consent = useConsent();
  if (consent !== 'unset') return null;

  const button =
    'flex-1 h-10 px-3 rounded-btn border border-teal-400/40 bg-slate-900/70 text-teal-50 hover:bg-slate-800 hover:text-white text-mini font-mono font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300';

  return (
    <section
      aria-label="Analytics consent"
      className="fixed inset-x-3 bottom-24 lg:bottom-4 sm:left-4 sm:right-auto sm:max-w-sm z-[60] p-4 rounded-card bg-slate-950/95 backdrop-blur-xl border border-teal-500/30 shadow-2xl"
    >
      <p className="text-[13px] leading-relaxed text-teal-50/90">
        QADAM Hub uses no advertising cookies. Your sign-in and profile are kept in this browser so the app works. With
        your permission we also count page visits with Vercel Web Analytics, which sets no cookies.{' '}
        <Link to="/privacy#cookies" className="text-teal-200 underline underline-offset-4 hover:text-white">
          Privacy Policy
        </Link>
      </p>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={() => setConsent('denied')} className={button}>
          Decline
        </button>
        <button type="button" onClick={() => setConsent('granted')} className={button}>
          Accept analytics
        </button>
      </div>
    </section>
  );
}

// Reopens the banner so the analytics choice can be changed or withdrawn at any time.
export function CookieSettingsButton({ className = '' }: { className?: string }) {
  return (
    <button type="button" onClick={() => setConsent(null)} className={`cursor-pointer ${className}`}>
      Cookie settings
    </button>
  );
}
