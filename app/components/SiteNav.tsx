import Link from "next/link";
import { siteConfig } from "../config/site";

export default function SiteNav() {
  return (
    <nav
      style={{
        borderBottom: "1px solid var(--border)",
        padding: "0.9rem 1.5rem",
        display: "flex",
        alignItems: "center",
        gap: "1.5rem",
        fontSize: "0.875rem",
      }}
    >
      <Link
        href="/"
        style={{ fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text)" }}
      >
        {siteConfig.name}
      </Link>
      <Link href="/#tools" style={{ color: "var(--text-muted)" }}>
        Tools
      </Link>
      <a
        href={siteConfig.youtube.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "var(--text-muted)", marginLeft: "auto" }}
      >
        YouTube ↗
      </a>
    </nav>
  );
}
