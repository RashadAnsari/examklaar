import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { ConsentBanner } from "@/components/ui/ConsentBanner";
import { site } from "@/config/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name}: ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description:
    "Prepare for your Dutch inburgering exam (A2/B1) with realistic practice tests for KNM, Reading, Listening, Writing, and Speaking. AI-powered feedback included. Free to start.",
  keywords: [
    "oefenexamen inburgering",
    "inburgering oefenen",
    "inburgeringsexamen voorbereiding",
    "KNM oefenen",
    "KNM oefenexamen",
    "inburgering gratis",
    "inburgering exam practice",
    "Dutch civic integration exam",
    "Nederlands A2 oefenen",
    "inburgering A2",
    "oefenen Nederlands online",
    "DUO inburgering",
  ],
  openGraph: {
    siteName: site.name,
    type: "website",
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: site.name }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaMeasurementId = process.env.ANALYTICS_GA_MEASUREMENT_ID;

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content={site.name} />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="min-h-screen" suppressHydrationWarning>
        {children}
        {gaMeasurementId && (
          <>
            <GoogleAnalytics measurementId={gaMeasurementId} />
            <ConsentBanner measurementId={gaMeasurementId} />
          </>
        )}
      </body>
    </html>
  );
}
