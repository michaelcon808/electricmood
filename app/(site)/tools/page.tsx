import Link from 'next/link';
import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { paths } from '@/lib/site';
import { TOOLS } from '@/lib/tools';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { PageHeader } from '@/components/site/PageHeader';

export const metadata: Metadata = pageMetadata({
  title: 'Free e-bike, e-scooter & power station calculators',
  description: 'Free calculators for real-world e-bike and e-scooter range, charging time and cost, and portable power station sizing.',
  path: paths.tools,
});

export default function ToolsPage() {
  return (
    <div className="container-page py-12">
      <Breadcrumbs items={[{ name: 'Tools', path: paths.tools }]} />
      <PageHeader
        eyebrow="Free tools"
        title="Calculators"
        description="Quick, private calculators — everything runs in your browser and nothing is sent anywhere."
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((t) => (
          <Link key={t.slug} href={paths.tool(t.slug)} className="card p-6 transition-colors hover:border-brand-500">
            <p className="text-3xl" aria-hidden>
              {t.icon}
            </p>
            <h2 className="mt-3 text-lg font-bold">{t.name}</h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{t.short}</p>
            <p className="mt-4 text-sm font-semibold text-brand-600 dark:text-brand-400">Open calculator →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
