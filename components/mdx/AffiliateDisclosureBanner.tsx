import Link from 'next/link';

export function AffiliateDisclosureBanner() {
  return (
    <aside
      role="note"
      className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-900/10 dark:text-amber-200"
    >
      <strong>Disclosure:</strong> This article contains affiliate links. If you buy through them we may earn a commission
      at no extra cost to you. It never affects our verdicts.{' '}
      <Link href="/affiliate-disclosure/" className="underline">
        Learn more
      </Link>
      .
    </aside>
  );
}
