// Writes post frontmatter + body as a tidy, predictable MDX file (stable key order, readable YAML).

const KEY_ORDER = [
  'title', 'slug', 'description', 'date', 'updated',
  'silo', 'section', 'postType', 'moneyPost', 'siblings', 'parallel', 'tool',
  'tags', 'primaryKeyword', 'cover', 'coverAlt', 'draft', 'author',
  'productName', 'rating', 'testedHandsOn', 'bestFor', 'pros', 'cons', 'affiliateLinks',
  'faqs', 'noindex',
] as const;

// Values written without quotes (slugs, enums, dates). Everything else is JSON-quoted, which is valid YAML.
const PLAIN_KEYS = new Set(['slug', 'date', 'updated', 'silo', 'section', 'postType', 'moneyPost', 'tool']);
const SLUG_LISTS = new Set(['siblings', 'parallel', 'tags']);

const q = (v: string) => JSON.stringify(v);
const isPlainToken = (v: string) => /^[a-z0-9][a-z0-9/-]*$/.test(v) || /^\d{4}-\d{2}-\d{2}$/.test(v);

function scalar(key: string, v: unknown): string {
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  const s = String(v);
  return PLAIN_KEYS.has(key) && isPlainToken(s) ? s : q(s);
}

/** Drops empty values so the file only contains what the author actually set. */
export function cleanData(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined || v === null || v === '') continue;
    if (Array.isArray(v) && v.length === 0) continue;
    if (typeof v === 'string') out[k] = v.trim();
    else out[k] = v;
  }
  // Defaults don't need to be written.
  for (const k of ['draft', 'testedHandsOn', 'noindex']) if (out[k] === false) delete out[k];
  return out;
}

export function serializePost(data: Record<string, unknown>, body: string): string {
  const d = cleanData(data);
  const lines: string[] = ['---'];
  const keys = [...KEY_ORDER.filter((k) => k in d), ...Object.keys(d).filter((k) => !(KEY_ORDER as readonly string[]).includes(k))];

  for (const key of keys) {
    const v = d[key];
    if (Array.isArray(v)) {
      if (SLUG_LISTS.has(key) && v.every((x) => typeof x === 'string' && isPlainToken(x))) {
        lines.push(`${key}: [${v.join(', ')}]`);
      } else if (v.every((x) => typeof x !== 'object')) {
        lines.push(`${key}:`);
        for (const item of v) lines.push(`  - ${q(String(item))}`);
      } else {
        lines.push(`${key}:`);
        for (const item of v as Record<string, unknown>[]) {
          const entries = Object.entries(item).filter(([, x]) => x !== undefined && x !== '');
          entries.forEach(([k, x], i) => lines.push(`${i === 0 ? '  - ' : '    '}${k}: ${scalar(k, x)}`));
        }
      }
    } else {
      lines.push(`${key}: ${scalar(key, v)}`);
    }
  }
  lines.push('---', '');
  return `${lines.join('\n')}\n${body.replace(/^\s*\n/, '').trimEnd()}\n`;
}
