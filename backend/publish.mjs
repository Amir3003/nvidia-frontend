import fs from 'node:fs/promises';
import path from 'node:path';

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

await fs.mkdir(path.dirname(output), { recursive: true });
await fs.writeFile(output, `${JSON.stringify(results, null, 2)}\n`);
console.log(`Prepared ${results.length} sourced opportunities for publication`);
