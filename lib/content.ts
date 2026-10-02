// Build-time content loader. Reads /content/posts/*.mdx, validates frontmatter with zod
// (a bad file fails the build), and filters out drafts and future-dated posts.
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { PER_PAGE } from './constants';
import { formatIssues, frontmatterSchema, type Frontmatter } from './schema';
import { extractToc, hasAffiliateContent, readingTimeMinutes, type TocItem } from './markdown';

export const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');

export type Post = Frontmatter & {
  content: string;
  file: string;
  readingTime: number;
  toc: TocItem[];
  hasAffiliateLinks: boolean;
  /** ISO strings for serialization into client code / JSON-LD. */
  dateISO: string;
  updatedISO: string;
};

export type PostSummary = Omit<Post, 'content' | 'toc'>;

/** Reads and validates every post file, including drafts. Throws on any invalid file. */
export function loadAllPostFiles(): Post[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const files = fs.readdirSync(POSTS_DIR).filter((f) => /\.mdx?$/.test(f));
  const errors: string[] = [];
  const posts: Post[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
    const { data, content } = matter(raw);
    const parsed = frontmatterSchema.safeParse(data);
    if (!parsed.success) {
      errors.push(`content/posts/${file}:\n${formatIssues(parsed.error)}`);
      continue;
    }
    const fm = parsed.data;
    posts.push({
      ...fm,
      content,
      file,
      readingTime: readingTimeMinutes(content),
      toc: extractToc(content),
      hasAffiliateLinks: fm.affiliateLinks.length > 0 || hasAffiliateContent(content),
      dateISO: fm.date.toISOString(),
      updatedISO: (fm.updated ?? fm.date).toISOString(),
    });
  }

  if (errors.length) {
    throw new Error(`Invalid post frontmatter:\n\n${errors.join('\n\n')}\n`);
  }

  const slugs = new Map<string, string>();
  for (const p of posts) {
    const other = slugs.get(p.slug);
    if (other) throw new Error(`Duplicate slug "${p.slug}" in content/posts/${other} and content/posts/${p.file}`);
    slugs.set(p.slug, p.file);
  }
  return posts;
}

/** Published = not a draft and dated today or earlier (at build time). */
export function isPublished(p: Pick<Post, 'draft' | 'date'>, now = new Date()): boolean {
  return !p.draft && p.date.getTime() <= now.getTime();
}

let cache: Post[] | null = null;

/** Every published post, newest first. Drafts and future posts never leave this module. */
export function getPosts(): Post[] {
  if (!cache || process.env.NODE_ENV === 'development') {
    cache = loadAllPostFiles()
      .filter((p) => isPublished(p))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }
  return cache;
}

export function summarize(p: Post): PostSummary {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { content, toc, ...rest } = p;
  return rest;
}

export function getPostBySlug(slug: string): Post | undefined {
  return getPosts().find((p) => p.slug === slug);
}

export function paginate<T>(items: T[], page: number, perPage = PER_PAGE) {
  const pages = Math.max(1, Math.ceil(items.length / perPage));
  return { items: items.slice((page - 1) * perPage, page * perPage), page, pages };
}

export function getPostsByCategory(category: string) {
  return getPosts().filter((p) => p.category === category);
}

export function getPostsByTag(tag: string) {
  return getPosts().filter((p) => p.tags.includes(tag));
}

function countBy(values: string[]) {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].map(([slug, count]) => ({ slug, count })).sort((a, b) => b.count - a.count);
}

export const getCategories = () => countBy(getPosts().map((p) => p.category));
export const getTags = () => countBy(getPosts().flatMap((p) => p.tags));

/** 3 related posts: same category scores 2, each shared tag 1, same type 0.5; topped up with the latest. */
export function getRelatedPosts(post: Post, limit = 3): Post[] {
  const others = getPosts().filter((p) => p.slug !== post.slug);
  const scored = others
    .map((p) => ({
      p,
      score:
        (p.category === post.category ? 2 : 0) +
        p.tags.filter((t) => post.tags.includes(t)).length +
        (p.postType === post.postType ? 0.5 : 0),
    }))
    .filter((s) => s.score >= 1)
    .sort((a, b) => b.score - a.score || b.p.date.getTime() - a.p.date.getTime())
    .slice(0, limit)
    .map((s) => s.p);
  for (const p of others) {
    if (scored.length >= limit) break;
    if (!scored.includes(p)) scored.push(p);
  }
  return scored;
}
