// Frontmatter schema. Pure module (no fs / Next imports) so scripts can reuse it.
import { z } from 'zod';
import { DEFAULT_AUTHOR, POST_TYPES } from './constants';

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESERVED_SLUGS = ['page'];

const slug = z
  .string()
  .regex(SLUG_PATTERN, 'use lowercase letters, numbers and single hyphens (e.g. "best-commuter-e-scooters")');

const cloudinaryImage = z
  .string()
  .trim()
  .refine(
    (v) => /^https:\/\/res\.cloudinary\.com\//.test(v) || !/^(https?:)?\/\//.test(v),
    'must be a https://res.cloudinary.com/... URL or a Cloudinary public ID',
  );

const date = z.coerce.date({ error: 'must be a date like 2026-10-01' });

export const frontmatterSchema = z
  .object({
    title: z.string().trim().min(5).max(120),
    slug: slug.refine((s) => !RESERVED_SLUGS.includes(s), 'this slug is reserved'),
    description: z.string().trim().min(50).max(200),
    date,
    updated: date.optional(),
    category: slug,
    tags: z.array(slug).max(12).default([]),
    postType: z.enum(POST_TYPES),
    cover: cloudinaryImage,
    coverAlt: z.string().trim().min(1, 'coverAlt is required'),
    draft: z.boolean().default(false),
    author: z.string().trim().min(1).default(DEFAULT_AUTHOR),

    // Reviews
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

    // Optional extras
    bestFor: z.string().trim().optional(),
    faqs: z.array(z.object({ question: z.string().trim().min(1), answer: z.string().trim().min(1) })).default([]),
    noindex: z.boolean().default(false),
  })
  .strict()
  .superRefine((fm, ctx) => {
    if (fm.rating !== undefined && fm.postType !== 'review') {
      ctx.addIssue({ code: 'custom', path: ['rating'], message: 'rating is only allowed on postType: review' });
    }
    if (fm.updated && fm.updated < fm.date) {
      ctx.addIssue({ code: 'custom', path: ['updated'], message: 'updated cannot be before date' });
    }
  });

export type Frontmatter = z.infer<typeof frontmatterSchema>;

export function formatIssues(error: z.ZodError): string {
  return error.issues.map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`).join('\n');
}
