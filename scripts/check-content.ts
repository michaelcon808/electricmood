/**
 * Content checks (runs automatically before every build; or `npm run check-content`).
 *  - frontmatter valid (same zod schema as the site build)
 *  - unique slugs across ALL posts, drafts included
 *  - description is 120–160 characters
 *  - cover has alt text, and every image in the body has alt text
 * Drafts are reported as warnings so unfinished work doesn't block a deploy; published posts fail.
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { formatIssues, frontmatterSchema } from '../lib/schema';
import { TOOLS } from '../lib/tools';

const DIR = path.join(process.cwd(), 'content', 'posts');
const files = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => /\.mdx?$/.test(f)) : [];

let errorCount = 0;
let warnCount = 0;
const slugs = new Map<string, string>();

function imageAltProblems(body: string): string[] {
  const problems: string[] = [];
  const noCode = body.replace(/```[\s\S]*?```/g, '');
  for (const m of noCode.matchAll(/!\[([^\]]*)\]\(([^)\s]+)[^)]*\)/g)) {
    if (!m[1].trim()) problems.push(`Markdown image without alt text: ${m[2]}`);
  }
  for (const m of noCode.matchAll(/<(Img|ProductBox)\b([^>]*?)\/?>/gs)) {
    const attrs = m[2];
    const needs = m[1] === 'Img' ? /\bsrc=/.test(attrs) : /\bimage=/.test(attrs);
    if (!needs) continue;
    const altAttr = m[1] === 'Img' ? 'alt' : 'imageAlt';
    const alt = new RegExp(`\\b${altAttr}=(?:"([^"]*)"|'([^']*)'|\\{)`).exec(attrs);
    if (!alt || (alt[1] ?? alt[2] ?? 'x').trim() === '') {
      problems.push(`<${m[1]}> without ${altAttr}: ${attrs.trim().slice(0, 80)}`);
    }
  }
  return problems;
}

for (const file of files) {
  const rel = `content/posts/${file}`;
  const { data, content } = matter(fs.readFileSync(path.join(DIR, file), 'utf8'));
  const isDraft = data.draft === true;
  const problems: string[] = [];

  const parsed = frontmatterSchema.safeParse(data);
  if (!parsed.success) problems.push(`invalid frontmatter:\n${formatIssues(parsed.error)}`);

  const slug = typeof data.slug === 'string' ? data.slug : '';
  if (slug) {
    const other = slugs.get(slug);
    // Duplicates are always fatal: they would collide even after a draft is published.
    if (other) {
      console.error(`✗ ${rel}: slug "${slug}" is already used by ${other}`);
      errorCount++;
    } else slugs.set(slug, rel);
  }

  const description = typeof data.description === 'string' ? data.description.trim() : '';
  if (description.length < 120 || description.length > 160) {
    problems.push(`description is ${description.length} characters (needs 120–160)`);
  }
  if (typeof data.coverAlt !== 'string' || !data.coverAlt.trim()) problems.push('coverAlt is missing');
  problems.push(...imageAltProblems(content));

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

// Every tool in the registry needs its own page folder (keeps each tool's JS on its own page).
for (const tool of TOOLS) {
  const page = path.join(process.cwd(), 'app', '(site)', 'tools', tool.slug, 'page.tsx');
  if (!fs.existsSync(page)) {
    console.error(`✗ lib/tools.ts: tool "${tool.slug}" has no page at app/(site)/tools/${tool.slug}/page.tsx`);
    errorCount++;
  }
}

console.log(`\nChecked ${files.length} post(s) and ${TOOLS.length} tool(s): ${errorCount} error(s), ${warnCount} draft warning(s).`);
if (errorCount) process.exit(1);
