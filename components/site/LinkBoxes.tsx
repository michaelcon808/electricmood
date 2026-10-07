// The automatic internal-link boxes on a post page (see lib/links.ts for how each list is built).
import Link from 'next/link';
import { getSection, getSilo, sectionHeading, shared, type Silo } from '@/config/site-structure';
import type { Post } from '@/lib/content';
import { paths } from '@/lib/site';
import { getTool } from '@/lib/tools';
import { ACCENT } from './accents';
import { PostTypeBadge } from './PostTypeBadge';

/** "Back to {section hub heading}" — post → section hub. */
export function BackToHub({ post }: { post: Post }) {
  const silo = getSilo(post.silo)!;
  const section = getSection(post.section)!;
  return (
    <Link
      href={paths.section(silo.slug, section.slug)}
      className={`mb-6 inline-flex items-center gap-1 text-sm font-semibold ${ACCENT.section.link}`}
    >
      <span aria-hidden>←</span> Back to {sectionHeading(silo, section)}
    </Link>
  );
}

/** Info → Money: highlighted callout after the intro. */
export function MoneyCallout({ money }: { money: Post }) {
  return (
    <aside
      aria-label="Ready to buy?"
      className={`not-prose rounded-xl border-l-4 p-5 ${ACCENT.money.border} ${ACCENT.money.soft}`}
    >
      <p className={`text-sm font-bold uppercase tracking-wide ${ACCENT.money.text}`}>Ready to buy?</p>
      <p className="mt-1 text-lg font-bold">
        <Link href={money.path} className="hover:underline">
          See {money.title} <span aria-hidden>→</span>
        </Link>
      </p>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{money.description}</p>
    </aside>
  );
}

function PostLinkList({ posts }: { posts: Post[] }) {
  return (
    <ul className="space-y-3">
      {posts.map((p) => (
        <li key={p.key} className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0">
            <PostTypeBadge type={p.postType} />
          </span>
          <Link href={p.path} className="font-semibold hover:text-brand-600 dark:hover:text-brand-400">
            {p.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Money → Info: "Learn more" links back to the info posts that point here. */
export function LearnMoreBox({ posts }: { posts: Post[] }) {
  if (!posts.length) return null;
  return (
    <section aria-label="Learn more" className={`not-prose card p-5 ${ACCENT.info.soft}`}>
      <h2 className="mb-3 text-lg font-bold">Learn more</h2>
      <PostLinkList posts={posts} />
    </section>
  );
}

/** "More in {Section}": 3 sibling posts. */
export function SiblingsBox({ post, picks }: { post: Post; picks: Post[] }) {
  if (!picks.length) return null;
  const section = getSection(post.section)!;
  return (
    <section aria-label={`More in ${section.label}`} className={`not-prose card p-5 ${ACCENT.section.bar}`}>
      <h2 className="mb-3 text-lg font-bold">More in {section.label}</h2>
      <PostLinkList posts={picks} />
    </section>
  );
}

/** "Same topic for {other silo label}": parallel posts, grouped by silo. */
export function ParallelBoxes({ posts }: { posts: Post[] }) {
  const bySilo = new Map<string, { silo: Silo; posts: Post[] }>();
  for (const p of posts) {
    const silo = getSilo(p.silo);
    if (!silo) continue;
    if (!bySilo.has(silo.slug)) bySilo.set(silo.slug, { silo, posts: [] });
    bySilo.get(silo.slug)!.posts.push(p);
  }
  if (!bySilo.size) return null;
  return (
    <>
      {[...bySilo.values()].map(({ silo, posts: list }) => (
        <section key={silo.slug} aria-label={`Same topic for ${silo.label}`} className={`not-prose card p-5 ${ACCENT.silo.bar}`}>
          <h2 className="mb-3 text-lg font-bold">Same topic for {silo.label}</h2>
          <PostLinkList posts={list} />
        </section>
      ))}
    </>
  );
}

/** Post → tool call to action. */
export function ToolCta({ slug }: { slug: string }) {
  const tool = getTool(slug);
  if (!tool) return null;
  return (
    <aside aria-label="Related tool" className="not-prose card flex flex-wrap items-center justify-between gap-4 p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Free tool</p>
        <p className="mt-1 text-lg font-bold">
          <span aria-hidden>{tool.icon}</span> {tool.name}
        </p>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{tool.short}</p>
      </div>
      <Link href={paths.tool(tool.slug)} className="btn-primary">
        Open the calculator →
      </Link>
    </aside>
  );
}

/** "Tools and Learn" strip on silo hubs — the shared group every silo links to. */
export function SharedStrip() {
  return (
    <section aria-label="Tools and Learn" className="mt-14">
      <h2 className="mb-4 text-xl font-bold">Tools and Learn</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {shared.map((s) => (
          <Link key={s.slug} href={s.path} className={`card p-5 transition-colors ${ACCENT.shared.soft} ${ACCENT.shared.hover}`}>
            <p className="text-lg font-bold">{s.label}</p>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{s.description}</p>
            <p className="mt-3 text-sm font-semibold text-brand-600 dark:text-brand-400">Browse {s.label.toLowerCase()} →</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
