import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';
import { StaticPage } from '@/components/site/StaticPage';

export const metadata = pageMetadata({
  title: 'Message sent',
  description: 'Thanks for contacting ElectricMood.',
  path: '/contact/thanks/',
  noindex: true,
});

export default function ContactThanksPage() {
  return (
    <StaticPage title="Thanks — message sent" path="/contact/thanks/">
      <p>We’ve received your message and usually reply within a few working days.</p>
      <p>
        <Link href="/blog/">Back to the articles →</Link>
      </p>
    </StaticPage>
  );
}
