import Link from 'next/link';
import { SITE_NAME } from '@/lib/constants';
import { paths } from '@/lib/site';

const nav = [
  { href: paths.blog, label: 'Blog' },
  { href: paths.category('e-scooters'), label: 'E-Scooters' },
  { href: paths.category('e-bikes'), label: 'E-Bikes' },
  { href: paths.tools, label: 'Tools' },
  { href: '/about/', label: 'About' },
];

const SearchIcon = () => (
  <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
          <span aria-hidden className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
            ⚡
          </span>
          {SITE_NAME}
        </Link>

        <div className="flex items-center gap-2 sm:gap-6">
          <nav aria-label="Main" className="hidden gap-6 text-sm font-medium md:flex">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-brand-600 dark:hover:text-brand-400">
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href={paths.search}
            aria-label="Search"
            className="rounded-lg p-2 hover:bg-neutral-100 hover:text-brand-600 dark:hover:bg-neutral-800"
          >
            <SearchIcon />
          </Link>

          {/* Mobile menu: native <details>, no client JS */}
          <details className="relative md:hidden">
            <summary className="cursor-pointer list-none rounded-lg border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700">
              Menu
            </summary>
            <nav
              aria-label="Mobile"
              className="absolute right-0 mt-2 flex w-48 flex-col rounded-lg border border-neutral-200 bg-white p-2 shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
            >
              {nav.map((item) => (
                <Link key={item.href} href={item.href} className="rounded px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  {item.label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
