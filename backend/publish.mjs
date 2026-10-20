import fs from 'node:fs/promises';
import path from 'node:path';
import { mergeOpportunities } from './merge.mjs';

const input = path.resolve('backend/data/opportunities.json');
const output = path.resolve('public/data/opportunities.json');
const results = JSON.parse(await fs.readFile(input, 'utf8'));

// Keep the last published snapshot when a scan finds nothing usable.
// The frontend filters expired deadlines even when a scan is delayed.
if (!Array.isArray(results) || results.length === 0 ||
    results.some((item) => !item || !/^https?:\/\//.test(item.url || '') ||
      !item.title || !['HACKATHON', 'GRANT', 'INTERNSHIP'].includes(item.type))) {
  throw new Error('Scan produced no valid sourced opportunities; published data was kept');
}

let previous = [];
try {
  previous = JSON.parse(await fs.readFile(output, 'utf8'));
} catch (error) {
  if (error.code !== 'ENOENT' && !(error instanceof SyntaxError)) throw error;
}

const merged = mergeOpportunities(previous, results, new Date().toISOString().slice(0, 10));
await fs.mkdir(path.dirname(output), { recursive: true });
await fs.writeFile(output, `${JSON.stringify(merged, null, 2)}\n`);
console.log(`Published ${merged.length} opportunities (${results.length} from this scan)`);
