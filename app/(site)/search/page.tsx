import type { Metadata } from 'next';
import { buildBreadcrumbs } from '@/config/site-structure';
import { pageMetadata } from '@/lib/seo';
import { paths } from '@/lib/site';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { PageHeader } from '@/components/site/PageHeader';
import { SearchBox } from '@/components/site/SearchBox';

export const metadata: Metadata = pageMetadata({
  title: 'Search',
  description: 'Search ElectricMood reviews, buying guides, explainers and calculators across scooters, bikes and skateboards.',
  path: paths.search,
  noindex: true,
});

export default function SearchPage() {
  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-2xl">
        <Breadcrumbs items={buildBreadcrumbs({ kind: 'page', label: 'Search', path: paths.search })} />
        <PageHeader title="Search" />
        <SearchBox />
      </div>
    </div>
  );
}
