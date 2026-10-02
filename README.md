# ElectricMood

A fully static blog for **electricmood.com**: e-scooter and e-bike reviews, guides and free calculators.

Built with Next.js (App Router, `output: 'export'`), TypeScript, Tailwind, MDX, Cloudinary and Pagefind, and hosted on Netlify's free plan.

There is **no server, database, API, or secret** anywhere in the project. `npm run build` produces plain HTML/CSS/JS in `out/`, and Netlify serves those files.

---

## Quick start

```bash
nvm use            # Node 22 (see .nvmrc)
npm install
cp .env.example .env.local
npm run dev        # http://localhost:3000
```

To see exactly what will be deployed, including search, build and serve the static output:

```bash
npm run build      # check content → build to out/ → index search with Pagefind
npm run preview    # serves out/ at http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Local dev server. Drafts and future-dated posts are hidden here too. Search only works after a build. |
| `npm run build` | `prebuild` (content check + redirects) → `next build` → `postbuild` (Pagefind index). |
| `npm run check-content` | Validates every post (see [Content checks](#content-checks)). |
| `npm run preview` | Serves `out/` locally. |
| `npm run lint` | TypeScript type check. |

## Project structure

```
content/posts/*.mdx        ← your articles (one file per post)
app/(site)/…               ← pages: home, blog, categories, tags, tools, search, legal pages
app/sitemap.ts robots.ts feed.xml/   ← generated at build time
components/mdx/            ← components you can use inside posts
components/tools/          ← calculator UIs (client-side) + shared ToolPage layout
lib/schema.ts              ← frontmatter rules (zod)
lib/content.ts             ← reads posts, filters drafts/future posts
lib/tools.ts               ← tool registry: copy, formulas, FAQs, recommendations
lib/calculators.ts         ← calculator maths
redirects.json             ← your 301s (converted to public/_redirects at build)
scripts/                   ← check-content.ts, generate-redirects.mjs
```

---

## Writing a post

1. Create `content/posts/<slug>.mdx`. Name the file after the slug for sanity.
2. Add frontmatter, then write Markdown/MDX below it:

```mdx
---
title: "Segway Ninebot Max G2 Review: 6 Months of Commuting"
slug: segway-ninebot-max-g2-review          # lowercase-with-hyphens, must be unique
description: "Our long-term Ninebot Max G2 review: real-world range, ride comfort, braking and build quality after six months of daily city commuting."
date: 2026-10-05                            # publish date (future = hidden until a build after this date)
updated: 2026-11-01                         # optional
category: e-scooters
tags: [commuter, long-range]
postType: review                            # review | guide | comparison | info
cover: https://res.cloudinary.com/<cloud>/image/upload/v123/electricmood/g2-cover.jpg
coverAlt: Segway Ninebot Max G2 parked on a city bike lane
draft: false                                # true = never built
author: Jane Doe                            # optional, defaults to "ElectricMood Editorial Team"

# Reviews only (all optional):
productName: Segway Ninebot Max G2
rating: 4.4                                 # 0–5. Review JSON-LD is only emitted when this is set
testedHandsOn: true
pros: [Excellent range, Comfortable tyres]
cons: [Heavy to carry]
bestFor: Long commutes
affiliateLinks:
  - label: Check price
    url: https://www.amazon.com/dp/XXXX
    merchant: Amazon

# Any post type (optional):
faqs:                                       # rendered as an FAQ block + FAQPage JSON-LD
  - question: How far does it really go?
    answer: About 50 km in our mixed commuting.
noindex: false                              # true = keep this post out of search engines/sitemap/RSS
---

## First section

Body text in **Markdown**. `##` and `###` headings build the table of contents automatically.
```

### Frontmatter rules

The build **fails** with a clear message if any rule is broken:

- Required: `title`, `slug`, `description`, `date`, `category`, `postType`, `cover`, `coverAlt`.
- `slug`, `category` and `tags` must be clean slugs (`a-z`, `0-9`, single hyphens).
- `cover` must be a `res.cloudinary.com` URL or a Cloudinary public ID.
- `rating` is only allowed on reviews. Unknown keys are rejected, which catches typos like `catgory`.

### Content checks

`npm run check-content` runs automatically before every build and checks:

- every post has **alt text**: `coverAlt`, every `![alt](…)` image, every `<Img alt>` and every `<ProductBox imageAlt>`
- the `description` is **120–160 characters**
- every **slug is unique**, drafts included
- every tool in `lib/tools.ts` has a page

Problems in published posts fail the build. Problems in drafts are only warnings.

### Drafts and scheduling

A post is built only if `draft` is not `true` **and** its `date` is today or earlier **at build time**. Otherwise it doesn't exist anywhere: no page, lists, sitemap, RSS or search.

Because the site is static, a future-dated post goes live on the **first build after its date**. To publish on a schedule, trigger a deploy that day (see below), or just merge when it's time.

### Links

| You write | Result |
| --- | --- |
| `[e-bike guide](/blog/how-to-choose-an-e-bike/)` | Internal link. Use trailing slashes. |
| `[Bosch](https://bosch-ebike.com)` | External link, opens in a new tab with `rel="noopener noreferrer"`. |
| `[Check price](https://amzn.to/xyz#aff)` | **Affiliate link**: `#aff` is stripped and the link gets `rel="sponsored nofollow noopener"` and a new tab. |
| A URL listed in `affiliateLinks` | Treated as an affiliate link automatically wherever it appears. |

Posts with affiliate links show the **disclosure banner automatically**. That covers `affiliateLinks` in frontmatter, `#aff` links, `<AffiliateLink>`, and `<ProductBox>`/`<BestFor>` components with `href`/`links`.

### MDX components

You can use these anywhere in a post, with no imports needed:

```mdx
<Callout type="tip" title="Optional title">Markdown **works** here.</Callout>   {/* info | tip | warning | danger */}

<Img src="https://res.cloudinary.com/…/photo.jpg" alt="Rider on a hill" width={1200} height={800} caption="Optional" />

<RatingBadge rating={4.5} />

<ProsCons />                                            {/* uses frontmatter pros/cons */}
<ProsCons pros={["Light"]} cons={["Pricey"]} />         {/* or pass your own */}

<BestFor label="Commuters" product="Model X" reason="Light and folds small" rating={4.3} href="https://…" cta="Check price" />

<ComparisonTable
  headers={["", "Model A", "Model B"]}
  rows={[["Range", "40 km", "55 km"], ["Weight", "14 kg", "19 kg"]]}
  highlight={2}
/>

<SpecTable specs={[{ label: "Range", value: "40 km" }, { label: "Weight", value: "14 kg" }]} />

<ProductBox name="Model X" image="https://res.cloudinary.com/…" imageAlt="Model X side view" rating={4.3}
  bestFor="Commuters" specs={[{ label: "Range", value: "40 km" }]}
  links={[{ label: "Check price", url: "https://…", merchant: "Amazon" }]} reviewHref="/blog/model-x-review/">
  Short summary in Markdown.
</ProductBox>

<AffiliateLink href="https://…">custom affiliate link</AffiliateLink>

<FAQ />                                                 {/* uses frontmatter faqs; otherwise they're added at the end */}
```

---

## Images: upload to Cloudinary and paste URLs

1. Log in to [Cloudinary](https://console.cloudinary.com) → **Media Library** → open (or create) an `electricmood` folder.
2. Drag your images in. Upload large originals (e.g. 2400 px wide); Cloudinary handles resizing.
3. Click an image → **Copy URL**. It looks like `https://res.cloudinary.com/<cloud>/image/upload/v1712345678/electricmood/scooter.jpg`
4. Paste it as `cover:` in frontmatter, or into `![alt text](URL)` / `<Img src="URL" …/>` in the body.

You don't need to add any transformations. The site automatically requests `f_auto,q_auto` (WebP/AVIF, auto quality) at the right width for each screen, with lazy loading.

**Tips:**
- If you set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, you can paste just the public ID instead of the full URL (e.g. `electricmood/scooter.jpg`).
- Markdown images default to a 16:9 layout box. For other shapes, add the size as the title (`![alt](URL "1200x800")`) or use `<Img width height>`.
- Always write meaningful alt text. The build fails without it.

---

## Workflow: drafts branch → merge to main to publish

Every **production deploy uses Netlify build credits**, so don't deploy on every save:

1. Work on a `drafts` branch (or one branch per article):
   ```bash
   git switch -c drafts
   # write content/posts/my-new-post.mdx, preview with npm run dev
   git commit -am "Draft: my new post" && git push -u origin drafts
   ```
2. Preview locally (`npm run dev`, or `npm run build && npm run preview` for the exact output).
3. When one or more posts are ready, **merge into `main`**. That single merge triggers one production deploy:
   ```bash
   git switch main && git merge drafts && git push
   ```
4. Batch several posts or fixes into one merge to save credits.

Set up Netlify so other branches don't cost builds. Go to **Site configuration → Build & deploy → Branches and deploy contexts**: set *Branch deploys* to **None** and turn off *Deploy Previews* unless you want them. You can also keep `draft: true` posts on `main`, since they're never built.

**Publishing future-dated posts automatically (optional):** create a build hook (**Build & deploy → Build hooks**) and call it once on the day, e.g. from a scheduled GitHub Action. Each call is a deploy, so schedule sparingly.

---

## Adding a new tool

Each tool has its own route folder, so its JavaScript loads only on its own page.

1. **Logic.** Add a pure function to `lib/calculators.ts` (e.g. `estimateHillClimb()`).
2. **Content.** Add an entry to `TOOLS` in `lib/tools.ts` with `slug`, `name`, `icon`, `short`, `title`, `description` (aim for 120–160 characters), `intro`, `formula`, `assumptions`, `explainer`, `faqs` and `recommendedPostSlugs`.
3. **UI.** Create `components/tools/HillClimbCalculator.tsx` starting with `'use client'`, reusing `NumberField`, `SelectField`, `ResultsPanel` and `ResultCard` from `components/tools/fields.tsx`.
4. **Page.** Create `app/(site)/tools/<slug>/page.tsx`:
   ```tsx
   import { ToolPage, toolMetadata } from '@/components/tools/ToolPage';
   import HillClimbCalculator from '@/components/tools/HillClimbCalculator';

   const SLUG = 'hill-climb-calculator';
   export const metadata = toolMetadata(SLUG);

   export default function Page() {
     return (
       <ToolPage slug={SLUG}>
         <HillClimbCalculator />
       </ToolPage>
     );
   }
   ```

The tools index, homepage, sitemap, search, FAQ/WebApplication JSON-LD and recommended-products box pick it up automatically. `check-content` fails if step 4 is missing.

---

## Redirects (old ElectricMood URLs)

Add 301s to `redirects.json`:

```json
[
  { "source": "/2019/05/best-scooters/", "destination": "/blog/best-commuter-e-scooters/" },
  { "source": "/old-category/*", "destination": "/category/e-scooters/" }
]
```

During `prebuild` this becomes `public/_redirects` (Netlify format, all 301), which ships inside `out/`. Don't edit `public/_redirects` by hand; it's generated and gitignored.

## Search

[Pagefind](https://pagefind.app) indexes the built HTML after `next build`, covering post bodies and tool pages. The `/search/` page loads the index in the browser only when someone uses it. Drafts and future posts are never built, so they're never indexed. Search doesn't work in `npm run dev`; use `npm run build && npm run preview`.

## Contact form (optional)

`/contact/` has a plain HTML form handled by **Netlify Forms**, with no JS and no backend. `public/__forms.html` registers it at deploy time.

To set it up:
1. In Netlify, go to **Forms → Enable form detection**.
2. Redeploy.
3. Submissions appear under **Forms**. Add email notifications under **Forms → Form notifications**.

To remove the form, set `CONTACT_FORM_ENABLED = false` in `lib/constants.ts`. The page then shows only the email address.

---

## Deploying to Netlify

1. Push the repo to GitHub.
2. In Netlify, go to **Add new site → Import an existing project** and pick the repo. Settings come from `netlify.toml`:
   - build command `npm run build`
   - publish directory `out`
   - Node 22
   - Netlify's Next.js server runtime is skipped (`NETLIFY_NEXT_PLUGIN_SKIP`), because this is a plain static site.
3. Under **Site configuration → Environment variables**, add:
   - `NEXT_PUBLIC_SITE_URL` = `https://electricmood.com`
   - `NEXT_PUBLIC_NOINDEX` = `true` (until launch)
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` = your cloud name (optional)
4. Deploy, then add your domain under **Domain management**.

## Launch: turning off noindex

While `NEXT_PUBLIC_NOINDEX=true`:
- every page has `<meta name="robots" content="noindex, nofollow">`
- `robots.txt` is `Disallow: /`
- the sitemap is empty

To launch:
1. In Netlify, set `NEXT_PUBLIC_NOINDEX` to `false`.
2. **Trigger a deploy** (**Deploys → Trigger deploy → Deploy site**). Values are baked in at build time, so nothing changes until you rebuild.
3. Check the result:
   - `https://electricmood.com/robots.txt` shows `Allow: /` and a `Sitemap:` line
   - view-source on the homepage has no `noindex`
   - `/sitemap.xml` lists your posts
4. Submit `https://electricmood.com/sitemap.xml` in Google Search Console.

## Before launch

- Delete the `sample-*.mdx` posts and `example-draft-post.mdx`. The sample products are fictional.
- Update `recommendedPostSlugs` in `lib/tools.ts` to point at your real reviews.
- Check `contactEmail` in `lib/site.ts`.
- Review the privacy policy and affiliate disclosure for your jurisdiction and affiliate programmes (Amazon Associates, for example, requires specific wording).
