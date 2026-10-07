import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildBreadcrumbs } from '@/config/site-structure';
import { getLearnPage, getLearnPages } from '@/lib/content';
import { absoluteUrl, paths } from '@/lib/site';
import { pageMetadata } from '@/lib/seo';
import { MdxContent } from '@/components/mdx/MdxContent';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { LearnIndex } from '@/components/site/LearnIndex';
import { FormattedDate } from '@/components/site/FormattedDate';
import { JsonLd } from '@/components/site/JsonLd';
import { SharedStrip } from '@/components/site/LinkBoxes';
import { TableOfContents } from '@/components/site/TableOfContents';
import { SITE_NAME } from '@/lib/constants';

export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

/**
 * Static export needs at least one page for this dynamic route. While there are no published Learn articles,
 * a single stand-in page is generated: it shows the same "Coming soon" index, is `noindex`, points its canonical at
 * /learn/, and is never linked or listed in the sitemap.
 */
const STAND_IN = 'coming-soon';

export function generateStaticParams() {
  const pages = getLearnPages();
  return pages.length ? pages.map((p) => ({ slug: p.slug })) : [{ slug: STAND_IN }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  const page = getLearnPage(slug);
  if (!page && slug === STAND_IN && getLearnPages().length === 0) {
    return pageMetadata({
      title: 'Learn: battery safety, rules and travel',
      description: 'Shared guides for every electric ride: battery safety, the rules where you ride, and how to travel with scooters, bikes and boards.',
      path: paths.learn,
      noindex: true,
    });
  }
  if (!page) return {};
  return pageMetadata({
    title: page.title,
    description: page.description,
    path: page.path,
    image: page.cover && page.coverAlt ? { url: page.cover, alt: page.coverAlt } : undefined,
    type: 'article',
  });
}

export default async function LearnArticlePage({ params }: Props) {
  const slug = (await params).slug;
  const page = getLearnPage(slug);
  if (!page && slug === STAND_IN && getLearnPages().length === 0) return <LearnIndex />;
  if (!page) notFound();

  return (
    <article className="container-page py-10">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: page.title,
          description: page.description,
          url: absoluteUrl(page.path),
          datePublished: page.dateISO,
          dateModified: page.updatedISO,
          author: { '@type': 'Organization', name: page.author },
          publisher: { '@type': 'Organization', name: SITE_NAME },
        }}
      />
      <div className="mx-auto max-w-3xl" data-pagefind-body>
        <Breadcrumbs items={buildBreadcrumbs({ kind: 'shared', shared: 'learn', item: { title: page.title, slug: page.slug } })} />
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500" data-pagefind-filter="type:Learn">
            Learn
          </p>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl" data-pagefind-meta="title">
            {page.title}
          </h1>
          <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">{page.description}</p>
          <p className="mt-4 text-sm text-neutral-500" data-pagefind-ignore>
            By {page.author} · <FormattedDate date={page.dateISO} /> · {page.readingTime} min read
          </p>
        </header>
        <div className="space-y-8">
          <TableOfContents items={page.toc} />
          <MdxContent post={page} />
        </div>
      </div>
      <div className="mx-auto max-w-3xl" data-pagefind-ignore>
        <SharedStrip />
      </div>
    </article>
  );
}
