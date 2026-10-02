/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static site: `next build` writes plain HTML/CSS/JS to /out. No server code at runtime.
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  // Images are served by Cloudinary (see lib/cloudinary.ts + components/site/Img.tsx).
  images: { unoptimized: true },
  // Redirects are not supported by static export: redirects.json is converted to
  // public/_redirects (Netlify format) by scripts/generate-redirects.mjs during prebuild.
};

module.exports = nextConfig;
