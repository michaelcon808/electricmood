import Script from 'next/script';
import { gaMeasurementId } from '@/lib/site';

// Countries where analytics cookies must not be set without the visitor's consent (EEA, UK, Switzerland).
const CONSENT_REGIONS = [
  'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE',
  'IS','LI','NO','GB','CH',
];

/**
 * Google Analytics 4. Loads only in a production build AND when NEXT_PUBLIC_GA_MEASUREMENT_ID is set,
 * so local dev, previews and the Studio never send data.
 *
 * Consent Mode: in the regions above, analytics storage defaults to "denied" (Google then sends cookieless pings
 * only and sets no analytics cookies). There is no consent banner yet, so those visitors stay un-tracked by cookie.
 * Everywhere else analytics is on; advertising storage is denied for everyone (the site runs no ads).
 */
export function Analytics() {
  if (!gaMeasurementId || process.env.NODE_ENV !== 'production') return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied', region: ${JSON.stringify(CONSENT_REGIONS)} });
gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' });
gtag('js', new Date());
gtag('config', '${gaMeasurementId}');`}
      </Script>
    </>
  );
}
