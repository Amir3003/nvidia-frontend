import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { RadarPage } from './pages/RadarPage';
import { MemoryPage } from './pages/MemoryPage';
import { CvLabPage } from './pages/CvLabPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { LogsPage } from './pages/LogsPage';
import { ProfilePage } from './pages/ProfilePage';
import { NetworkPage } from './pages/NetworkPage';
import { OnboardingWizard } from './components/OnboardingWizard';
import { CvGapsModal } from './components/CvGapsModal';
import { QuizModal } from './components/QuizModal';
import { DraftApplicationModal } from './components/DraftApplicationModal';
import { OpportunityDetailsModal } from './components/OpportunityDetailsModal';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col lg:flex-row antialiased selection:bg-accent/20 selection:text-text font-sans">
      {/* 248px Left Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-bg overflow-x-hidden">
        <Routes>
          <Route path="/" element={<RadarPage />} />
          <Route path="/onboarding" element={<RadarPage />} />
          <Route path="/memory" element={<MemoryPage />} />
          <Route path="/cv" element={<CvLabPage />} />
          <Route path="/network" element={<NetworkPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
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
