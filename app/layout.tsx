import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteConfig } from "./config/site";
import { seoDefaults, pageSeo } from "./config/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.domain),
  title: {
    default:  seoDefaults.defaultTitle,
    template: seoDefaults.titleTemplate,
  },
  description: seoDefaults.description,
  keywords:    seoDefaults.keywords,
  authors:     [{ name: siteConfig.name }],
  robots:      { index: true, follow: true },
  openGraph: {
    type:        "website",
    locale:      seoDefaults.locale,
    siteName:    seoDefaults.siteName,
    title:       seoDefaults.defaultTitle,
    description: seoDefaults.description,
    images: [{
      url:    pageSeo.home.ogImage,
      width:  1200,
      height: 630,
      alt:    siteConfig.name,
    }],
  },
  twitter: {
    card:        seoDefaults.twitter.card,
    site:        seoDefaults.twitter.site,
    creator:     seoDefaults.twitter.handle,
    title:       seoDefaults.defaultTitle,
    description: seoDefaults.description,
    images:      [pageSeo.home.ogImage],
  },
};

export const viewport: Viewport = {
  themeColor: siteConfig.seo.themeColor,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Organisation JSON-LD — present on every page via the root layout
  const orgLd = {
    "@context": "https://schema.org",
    "@type":    "Organization",
    name:       siteConfig.name,
    url:        siteConfig.domain,
    logo:       `${siteConfig.domain}/logo.png`,
    sameAs: [
      siteConfig.youtube.url,
      siteConfig.facebook.url,
      siteConfig.instagram.url,
    ],
    contactPoint: {
      "@type":       "ContactPoint",
      email:         siteConfig.contact.email,
      contactType:   "customer support",
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
