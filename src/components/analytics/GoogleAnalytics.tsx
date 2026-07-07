"use client";

import { GoogleAnalytics as NextGoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import { useConsent } from "./useConsent";

// Loads Google Analytics 4 via @next/third-parties only after the visitor has
// accepted analytics cookies. Returns null (so no gtag script or cookie
// exists) until then, which is what keeps the implementation GDPR/ePrivacy
// compliant under Dutch law.
export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  const consent = useConsent();

  if (consent !== "accepted") {
    return null;
  }

  return (
    <>
      {/* Must render before NextGoogleAnalytics: gtag applies 'set' values
          only to commands pushed after it, so this has to enter the dataLayer
          ahead of the config command. */}
      <Script id="ga-privacy" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('set', {
  allow_google_signals: false,
  allow_ad_personalization_signals: false
});`}
      </Script>
      <NextGoogleAnalytics gaId={measurementId} />
    </>
  );
}
