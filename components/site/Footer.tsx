import Link from 'next/link';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/constants';
import { paths } from '@/lib/site';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-neutral-200 py-10 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
      <div className="container-page grid gap-8 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <p className="font-bold text-neutral-900 dark:text-neutral-100">⚡ {SITE_NAME}</p>
          <p className="mt-2 max-w-sm">{SITE_TAGLINE}</p>
        </div>
        <nav aria-label="Topics" className="flex flex-col gap-2">
          <Link href={paths.blog}>All articles</Link>
          <Link href={paths.category('e-scooters')}>E-Scooters</Link>
          <Link href={paths.category('e-bikes')}>E-Bikes</Link>
          <Link href={paths.tools}>Free tools</Link>
          <a href="/feed.xml">RSS feed</a>
        </nav>
        <nav aria-label="About" className="flex flex-col gap-2">
          <Link href="/about/">About</Link>
          <Link href="/contact/">Contact</Link>
          <Link href="/affiliate-disclosure/">Affiliate disclosure</Link>
          <Link href="/privacy-policy/">Privacy policy</Link>
        </nav>
      </div>
      <div className="container-page mt-8">
        <p>
          © {new Date().getFullYear()} {SITE_NAME}. We may earn a commission from links on this site.
        </p>
        <p className="mt-1">{SITE_TAGLINE}</p>
      </div>
    </footer>
  );
}
