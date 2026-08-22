import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "../components/SiteNav";
import ToolsGrid from "../components/ToolsGrid";
import { siteConfig, groupedTools } from "../config/site";

export const metadata: Metadata = {
  title: "Tools",
  description:
    "Free interactive finance and science tools by Another Angle. EMI calculator, SIP calculator, part payment calculator, buy vs save comparison and more.",
  alternates: { canonical: "/tools/" },
};

export default function ToolsPage() {
  const groups = groupedTools();

  return (
    <>
      <SiteNav />

      <main
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          padding: "2.5rem 1.5rem",
          width: "100%",
        }}
      >
        <div style={{ marginBottom: "2.5rem" }}>
          <h1
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: "0.5rem",
            }}
          >
            Interactive Tools
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.6 }}>
            Free calculators and simulators to help you understand finance and science
            — no sign-up, no ads, works in your browser.
          </p>
        </div>

        <ToolsGrid groups={groups} />
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "1.5rem",
          textAlign: "center",
          fontSize: "0.8rem",
          color: "var(--text-muted)",
          display: "flex",
          gap: "1.5rem",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <span>© {new Date().getFullYear()} {siteConfig.name}</span>
        <a
          href={siteConfig.youtube.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--text-muted)" }}
        >
          YouTube
        </a>
        <a
          href={`mailto:${siteConfig.contact.email}`}
          style={{ color: "var(--text-muted)" }}
        >
          Contact
        </a>
      </footer>
    </>
  );
}
