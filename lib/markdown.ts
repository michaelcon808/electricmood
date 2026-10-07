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
    if ((level === 2 || level === 3) && !OWN_TOC_TITLE.test(text)) items.push({ id, text, level });
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

/**
 * The page template already renders the post title as the <h1>, so a leading "# Title" at the top of the body
 * would be a second h1. Drop it at RENDER time only (the .mdx file is never modified).
 */
export function stripLeadingH1(source: string): string {
  return source.replace(/^((?:\s|\{\/\*[\s\S]*?\*\/\s*)*)# [^\n]*\n/, '$1');
}

/** Headings authors use for a hand-written table of contents (the site renders its own automatic one). */
const OWN_TOC_TITLE = /^(on this page|table of contents|contents|in this article|jump to)$/i;

/**
 * Remove an author-written "## On this page" list from what is RENDERED, because the page already shows the
 * automatic table of contents (otherwise there would be two). Runs from that heading to the next heading;
 * the .mdx file is never modified.
 */
export function stripOwnToc(source: string): string {
  const lines = source.split('\n');
  const start = lines.findIndex((l) => /^##\s+(.+?)\s*$/.test(l) && OWN_TOC_TITLE.test(l.replace(/^##\s+/, '').trim()));
  if (start === -1) return source;
  let end = start + 1;
  while (end < lines.length && !/^#{1,6}\s/.test(lines[end])) end++;
  return [...lines.slice(0, start), ...lines.slice(end)].join('\n');
}

/** Plain text from a Markdown/MDX snippet (links, emphasis, code, comments and html removed). */
export function toPlainText(md: string): string {
  return md
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[*_`~]/g, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * FAQ from the body: every "### Question" (with the paragraphs that follow it) under the
 * "## Frequently asked questions" heading, up to the next "## " heading.
 */
export function extractFaqFromBody(source: string): { question: string; answer: string }[] {
  const lines = source.split('\n');
  const start = lines.findIndex((l) => /^##\s+frequently asked questions\b/i.test(l.trim()));
  if (start === -1) return [];
  const items: { question: string; answer: string }[] = [];
  let current: { question: string; lines: string[] } | null = null;
  let inFence = false;
  const flush = () => {
    if (!current) return;
    const answer = toPlainText(current.lines.join('\n'));
    const question = toPlainText(current.question);
    if (question && answer) items.push({ question, answer });
    current = null;
  };
  for (const line of lines.slice(start + 1)) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    if (!inFence && /^##\s/.test(line)) break; // next H2 ends the FAQ section
    const q = !inFence && /^###\s+(.+)$/.exec(line);
    if (q) {
      flush();
      current = { question: q[1], lines: [] };
    } else current?.lines.push(line);
  }
  flush();
  return items;
}

export type TocNode = { id: string; text: string; number: string; children: { id: string; text: string; number: string }[] };

/**
 * Nest the flat heading list into numbered outline nodes: H2 -> "1.", "2."; H3 under an H2 -> "3.1", "3.2".
 * An H3 that appears before any H2 is treated as a top-level entry so it never gets lost.
 */
export function buildTocTree(items: TocItem[]): TocNode[] {
  const tree: TocNode[] = [];
  for (const item of items) {
    const parent = tree[tree.length - 1];
    if (item.level === 3 && parent) {
      parent.children.push({ id: item.id, text: item.text, number: `${tree.length}.${parent.children.length + 1}` });
    } else {
      tree.push({ id: item.id, text: item.text, number: `${tree.length + 1}.`, children: [] });
    }
  }
  return tree;
}
