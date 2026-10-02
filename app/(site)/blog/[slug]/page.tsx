import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { POST_TYPE_LABELS } from '@/lib/constants';
import { getPostBySlug, getPosts, getRelatedPosts, summarize } from '@/lib/content';
import { blogPostingJsonLd, categoryLabel, faqJsonLd, postMetadata, reviewJsonLd, tagLabel } from '@/lib/seo';
import { paths } from '@/lib/site';
import { MdxContent } from '@/components/mdx/MdxContent';
import { AffiliateDisclosureBanner } from '@/components/mdx/AffiliateDisclosureBanner';
import { AffiliateButtons } from '@/components/mdx/AffiliateLink';
import { BestFor } from '@/components/mdx/BestFor';
import { FAQ } from '@/components/mdx/FAQ';
import { ProsCons } from '@/components/mdx/ProsCons';
import { RatingBadge } from '@/components/mdx/RatingBadge';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { FormattedDate } from '@/components/site/FormattedDate';
import { Img } from '@/components/site/Img';
import { JsonLd } from '@/components/site/JsonLd';
import { PostCard } from '@/components/site/PostCard';
import { TableOfContents } from '@/components/site/TableOfContents';

// Only slugs returned below exist; drafts/future posts are never generated.
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug((await params).slug);
  return post ? postMetadata(post) : {};
}

export default async function PostPage({ params }: Props) {
  const post = getPostBySlug((await params).slug);
  if (!post) notFound();

  const related = getRelatedPosts(post, 3).map(summarize);
  const isReview = post.postType === 'review';
  const bodyHasFaq = /<FAQ\b/.test(post.content);
  const bodyHasProsCons = /<ProsCons\b/.test(post.content);
  const showUpdated = post.updated && post.updatedISO.slice(0, 10) !== post.dateISO.slice(0, 10);

  return (
    <article className="container-page py-10">
      <JsonLd data={blogPostingJsonLd(post)} />
      <JsonLd data={reviewJsonLd(post)} />
      <JsonLd data={faqJsonLd(post.faqs)} />

      <div className="mx-auto max-w-3xl">
        <Breadcrumbs
          items={[
            { name: 'Blog', path: paths.blog },
            { name: categoryLabel(post.category), path: paths.category(post.category) },
            { name: post.title, path: paths.post(post.slug) },
          ]}
        />
      </div>

      {/* Pagefind indexes only what's inside data-pagefind-body */}
      <div data-pagefind-body>
        <header className="mx-auto mb-8 max-w-3xl">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
            <Link
              href={paths.category(post.category)}
              className="rounded-full bg-brand-100 px-3 py-0.5 font-semibold text-brand-700 dark:bg-brand-700/30 dark:text-brand-100"
              data-pagefind-filter="category"
            >
              {categoryLabel(post.category)}
            </Link>
            <span className="rounded-full bg-neutral-100 px-3 py-0.5 font-medium dark:bg-neutral-800" data-pagefind-filter="type">
              {POST_TYPE_LABELS[post.postType]}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl" data-pagefind-meta="title">
            {post.title}
          </h1>
          <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">{post.description}</p>
          <p className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-sm text-neutral-500" data-pagefind-ignore>
            <span>By {post.author}</span>
            <span>
              · <FormattedDate date={post.dateISO} />
            </span>
            {showUpdated && (
              <span>
                · Updated <FormattedDate date={post.updatedISO} />
              </span>
            )}
            <span>· {post.readingTime} min read</span>
          </p>
          {post.hasAffiliateLinks && (
            <div className="mt-6" data-pagefind-ignore>
              <AffiliateDisclosureBanner />
            </div>
          )}
        </header>

        <div className="mx-auto mb-10 aspect-[16/9] max-w-5xl overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800">
          <Img
            src={post.cover}
            alt={post.coverAlt}
            width={1024}
            height={576}
            sizes="(min-width: 1024px) 1024px, 100vw"
            priority
            className="h-full w-full object-cover"
          />
          <span hidden data-pagefind-meta={`image:${post.cover}`} />
          <span hidden data-pagefind-meta={`image_alt:${post.coverAlt}`} />
        </div>

        <div className="mx-auto max-w-3xl space-y-8">
          {isReview && (post.rating !== undefined || post.pros.length > 0) && (
            <section aria-label="Verdict" className="card space-y-4 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-neutral-500">Our verdict</p>
                  <p className="text-xl font-bold">{post.productName || post.title}</p>
                </div>
                {post.rating !== undefined && <RatingBadge rating={post.rating} size="lg" />}
              </div>
              <p className="text-sm">
                {post.testedHandsOn ? (
                  <span className="font-semibold text-brand-700 dark:text-brand-400">✓ Tested hands-on by our team</span>
                ) : (
                  <span className="text-neutral-500">
                    Researched review — based on specs, owner reports and expert sources, not a hands-on test.
                  </span>
                )}
              </p>
              {!bodyHasProsCons && <ProsCons pros={post.pros} cons={post.cons} />}
            </section>
          )}

          {post.bestFor && (
            <BestFor
              label={post.bestFor}
              product={post.productName || post.title}
              rating={post.rating}
              href={post.affiliateLinks[0]?.url}
              cta={post.affiliateLinks[0]?.label}
            />
          )}

          <TableOfContents items={post.toc} />

          <MdxContent post={post} />

          {isReview && <AffiliateButtons links={post.affiliateLinks} />}
          {!bodyHasFaq && <FAQ items={post.faqs} />}

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-neutral-200 pt-6 dark:border-neutral-800" data-pagefind-ignore>
              {post.tags.map((t) => (
                <Link
                  key={t}
                  href={paths.tag(t)}
                  className="rounded-full bg-neutral-100 px-3 py-1 text-sm hover:bg-brand-100 dark:bg-neutral-800 dark:hover:bg-brand-700/30"
                >
                  #{tagLabel(t)}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section aria-label="Related articles" className="mx-auto mt-16 max-w-6xl">
          <h2 className="mb-6 text-2xl font-bold">Keep reading</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
