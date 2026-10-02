'use client';

import { useEffect, useRef, useState } from 'react';

type PagefindResultData = {
  url: string;
  excerpt: string;
  meta: { title?: string; image?: string; image_alt?: string };
  filters?: Record<string, string[]>;
};
type Pagefind = {
  init: () => Promise<void>;
  debouncedSearch: (q: string, opts?: object, ms?: number) => Promise<{ results: { data: () => Promise<PagefindResultData> }[] } | null>;
};

// Built by `pagefind --site out` after `next build`; not available in `next dev`.
const PAGEFIND_URL = '/pagefind/pagefind.js';

export function SearchBox() {
  const pagefind = useRef<Pagefind | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'unavailable'>('idle');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PagefindResultData[]>([]);
  const [searched, setSearched] = useState(false);

  async function load(): Promise<Pagefind | null> {
    if (pagefind.current) return pagefind.current;
    setStatus('loading');
    try {
      const pf = (await import(/* webpackIgnore: true */ PAGEFIND_URL)) as Pagefind;
      await pf.init();
      pagefind.current = pf;
      setStatus('ready');
      return pf;
    } catch {
      setStatus('unavailable');
      return null;
    }
  }

  async function run(q: string) {
    const url = new URL(window.location.href);
    if (q) url.searchParams.set('q', q);
    else url.searchParams.delete('q');
    window.history.replaceState(null, '', url);

    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    const pf = await load();
    if (!pf) return;
    const search = await pf.debouncedSearch(q, {}, 200);
    if (!search) return; // superseded by a newer keystroke
    setResults(await Promise.all(search.results.slice(0, 12).map((r) => r.data())));
    setSearched(true);
  }

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q') ?? '';
    if (q) {
      setQuery(q);
      run(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <form role="search" onSubmit={(e) => e.preventDefault()} className="relative">
        <label htmlFor="q" className="sr-only">
          Search articles and tools
        </label>
        <input
          id="q"
          type="search"
          autoFocus
          autoComplete="off"
          placeholder="Search reviews, guides and tools…"
          className="input py-3 text-base"
          value={query}
          onFocus={load}
          onChange={(e) => {
            setQuery(e.target.value);
            run(e.target.value);
          }}
        />
      </form>

      <div aria-live="polite" className="mt-6">
        {status === 'unavailable' && (
          <p className="card p-5 text-sm text-neutral-600 dark:text-neutral-400">
            The search index is generated during <code>npm run build</code>. Run <code>npm run build</code> then{' '}
            <code>npm run preview</code> to try search locally.
          </p>
        )}
        {searched && results.length === 0 && <p className="text-neutral-500">No results for “{query}”.</p>}
        <ul className="space-y-4">
          {results.map((r) => (
            <li key={r.url}>
              <a href={r.url} className="card block p-5 transition-colors hover:border-brand-500">
                <p className="font-bold text-brand-700 dark:text-brand-400">{r.meta.title ?? r.url}</p>
                {/* Pagefind excerpts are escaped text with <mark> highlights */}
                <p
                  className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 [&_mark]:bg-volt [&_mark]:text-neutral-900"
                  dangerouslySetInnerHTML={{ __html: r.excerpt }}
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
