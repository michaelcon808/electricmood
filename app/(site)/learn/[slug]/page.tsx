import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildBreadcrumbs } from '@/config/site-structure';
import { getLearnPage, getLearnPages } from '@/lib/content';
import { absoluteUrl } from '@/lib/site';
import { pageMetadata } from '@/lib/seo';
import { MdxContent } from '@/components/mdx/MdxContent';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { FormattedDate } from '@/components/site/FormattedDate';
import { JsonLd } from '@/components/site/JsonLd';
import { SharedStrip } from '@/components/site/LinkBoxes';
import { TableOfContents } from '@/components/site/TableOfContents';
import { SITE_NAME } from '@/lib/constants';

export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getLearnPages().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = getLearnPage((await params).slug);
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
  const page = getLearnPage((await params).slug);
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
