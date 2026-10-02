import { CONTACT_FORM_ENABLED } from '@/lib/constants';
import { contactEmail } from '@/lib/site';
import { pageMetadata } from '@/lib/seo';
import { StaticPage } from '@/components/site/StaticPage';

export const metadata = pageMetadata({
  title: 'Contact',
  description: 'Contact the ElectricMood team with questions, corrections, review requests or partnership enquiries.',
  path: '/contact/',
});

export default function ContactPage() {
  return (
    <StaticPage title="Contact" path="/contact/">
      <p>
        We read every message. For questions, corrections, review requests or partnerships, email{' '}
        <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
        {CONTACT_FORM_ENABLED ? ' or use the form below.' : '.'}
      </p>

      {CONTACT_FORM_ENABLED && (
        // Plain HTML form handled by Netlify Forms — no JavaScript, no backend.
        // Netlify detects it at deploy time (see also public/__forms.html).
        <form
          name="contact"
          method="POST"
          action="/contact/thanks/"
          data-netlify="true"
          netlify-honeypot="company"
          className="not-prose card mt-6 space-y-4 p-6"
        >
          <input type="hidden" name="form-name" value="contact" />
          <p hidden>
            <label>
              Don’t fill this out: <input name="company" tabIndex={-1} autoComplete="off" />
            </label>
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="label">
                Name
              </label>
              <input id="name" name="name" required autoComplete="name" className="input" />
            </div>
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input id="email" name="email" type="email" required autoComplete="email" className="input" />
            </div>
          </div>
          <div>
            <label htmlFor="subject" className="label">
              Subject
            </label>
            <select id="subject" name="subject" className="input" defaultValue="Question">
              <option>Question</option>
              <option>Correction</option>
              <option>Review request</option>
              <option>Partnership</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="message" className="label">
              Message
            </label>
            <textarea id="message" name="message" rows={6} required className="input" />
          </div>
          <button type="submit" className="btn-primary">
            Send message
          </button>
        </form>
      )}

      <p className="mt-6">
        Brands: sending us a product does not guarantee coverage or a positive review, and we don’t accept payment for
        verdicts.
      </p>
    </StaticPage>
  );
}
