// ─── SEO & Social Config ─────────────────────────────────────────────────────
// Every piece of SEO-relevant content lives here.
// Pages import what they need — nothing is hardcoded in components.
//
// OG images:
//   Homepage  → upload /public/og/home.png  (1200×630 px)
//   Tools     → upload /public/og/tools/<slug>.png  (1200×630 px)
//   Fallback  → /public/og/default.png  (used if a per-page image is missing)
//
// Checklist before going live:
//   [ ] Upload /public/og/home.png
//   [ ] Upload /public/og/default.png
//   [ ] Upload /public/og/tools/<slug>.png for each tool (optional but recommended)
//   [ ] Update twitter.handle once you have a Twitter/X account
//   [ ] Update facebook.appId if you run Facebook Pixel / Insights

import { siteConfig } from "./site";

const BASE = siteConfig.domain;

// ── Helpers ───────────────────────────────────────────────────────────────────

function ogImage(path: string): string {
  return `${BASE}${path}`;
}

// ── Site-level defaults ───────────────────────────────────────────────────────

export const seoDefaults = {
  titleTemplate: `%s | ${siteConfig.name}`,
  defaultTitle:  `${siteConfig.name} — Science, Finance & Curiosity`,

  description:
    "Another Angle is a YouTube channel and website exploring science, finance, and technology through simple words, fresh perspectives, and interactive tools.",

  keywords: [
    "Another Angle",
    "science explained simply",
    "interactive finance tools",
    "EMI calculator India",
    "SIP calculator",
    "astrophysics visualisation",
    "STEM education",
    "YouTube science channel",
  ],

  // Upload this file to /public/og/home.png  (1200×630 px, dark background)
  ogImage: ogImage("/og/home.png"),

  // Fallback for any page that doesn't have a dedicated image
  ogImageFallback: ogImage("/og/default.png"),

  locale:   "en_IN",
  siteName: siteConfig.name,

  twitter: {
    // Replace with your real Twitter/X handle once you have one, e.g. "@AnAnotherAngle"
    handle: "@AnAnotherAngle",
    site:   "@AnAnotherAngle",
    card:   "summary_large_image" as const,
  },

  // Only needed if you use Facebook Pixel / Insights
  facebook: {
    appId: "",   // e.g. "1234567890"
  },
};

// ── Per-page metadata ─────────────────────────────────────────────────────────
// Each entry maps to a route.
// title       → <title> and og:title
// description → <meta name="description"> and og:description
// keywords    → <meta name="keywords">
// ogImage     → og:image and twitter:image  (upload to /public/og/...)
// jsonLd      → structured data injected as <script type="application/ld+json">

export type PageSeoKey =
  | "home"
  | "tools"
  | "emi"
  | "emi-partpayment"
  | "sip"
  | "debt-vs-save"
  | "earth-magnetosphere"
  | "earth-satellite"
  | "earth-sun-scaled"
  | "solar-system-scaled"
  | "latitude-longitude";

export interface PageSeo {
  title:       string;
  description: string;
  keywords:    string[];
  ogImage:     string;    // absolute URL
  canonical:   string;    // site-relative, e.g. "/tools/emi/"
  jsonLd?:     object;
}

export const pageSeo: Record<PageSeoKey, PageSeo> = {

  // ── Homepage ──────────────────────────────────────────────────────────────
  home: {
    title:       `${siteConfig.name} — Science, Finance & Curiosity`,
    description: "Explore science, finance and technology through fresh perspectives, simple explanations and free interactive tools. Subscribe to the Another Angle YouTube channel.",
    keywords:    ["Another Angle", "science YouTube channel", "finance tools India", "interactive learning", "STEM"],
    ogImage:     ogImage("/og/home.png"),
    canonical:   "/",
    jsonLd: {
      "@context":   "https://schema.org",
      "@type":      "WebSite",
      name:         siteConfig.name,
      url:          BASE + "/",
      description:  "YouTube channel and website for science, finance and technology explained simply.",
      potentialAction: {
        "@type":       "SearchAction",
        target:        `${BASE}/tools/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  },

  // ── Tools index ───────────────────────────────────────────────────────────
  tools: {
    title:       "Free Interactive Tools",
    description: "Free finance calculators and science simulations by Another Angle. EMI, SIP, part payment, debt vs save, solar system scale models, 3D globe and more.",
    keywords:    ["free finance tools", "EMI calculator", "SIP calculator", "science simulation", "Another Angle tools"],
    ogImage:     ogImage("/og/default.png"),
    canonical:   "/tools/",
    jsonLd: {
      "@context": "https://schema.org",
      "@type":    "CollectionPage",
      name:       "Free Interactive Tools — Another Angle",
      url:        BASE + "/tools/",
      description: "Free finance calculators and science simulations.",
    },
  },

  // ── Finance tools ─────────────────────────────────────────────────────────
  "emi": {
    title:       "EMI Calculator",
    description: "Calculate your monthly loan EMI, total interest paid and view the full repayment schedule. Free, accurate and instant. No sign-up required.",
    keywords:    ["EMI calculator", "loan EMI calculator India", "home loan EMI", "car loan EMI", "monthly instalment calculator"],
    ogImage:     ogImage("/og/tools/emi.png"),
    canonical:   "/tools/emi/",
    jsonLd: {
      "@context":           "https://schema.org",
      "@type":              "SoftwareApplication",
      name:                 "EMI Calculator",
      applicationCategory:  "FinanceApplication",
      operatingSystem:      "Web",
      offers:               { "@type": "Offer", price: "0", priceCurrency: "INR" },
      url:                  BASE + "/tools/emi/",
      description:          "Calculate loan EMI, total interest and full repayment schedule.",
      publisher:            { "@type": "Organization", name: siteConfig.name, url: BASE },
    },
  },

  "emi-partpayment": {
    title:       "Part Payment EMI Calculator",
    description: "See exactly how a lump-sum part payment on your loan reduces total interest and shortens your tenure. Compare before and after schedules side by side.",
    keywords:    ["part payment EMI calculator", "loan prepayment calculator", "reduce EMI tenure", "prepayment benefit India"],
    ogImage:     ogImage("/og/tools/emi-partpayment.png"),
    canonical:   "/tools/emi-partpayment/",
    jsonLd: {
      "@context":           "https://schema.org",
      "@type":              "SoftwareApplication",
      name:                 "Part Payment EMI Calculator",
      applicationCategory:  "FinanceApplication",
      operatingSystem:      "Web",
      offers:               { "@type": "Offer", price: "0", priceCurrency: "INR" },
      url:                  BASE + "/tools/emi-partpayment/",
      description:          "Calculate how part payments reduce your loan interest and tenure.",
      publisher:            { "@type": "Organization", name: siteConfig.name, url: BASE },
    },
  },

  "sip": {
    title:       "SIP Calculator",
    description: "Project the future value of your SIP (Systematic Investment Plan) with monthly contributions and expected annual returns. Full month-by-month schedule included.",
    keywords:    ["SIP calculator", "SIP return calculator India", "mutual fund SIP", "monthly investment calculator", "compound interest calculator"],
    ogImage:     ogImage("/og/tools/sip.png"),
    canonical:   "/tools/sip/",
    jsonLd: {
      "@context":           "https://schema.org",
      "@type":              "SoftwareApplication",
      name:                 "SIP Calculator",
      applicationCategory:  "FinanceApplication",
      operatingSystem:      "Web",
      offers:               { "@type": "Offer", price: "0", priceCurrency: "INR" },
      url:                  BASE + "/tools/sip/",
      description:          "Calculate SIP future value with compounding, full monthly schedule.",
      publisher:            { "@type": "Organization", name: siteConfig.name, url: BASE },
    },
  },

  "debt-vs-save": {
    title:       "Buy Now vs Save First Calculator",
    description: "Should you take a loan now or save up first? Compare loan interest against savings return and inflation to find the smarter financial path.",
    keywords:    ["buy now or save", "loan vs saving calculator", "debt vs saver", "inflation calculator India", "financial decision tool"],
    ogImage:     ogImage("/og/tools/debt-vs-save.png"),
    canonical:   "/tools/debt-vs-save/",
    jsonLd: {
      "@context":           "https://schema.org",
      "@type":              "SoftwareApplication",
      name:                 "Buy Now vs Save First Calculator",
      applicationCategory:  "FinanceApplication",
      operatingSystem:      "Web",
      offers:               { "@type": "Offer", price: "0", priceCurrency: "INR" },
      url:                  BASE + "/tools/debt-vs-save/",
      description:          "Compare loan vs saving strategies factoring in inflation.",
      publisher:            { "@type": "Organization", name: siteConfig.name, url: BASE },
    },
  },

  // ── Science tools ─────────────────────────────────────────────────────────
  "earth-magnetosphere": {
    title:       "Earth Magnetosphere Simulation",
    description: "Real-time canvas simulation of the solar wind deflecting off Earth's magnetic field. Trigger solar flares, control speed and particle density. Built for science learners.",
    keywords:    ["earth magnetosphere", "solar wind simulation", "magnetic field visualisation", "aurora borealis science", "space physics"],
    ogImage:     ogImage("/og/tools/earth-magnetosphere.png"),
    canonical:   "/tools/earth-magnetosphere/",
    jsonLd: {
      "@context":          "https://schema.org",
      "@type":             "LearningResource",
      name:                "Earth Magnetosphere Simulation",
      learningResourceType: "Simulation",
      educationalLevel:    "General",
      url:                 BASE + "/tools/earth-magnetosphere/",
      description:         "Interactive simulation of the solar wind and Earth's magnetic shield.",
      publisher:           { "@type": "Organization", name: siteConfig.name, url: BASE },
    },
  },

  "earth-satellite": {
    title:       "Earth Satellite Orbit Simulation",
    description: "Top-down orbital simulation of Earth and satellites with real physics. Add your own satellites, compare ISS to geostationary orbits, control simulation speed.",
    keywords:    ["satellite orbit simulation", "ISS orbit", "geostationary satellite", "orbital mechanics", "space education tool"],
    ogImage:     ogImage("/og/tools/earth-satellite.png"),
    canonical:   "/tools/earth-satellite/",
    jsonLd: {
      "@context":          "https://schema.org",
      "@type":             "LearningResource",
      name:                "Earth Satellite Orbit Simulation",
      learningResourceType: "Simulation",
      educationalLevel:    "General",
      url:                 BASE + "/tools/earth-satellite/",
      description:         "Top-down orbital simulation with real orbital mechanics.",
      publisher:           { "@type": "Organization", name: siteConfig.name, url: BASE },
    },
  },

  "earth-sun-scaled": {
    title:       "Earth vs Sun — Interactive Scale Model",
    description: "See how tiny Earth really is compared to the Sun. Set Earth's diameter in millimetres, centimetres, metres, inches or feet and the Sun scales proportionally.",
    keywords:    ["earth vs sun size", "solar scale model", "how big is the sun", "planet size comparison", "astrophysics for kids"],
    ogImage:     ogImage("/og/tools/earth-sun-scaled.png"),
    canonical:   "/tools/earth-sun-scaled/",
    jsonLd: {
      "@context":          "https://schema.org",
      "@type":             "LearningResource",
      name:                "Earth vs Sun Interactive Scale Model",
      learningResourceType: "InteractiveActivity",
      educationalLevel:    "General",
      url:                 BASE + "/tools/earth-sun-scaled/",
      description:         "Scale model comparing Earth and the Sun using real-world units.",
      publisher:           { "@type": "Organization", name: siteConfig.name, url: BASE },
    },
  },

  "solar-system-scaled": {
    title:       "Solar System — Interactive Scale Model",
    description: "All eight planets and the Sun drawn to scale. Set Earth's size in real units and every body scales proportionally. Orbit rings included for spatial reference.",
    keywords:    ["solar system scale model", "planet size comparison", "how big are the planets", "solar system to scale", "interactive astrophysics"],
    ogImage:     ogImage("/og/tools/solar-system-scaled.png"),
    canonical:   "/tools/solar-system-scaled/",
    jsonLd: {
      "@context":          "https://schema.org",
      "@type":             "LearningResource",
      name:                "Solar System Interactive Scale Model",
      learningResourceType: "InteractiveActivity",
      educationalLevel:    "General",
      url:                 BASE + "/tools/solar-system-scaled/",
      description:         "All planets and the Sun drawn to the same scale.",
      publisher:           { "@type": "Organization", name: siteConfig.name, url: BASE },
    },
  },

  "latitude-longitude": {
    title:       "Latitude & Longitude — Interactive 3D Globe",
    description: "Spin a 3D globe with a full lat/lon grid. Equator, tropics and prime meridian highlighted. Drag to rotate, scroll to zoom. Great for geography learners.",
    keywords:    ["latitude longitude globe", "interactive geography", "coordinate system earth", "3D globe tool", "equator prime meridian"],
    ogImage:     ogImage("/og/tools/latitude-longitude.png"),
    canonical:   "/tools/latitude-longitude/",
    jsonLd: {
      "@context":          "https://schema.org",
      "@type":             "LearningResource",
      name:                "Latitude & Longitude Interactive Globe",
      learningResourceType: "InteractiveActivity",
      educationalLevel:    "General",
      url:                 BASE + "/tools/latitude-longitude/",
      description:         "Interactive 3D globe with full latitude and longitude grid.",
      publisher:           { "@type": "Organization", name: siteConfig.name, url: BASE },
    },
  },

};

// ── Helper used by page.tsx files ─────────────────────────────────────────────
// Builds a complete Next.js Metadata object from a pageSeo entry.
// Import this in every page.tsx instead of hardcoding metadata there.

import type { Metadata } from "next";

export function buildMetadata(key: PageSeoKey): Metadata {
  const p = pageSeo[key];
  const d = seoDefaults;
  return {
    title:       p.title,
    description: p.description,
    keywords:    p.keywords,
    authors:     [{ name: siteConfig.name }],
    robots:      { index: true, follow: true },
    alternates:  { canonical: p.canonical },
    openGraph: {
      type:        "website",
      locale:      d.locale,
      siteName:    d.siteName,
      title:       p.title,
      description: p.description,
      url:         BASE + p.canonical,
      images: [{
        url:    p.ogImage,
        width:  1200,
        height: 630,
        alt:    p.title,
      }],
    },
    twitter: {
      card:        d.twitter.card,
      site:        d.twitter.site,
      creator:     d.twitter.handle,
      title:       p.title,
      description: p.description,
      images:      [p.ogImage],
    },
    ...(d.facebook.appId ? { other: { "fb:app_id": d.facebook.appId } } : {}),
  };
}
