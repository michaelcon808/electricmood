'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { NavData } from '@/lib/nav';

const OPEN_DELAY = 80; // ms before a hover opens a panel
const CLOSE_DELAY = 150; // ms before leaving closes it, so the pointer can reach the panel

const Chevron = ({ open }: { open: boolean }) => (
  <svg aria-hidden width="12" height="12" viewBox="0 0 12 12" className={`transition-transform ${open ? 'rotate-180' : ''}`}>
    <path d="m2 4 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SearchIcon = () => (
  <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

/**
 * Primary menu, rendered entirely from config/site-structure.ts (via lib/nav.ts).
 * Desktop (>= lg): silo links with hover/focus mega-panels. Mobile: hamburger + accordions.
 * Panels are always in the server-rendered HTML (just `hidden`), so every link is crawlable.
 */
export function HeaderNav({ data }: { data: NavData }) {
  const pathname = usePathname();
  const activeSilo = data.silos.find((s) => pathname.startsWith(s.path))?.slug ?? null;

  const [openSilo, setOpenSilo] = useState<string | null>(null);
  const openTimer = useRef<number | undefined>(undefined);
  const closeTimer = useRef<number | undefined>(undefined);
  const suppressFocusOpen = useRef(false);
  const listRef = useRef<HTMLUListElement>(null);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSilo, setMobileSilo] = useState<string | null>(activeSilo);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);

  // Close everything on navigation.
  useEffect(() => {
    setOpenSilo(null);
    setMobileOpen(false);
    setMobileSilo(activeSilo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Close desktop panel on outside click.
  useEffect(() => {
    if (!openSilo) return;
    const onDown = (e: MouseEvent) => {
      if (!listRef.current?.contains(e.target as Node)) setOpenSilo(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [openSilo]);

  // Mobile: Escape closes, Tab is trapped inside the panel (plus the toggle), body scroll locked.
  useEffect(() => {
    if (!mobileOpen) return;
    const panel = mobilePanelRef.current;
    if (!panel) return;
    const focusables = () =>
      [mobileToggleRef.current, ...panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')].filter(
        (el): el is HTMLElement => !!el && el.offsetParent !== null,
      );
    panel.querySelector<HTMLElement>('a[href], button')?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        mobileToggleRef.current?.focus();
        return;
      }
      if (e.key !== 'Tab') return;
      const els = focusables();
      if (!els.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileOpen]);

  const clearTimers = () => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
  };
  const scheduleOpen = (slug: string) => {
    clearTimers();
    openTimer.current = window.setTimeout(() => setOpenSilo(slug), OPEN_DELAY);
  };
  const scheduleClose = () => {
    clearTimers();
    closeTimer.current = window.setTimeout(() => setOpenSilo(null), CLOSE_DELAY);
  };

  function onKeyDown(e: React.KeyboardEvent<HTMLLIElement>, slug: string) {
    const li = e.currentTarget;
    const target = e.target as HTMLElement;
    const panel = li.querySelector<HTMLElement>('[data-nav-panel]');

    if (e.key === 'Escape' && openSilo === slug) {
      e.preventDefault();
      setOpenSilo(null);
      suppressFocusOpen.current = true;
      li.querySelector<HTMLElement>('[data-nav-trigger]')?.focus();
      return;
    }

    if (target.closest('[data-nav-panel]')) {
      const items = Array.from(panel?.querySelectorAll<HTMLElement>('a[href]') ?? []);
      const i = items.indexOf(target);
      const move = (n: number) => {
        e.preventDefault();
        items[(n + items.length) % items.length]?.focus();
      };
      if (e.key === 'ArrowDown') move(i + 1);
      else if (e.key === 'ArrowUp') move(i - 1);
      else if (e.key === 'Home') move(0);
      else if (e.key === 'End') move(items.length - 1);
      return;
    }

    if (e.key === 'ArrowDown' && target.hasAttribute('data-nav-trigger')) {
      e.preventDefault();
      const focusFirst = () => panel?.querySelector<HTMLElement>('a[href]')?.focus();
      if (panel && !panel.hidden) focusFirst(); // already open (e.g. via keyboard focus): move in immediately
      else {
        setOpenSilo(slug);
        requestAnimationFrame(focusFirst); // wait for the panel to un-hide
      }
      return;
    }

    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const tops = Array.from(listRef.current?.querySelectorAll<HTMLElement>('[data-nav-top]') ?? []);
      const current = li.querySelector<HTMLElement>('[data-nav-top]');
      const i = current ? tops.indexOf(current) : -1;
      if (i === -1) return;
      e.preventDefault();
      tops[(i + (e.key === 'ArrowRight' ? 1 : -1) + tops.length) % tops.length]?.focus();
    }
  }

  const topLink = (active: boolean) =>
    `rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-violet-700 dark:hover:text-violet-300 ${
      active ? 'text-violet-700 dark:text-violet-300' : ''
    }`;

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {/* ---------------- Desktop ---------------- */}
      <nav aria-label="Main" className="hidden lg:block">
        <ul ref={listRef} className="flex items-center">
          {data.silos.map((silo) => {
            const open = openSilo === silo.slug;
            const active = activeSilo === silo.slug;
            const panelId = `nav-panel-${silo.slug}`;
            return (
              <li
                key={silo.slug}
                onMouseEnter={() => scheduleOpen(silo.slug)}
                onMouseLeave={scheduleClose}
                onFocus={(e) => {
                  // Keyboard focus opens the panel (focus-within); mouse clicks don't, so the chevron can toggle.
                  if (suppressFocusOpen.current) {
                    suppressFocusOpen.current = false;
                    return;
                  }
                  if ((e.target as HTMLElement).matches(':focus-visible')) {
                    clearTimers();
                    setOpenSilo(silo.slug);
                  }
                }}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                    setOpenSilo((cur) => (cur === silo.slug ? null : cur));
                  }
                }}
                onKeyDown={(e) => onKeyDown(e, silo.slug)}
              >
                <div className="flex items-center">
                  <Link
                    href={silo.path}
                    data-nav-top
                    aria-current={pathname === silo.path ? 'page' : undefined}
                    className={`${topLink(active)} pr-1 ${active ? 'underline decoration-violet-500 decoration-2 underline-offset-8' : ''}`}
                  >
                    {silo.label}
                  </Link>
                  <button
                    type="button"
                    data-nav-trigger
                    aria-haspopup="true"
                    aria-expanded={open}
                    aria-controls={panelId}
                    aria-label={`${silo.label} sections`}
                    onClick={() => setOpenSilo(open ? null : silo.slug)}
                    className="rounded-md px-1.5 py-2 text-neutral-500 hover:text-violet-700 dark:hover:text-violet-300"
                  >
                    <Chevron open={open} />
                  </button>
                </div>

                {/* Full-width panel, positioned against the sticky header */}
                <div
                  id={panelId}
                  data-nav-panel
                  hidden={!open}
                  className="absolute inset-x-0 top-full border-b border-t border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-950"
                >
                  <div className="container-page py-6">
                    <Link
                      href={silo.path}
                      onClick={() => setOpenSilo(null)}
                      className="mb-5 inline-flex items-center gap-1 rounded-md bg-violet-50 px-3 py-1.5 text-sm font-semibold text-violet-800 hover:bg-violet-100 dark:bg-violet-900/30 dark:text-violet-200 dark:hover:bg-violet-900/50"
                    >
                      All {silo.label} <span aria-hidden>→</span>
                    </Link>
                    <div className="grid grid-cols-3 gap-8">
                      {silo.sections.map((section) => {
                        const sectionActive = pathname.startsWith(section.path);
                        return (
                          <div key={section.slug}>
                            <Link
                              href={section.path}
                              onClick={() => setOpenSilo(null)}
                              aria-current={pathname === section.path ? 'page' : undefined}
                              className={`block text-base font-bold text-teal-700 hover:text-teal-900 dark:text-teal-300 dark:hover:text-teal-100 ${
                                sectionActive ? 'underline decoration-teal-500 decoration-2 underline-offset-4' : ''
                              }`}
                            >
                              {section.label}
                            </Link>
                            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{section.description}</p>
                            {section.featured.length > 0 ? (
                              <ul className="mt-3 space-y-1.5 border-l-2 border-teal-200 pl-3 text-sm dark:border-teal-800">
                                {section.featured.map((p) => (
                                  <li key={p.path}>
                                    <Link
                                      href={p.path}
                                      onClick={() => setOpenSilo(null)}
                                      className="line-clamp-2 hover:text-brand-600 dark:hover:text-brand-400"
                                    >
                                      {p.title}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="mt-3 border-l-2 border-neutral-200 pl-3 text-sm text-neutral-500 dark:border-neutral-800">
                                Coming soon
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}

          <li aria-hidden className="mx-2 h-5 w-px bg-neutral-300 dark:bg-neutral-700" />

          {data.shared.map((item) => (
            <li key={item.slug} onKeyDown={(e) => onKeyDown(e, item.slug)}>
              <Link
                href={item.path}
                data-nav-top
                aria-current={pathname === item.path ? 'page' : undefined}
                className={topLink(pathname.startsWith(item.path))}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <Link
        href="/search/"
        aria-label="Search"
        className="rounded-lg p-2 hover:bg-neutral-100 hover:text-brand-600 dark:hover:bg-neutral-800"
      >
        <SearchIcon />
      </Link>

      {/* ---------------- Mobile ---------------- */}
      <button
        ref={mobileToggleRef}
        type="button"
        aria-label="Menu"
        aria-expanded={mobileOpen}
        aria-controls="mobile-nav"
        onClick={() => setMobileOpen((o) => !o)}
        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium lg:hidden dark:border-neutral-700"
      >
        {mobileOpen ? 'Close' : 'Menu'}
      </button>

      <div
        ref={mobilePanelRef}
        id="mobile-nav"
        hidden={!mobileOpen}
        className="fixed inset-x-0 bottom-0 top-16 z-50 overflow-y-auto bg-white p-4 lg:hidden dark:bg-neutral-950"
      >
        <nav aria-label="Mobile">
          <ul className="space-y-2">
            {data.silos.map((silo) => {
              const open = mobileSilo === silo.slug;
              return (
                <li key={silo.slug} className="rounded-xl border border-violet-200 dark:border-violet-900">
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`m-${silo.slug}`}
                    onClick={() => setMobileSilo(open ? null : silo.slug)}
                    className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left font-bold text-violet-800 dark:text-violet-200"
                  >
                    {silo.label}
                    <Chevron open={open} />
                  </button>
                  <div id={`m-${silo.slug}`} hidden={!open} className="space-y-1 px-4 pb-4">
                    <Link href={silo.path} className="block rounded-md bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-800 dark:bg-violet-900/30 dark:text-violet-200">
                      All {silo.label} →
                    </Link>
                    {silo.sections.map((s) => (
                      <Link
                        key={s.slug}
                        href={s.path}
                        aria-current={pathname === s.path ? 'page' : undefined}
                        className={`block rounded-md px-3 py-2 ${pathname.startsWith(s.path) ? 'font-semibold text-teal-700 dark:text-teal-300' : ''}`}
                      >
                        {s.label}
                        <span className="block text-xs font-normal text-neutral-500">{s.description}</span>
                      </Link>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>

          <p className="mb-2 mt-6 px-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">Shared</p>
          <ul className="space-y-1">
            {data.shared.map((item) => (
              <li key={item.slug}>
                <Link
                  href={item.path}
                  aria-current={pathname === item.path ? 'page' : undefined}
                  className="block rounded-md border border-neutral-200 px-4 py-3 font-semibold dark:border-neutral-800"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
