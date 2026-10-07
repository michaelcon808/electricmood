import { buildTocTree, type TocItem } from '@/lib/markdown';

const link = 'flex gap-2 text-neutral-600 hover:text-brand-600 dark:text-neutral-400 dark:hover:text-brand-400';
const num = 'shrink-0 font-semibold tabular-nums text-neutral-500';

/** Numbered outline: 1., 2., 3. for sections and 3.1, 3.2 for the sub-sections under them. */
export function TableOfContents({ items }: { items: TocItem[] }) {
  if (items.length < 2) return null;
  const tree = buildTocTree(items);
  return (
    <details open className="card p-5 text-sm">
      <summary className="cursor-pointer font-semibold">On this page</summary>
      <ol className="mt-3 space-y-1.5">
        {tree.map((node) => (
          <li key={node.id}>
            <a href={`#${node.id}`} className={link}>
              <span className={`${num} min-w-[1.75rem]`}>{node.number}</span>
              <span>{node.text}</span>
            </a>
            {node.children.length > 0 && (
              <ol className="ml-1 mt-1.5 space-y-1 border-l border-neutral-200 pl-3 dark:border-neutral-700">
                {node.children.map((child) => (
                  <li key={child.id}>
                    <a href={`#${child.id}`} className={link}>
                      <span className={`${num} min-w-[2.75rem] font-normal`}>{child.number}</span>
                      <span>{child.text}</span>
                    </a>
                  </li>
                ))}
              </ol>
            )}
          </li>
        ))}
      </ol>
    </details>
  );
}
