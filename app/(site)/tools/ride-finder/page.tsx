import { ToolPage, toolMetadata } from '@/components/tools/ToolPage';
import RideFinder from '@/components/tools/RideFinder';
import { getPosts } from '@/lib/content';

const SLUG = 'ride-finder';

export const metadata = toolMetadata(SLUG);

export default function Page() {
  // Only published review posts are offered, so the finder never links to a missing page.
  const posts = getPosts()
    .filter((p) => p.postType === 'money')
    .map((p) => ({ slug: p.slug, title: p.title, path: p.path, description: p.description }));
  return (
    <ToolPage slug={SLUG}>
      <RideFinder posts={posts} />
    </ToolPage>
  );
}
