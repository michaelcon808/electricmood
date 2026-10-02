import { RatingBadge } from './RatingBadge';
import { AffiliateLink } from './AffiliateLink';

/** "Best for" pick card. Use one per pick in roundups: <BestFor label="Commuters" product="X1" href="…" /> */
export function BestFor({
  label,
  product,
  reason,
  rating,
  href,
  cta = 'Check price',
}: {
  label: string;
  product: string;
  reason?: string;
  rating?: number;
  /** Affiliate URL (rendered sponsored/nofollow). */
  href?: string;
  cta?: string;
}) {
  return (
    <div className="not-prose my-6 rounded-xl border-2 border-brand-500 bg-white p-5 dark:bg-neutral-900">
      <p className="inline-block rounded-full bg-volt px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-neutral-900">
        Best for: {label}
      </p>
      <div className="mt-3 flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-bold">{product}</p>
          {reason && <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{reason}</p>}
        </div>
        {rating != null && <RatingBadge rating={rating} />}
      </div>
      {href && (
        <AffiliateLink href={href} className="btn-primary mt-4">
          {cta} <span aria-hidden>↗</span>
        </AffiliateLink>
      )}
    </div>
  );
}
