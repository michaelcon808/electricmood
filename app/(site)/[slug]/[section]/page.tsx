import Link from 'next/link';
import type { Metadata } from 'next';
import { buildBreadcrumbs, getAllSiloSectionPairs, getSection, getSilo, sectionHeading } from '@/config/site-structure';
import { getSectionPosts } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';
import { paths } from '@/lib/site';
import { ACCENT } from '@/components/site/accents';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { FormattedDate } from '@/components/site/FormattedDate';
import { Img } from '@/components/site/Img';
import { PostTypeBadge } from '@/components/site/PostTypeBadge';

export const dynamicParams = false;

type Props = { params: Promise<{ slug: string; section: string }> };

export function generateStaticParams() {
  return getAllSiloSectionPairs().map(({ silo, section }) => ({ slug: silo.slug, section: section.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: siloSlug, section: sectionSlug } = await params;
  const silo = getSilo(siloSlug);
  const section = getSection(sectionSlug);
  if (!silo || !section) return {};
  const heading = sectionHeading(silo, section);
  return pageMetadata({
    title: heading,
    description: `${heading}: ${section.description}`,
    path: paths.section(silo.slug, section.slug),
    // An empty "Coming soon" hub is a thin page: keep it out of the index until it has posts.
    noindex: getSectionPosts(silo.slug, section.slug).length === 0,
  });
}

export default async function SectionHubPage({ params }: Props) {
  const { slug: siloSlug, section: sectionSlug } = await params;
  const silo = getSilo(siloSlug)!;
  const section = getSection(sectionSlug)!;
  const posts = getSectionPosts(silo.slug, section.slug); // EVERY published post in this section

  return (
    <div className="container-page py-12">
      <Breadcrumbs items={buildBreadcrumbs({ kind: 'section', silo: silo.slug, section: section.slug })} />

      <header className={`mb-10 rounded-2xl p-6 sm:p-8 ${ACCENT.section.soft} ${ACCENT.section.bar}`}>
        <p className={`text-sm font-semibold uppercase tracking-wide ${ACCENT.section.text}`}>
          <Link href={paths.silo(silo.slug)} className="hover:underline">
            {silo.label}
          </Link>{' '}
          · Section hub
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">{sectionHeading(silo, section)}</h1>
        <p className="mt-3 max-w-2xl text-lg text-neutral-700 dark:text-neutral-300">{section.description}</p>
      </header>

      {posts.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-xl font-bold">Coming soon</p>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            We’re working on {sectionHeading(silo, section).toLowerCase()}. In the meantime,{' '}
            <Link href={paths.silo(silo.slug)} className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
              browse all {silo.label.toLowerCase()}
            </Link>
            .
          </p>
        </div>
      ) : (
        <ul className="space-y-4" aria-label={`All ${sectionHeading(silo, section).toLowerCase()} posts`}>
          {posts.map((p, i) => (
            <li key={p.key}>
              <article className="card flex flex-col gap-4 p-4 transition-colors hover:border-teal-500 sm:flex-row">
                <Link href={p.path} className="block shrink-0 sm:w-56" tabIndex={-1} aria-hidden>
                  <Img
                    src={p.cover}
                    alt=""
                    width={448}
                    height={252}
                    sizes="(min-width: 640px) 224px, 100vw"
                    priority={i === 0}
                    className="aspect-[16/9] w-full rounded-lg object-cover"
                  />
                </Link>
                <div className="min-w-0">
                  <div className="mb-1.5 flex items-center gap-2">
                    <PostTypeBadge type={p.postType} />
                    <span className="text-xs text-neutral-500">
                      <FormattedDate date={p.dateISO} /> · {p.readingTime} min read
                    </span>
                  </div>
                  <h2 className="text-lg font-bold leading-snug">
                    <Link href={p.path} className="hover:text-brand-600 dark:hover:text-brand-400">
                      {p.title}
                    </Link>
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">{p.description}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
