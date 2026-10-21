// Checks every quiz bank for structure and answer-length giveaways.
// A student must not be able to pass by always picking the longest option.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../src/db/', import.meta.url).pathname;
const files = [
  join(root, 'quizBase.json'),
  ...readdirSync(join(root, 'quizzes'))
    .filter((f) => f.endsWith('.json') && !f.endsWith('.resources.json'))
    .map((f) => join(root, 'quizzes', f)),
];

const errors = [];
let total = 0;
let longestTotal = 0;

for (const file of files) {
  const bank = JSON.parse(readFileSync(file, 'utf8'));
  for (const [topic, questions] of Object.entries(bank)) {
    let longest = 0;
    let shortest = 0;
    questions.forEach(([question, correct, wrong], i) => {
      const tag = `${topic}#${i + 1}`;
      const options = [correct, ...wrong];
      if (wrong.length !== 3 || options.some((o) => typeof o !== 'string' || !o.trim())) {
        errors.push(`${tag}: needs one correct and three wrong options`);
        return;
      }
      if (new Set(options.map((o) => o.trim().toLowerCase())).size !== 4) errors.push(`${tag}: duplicate options`);
      if (/[–—]/.test(question + options.join(''))) errors.push(`${tag}: em or en dash`);
      const lens = options.map((o) => o.length);
      const maxWrong = Math.max(...lens.slice(1));
      const max = Math.max(...lens);
      const min = Math.min(...lens);
      if (max > 1.6 * min && max - min > 12) errors.push(`${tag}: option lengths ${lens.join('/')} are too uneven`);
      if (lens[0] > maxWrong && lens[0] > 1.2 * maxWrong) errors.push(`${tag}: correct answer much longer than the rest`);
      if (lens[0] > maxWrong) longest++;
      if (lens[0] < Math.min(...lens.slice(1))) shortest++;
    });
    total += questions.length;
    longestTotal += longest;
    if (longest > Math.floor(questions.length * 0.3)) errors.push(`${topic}: correct is the longest option in ${longest}/${questions.length}`);
    if (shortest > Math.floor(questions.length * 0.4)) errors.push(`${topic}: correct is the shortest option in ${shortest}/${questions.length}`);
  }
}

console.log(`${total} questions, correct answer is the longest option in ${Math.round((100 * longestTotal) / total)}%`);
if (errors.length) {
  console.error(errors.slice(0, 50).join('\n'));
  console.error(`${errors.length} problem(s)`);
  process.exit(1);
}
console.log('Quiz banks OK');
