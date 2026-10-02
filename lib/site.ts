// Build-time public config. NEXT_PUBLIC_* values are inlined when the site is built.

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');

/** Global launch switch: noindex meta on every page, Disallow in robots.txt, empty sitemap. */
export const isGlobalNoindex = process.env.NEXT_PUBLIC_NOINDEX === 'true';

export const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';

export const contactEmail = 'contact@electricmood.com';

/** Absolute URL for a site path. Paths are given in their canonical trailing-slash form. */
export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

// Canonical paths (trailingSlash: true) — use these everywhere instead of hand-written strings.
export const paths = {
  home: '/',
  blog: '/blog/',
  blogPage: (n: number) => (n <= 1 ? '/blog/' : `/blog/page/${n}/`),
  post: (slug: string) => `/blog/${slug}/`,
  category: (slug: string) => `/category/${slug}/`,
  tag: (slug: string) => `/tag/${slug}/`,
  tools: '/tools/',
  tool: (slug: string) => `/tools/${slug}/`,
  search: '/search/',
};
