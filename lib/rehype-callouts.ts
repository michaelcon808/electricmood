// Turns the important bits of an article into highlighted boxes at render time. It never changes the article
// text: it only wraps existing paragraphs in <div class="callout callout-…"> (styled in app/globals.css).
//
// What gets a box:
//  - the first paragraph (the short answer)                      -> yellow, "Short answer"
//  - everything under the "The bottom line" heading               -> orange
//  - the "This page may contain affiliate links" line             -> amber note, "Disclosure"
//  - intro paragraphs saying "I haven't ridden/tested/used …"     -> orange note, "Note"
//  - paragraphs starting with a bold "Best for", "It suits you if" -> yellow; "Pros" -> green; "Cons"/"Skip it if" -> orange
//  - paragraphs starting with a bold "Note", "Important", "Warning", "Safety", "Tip" and any > blockquote
import type { Element, ElementContent, Root, RootContent } from 'hast';

type Kind = 'answer' | 'bottom' | 'disclosure' | 'note' | 'warning' | 'tip' | 'bestfor' | 'pros' | 'cons';

const LABELS: Partial<Record<Kind, string>> = {
  answer: 'Short answer',
  disclosure: 'Disclosure',
  note: 'Note',
  warning: 'Important',
  tip: 'Tip',
};

function textOf(node: RootContent | ElementContent): string {
  if (node.type === 'text') return node.value;
  if ('children' in node) return (node.children as ElementContent[]).map(textOf).join('');
  return '';
}

const isEl = (n: RootContent, ...tags: string[]): boolean => n.type === 'element' && tags.includes((n as Element).tagName);

function box(kind: Kind, children: ElementContent[]): Element {
  const properties: Element['properties'] = { className: ['callout', `callout-${kind}`] };
  if (LABELS[kind]) properties['data-label'] = LABELS[kind];
  return { type: 'element', tagName: 'div', properties, children };
}

/** Kind for a paragraph that starts with a bold lead-in such as "**Pros:**". */
function leadKind(p: Element): Kind | undefined {
  const first = p.children.find((c) => !(c.type === 'text' && !c.value.trim()));
  if (!first || first.type !== 'element' || first.tagName !== 'strong') return undefined;
  const lead = textOf(first).trim().toLowerCase().replace(/[.:]+$/, '');
  if (/^(best for|it suits you if)$/.test(lead)) return 'bestfor';
  if (/^pros?$/.test(lead)) return 'pros';
  if (/^(cons?|negatives?|downsides?|skip it if)$/.test(lead)) return 'cons';
  if (/^(important|warning|safety|heads up|caution)$/.test(lead)) return 'warning';
  if (/^note$/.test(lead)) return 'note';
  if (/^tip$/.test(lead)) return 'tip';
  return undefined;
}

export default function rehypeCallouts() {
  return (tree: Root) => {
    const out: RootContent[] = [];
    const src = tree.children;
    let seenHeading = false;
    let answerDone = false;

    for (let i = 0; i < src.length; i++) {
      const node = src[i];

      if (isEl(node, 'h2', 'h3', 'h4')) {
        const h = node as Element;
        seenHeading = true;
        out.push(node);
        // Everything up to the next heading under "The bottom line" goes in one box.
        if (h.tagName === 'h2' && /^the bottom line/i.test(textOf(h).trim())) {
          const inner: ElementContent[] = [];
          let j = i + 1;
          for (; j < src.length; j++) {
            const n = src[j];
            if (n.type === 'text' && !n.value.trim()) { inner.push(n as ElementContent); continue; }
            if (!isEl(n, 'p', 'ul', 'ol')) break;
            if ((n as Element).tagName === 'p' && /^written by/i.test(textOf(n).trim())) break; // byline stays outside
            inner.push(n as ElementContent);
          }
          if (inner.some((n) => n.type === 'element')) {
            out.push(box('bottom', inner));
            i = j - 1;
          }
        }
        continue;
      }

      if (isEl(node, 'blockquote')) { out.push(box('note', (node as Element).children)); continue; }

      if (isEl(node, 'p')) {
        const para = node as Element;
        const text = textOf(para).trim();
        let kind: Kind | undefined = leadKind(para);
        if (!kind && /^this page may contain affiliate links/i.test(text)) kind = 'disclosure';
        if (!kind && !seenHeading && !answerDone && text.length > 40) kind = 'answer';
        if (!kind && !seenHeading && /\bI (haven't|have not|did not|didn't) (ridden|ride|tested|test|used|fitted|carried)\b/i.test(text)) kind = 'note';
        if (kind === 'answer') answerDone = true;
        if (kind) { out.push(box(kind, [para])); continue; }
      }

      out.push(node);
    }
    tree.children = out;
  };
}
