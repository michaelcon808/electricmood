import { buildBreadcrumbs } from '@/config/site-structure';
import { Breadcrumbs } from './Breadcrumbs';

export function StaticPage({
  title,
  path,
  updated,
  children,
}: {
  title: string;
  path: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-3xl">
        <Breadcrumbs items={buildBreadcrumbs({ kind: 'page', label: title, path })} />
        <h1 className="mb-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
        {updated && <p className="mb-8 text-sm text-neutral-500">Last updated: {updated}</p>}
        <div className="prose prose-neutral max-w-none dark:prose-invert prose-a:text-brand-600 dark:prose-a:text-brand-400">
          {children}
        </div>
      </div>
    </div>
  );
}
