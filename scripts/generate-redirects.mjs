// Converts /redirects.json into public/_redirects (Netlify format) so it ships inside /out.
// redirects.json: [{ "source": "/old-url/", "destination": "/electric-scooters/guides/new-slug/" }]  -> 301
// Whole-domain rules: { "source": "http://www.example.com/*", "destination": "https://example.com/:splat", "force": true }
import { readFileSync, writeFileSync } from 'node:fs';

const entries = JSON.parse(readFileSync(new URL('../redirects.json', import.meta.url), 'utf8'));

if (!Array.isArray(entries)) {
  console.error('redirects.json must be a JSON array');
  process.exit(1);
}

const lines = [];
const seen = new Set();
for (const [i, r] of entries.entries()) {
  const where = `redirects.json[${i}]`;
  if (!r || typeof r.source !== 'string' || typeof r.destination !== 'string') {
    console.error(`${where}: needs "source" and "destination" strings`);
    process.exit(1);
  }
  if (!r.source.startsWith('/') && !/^https?:\/\/[a-z0-9.-]+\//i.test(r.source)) {
    console.error(`${where}: source must start with "/" or be a full http(s):// URL (got "${r.source}")`);
    process.exit(1);
  }
  if (/\s/.test(r.source) || /\s/.test(r.destination)) {
    console.error(`${where}: URLs must not contain spaces`);
    process.exit(1);
  }
  if (seen.has(r.source)) {
    console.error(`${where}: duplicate source "${r.source}"`);
    process.exit(1);
  }
  seen.add(r.source);
  // force: true adds "!" so the rule applies even when a file exists at that path (needed for host redirects).
  lines.push(`${r.source}  ${r.destination}  301${r.force ? '!' : ''}`);
}

writeFileSync(
  new URL('../public/_redirects', import.meta.url),
  `# Generated from redirects.json by scripts/generate-redirects.mjs. Do not edit by hand.\n${lines.join('\n')}\n`,
);
console.log(`✓ public/_redirects: ${entries.length} redirect(s) from redirects.json`);
