"use client";

import Script from "next/script";
import { useConsent } from "./useConsent";

// Loads Google Analytics 4 only after the visitor has accepted analytics
// cookies. Returns null (so no gtag script or cookie exists) until then, which
// is what keeps the implementation GDPR/ePrivacy compliant under Dutch law.
export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  const consent = useConsent();

  if (consent !== "accepted") {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${measurementId}');`}
      </Script>
    </>
  );
}
