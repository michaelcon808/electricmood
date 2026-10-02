import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/constants';
import { getCategories, getPosts, summarize } from '@/lib/content';
import { categoryLabel, pageMetadata } from '@/lib/seo';
import { absoluteUrl, paths } from '@/lib/site';
import { TOOLS } from '@/lib/tools';
import { PostGrid } from '@/components/site/PostCard';
import { JsonLd } from '@/components/site/JsonLd';

export const metadata: Metadata = pageMetadata({
  title: `${SITE_NAME} – E-Scooter & E-Bike Reviews, Guides and Calculators`,
  absoluteTitle: true,
  description: SITE_TAGLINE,
  path: '/',
});

export default function HomePage() {
  const posts = getPosts().slice(0, 9).map(summarize);
  const categories = getCategories();

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: SITE_NAME,
          url: absoluteUrl('/'),
          description: SITE_TAGLINE,
        }}
      />
      <section className="border-b border-neutral-200 bg-gradient-to-b from-brand-50 to-white dark:border-neutral-800 dark:from-brand-700/10 dark:to-neutral-950">
        <div className="container-page py-16 sm:py-24">
          <p className="mb-3 inline-block rounded-full bg-volt px-3 py-1 text-xs font-bold uppercase tracking-wide text-neutral-900">
            Electric rides, explained
          </p>
          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            Find the right e-scooter or e-bike — without the hype.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">{SITE_TAGLINE}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={paths.category('e-scooters')} className="btn-primary">
              E-Scooters
            </Link>
            <Link href={paths.category('e-bikes')} className="btn-secondary">
              E-Bikes
            </Link>
            <Link href={paths.tools} className="btn-secondary">
              Free calculators
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold">Latest articles</h2>
          <Link href={paths.blog} className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
            View all →
          </Link>
        </div>
        <PostGrid posts={posts} priorityFirst />
      </section>

      <section className="container-page pb-14">
        <h2 className="mb-6 text-2xl font-bold">Free calculators</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {TOOLS.map((t) => (
            <Link key={t.slug} href={paths.tool(t.slug)} className="card p-5 transition-colors hover:border-brand-500">
              <p className="text-2xl" aria-hidden>
                {t.icon}
              </p>
              <p className="mt-2 font-bold">{t.name}</p>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{t.short}</p>
            </Link>
          ))}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="container-page">
          <h2 className="mb-6 text-2xl font-bold">Browse by category</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <Link key={c.slug} href={paths.category(c.slug)} className="card p-5 transition-colors hover:border-brand-500">
                <p className="font-bold">{categoryLabel(c.slug)}</p>
                <p className="text-sm text-neutral-500">
                  {c.count} article{c.count === 1 ? '' : 's'}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
