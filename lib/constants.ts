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

/**
 * Social preview (Open Graph / X card) for pages without their own image: the home page, hubs and static pages.
 * Built by Cloudinary on the fly from the three flagship review covers (scooter, e-bike, e-skateboard), 1200x630.
 */
export const DEFAULT_SOCIAL_IMAGE = {
  url: 'https://res.cloudinary.com/mxgvqgqj/image/upload/c_fill,w_400,h_630,g_auto/c_pad,w_1200,h_630,g_west,b_rgb:064e3b/l_electricmood:best-electric-bikes-and-ebikes-for-adults-reviews-cover,c_fill,w_400,h_630,g_auto/fl_layer_apply,g_center/l_electricmood:best-electric-skateboards-reviews-cover,c_fill,w_400,h_630,g_auto/fl_layer_apply,g_east/q_auto,f_jpg/electricmood/best-electric-scooters-for-adults-reviews-cover.jpg',
  width: 1200,
  height: 630,
  alt: 'A rider on an electric scooter, an electric bike and an electric skateboard',
} as const;

/** Home page hero: the flagship review post of each silo supplies one photo (its cover). */
export const HOME_HERO_POSTS = [
  'best-electric-scooters-for-adults-reviews',
  'best-electric-bikes-and-ebikes-for-adults-reviews',
  'best-electric-skateboards-reviews',
] as const;
