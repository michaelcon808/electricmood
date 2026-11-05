// Two render-time tweaks for product content (article text is not changed):
//  1. A paragraph that is only an affiliate link becomes a big "View on Amazon" button. When the product has an image
//     (config/affiliate-links.json), it becomes a product card: the photo with a black "View on Amazon" tag bottom right.
//  2. Every table cell gets data-label="<column header>" so tables can stack into cards on phones.
import type { Element, ElementContent, Root, RootContent } from 'hast';
import { resolveAffiliateImage } from './affiliates';

const AFFILIATE = /^AFFILIATE_LINK_[A-Z0-9_]+$/;

function textOf(node: RootContent | ElementContent): string {
  if (node.type === 'text') return node.value;
  if ('children' in node) return (node.children as ElementContent[]).map(textOf).join('');
  return '';
}

const meaningful = (children: ElementContent[]) => children.filter((c) => !(c.type === 'text' && /^[\s.]*$/.test(c.value)));

/** The affiliate <a> if this paragraph contains nothing else (optionally wrapped in <strong>). */
function soleAffiliateLink(p: Element): Element | undefined {
  let kids = meaningful(p.children);
  if (kids.length === 1 && kids[0].type === 'element' && kids[0].tagName === 'strong') kids = meaningful(kids[0].children);
  const a = kids.length === 1 ? kids[0] : undefined;
  return a && a.type === 'element' && a.tagName === 'a' && AFFILIATE.test(String(a.properties?.href ?? '')) ? a : undefined;
}

function labelTables(node: Root | Element) {
  for (const child of node.children) {
    if (child.type !== 'element') continue;
    if (child.tagName === 'table') {
      const headRow = (child.children.find((c) => c.type === 'element' && c.tagName === 'thead') as Element | undefined)?.children.find(
        (c) => c.type === 'element' && c.tagName === 'tr',
      ) as Element | undefined;
      const labels = (headRow?.children.filter((c) => c.type === 'element') as Element[] | undefined)?.map((th) => textOf(th).trim()) ?? [];
      const body = child.children.find((c) => c.type === 'element' && c.tagName === 'tbody') as Element | undefined;
      for (const tr of (body?.children ?? []) as ElementContent[]) {
        if (tr.type !== 'element' || tr.tagName !== 'tr') continue;
        (tr.children.filter((c) => c.type === 'element') as Element[]).forEach((td, i) => {
          if (labels[i]) td.properties = { ...td.properties, dataLabel: labels[i] };
        });
      }
    } else labelTables(child);
  }
}

const isButton = (n: RootContent) => n.type === 'element' && n.tagName === 'p' && ((n.properties?.className as string[] | undefined) ?? []).includes('buy-button');
const isCard = (n: RootContent) => n.type === 'element' && n.tagName === 'p' && ((n.properties?.className as string[] | undefined) ?? []).includes('buy-card');
const isHeading = (n: RootContent) => n.type === 'element' && /^h[2-4]$/.test(n.tagName);

/** A product section (its title down to the next heading) that has exactly one buy button becomes one bordered card:
 *  title, photo, text, specs, pros and cons together. A photo card moves up to sit right under the title.
 *  Sections listing several products (several buttons) are left as they are. */
function productSections(tree: Root) {
  const kids = tree.children;
  const out: RootContent[] = [];
  let i = 0;
  while (i < kids.length) {
    if (!isHeading(kids[i])) { out.push(kids[i++]); continue; }
    let j = i + 1;
    while (j < kids.length && !isHeading(kids[j])) j++;
    const body = kids.slice(i + 1, j);
    if (body.filter(isButton).length !== 1) { out.push(kids[i], ...body); i = j; continue; }
    const card = body.find(isCard);
    const rest = card ? body.filter((n) => n !== card) : body;
    out.push({
      type: 'element',
      tagName: 'section',
      properties: { className: ['product-section'] },
      children: [kids[i], ...(card ? [card] : []), ...rest] as ElementContent[],
    });
    i = j;
  }
  tree.children = out;
}

export default function rehypeProducts() {
  return (tree: Root) => {
    for (const node of tree.children) {
      if (node.type !== 'element' || node.tagName !== 'p') continue;
      const a = soleAffiliateLink(node);
      if (!a) continue;
      const image = resolveAffiliateImage(String(a.properties?.href ?? ''));
      if (image) {
        a.children = [
          {
            type: 'element',
            tagName: 'img',
            properties: { src: image.src, alt: image.alt, width: 500, height: 375, loading: 'lazy', decoding: 'async' },
            children: [],
          },
          { type: 'element', tagName: 'span', properties: { className: ['buy-card-tag'] }, children: [{ type: 'text', value: 'View on Amazon' }] },
        ];
      } else a.children = [{ type: 'text', value: 'View on Amazon' }];
      node.properties = { ...node.properties, className: image ? ['buy-button', 'buy-card'] : ['buy-button'] };
      node.children = [a];
    }
    productSections(tree);
    labelTables(tree);
  };
}
