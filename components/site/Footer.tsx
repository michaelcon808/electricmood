import Link from 'next/link';
import { shared, silos } from '@/config/site-structure';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/constants';
import { paths } from '@/lib/site';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-neutral-200 py-10 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
      <div className="container-page grid gap-8 sm:grid-cols-4">
        <div className="sm:col-span-1">
          <p className="font-bold text-neutral-900 dark:text-neutral-100">⚡ {SITE_NAME}</p>
          <p className="mt-2 max-w-sm">{SITE_TAGLINE}</p>
        </div>
        <nav aria-label="Topics" className="flex flex-col gap-2">
          {silos.map((s) => (
            <Link key={s.slug} href={paths.silo(s.slug)}>
              {s.label}
            </Link>
          ))}
        </nav>
        <nav aria-label="Shared" className="flex flex-col gap-2">
          {shared.map((s) => (
            <Link key={s.slug} href={s.path}>
              {s.label}
            </Link>
          ))}
          <a href="/feed.xml">RSS feed</a>
        </nav>
        <nav aria-label="About" className="flex flex-col gap-2">
          <Link href="/about/">About</Link>
          <Link href="/contact/">Contact</Link>
          <Link href="/affiliate-disclosure/">Affiliate disclosure</Link>
          <Link href="/privacy-policy/">Privacy policy</Link>
        </nav>
      </div>
      <div className="container-page mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <a
          href="https://circlesaasboard.com/startup/electricmood-e8da82"
          target="_blank"
          rel="noopener"
          className="shrink-0 self-start opacity-90 transition-opacity hover:opacity-100 sm:self-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://circlesaasboard.com/badge.svg"
            alt="Featured on CircleSaaS"
            width={220}
            height={84}
            loading="lazy"
            className="h-auto w-[180px]"
          />
        </a>
        <div>
          <p>
            © {new Date().getFullYear()} {SITE_NAME}. As an Amazon Associate I earn from qualifying purchases. We may also
            earn a commission when you buy through other links on this site, at no extra cost to you.{' '}
            <Link href="/affiliate-disclosure/" className="underline hover:text-brand-600 dark:hover:text-brand-400">
              Affiliate disclosure
            </Link>
          </p>
          <p className="mt-1">{SITE_TAGLINE}</p>
        </div>
      </div>
    </footer>
  );
}
