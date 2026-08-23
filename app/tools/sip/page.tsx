import type { Metadata } from "next";
import { buildMetadata, pageSeo } from "../../config/seo";
import SipClient from "./SipClient";

export const metadata: Metadata = buildMetadata("sip");

export default function Page() {
  const jsonLd = pageSeo["sip"].jsonLd;
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <SipClient />
    </>
  );
}
