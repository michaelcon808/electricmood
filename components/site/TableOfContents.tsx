import type { TocItem } from '@/lib/markdown';

export function TableOfContents({ items }: { items: TocItem[] }) {
  if (items.length < 2) return null;
  return (
    <details open className="card p-5 text-sm">
      <summary className="cursor-pointer font-semibold">On this page</summary>
      <ol className="mt-3 space-y-1.5">
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? 'pl-4' : ''}>
            <a href={`#${item.id}`} className="text-neutral-600 hover:text-brand-600 dark:text-neutral-400 dark:hover:text-brand-400">
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </details>
  );
}
