import type { Metadata } from "next";
import { buildMetadata, pageSeo } from "../../config/seo";
import ResistorClient from "./ResistorClient";

export const metadata: Metadata = buildMetadata("resistor-calculator");

export default function Page() {
  const jsonLd = pageSeo["resistor-calculator"].jsonLd;
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ResistorClient />
    </>
  );
}
