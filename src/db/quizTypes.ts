// Compact question format used by every bank: the correct answer is written first,
// QuizModal shuffles options per attempt.
export type QuizTuple = [question: string, correct: string, wrong: [string, string, string], explanation: string];

export interface CatalogTopic {
  id: string;
  name: string;
  category: string;
  group: string;
  topics: string[];
}
