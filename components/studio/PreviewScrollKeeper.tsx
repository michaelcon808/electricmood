'use client';

import { useEffect } from 'react';

/** Studio preview only: keeps the scroll position when the preview iframe reloads after each edit. */
export function PreviewScrollKeeper() {
  useEffect(() => {
    const KEY = 'studio-preview-scroll';
    try {
      const y = Number(sessionStorage.getItem(KEY) || 0);
      if (y) window.scrollTo(0, y);
    } catch {}
    let t: number | undefined;
    const save = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        try {
          sessionStorage.setItem(KEY, String(window.scrollY));
        } catch {}
      }, 100);
    };
    window.addEventListener('scroll', save, { passive: true });
    return () => window.removeEventListener('scroll', save);
  }, []);
  return null;
}
