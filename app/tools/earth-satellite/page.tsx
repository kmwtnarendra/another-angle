import type { Metadata } from "next";
import { buildMetadata, pageSeo } from "../../config/seo";
import EarthSatelliteClient from "./EarthSatelliteClient";

export const metadata: Metadata = buildMetadata("earth-satellite");

export default function Page() {
  const jsonLd = pageSeo["earth-satellite"].jsonLd;
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <EarthSatelliteClient />
    </>
  );
}
