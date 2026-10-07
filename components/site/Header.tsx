import Link from 'next/link';
import { SITE_NAME } from '@/lib/constants';
import { getNavData } from '@/lib/nav';
import { HeaderNav } from './HeaderNav';

export function Header() {
  return (
    // No backdrop-filter here: it would make the fixed mobile panel position against the header instead of the viewport.
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-extrabold tracking-tight">
          <span aria-hidden className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
            ⚡
          </span>
          {SITE_NAME}
        </Link>
        <HeaderNav data={getNavData()} />
      </div>
    </header>
  );
}
