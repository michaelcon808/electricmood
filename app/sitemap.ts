import { existsSync, readFileSync } from 'node:fs';
import type { MetadataRoute } from 'next';
import { sections, silos } from '@/config/site-structure';
import { getPosts, getSectionPosts } from '@/lib/content';
import { absoluteUrl, isGlobalNoindex, paths, STATIC_PATHS } from '@/lib/site';
import { TOOLS } from '@/lib/tools';

// Generated once at build time into out/sitemap.xml.
export const dynamic = 'force-static';

/** Real last-change dates from git (scripts/generate-lastmod.mjs); empty when history isn't available. */
const GIT: Record<string, string> = existsSync('.lastmod.json') ? JSON.parse(readFileSync('.lastmod.json', 'utf8')) : {};
/** The later of two ISO dates (either may be missing). */
const later = (a?: string, b?: string) => (!a ? b : !b ? a : new Date(a) > new Date(b) ? a : b);

export default function sitemap(): MetadataRoute.Sitemap {
  if (isGlobalNoindex) return [];

  // getPosts() already excludes drafts and future-dated posts.
  const posts = getPosts().filter((p) => !p.noindex);
  // A post changed when its file last changed in git, or on its `updated` date, whichever is later.
  const postDate = (p: (typeof posts)[number]) => later(p.updatedISO, GIT[`post:${p.slug}`]);
  const newest = (list: typeof posts) => list.map(postDate).reduce<string | undefined>((a, b) => later(a, b), undefined);
  const latest = later(newest(posts), GIT.home);

  return [
    { url: absoluteUrl('/'), lastModified: latest, changeFrequency: 'daily', priority: 1 },
    ...silos.map((s) => ({ url: absoluteUrl(paths.silo(s.slug)), lastModified: newest(posts.filter((p) => p.silo === s.slug)), changeFrequency: 'weekly' as const, priority: 0.8 })),
    // Empty "Coming soon" section hubs are noindex, so they stay out of the sitemap.
    ...silos.flatMap((silo) =>
      sections
        .filter((section) => getSectionPosts(silo.slug, section.slug).length > 0)
        .map((section) => ({
          url: absoluteUrl(paths.section(silo.slug, section.slug)),
          lastModified: newest(getSectionPosts(silo.slug, section.slug).filter((p) => !p.noindex)),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        })),
    ),
    ...posts.map((p) => ({ url: absoluteUrl(p.path), lastModified: postDate(p), changeFrequency: 'monthly' as const, priority: 0.7 })),
    { url: absoluteUrl(paths.tools), lastModified: GIT.tools, changeFrequency: 'monthly', priority: 0.7 },
    ...TOOLS.map((t) => ({ url: absoluteUrl(paths.tool(t.slug)), lastModified: GIT.tools, changeFrequency: 'monthly' as const, priority: 0.7 })),
    ...STATIC_PATHS.map((path) => ({ url: absoluteUrl(path), changeFrequency: 'yearly' as const, priority: 0.3 })),
  ];
}
