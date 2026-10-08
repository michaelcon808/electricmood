// Build-time public config. NEXT_PUBLIC_* values are inlined when the site is built.

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');

/** Global launch switch: noindex meta on every page, Disallow in robots.txt, empty sitemap. */
export const isGlobalNoindex = process.env.NEXT_PUBLIC_NOINDEX === 'true';

export const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';

/** Google Analytics 4 Measurement ID (public). Empty = analytics off (local dev, previews, anything without the variable). */
const rawGaId = (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '').trim();
export const gaMeasurementId = /^G-[A-Z0-9]{6,14}$/.test(rawGaId) ? rawGaId : '';

export const contactEmail = 'contact@electricmood.com';

/** Absolute URL for a site path. Paths are given in their canonical trailing-slash form. */
export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

// Canonical paths (trailingSlash: true). Use these everywhere instead of hand-written strings.
export const paths = {
  home: '/',
  silo: (silo: string) => `/${silo}/`,
  section: (silo: string, section: string) => `/${silo}/${section}/`,
  /** Posts live at the site root: electricmood.com/{slug}/ (no silo/section folders in the URL). */
  post: (slug: string) => `/${slug}/`,
  tools: '/tools/',
  tool: (slug: string) => `/tools/${slug}/`,
  learn: '/learn/',
  learnPage: (slug: string) => `/learn/${slug}/`,
  search: '/search/',
};

/** Static pages with fixed URLs. */
export const STATIC_PATHS = ['/about/', '/contact/', '/affiliate-disclosure/', '/privacy-policy/'];
