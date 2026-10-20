import type { Opportunity } from './opportunities';

// A CV Lab benchmark target: either a skill track (a set of skills a student
// wants to prove) or a real opportunity from the radar that lists its skills.
export interface BenchmarkTarget {
  id: string;
  kind: 'TRACK' | 'RADAR';
  title: string;
  subtitle: string;
  orgKey: string;
  skills: string[];
}

export const TARGET_TRACKS: BenchmarkTarget[] = [
  { id: 'track-ai-agents', title: 'AI Agents & LLM Apps', subtitle: 'Build assistants, RAG and tool-using agents', skills: ['Python', 'LLMs', 'Vector DBs', 'Docker', 'FastAPI'] },
  { id: 'track-ml-research', title: 'ML Research', subtitle: 'Papers, experiments and model training', skills: ['Python', 'PyTorch', 'Machine Learning', 'Research', 'Linear Algebra'] },
  { id: 'track-robotics', title: 'Robotics & Physical AI', subtitle: 'Robots, simulation and perception', skills: ['ROS2', 'Python', 'C++', 'Linux', 'Isaac Sim'] },
  { id: 'track-backend', title: 'Backend & Systems', subtitle: 'APIs, databases and infrastructure', skills: ['Go', 'SQL', 'Docker', 'Linux', 'Kubernetes'] },
  { id: 'track-fullstack', title: 'Full-Stack Web', subtitle: 'Web products from interface to database', skills: ['TypeScript', 'React', 'Node.js', 'SQL', 'Docker'] },
  { id: 'track-data', title: 'Data Science & Analytics', subtitle: 'Analysis, dashboards and prediction', skills: ['Python', 'SQL', 'Pandas', 'Statistics', 'Machine Learning'] },
  { id: 'track-open-source', title: 'Open Source Contributor', subtitle: 'Ship pull requests to real projects', skills: ['Git', 'Linux', 'Python', 'Docker', 'Technical Writing'] },
  { id: 'track-hackathon', title: 'Hackathon Ready', subtitle: 'Prototype fast and pitch it', skills: ['Python', 'React', 'LLMs', 'Git', 'Public Speaking'] },
  { id: 'track-scholarship', title: 'Scholarships Abroad', subtitle: 'Applications for study and research programs', skills: ['English', 'IELTS', 'Research', 'Technical Writing', 'Statistics'] },
].map((t) => ({ ...t, kind: 'TRACK' as const, orgKey: 'general' }));

// Radar opportunities become targets only when the source lists their skills.
export function radarTargets(opportunities: Opportunity[]): BenchmarkTarget[] {
  return opportunities
    .filter((o) => o.skills.length >= 2)
    .map((o) => ({
      id: o.id,
      kind: 'RADAR' as const,
      title: o.title,
      subtitle: `${o.organization} · ${o.type.toLowerCase()}`,
      orgKey: o.orgKey,
      skills: o.skills,
    }));
}
