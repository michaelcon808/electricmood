import Link from 'next/link';
import { buildBreadcrumbs } from '@/config/site-structure';
import { getLearnPages } from '@/lib/content';
import { Breadcrumbs } from './Breadcrumbs';
import { FormattedDate } from './FormattedDate';
import { PageHeader } from './PageHeader';

export function LearnIndex() {
  const pages = getLearnPages();
  return (
    <div className="container-page py-12">
      <Breadcrumbs items={buildBreadcrumbs({ kind: 'shared', shared: 'learn' })} />
      <PageHeader
        eyebrow="Shared across all silos"
        title="Learn"
        description="Battery safety, rules and travel — advice that applies to scooters, bikes and skateboards alike."
      />
      {pages.length === 0 ? (
        <p className="card p-8 text-center text-neutral-500">Coming soon.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {pages.map((p) => (
            <li key={p.slug}>
              <Link href={p.path} className="card block h-full p-5 transition-colors hover:border-brand-500">
                <p className="text-lg font-bold">{p.title}</p>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{p.description}</p>
                <p className="mt-3 text-xs text-neutral-500">
                  <FormattedDate date={p.dateISO} /> · {p.readingTime} min read
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
