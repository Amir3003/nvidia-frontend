import React, { useEffect, useRef, useState } from 'react';
import { CheckIcon, CloseIcon } from './Icons';
import {
  CONTACT_EMAIL,
  EMAIL_PATTERN,
  PilotRequest,
  pilotRequestMailto,
  submitPilotRequest,
} from '../lib/pilotRequests';

interface PilotRequestModalProps {
  open: boolean;
  onClose: () => void;
}

const ROLES = ['Director', 'Program lead', 'Career staff', 'Other'];
const CITIES = ['Almaty', 'Astana', 'Shymkent', 'Other'];
const COHORT_SIZES = ['Under 30', '30 to 50', '50 to 100', 'Over 100'];

const emptyRequest: PilotRequest = {
  institution: '',
  contactName: '',
  role: '',
  email: '',
  phone: '',
  city: '',
  cohortSize: '',
  message: '',
};

const fieldClass =
  'w-full h-11 px-3 rounded-[10px] bg-white border border-[#DCD5C7] text-[15px] text-[#1B2440] placeholder:text-[#9AA0AC] focus:outline-none focus:border-[#1B2440] focus:ring-2 focus:ring-[#1B2440]/10 transition-colors';
const labelClass = 'block text-[13px] font-medium text-[#1B2440] mb-1.5';

export const PilotRequestModal: React.FC<PilotRequestModalProps> = ({ open, onClose }) => {
  const [request, setRequest] = useState<PilotRequest>(emptyRequest);
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof PilotRequest, string>>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'stored' | 'email'>('idle');
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    firstFieldRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setStatus('idle');
      setErrors({});
    }
  }, [open]);

  if (!open) return null;

  const update = (key: keyof PilotRequest) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setRequest((current) => ({ ...current, [key]: event.target.value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = () => {
    const next: Partial<Record<keyof PilotRequest, string>> = {};
    if (request.institution.trim().length < 2) next.institution = 'Enter the name of your institution.';
    if (request.contactName.trim().length < 2) next.contactName = 'Enter your name.';
    if (!EMAIL_PATTERN.test(request.email.trim())) next.email = 'Enter a valid email address.';
    setErrors(next);
    const firstInvalid = { institution: 'pilot-institution', contactName: 'pilot-name', email: 'pilot-email' };
    const firstKey = (Object.keys(firstInvalid) as (keyof typeof firstInvalid)[]).find((key) => next[key]);
    if (firstKey) document.getElementById(firstInvalid[firstKey])?.focus();
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (honeypot) return;
    if (!validate()) return;
    const clean: PilotRequest = {
      ...request,
      institution: request.institution.trim(),
      contactName: request.contactName.trim(),
      email: request.email.trim(),
      phone: request.phone.trim(),
      message: request.message.trim(),
    };
    setStatus('sending');
    const result = await submitPilotRequest(clean);
    if (result === 'email') window.location.href = pilotRequestMailto(clean);
    else setRequest(emptyRequest);
    setStatus(result);
  };

  const done = status === 'stored' || status === 'email';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="pilot-title">
      <div className="absolute inset-0 bg-[#1B2440]/45 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full sm:max-w-xl max-h-[92dvh] overflow-y-auto bg-[#F7F4EE] rounded-t-[20px] sm:rounded-[20px] border border-[#E4DED2] shadow-[0_24px_64px_-24px_rgba(27,36,64,0.45)]">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 px-5 sm:px-7 pt-5 sm:pt-6 pb-4 bg-[#F7F4EE] border-b border-[#E4DED2]">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#8A6A2F]">Pilot request</p>
            <h2 id="pilot-title" className="mt-1 text-[22px] font-semibold tracking-tight text-[#1B2440]">
              Run a pilot with one cohort
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-11 h-11 -mr-2 -mt-1 flex items-center justify-center rounded-full text-[#4A5468] hover:bg-[#EDE7DA] transition-colors cursor-pointer"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {done ? (
          <div className="px-5 sm:px-7 py-8 space-y-4">
            <div className="w-11 h-11 rounded-full bg-[#E6F2EF] text-[#0F766E] flex items-center justify-center">
              <CheckIcon size={22} />
            </div>
            <h3 className="text-[19px] font-semibold text-[#1B2440]">
              {status === 'stored' ? 'Thank you. Your request is in.' : 'Your email app should open now.'}
            </h3>
            <p className="text-[15px] leading-relaxed text-[#4A5468]">
              {status === 'stored'
                ? 'We will reply by email to agree on a short call, the cohort and the start date.'
                : `Press Send in your email app to finish. If it did not open, write to ${CONTACT_EMAIL}.`}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-5 rounded-[10px] bg-[#1B2440] hover:bg-[#28345A] text-[#F7F4EE] text-[15px] font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="px-5 sm:px-7 py-6 space-y-4">
            <p className="text-[15px] leading-relaxed text-[#4A5468]">
              Free for 4 to 6 weeks with 30 to 50 learners and one staff lead. Tell us about your institution and we will
              reply by email.
            </p>

            <div>
              <label htmlFor="pilot-institution" className={labelClass}>Institution</label>
              <input
                ref={firstFieldRef}
                id="pilot-institution"
                className={fieldClass}
                value={request.institution}
                onChange={update('institution')}
                maxLength={160}
                autoComplete="organization"
                aria-invalid={Boolean(errors.institution)}
              />
              {errors.institution && <p className="mt-1 text-[13px] text-[#B42318]">{errors.institution}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pilot-name" className={labelClass}>Your name</label>
                <input
                  id="pilot-name"
                  className={fieldClass}
                  value={request.contactName}
                  onChange={update('contactName')}
                  maxLength={120}
                  autoComplete="name"
                  aria-invalid={Boolean(errors.contactName)}
                />
                {errors.contactName && <p className="mt-1 text-[13px] text-[#B42318]">{errors.contactName}</p>}
              </div>
              <div>
                <label htmlFor="pilot-role" className={labelClass}>Role</label>
                <select id="pilot-role" className={fieldClass} value={request.role} onChange={update('role')}>
                  <option value="">Select</option>
                  {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pilot-email" className={labelClass}>Work email</label>
                <input
                  id="pilot-email"
                  type="email"
                  className={fieldClass}
                  value={request.email}
                  onChange={update('email')}
                  maxLength={200}
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email && <p className="mt-1 text-[13px] text-[#B42318]">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="pilot-phone" className={labelClass}>
                  Phone or Telegram <span className="font-normal text-[#6B7385]">(optional)</span>
                </label>
                <input
                  id="pilot-phone"
                  className={fieldClass}
                  value={request.phone}
                  onChange={update('phone')}
                  maxLength={60}
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pilot-city" className={labelClass}>City</label>
                <select id="pilot-city" className={fieldClass} value={request.city} onChange={update('city')}>
                  <option value="">Select</option>
                  {CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="pilot-size" className={labelClass}>Learners per cohort</label>
                <select id="pilot-size" className={fieldClass} value={request.cohortSize} onChange={update('cohortSize')}>
                  <option value="">Select</option>
                  {COHORT_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="pilot-message" className={labelClass}>
                Anything we should know <span className="font-normal text-[#6B7385]">(optional)</span>
              </label>
              <textarea
                id="pilot-message"
                rows={3}
                className={`${fieldClass} h-auto py-2.5 resize-y min-h-[88px]`}
                value={request.message}
                onChange={update('message')}
                maxLength={1000}
              />
            </div>

            <div className="hidden" aria-hidden="true">
              <label htmlFor="pilot-website">Website</label>
              <input id="pilot-website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
              <p className="text-[12px] leading-relaxed text-[#6B7385]">
                We use these details only to reply to your request.
              </p>
              <button
                type="submit"
                disabled={status === 'sending'}
                className="h-11 px-6 rounded-[10px] bg-[#1B2440] hover:bg-[#28345A] disabled:opacity-60 text-[#F7F4EE] text-[15px] font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                {status === 'sending' ? 'Sending' : 'Send request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
