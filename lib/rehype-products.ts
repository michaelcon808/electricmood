// Two render-time tweaks for product content (article text is not changed):
//  1. A paragraph that is only an affiliate link becomes a big "View on Amazon" button.
//  2. Every table cell gets data-label="<column header>" so tables can stack into cards on phones.
import type { Element, ElementContent, Root, RootContent } from 'hast';

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

export default function rehypeProducts() {
  return (tree: Root) => {
    for (const node of tree.children) {
      if (node.type !== 'element' || node.tagName !== 'p') continue;
      const a = soleAffiliateLink(node);
      if (!a) continue;
      a.children = [{ type: 'text', value: 'View on Amazon' }];
      node.properties = { ...node.properties, className: ['buy-button'] };
      node.children = [a];
    }
    labelTables(tree);
  };
}
