/**
 * Content checks (runs automatically before every build; or `npm run check-content`).
 *  - frontmatter valid (same zod schema as the site build, incl. silo/section from config/site-structure.ts)
 *  - slugs unique across the whole site (post URLs are just /{slug}/)
 *  - description is 120–160 characters
 *  - cover has alt text, and every image in the body has alt text
 * Drafts are reported as warnings so unfinished work doesn't block a deploy; published posts fail.
 * Link rules (moneyPost, siblings, parallel, breadcrumbs, hubs) are in scripts/check-structure.ts.
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { formatIssues, frontmatterSchema, learnSchema } from '../lib/schema';
import { TOOLS } from '../lib/tools';
import { contentIssues } from '../lib/post-checks';
import { isPlaceholderImage } from '../lib/cloudinary';

const ROOT = process.cwd();
let errorCount = 0;
let warnCount = 0;

function checkDir(dirName: 'posts' | 'learn') {
  const dir = path.join(ROOT, 'content', dirName);
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /\.mdx?$/.test(f)) : [];
  const keys = new Map<string, string>();
  const schema = dirName === 'posts' ? frontmatterSchema : learnSchema;

  for (const file of files) {
    const rel = `content/${dirName}/${file}`;
    const { data, content } = matter(fs.readFileSync(path.join(dir, file), 'utf8'));
    const isDraft = data.draft === true;
    const problems: string[] = [];

    const parsed = schema.safeParse(data);
    if (!parsed.success) problems.push(`invalid frontmatter:\n${formatIssues(parsed.error)}`);

    // Slugs are unique across the whole site (posts live at /{slug}/). Duplicates are always fatal.
    const key = String(data.slug);
    if (data.slug) {
      const other = keys.get(key);
      if (other) {
        console.error(`✗ ${rel}: "${key}" is already used by ${other}`);
        errorCount++;
      } else keys.set(key, rel);
    }

    problems.push(...contentIssues(data, content).map((i) => i.message));
    // A placeholder cover ("CLOUDINARY_URL_HERE") is allowed: the post is built without a hero image (no broken image,
    // no social-card image). It is only a reminder, never a build error, so posts can go live before the photos exist.
    if (dirName === 'posts' && typeof data.cover === 'string' && isPlaceholderImage(data.cover)) {
      console.warn(`! ${rel}: no cover image yet (placeholder) — add the Cloudinary URL when you have it`);
      warnCount++;
    }

    for (const p of problems) {
      if (isDraft) {
        console.warn(`! ${rel} (draft): ${p}`);
        warnCount++;
      } else {
        console.error(`✗ ${rel}: ${p}`);
        errorCount++;
      }
    }
  }
  return files.length;
}

const posts = checkDir('posts');
const learn = checkDir('learn');

// Every tool in the registry needs its own page folder (keeps each tool's JS on its own page).
for (const tool of TOOLS) {
  const page = path.join(ROOT, 'app', '(site)', 'tools', tool.slug, 'page.tsx');
  if (!fs.existsSync(page)) {
    console.error(`✗ lib/tools.ts: tool "${tool.slug}" has no page at app/(site)/tools/${tool.slug}/page.tsx`);
    errorCount++;
  }
}

console.log(`\nChecked ${posts} post(s), ${learn} learn page(s) and ${TOOLS.length} tool(s): ${errorCount} error(s), ${warnCount} draft warning(s).`);
if (errorCount) process.exit(1);
