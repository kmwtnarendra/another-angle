import type { MetadataRoute } from "next";
import { siteConfig } from "./config/site";
import { seoDefaults } from "./config/seo";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             `${siteConfig.name} — Science, Finance & Curiosity`,
    short_name:       siteConfig.name,
    description:      seoDefaults.description,
    start_url:        "/",
    scope:            "/",
    display:          "standalone",
    background_color: "#0b0c0e",
    theme_color:      siteConfig.seo.themeColor,
    lang:             "en",
    dir:              "ltr",
    categories:       ["education", "finance", "science"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" as const },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" as const },
    ],
  };
}
