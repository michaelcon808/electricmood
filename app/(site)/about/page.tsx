import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';
import { StaticPage } from '@/components/site/StaticPage';

export const metadata = pageMetadata({
  title: 'About ElectricMood',
  description: 'Who we are, how we review e-scooters and e-bikes, and how we keep our recommendations independent.',
  path: '/about/',
});

export default function AboutPage() {
  return (
    <StaticPage title="About ElectricMood" path="/about/">
      <p>
        ElectricMood helps riders choose, use and maintain electric personal transport. We start with e-scooters and e-bikes
        and publish reviews, buying guides, head-to-head comparisons and practical explainers.
      </p>
      <h2>How we review</h2>
      <ul>
        <li>
          <strong>Hands-on when we can.</strong> Reviews marked “Tested hands-on” are based on our own riding. Others are
          clearly labelled as researched reviews.
        </li>
        <li>
          <strong>Real-world numbers.</strong> Range, speed and charging claims are checked against real riding conditions
          wherever possible.
        </li>
        <li>
          <strong>Updated over time.</strong> Prices, models and firmware change; we update articles and show the date.
        </li>
      </ul>
      <h2>Independence</h2>
      <p>
        Some links earn us a commission. That pays for the site but never decides a verdict. Read our{' '}
        <Link href="/affiliate-disclosure/">affiliate disclosure</Link> for details.
      </p>
      <p>
        Questions or corrections? <Link href="/contact/">Get in touch</Link>.
      </p>
    </StaticPage>
  );
}
