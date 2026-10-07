import { SITE_NAME, SITE_TAGLINE } from '@/lib/constants';
import { getPosts } from '@/lib/content';
import { cld, isPlaceholderImage } from '@/lib/cloudinary';
import { getSection, getSilo } from '@/config/site-structure';
import { absoluteUrl } from '@/lib/site';

// Generated once at build time into out/feed.xml.
export const dynamic = 'force-static';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

export function GET() {
  // Published, indexable posts only (drafts and future posts never reach getPosts()).
  const posts = getPosts()
    .filter((p) => !p.noindex)
    .slice(0, 30);

  const items = posts
    .map((p) => {
      const url = absoluteUrl(p.path);
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${esc(p.description)}</description>
      <category>${esc(getSilo(p.silo)?.label ?? '')}</category>
      <category>${esc(getSection(p.section)?.label ?? '')}</category>
      <pubDate>${p.date.toUTCString()}</pubDate>
      ${isPlaceholderImage(p.cover) ? '' : `<enclosure url="${esc(cld(p.cover, { width: 1200 }))}" type="image/jpeg" length="0" />`}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE_NAME)}</title>
    <link>${absoluteUrl('/')}</link>
    <description>${esc(SITE_TAGLINE)}</description>
    <language>en-us</language>
    <atom:link href="${absoluteUrl('/feed.xml')}" rel="self" type="application/rss+xml" />
${posts[0] ? `    <lastBuildDate>${posts[0].date.toUTCString()}</lastBuildDate>\n` : ''}${items}
  </channel>
</rss>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
