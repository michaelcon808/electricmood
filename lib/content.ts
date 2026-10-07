// Build-time content loader. Reads /content/posts/*.mdx and /content/learn/*.mdx, validates frontmatter
// with zod (a bad file fails the build), and filters out drafts and future-dated items.
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { sections, silos } from '../config/site-structure';
import { formatIssues, frontmatterSchema, learnSchema, type Frontmatter, type LearnFrontmatter } from './schema';
import { extractFaqFromBody, extractToc, hasAffiliateContent, readingTimeMinutes, type TocItem } from './markdown';
import { paths } from './site';

export const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');
export const LEARN_DIR = path.join(process.cwd(), 'content', 'learn');

export type Post = Frontmatter & {
  content: string;
  file: string;
  /** The post's unique identity: its slug (unique across the whole site). */
  key: string;
  /** Canonical URL path: /{slug}/ at the site root. */
  path: string;
  readingTime: number;
  toc: TocItem[];
  /** FAQ parsed from the body (### questions under "Frequently asked questions"); used for FAQPage JSON-LD. */
  bodyFaqs: { question: string; answer: string }[];
  hasAffiliateLinks: boolean;
  dateISO: string;
  updatedISO: string;
};

export type PostSummary = Omit<Post, 'content' | 'toc'>;

export type LearnPage = LearnFrontmatter & {
  content: string;
  file: string;
  path: string;
  readingTime: number;
  toc: TocItem[];
  dateISO: string;
  updatedISO: string;
};

function readDir(dir: string) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.mdx?$/.test(f))
    .map((file) => ({ file, ...matter(fs.readFileSync(path.join(dir, file), 'utf8')) }));
}

/** Turns validated frontmatter + MDX body into a Post (also used by the studio preview). */
export function buildPost(fm: Frontmatter, content: string, file: string): Post {
  return {
    ...fm,
    content,
    file,
    key: fm.slug,
    path: paths.post(fm.slug),
    readingTime: readingTimeMinutes(content),
    toc: extractToc(content),
    bodyFaqs: extractFaqFromBody(content),
    hasAffiliateLinks: fm.affiliateLinks.length > 0 || hasAffiliateContent(content),
    dateISO: fm.date.toISOString(),
    updatedISO: (fm.updated ?? fm.date).toISOString(),
  };
}

/** Reads and validates every post file, including drafts. Throws on any invalid file. */
export function loadAllPostFiles(): Post[] {
  const errors: string[] = [];
  const posts: Post[] = [];

  for (const { file, data, content } of readDir(POSTS_DIR)) {
    const parsed = frontmatterSchema.safeParse(data);
    if (!parsed.success) {
      errors.push(`content/posts/${file}:\n${formatIssues(parsed.error)}`);
      continue;
    }
    posts.push(buildPost(parsed.data, content, file));
  }

  if (errors.length) throw new Error(`Invalid post frontmatter:\n\n${errors.join('\n\n')}\n`);

  // URLs are /{slug}/, so slugs must be unique across the whole site.
  const seen = new Map<string, string>();
  for (const p of posts) {
    const other = seen.get(p.key);
    if (other) throw new Error(`Duplicate slug "${p.key}" in content/posts/${other} and content/posts/${p.file} (slugs must be unique across the site)`);
    seen.set(p.key, p.file);
  }
  return posts;
}

/** Published = not a draft and dated today or earlier (at build time). */
export function isPublished(p: { draft: boolean; date: Date }, now = new Date()): boolean {
  return !p.draft && p.date.getTime() <= now.getTime();
}

let postCache: Post[] | null = null;

/** Every published post, newest first. Drafts and future posts never leave this module. */
export function getPosts(): Post[] {
  if (!postCache || process.env.NODE_ENV === 'development') {
    postCache = loadAllPostFiles()
      .filter((p) => isPublished(p))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }
  return postCache;
}

export function summarize(p: Post): PostSummary {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { content, toc, ...rest } = p;
  return rest;
}

export const getPostByKey = (key: string) => getPosts().find((p) => p.key === key);
export const getPost = (slug: string) => getPostByKey(slug);

/**
 * The post for its own page. In `npm run dev` drafts and future-dated posts are also returned, so you can
 * preview them at their URL. In a production build only published posts exist, so a draft never ships.
 */
export function getPostForPage(slug: string): Post | undefined {
  const published = getPostByKey(slug);
  if (published || process.env.NODE_ENV !== 'development') return published;
  return loadAllPostFiles().find((p) => p.slug === slug);
}

/** Slugs to generate: published posts, plus drafts/future posts in dev only. */
export function getPostSlugsForPages(): string[] {
  const slugs = new Set(getPosts().map((p) => p.slug));
  if (process.env.NODE_ENV === 'development') for (const p of loadAllPostFiles()) slugs.add(p.slug);
  return [...slugs];
}
export const getPostsBySilo = (silo: string) => getPosts().filter((p) => p.silo === silo);
export const getPostsForTool = (tool: string) => getPosts().filter((p) => p.tool === tool);

const TYPE_ORDER = { money: 0, comparison: 1, info: 2 } as const;

/** EVERY published post in a section: money first, then comparison, then info, newest first within each. */
export function getSectionPosts(silo: string, section: string): Post[] {
  return getPosts()
    .filter((p) => p.silo === silo && p.section === section)
    .sort((a, b) => TYPE_ORDER[a.postType] - TYPE_ORDER[b.postType] || b.date.getTime() - a.date.getTime());
}

/** Featured posts for hubs and menus: money posts first, then newest. */
export function getFeaturedPosts(silo: string, limit = 3, section?: string): Post[] {
  return getPosts()
    .filter((p) => p.silo === silo && (!section || p.section === section))
    .sort((a, b) => Number(b.postType === 'money') - Number(a.postType === 'money') || b.date.getTime() - a.date.getTime())
    .slice(0, limit);
}

/* ---------------- Learn ---------------- */

export function loadAllLearnFiles(): LearnPage[] {
  const errors: string[] = [];
  const pages: LearnPage[] = [];
  for (const { file, data, content } of readDir(LEARN_DIR)) {
    const parsed = learnSchema.safeParse(data);
    if (!parsed.success) {
      errors.push(`content/learn/${file}:\n${formatIssues(parsed.error)}`);
      continue;
    }
    const fm = parsed.data;
    pages.push({
      ...fm,
      content,
      file,
      path: paths.learnPage(fm.slug),
      readingTime: readingTimeMinutes(content),
      toc: extractToc(content),
      dateISO: fm.date.toISOString(),
      updatedISO: (fm.updated ?? fm.date).toISOString(),
    });
  }
  if (errors.length) throw new Error(`Invalid learn frontmatter:\n\n${errors.join('\n\n')}\n`);
  const slugs = new Set<string>();
  for (const p of pages) {
    if (slugs.has(p.slug)) throw new Error(`Duplicate learn slug "${p.slug}" (content/learn/${p.file})`);
    slugs.add(p.slug);
  }
  return pages;
}

export function getLearnPages(): LearnPage[] {
  return loadAllLearnFiles()
    .filter((p) => isPublished(p))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

export const getLearnPage = (slug: string) => getLearnPages().find((p) => p.slug === slug);

/** Every URL the site generates (used by the build checks to validate breadcrumbs). */
export function getAllGeneratedPaths(toolSlugs: string[], staticPaths: string[]): Set<string> {
  const urls = new Set<string>([paths.home, paths.tools, paths.learn, paths.search, ...staticPaths]);
  for (const silo of silos) {
    urls.add(paths.silo(silo.slug));
    for (const section of sections) urls.add(paths.section(silo.slug, section.slug));
  }
  for (const p of getPosts()) urls.add(p.path);
  for (const t of toolSlugs) urls.add(paths.tool(t));
  for (const l of getLearnPages()) urls.add(l.path);
  return urls;
}
