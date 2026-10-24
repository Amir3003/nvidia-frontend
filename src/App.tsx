import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { AmbientBackground } from './components/AmbientBackground';
import { ScrollToTop } from './components/ScrollToTop';
import { RadarPage } from './pages/RadarPage';
import { MemoryPage } from './pages/MemoryPage';
import { CvLabPage } from './pages/CvLabPage';
import { NetworkPage } from './pages/NetworkPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ApplicationStudioPage } from './pages/ApplicationStudioPage';
import { JoinPage } from './pages/JoinPage';
import { AccountPortalPage } from './pages/AccountPortalPage';
import { WelcomePage } from './pages/WelcomePage';
import { PrivacyPage } from './pages/PrivacyPage';
import { StudentAccessPage } from './pages/StudentAccessPage';
import { StaffPage } from './pages/StaffPage';
import { LearnerSync } from './components/LearnerSync';
import { loadMembership } from './lib/cohorts';
import { OnboardingWizard } from './components/OnboardingWizard';
import { CvGapsModal } from './components/CvGapsModal';
import { QuizModal } from './components/QuizModal';
import { OpportunityDetailsModal } from './components/OpportunityDetailsModal';
import { useApp } from './context/AppContext';
import { isProfileValid } from './db/userProfile';

export const App: React.FC = () => {
  const { userProfile } = useApp();
  const location = useLocation();
  const hasValidProfile = isProfileValid(userProfile);
  // B2B: the app is open only to learners who joined a cohort with an invite code.
  const hasAccess = hasValidProfile && Boolean(loadMembership());

  // Staff workspace and student sign-in work without a local profile.
  if (location.pathname === '/staff' || location.pathname === '/student') {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-transparent text-slate-100 antialiased font-sans relative">
        <ScrollToTop />
        <AmbientBackground />
        {location.pathname === '/staff' ? <StaffPage /> : <StudentAccessPage />}
      </div>
    );
  }

  // Public privacy page, readable with or without an account
  if (location.pathname === '/privacy') {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-transparent text-slate-100 antialiased font-sans relative">
        <ScrollToTop />
        <AmbientBackground />
        <PrivacyPage />
      </div>
    );
  }

  // Shared network has verified email identity and must work on a fresh device.
  if (location.pathname === '/join') return <JoinPage />;
  if (location.pathname === '/network' && !hasValidProfile) {
    return (
      <div className="min-h-[100dvh] bg-transparent text-slate-100 relative">
        <AmbientBackground />
        <NetworkPage />
      </div>
    );
  }

  // Without a profile and a cohort, every app route goes back to the public landing.
  if (!hasAccess && location.pathname !== '/welcome') {
    return <Navigate to="/welcome" replace />;
  }

  // Public B2B landing for training centers, on the live ambient background
  if (location.pathname === '/welcome') {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-transparent text-slate-100 antialiased selection:bg-accent/20 selection:text-white font-sans relative">
        <ScrollToTop />
        <AmbientBackground />
        <WelcomePage />
      </div>
    );
  }

  // Dedicated Full-Page Account Portal Layout (Hides standard workspace sidebar)
  if (
    location.pathname.startsWith('/account') ||
    location.pathname === '/profile' ||
    location.pathname === '/settings' ||
    location.pathname === '/support'
  ) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-transparent text-slate-100 antialiased selection:bg-accent/20 selection:text-white font-sans relative">
        <ScrollToTop />
        <AmbientBackground />
        <AccountPortalPage />
        <OnboardingWizard />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-transparent text-slate-100 flex flex-col lg:flex-row antialiased selection:bg-accent/20 selection:text-white font-sans relative">
      <ScrollToTop />
      <AmbientBackground />
      <LearnerSync />

      {/* 248px Left Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area: each view applies its own pb-28 clearance for the mobile bottom bar */}
      <main className="flex-1 flex flex-col min-w-0 bg-transparent relative z-10">
        <Routes>
          <Route path="/" element={<RadarPage />} />
          <Route path="/dashboard" element={<RadarPage />} />
          <Route path="/cv" element={<CvLabPage />} />
          <Route path="/memory" element={<MemoryPage />} />
          <Route path="/network" element={<NetworkPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/application-studio" element={<ApplicationStudioPage />} />
          <Route path="/logs" element={<Navigate to="/account?tab=settings" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Interactive Modals & Wizards */}
      <OnboardingWizard />
      <CvGapsModal />
      <QuizModal />
      <OpportunityDetailsModal />
    </div>
  );
};

export default App;
