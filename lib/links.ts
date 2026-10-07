// The internal-link graph. Pages render these lists and the build check (scripts/check-structure.ts)
// counts the same lists, so what is checked is exactly what is shown.
import { getAllGeneratedPaths, getPosts, getPostByKey, getSectionPosts, type Post } from './content';
import { STATIC_PATHS } from './site';
import { TOOLS } from './tools';

/** Resolve a post reference (moneyPost, ...): the slug of another post. Slugs are unique across the site. */
export function resolveRef(
  _from: Pick<Post, 'silo' | 'section'>,
  ref: string,
  pool: readonly Post[] = getPosts(),
): { post?: Post; matches: Post[] } {
  const post = pool.find((p) => p.slug === ref);
  return { post, matches: post ? [post] : [] };
}

/** Info → Money: the Money post an info post points to (must be published and of type money). */
export function getMoneyPost(info: Post): Post | undefined {
  if (info.postType !== 'info' || !info.moneyPost) return undefined;
  const target = resolveRef(info, info.moneyPost).post;
  return target?.postType === 'money' ? target : undefined;
}

/** Money → Info: the info posts that point to this money post ("Learn more"). */
export function getInfoPostsFor(money: Post): Post[] {
  if (money.postType !== 'money') return [];
  return getPosts().filter((p) => p.postType === 'info' && getMoneyPost(p)?.key === money.key);
}

/** Same topic in another silo. Two-way: if A lists B, B shows A even if B doesn't list A. */
export function getParallelPosts(post: Post): Post[] {
  const found = new Map<string, Post>();
  for (const key of post.parallel) {
    const target = getPostByKey(key);
    if (target && target.key !== post.key) found.set(target.key, target);
  }
  for (const other of getPosts()) {
    if (other.key !== post.key && other.parallel.includes(post.key)) found.set(other.key, other);
  }
  return [...found.values()];
}

/** "More in {Section}": 3 posts. Listed siblings first, then the same section (money first), never the post itself. */
export function getSiblingPicks(post: Post, limit = 3): Post[] {
  const inSection = getSectionPosts(post.silo, post.section).filter((p) => p.key !== post.key);
  const picks: Post[] = [];
  for (const slug of post.siblings) {
    const p = inSection.find((x) => x.slug === slug);
    if (p && !picks.includes(p)) picks.push(p);
  }
  for (const p of inSection) {
    if (picks.length >= limit) break;
    if (!picks.includes(p)) picks.push(p);
  }
  return picks.slice(0, limit);
}

/**
 * Resolve an internal link written in a post body to a real page, or undefined when the target doesn't exist yet.
 * Post URLs are just /{slug}/, so authors write the same link they would on the live site.
 */
export function resolveInternalPath(href: string, _fromSilo?: string, known?: Set<string>): string | undefined {
  const [pathPart, ...rest] = href.split(/(?=[#?])/);
  const suffix = rest.join('');
  if (/\.[a-z0-9]+$/i.test(pathPart)) return href; // files like /feed.xml
  const norm = pathPart.endsWith('/') ? pathPart : `${pathPart}/`;
  const urls = known ?? getAllGeneratedPaths(TOOLS.map((t) => t.slug), STATIC_PATHS);
  return urls.has(norm) ? norm + suffix : undefined;
}

/** Body links that point at pages which don't exist yet (they render as plain text until they do). */
export function getPendingBodyLinks(post: Post): string[] {
  const known = getAllGeneratedPaths(TOOLS.map((t) => t.slug), STATIC_PATHS);
  const hrefs = [...post.content.matchAll(/\]\((\/[^)\s]*)\)/g)].map((m) => m[1]);
  return [...new Set(hrefs)].filter((h) => !resolveInternalPath(h, post.silo, known));
}

/** Other posts linked from the MDX body (full or short links). */
export function getBodyLinkedPosts(post: Post): Post[] {
  const known = getAllGeneratedPaths(TOOLS.map((t) => t.slug), STATIC_PATHS);
  const targets = new Set(
    [...post.content.matchAll(/\]\((\/[^)\s]*)\)/g)]
      .map((m) => resolveInternalPath(m[1], post.silo, known)?.split(/[#?]/)[0])
      .filter((x): x is string => !!x),
  );
  return getPosts().filter((p) => p.key !== post.key && targets.has(p.path));
}
