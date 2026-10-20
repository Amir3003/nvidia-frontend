import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/PageHeader';
import { availableIn, profileCountry } from '../db/location';
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
  const navigate = useNavigate();
  const {
    opportunities,
    runTavilySearch,
    isTavilyScanning,
    setSelectedOpportunityForDetails,
    setSelectedOpportunityForGaps,
    userProfile,
    setIsOnboardingOpen,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Hackathons' | 'Grants' | 'Internships' | 'Near me' | 'Match >80%'>('All');
  // The radar is global; the country filter appears only when the profile has a country.
  const country = profileCountry(userProfile.location || '');

  // Check if candidate profile has been configured with skills
  const isProfileReady = userProfile.isOnboarded && userProfile.skills && userProfile.skills.length > 0;

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      // Filter by type or match threshold
      if (activeFilter === 'Hackathons' && opp.type !== 'HACKATHON') return false;
      if (activeFilter === 'Grants' && opp.type !== 'GRANT') return false;
      if (activeFilter === 'Internships' && opp.type !== 'INTERNSHIP') return false;
      if (activeFilter === 'Match >80%' && opp.match < 80) return false;
      if (activeFilter === 'Near me' && !availableIn(opp, country)) return false;

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
  }, [opportunities, activeFilter, searchQuery, country]);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-transparent relative z-10 text-slate-100">
      <PageHeader
        title="Opportunity Radar"
        subtitle={
          isProfileReady
            ? `${opportunities.length} opportunities indexed · candidate: ${userProfile.name || 'Anonymous'}`
            : 'profile uninitialized · matches pending configuration'
        }
        actions={
          <button
            type="button"
            onClick={runTavilySearch}
            disabled={isTavilyScanning}
            className="h-10 px-4 rounded-btn border border-teal-500/30 bg-slate-900/80 hover:bg-slate-800/80 text-teal-100 hover:border-teal-400 transition-colors flex items-center gap-2 text-[13px] font-mono font-medium disabled:opacity-50 shadow-xs cursor-pointer"
          >
            <RefreshIcon size={14} className={isTavilyScanning ? 'animate-spin text-emerald-400' : 'text-emerald-400'} />
            <span>{isTavilyScanning ? 'Loading Radar...' : 'Refresh Results'}</span>
          </button>
        }
      />

      <div className="p-4 sm:p-6 pb-28 lg:pb-8 space-y-6">
        {/* Subtle, non-blocking onboarding notification banner if profile has no verified skills yet */}
        {!isProfileReady && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-indigo-500/15 border border-teal-300/40 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-900 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 flex-shrink-0">
                <RadarIcon size={18} />
              </div>
              <div>
                <div className="text-[14px] font-bold text-indigo-950">Welcome to QADAM Opportunity Radar</div>
                <div className="text-[12px] font-mono text-teal-900">
                  Showing global opportunities. Add your technical stack in Settings to boost match precision.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/account?tab=profile"
                className="min-h-[38px] px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-[12px] font-semibold font-mono rounded-lg transition-all flex items-center gap-1.5 shadow-xs whitespace-nowrap active:scale-95"
              >
                <UserIcon size={13} />
                <span>Configure Stack</span>
              </Link>
            </div>
          </div>
        )}

        {/* Toolbar: Search input + Filter Chips ALWAYS visible */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search field */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-teal-300">
              <SearchIcon size={16} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search companies, tracks, stacks, or locations…"
              autoCapitalize="none"
              autoCorrect="off"
              inputMode="search"
              className="w-full h-11 pl-10 pr-4 bg-slate-900/80 border border-teal-500/30 rounded-xl text-base md:text-[13px] text-white placeholder:text-teal-200/50 focus:border-teal-400 focus:outline-none shadow-xs transition-colors"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {([
              'All', 'Hackathons', 'Grants', 'Internships',
              ...(country ? (['Near me'] as const) : []),
              'Match >80%',
            ] as const).map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`
                    min-h-[44px] h-10 px-4 rounded-xl text-mini font-mono transition-all border cursor-pointer active:scale-95
                    ${isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-500 font-bold shadow-xs'
                      : 'bg-slate-900/80 text-teal-200/80 border-teal-500/30 hover:bg-slate-800/80 hover:text-white hover:border-teal-400 shadow-xs'
                    }
                  `}
                >
                  {filter === 'Near me' ? `Open from ${country}` : filter}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredOpportunities.map((opp) => {
            const isHighMatch = opp.match >= 80;
            return (
              <div
                key={opp.id}
                className="p-5 rounded-card bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95 backdrop-blur-xl border border-teal-300/40 shadow-[0_16px_40px_-12px_rgba(6,182,212,0.18)] hover:shadow-elevated hover:border-teal-400/80 flex flex-col justify-between transition-all text-slate-900"
              >
                <div>
                  {/* Top row: Organization Avatar & Type Badge */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-[6px] bg-white border border-teal-200 flex items-center justify-center flex-shrink-0 shadow-xs">
                        <CompanyBadgeIcon orgKey={opp.orgKey} size={18} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-mono font-bold text-indigo-950 tracking-wider uppercase block truncate">
                          {opp.organization}
                        </span>
                        <span className="text-[10px] font-mono text-teal-700 block truncate">
                          {opp.type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-mini font-mono px-2 py-0.5 rounded border border-teal-200 text-teal-900 bg-white font-medium">
                        {opp.deadline}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-subheading text-indigo-950 leading-snug font-bold line-clamp-2">
                    {opp.title}
                  </h3>

                  {/* Match Bar: a percentage only means something when both sides list skills */}
                  {opp.skills.length > 0 && isProfileReady ? (
                    <div className="my-3 space-y-1">
                      <div className="flex items-center justify-between text-mini font-mono">
                        <span className="text-teal-800">Alignment</span>
                        <span className={isHighMatch ? 'text-emerald-700 font-bold' : 'text-slate-600'}>
                          {opp.match}% match
                        </span>
                      </div>
                      <div className="w-full h-[4px] bg-white/80 rounded-full overflow-hidden border border-teal-200/60">
                        <div
                          className={`h-full ${isHighMatch ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-slate-300'}`}
                          style={{ width: `${opp.match}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="my-3 text-mini font-mono text-teal-800">
                      {opp.skills.length === 0
                        ? 'Required skills are not listed by the organizer'
                        : 'Add your skills in Settings to see your match'}
                    </div>
                  )}

                  {/* Short Description */}
                  <p className="text-[13px] text-teal-950 leading-relaxed line-clamp-2 mb-3.5">
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
                          className={`px-2 py-0.5 rounded-btn text-mini font-mono border ${userHasSkill
                              ? 'border-emerald-300 text-emerald-800 bg-emerald-100 font-bold'
                              : 'border-teal-200 text-slate-700 bg-white'
                            }`}
                        >
                          {skill}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="pt-3 border-t border-teal-200/60 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <button
                      type="button"
                      onClick={() => {
                        navigate(`/application-studio?id=${opp.id}`);
                      }}
                      className="h-10 px-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-btn text-[13px] font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <FileTextIcon size={14} className="text-white" />
                      <span>Prepare &amp; Apply</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedOpportunityForGaps(opp)}
                      className="h-10 px-3.5 bg-white hover:bg-slate-50 border border-teal-200 text-teal-950 rounded-btn text-[13px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <BarChartIcon size={14} className="text-teal-700" />
                      <span>Analyze CV Gaps</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedOpportunityForDetails(opp)}
                    aria-label={`View details for ${opp.title}`}
                    className="h-10 px-3.5 bg-white hover:bg-slate-50 border border-teal-200 text-teal-950 rounded-btn text-[13px] font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs cursor-pointer"
                  >
                    <EyeIcon size={14} className="text-teal-600" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredOpportunities.length === 0 && (
          <div className="p-12 text-center border border-dashed border-teal-500/30 rounded-card bg-slate-900/60">
            <p className="text-[14px] text-teal-200 font-mono">
              {opportunities.length === 0
                ? 'No sourced opportunities have been published yet. Please check back after the scheduled scan.'
                : !searchQuery.trim() && activeFilter === 'Near me'
                  ? `Nothing is confirmed open from ${country} yet. A listing shows here when its source says online, worldwide or names ${country}.`
                : !searchQuery.trim() && (activeFilter === 'Grants' || activeFilter === 'Internships')
                  ? `No ${activeFilter.toLowerCase()} on the radar yet. The daily scan adds new ones with an official link.`
                  : 'No matching opportunities found for current criteria.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('All');
              }}
              className="min-h-[44px] h-10 px-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-mono text-mini font-semibold rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RadarPage;
