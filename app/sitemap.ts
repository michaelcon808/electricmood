import type { MetadataRoute } from 'next';
import { MIN_POSTS_TO_INDEX_TAG } from '@/lib/constants';
import { getCategories, getPosts, getTags } from '@/lib/content';
import { absoluteUrl, isGlobalNoindex, paths } from '@/lib/site';
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
    { url: absoluteUrl(paths.blog), lastModified: latest, changeFrequency: 'daily', priority: 0.8 },
    ...posts.map((p) => ({
      url: absoluteUrl(paths.post(p.slug)),
      lastModified: p.updatedISO,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { url: absoluteUrl(paths.tools), changeFrequency: 'monthly', priority: 0.7 },
    ...TOOLS.map((t) => ({ url: absoluteUrl(paths.tool(t.slug)), changeFrequency: 'monthly' as const, priority: 0.7 })),
    ...getCategories().map((c) => ({ url: absoluteUrl(paths.category(c.slug)), changeFrequency: 'weekly' as const, priority: 0.6 })),
    ...getTags()
      .filter((t) => t.count >= MIN_POSTS_TO_INDEX_TAG)
      .map((t) => ({ url: absoluteUrl(paths.tag(t.slug)), changeFrequency: 'weekly' as const, priority: 0.4 })),
    ...['/about/', '/contact/', '/affiliate-disclosure/', '/privacy-policy/'].map((path) => ({
      url: absoluteUrl(path),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    })),
  ];
}
