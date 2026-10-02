export const SITE_NAME = 'ElectricMood';
export const SITE_TAGLINE = 'Honest e-scooter and e-bike reviews, guides, comparisons and free calculators.';
export const DEFAULT_AUTHOR = 'ElectricMood Editorial Team';

export const POST_TYPES = ['review', 'guide', 'comparison', 'info'] as const;
export type PostType = (typeof POST_TYPES)[number];

export const PER_PAGE = 12;

/** Thin tag pages stay noindex (still followed) and out of the sitemap until they have this many posts. */
export const MIN_POSTS_TO_INDEX_TAG = 3;

/** Nice labels for category slugs. Any slug works; unknown ones are title-cased. */
export const CATEGORIES: Record<string, string> = {
  'e-scooters': 'E-Scooters',
  'e-bikes': 'E-Bikes',
  'power-stations': 'Power Stations',
};

export const POST_TYPE_LABELS: Record<PostType, string> = {
  review: 'Review',
  guide: 'Guide',
  comparison: 'Comparison',
  info: 'Info',
};

/** Static-form contact page via Netlify Forms. Set to false to show only the email address. */
export const CONTACT_FORM_ENABLED = true;
