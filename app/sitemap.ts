import type { MetadataRoute } from "next";
import { siteConfig, builtTools } from "./config/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  return [
    {
      url:             `${siteConfig.domain}/`,
      lastModified:    now,
      changeFrequency: "weekly",
      priority:        1.0,
    },
    {
      url:             `${siteConfig.domain}/tools/`,
      lastModified:    now,
      changeFrequency: "weekly",
      priority:        0.9,
    },
    ...builtTools.map(t => ({
      url:             `${siteConfig.domain}/tools/${t.slug}/`,
      lastModified:    now,
      changeFrequency: "monthly" as const,
      priority:        0.8,
    })),
  ];
}
