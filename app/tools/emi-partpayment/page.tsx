import type { Metadata } from "next";
import { buildMetadata, pageSeo } from "../../config/seo";
import PartPaymentClient from "./PartPaymentClient";

export const metadata: Metadata = buildMetadata("emi-partpayment");

export default function Page() {
  const jsonLd = pageSeo["emi-partpayment"].jsonLd;
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <PartPaymentClient />
    </>
  );
}
