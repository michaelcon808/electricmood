import Link from 'next/link';
import { getPostByKey } from '@/lib/content';
import { ProductBox } from '@/components/mdx/ProductBox';
import { PostTypeBadge } from './PostTypeBadge';

/** Recommended-products box for tool pages, built from published posts ("silo/section/slug" keys). */
export function RecommendedProducts({ keys, title = 'Recommended products & guides' }: { keys: string[]; title?: string }) {
  // Unpublished/draft posts resolve to undefined and are skipped.
  const posts = keys.map(getPostByKey).filter((p) => p !== undefined);
  if (!posts.length) return null;

  return (
    <section aria-label={title} className="mt-12">
      <h2 className="mb-4 text-2xl font-bold">{title}</h2>
      {posts.map((p) =>
        p.postType === 'money' && p.affiliateLinks.length > 0 ? (
          <ProductBox
            key={p.key}
            name={p.productName || p.title}
            image={p.cover}
            imageAlt={p.coverAlt}
            rating={p.rating}
            bestFor={p.bestFor}
            links={p.affiliateLinks}
            reviewHref={p.path}
          >
            <p>{p.description}</p>
          </ProductBox>
        ) : (
          <Link key={p.key} href={p.path} className="card mb-3 block p-5 transition-colors hover:border-brand-500">
            <PostTypeBadge type={p.postType} />
            <p className="mt-2 font-bold">{p.title}</p>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{p.description}</p>
          </Link>
        ),
      )}
    </section>
  );
}
