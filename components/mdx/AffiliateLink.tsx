/** Every affiliate link on the site renders through this: sponsored + nofollow, new tab. */
export function AffiliateLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a href={href} target="_blank" rel="sponsored nofollow noopener" className={className}>
      {children}
    </a>
  );
}

export type AffiliateLinkData = { label: string; url: string; merchant?: string };

export function AffiliateButtons({ links, title = 'Where to buy' }: { links: AffiliateLinkData[]; title?: string }) {
  if (!links.length) return null;
  return (
    <section className="not-prose card p-5" aria-label={title}>
      <h2 className="mb-3 text-lg font-bold">{title}</h2>
      <div className="flex flex-wrap gap-3">
        {links.map((l) => (
          <AffiliateLink key={l.url} href={l.url} className="btn-primary">
            {l.label}
            {l.merchant && <span className="font-normal opacity-80">· {l.merchant}</span>}
            <span aria-hidden>↗</span>
          </AffiliateLink>
        ))}
      </div>
    </section>
  );
}
