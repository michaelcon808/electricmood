import { cloudinaryCloudName } from './site';

const UPLOAD_MARKER = '/image/upload/';

export function isCloudinaryUrl(src: string): boolean {
  return /^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(src);
}

/**
 * Builds a Cloudinary delivery URL with automatic format/quality and a width.
 * Accepts a full res.cloudinary.com URL or a public ID ("folder/name.jpg", needs
 * NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME). Any other URL is returned unchanged.
 */
export function cld(src: string, opts: { width?: number; height?: number; crop?: 'limit' | 'fill' } = {}): string {
  const parts = ['f_auto', 'q_auto'];
  if (opts.width) parts.push(`w_${Math.round(opts.width)}`);
  if (opts.height) parts.push(`h_${Math.round(opts.height)}`);
  if (opts.width || opts.height) parts.push(`c_${opts.crop ?? 'limit'}`);
  const transform = parts.join(',');

  if (isCloudinaryUrl(src)) return src.replace(UPLOAD_MARKER, `${UPLOAD_MARKER}${transform}/`);
  if (/^(https?:)?\/\//.test(src) || src.startsWith('/')) return src;
  if (!cloudinaryCloudName) {
    throw new Error(`Image "${src}" looks like a Cloudinary public ID but NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set`);
  }
  return `https://res.cloudinary.com/${cloudinaryCloudName}/image/upload/${transform}/${src.replace(/^\/+/, '')}`;
}

const WIDTHS = [320, 480, 640, 768, 960, 1200, 1600, 2000];

/** srcset for a responsive image, capped at 2× the rendered width. */
export function cldSrcSet(src: string, maxWidth: number): string | undefined {
  if (!isCloudinaryUrl(src) && (/^(https?:)?\/\//.test(src) || src.startsWith('/'))) return undefined;
  const widths = WIDTHS.filter((w) => w <= maxWidth * 2);
  if (!widths.length) return undefined;
  return widths.map((w) => `${cld(src, { width: w })} ${w}w`).join(', ');
}
