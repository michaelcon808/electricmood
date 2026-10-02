import { Img } from '@/components/site/Img';
import { RatingBadge } from './RatingBadge';
import { AffiliateLink, type AffiliateLinkData } from './AffiliateLink';

/**
 * Product summary card for roundups and reviews.
 * <ProductBox name="Voltway S1" image="https://res.cloudinary.com/…" imageAlt="…" rating={4.2}
 *   bestFor="Short commutes" specs={[{label:"Range", value:"25 km"}]}
 *   links={[{label:"Check price", url:"https://…", merchant:"Amazon"}]}>
 *   One-paragraph summary in **Markdown**.
 * </ProductBox>
 */
export function ProductBox({
  name,
  image,
  imageAlt,
  rating,
  bestFor,
  specs = [],
  href,
  links = [],
  reviewHref,
  children,
}: {
  name: string;
  image?: string;
  imageAlt?: string;
  rating?: number;
  bestFor?: string;
  specs?: { label: string; value: string }[];
  /** Single affiliate URL — shorthand for links={[{ label: "Check price", url: href }]} */
  href?: string;
  links?: AffiliateLinkData[];
  /** Internal link to the full review. */
  reviewHref?: string;
  children?: React.ReactNode;
}) {
  const allLinks = href ? [{ label: 'Check price', url: href }, ...links] : links;
  return (
    <div className="not-prose card my-6 grid gap-5 p-5 sm:grid-cols-[180px_1fr]">
      {image ? (
        <Img src={image} alt={imageAlt ?? ''} width={360} height={270} sizes="180px" className="aspect-[4/3] w-full rounded-lg object-cover" />
      ) : (
        <div aria-hidden className="hidden aspect-[4/3] rounded-lg bg-gradient-to-br from-brand-500 to-emerald-900 sm:block" />
      )}
      <div>
        {bestFor && (
          <p className="mb-2 inline-block rounded-full bg-volt px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-neutral-900">
            Best for: {bestFor}
          </p>
        )}
        <div className="flex items-start justify-between gap-3">
          <p className="text-lg font-bold">{name}</p>
          {rating != null && <RatingBadge rating={rating} />}
        </div>
        {children && <div className="prose prose-sm prose-neutral mt-2 max-w-none dark:prose-invert">{children}</div>}
        {specs.length > 0 && (
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {specs.map((s) => (
              <div key={s.label} className="flex justify-between gap-2 border-b border-neutral-100 py-1 dark:border-neutral-800">
                <dt className="text-neutral-500">{s.label}</dt>
                <dd className="font-semibold">{s.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {(allLinks.length > 0 || reviewHref) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {allLinks.map((l) => (
              <AffiliateLink key={l.url} href={l.url} className="btn-primary">
                {l.label}
                {l.merchant && <span className="font-normal opacity-80">· {l.merchant}</span>}
                <span aria-hidden>↗</span>
              </AffiliateLink>
            ))}
            {reviewHref && (
              <a href={reviewHref} className="btn-secondary">
                Read review
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
