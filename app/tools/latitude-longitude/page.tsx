import type { Metadata } from "next";
import { buildMetadata, pageSeo } from "../../config/seo";
import LatitudeLongitudeClient from "./LatitudeLongitudeClient";

export const metadata: Metadata = buildMetadata("latitude-longitude");

export default function Page() {
  const jsonLd = pageSeo["latitude-longitude"].jsonLd;
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <LatitudeLongitudeClient />
    </>
  );
}
