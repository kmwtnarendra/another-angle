import Link from "next/link";
import type { Metadata } from "next";
import SiteNav from "../components/SiteNav";
import { groupedTools } from "../config/site";
import { buildMetadata, pageSeo } from "../config/seo";
import ToolRow from "./ToolRow";

export const metadata: Metadata = buildMetadata("tools");

export default function ToolsPage() {
  const groups = groupedTools();
  const jsonLd = pageSeo.tools.jsonLd!;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteNav />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "1.5rem 1.5rem 2rem", width: "100%" }}>
        <div style={{ marginBottom: "1.25rem" }}>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.2rem" }}>
            Interactive Tools
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
            Free calculators and simulations — no sign-up, no ads.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1rem", alignItems: "start" }}>
          {groups.map(({ category, label, items }) => (
            <section key={category} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "0.65rem 1rem", borderBottom: "1px solid var(--border)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)" }}>
                {label}
              </div>
              {items.map((tool, i) => (
                <ToolRow key={tool.slug} tool={tool} hasBorderTop={i > 0} />
              ))}
            </section>
          ))}
        </div>
      </main>
    </>
  );
}