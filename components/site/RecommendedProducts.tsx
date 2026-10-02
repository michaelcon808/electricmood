import Link from 'next/link';
import { getPostBySlug } from '@/lib/content';
import { paths } from '@/lib/site';
import { ProductBox } from '@/components/mdx/ProductBox';

/** Recommended-products box for tool pages, built from published posts (reviews become product boxes). */
export function RecommendedProducts({ slugs, title = 'Recommended products & guides' }: { slugs: string[]; title?: string }) {
  // Unpublished/draft slugs resolve to undefined and are skipped.
  const posts = slugs.map(getPostBySlug).filter((p) => p !== undefined);
  if (!posts.length) return null;

  return (
    <section aria-label={title} className="mt-12">
      <h2 className="mb-4 text-2xl font-bold">{title}</h2>
      {posts.map((p) =>
        p.postType === 'review' ? (
          <ProductBox
            key={p.slug}
            name={p.productName || p.title}
            image={p.cover}
            imageAlt={p.coverAlt}
            rating={p.rating}
            bestFor={p.bestFor}
            links={p.affiliateLinks}
            reviewHref={paths.post(p.slug)}
          >
            <p>{p.description}</p>
          </ProductBox>
        ) : (
          <Link key={p.slug} href={paths.post(p.slug)} className="card mb-3 block p-5 transition-colors hover:border-brand-500">
            <p className="font-bold">{p.title}</p>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{p.description}</p>
          </Link>
        ),
      )}
    </section>
  );
}
