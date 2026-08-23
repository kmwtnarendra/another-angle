import type { Metadata } from "next";
import { buildMetadata, pageSeo } from "../../config/seo";
import DebtVsSaveClient from "./DebtVsSaveClient";

export const metadata: Metadata = buildMetadata("debt-vs-save");

export default function Page() {
  const jsonLd = pageSeo["debt-vs-save"].jsonLd;
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <DebtVsSaveClient />
    </>
  );
}
