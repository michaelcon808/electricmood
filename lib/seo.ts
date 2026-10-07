import type { Metadata } from 'next';
import { getSection, getSilo } from '../config/site-structure';
import { DEFAULT_AUTHOR, SITE_NAME } from './constants';
import { absoluteUrl, isGlobalNoindex, siteUrl } from './site';
import { cld, isPlaceholderImage } from './cloudinary';
import type { Post } from './content';

type PageMetaInput = {
  title: string;
  description: string;
  /** Canonical path in trailing-slash form, e.g. "/tools/". */
  path: string;
  /** Use the title as-is instead of the "%s | ElectricMood" template. */
  absoluteTitle?: boolean;
  image?: { url: string; alt: string };
  noindex?: boolean;
  type?: 'website' | 'article';
};

const ogImage = (img: { url: string; alt: string }) => ({
  url: cld(img.url, { width: 1200, height: 630, crop: 'fill' }),
  width: 1200,
  height: 630,
  alt: img.alt,
});

/** Unique title, description, canonical, Open Graph and Twitter card for a page. */
export function pageMetadata(input: PageMetaInput): Metadata {
  const canonical = absoluteUrl(input.path);
  const fullTitle = input.absoluteTitle ? input.title : `${input.title} | ${SITE_NAME}`;
  const images = input.image ? [ogImage(input.image)] : undefined;
  const noindex = isGlobalNoindex || input.noindex;
  return {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description: input.description,
    alternates: { canonical },
    openGraph: {
      title: fullTitle,
      description: input.description,
      url: canonical,
      siteName: SITE_NAME,
      locale: 'en_US',
      type: input.type ?? 'website',
      images,
    },
    twitter: {
      card: images ? 'summary_large_image' : 'summary',
      title: fullTitle,
      description: input.description,
      images: images?.map((i) => i.url),
    },
    robots: noindex ? { index: false, follow: !isGlobalNoindex } : undefined,
  };
}

export function postMetadata(post: Post): Metadata {
  const base = pageMetadata({
    title: post.title,
    description: post.description,
    path: post.path,
    image: isPlaceholderImage(post.cover) ? undefined : { url: post.cover, alt: post.coverAlt },
    // Respect the noindex flag; drafts (only visible in `npm run dev`) are never indexable.
    noindex: post.noindex || post.draft,
    type: 'article',
  });
  return {
    ...base,
    authors: [{ name: post.author }],
    openGraph: {
      ...base.openGraph,
      type: 'article',
      publishedTime: post.dateISO,
      modifiedTime: post.updatedISO,
      authors: [post.author],
      section: getSection(post.section)?.contentLabel,
      tags: post.tags,
    },
  };
}

/* ---------------- JSON-LD ---------------- */

const publisher = { '@type': 'Organization', name: SITE_NAME, url: siteUrl };
const authorLd = (name: string) => ({ '@type': name === DEFAULT_AUTHOR ? 'Organization' : 'Person', name });

export function blogPostingJsonLd(post: Post) {
  const url = absoluteUrl(post.path);
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    image: isPlaceholderImage(post.cover) ? undefined : [cld(post.cover, { width: 1200 })],
    datePublished: post.dateISO,
    dateModified: post.updatedISO,
    author: authorLd(post.author),
    publisher,
    articleSection: `${getSilo(post.silo)?.label}: ${getSection(post.section)?.contentLabel}`,
    keywords: post.tags.join(', ') || undefined,
  };
}

/** Review → Product, only for money posts that carry a real rating. */
export function reviewJsonLd(post: Post) {
  if (post.postType !== 'money' || post.rating === undefined) return null;
  const list = (items: string[]) =>
    items.length
      ? { '@type': 'ItemList', itemListElement: items.map((name, i) => ({ '@type': 'ListItem', position: i + 1, name })) }
      : undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    name: post.title,
    url: absoluteUrl(post.path),
    datePublished: post.dateISO,
    author: authorLd(post.author),
    publisher,
    reviewBody: post.description,
    reviewRating: { '@type': 'Rating', ratingValue: post.rating, bestRating: 5, worstRating: 0 },
    positiveNotes: list(post.pros),
    negativeNotes: list(post.cons),
    itemReviewed: {
      '@type': 'Product',
      name: post.productName || post.title,
      image: isPlaceholderImage(post.cover) ? undefined : cld(post.cover, { width: 1200 }),
    },
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  if (!items.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
