const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

/** @type {(phase: string) => import('next').NextConfig} */
module.exports = (phase) => ({
  // Fully static site: `next build` writes plain HTML/CSS/JS to /out. No server code at runtime.
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  // Images are served by Cloudinary (see lib/cloudinary.ts + components/site/Img.tsx).
  images: { unoptimized: true },
  // Files named page.dev.tsx are routes ONLY under `next dev` (used by the studio preview);
  // `next build` ignores them, so they can never ship to the live site.
  pageExtensions: phase === PHASE_DEVELOPMENT_SERVER ? ['dev.tsx', 'tsx', 'ts', 'jsx', 'js'] : ['tsx', 'ts', 'jsx', 'js'],
  // Redirects are not supported by static export: redirects.json is converted to
  // public/_redirects (Netlify format) by scripts/generate-redirects.mjs during prebuild.
});
