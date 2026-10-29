import type { QuizQuestion, SkillItem } from '../data';
import type { QuizTuple } from './quizTypes';
import { QUIZ_CATALOG } from './quizCatalog.data';

export { QUIZ_CATALOG };

export const QUIZ_CATEGORIES = [
  'Programming Languages',
  'Databases & Data Storage',
  'Machine Learning & AI',
  'Robotics & Hardware',
  'Web & Mobile Development',
  'Infrastructure & DevOps',
  'Architecture',
  'Security & Blockchain',
  'CS Fundamentals & Math',
  'Professional, Design & Analytics',
  'Languages & Language Exams',
];

// Categories for the original hand-written skill quizzes.
const BASE_SKILL_CATEGORY: Record<string, string> = {
  docker: 'Infrastructure & DevOps',
  linux: 'Infrastructure & DevOps',
  pytorch: 'Machine Learning & AI',
  llms: 'Machine Learning & AI',
  'machine-learning': 'Machine Learning & AI',
  'vector-dbs': 'Databases & Data Storage',
  sql: 'Databases & Data Storage',
  python: 'Programming Languages',
  go: 'Programming Languages',
  ros2: 'Robotics & Hardware',
  research: 'Professional, Design & Analytics',
};

const CATALOG_BY_ID = new Map(QUIZ_CATALOG.map((t) => [t.id, t]));

export function getCatalogTopic(id: string) {
  return CATALOG_BY_ID.get(id);
}

export function getSkillCategory(id: string): string {
  return CATALOG_BY_ID.get(id)?.category || BASE_SKILL_CATEGORY[id] || 'Other';
}

// Short chip labels: "smart pointers (unique_ptr, ...)" becomes "smart pointers".
export function shortTopic(topic: string): string {
  const short = topic.replace(/\s*\([^)]*\)/g, '').trim();
  return short.charAt(0).toUpperCase() + short.slice(1);
}

// Study links are small and load eagerly; question banks load only when a quiz opens.
const resourceModules = import.meta.glob<Record<string, [string, string]>>('./quizzes/*.resources.json', {
  eager: true,
  import: 'default',
});
const RESOURCES: Record<string, [string, string]> = Object.assign({}, ...Object.values(resourceModules));

const bankModules = import.meta.glob<Record<string, QuizTuple[]>>(['./quizzes/*.json', '!./quizzes/*.resources.json'], {
  import: 'default',
});

export const CATALOG_SKILLS: SkillItem[] = QUIZ_CATALOG.map((t) => {
  const [resourceTitle, resourceUrl] = RESOURCES[t.id] || [`${t.name} documentation`, `https://www.google.com/search?q=${encodeURIComponent(t.name + ' documentation')}`];
  const rest = t.topics.slice(4).map(shortTopic);
  return {
    id: t.id,
    name: t.name,
    status: 'MISSING',
    reason: rest.length ? `Also covers: ${rest.join(', ')}.` : `${t.category} skill check.`,
    resourceTitle,
    resourceUrl,
    quizQuestions: [],
  };
});

export function tuplesToQuestions(items: QuizTuple[]): QuizQuestion[] {
  return items.map(([question, correct, wrong, explanation]) => ({
    question,
    options: [correct, ...wrong],
    correctIndex: 0,
    explanation,
  }));
}

export async function loadCatalogQuestions(id: string): Promise<QuizQuestion[]> {
  const topic = CATALOG_BY_ID.get(id);
  const load = topic && bankModules[`./quizzes/${topic.group}.json`];
  if (!load) return [];
  const bank = await load();
  return tuplesToQuestions(bank[id] || []);
}

// Short or generic skill names in opportunity listings, mapped to the closest quiz id.
const SKILL_ALIASES: Record<string, string> = {
  ai: 'machine-learning',
  ml: 'machine-learning',
  artificialintelligence: 'machine-learning',
  aimachinelearning: 'machine-learning',
  deeplearning: 'pytorch',
  llm: 'llms',
  genai: 'llms',
  generativeai: 'llms',
  js: 'javascript',
  ts: 'typescript',
  node: 'nodejs',
  postgres: 'postgresql',
  k8s: 'kubernetes',
  cv: 'computer-vision',
};

// "Node.js", "node js" and the quiz id "nodejs" all compare equal; + and # keep C++ and C# apart from C.
function normalizeSkill(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9+#]/g, '');
}

/* Finds the quiz for a skill name from a listing: exact name or id first, then a known alias. */
export function findQuizSkill(skills: SkillItem[], name: string): SkillItem | undefined {
  const key = normalizeSkill(name);
  const direct = skills.find((s) => normalizeSkill(s.name) === key || normalizeSkill(s.id) === key);
  if (direct) return direct;
  const aliasId = SKILL_ALIASES[key];
  return aliasId ? skills.find((s) => s.id === aliasId) : undefined;
}
