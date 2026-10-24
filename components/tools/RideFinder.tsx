'use client';

import Link from 'next/link';
import { useState } from 'react';
import { findRide, type FinderAnswers } from '@/lib/calculators';
import { SelectField } from './fields';

export type FinderPost = { slug: string; title: string; path: string; description: string };

const NAMES = { escooter: 'an electric scooter', ebike: 'an electric bike', eskateboard: 'an electric skateboard' } as const;
const WHY = {
  escooter: 'Light, quick to learn, folds for stairs and transit, and the cheapest way in.',
  ebike: 'The best for longer trips, hills, carrying things and comfort, and you can pedal for exercise.',
  eskateboard: 'The most portable and the most fun on short, smooth trips, but it takes practice and hates rain.',
} as const;

const yesNo = [
  { value: 'no', label: 'No' },
  { value: 'yes', label: 'Yes' },
] as const;

export default function RideFinder({ posts }: { posts: FinderPost[] }) {
  const [a, setA] = useState<FinderAnswers>({ rider: 'adult', distance: 'medium', terrain: 'flat', carry: false, budget: 'mid', rain: false, campus: false, exercise: false });
  const set = <K extends keyof FinderAnswers>(k: K) => (v: FinderAnswers[K]) => setA((p) => ({ ...p, [k]: v }));
  const bool = (k: 'carry' | 'rain' | 'campus' | 'exercise') => ({ value: (a[k] ? 'yes' : 'no') as 'yes' | 'no', onChange: (v: 'yes' | 'no') => set(k)(v === 'yes') });
  const r = findRide(a);
  const bySlug = new Map(posts.map((p) => [p.slug, p]));
  const picks = r.picks.map((s) => bySlug.get(s)).filter((p): p is FinderPost => !!p).slice(0, 3);

  return (
    <div className="card space-y-6 p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SelectField id="rider" label="Who is riding?" value={a.rider} onChange={set('rider')} options={[{ value: 'kid', label: 'A child (8–12)' }, { value: 'teen', label: 'A teenager' }, { value: 'adult', label: 'An adult' }, { value: 'senior', label: 'An older adult' }]} />
        <SelectField id="distance" label="Usual trip (one way)" value={a.distance} onChange={set('distance')} options={[{ value: 'short', label: 'Under 3 miles (5 km)' }, { value: 'medium', label: '3–10 miles (5–16 km)' }, { value: 'long', label: 'Over 10 miles (16 km)' }]} />
        <SelectField id="terrain" label="Where you’ll ride" value={a.terrain} onChange={set('terrain')} options={[{ value: 'flat', label: 'Mostly flat streets' }, { value: 'hilly', label: 'Hills' }, { value: 'offroad', label: 'Trails and dirt' }]} />
        <SelectField id="budget" label="Budget" value={a.budget} onChange={set('budget')} options={[{ value: 'low', label: 'Under $600' }, { value: 'mid', label: '$600–$1,500' }, { value: 'high', label: 'Over $1,500' }]} />
        <SelectField id="carry" label="Carry it up stairs or on transit?" {...bool('carry')} options={[...yesNo]} />
        <SelectField id="rain" label="Ride in the rain often?" {...bool('rain')} options={[...yesNo]} />
        <SelectField id="campus" label="For a college campus?" {...bool('campus')} options={[...yesNo]} />
        <SelectField id="exercise" label="Want some exercise too?" {...bool('exercise')} options={[...yesNo]} />
      </div>

      <section aria-live="polite" aria-label="Recommendation" className="rounded-2xl bg-brand-50 p-5 dark:bg-brand-700/10">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Our suggestion</p>
        <p className="mt-1 text-2xl font-extrabold text-brand-700 dark:text-brand-400">Go for {NAMES[r.best]}</p>
        <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">{WHY[r.best]}</p>
        <p className="mt-1 text-xs text-neutral-500">Runner-up: {NAMES[r.ranked[1]].replace(/^an? /, '')}.</p>
        {picks.length > 0 && (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {picks.map((p) => (
              <Link key={p.slug} href={p.path} className="rounded-xl bg-white p-4 shadow-sm transition-colors hover:ring-2 hover:ring-brand-500 dark:bg-neutral-900">
                <p className="font-bold leading-snug">{p.title}</p>
                <p className="mt-1 line-clamp-3 text-xs text-neutral-600 dark:text-neutral-400">{p.description}</p>
                <p className="mt-2 text-sm font-semibold text-brand-600 dark:text-brand-400">See the picks →</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
