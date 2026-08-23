import type { Metadata } from "next";
import { buildMetadata, pageSeo } from "../../config/seo";
import EmiClient from "./EmiClient";

export const metadata: Metadata = buildMetadata("emi");

export default function Page() {
  const jsonLd = pageSeo["emi"].jsonLd;
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <EmiClient />
    </>
  );
}
