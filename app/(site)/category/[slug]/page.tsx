import type { Metadata } from 'next';
import { getCategories, getPostsByCategory, summarize } from '@/lib/content';
import { categoryLabel, pageMetadata } from '@/lib/seo';
import { paths } from '@/lib/site';
import { PostGrid } from '@/components/site/PostCard';
import { PageHeader } from '@/components/site/PageHeader';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';

export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getCategories().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const label = categoryLabel(slug);
  return pageMetadata({
    title: `${label} reviews, guides & comparisons`,
    description: `Every ElectricMood article about ${label.toLowerCase()}: hands-on reviews, buying guides, comparisons and explainers.`,
    path: paths.category(slug),
  });
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const posts = getPostsByCategory(slug);
  const label = categoryLabel(slug);

  return (
    <div className="container-page py-12">
      <Breadcrumbs items={[{ name: label, path: paths.category(slug) }]} />
      <PageHeader eyebrow="Category" title={label} description={`${posts.length} article${posts.length === 1 ? '' : 's'}.`} />
      <PostGrid posts={posts.map(summarize)} priorityFirst />
    </div>
  );
}
