import React, { useEffect, useId, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CloseIcon, MessageSquareIcon } from './Icons';
import { networkClient } from '../lib/network';
import { CONTACT_EMAIL } from '../lib/pilotRequests';

// Beta feedback: a small floating button and a dark dialog. Reports go to POST /api/feedback.
// The dialog closes only with its Close button, so a half-written report is never lost.

type FeedbackType = 'bug' | 'feature' | 'general';
type Phase = 'idle' | 'sending' | 'sent' | 'error' | 'unavailable';

const TYPES: { value: FeedbackType; label: string; hint: string }[] = [
  { value: 'bug', label: 'Bug', hint: 'What did you do, what happened, and what did you expect?' },
  { value: 'feature', label: 'Feature request', hint: 'What would you like to do that you cannot do today?' },
  { value: 'general', label: 'General', hint: 'Anything else you want us to know.' },
];

const MIN_LENGTH = 10;
const MAX_LENGTH = 2000;

const FOCUSABLE = 'button:not(:disabled), a[href], textarea, input:not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])';

async function signedInUserId(): Promise<string | undefined> {
  try {
    const { data } = (await networkClient?.auth.getSession()) ?? { data: null };
    return data?.session?.user.id;
  } catch {
    return undefined;
  }
}

export const FeedbackWidget: React.FC = () => {
  const { pathname } = useLocation();
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>('bug');
  const [text, setText] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [message, setMessage] = useState('');
  const [page, setPage] = useState(pathname);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const hint = TYPES.find((item) => item.value === type)?.hint ?? '';
  const trimmed = text.trim();
  const canSend = trimmed.length >= MIN_LENGTH && phase !== 'sending';

  useEffect(() => {
    if (open) textRef.current?.focus();
  }, [open]);

  const openDialog = () => {
    setPage(pathname);
    setPhase('idle');
    setMessage('');
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    if (phase === 'sent') {
      setText('');
      setType('bug');
    }
    triggerRef.current?.focus();
  };

  // Keeps Tab inside the dialog while it is open.
  const trapTab = (event: React.KeyboardEvent) => {
    if (event.key !== 'Tab' || !panelRef.current) return;
    const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSend) return;
    setPhase('sending');
    setMessage('');
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, description: trimmed, userId: await signedInUserId(), pageUrl: page, website: honeypot }),
      });
      if (response.ok) {
        setPhase('sent');
        return;
      }
      const body = (await response.json().catch(() => null)) as { message?: string } | null;
      if (response.status === 422 || response.status === 429) {
        setPhase('error');
        setMessage(body?.message || 'Could not send this report.');
      } else {
        setPhase('unavailable');
      }
    } catch {
      setPhase('unavailable');
    }
  };

  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`QADAM feedback (${type})`)}&body=${encodeURIComponent(`${trimmed}\n\nPage: ${page}`)}`;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openDialog}
        aria-haspopup="dialog"
        aria-label="Send feedback"
        className="fixed z-40 right-4 bottom-24 lg:bottom-6 lg:right-6 h-11 min-w-11 px-3 sm:px-4 inline-flex items-center justify-center gap-2 rounded-full bg-[#0E1320]/95 backdrop-blur-md border border-white/10 hover:border-white/25 text-[13px] font-medium text-slate-300 hover:text-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.7)] transition-colors cursor-pointer"
      >
        <MessageSquareIcon size={16} />
        <span className="hidden sm:inline">Feedback</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onKeyDown={trapTab}
          className="animate-overlay-in fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 bg-[#070A12]/70 backdrop-blur-sm"
        >
          <div
            ref={panelRef}
            className="animate-modal-in w-full sm:max-w-md max-h-[92dvh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-[#0E1320] border border-white/10 text-slate-100 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.75)]"
          >
            <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3">
              <div>
                <h2 id={titleId} className="text-[16px] font-semibold tracking-tight text-white">
                  Send feedback
                </h2>
                <p className="mt-0.5 text-[12px] font-mono text-slate-400">Beta · tell us what to fix or build</p>
              </div>
              <button
                type="button"
                onClick={closeDialog}
                aria-label="Close feedback"
                className="-mr-1.5 w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            {phase === 'sent' ? (
              <div className="px-5 pb-5 space-y-4">
                <p role="status" className="text-[14px] leading-relaxed text-slate-200">
                  Thank you. We read every report.
                </p>
                <button
                  type="button"
                  onClick={closeDialog}
                  className="w-full h-11 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-[14px] font-medium text-white transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="px-5 pb-5 space-y-4" noValidate>
                <div role="radiogroup" aria-label="Feedback type" className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-black/25 border border-white/10">
                  {TYPES.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      role="radio"
                      aria-checked={type === item.value}
                      onClick={() => setType(item.value)}
                      className={`min-h-9 px-2 rounded-md text-[12px] font-medium transition-colors cursor-pointer ${
                        type === item.value ? 'bg-white/10 text-white border border-white/15' : 'text-slate-400 hover:text-slate-200 border border-transparent'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <label className="block">
                  <span className="sr-only">Your message</span>
                  <textarea
                    ref={textRef}
                    value={text}
                    onChange={(event) => setText(event.target.value.slice(0, MAX_LENGTH))}
                    rows={6}
                    placeholder={hint}
                    className="w-full resize-none rounded-lg bg-black/25 border border-white/10 focus:border-teal-400/60 focus:outline-none px-3 py-2.5 text-[14px] leading-relaxed text-slate-100 placeholder:text-slate-500"
                  />
                </label>

                {/* Honeypot: hidden from people, filled in by bots. */}
                <input
                  type="text"
                  name="website"
                  value={honeypot}
                  onChange={(event) => setHoneypot(event.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute -left-[9999px] h-0 w-0 opacity-0"
                />

                <div className="flex items-center justify-between gap-3 text-[11px] font-mono text-slate-500">
                  <span className="truncate">Sent with: page {page}</span>
                  <span className={trimmed.length > 0 && trimmed.length < MIN_LENGTH ? 'text-amber-400' : ''}>
                    {trimmed.length}/{MAX_LENGTH}
                  </span>
                </div>

                {message && (
                  <p role="alert" className="text-[13px] text-rose-300">
                    {message}
                  </p>
                )}
                {phase === 'unavailable' && (
                  <p role="alert" className="text-[13px] leading-relaxed text-amber-200">
                    Feedback is not available right now.{' '}
                    <a href={mailto} className="underline hover:text-white">
                      Send it by email instead
                    </a>
                    .
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!canSend}
                  className="w-full h-11 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:from-white/10 disabled:to-white/10 disabled:text-slate-500 text-white text-[14px] font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  {phase === 'sending' ? 'Sending...' : 'Send feedback'}
                </button>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  We store your message, the page path and your browser type. No profile data is sent.{' '}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-300">
                    Privacy
                  </a>
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
