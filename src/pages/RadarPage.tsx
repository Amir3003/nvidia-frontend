import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/PageHeader';
import {
  SearchIcon,
  RefreshIcon,
  CompanyBadgeIcon,
  EyeIcon,
  FileTextIcon,
  BarChartIcon,
  RadarIcon,
  UserIcon,
} from '../components/Icons';

export const RadarPage: React.FC = () => {
  const {
    opportunities,
    runTavilySearch,
    isTavilyScanning,
    setSelectedOpportunityForDraft,
    setSelectedOpportunityForDetails,
    setSelectedOpportunityForGaps,
    userProfile,
    setIsOnboardingOpen,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Hackathons' | 'Grants' | 'Internships' | 'Match >80%'>('All');

  // Check if candidate profile has been configured with skills
  const isProfileReady = userProfile.isOnboarded && userProfile.skills && userProfile.skills.length > 0;

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      // Filter by type or match threshold
      if (activeFilter === 'Hackathons' && opp.type !== 'HACKATHON') return false;
      if (activeFilter === 'Grants' && opp.type !== 'GRANT') return false;
      if (activeFilter === 'Internships' && opp.type !== 'INTERNSHIP') return false;
      if (activeFilter === 'Match >80%' && opp.match < 80) return false;

      // Filter by search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesTitle = opp.title.toLowerCase().includes(query);
        const matchesOrg = opp.organization.toLowerCase().includes(query);
        const matchesDesc = opp.description.toLowerCase().includes(query);
        const matchesLocation = opp.location.toLowerCase().includes(query);
        const matchesSkills = opp.skills.some((s) => s.toLowerCase().includes(query));
        return matchesTitle || matchesOrg || matchesDesc || matchesLocation || matchesSkills;
      }

      return true;
    });
  }, [opportunities, activeFilter, searchQuery]);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <PageHeader
        title="Opportunity Radar"
        subtitle={
          isProfileReady
            ? `last scan 06:00 · ${opportunities.length} opportunities indexed · candidate: ${userProfile.name || 'Anonymous'}`
            : 'last scan 06:00 · profile uninitialized · matches pending configuration'
        }
        actions={
          <button
            type="button"
            onClick={runTavilySearch}
            disabled={isTavilyScanning}
            className="h-10 px-4 rounded-btn border border-zinc-700/80 bg-zinc-900 hover:bg-zinc-800 text-accent hover:border-zinc-600 transition-colors flex items-center gap-2 text-[13px] font-mono font-medium disabled:opacity-50"
          >
            <RefreshIcon size={14} className={isTavilyScanning ? 'animate-spin' : ''} />
            <span>{isTavilyScanning ? 'Scanning Live Radar…' : 'Run Radar Scan Now'}</span>
          </button>
        }
      />

      <div className="p-6 space-y-6">
        {/* FRESH EMPTY STATE: If user has not completed onboarding or added skills */}
        {!isProfileReady ? (
          <div className="p-10 rounded-card bg-surface border border-border text-center space-y-5 max-w-2xl mx-auto my-8">
            <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-700/80 mx-auto flex items-center justify-center text-accent">
              <RadarIcon size={26} />
            </div>
            <div className="space-y-2">
              <h3 className="text-[17px] font-semibold text-text">
                Candidate Profile Required
              </h3>
              <p className="text-[14px] text-muted leading-relaxed max-w-lg mx-auto">
                Please complete your profile and technical stack in Settings to calculate personalized opportunity matches.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/profile"
                className="h-10 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-500 text-zinc-100 text-[13px] font-medium rounded-btn transition-colors flex items-center gap-2"
              >
                <UserIcon size={15} />
                <span>Configure Profile in Settings</span>
              </Link>
              <button
                type="button"
                onClick={() => setIsOnboardingOpen(true)}
                className="h-10 px-4 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-500 text-zinc-200 text-[13px] font-medium rounded-btn transition-colors flex items-center gap-2"
              >
                <span>Launch Setup Wizard</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Toolbar: Search input + Filter Chips */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search field */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-2">
                  <SearchIcon size={16} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search companies, tracks, stacks, or locations…"
                  className="w-full h-11 pl-10 pr-4 bg-surface border border-border rounded-btn text-[13px] text-text placeholder:text-muted-2 focus:border-border-strong focus:outline-none"
                />
              </div>

              {/* Filter Chips */}
              <div className="flex flex-wrap items-center gap-2">
                {(['All', 'Hackathons', 'Grants', 'Internships', 'Match >80%'] as const).map((filter) => {
                  const isActive = activeFilter === filter;
                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setActiveFilter(filter)}
                      className={`
                        h-10 px-3.5 rounded-btn text-mini font-mono transition-colors border
                        ${
                          isActive
                            ? 'bg-zinc-800 text-zinc-100 border-zinc-600 font-semibold'
                            : 'bg-zinc-900/70 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                        }
                      `}
                    >
                      {filter}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredOpportunities.map((opp) => {
                const isHighMatch = opp.match >= 80;
                return (
                  <div
                    key={opp.id}
                    className="p-5 rounded-card bg-surface border border-border flex flex-col justify-between hover:border-border-strong transition-colors"
                  >
                    <div>
                      {/* Top row: Organization Avatar & Type Badge */}
                      <div className="flex items-center justify-between mb-3.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-[6px] bg-zinc-900 border border-zinc-700/80 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <CompanyBadgeIcon orgKey={opp.orgKey} size={18} />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[11px] font-mono font-semibold text-zinc-300 tracking-wider uppercase block truncate">
                              {opp.organization}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500 block truncate">
                              {opp.type}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-mini font-mono px-2 py-0.5 rounded border border-border text-muted bg-sidebar/50">
                            {opp.deadline}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-subheading text-text leading-snug font-semibold line-clamp-2">
                        {opp.title}
                      </h3>

                      {/* Match Bar */}
                      <div className="my-3 space-y-1">
                        <div className="flex items-center justify-between text-mini font-mono">
                          <span className="text-muted-2">Alignment</span>
                          <span className={isHighMatch ? 'text-accent font-semibold' : 'text-muted'}>
                            {opp.match}% match
                          </span>
                        </div>
                        <div className="w-full h-[3px] bg-sidebar rounded-full overflow-hidden">
                          <div
                            className={`h-full ${isHighMatch ? 'bg-accent' : 'bg-muted-2'}`}
                            style={{ width: `${opp.match}%` }}
                          />
                        </div>
                      </div>

                      {/* Short Description */}
                      <p className="text-[13px] text-muted leading-relaxed line-clamp-2 mb-3.5">
                        {opp.description}
                      </p>

                      {/* Skill Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {opp.skills.map((skill) => {
                          const userHasSkill = userProfile.skills?.some(
                            (us) => us.toLowerCase() === skill.toLowerCase()
                          );
                          return (
                            <span
                              key={skill}
                              className={`px-2 py-0.5 rounded-btn text-mini font-mono border ${
                                userHasSkill
                                  ? 'border-accent/40 text-text bg-accent/10 font-medium'
                                  : 'border-border text-muted bg-transparent'
                              }`}
                            >
                              {skill}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Footer buttons (Strict Linear/Vercel standard: bg-zinc-900, 1px border, high-contrast) */}
                    <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedOpportunityForDraft(opp)}
                          className="h-10 px-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-500 text-zinc-100 rounded-btn text-[13px] font-medium transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          <FileTextIcon size={14} className="text-accent" />
                          <span>Draft Application</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedOpportunityForGaps(opp)}
                          className="h-10 px-3.5 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-500 text-zinc-200 rounded-btn text-[13px] font-medium transition-colors flex items-center gap-1.5"
                        >
                          <BarChartIcon size={14} className="text-zinc-400" />
                          <span>Analyze CV Gaps</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedOpportunityForDetails(opp)}
                        aria-label={`View details for ${opp.title}`}
                        className="h-10 px-3.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-500 text-zinc-200 hover:text-zinc-100 rounded-btn text-[13px] font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <EyeIcon size={14} className="text-zinc-400" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredOpportunities.length === 0 && (
              <div className="p-12 text-center border border-dashed border-border rounded-card bg-surface/30">
                <p className="text-[14px] text-muted font-mono">No matching opportunities found for current criteria.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveFilter('All');
                  }}
                  className="mt-3 h-10 px-4 rounded-btn border border-zinc-700/80 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-zinc-100 text-mini font-mono"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
