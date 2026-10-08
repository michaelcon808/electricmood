import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';
import { StaticPage } from '@/components/site/StaticPage';

export const metadata = pageMetadata({
  title: 'Affiliate disclosure',
  description: 'How ElectricMood earns money through affiliate links and how that affects (and doesn’t affect) our content.',
  path: '/affiliate-disclosure/',
});

export default function AffiliateDisclosurePage() {
  return (
    <StaticPage title="Affiliate disclosure" path="/affiliate-disclosure/">
      <p>
        ElectricMood is reader-supported. Some links on this site are affiliate links: if you click one and make a
        purchase, we may earn a commission from the retailer. You pay the same price either way.
      </p>
      <h2>Which links are affiliate links?</h2>
      <p>
        Articles that contain affiliate links show a disclosure notice near the top. Affiliate links are marked{' '}
        <code>rel=&quot;sponsored&quot;</code> and open in a new tab.
      </p>
      <h2>Does it affect our reviews?</h2>
      <p>
        No. Retailers and brands don’t pay for coverage or ratings, and they don’t see articles before publication. We
        recommend products we think are right for the reader, including ones we don’t earn a commission on.
      </p>
      <h2>Amazon Associates</h2>
      <p>
        ElectricMood is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program
        designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com. As an
        Amazon Associate I earn from qualifying purchases. If you click a link to Amazon from this site and buy something,
        we may earn a commission, and the price you pay does not change.
      </p>
      <p>
        Questions? <Link href="/contact/">Contact us</Link>.
      </p>
    </StaticPage>
  );
}
