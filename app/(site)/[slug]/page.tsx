import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSilo, silos } from '@/config/site-structure';
import { getPostForPage, getPostSlugsForPages, isPublished } from '@/lib/content';
import { pageMetadata, postMetadata } from '@/lib/seo';
import { paths } from '@/lib/site';
import { PostArticle } from '@/components/site/PostArticle';
import { SiloHub } from '@/components/site/SiloHub';

// Posts live at the site root (/{slug}/), next to the three silo hubs (/electric-scooters/ ...).
// Only slugs listed below exist. Drafts and future-dated posts are generated in `npm run dev` only (for preview),
// never in a production build.
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return [...silos.map((s) => ({ slug: s.slug })), ...getPostSlugsForPages().map((slug) => ({ slug }))];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const silo = getSilo(slug);
  if (silo) {
    return pageMetadata({
      title: `${silo.label}: reviews, accessories and guides`,
      description: silo.description,
      path: paths.silo(silo.slug),
    });
  }
  const post = getPostForPage(slug);
  return post ? postMetadata(post) : {};
}

export default async function RootSlugPage({ params }: Props) {
  const { slug } = await params;
  if (getSilo(slug)) return <SiloHub siloSlug={slug} />;
  const post = getPostForPage(slug);
  if (!post) notFound();
  const unpublished = !isPublished(post);
  return (
    <>
      {unpublished && (
        <div role="status" className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
          <strong>{post.draft ? 'Draft preview' : `Scheduled for ${post.dateISO.slice(0, 10)}`}</strong> — visible only in <code>npm run dev</code>.
          It is not in lists, hubs, the sitemap, RSS or search, and it is not built for production.
        </div>
      )}
      <PostArticle post={post} />
    </>
  );
}
