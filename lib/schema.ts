// Frontmatter schemas. Pure module (no fs / Next imports) so scripts can reuse it.
import { z } from 'zod';
import { SECTION_SLUGS, SILO_SLUGS } from '../config/site-structure';
import { DEFAULT_AUTHOR, POST_TYPES } from './constants';

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const slug = z
  .string()
  .regex(SLUG_PATTERN, 'use lowercase letters, numbers and single hyphens (e.g. "best-locks"), no year')
  .refine((s) => !/(^|-)(19|20)\d{2}(-|$)/.test(s), 'no year in slugs (keeps URLs evergreen)');

const cloudinaryImage = z
  .string()
  .trim()
  .refine(
    (v) => /^https:\/\/res\.cloudinary\.com\//.test(v) || !/^(https?:)?\/\//.test(v),
    'must be a https://res.cloudinary.com/... URL or a Cloudinary public ID',
  );

const date = z.coerce.date({ error: 'must be a date like 2026-10-01' });

/** Post URLs are /{slug}/ at the site root, so a slug can't collide with a silo, a static page or a system path. */
const RESERVED_ROOT = [
  ...SILO_SLUGS, 'tools', 'learn', 'search', 'about', 'contact', 'affiliate-disclosure', 'privacy-policy', 'page',
  'feed', 'sitemap', 'robots', 'pagefind', 'studio-preview', '404', 'icon', 'favicon', 'api', 'admin',
];

/** A reference to another post, by slug (slugs are unique across the whole site). */
const postRef = slug;

export const frontmatterSchema = z
  .object({
    title: z.string().trim().min(5).max(120),
    slug: slug.refine((s) => !RESERVED_ROOT.includes(s), 'this slug is reserved (it would clash with a hub, a tool or a system page)'),
    description: z.string().trim().min(50).max(200),
    date,
    updated: date.optional(),

    // Site structure (must exist in config/site-structure.ts)
    silo: z.enum(SILO_SLUGS),
    section: z.enum(SECTION_SLUGS),
    postType: z.enum(POST_TYPES),
    /** Info posts: slug of the Money post they point readers to (the info → money arrow). */
    // An empty value (moneyPost: "") just means "none" (money posts don't point at another money post).
    moneyPost: z.preprocess((v) => (v === '' ? undefined : v), postRef.optional()),
    /** Slugs of other posts in the SAME section (optional; the section fills the rest). */
    siblings: z.array(slug).default([]),
    /** Same topic in another silo, by slug. Links are two-way automatically. */
    parallel: z.array(slug).default([]),
    /** Slug of a related tool under /tools/. */
    tool: slug.optional(),

    tags: z.array(z.string().trim().min(1).max(60)).max(15).default([]),
    /** SEO note for the author (not shown on the page). */
    primaryKeyword: z.string().trim().max(120).optional(),
    cover: cloudinaryImage,
    coverAlt: z.string().trim().min(1, 'coverAlt is required'),
    draft: z.boolean().default(false),
    author: z.string().trim().min(1).default(DEFAULT_AUTHOR),

    // Optional review-style data (money posts)
    rating: z.number().min(0).max(5).optional(),
    productName: z.string().trim().optional(),
    pros: z.array(z.string().trim().min(1)).default([]),
    cons: z.array(z.string().trim().min(1)).default([]),
    testedHandsOn: z.boolean().default(false),
    affiliateLinks: z
      .array(
        z.object({
          label: z.string().trim().min(1),
          url: z.url({ protocol: /^https?$/ }),
          merchant: z.string().trim().optional(),
        }),
      )
      .default([]),

    bestFor: z.string().trim().optional(),
    faqs: z.array(z.object({ question: z.string().trim().min(1), answer: z.string().trim().min(1) })).default([]),
    noindex: z.boolean().default(false),
  })
  .strict()
  .superRefine((fm, ctx) => {
    if (fm.postType === 'info' && !fm.moneyPost) {
      ctx.addIssue({ code: 'custom', path: ['moneyPost'], message: 'info posts need moneyPost (the Money post to point readers to)' });
    }
    if (fm.postType !== 'info' && fm.moneyPost) {
      ctx.addIssue({ code: 'custom', path: ['moneyPost'], message: 'moneyPost is only used on info posts' });
    }
    if (fm.rating !== undefined && fm.postType !== 'money') {
      ctx.addIssue({ code: 'custom', path: ['rating'], message: 'rating is only allowed on money posts' });
    }
    if (fm.updated && fm.updated < fm.date) {
      ctx.addIssue({ code: 'custom', path: ['updated'], message: 'updated cannot be before date' });
    }
    if (fm.parallel.includes(fm.slug) || fm.siblings.includes(fm.slug) || fm.moneyPost === fm.slug) {
      ctx.addIssue({ code: 'custom', path: ['slug'], message: 'a post can’t link to itself (moneyPost / siblings / parallel)' });
    }
  });

export type Frontmatter = z.infer<typeof frontmatterSchema>;

/** Learn articles (/learn/{slug}/) — shared across all silos, lighter schema. */
export const learnSchema = z
  .object({
    title: z.string().trim().min(5).max(120),
    slug,
    description: z.string().trim().min(50).max(200),
    date,
    updated: date.optional(),
    cover: cloudinaryImage.optional(),
    coverAlt: z.string().trim().optional(),
    draft: z.boolean().default(false),
    author: z.string().trim().min(1).default(DEFAULT_AUTHOR),
  })
  .strict()
  .superRefine((fm, ctx) => {
    if (fm.cover && !fm.coverAlt) ctx.addIssue({ code: 'custom', path: ['coverAlt'], message: 'coverAlt is required when cover is set' });
  });

export type LearnFrontmatter = z.infer<typeof learnSchema>;

export function formatIssues(error: z.ZodError): string {
  return error.issues.map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`).join('\n');
}
