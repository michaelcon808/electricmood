import Link from 'next/link';
import { getSection, getSilo } from '@/config/site-structure';
import type { PostSummary } from '@/lib/content';
import { RatingBadge } from '@/components/mdx/RatingBadge';
import { Img } from './Img';
import { FormattedDate } from './FormattedDate';
import { PostTypeBadge } from './PostTypeBadge';

export function PostCard({ post, priority = false }: { post: PostSummary; priority?: boolean }) {
  const silo = getSilo(post.silo);
  const section = getSection(post.section);
  return (
    <article className="group card flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={post.path} className="relative block aspect-[16/9] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        <Img
          src={post.cover}
          alt={post.coverAlt}
          width={640}
          height={360}
          sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
          priority={priority}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {post.postType === 'money' && post.rating !== undefined && (
          <span className="absolute right-3 top-3">
            <RatingBadge rating={post.rating} size="sm" />
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
          <PostTypeBadge type={post.postType} />
          <span className="font-semibold uppercase tracking-wide text-neutral-500">
            {silo?.shortLabel} · {section?.label}
          </span>
        </div>
        <h3 className="text-lg font-bold leading-snug">
          <Link href={post.path} className="hover:text-brand-600 dark:hover:text-brand-400">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-neutral-600 dark:text-neutral-400">{post.description}</p>
        <p className="mt-auto pt-4 text-xs text-neutral-500">
          <FormattedDate date={post.dateISO} /> · {post.readingTime} min read
        </p>
      </div>
    </article>
  );
}

export function PostGrid({ posts, priorityFirst = false }: { posts: PostSummary[]; priorityFirst?: boolean }) {
  if (posts.length === 0) {
    return <p className="card p-8 text-center text-neutral-500">No articles yet — check back soon.</p>;
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((p, i) => (
        <PostCard key={p.key} post={p} priority={priorityFirst && i === 0} />
      ))}
    </div>
  );
}
