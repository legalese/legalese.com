import Footer from "@/app/_components/footer";
import { CMS_NAME, SITE_DESCRIPTION, SITE_URL, SERVICE_DOMAIN } from "@/lib/constants";

const HOME_OG_IMAGE_URL = '/opengraph/ai-is-eating-law-v2.jpg';
import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const merriweather = Merriweather({ 
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-merriweather"
});

export const metadata: Metadata = {
  title: {
    default: `${CMS_NAME} - Rules Automation`,
    template: `%s | ${CMS_NAME}`
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: `${CMS_NAME} - Rules Automation`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: CMS_NAME,
    images: [HOME_OG_IMAGE_URL],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${CMS_NAME} - Rules Automation`,
    description: SITE_DESCRIPTION,
    images: [HOME_OG_IMAGE_URL],
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
  return (
    <html lang="en">
      <head>
        <meta
          httpEquiv="Content-Security-Policy"
          content={[
            "default-src 'self' https://legalese.com",
            `script-src 'self' https://legalese.com 'unsafe-inline' https://cdnjs.cloudflare.com`,
            "style-src 'self' https://legalese.com 'unsafe-inline'",
            "font-src 'self' https://legalese.com",
            "img-src 'self' https://legalese.com https://workoscdn.com https://*.googleusercontent.com",
            `connect-src 'self' https://legalese.com https://${SERVICE_DOMAIN} https://ai.${SERVICE_DOMAIN} https://*.workos.com`,
            "frame-src 'self' https://legalese.com https://play.legalese.com https://*.workos.com",
            "object-src 'none'",
            "base-uri 'self' https://legalese.com",
          ].join("; ")}
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta
          name="msapplication-config"
          content="/favicon/browserconfig.xml"
        />
        <meta name="theme-color" content="#000" />
        <link rel="alternate" type="application/rss+xml" href="/feed.xml" />
      </head>
      <body className={`${inter.variable} ${merriweather.variable}`}>
        <div className="min-h-screen">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
