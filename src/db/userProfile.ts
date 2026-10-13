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
};

export const STORAGE_KEY = 'pathfinder_user';
export const LEGACY_STORAGE_KEY = 'user_profile';

export function isProfileValid(profile: Partial<UserProfile> | null | undefined): boolean {
  if (!profile) return false;
  const firstName = (profile.name || '').trim();
  if (!firstName) return false;
  if (firstName.toLowerCase() === 'candidate' || firstName.toLowerCase() === 'new candidate') return false;
  if (!profile.isOnboarded) return false;
  return true;
}

export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const candidateProfile: UserProfile = {
          ...EMPTY_USER_PROFILE,
          ...parsed,
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
    localStorage.removeItem('pathfinder_memory_entries');
    localStorage.removeItem('pathfinder_teammates');
    localStorage.removeItem('pathfinder_teams');
  } catch (err) {
    console.warn('Failed to clear user profile:', err);
  }
}

