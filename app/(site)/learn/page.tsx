import type { Metadata } from 'next';
import { getLearnPages } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';
import { paths } from '@/lib/site';
import { LearnIndex } from '@/components/site/LearnIndex';

export const metadata: Metadata = pageMetadata({
  title: 'Learn: battery safety, rules and travel',
  description: 'Shared guides for every electric ride: battery safety, the rules where you ride, and how to travel with scooters, bikes and boards.',
  path: paths.learn,
  // An empty "Coming soon" page is thin: keep it out of the index until the first article is published.
  noindex: getLearnPages().length === 0,
});

export default function LearnPage() {
  return <LearnIndex />;
}
