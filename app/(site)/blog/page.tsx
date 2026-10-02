import type { Metadata } from 'next';
import { getPosts, paginate, summarize } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';
import { paths } from '@/lib/site';
import { PostGrid } from '@/components/site/PostCard';
import { Pagination } from '@/components/site/Pagination';
import { PageHeader } from '@/components/site/PageHeader';

export const metadata: Metadata = pageMetadata({
  title: 'All articles',
  description: 'Every ElectricMood review, buying guide, comparison and explainer for e-scooters, e-bikes and portable power.',
  path: paths.blog,
});

export default function BlogPage() {
  const { items, pages } = paginate(getPosts(), 1);
  return (
    <div className="container-page py-12">
      <PageHeader title="All articles" description="Reviews, buying guides, comparisons and explainers — newest first." />
      <PostGrid posts={items.map(summarize)} priorityFirst />
      <Pagination page={1} pages={pages} href={paths.blogPage} />
    </div>
  );
}
