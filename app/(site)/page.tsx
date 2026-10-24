import Link from 'next/link';
import type { Metadata } from 'next';
import { shared, silos } from '@/config/site-structure';
import { HOME_HERO_POSTS, SITE_NAME, SITE_TAGLINE } from '@/lib/constants';
import { getPost, getPosts, getPostsBySilo, summarize } from '@/lib/content';
import { isPlaceholderImage } from '@/lib/cloudinary';
import { Img } from '@/components/site/Img';
import { pageMetadata } from '@/lib/seo';
import { absoluteUrl, paths } from '@/lib/site';
import { ACCENT } from '@/components/site/accents';
import { JsonLd } from '@/components/site/JsonLd';
import { PostGrid } from '@/components/site/PostCard';

export const metadata: Metadata = pageMetadata({
  title: `${SITE_NAME}: E-Scooter, E-Bike & E-Skateboard Reviews, Guides and Calculators`,
  absoluteTitle: true,
  description: SITE_TAGLINE,
  path: '/',
});

export default function HomePage() {
  const latest = getPosts().slice(0, 6).map(summarize);
  // One photo per silo, from that silo's flagship review (skipped if its cover isn't uploaded yet).
  const hero = HOME_HERO_POSTS.map((slug, i) => ({ post: getPost(slug), silo: silos[i] })).filter(
    (h): h is { post: NonNullable<typeof h.post>; silo: (typeof silos)[number] } => !!h.post && !!h.silo && !isPlaceholderImage(h.post.cover),
  );

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: SITE_NAME,
          url: absoluteUrl('/'),
          description: SITE_TAGLINE,
        }}
      />
      <section className="border-b border-neutral-200 bg-gradient-to-b from-brand-50 to-white dark:border-neutral-800 dark:from-brand-700/10 dark:to-neutral-950">
        <div className="container-page grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <p className="mb-3 inline-block rounded-full bg-volt px-3 py-1 text-xs font-bold uppercase tracking-wide text-neutral-900">
              Electric rides, explained
            </p>
            <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
              Find the right electric ride, without the hype.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">{SITE_TAGLINE}</p>
          </div>
          {hero.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {hero.map(({ post, silo }, i) => (
                <Link
                  key={silo.slug}
                  href={paths.silo(silo.slug)}
                  className={`group relative overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5 ${i === 1 ? 'lg:translate-y-6' : ''}`}
                >
                  <Img
                    src={post.cover}
                    alt={post.coverAlt ?? ''}
                    width={480}
                    height={640}
                    fill
                    sizes="(min-width: 1024px) 220px, 34vw"
                    priority
                    className="aspect-[3/4] h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute inset-x-2 bottom-2 whitespace-nowrap rounded-full bg-white/90 px-1.5 py-1 text-center text-[11px] font-bold text-neutral-900 shadow backdrop-blur sm:px-2 sm:text-sm dark:bg-neutral-900/85 dark:text-white">
                    {silo.label.replace(/^Electric /, 'E-')}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section aria-label="Silos" className="container-page py-14">
        <h2 className="mb-6 text-2xl font-bold">Choose your ride</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {silos.map((silo) => {
            const count = getPostsBySilo(silo.slug).length;
            return (
              <Link
                key={silo.slug}
                href={paths.silo(silo.slug)}
                className={`card p-6 transition-colors ${ACCENT.silo.bar} ${ACCENT.silo.hover}`}
              >
                <p className={`text-xl font-extrabold ${ACCENT.silo.text}`}>{silo.label}</p>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{silo.description}</p>
                <p className="mt-4 text-sm font-semibold">
                  {count} article{count === 1 ? '' : 's'} →
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container-page pb-14" aria-label="Latest articles">
        <h2 className="mb-6 text-2xl font-bold">Latest articles</h2>
        <PostGrid posts={latest} priorityFirst />
      </section>

      <section className="container-page" aria-label="Shared">
        <div className="grid gap-4 sm:grid-cols-2">
          {shared.map((s) => (
            <Link key={s.slug} href={s.path} className={`card p-6 transition-colors ${ACCENT.shared.soft} ${ACCENT.shared.hover}`}>
              <p className="text-xl font-bold">{s.label}</p>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{s.description}</p>
              <p className="mt-3 text-sm font-semibold text-brand-600 dark:text-brand-400">Browse {s.label.toLowerCase()} →</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
