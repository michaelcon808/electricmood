// Writes .lastmod.json: the real last-change date of every post, tool and page, from git history,
// so the sitemap's <lastmod> tells Google what actually changed. Run in prebuild.
// If git history is unavailable, it writes {} and the sitemap falls back to each post's `updated` date.
import { execSync } from 'node:child_process';
import { readdirSync, writeFileSync } from 'node:fs';

const sh = (cmd) => execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
const out = {};
try {
  // Netlify may check out a shallow clone; deepen it so per-file dates are real, not "the last commit".
  if (sh('git rev-parse --is-shallow-repository') === 'true') {
    try { sh('git fetch --unshallow --quiet'); } catch { /* keep going; dates may fall back */ }
  }
  const shallow = sh('git rev-parse --is-shallow-repository') === 'true';
  if (!shallow) {
    const last = (path) => {
      try { return sh(`git log -1 --format=%cI -- "${path}"`) || undefined; } catch { return undefined; }
    };
    for (const f of readdirSync('content/posts').filter((f) => f.endsWith('.mdx'))) {
      const d = last(`content/posts/${f}`);
      if (d) out[`post:${f.replace(/\.mdx$/, '')}`] = d;
    }
    for (const [key, path] of Object.entries({ tools: 'lib/tools.ts', home: 'app/(site)/page.tsx' })) {
      const d = last(path);
      if (d) out[key] = d;
    }
  }
  console.log(`✓ .lastmod.json: ${Object.keys(out).length} date(s)${shallow ? ' (shallow clone: using post dates)' : ''}`);
} catch {
  console.log('✓ .lastmod.json: git not available, using post dates');
}
writeFileSync('.lastmod.json', JSON.stringify(out, null, 1) + '\n');
