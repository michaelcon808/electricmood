/**
 * Structure checks (npm run check:structure; also runs inside `npm run build`).
 *
 * FAIL when:
 *  - a post has an invalid silo or section
 *  - two posts share a slug (URLs are /{slug}/, so slugs are unique site-wide)
 *  - an info post has no moneyPost field, or its moneyPost is not a money post
 *  - a sibling is the post itself, or a parallel target is in the same silo
 *  - a post is missing from its section hub
 *  - a breadcrumb points to a URL that does not exist
 * WARN (does not fail) when a post has fewer than 3 inbound internal links (its hub counts as one), and for every
 * *pending* link: a moneyPost/sibling/parallel/body link to a post that doesn't exist yet. Pending links are hidden on
 * the page and switch on automatically once the target post is added.
 * Prints a table of every post with inbound and outbound link counts.
 */
import { buildBreadcrumbs, sections, silos } from '../config/site-structure';
import { POST_TYPE_LABELS } from '../lib/constants';
import {
  getAllGeneratedPaths,
  getLearnPages,
  getPosts,
  getPostsForTool,
  getSectionPosts,
  isPublished,
  loadAllPostFiles,
  type Post,
} from '../lib/content';
import { getBodyLinkedPosts, getInfoPostsFor, getMoneyPost, getParallelPosts, getPendingBodyLinks, getSiblingPicks } from '../lib/links';
import { referenceIssues } from '../lib/post-checks';
import { paths, STATIC_PATHS } from '../lib/site';
import { TOOLS } from '../lib/tools';

const errors: string[] = [];
const pendingNotes: string[] = [];
const err = (post: { file: string } | string, msg: string) =>
  errors.push(`✗ ${typeof post === 'string' ? post : `content/posts/${post.file}`}: ${msg}`);

let all: Post[];
try {
  // Throws on invalid silo/section/frontmatter and on duplicate slugs.
  all = loadAllPostFiles();
} catch (e) {
  console.error(`✗ ${(e as Error).message}`);
  process.exit(1);
}

const published = all.filter((p) => isPublished(p));
const pubKeys = new Set(published.map((p) => p.key));
const toolSlugs = new Set(TOOLS.map((t) => t.slug));

// Every post, drafts included, so the unresolved-link list is complete. For a draft, problems are warnings
// (a draft can't break the build); for a published post, real mistakes fail the build.
const unresolved: { post: string; kind: string; target: string }[] = [];
for (const p of all) {
  const live = pubKeys.has(p.key);
  for (const issue of referenceIssues(p, all, pubKeys, toolSlugs)) {
    if (issue.level === 'warning') {
      const target = /"([^"]+)"/.exec(issue.message)?.[1] ?? issue.message;
      unresolved.push({ post: p.key, kind: issue.field, target });
    } else if (live) err(p, issue.message);
    else pendingNotes.push(`! ${p.key} (draft): ${issue.message}`);
  }
  for (const href of getPendingBodyLinks(p)) unresolved.push({ post: p.key, kind: 'body link', target: href });
  // hub completeness (published posts only)
  if (live && !getSectionPosts(p.silo, p.section).some((x) => x.key === p.key)) err(p, `missing from its section hub (${p.silo}/${p.section})`);
}

// Visitor-facing labels must never use the internal term "Money" (breadcrumbs, menus, hubs, badges).
for (const [type, label] of Object.entries(POST_TYPE_LABELS)) {
  if (/\bmoney\b/i.test(label)) err(`lib/constants.ts`, `post type "${type}" is shown to visitors as "${label}"`);
}
for (const silo of silos) {
  for (const section of sections) {
    for (const c of buildBreadcrumbs({ kind: 'section', silo: silo.slug, section: section.slug })) {
      if (/\bmoney\b/i.test(c.label)) err(`config/site-structure.ts`, `breadcrumb "${c.label}" contains "Money"`);
    }
  }
}

// Breadcrumbs must point at real URLs.
const urls = getAllGeneratedPaths(TOOLS.map((t) => t.slug), STATIC_PATHS);
const checkCrumbs = (who: string, trail: { label: string; path: string }[]) => {
  for (const c of trail) if (!urls.has(c.path)) err(who, `breadcrumb "${c.label}" points to ${c.path}, which does not exist`);
};
for (const silo of silos) {
  checkCrumbs(`silo hub ${silo.slug}`, buildBreadcrumbs({ kind: 'silo', silo: silo.slug }));
  for (const section of sections) {
    checkCrumbs(`section hub ${silo.slug}/${section.slug}`, buildBreadcrumbs({ kind: 'section', silo: silo.slug, section: section.slug }));
  }
}
for (const p of published) checkCrumbs(p.key, buildBreadcrumbs({ kind: 'post', silo: p.silo, section: p.section, title: p.title, slug: p.slug }));
for (const t of TOOLS) checkCrumbs(`tool ${t.slug}`, buildBreadcrumbs({ kind: 'shared', shared: 'tools', item: { title: t.name, slug: t.slug } }));
for (const l of getLearnPages()) checkCrumbs(`learn ${l.slug}`, buildBreadcrumbs({ kind: 'shared', shared: 'learn', item: { title: l.title, slug: l.slug } }));

/* ---------------- Link counts (the same lists the pages render) ---------------- */

const inbound = new Map<string, Set<string>>(published.map((p) => [p.key, new Set<string>()]));
const outbound = new Map<string, number>(published.map((p) => [p.key, 0]));
const link = (from: string, to: string) => {
  inbound.get(to)?.add(from);
};

for (const p of published) {
  link(`hub:${p.silo}/${p.section}`, p.key); // section hub lists every post
  let out = 1; // "Back to {section hub}"
  const money = getMoneyPost(p);
  if (money) {
    link(p.key, money.key);
    out++;
  }
  for (const info of getInfoPostsFor(p)) {
    link(p.key, info.key); // "Learn more"
    out++;
  }
  for (const s of getSiblingPicks(p)) {
    link(p.key, s.key);
    out++;
  }
  for (const x of getParallelPosts(p)) {
    link(p.key, x.key);
    out++;
  }
  for (const x of getBodyLinkedPosts(p)) {
    link(p.key, x.key);
    out++;
  }
  if (p.tool) out++;
  outbound.set(p.key, out);
}
for (const t of TOOLS) for (const p of getPostsForTool(t.slug)) link(`tool:${t.slug}`, p.key); // tool page lists the post

const rows = published.map((p) => ({
  post: p.key,
  type: p.postType,
  inbound: inbound.get(p.key)!.size,
  outbound: outbound.get(p.key)!,
}));

console.log('\nInternal links per post (inbound counts the section hub as one):\n');
console.table(rows);

const warnings = rows.filter((r) => r.inbound < 3).map((r) => `! ${r.post}: only ${r.inbound} inbound internal link(s) (aim for 3+)`);
if (unresolved.length) {
  console.warn(`\nUnresolved internal links: ${unresolved.length} (warnings only; each is hidden on the page and switches on once its target post exists):`);
  console.table(unresolved);
}
if (pendingNotes.length) console.warn(`\n${pendingNotes.join('\n')}`);
if (warnings.length) console.warn(`\n${warnings.join('\n')}\n`);

if (errors.length) {
  console.error(`\n${errors.join('\n')}\n\n${errors.length} structure error(s).`);
  process.exit(1);
}
console.log(`✓ Structure OK: ${published.length} published post(s), ${silos.length * sections.length} section hubs, ${warnings.length + pendingNotes.length + unresolved.length} warning(s).`);
