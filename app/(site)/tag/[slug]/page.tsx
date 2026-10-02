import type { Metadata } from 'next';
import { MIN_POSTS_TO_INDEX_TAG } from '@/lib/constants';
import { getPostsByTag, getTags, summarize } from '@/lib/content';
import { pageMetadata, tagLabel } from '@/lib/seo';
import { paths } from '@/lib/site';
import { PostGrid } from '@/components/site/PostCard';
import { PageHeader } from '@/components/site/PageHeader';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';

export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getTags().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const label = tagLabel(slug);
  return pageMetadata({
    title: `${label} articles`,
    description: `ElectricMood articles tagged ${label}: reviews, guides and explainers about e-scooters, e-bikes and portable power.`,
    path: paths.tag(slug),
    // Thin tag pages stay out of the index until they have enough posts.
    noindex: getPostsByTag(slug).length < MIN_POSTS_TO_INDEX_TAG,
  });
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params;
  const posts = getPostsByTag(slug);
  const label = tagLabel(slug);

  return (
    <div className="container-page py-12">
      <Breadcrumbs items={[{ name: `#${label}`, path: paths.tag(slug) }]} />
      <PageHeader eyebrow="Tag" title={`#${label}`} description={`${posts.length} article${posts.length === 1 ? '' : 's'}.`} />
      <PostGrid posts={posts.map(summarize)} priorityFirst />
    </div>
  );
}
