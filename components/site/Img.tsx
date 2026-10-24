import { cld, cldSrcSet, isPlaceholderImage } from '@/lib/cloudinary';

export type ImgProps = {
  /** Full res.cloudinary.com URL or a Cloudinary public ID. */
  src: string;
  /** Required. Describe the image; use "" only for purely decorative images. */
  alt: string;
  /** Intrinsic size hints — reserve layout space and prevent CLS. */
  width: number;
  height: number;
  /** Rendered width hint for the browser, e.g. "(min-width: 768px) 720px, 100vw". */
  sizes?: string;
  /** Above-the-fold images (e.g. the post cover): eager + high fetch priority. */
  priority?: boolean;
  className?: string;
  caption?: string;
  /** Crop to exactly width × height on Cloudinary (sharp at any shape), instead of scaling the original. */
  fill?: boolean;
};

/** Static, Cloudinary-optimised <img>: f_auto,q_auto, responsive srcset, lazy by default. Zero client JS. */
export function Img({ src, alt, width, height, sizes, priority = false, className, caption, fill = false }: ImgProps) {
  // Placeholder cover (e.g. "CLOUDINARY_URL_HERE"): show a neutral gradient, never a broken image.
  if (isPlaceholderImage(src)) {
    return (
      <div
        aria-hidden
        style={{ aspectRatio: `${width} / ${height}` }}
        className={`${className ?? 'w-full rounded-lg'} bg-gradient-to-br from-brand-500 to-emerald-900`}
      />
    );
  }
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={fill ? cld(src, { width, height, crop: 'fill' }) : cld(src, { width })}
      srcSet={cldSrcSet(src, width, fill ? height / width : undefined)}
      sizes={sizes ?? `(min-width: ${width}px) ${width}px, 100vw`}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding={priority ? 'sync' : 'async'}
      className={className ?? 'h-auto w-full rounded-lg'}
    />
  );
  if (!caption) return img;
  return (
    <figure>
      {img}
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
