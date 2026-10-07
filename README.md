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
npm run build      # check content + structure → build to out/ → index search with Pagefind
npm run preview    # serves out/ at http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run studio` | The local post editor at http://localhost:4321 (see [Writing posts in the Studio](#writing-posts-in-the-studio)). |
| `npm run dev` | Local dev server. Drafts and future-dated posts are hidden here too. Search only works after a build. |
| `npm run build` | `prebuild` (content check, structure check, redirects) → `next build` → `postbuild` (Pagefind index). |
| `npm run check-content` | Validates every post (see [Content checks](#build-checks)). |
| `npm run check:structure` | Validates links between posts and prints the link-count table (see [Build checks](#build-checks)). |
| `npm run preview` | Serves `out/` locally. |
| `npm run lint` | TypeScript type check. |

## Site structure (silos)

```
Home
├── Electric scooters   (silo hub)  /electric-scooters/
│   ├── Reviews         (section hub)  /electric-scooters/reviews/   (named "Reviews" in the header menu, breadcrumbs and URL; "Buying guides" inside pages)
│   ├── Accessories                    /electric-scooters/accessories/
│   └── Guides                         /electric-scooters/guides/
├── Electric bikes      (same three sections)
├── Electric skateboards (same three sections)
└── Shared: Tools (/tools/) and Learn (/learn/): linked from every silo
```

| URL | What it is |
| --- | --- |
| `/` | Home |
| `/{silo}/` | Silo hub (purple accent): intro, three section cards, "Start here", Tools and Learn strip |
| `/{silo}/{section}/` | Section hub (teal accent): **every** published post in the section, with type badges |
| `/{post-slug}/` | A post (MDX file in `content/posts/`). **Flat: no silo or section folders in the URL.** No year in slugs. Slugs are unique across the whole site (a duplicate fails the build). |
| `/tools/`, `/tools/{tool}/` | Calculators |
| `/learn/`, `/learn/{slug}/` | Shared articles (MDX in `content/learn/`) |

Silo and section only decide where a post appears in the **header menu, breadcrumbs and hub pages**; they never appear in the post's URL. Slugs can't be `tools`, `learn`, `search`, `about`, a silo name, etc. (the build rejects them).

**`config/site-structure.ts` is the single source of truth.** Silo names, short labels, section names, descriptions and the Tools/Learn group are defined only there. The header menu, hubs, breadcrumbs, sitemap, footer and frontmatter validation all read from it, so renaming something there updates the whole site.

- Section hub heading = `{silo.shortLabel} {section.label in lower case}`, e.g. "Scooter accessories", "E-bike guides". The menu and breadcrumbs use the plain section label ("Accessories").
- To **add a section**, add it to `SECTIONS`. It appears in every silo's menu and hubs automatically. To **add a silo**, add it to `SILOS`.
- A section with no published posts still has a hub page that says "Coming soon" (so the menu never links to a 404). It's `noindex` and left out of the sitemap until it has a post.

Colour accents (flat Tailwind, light and dark): silo = purple, section = teal, **money posts = coral**, info posts = gray, shared pages = gray. They're defined in `components/site/accents.ts`.

## Project structure

```
config/site-structure.ts   ← silos, sections, shared pages, breadcrumb builder
content/posts/*.mdx        ← your posts (silo + section in frontmatter)
content/learn/*.mdx        ← Learn articles
app/(site)/[silo]/…        ← silo hub, section hub, post pages (generateStaticParams, dynamicParams = false)
app/(site)/tools/…         ← one folder per tool; learn/ ← Learn pages
app/sitemap.ts robots.ts feed.xml/   ← generated at build time
components/site/           ← header menu (HeaderNav), breadcrumbs, link boxes, cards
components/mdx/            ← components you can use inside posts
components/tools/          ← calculator UIs (client-side) + shared ToolPage layout
lib/schema.ts              ← frontmatter rules (zod, validated against the config)
lib/content.ts             ← reads posts, filters drafts/future posts
lib/links.ts               ← the internal-link graph (money, siblings, parallel…)
lib/tools.ts               ← tool registry: copy, formulas, FAQs, recommendations
redirects.json             ← your 301s (converted to public/_redirects at build)
scripts/                   ← check-content.ts, check-structure.ts, generate-redirects.mjs
```

---

## Writing a post by hand

Prefer the [Studio](#writing-posts-in-the-studio). To write the file yourself:

1. Create `content/posts/<slug>.mdx` (name the file after the slug).
2. Add frontmatter, then write Markdown/MDX below it:

```mdx
---
title: "Best Locks for Electric Scooters"
slug: best-locks                              # unique within its section; no year
description: "Our picks for the best electric scooter locks, from compact folding locks to heavy chains, with what to look for in material and security rating."   # 120–160 chars
date: 2026-10-05                              # future date = hidden until a build after that day
silo: electric-scooters                       # electric-scooters | electric-bikes | electric-skateboards
section: accessories                          # reviews | accessories | guides  (the older name buying-guides still works)
postType: money                               # money | info | comparison
cover: https://res.cloudinary.com/<cloud>/image/upload/v123/electricmood/locks.jpg
coverAlt: A heavy-duty chain lock on a scooter
draft: false

# Link fields (all optional except moneyPost on info posts):
moneyPost: best-locks                         # INFO posts only: slug of the money post to point readers to
siblings: [best-gps-trackers]                 # other posts in the SAME section (slugs)
parallel: [best-e-bike-locks]                 # same topic in ANOTHER silo (slug)
tool: charging-time-calculator                # a tool under /tools/

# Optional extras:
tags: [theft-protection]
bestFor: Daily commuters
rating: 4.4                                   # money posts only; enables Review JSON-LD
affiliateLinks:
  - label: Check price
    url: https://www.amazon.com/dp/XXXX
    merchant: Amazon
faqs:
  - question: Are folding locks secure?
    answer: Good ones are, but chains are tougher.
---

## First section

Body text in **Markdown**. `##` and `###` headings build the table of contents automatically.
```

### Post types

| Type | Role | Notes |
| --- | --- | --- |
| `money` | A page that helps readers buy (best-of lists, roundups). Coral badge. | Can have `rating`, `affiliateLinks`, `bestFor`. |
| `info` | A how-to or explainer. Gray badge. | **Must** set `moneyPost`. |
| `comparison` | Head-to-head comparisons. Neutral badge. | No extra requirements. |

The badge wording lives in `POST_TYPE_LABELS` in `lib/constants.ts`.

### Frontmatter rules

The build **fails** with a clear message if any rule is broken: required fields (`title`, `slug`, `description`, `date`, `silo`, `section`, `postType`, `cover`, `coverAlt`), `silo`/`section` must exist in the config, slugs use lowercase letters, numbers and hyphens, `cover` must be a `res.cloudinary.com` URL or a public ID, `rating` is money-only, `moneyPost` is info-only, and unknown keys are rejected (this catches typos).

### The internal links the site builds for you

| Link type | You write | The site renders |
| --- | --- | --- |
| **Hub ↔ post** | nothing | The section hub lists **every** published post. Every post has breadcrumbs plus a "← Back to {section hub}" link at the top and bottom. |
| **Info → money** | `moneyPost` on the info post | A highlighted "Ready to buy? See {Money post}" callout right after the intro. The money post gets a **Learn more** box listing the info posts that point to it. |
| **Siblings** | `siblings: [...]` (optional) | A "More in {Section}" box with 3 posts: the listed siblings first, then the rest of the section (money posts first). Never the post itself. |
| **Parallel** | `parallel: [slug]` on **either** post | A "Same topic for {other silo}" box on **both** posts. If A lists B, B shows A automatically. |
| **Tool** | `tool: slug` | A call-to-action box to the tool, and the tool page lists every post that uses it. |
| **Shared** | nothing | Every silo hub shows a Tools and Learn strip. Tools and Learn are in the header menu on every page. |

`moneyPost`, `siblings` and `parallel` are post slugs. A money post can live in any section; siblings must be in the same section; parallel posts must be in another silo.

### Pending links (referencing posts that don't exist yet)

You can reference posts you haven't written yet. A `moneyPost`, sibling, parallel or `/slug/` body link whose target doesn't exist (or is still a draft) is a **warning, not a failure**: it's hidden on the page (body links show as plain text) and **switches on automatically** once that post is published. `npm run check:structure` prints the full list of unresolved links. Real mistakes (a money post that isn't a money post, a self link, a parallel in the same silo, a duplicate slug) still fail the build.

### Drafts and scheduling

A post is built only if `draft` is not `true` **and** its `date` is today or earlier **at build time**. Otherwise it doesn't exist anywhere in a production build: no page, hub, menu, sitemap, RSS or search.

**Previewing a draft:** in `npm run dev`, a draft (or future-dated) post is available at its own URL (`/your-slug/`) with a "Draft preview" banner and `noindex`. It still doesn't appear in lists, hubs, the sitemap, RSS or search.

Because the site is static, a future-dated post goes live on the **first build after its date**.

### Links inside the body

| You write | Result |
| --- | --- |
| `[guide](/electric-bike-laws-by-state/)` | Internal link to another post: just `/slug/` (with the trailing slash). Body links also count as inbound links in the build report. Until the target exists it shows as plain text. |
| `[Bosch](https://bosch-ebike.com)` | External link, new tab, `rel="noopener noreferrer"`. A `rel` you write yourself (e.g. `<a rel="nofollow noopener">` for image credits) is kept. |
| `[Check price](https://amzn.to/xyz#aff)` | **Affiliate link**: `#aff` is stripped; the link gets `rel="sponsored nofollow noopener"` and opens in a new tab. |
| A URL listed in `affiliateLinks` | Treated as an affiliate link wherever it appears. |

Posts with affiliate links show the **disclosure banner automatically**.

### MDX components

Available in every post with no imports:

```mdx
<Callout type="tip" title="Optional title">Markdown **works** here.</Callout>   {/* info | tip | warning | danger */}
<Img src="https://res.cloudinary.com/…/photo.jpg" alt="Rider on a hill" width={1200} height={800} caption="Optional" />
<RatingBadge rating={4.5} />
<ProsCons />                                            {/* uses frontmatter pros/cons, or pass pros={[]} cons={[]} */}
<BestFor label="Commuters" product="Model X" reason="Light and folds small" rating={4.3} href="https://…" cta="Check price" />
<ComparisonTable headers={["", "A", "B"]} rows={[["Range", "40 km", "55 km"]]} highlight={2} />
<SpecTable specs={[{ label: "Range", value: "40 km" }]} />
<ProductBox name="Model X" image="https://res.cloudinary.com/…" imageAlt="Model X" rating={4.3} bestFor="Commuters"
  specs={[{ label: "Range", value: "40 km" }]} links={[{ label: "Check price", url: "https://…", merchant: "Amazon" }]}>
  Short summary in Markdown.
</ProductBox>
<AffiliateLink href="https://…">custom affiliate link</AffiliateLink>
<FAQ />                                                 {/* uses frontmatter faqs; otherwise added at the end */}
```

## Navigation and breadcrumbs

- **Header menu** (rendered from the config plus the published post index; no hard-coded links): Electric scooters, Electric bikes, Electric skateboards, a divider, then Tools and Learn.
  - **Desktop:** hovering a silo opens a panel after ~80 ms and closes ~150 ms after the pointer leaves. The panel has "All {silo}", the three sections with a one-line description, and up to 3 featured posts per section (money posts first). Clicking a silo goes to its hub, clicking a section goes to the section hub.
  - **Keyboard:** the panel opens on focus; Enter/Space on the chevron toggles it; ↓ moves into the panel and between items; ←/→ move between silos; Esc closes and returns focus; clicking outside closes. Uses `aria-expanded` and `aria-haspopup`, with visible focus rings.
  - **Mobile (under 1024px):** a hamburger opens a full-width panel with an accordion per silo and a "Shared" group. It closes on route change and Esc, and focus is trapped while it's open.
  - The active silo and section are highlighted from the URL. The header is sticky.
- **Breadcrumbs** appear under the header on every page except home, with `BreadcrumbList` JSON-LD using absolute URLs. Labels always come from the config, never from the URL. Long titles are cut to 60 characters on mobile.

## Build checks

`npm run build` runs two checks first (also runnable on their own):

**`npm run check-content`** — alt text on the cover and every image in the body, descriptions 120–160 characters, valid frontmatter, no duplicate slug in a section, and every tool has a page.

**`npm run check:structure`** — **fails** the build if: a post has an invalid silo or section; a slug is duplicated within a section; an info post has no valid `moneyPost` (it must exist, be published and be a money post); a sibling or parallel target doesn't exist or isn't published; a post is missing from its section hub; or a breadcrumb points to a URL that doesn't exist. It **warns** (without failing) when a post has fewer than 3 inbound internal links (its hub counts as one), and prints a table of inbound and outbound link counts for every post.

Problems in published posts fail; problems in drafts are warnings.

## The inbox workflow (adding articles by dropping files)

1. Put the `.mdx` file in `content/inbox/` and tell Claude it's there.
2. Claude wires it in **without editing your article**:
   - The file is copied unchanged to `content/posts/<file>.mdx` (your original is kept in `content/inbox/done/`). The frontmatter fields accepted are: title, slug, description, date, updated, silo, section, postType, primaryKeyword, moneyPost, siblings, parallel, tool, cover, coverAlt, draft, author, tags.
   - The post is served at `/<slug>/`. Tags may contain spaces.
   - A leading `# Title` in the body is hidden at render time (the page already shows the title as the one H1).
   - A placeholder cover (`CLOUDINARY_URL_HERE`) is fine while `draft: true`: no image is shown and no broken link is emitted. The build **fails** if a *published* post still has the placeholder.
   - The FAQ structured data is built from the `###` questions under a `## Frequently asked questions` heading.
3. Claude runs the checks, `npm run build` and the dev server, then reports: files changed, any frontmatter changes (none needed), unresolved links, word count, warnings.
4. Nothing is committed, pushed or deployed until you ask.

## Writing posts in the Studio

The Studio is a local editor with a form for every field and a live preview. It writes the post file for you. It runs **only on your computer**, is never deployed, and **never commits**: you commit when you're ready.

```bash
npm run studio     # opens http://localhost:4321 (also starts the dev server on :3000 for previews)
```

**The workflow:**

1. Click **+ New post**, or pick an existing post in the sidebar to edit it.
2. Fill in the form:
   - **Basics:** title (the slug fills itself in, with years stripped), description (with a 120–160 character counter), date and author.
   - **Placement:** silo, section and post type, all as dropdowns from `config/site-structure.ts`.
   - **Links:**
     - The money post for an info post is chosen from your real money posts.
     - Siblings and parallel posts are checklists of existing posts.
     - The related tool is a dropdown.
   - **Cover:** drop an image to upload it to Cloudinary, or paste a URL. Alt text is required.
   - **Article:** Markdown with a toolbar for headings, links, affiliate links, tables, Callout, Best for, Pros/cons, Comparison, Specs, Product box, FAQ, image upload and an internal-link picker.
   - **Extras:** affiliate links, rating, pros/cons, product name, FAQ and noindex.
3. Watch the **live preview** on the right. It's the real post page, rendered by the site's own components.
4. **Check** shows any problems next to the fields. **Add post** (or **Save changes**, Ctrl/⌘+S) runs the same rules as the build and writes `content/posts/<slug>.mdx`. Nothing is saved if there are errors. It also refuses a change that would break another post, such as renaming a slug that another post links to.
5. When you're happy, commit, push, merge to `main`, and Netlify publishes it.

New posts start as **Draft**. Untick Draft to publish them on the next deploy.

**Image uploads (optional, one-time setup):**
1. In Cloudinary, go to **Settings → Upload → Upload presets → Add**. Set *Signing mode* to **Unsigned** and *Folder* to `electricmood`.
2. Add these to `.env.local`:
   ```
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   STUDIO_CLOUDINARY_UPLOAD_PRESET=your-preset-name
   ```
3. Restart `npm run studio`.

Neither value is a secret. Without them you can still paste Cloudinary URLs.

**How it's built:**
- `scripts/studio/server.mts` is a small Node server on `127.0.0.1:4321`.
- `scripts/studio/index.html` is the editor page.
- `app/(site)/studio-preview/page.dev.tsx` is the preview page. The `.dev.tsx` extension makes it a route only under `next dev`, so it can never ship.
- Validation is shared with the build checks in `lib/post-checks.ts`.
- The Studio only accepts requests from its own page.

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
2. **Content.** Add an entry to `TOOLS` in `lib/tools.ts` with `slug`, `name`, `icon`, `short`, `title`, `description` (aim for 120–160 characters), `intro`, `formula`, `assumptions`, `explainer`, `faqs` and `recommendedPosts` (post keys like `electric-scooters/accessories/best-locks`).
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

The tools index, header menu page, sitemap, search, FAQ/WebApplication JSON-LD and recommended-products box pick it up automatically. To link a post to the tool, set `tool: <slug>` in the post's frontmatter; the tool page then lists that post. `check-content` fails if step 4 is missing.

---

## Redirects (old ElectricMood URLs)

Add 301s to `redirects.json`:

```json
[
  { "source": "/2019/05/best-scooters/", "destination": "/best-commuter-electric-scooters/" },
  { "source": "/old-category/*", "destination": "/electric-scooters/" }
]
```

During `prebuild` this becomes `public/_redirects` (Netlify format, all 301), which ships inside `out/`. Old `/blog/…`, `/category/…` and `/tag/…` URLs no longer exist, so add 301s for any you published. Don't edit `public/_redirects` by hand; it's generated and gitignored.

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

- Delete the placeholder posts in `content/posts/`, the Learn article in `content/learn/`, and `example-draft-post.mdx`. The products in them are fictional.
- Update `recommendedPosts` (post keys like `electric-scooters/accessories/best-locks`) in `lib/tools.ts` to point at your real reviews.
- Check `contactEmail` in `lib/site.ts`.
- Review the privacy policy and affiliate disclosure for your jurisdiction and affiliate programmes (Amazon Associates, for example, requires specific wording).
