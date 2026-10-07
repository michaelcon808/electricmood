import Link from 'next/link';
import type { Crumb } from '@/config/site-structure';
import { breadcrumbJsonLd } from '@/lib/seo';
import { JsonLd } from './JsonLd';

const MOBILE_MAX = 60;

/**
 * Visible breadcrumb trail + BreadcrumbList JSON-LD (absolute URLs from NEXT_PUBLIC_SITE_URL).
 * Build the trail with buildBreadcrumbs() from config/site-structure.ts so labels never come from URLs.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-neutral-500">
        <ol className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
          {items.map((c, i) => {
            const last = i === items.length - 1;
            const long = c.label.length > MOBILE_MAX;
            return (
              <li key={c.path} className="flex items-center gap-1">
                {i > 0 && <span aria-hidden>/</span>}
                {last ? (
                  <span aria-current="page" className="text-neutral-700 dark:text-neutral-300">
                    {/* Long titles are shortened to 60 characters on mobile only */}
                    {long ? (
                      <>
                        <span className="sm:hidden">{c.label.slice(0, MOBILE_MAX).trimEnd()}…</span>
                        <span className="hidden sm:inline">{c.label}</span>
                      </>
                    ) : (
                      c.label
                    )}
                  </span>
                ) : (
                  <Link href={c.path} className="hover:text-brand-600 dark:hover:text-brand-400">
                    {c.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(items.map((c) => ({ name: c.label, path: c.path })))} />
    </>
  );
}
