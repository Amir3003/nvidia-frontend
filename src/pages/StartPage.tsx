import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WelcomeFlow } from '../components/WelcomeFlow';
import { useApp } from '../context/AppContext';
import { isProfileValid } from '../db/userProfile';
import { usePageMeta } from '../lib/seo';

// Free sign-up for individual students (B2C): no invite code, no institution. The welcome flow
// creates a minimal profile kept on this device; the rest is added later in the account page.
export const StartPage: React.FC = () => {
  usePageMeta('Create your free student profile | QADAM Hub', '/start');
  const navigate = useNavigate();
  const { userProfile } = useApp();
  const ready = isProfileValid(userProfile);

  useEffect(() => {
    if (ready) navigate('/', { replace: true });
  }, [ready, navigate]);

  return <WelcomeFlow onClose={() => navigate('/students')} />;
};

export default StartPage;
