import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import type { Post } from '@/lib/content';
import { AFFILIATE_MARKER } from '@/lib/markdown';
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

/** Components available inside every MDX post. <ProsCons /> and <FAQ /> default to the post's frontmatter. */
function mdxComponents(post: Post) {
  const affiliateUrls = new Set(post.affiliateLinks.map((l) => normalize(l.url)));
  const siteHost = host(siteUrl);

  return {
    a({ href = '', children }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
      const marked = href.endsWith(AFFILIATE_MARKER);
      const url = marked ? href.slice(0, -AFFILIATE_MARKER.length) : href;
      if (marked || affiliateUrls.has(normalize(url))) return <AffiliateLink href={url}>{children}</AffiliateLink>;

      const h = host(url);
      if (/^https?:\/\//i.test(url) && h !== siteHost) {
        return (
          <a href={url} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        );
      }
      const internal = h === siteHost ? new URL(url).pathname : url;
      return internal.startsWith('/') ? <Link href={internal}>{children}</Link> : <a href={internal}>{children}</a>;
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
      <ProsCons pros={props.pros ?? post.pros} cons={props.cons ?? post.cons} />
    ),
    FAQ: (props: { items?: FaqItem[]; title?: string }) => <FAQ items={props.items ?? post.faqs} title={props.title} />,
  };
}

export async function MdxContent({ post }: { post: Post }) {
  return (
    <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-a:text-brand-600 dark:prose-a:text-brand-400 prose-img:my-6">
      <MDXRemote
        source={post.content}
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
