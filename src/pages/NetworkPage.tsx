import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/PageHeader';
import {
  Peer,
  HackathonTeam,
  ChatMessage,
  loadPeers,
  savePeers,
  loadTeams,
  saveTeams,
  loadChatHistory,
  saveChatHistory,
} from '../db/teammates';
import { USER_ROLES, POPULAR_TECH_STACK } from '../db/userProfile';
import {
  UsersIcon,
  UserPlusIcon,
  CheckIcon,
  SearchIcon,
  CloseIcon,
  MessageSquareIcon,
  SendIcon,
} from '../components/Icons';

export const NetworkPage: React.FC = () => {
  const { userProfile, opportunities, addLog } = useApp();

  const [peers, setPeers] = useState<Peer[]>(() => loadPeers());
  const [teams, setTeams] = useState<HackathonTeam[]>(() => loadTeams());

  // Active top tab: 'peers' | 'group-chat' | 'dm'
  const [activeTab, setActiveTab] = useState<'peers' | 'group-chat' | 'dm'>('peers');

  // Search & Filters for peers
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedSkill, setSelectedSkill] = useState<string>('All');

  // Modal State for Team Formation
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [selectedOpportunityId, setSelectedOpportunityId] = useState(
    opportunities[0]?.id || ''
  );
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [teamSuccessMsg, setTeamSuccessMsg] = useState(false);

  // Invite modal / state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Add Teammate Manual Modal
  const [isAddPeerModalOpen, setIsAddPeerModalOpen] = useState(false);
  const [newPeerName, setNewPeerName] = useState('');
  const [newPeerRole, setNewPeerRole] = useState(USER_ROLES[0]);
  const [newPeerUni, setNewPeerUni] = useState('');
  const [newPeerLoc, setNewPeerLoc] = useState('');
  const [newPeerSkills, setNewPeerSkills] = useState<string[]>([]);
  const [newPeerBio, setNewPeerBio] = useState('');

  // Chat State
  const [activeDmPeerId, setActiveDmPeerId] = useState<string>('');
  const [chatInput, setChatInput] = useState('');
  const [groupMessages, setGroupMessages] = useState<ChatMessage[]>(() =>
    loadChatHistory('global_group')
  );
  const [dmMessages, setDmMessages] = useState<Record<string, ChatMessage[]>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [groupMessages, dmMessages, activeTab, activeDmPeerId]);

  // Load DM messages when active peer changes
  useEffect(() => {
    if (activeDmPeerId && !dmMessages[activeDmPeerId]) {
      const history = loadChatHistory(`dm_${activeDmPeerId}`);
      setDmMessages((prev) => ({ ...prev, [activeDmPeerId]: history }));
    }
  }, [activeDmPeerId, dmMessages]);

  // Filter peers
  const filteredPeers = useMemo(() => {
    return peers.filter((p) => {
      if (selectedRole !== 'All' && p.role !== selectedRole) return false;
      if (selectedSkill !== 'All' && !p.skills.includes(selectedSkill)) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesUni = p.university.toLowerCase().includes(q);
        const matchesLoc = p.location.toLowerCase().includes(q);
        const matchesBio = p.bio.toLowerCase().includes(q);
        const matchesSkills = p.skills.some((s) => s.toLowerCase().includes(q));
        return matchesName || matchesUni || matchesLoc || matchesBio || matchesSkills;
      }
      return true;
    });
  }, [peers, selectedRole, selectedSkill, searchQuery]);

  const toggleConnection = (peerId: string) => {
    setPeers((prev) => {
      const updated = prev.map((p) => {
        if (p.id === peerId) {
          const nextState = !p.isConnected;
          addLog(
            'SYSTEM',
            nextState
              ? `Connected with teammate: ${p.name} (${p.university})`
              : `Removed teammate connection: ${p.name}`
          );
          return { ...p, isConnected: nextState };
        }
        return p;
      });
      savePeers(updated);
      return updated;
    });
  };

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    const targetOpp = opportunities.find((o) => o.id === selectedOpportunityId) || opportunities[0];
    const memberNames = [
      userProfile.name ? `${userProfile.name} (You)` : 'You',
      ...peers.filter((p) => selectedMemberIds.includes(p.id)).map((p) => p.name),
    ];

    const combinedStack = Array.from(
      new Set([
        ...userProfile.skills.slice(0, 3),
        ...peers
          .filter((p) => selectedMemberIds.includes(p.id))
          .flatMap((p) => p.skills.slice(0, 2)),
      ])
    ).slice(0, 5);

    const newTeam: HackathonTeam = {
      id: `team-${Date.now()}`,
      name: teamName.trim(),
      opportunityTitle: targetOpp ? targetOpp.title : 'Global AI Hackathon',
      opportunityId: targetOpp ? targetOpp.id : 'opp-1',
      members: memberNames,
      primaryStack: combinedStack,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updated = [newTeam, ...teams];
    setTeams(updated);
    saveTeams(updated);
    addLog('SANDBOX', `Formed new hackathon team: "${newTeam.name}" for ${newTeam.opportunityTitle}`);

    setTeamSuccessMsg(true);
    setTimeout(() => {
      setTeamSuccessMsg(false);
      setIsTeamModalOpen(false);
      setTeamName('');
      setSelectedMemberIds([]);
    }, 1200);
  };

  const handleAddManualPeer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPeerName.trim()) return;

    const newPeer: Peer = {
      id: `peer-${Date.now()}`,
      name: newPeerName.trim(),
      role: newPeerRole as any,
      university: newPeerUni.trim() || 'Collaborator Institution',
      location: newPeerLoc.trim() || 'Remote',
      skills: newPeerSkills.length > 0 ? newPeerSkills : ['Python', 'Docker'],
      goals: ['Global Hackathons & Bounties'],
      bio: newPeerBio.trim() || 'Candidate joined via invite link to collaborate on hackathons.',
      compatibility: 92,
      isConnected: true,
    };

    const updated = [newPeer, ...peers];
    setPeers(updated);
    savePeers(updated);
    addLog('SYSTEM', `Teammate added to sovereign pool: ${newPeer.name} (${newPeer.university})`);

    setIsAddPeerModalOpen(false);
    setNewPeerName('');
    setNewPeerUni('');
    setNewPeerLoc('');
    setNewPeerSkills([]);
    setNewPeerBio('');
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const selfName = userProfile.name ? `${userProfile.name} ${userProfile.surname || ''}`.trim() : 'You';
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderName: selfName,
      senderRole: userProfile.role,
      isSelf: true,
      content: chatInput.trim(),
      timestamp: nowStr,
    };

    if (activeTab === 'group-chat') {
      const updated = [...groupMessages, newMsg];
      setGroupMessages(updated);
      saveChatHistory('global_group', updated);
      setChatInput('');

      // Auto-reply simulation for group hackathon squad if peers exist
      if (peers.length > 0) {
        setTimeout(() => {
          const responder = peers[0];
          const autoReply: ChatMessage = {
            id: `reply-${Date.now()}`,
            senderName: responder.name,
            senderRole: responder.role,
            isSelf: false,
            content: `Acknowledged! Reviewing the repository architecture on Nebius cloud. Let's sync up before the checkpoint.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setGroupMessages((prev) => {
            const next = [...prev, autoReply];
            saveChatHistory('global_group', next);
            return next;
          });
        }, 1200);
      }
    } else if (activeTab === 'dm' && activeDmPeerId) {
      const currentList = dmMessages[activeDmPeerId] || [];
      const updated = [...currentList, newMsg];
      setDmMessages((prev) => ({ ...prev, [activeDmPeerId]: updated }));
      saveChatHistory(`dm_${activeDmPeerId}`, updated);
      setChatInput('');

      const targetPeer = peers.find((p) => p.id === activeDmPeerId);
      if (targetPeer) {
        setTimeout(() => {
          const autoReply: ChatMessage = {
            id: `reply-${Date.now()}`,
            senderName: targetPeer.name,
            senderRole: targetPeer.role,
            isSelf: false,
            content: `Hey! Thanks for connecting. I'm ready to collaborate on ${targetPeer.skills.slice(0, 2).join(' & ')} tasks for the upcoming sprint.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setDmMessages((prev) => {
            const next = [...(prev[activeDmPeerId] || []), autoReply];
            saveChatHistory(`dm_${activeDmPeerId}`, next);
            return { ...prev, [activeDmPeerId]: next };
          });
        }, 1100);
      }
    }
  };

  const inviteLink = `https://pathfinder.local/join?pool=${userProfile.name ? encodeURIComponent(userProfile.name) : 'sandbox'}`;

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const connectedPeers = peers.filter((p) => p.isConnected);
  const activeDmPeer = peers.find((p) => p.id === activeDmPeerId) || connectedPeers[0];

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <PageHeader
        title="Teammates & Network"
        subtitle={`sovereign candidate pool · ${connectedPeers.length} connected · ${teams.length} teams formed`}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(true)}
              className="h-10 px-3.5 rounded-btn border border-zinc-700/80 bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 text-mini font-mono flex items-center gap-2 transition-colors"
            >
              <span>Share Invite Link</span>
            </button>
            <button
              type="button"
              onClick={() => setIsTeamModalOpen(true)}
              className="h-10 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-500 text-zinc-100 rounded-btn text-[13px] font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
              <UserPlusIcon size={14} className="text-accent" />
              <span>Create Hackathon Team</span>
            </button>
          </div>
        }
      />

      {/* Main Tabs Navigation */}
      <div className="px-6 pt-4 border-b border-border bg-bg/40 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('peers')}
          className={`h-10 px-4 text-mini font-mono border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'peers'
              ? 'border-accent text-text font-semibold'
              : 'border-transparent text-muted hover:text-text'
          }`}
        >
          <UsersIcon size={14} />
          <span>Teammate Pool ({peers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('group-chat')}
          className={`h-10 px-4 text-mini font-mono border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'group-chat'
              ? 'border-accent text-text font-semibold'
              : 'border-transparent text-muted hover:text-text'
          }`}
        >
          <MessageSquareIcon size={14} />
          <span>Squad Group Chat</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('dm');
            if (!activeDmPeerId && connectedPeers.length > 0) {
              setActiveDmPeerId(connectedPeers[0].id);
            }
          }}
          className={`h-10 px-4 text-mini font-mono border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'dm'
              ? 'border-accent text-text font-semibold'
              : 'border-transparent text-muted hover:text-text'
          }`}
        >
          <span>Direct Messages ({connectedPeers.length})</span>
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* TAB 1: PEERS DIRECTORY */}
        {activeTab === 'peers' && (
          <div className="space-y-6">
            {/* Formed Teams Overview */}
            {teams.length > 0 && (
              <div className="space-y-3">
                <div className="text-mini font-mono uppercase text-muted-2 tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <span>Active Hackathon Squads ({teams.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teams.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 rounded-card bg-surface border border-border space-y-2.5 relative group hover:border-border-strong transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[14px] font-semibold text-text">{t.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent/10 text-accent border border-accent-border">
                          READY
                        </span>
                      </div>
                      <div className="text-mini font-mono text-muted truncate">
                        🎯 {t.opportunityTitle}
                      </div>
                      <div className="text-[12px] text-muted-2">
                        Members: <span className="text-zinc-200">{t.members.join(', ')}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {t.primaryStack.map((st) => (
                          <span
                            key={st}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sidebar border border-border text-muted"
                          >
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filter Bar */}
            {peers.length > 0 && (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-surface/80 rounded-card border border-border">
                <div className="relative flex-1 min-w-[200px]">
                  <SearchIcon
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-2"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search peers by name, university, or tech stack..."
                    className="w-full h-10 pl-9 pr-3.5 bg-sidebar border border-border rounded-btn text-[13px] text-text placeholder:text-muted-2/60 focus:border-accent focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="h-10 px-3 bg-sidebar border border-border rounded-btn text-mini font-mono text-text focus:border-accent focus:outline-none"
                  >
                    <option value="All">All Roles</option>
                    {USER_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                    className="h-10 px-3 bg-sidebar border border-border rounded-btn text-mini font-mono text-text focus:border-accent focus:outline-none"
                  >
                    <option value="All">All Tech Stacks</option>
                    {POPULAR_TECH_STACK.slice(0, 10).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* STRICT ZERO-MOCK DATA EMPTY STATE */}
            {peers.length === 0 ? (
              <div className="p-12 text-center rounded-card bg-surface border border-border space-y-4 max-w-xl mx-auto my-8">
                <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-700/80 mx-auto flex items-center justify-center text-accent">
                  <UsersIcon size={24} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-[17px] font-semibold text-text">
                    Sovereign Teammate Pool Empty
                  </h3>
                  <p className="text-[13px] text-zinc-300 leading-relaxed max-w-md mx-auto">
                    No teammates in your sovereign pool yet. Create a team or share your invite link.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(true)}
                    className="h-10 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-500 text-zinc-100 rounded-btn text-[13px] font-medium flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <span>Share Invite Link</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddPeerModalOpen(true)}
                    className="h-10 px-4 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-500 text-zinc-200 rounded-btn text-[13px] font-medium flex items-center gap-2 transition-colors"
                  >
                    <UserPlusIcon size={14} className="text-accent" />
                    <span>Add Collaborator</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPeers.map((peer) => {
                  const initials = peer.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase();

                  return (
                    <div
                      key={peer.id}
                      className="p-5 rounded-card bg-surface border border-border flex flex-col justify-between gap-4 hover:border-border-strong transition-colors"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-[14px] font-mono font-medium text-zinc-200 flex-shrink-0">
                              {initials}
                            </div>
                            <div>
                              <h3 className="text-[14px] font-semibold text-text">{peer.name}</h3>
                              <div className="text-[11px] font-mono text-muted">{peer.role}</div>
                            </div>
                          </div>

                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-accent/10 text-accent border border-accent-border">
                            {peer.compatibility}% MATCH
                          </span>
                        </div>

                        <div className="text-[12px] font-mono text-muted-2">
                          📍 {peer.university} · {peer.location}
                        </div>

                        <p className="text-[12px] text-muted leading-relaxed line-clamp-2">
                          {peer.bio}
                        </p>

                        <div className="flex flex-wrap gap-1 pt-1">
                          {peer.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 rounded-btn text-mini font-mono border border-border text-zinc-300 bg-sidebar"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveDmPeerId(peer.id);
                            setActiveTab('dm');
                          }}
                          className="text-mini font-mono text-muted hover:text-text flex items-center gap-1.5"
                        >
                          <MessageSquareIcon size={12} />
                          <span>Direct Message</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleConnection(peer.id)}
                          className={`h-9 px-3.5 rounded-btn text-mini font-mono flex items-center gap-1.5 transition-colors border ${
                            peer.isConnected
                              ? 'bg-accent/10 border-accent-border text-accent hover:bg-accent/20'
                              : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700/80 text-zinc-100'
                          }`}
                        >
                          {peer.isConnected ? (
                            <>
                              <CheckIcon size={12} />
                              <span>Connected</span>
                            </>
                          ) : (
                            <>
                              <UserPlusIcon size={12} className="text-accent" />
                              <span>Add Teammate</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SQUAD GROUP CHAT */}
        {activeTab === 'group-chat' && (
          <div className="max-w-4xl mx-auto rounded-card bg-surface border border-border flex flex-col h-[600px] overflow-hidden">
            <div className="p-4 border-b border-border bg-sidebar flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                <div>
                  <h3 className="text-[14px] font-semibold text-text">Hackathon Squad Channel</h3>
                  <div className="text-mini font-mono text-muted-2">
                    {teams[0]?.name || 'Autonomous Agents Squad'} · Sovereign sandboxed chat
                  </div>
                </div>
              </div>
              <span className="text-mini font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700/80 text-muted">
                {peers.length + 1} online
              </span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#070d1f]/60">
              {groupMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted space-y-2">
                  <MessageSquareIcon size={24} className="text-muted-2" />
                  <p className="text-[13px] font-mono">No messages yet in this group channel.</p>
                  <p className="text-[11px] text-muted-2">
                    Send a message below to coordinate repository tasks with your squad.
                  </p>
                </div>
              ) : (
                groupMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-mini font-mono font-medium text-text">
                        {msg.senderName}
                      </span>
                      {msg.senderRole && (
                        <span className="text-[10px] font-mono text-muted-2">
                          · {msg.senderRole}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-muted-2">{msg.timestamp}</span>
                    </div>
                    <div
                      className={`p-3 rounded-card max-w-md text-[13px] leading-relaxed ${
                        msg.isSelf
                          ? 'bg-zinc-800 border border-zinc-700 text-zinc-100'
                          : 'bg-surface border border-border text-zinc-200'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSendChatMessage}
              className="p-3 border-t border-border bg-sidebar flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Message hackathon squad channel..."
                className="flex-1 h-10 px-3.5 bg-surface border border-border rounded-btn text-[13px] text-text placeholder:text-muted-2 focus:border-accent focus:outline-none"
              />
              <button
                type="submit"
                className="h-10 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-500 text-zinc-100 rounded-btn text-mini font-mono flex items-center gap-2 transition-colors shadow-sm"
              >
                <SendIcon size={14} className="text-accent" />
                <span>Send</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: DIRECT MESSAGES */}
        {activeTab === 'dm' && (
          <div className="max-w-5xl mx-auto rounded-card bg-surface border border-border grid grid-cols-1 md:grid-cols-3 h-[600px] overflow-hidden">
            {/* Sidebar Peer List */}
            <div className="border-r border-border bg-sidebar flex flex-col">
              <div className="p-3.5 border-b border-border text-mini font-mono uppercase text-muted-2 tracking-wider">
                Direct Conversations
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-border/40">
                {connectedPeers.length === 0 ? (
                  <div className="p-6 text-center text-mini font-mono text-muted space-y-2">
                    <p>No connected teammates for DMs.</p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('peers')}
                      className="text-accent hover:underline text-[11px]"
                    >
                      Browse Teammate Pool
                    </button>
                  </div>
                ) : (
                  connectedPeers.map((p) => {
                    const isSelected = p.id === (activeDmPeer?.id || '');
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setActiveDmPeerId(p.id)}
                        className={`w-full text-left p-3 flex items-center gap-3 transition-colors ${
                          isSelected
                            ? 'bg-surface-hover text-text font-semibold'
                            : 'hover:bg-surface/50 text-muted'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-[12px] font-mono text-zinc-200 flex-shrink-0">
                          {p.name[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] text-text truncate">{p.name}</div>
                          <div className="text-[11px] font-mono text-muted-2 truncate">
                            {p.role}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* DM Conversation Area */}
            <div className="md:col-span-2 flex flex-col h-full bg-[#070d1f]/60">
              {activeDmPeer ? (
                <>
                  <div className="p-3.5 border-b border-border bg-sidebar flex items-center justify-between">
                    <div>
                      <h4 className="text-[14px] font-semibold text-text">{activeDmPeer.name}</h4>
                      <div className="text-mini font-mono text-muted-2">
                        {activeDmPeer.university} · {activeDmPeer.role}
                      </div>
                    </div>
                    <span className="text-mini font-mono px-2 py-0.5 rounded bg-accent/10 text-accent border border-accent-border">
                      {activeDmPeer.compatibility}% MATCH
                    </span>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {(dmMessages[activeDmPeer.id] || []).length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted space-y-2">
                        <MessageSquareIcon size={20} className="text-muted-2" />
                        <p className="text-[13px] font-mono">No direct messages exchanged yet.</p>
                        <p className="text-[11px] text-muted-2">
                          Say hi to discuss technical stack synergy and hackathon project ideas.
                        </p>
                      </div>
                    ) : (
                      (dmMessages[activeDmPeer.id] || []).map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-mini font-mono font-medium text-text">
                              {msg.senderName}
                            </span>
                            <span className="text-[10px] font-mono text-muted-2">
                              {msg.timestamp}
                            </span>
                          </div>
                          <div
                            className={`p-3 rounded-card max-w-md text-[13px] leading-relaxed ${
                              msg.isSelf
                                ? 'bg-zinc-800 border border-zinc-700 text-zinc-100'
                                : 'bg-surface border border-border text-zinc-200'
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <form
                    onSubmit={handleSendChatMessage}
                    className="p-3 border-t border-border bg-sidebar flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={`Direct message to ${activeDmPeer.name}...`}
                      className="flex-1 h-10 px-3.5 bg-surface border border-border rounded-btn text-[13px] text-text placeholder:text-muted-2 focus:border-accent focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="h-10 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-500 text-zinc-100 rounded-btn text-mini font-mono flex items-center gap-2 transition-colors shadow-sm"
                    >
                      <SendIcon size={14} className="text-accent" />
                      <span>Send</span>
                    </button>
                  </form>
                </>
              ) : (
                <div className="h-full flex items-center justify-center p-6 text-muted font-mono text-[13px]">
                  Select a connected teammate to start direct messaging.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Share Invite Link Modal */}
      {isInviteModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070d1f]/90 backdrop-blur-sm"
        >
          <div className="w-full max-w-md bg-surface border border-border rounded-card shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 id="invite-modal-title" className="text-subheading text-text font-semibold">
                Share Sovereign Invite Link
              </h3>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="w-8 h-8 rounded-btn flex items-center justify-center text-muted hover:text-text"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <p className="text-[13px] text-muted leading-relaxed">
              Share your invite link with university peers to form private hackathon teams without leaking identity data to public trackers.
            </p>

            <div className="flex items-center gap-2 p-2 bg-sidebar border border-border rounded-btn">
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="flex-1 bg-transparent border-none text-[12px] font-mono text-zinc-300 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyInvite}
                className="h-8 px-3 rounded-btn border border-zinc-700/80 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 text-mini font-mono flex items-center gap-1.5 transition-colors"
              >
                {copiedInvite ? (
                  <>
                    <CheckIcon size={12} className="text-accent" />
                    <span>Copied</span>
                  </>
                ) : (
                  <span>Copy</span>
                )}
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="h-10 px-4 rounded-btn border border-border text-muted hover:text-text text-mini font-mono"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Collaborator Manual Modal */}
      {isAddPeerModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-peer-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070d1f]/90 backdrop-blur-sm"
        >
          <div className="w-full max-w-lg bg-surface border border-border rounded-card shadow-2xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between bg-sidebar">
              <h3 id="add-peer-modal-title" className="text-subheading text-text font-semibold">
                Add Collaborator to Pool
              </h3>
              <button
                type="button"
                onClick={() => setIsAddPeerModalOpen(false)}
                className="w-8 h-8 rounded-btn flex items-center justify-center text-muted hover:text-text"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <form onSubmit={handleAddManualPeer} className="p-5 space-y-4">
              <div>
                <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                  Collaborator Name
                </label>
                <input
                  type="text"
                  required
                  value={newPeerName}
                  onChange={(e) => setNewPeerName(e.target.value)}
                  placeholder="Full name"
                  className="w-full h-11 px-3.5 bg-sidebar border border-border rounded-btn text-[13px] text-text focus:border-accent focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                    University / Institution
                  </label>
                  <input
                    type="text"
                    value={newPeerUni}
                    onChange={(e) => setNewPeerUni(e.target.value)}
                    placeholder="Institution"
                    className="w-full h-11 px-3.5 bg-sidebar border border-border rounded-btn text-[13px] text-text focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newPeerLoc}
                    onChange={(e) => setNewPeerLoc(e.target.value)}
                    placeholder="City, Country"
                    className="w-full h-11 px-3.5 bg-sidebar border border-border rounded-btn text-[13px] text-text focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                  Primary Role
                </label>
                <select
                  value={newPeerRole}
                  onChange={(e) => setNewPeerRole(e.target.value as any)}
                  className="w-full h-11 px-3 bg-sidebar border border-border rounded-btn text-[13px] text-text font-mono focus:border-accent focus:outline-none"
                >
                  {USER_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                  Technical Stack Tags
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-sidebar border border-border rounded-btn max-h-32 overflow-y-auto">
                  {POPULAR_TECH_STACK.slice(0, 12).map((s) => {
                    const isSel = newPeerSkills.includes(s);
                    return (
                      <button
                        type="button"
                        key={s}
                        onClick={() =>
                          setNewPeerSkills((prev) =>
                            prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
                          )
                        }
                        className={`px-2.5 py-1 rounded text-mini font-mono border transition-colors ${
                          isSel
                            ? 'bg-accent/15 border-accent text-text'
                            : 'bg-surface border-border text-muted hover:border-border-strong hover:text-text'
                        }`}
                      >
                        {isSel && '✓ '}
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                  Bio / Focus
                </label>
                <textarea
                  rows={2}
                  value={newPeerBio}
                  onChange={(e) => setNewPeerBio(e.target.value)}
                  placeholder="Short summary of research or project focus..."
                  className="w-full p-2.5 bg-sidebar border border-border rounded-btn text-[12px] font-mono text-text focus:border-accent focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddPeerModalOpen(false)}
                  className="h-10 px-4 rounded-btn border border-border text-muted hover:text-text text-mini font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-500 text-zinc-100 rounded-btn text-[13px] font-medium transition-colors shadow-sm"
                >
                  Add to Pool
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team Formation Modal */}
      {isTeamModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-team-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070d1f]/90 backdrop-blur-sm"
        >
          <div className="w-full max-w-lg bg-surface border border-border rounded-card shadow-2xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between bg-sidebar">
              <div className="flex items-center gap-2">
                <UsersIcon size={16} className="text-accent" />
                <h3 id="create-team-title" className="text-subheading text-text font-semibold">
                  Create Hackathon Team
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTeamModalOpen(false)}
                className="w-8 h-8 rounded-btn flex items-center justify-center text-muted hover:text-text hover:bg-surface"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="p-5 space-y-4">
              <div>
                <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Team name"
                  className="w-full h-11 px-3.5 bg-sidebar border border-border rounded-btn text-[13px] text-text focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                  Target Opportunity
                </label>
                <select
                  value={selectedOpportunityId}
                  onChange={(e) => setSelectedOpportunityId(e.target.value)}
                  className="w-full h-11 px-3 bg-sidebar border border-border rounded-btn text-[13px] text-text font-mono focus:border-accent focus:outline-none"
                >
                  {opportunities.map((opp) => (
                    <option key={opp.id} value={opp.id}>
                      {opp.title} ({opp.organization})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-mini font-mono uppercase text-muted-2 mb-1">
                  Select Members from Network ({selectedMemberIds.length} chosen)
                </label>
                <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-sidebar border border-border rounded-btn">
                  {peers.length === 0 ? (
                    <div className="p-4 text-center text-mini font-mono text-muted">
                      No peers in your pool yet. You will be registered as the founding team lead.
                    </div>
                  ) : (
                    peers.map((peer) => {
                      const isSelected = selectedMemberIds.includes(peer.id);
                      return (
                        <button
                          type="button"
                          key={peer.id}
                          onClick={() =>
                            setSelectedMemberIds((prev) =>
                              prev.includes(peer.id)
                                ? prev.filter((m) => m !== peer.id)
                                : [...prev, peer.id]
                            )
                          }
                          className={`w-full text-left p-2 rounded text-[12px] flex items-center justify-between border transition-colors ${
                            isSelected
                              ? 'bg-accent/15 border-accent-border text-text font-medium'
                              : 'bg-surface/50 border-transparent text-muted hover:border-border hover:text-text'
                          }`}
                        >
                          <div>
                            <span className="font-semibold">{peer.name}</span> ·{' '}
                            <span className="font-mono text-[11px] text-muted-2">{peer.role}</span>
                          </div>
                          <span className="font-mono text-[11px] text-accent">
                            {isSelected ? '✓ SELECTED' : '+ ADD'}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsTeamModalOpen(false)}
                  className="h-10 px-4 rounded-btn border border-border text-muted hover:text-text text-mini font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-500 text-zinc-100 rounded-btn text-[13px] font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  {teamSuccessMsg && <CheckIcon size={14} className="text-accent" />}
                  <span>{teamSuccessMsg ? 'Squad Formed!' : 'Form Team Squad'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
