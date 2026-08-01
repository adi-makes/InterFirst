import "./globals.css";
import "./careers-scroll.css";

const siteName = "InterFirst";
const siteTitle = "InterFirst — We build internet-first companies";
const siteDescription =
  "InterFirst builds internet-first companies by designing the product, systems, and company as one connected whole.";

function resolveMetadataBase() {
  const configuredOrigin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;

  if (!configuredOrigin) return new URL("http://localhost:3000");

  const absoluteOrigin = configuredOrigin.startsWith("http")
    ? configuredOrigin
    : `https://${configuredOrigin}`;

  return new URL(absoluteOrigin);
}

export const viewport = {
  colorScheme: "light",
  themeColor: "#ffffff",
  viewportFit: "cover",
};

export const metadata = {
  metadataBase: resolveMetadataBase(),
  title: {
    default: siteTitle,
    template: `%s — ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  authors: [{ name: siteName }],
  creator: siteName,
  referrer: "strict-origin-when-cross-origin",
  formatDetection: { telephone: false },
  alternates: { canonical: "/" },
  icons: {
    icon: [{ url: "/brand/interfirst-mark.png", type: "image/png" }],
    apple: [{ url: "/brand/interfirst-mark.png" }],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName,
    title: siteTitle,
    description: siteDescription,
    url: "/",
    images: [
      {
        url: "/og.png",
        width: 1731,
        height: 909,
        alt: "InterFirst — We build internet-first companies.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [{ url: "/og.png", alt: "InterFirst — We build internet-first companies." }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html data-scroll-behavior="smooth" lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
