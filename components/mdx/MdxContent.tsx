import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { AFFILIATE_MARKER, stripLeadingH1, stripOwnToc } from '@/lib/markdown';
import { getAllGeneratedPaths } from '@/lib/content';
import { resolveInternalPath } from '@/lib/links';
import { STATIC_PATHS } from '@/lib/site';
import { TOOLS } from '@/lib/tools';
import { siteUrl } from '@/lib/site';
import { Img, type ImgProps } from '@/components/site/Img';
import { AffiliateLink } from './AffiliateLink';
import { BestFor } from './BestFor';
import { Callout } from './Callout';
import { ComparisonTable } from './ComparisonTable';
import { FAQ, type FaqItem } from './FAQ';
import { ProductBox } from './ProductBox';
import { ProsCons } from './ProsCons';
import { RatingBadge } from './RatingBadge';
import { SpecTable } from './SpecTable';

const normalize = (url: string) => url.replace(/#aff$/, '').replace(/\/+$/, '').toLowerCase();

function host(url: string): string | null {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

export type MdxSource = {
  content: string;
  /** Used to prefer same-silo posts when a short /slug/ link is ambiguous. */
  silo?: string;
  affiliateLinks?: { url: string }[];
  pros?: string[];
  cons?: string[];
  faqs?: FaqItem[];
};

/** Components available inside every MDX page. <ProsCons /> and <FAQ /> default to the post's frontmatter. */
function mdxComponents(post: MdxSource) {
  const affiliateUrls = new Set((post.affiliateLinks ?? []).map((l) => normalize(l.url)));
  const siteHost = host(siteUrl);
  const known = getAllGeneratedPaths(TOOLS.map((t) => t.slug), STATIC_PATHS);

  return {
    a({ href = '', children, rel: authorRel, target: authorTarget, className, 'aria-label': ariaLabel }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
      // In-page anchors (heading permalinks): keep the class and aria-label rehype-autolink-headings added.
      if (href.startsWith('#')) {
        return (
          <a href={href} className={className} aria-label={ariaLabel}>
            {children}
          </a>
        );
      }
      const marked = href.endsWith(AFFILIATE_MARKER);
      const url = marked ? href.slice(0, -AFFILIATE_MARKER.length) : href;
      if (marked || affiliateUrls.has(normalize(url))) return <AffiliateLink href={url}>{children}</AffiliateLink>;

      const h = host(url);
      if (/^https?:\/\//i.test(url) && h !== siteHost) {
        // External links open in a new tab. An explicit rel written in the MDX (e.g. image credits with
        // rel="nofollow noopener") is kept as written; everything else gets rel="noopener noreferrer".
        const rel = authorRel ? (/\bnoopener\b/.test(authorRel) ? authorRel : `${authorRel} noopener`) : 'noopener noreferrer';
        return (
          <a href={url} target={authorTarget ?? '_blank'} rel={rel}>
            {children}
          </a>
        );
      }
      const internal = h === siteHost ? new URL(url).pathname : url;
      if (internal.startsWith('/')) {
        // Short links (/slug/) are resolved to the real URL; links to pages that don't exist yet show as plain text.
        const resolved = resolveInternalPath(internal, post.silo, known);
        return resolved ? <Link href={resolved}>{children}</Link> : <>{children}</>;
      }
      return <a href={internal}>{children}</a>;
    },

    /** Markdown images: ![alt](src "1200x800") — optional "WxH" title sets the intrinsic size (default 16:9). */
    img({ src, alt, title }: React.ImgHTMLAttributes<HTMLImageElement>) {
      if (typeof src !== 'string') return null;
      const size = title && /^(\d+)x(\d+)$/.exec(title);
      return (
        <Img
          src={src}
          alt={alt ?? ''}
          width={size ? Number(size[1]) : 1200}
          height={size ? Number(size[2]) : 675}
          sizes="(min-width: 768px) 720px, 100vw"
        />
      );
    },

    table({ children }: React.TableHTMLAttributes<HTMLTableElement>) {
      return (
        <div className="overflow-x-auto">
          <table>{children}</table>
        </div>
      );
    },

    Img: (props: ImgProps) => <Img sizes="(min-width: 768px) 720px, 100vw" {...props} />,
    AffiliateLink,
    BestFor,
    Callout,
    ComparisonTable,
    ProductBox,
    RatingBadge,
    SpecTable,
    ProsCons: (props: { pros?: string[]; cons?: string[] }) => (
      <ProsCons pros={props.pros ?? post.pros ?? []} cons={props.cons ?? post.cons ?? []} />
    ),
    FAQ: (props: { items?: FaqItem[]; title?: string }) => <FAQ items={props.items ?? post.faqs ?? []} title={props.title} />,
  };
}

export async function MdxContent({ post }: { post: MdxSource }) {
  return (
    <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-a:text-brand-600 dark:prose-a:text-brand-400 prose-img:my-6">
      <MDXRemote
        source={stripOwnToc(stripLeadingH1(post.content))}
        components={mdxComponents(post)}
        options={{
          // Posts are trusted repo content: allow JSX props like rows={[...]}, still block eval/process/etc.
          blockJS: false,
          blockDangerousJS: true,
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              rehypeSlug,
              [
                rehypeAutolinkHeadings,
                {
                  behavior: 'append',
                  properties: { className: ['heading-anchor'], ariaLabel: 'Link to this section' },
                  content: { type: 'text', value: '#' },
                },
              ],
            ],
          },
        }}
      />
    </div>
  );
}
