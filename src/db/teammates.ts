export interface Peer {
  id: string;
  name: string;
  role:
    | 'Student / Learner'
    | 'Researcher / Academic'
    | 'Software Engineer / Builder'
    | 'AI Practitioner'
    | 'Startup Founder / Creator';
  university: string;
  location: string;
  avatarUrl?: string;
  skills: string[];
  goals: string[];
  bio: string;
  compatibility: number;
  isConnected: boolean;
}

export interface HackathonTeam {
  id: string;
  name: string;
  opportunityTitle: string;
  opportunityId: string;
  members: string[];
  primaryStack: string[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderRole?: string;
  isSelf: boolean;
  content: string;
  timestamp: string;
}

const TEAMMATES_STORAGE_KEY = 'pathfinder_teammates';
const TEAMS_STORAGE_KEY = 'pathfinder_teams';
const CHAT_STORAGE_KEY = 'pathfinder_network_chats';

export function loadPeers(): Peer[] {
  try {
    const raw = localStorage.getItem(TEAMMATES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse peers from storage:', err);
  }
  // Strict zero fake data: return clean empty array by default
  return [];
}

export function savePeers(peers: Peer[]): void {
  try {
    localStorage.setItem(TEAMMATES_STORAGE_KEY, JSON.stringify(peers));
  } catch (err) {
    console.warn('Failed to save peers to storage:', err);
  }
}

export function loadTeams(): HackathonTeam[] {
  try {
    const raw = localStorage.getItem(TEAMS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse teams from storage:', err);
  }
  return [];
}

export function saveTeams(teams: HackathonTeam[]): void {
  try {
    localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams));
  } catch (err) {
    console.warn('Failed to save teams to storage:', err);
  }
}

export function loadChatHistory(channelKey: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(`${CHAT_STORAGE_KEY}_${channelKey}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Failed to load chat history:', err);
  }
  return [];
}

export function saveChatHistory(channelKey: string, messages: ChatMessage[]): void {
  try {
    localStorage.setItem(`${CHAT_STORAGE_KEY}_${channelKey}`, JSON.stringify(messages));
  } catch (err) {
    console.warn('Failed to save chat history:', err);
  }
}
