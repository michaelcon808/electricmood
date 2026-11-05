// Affiliate links for the AFFILIATE_LINK_… placeholders in posts (config/affiliate-links.json).
// Posts never contain the real URL: each placeholder resolves here at build time, so swapping a search
// link for an exact product link is a one-line change in the JSON, with no article edits.
import data from '../config/affiliate-links.json';

type Entry = { product: string; search: string; exact: string; image?: string };

const LINKS = data.links as Record<string, Entry>;

export const AFFILIATE_TOKEN = /^AFFILIATE_LINK_[A-Z0-9_]+$/;

/** The URL for a placeholder: the exact product link if set, otherwise the tagged Amazon search link. */
export function resolveAffiliate(token: string): string | undefined {
  const e = LINKS[token];
  if (!e) return undefined;
  return e.exact.trim() || e.search;
}

export const isAmazonUrl = (url: string) => /^https?:\/\/(www\.)?(amazon\.[a-z.]+|amzn\.to|link\.amazon)\//i.test(url);

/** Product photo for a placeholder, if one is set: a full URL, or just an Amazon image id (the part after /images/I/). */
export function resolveAffiliateImage(token: string): { src: string; alt: string } | undefined {
  const e = LINKS[token];
  const raw = e?.image?.trim();
  if (!e || !raw) return undefined;
  const src = /^https?:\/\//i.test(raw) ? raw : `https://m.media-amazon.com/images/I/${raw}._AC_SL500_.jpg`;
  return { src, alt: e.product };
}
