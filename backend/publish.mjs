import fs from 'node:fs/promises';
import path from 'node:path';
import { mergeOpportunities } from './merge.mjs';
import { publishable } from './radar-quality.mjs';

const input = path.resolve('backend/data/opportunities.json');
const output = path.resolve('public/data/opportunities.json');
const results = JSON.parse(await fs.readFile(input, 'utf8'));

// An empty scan keeps the previous valid items and prunes expired ones via mergeOpportunities.
// Malformed scan output is refused so the published snapshot is kept.
const today = new Date().toISOString().slice(0, 10);
if (!Array.isArray(results) ||
    results.some((item) => !publishable(item, today) || !item.deadlineEvidence)) {
  throw new Error('Scan produced no valid sourced opportunities; published data was kept');
}

let previous = [];
try {
  previous = JSON.parse(await fs.readFile(output, 'utf8'));
} catch (error) {
  if (error.code !== 'ENOENT' && !(error instanceof SyntaxError)) throw error;
}

const merged = mergeOpportunities(previous, results, today);
await fs.mkdir(path.dirname(output), { recursive: true });
await fs.writeFile(output, `${JSON.stringify(merged, null, 2)}\n`);
console.log(`Published ${merged.length} opportunities (${results.length} from this scan)`);
