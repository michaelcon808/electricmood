import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/constants';
import { faqJsonLd, pageMetadata } from '@/lib/seo';
import { absoluteUrl, paths } from '@/lib/site';
import { getTool, type ToolInfo } from '@/lib/tools';
import { FAQ } from '@/components/mdx/FAQ';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { JsonLd } from '@/components/site/JsonLd';
import { RecommendedProducts } from '@/components/site/RecommendedProducts';

export function requireTool(slug: string): ToolInfo {
  const tool = getTool(slug);
  if (!tool) throw new Error(`Tool "${slug}" is missing from lib/tools.ts`);
  return tool;
}

export function toolMetadata(slug: string): Metadata {
  const tool = requireTool(slug);
  return pageMetadata({ title: tool.title, description: tool.description, path: paths.tool(tool.slug) });
}

/**
 * Shared server-rendered shell for every /tools/<slug>/ page: header, method, assumptions,
 * explainer, FAQ, JSON-LD and recommendations. The calculator itself is passed as children
 * from the tool's own page file, so each page only ships its own calculator's JS.
 */
export function ToolPage({ slug, children }: { slug: string; children: React.ReactNode }) {
  const tool = requireTool(slug);

  return (
    <div className="container-page py-12">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: tool.title,
          description: tool.description,
          url: absoluteUrl(paths.tool(tool.slug)),
          applicationCategory: 'UtilitiesApplication',
          operatingSystem: 'Any (web browser)',
          isAccessibleForFree: true,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          publisher: { '@type': 'Organization', name: SITE_NAME },
        }}
      />
      <JsonLd data={faqJsonLd(tool.faqs)} />

      <div className="mx-auto max-w-4xl" data-pagefind-body>
        <div data-pagefind-ignore>
          <Breadcrumbs
            items={[
              { name: 'Tools', path: paths.tools },
              { name: tool.name, path: paths.tool(tool.slug) },
            ]}
          />
        </div>
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400" data-pagefind-filter="type:Tool">
            Free calculator
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{tool.title}</h1>
          <p className="mt-3 text-lg text-neutral-600 dark:text-neutral-400">{tool.intro}</p>
        </header>

        <div data-pagefind-ignore>{children}</div>

        <section className="mt-12 grid gap-6 md:grid-cols-2" aria-label="Method">
          <div className="card p-5">
            <h2 className="mb-3 text-lg font-bold">How it’s calculated</h2>
            <ol className="space-y-2 font-mono text-sm">
              {tool.formula.map((f) => (
                <li key={f} className="rounded bg-neutral-100 px-3 py-2 dark:bg-neutral-800">
                  {f}
                </li>
              ))}
            </ol>
          </div>
          <div className="card p-5">
            <h2 className="mb-3 text-lg font-bold">Assumptions</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-neutral-700 dark:text-neutral-300">
              {tool.assumptions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        </section>

        <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-900/10 dark:text-amber-200">
          <strong>Estimates only.</strong> Results are approximations based on the assumptions above. Always check your
          manufacturer’s specifications and safety guidance.
        </p>

        <div className="prose prose-neutral mt-12 max-w-none dark:prose-invert">
          {tool.explainer.map((e) => (
            <section key={e.heading}>
              <h2>{e.heading}</h2>
              <p>{e.body}</p>
            </section>
          ))}
        </div>

        <FAQ items={tool.faqs} />
        <div data-pagefind-ignore>
          <RecommendedProducts slugs={tool.recommendedPostSlugs} />
        </div>
      </div>
    </div>
  );
}
