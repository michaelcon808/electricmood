export const SITE_NAME = 'ElectricMood';
export const SITE_TAGLINE = 'Honest e-scooter and e-bike reviews, guides, comparisons and free calculators.';
export const DEFAULT_AUTHOR = 'ElectricMood Editorial Team';

export const POST_TYPES = ['money', 'info', 'comparison'] as const;
export type PostType = (typeof POST_TYPES)[number];

/** Badge text shown to visitors on hub pages, cards and posts. The internal type name `money` is never displayed. */
export const POST_TYPE_LABELS: Record<PostType, string> = {
  money: 'Review',
  info: 'Info',
  comparison: 'Comparison',
};

/** Static-form contact page via Netlify Forms. Set to false to show only the email address. */
export const CONTACT_FORM_ENABLED = true;
