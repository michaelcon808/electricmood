import type { MetadataRoute } from 'next';
import { sections, silos } from '@/config/site-structure';
import { getLearnPages, getPosts, getSectionPosts } from '@/lib/content';
import { absoluteUrl, isGlobalNoindex, paths, STATIC_PATHS } from '@/lib/site';
import { TOOLS } from '@/lib/tools';

// Generated once at build time into out/sitemap.xml.
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  if (isGlobalNoindex) return [];

  // getPosts() already excludes drafts and future-dated posts.
  const posts = getPosts().filter((p) => !p.noindex);
  const latest = posts[0]?.updatedISO;

  return [
    { url: absoluteUrl('/'), lastModified: latest, changeFrequency: 'daily', priority: 1 },
    ...silos.map((s) => ({ url: absoluteUrl(paths.silo(s.slug)), lastModified: latest, changeFrequency: 'weekly' as const, priority: 0.8 })),
    // Empty "Coming soon" section hubs are noindex, so they stay out of the sitemap.
    ...silos.flatMap((silo) =>
      sections
        .filter((section) => getSectionPosts(silo.slug, section.slug).length > 0)
        .map((section) => ({
          url: absoluteUrl(paths.section(silo.slug, section.slug)),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        })),
    ),
    ...posts.map((p) => ({ url: absoluteUrl(p.path), lastModified: p.updatedISO, changeFrequency: 'monthly' as const, priority: 0.7 })),
    { url: absoluteUrl(paths.tools), changeFrequency: 'monthly', priority: 0.7 },
    ...TOOLS.map((t) => ({ url: absoluteUrl(paths.tool(t.slug)), changeFrequency: 'monthly' as const, priority: 0.7 })),
    { url: absoluteUrl(paths.learn), changeFrequency: 'monthly', priority: 0.6 },
    ...getLearnPages().map((l) => ({ url: absoluteUrl(l.path), lastModified: l.updatedISO, changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...STATIC_PATHS.map((path) => ({ url: absoluteUrl(path), changeFrequency: 'yearly' as const, priority: 0.3 })),
  ];
}
