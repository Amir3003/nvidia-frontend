import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { RadarPage } from './pages/RadarPage';
import { MemoryPage } from './pages/MemoryPage';
import { CvLabPage } from './pages/CvLabPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { LogsPage } from './pages/LogsPage';
import { ProfilePage } from './pages/ProfilePage';
import { NetworkPage } from './pages/NetworkPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ApplicationStudioPage } from './pages/ApplicationStudioPage';
import { WelcomePage } from './pages/WelcomePage';
import { OnboardingWizard } from './components/OnboardingWizard';
import { CvGapsModal } from './components/CvGapsModal';
import { QuizModal } from './components/QuizModal';
import { DraftApplicationModal } from './components/DraftApplicationModal';
import { OpportunityDetailsModal } from './components/OpportunityDetailsModal';
import { useApp } from './context/AppContext';
import { isProfileValid } from './db/userProfile';

export const App: React.FC = () => {
  const { userProfile } = useApp();
  const location = useLocation();
  const hasValidProfile = isProfileValid(userProfile);

  // If user profile is not valid and not on /welcome, redirect to /welcome
  if (!hasValidProfile && location.pathname !== '/welcome') {
    return <Navigate to="/welcome" replace />;
  }

  // Standalone Welcome landing page
  if (location.pathname === '/welcome') {
    return (
      <div className="min-h-screen bg-bg text-text antialiased selection:bg-accent/20 selection:text-text font-sans">
        <WelcomePage />
        <OnboardingWizard />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col lg:flex-row antialiased selection:bg-accent/20 selection:text-text font-sans">
      {/* 248px Left Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-bg overflow-x-hidden">
        <Routes>
          <Route path="/" element={<RadarPage />} />
          <Route path="/onboarding" element={<Navigate to="/welcome" replace />} />
          <Route path="/memory" element={<MemoryPage />} />
          <Route path="/cv" element={<CvLabPage />} />
          <Route path="/network" element={<NetworkPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/application-studio" element={<ApplicationStudioPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Interactive Modals & Wizards */}
      <OnboardingWizard />
      <CvGapsModal />
      <QuizModal />
      <DraftApplicationModal />
      <OpportunityDetailsModal />
    </div>
  );
};

export default App;

