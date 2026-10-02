import type { Metadata } from 'next';
import { getPosts, paginate, summarize } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';
import { paths } from '@/lib/site';
import { PostGrid } from '@/components/site/PostCard';
import { Pagination } from '@/components/site/Pagination';
import { PageHeader } from '@/components/site/PageHeader';

export const dynamicParams = false;

type Props = { params: Promise<{ page: string }> };

export function generateStaticParams() {
  const { pages } = paginate(getPosts(), 1);
  // Static export needs at least one param. Page 1 is built too, but it's canonicalised
  // to /blog/ and 301-redirected there via public/_redirects.
  return Array.from({ length: pages }, (_, i) => ({ page: String(i + 1) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = Number((await params).page);
  if (page === 1) {
    return { ...pageMetadata({ title: 'All articles', description: 'All ElectricMood articles.', path: paths.blog }), robots: { index: false } };
  }
  return pageMetadata({
    title: `All articles – page ${page}`,
    description: `ElectricMood reviews, buying guides and explainers for e-scooters and e-bikes — page ${page}.`,
    path: paths.blogPage(page),
  });
}

export default async function BlogPaginatedPage({ params }: Props) {
  const { items, page, pages } = paginate(getPosts(), Number((await params).page));
  return (
    <div className="container-page py-12">
      <PageHeader title="All articles" description={`Page ${page} of ${pages}`} />
      <PostGrid posts={items.map(summarize)} />
      <Pagination page={page} pages={pages} href={paths.blogPage} />
    </div>
  );
}
