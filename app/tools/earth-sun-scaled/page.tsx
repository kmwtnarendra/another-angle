import type { Metadata } from "next";
import { buildMetadata, pageSeo } from "../../config/seo";
import EarthSunScaledClient from "./EarthSunScaledClient";

export const metadata: Metadata = buildMetadata("earth-sun-scaled");

export default function Page() {
  const jsonLd = pageSeo["earth-sun-scaled"].jsonLd;
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <EarthSunScaledClient />
    </>
  );
}
