import Link from 'next/link';

export function Pagination({ page, pages, href }: { page: number; pages: number; href: (n: number) => string }) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === pages || Math.abs(n - page) <= 1,
  );

  return (
    <nav aria-label="Pagination" className="mt-12 flex flex-wrap items-center justify-center gap-2 text-sm">
      {page > 1 && (
        <Link href={href(page - 1)} rel="prev" className="btn-secondary">
          ← Newer
        </Link>
      )}
      {nums.map((n, i) => (
        <span key={n} className="flex items-center gap-2">
          {i > 0 && n - nums[i - 1] > 1 && <span aria-hidden>…</span>}
          {n === page ? (
            <span aria-current="page" className="btn bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
              {n}
            </span>
          ) : (
            <Link href={href(n)} className="btn-secondary">
              {n}
            </Link>
          )}
        </span>
      ))}
      {page < pages && (
        <Link href={href(page + 1)} rel="next" className="btn-secondary">
          Older →
        </Link>
      )}
    </nav>
  );
}
