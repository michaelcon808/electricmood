import GithubSlugger from 'github-slugger';

export type TocItem = { id: string; text: string; level: 2 | 3 };

function stripInline(s: string): string {
  return s
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[*_`~]/g, '')
    .replace(/\s+#+\s*$/, '')
    .trim();
}

/** Table of contents from ## / ### headings, with the same ids rehype-slug generates. */
export function extractToc(source: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  let inFence = false;
  for (const line of source.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^(#{1,6})\s+(.+)$/.exec(line);
    if (!m) continue;
    const text = stripInline(m[2]);
    const id = slugger.slug(text); // slug every heading so duplicate counters match rehype-slug
    const level = m[1].length;
    if (level === 2 || level === 3) items.push({ id, text, level });
  }
  return items;
}

export function readingTimeMinutes(source: string): number {
  const words = source
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 225));
}

/** Markdown links ending in #aff are affiliate links: [Check price](https://shop.example/x#aff) */
export const AFFILIATE_MARKER = '#aff';

/** True when the MDX body contains affiliate links (#aff links or affiliate components with a link). */
export function hasAffiliateContent(source: string): boolean {
  return (
    /\]\([^)\s]+#aff\)/.test(source) ||
    /<AffiliateLink\b/.test(source) ||
    /<(ProductBox|BestFor)\b[^>]*\b(href|links)=/s.test(source)
  );
}
