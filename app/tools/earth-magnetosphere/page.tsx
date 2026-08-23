import type { Metadata } from "next";
import { buildMetadata, pageSeo } from "../../config/seo";
import EarthMagnetosphereClient from "./EarthMagnetosphereClient";

export const metadata: Metadata = buildMetadata("earth-magnetosphere");

export default function Page() {
  const jsonLd = pageSeo["earth-magnetosphere"].jsonLd;
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <EarthMagnetosphereClient />
    </>
  );
}
