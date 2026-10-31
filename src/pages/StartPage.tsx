import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AccessCard } from '../components/NetworkAccess';
import { OnboardingWizard } from '../components/OnboardingWizard';
import { useApp } from '../context/AppContext';
import { isProfileValid } from '../db/userProfile';
import { usePageMeta } from '../lib/seo';

// Free sign-up for individual students (B2C): no invite code, no institution.
// The profile is created in the registration wizard and kept on this device.
export const StartPage: React.FC = () => {
  usePageMeta('Create your free student profile | QADAM Hub', '/start');
  const navigate = useNavigate();
  const { userProfile, setIsOnboardingOpen } = useApp();
  const ready = isProfileValid(userProfile);
  // The wizard opens once on arrival; closing it must not reopen it.
  const opened = useRef(false);

  useEffect(() => {
    if (ready) {
      navigate('/', { replace: true });
    } else if (!opened.current) {
      opened.current = true;
      setIsOnboardingOpen(true);
    }
  }, [ready, navigate, setIsOnboardingOpen]);

  return (
    <>
      <AccessCard title="Create your free profile" brandLine="QADAM Hub · For students">
        <p className="text-[14px] text-teal-950 leading-relaxed">
          Four short steps: who you are, where you study, your skills and your goals. Your profile stays on this device.
        </p>
        <button
          type="button"
          onClick={() => setIsOnboardingOpen(true)}
          className="w-full h-11 rounded-btn bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-[14px] font-semibold transition-all shadow-md shadow-emerald-900/20 cursor-pointer"
        >
          Continue
        </button>
        <p className="text-mini font-mono text-teal-800 text-center">
          Studying with a school or training center?{' '}
          <Link to="/student" className="underline hover:text-emerald-700">
            Use your invite code
          </Link>
        </p>
      </AccessCard>
      <OnboardingWizard />
    </>
  );
};

export default StartPage;
