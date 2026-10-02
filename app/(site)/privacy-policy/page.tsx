import Link from 'next/link';
import { contactEmail } from '@/lib/site';
import { pageMetadata } from '@/lib/seo';
import { StaticPage } from '@/components/site/StaticPage';

export const metadata = pageMetadata({
  title: 'Privacy policy',
  description: 'How ElectricMood collects, uses and protects information about visitors.',
  path: '/privacy-policy/',
});

// Template only — have it reviewed for your jurisdiction (GDPR/UK GDPR/CCPA) and update it
// whenever you add analytics, ads, newsletters or comments.
export default function PrivacyPolicyPage() {
  return (
    <StaticPage title="Privacy policy" path="/privacy-policy/" updated="October 1, 2026">
      <p>
        This policy explains what information ElectricMood (“we”, “us”) collects when you visit electricmood.com and how
        we use it.
      </p>
      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Server logs.</strong> Our hosting provider records standard request data (IP address, browser, pages
          requested, time) for security and reliability.
        </li>
        <li>
          <strong>Messages you send us.</strong> If you email us or use the contact form, we keep your name, email
          address and message to reply. Contact form submissions are stored by Netlify (Netlify Forms).
        </li>
      </ul>
      <p>We do not sell personal information and we do not run user accounts for readers.</p>
      <h2>Cookies and affiliate links</h2>
      <p>
        This site does not set its own tracking cookies. When you click an affiliate link, the retailer may set cookies to
        attribute a purchase to us; their own privacy policy applies on their site. See our{' '}
        <Link href="/affiliate-disclosure/">affiliate disclosure</Link>.
      </p>
      <h2>Third-party services</h2>
      <p>Images are delivered by Cloudinary and the site is hosted on Netlify; both process request data to serve content.</p>
      <h2>Your rights</h2>
      <p>
        Depending on where you live you may have the right to access, correct or delete personal information we hold about
        you. Email <a href={`mailto:${contactEmail}`}>{contactEmail}</a> and we will respond within 30 days.
      </p>
      <h2>Changes</h2>
      <p>We will update this page when our practices change and revise the date above.</p>
    </StaticPage>
  );
}
