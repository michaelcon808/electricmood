import Link from 'next/link';
import { buildBreadcrumbs, getSilo, sectionHeading, sections } from '@/config/site-structure';
import { getFeaturedPosts, getPostsBySilo, getSectionPosts, summarize } from '@/lib/content';
import { paths } from '@/lib/site';
import { ACCENT } from './accents';
import { Breadcrumbs } from './Breadcrumbs';
import { SharedStrip } from './LinkBoxes';
import { PostGrid } from './PostCard';

export function SiloHub({ siloSlug }: { siloSlug: string }) {
  const silo = getSilo(siloSlug)!;
  const featured = getFeaturedPosts(silo.slug, 3).map(summarize);
  const total = getPostsBySilo(silo.slug).length;

  return (
    <div className="container-page py-12">
      <Breadcrumbs items={buildBreadcrumbs({ kind: 'silo', silo: silo.slug })} />

      <header className={`mb-10 rounded-2xl p-6 sm:p-8 ${ACCENT.silo.soft} ${ACCENT.silo.bar}`}>
        <p className={`text-sm font-semibold uppercase tracking-wide ${ACCENT.silo.text}`}>Silo hub</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">{silo.label}</h1>
        <p className="mt-3 max-w-2xl text-lg text-neutral-700 dark:text-neutral-300">{silo.description}</p>
        <p className="mt-2 text-sm text-neutral-500">
          {total} article{total === 1 ? '' : 's'}
        </p>
      </header>

      <section aria-label="Sections">
        <h2 className="mb-4 text-xl font-bold">Browse {silo.label.toLowerCase()}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {sections.map((section) => {
            const count = getSectionPosts(silo.slug, section.slug).length;
            return (
              <Link
                key={section.slug}
                href={paths.section(silo.slug, section.slug)}
                className={`card p-5 transition-colors ${ACCENT.section.bar} ${ACCENT.section.hover}`}
              >
                <p className={`text-lg font-bold ${ACCENT.section.text}`}>{sectionHeading(silo, section)}</p>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{section.description}</p>
                <p className="mt-3 text-sm font-semibold">
                  {count > 0 ? `${count} post${count === 1 ? '' : 's'}` : 'Coming soon'}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {featured.length > 0 && (
        <section aria-label="Start here" className="mt-14">
          <h2 className="mb-4 text-xl font-bold">Start here</h2>
          <PostGrid posts={featured} priorityFirst />
        </section>
      )}

      <SharedStrip />
    </div>
  );
}
