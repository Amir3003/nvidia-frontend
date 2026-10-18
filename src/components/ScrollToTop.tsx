import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  const { userProfile, isOnboardingOpen } = useApp();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, userProfile.isOnboarded, isOnboardingOpen]);

  return null;
};

export default ScrollToTop;

