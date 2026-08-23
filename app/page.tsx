import type { Metadata } from "next";
import SiteNav from "./components/SiteNav";
import { siteConfig } from "./config/site";
import { buildMetadata, pageSeo } from "./config/seo";

export const metadata: Metadata = buildMetadata("home");

export default function HomePage() {
  const p = pageSeo.home;
  const jsonLd = p.jsonLd!;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteNav />

      {/* ── Hero ── */}
      <section
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "5rem 1.5rem 4.5rem",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.25rem",
        }}
      >
        <div style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)" }}>
          YouTube Channel &amp; Free Tools
        </div>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, maxWidth: "680px" }}>
          {siteConfig.name}
        </h1>
        <p style={{ color: "var(--text-muted)", maxWidth: "520px", lineHeight: 1.65, fontSize: "1.05rem" }}>
          {siteConfig.tagline}{" "}
          We make complex topics in science and finance genuinely easy to understand —
          through videos and interactive tools you can use right now.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center", marginTop: "0.5rem" }}>
          <a href={siteConfig.youtube.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            ▶ Subscribe on YouTube
          </a>
          <a href="/tools/" className="btn btn-ghost">Explore Tools →</a>
        </div>
      </section>

      {/* ── YouTube callout strip ── */}
      <section style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)", padding: "2rem 1.5rem" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ fontSize: "2.5rem" }}>📺</div>
          <div style={{ flex: 1, minWidth: "220px" }}>
            <div style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.25rem" }}>
              {siteConfig.youtube.handle} on YouTube
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.55 }}>
              New videos on science, finance and technology — explained simply, without jargon.
              Subscribe so you never miss one.
            </div>
          </div>
          <a href={siteConfig.youtube.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ flexShrink: 0 }}>
            Subscribe
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "1.5rem", textAlign: "center", fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap" }}>
        <span>© {new Date().getFullYear()} {siteConfig.name}</span>
        <a href="/tools/" style={{ color: "var(--text-muted)" }}>Tools</a>
        <a href={siteConfig.youtube.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-muted)" }}>YouTube</a>
        <a href={siteConfig.facebook.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-muted)" }}>Facebook</a>
        <a href={siteConfig.instagram.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-muted)" }}>Instagram</a>
        <a href={`mailto:${siteConfig.contact.email}`} style={{ color: "var(--text-muted)" }}>Contact</a>
        <a href={siteConfig.supportUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-muted)" }}>☕ Support</a>
      </footer>
    </>
  );
}
