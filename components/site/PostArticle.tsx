import Link from 'next/link';
import { buildBreadcrumbs, getSection, getSilo } from '@/config/site-structure';
import type { Post } from '@/lib/content';
import { getInfoPostsFor, getMoneyPost, getParallelPosts, getSiblingPicks } from '@/lib/links';
import { isPlaceholderImage } from '@/lib/cloudinary';
import { paths } from '@/lib/site';
import { blogPostingJsonLd, faqJsonLd, reviewJsonLd } from '@/lib/seo';
import { AffiliateDisclosureBanner } from '@/components/mdx/AffiliateDisclosureBanner';
import { AffiliateButtons } from '@/components/mdx/AffiliateLink';
import { BestFor } from '@/components/mdx/BestFor';
import { FAQ } from '@/components/mdx/FAQ';
import { MdxContent } from '@/components/mdx/MdxContent';
import { ProsCons } from '@/components/mdx/ProsCons';
import { RatingBadge } from '@/components/mdx/RatingBadge';
import { Breadcrumbs } from './Breadcrumbs';
import { FormattedDate } from './FormattedDate';
import { Img } from './Img';
import { JsonLd } from './JsonLd';
import { BackToHub, LearnMoreBox, MoneyCallout, ParallelBoxes, SiblingsBox, ToolCta } from './LinkBoxes';
import { PostTypeBadge } from './PostTypeBadge';
import { TableOfContents } from './TableOfContents';
import { ACCENT } from './accents';


/**
 * The full post article: header, verdict, MDX body and every automatic internal-link box.
 * Used by the real post page and by the studio preview, so the preview matches the live page.
 */
export async function PostArticle({ post }: { post: Post }) {
  const silo = getSilo(post.silo)!;
  const section = getSection(post.section)!;
  const money = getMoneyPost(post); // info → money
  const infoPosts = getInfoPostsFor(post); // money → info ("Learn more")
  const siblings = getSiblingPicks(post, 3);
  const parallel = getParallelPosts(post);
  const isMoney = post.postType === 'money';
  const bodyHasFaq = /<FAQ\b/.test(post.content);
  const bodyHasProsCons = /<ProsCons\b/.test(post.content);
  const showUpdated = Boolean(post.updated); // rule: show the updated date whenever the post has one
  const hasCover = !isPlaceholderImage(post.cover); // "CLOUDINARY_URL_HERE" -> no hero image instead of a broken one
  const faqs = post.faqs.length ? post.faqs : post.bodyFaqs; // FAQPage from frontmatter, else from the body's FAQ section

  return (
    <article className="container-page py-10">
      <JsonLd data={blogPostingJsonLd(post)} />
      <JsonLd data={reviewJsonLd(post)} />
      <JsonLd data={faqJsonLd(faqs)} />

      <div className="mx-auto max-w-3xl">
        <Breadcrumbs items={buildBreadcrumbs({ kind: 'post', silo: post.silo, section: post.section, title: post.title, slug: post.slug })} />
        <BackToHub post={post} />
      </div>

      {/* Pagefind indexes only what's inside data-pagefind-body */}
      <div data-pagefind-body>
        <header className="mx-auto mb-8 max-w-3xl">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
            <PostTypeBadge type={post.postType} />
            <Link
              href={paths.silo(silo.slug)}
              className={`rounded-full px-3 py-0.5 font-semibold ${ACCENT.silo.badge}`}
              data-pagefind-filter="silo"
            >
              {silo.label}
            </Link>
            <Link
              href={paths.section(silo.slug, section.slug)}
              className={`rounded-full px-3 py-0.5 font-semibold ${ACCENT.section.badge}`}
              data-pagefind-filter="section"
            >
              {section.contentLabel}
            </Link>
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

        {hasCover && (
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
          </div>
        )}

        <div className="mx-auto max-w-3xl space-y-8">
          {/* Info → Money: highlighted callout right after the intro */}
          {money && (
            <div data-pagefind-ignore>
              <MoneyCallout money={money} />
            </div>
          )}

          {isMoney && (post.rating !== undefined || post.pros.length > 0) && (
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

          {isMoney && <AffiliateButtons links={post.affiliateLinks} />}
          {!bodyHasFaq && <FAQ items={post.faqs} />}
        </div>
      </div>

      {/* Automatic internal links */}
      <div className="mx-auto mt-12 max-w-3xl space-y-6" data-pagefind-ignore>
        {post.tool && <ToolCta slug={post.tool} />}
        <LearnMoreBox posts={infoPosts} />
        <SiblingsBox post={post} picks={siblings} />
        <ParallelBoxes posts={parallel} />
        <BackToHub post={post} />
      </div>
    </article>
  );
}
