import type { Metadata } from "next";
import { buildMetadata, pageSeo } from "../../config/seo";
import SolarSystemScaledClient from "./SolarSystemScaledClient";

export const metadata: Metadata = buildMetadata("solar-system-scaled");

export default function Page() {
  const jsonLd = pageSeo["solar-system-scaled"].jsonLd;
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <SolarSystemScaledClient />
    </>
  );
}
