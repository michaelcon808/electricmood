import type { MetadataRoute } from 'next';
import { absoluteUrl, isGlobalNoindex } from '@/lib/site';

// Generated once at build time into out/robots.txt.
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  if (isGlobalNoindex) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/contact/thanks/', '/__forms.html'] }],
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
