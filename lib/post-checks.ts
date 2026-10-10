// Post rules shared by the build checks (scripts/check-*.ts) and the studio (scripts/studio),
// so the editor rejects exactly what the build would reject.
import type { Post } from './content';
import { resolveSlugAlias } from './aliases';
import { resolveRef } from './links';

/**
 * `error` stops the build. `warning` is informational: most often a *pending* link, i.e. a reference
 * to a post that isn't written or published yet. Pending links are skipped on the page and switch on
 * automatically once the target post exists.
 */
export type Issue = { field: string; message: string; level?: 'error' | 'warning' };

/** Markdown images and <Img>/<ProductBox> components must have alt text. */
export function imageAltProblems(body: string): string[] {
  const problems: string[] = [];
  const noCode = body.replace(/```[\s\S]*?```/g, '');
  for (const m of noCode.matchAll(/!\[([^\]]*)\]\(([^)\s]+)[^)]*\)/g)) {
    if (!m[1].trim()) problems.push(`Markdown image without alt text: ${m[2]}`);
  }
  for (const m of noCode.matchAll(/<(Img|ProductBox)\b([^>]*?)\/?>/gs)) {
    const attrs = m[2];
    const needs = m[1] === 'Img' ? /\bsrc=/.test(attrs) : /\bimage=/.test(attrs);
    if (!needs) continue;
    const altAttr = m[1] === 'Img' ? 'alt' : 'imageAlt';
    const alt = new RegExp(`\\b${altAttr}=(?:"([^"]*)"|'([^']*)'|\\{)`).exec(attrs);
    if (!alt || (alt[1] ?? alt[2] ?? 'x').trim() === '') {
      problems.push(`<${m[1]}> without ${altAttr}: ${attrs.trim().slice(0, 80)}`);
    }
  }
  return problems;
}

/** Editorial quality rules: description length, cover alt text, image alt text. */
export function contentIssues(data: Record<string, unknown>, body: string): Issue[] {
  const issues: Issue[] = [];
  const description = typeof data.description === 'string' ? data.description.trim() : '';
  if (description.length < 120 || description.length > 160) {
    issues.push({ field: 'description', message: `description is ${description.length} characters (needs 120–160)` });
  }
  if (data.cover && (typeof data.coverAlt !== 'string' || !data.coverAlt.trim())) {
    issues.push({ field: 'coverAlt', message: 'coverAlt is missing' });
  }
  for (const p of imageAltProblems(body)) issues.push({ field: 'body', message: p });
  return issues;
}

/**
 * Link rules for one post against the full post list (drafts included): duplicate key, moneyPost,
 * siblings, parallel, tool. A target that doesn't exist yet, or isn't published, is a *pending* warning;
 * wrong types, self links and same-silo parallels are errors.
 * `published` is the set of keys that are live at build time.
 */
export function referenceIssues(post: Post, all: readonly Post[], published: ReadonlySet<string>, toolSlugs: ReadonlySet<string>): Issue[] {
  const issues: Issue[] = [];
  const error = (field: string, message: string) => issues.push({ field, message, level: 'error' });
  const pending = (field: string, message: string) => issues.push({ field, message: `pending: ${message}`, level: 'warning' });

  if (all.some((x) => x !== post && x.key === post.key && x.file !== post.file)) {
    error('slug', `another post already uses ${post.key}`);
  }

  if (post.postType === 'info') {
    if (!post.moneyPost) error('moneyPost', 'info posts need a moneyPost');
    else {
      const target = all.find((x) => x.slug === post.moneyPost) ?? all.find((x) => x.slug === resolveSlugAlias(post.moneyPost ?? ''));
      if (!target) pending('moneyPost', `moneyPost "${post.moneyPost}" doesn't exist yet, so the "Ready to buy?" callout is hidden until it does`);
      else if (target.postType !== 'money') error('moneyPost', `"${post.moneyPost}" is a ${target.postType} post, not a money post`);
      else if (!published.has(target.key)) pending('moneyPost', `moneyPost "${post.moneyPost}" isn't published yet (draft or future date)`);
    }
  }

  for (const slug of post.siblings) {
    const target = all.find((x) => x.slug === slug) ?? all.find((x) => x.slug === resolveSlugAlias(slug));
    if (!target) pending('siblings', `sibling "${slug}" doesn't exist yet`);
    else if (target.key === post.key) error('siblings', `sibling "${slug}" is the post itself`);
    else if (target.silo !== post.silo || target.section !== post.section) error('siblings', `sibling "${slug}" is in ${target.silo}/${target.section}; siblings must be in the same section (${post.silo}/${post.section})`);
    else if (!published.has(target.key)) pending('siblings', `sibling "${slug}" isn't published yet`);
  }

  for (const slug of post.parallel) {
    const target = all.find((x) => x.slug === slug) ?? all.find((x) => x.slug === resolveSlugAlias(slug));
    if (!target) pending('parallel', `parallel "${slug}" doesn't exist yet`);
    else if (target.key === post.key) error('parallel', `parallel "${slug}" is the post itself`);
    else if (target.silo === post.silo) error('parallel', `parallel "${slug}" is in the same silo (parallel posts cover the same topic in ANOTHER silo)`);
    else if (!published.has(target.key)) pending('parallel', `parallel "${slug}" isn't published yet`);
  }

  if (post.tool && !toolSlugs.has(post.tool)) error('tool', `tool "${post.tool}" is not in lib/tools.ts`);
  return issues;
}
