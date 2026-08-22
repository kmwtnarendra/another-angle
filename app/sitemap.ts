import type { MetadataRoute } from "next";
import { siteConfig, builtTools } from "./config/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const toolRoutes = builtTools.map((t) => ({
    url: `${siteConfig.domain}/tools/${t.slug}/`,
    priority: 0.8,
  }));

  return [
    { url: `${siteConfig.domain}/`, priority: 1.0 },
    ...toolRoutes,
  ];
}
