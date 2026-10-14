export interface NotificationSettings {
  telegram: boolean;
  telegramHandle: string;
  kakao: boolean;
  kakaoHandle: string;
  discord: boolean;
  discordWebhook: string;
}

export interface UserProfile {
  name: string;
  surname: string;
  email: string;
  password?: string;
  phone?: string;
  nationalId?: string;
  github?: string;
  linkedin?: string;
  university: string;
  major: string;
  degree?: string;
  years?: string;
  location: string;
  role: string;
  skills: string[];
  goals: string[];
  cvText?: string;
  avatarUrl?: string;
  avatarPreset?: 'emerald' | 'indigo' | 'amber' | 'cyan' | 'purple' | 'rose';
  isPublic: boolean;
  isOnboarded: boolean;
  notifications?: NotificationSettings;
}

export const USER_ROLES = [
  'Student / Learner',
  'Researcher / Academic',
  'Software Engineer / Builder',
  'AI Practitioner',
  'Startup Founder / Creator',
] as const;

export const POPULAR_TECH_STACK = [
  'Python',
  'PyTorch',
  'Docker',
  'LLMs',
  'Vector DBs',
  'TypeScript',
  'React',
  'Go',
  'C++',
  'Rust',
  'CUDA',
  'TensorRT',
  'Linux',
  'Git',
  'SQL',
  'PostgreSQL',
  'Redis',
  'gRPC',
  'ROS2',
  'Isaac Sim',
  'Kubernetes',
  'FastAPI',
  'LangChain',
  'LlamaIndex',
  'Hugging Face',
  'JAX',
  'Research',
  'English',
];

export const CAREER_OBJECTIVES = [
  'Global Hackathons & Bounties',
  'Graduate Research Scholarships Abroad',
  'ML Engineering & Systems Internships',
  'Physical AI & Humanoid Robotics',
  'Conference Travel Grants (NeurIPS/CVPR)',
  'Open-Source Developer Grants',
];

export const EMPTY_USER_PROFILE: UserProfile = {
  name: '',
  surname: '',
  email: '',
  password: '',
  phone: '',
  nationalId: '',
  github: '',
  linkedin: '',
  university: '',
  major: '',
  degree: '',
  years: '',
  location: '',
  role: 'Student / Learner',
  skills: [],
  goals: [],
  cvText: '',
  avatarUrl: '',
  avatarPreset: 'emerald',
  isPublic: false,
  isOnboarded: false,
  notifications: {
    telegram: false,
    telegramHandle: '',
    kakao: false,
    kakaoHandle: '',
    discord: false,
    discordWebhook: '',
  },
};

export const STORAGE_KEY = 'qadam_user';
export const LEGACY_STORAGE_KEY = 'pathfinder_user';
export const ORIGINAL_LEGACY_KEY = 'user_profile';

export function isProfileValid(profile: Partial<UserProfile> | null | undefined): boolean {
  if (!profile) return false;
  const firstName = (profile.name || '').trim();
  if (!firstName || firstName.length < 2) return false;
  if (firstName.toLowerCase() === 'candidate' || firstName.toLowerCase() === 'new candidate') return false;
  if (!profile.isOnboarded) return false;
  return true;
}

export function loadUserProfile(): UserProfile {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem(LEGACY_STORAGE_KEY) ||
      localStorage.getItem(ORIGINAL_LEGACY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const candidateProfile: UserProfile = {
          ...EMPTY_USER_PROFILE,
          ...parsed,
          notifications: {
            ...EMPTY_USER_PROFILE.notifications,
            ...(parsed.notifications || {}),
          },
        };
        if (isProfileValid(candidateProfile)) {
          return candidateProfile;
        }
      }
    }
  } catch (err) {
    console.warn('Failed to parse user profile from storage:', err);
  }
  return EMPTY_USER_PROFILE;
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    const serialized = JSON.stringify(profile);
    localStorage.setItem(STORAGE_KEY, serialized);
    localStorage.setItem(LEGACY_STORAGE_KEY, serialized);
  } catch (err) {
    console.warn('Failed to save user profile to storage:', err);
  }
}

export function clearUserProfile(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    localStorage.removeItem(ORIGINAL_LEGACY_KEY);
    localStorage.removeItem('qadam_memory_entries');
    localStorage.removeItem('pathfinder_memory_entries');
    localStorage.removeItem('qadam_teammates');
    localStorage.removeItem('pathfinder_teammates');
    localStorage.removeItem('qadam_teams');
    localStorage.removeItem('pathfinder_teams');
    localStorage.removeItem('qadam_network_chats');
    localStorage.removeItem('pathfinder_network_chats');
  } catch (err) {
    console.warn('Failed to clear user profile:', err);
  }
}
