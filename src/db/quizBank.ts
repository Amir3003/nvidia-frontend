import type { QuizQuestion } from '../data';
import type { QuizTuple } from './quizTypes';
import { tuplesToQuestions } from './quizCatalog';
import base from './quizBase.json';

// Verification question bank for the original skills: 15 questions per skill.
// The larger topic catalog lives in ./quizzes and loads on demand (see quizCatalog.ts).
export const QUIZ_BANK: Record<string, QuizQuestion[]> = Object.fromEntries(
  Object.entries(base as unknown as Record<string, QuizTuple[]>).map(([id, items]) => [id, tuplesToQuestions(items)])
);

// Each attempt draws this many random questions from the skill's pool.
export const QUIZ_LENGTH = 10;
export const SECONDS_PER_QUESTION = 60;
